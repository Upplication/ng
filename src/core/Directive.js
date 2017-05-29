import { kebabToCamel } from '../utils/convert-case'

const $DIRECTIVE = Symbol('@Directive({ ... }')

function isCssClassSelector(s) {
    return s.test(/^\.[a-z0-9]+$/)
}

function isCssAttributeSelector(s) {
    return s.test(/^\[[a-z0-9]+\]$/)
}

function markAsDirective(controller, declaration) {
    Object.defineProperty(controller, $DIRECTIVE, {
        value: declaration
    })
}

export function isDirective(controller) {
    return Object.prototype.hasOwnProperty
        .call(controller, $DIRECTIVE)
}

function getDirectiveDefinition(clazz) {
    if (!isDirective(clazz))
        throw new TypeError('Provided argument has not been decorated with @Directive')
    return clazz[$DIRECTIVE]
}

export function registerDirective(module, directive) {
    let def = getDirectiveDefinition(directive)
    let { selector } = def
    let name = kebabToCamel(selector.replace(/[^a-z0-9]/g, ''))
    let restrict = null
    if (isCssClassSelector(selector))
        restrict = 'C'
    else if (isCssAttributeSelector(selector))
        restrict = 'A'
    else
        throw new Error(`@Directive unkown css selector ${selector}`)

    let adaptedDefinition = Object.assign({}, def, {
        // Directives should not have isolated scopes. Period.
        scope: false,
        // Add the class itself as the controller property
        controller: directive,
        // Add the restrcit based on the identified selector
        restrict,
        // Link the $destroy element event to the $onDestroy event of the
        // directive controller.
        link: (...linkArgs) => {
            if (typeof ctrl.$onDestroy === 'function') {
                let [ scope, elem, attrs, ctrl ] = linkArgs
                elem.on('$destroy', (...args) => ctrl.$onDestroy(...args))
            }
            if (typeof def.link === 'function')
                def.link(...linkArgs)
        },
    })
    module.directive(name, () => adaptedDefinition)
    return module
}

export function Directive(def) {
    if (typeof def.selector !== 'string' // Selector is not a string
        || def.selector.length === 0 // Or it's empty
        || !(isCssAttributeSelector(def.selector) || isCssClassSelector(def.selector))) // Or is not a valid directive selctor
        throw new TypeError('Directive selector must be a valid string representing an css selector for class or attribute')

    return (clazz) => {
        if (typeof clazz !== 'function')
            throw new TypeError(`@Directive must be applied over a class`)
        markAsDirective(clazz, def)
    }
}