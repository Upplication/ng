const $DIRECTIVE = Symbol('Objec passed to @Directive({ ... }')
const $DIRECTIVE_NAME = Symbol('Camelized selector passed to @Directive({ })')

function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (s) => s[1].toUpperCase())
}

export function markAsDirective(controller, declaration) {
    Object.defineProperty(controller, $DIRECTIVE, {
        value: declaration
    })
    Object.defineProperty(controller, $DIRECTIVE_NAME, {
        value: kebabToCamel(declaration.selector)
    })
}

export function isDirective(controller) {
    return Object.prototype.hasOwnProperty
        .call(controller, $DIRECTIVE)
}

export function getDirectiveDefinition(directive) {
    return directive[$DIRECTIVE] || null
}

export function getDirectiveName(directive) {
    return directive[$DIRECTIVE_NAME] || null
}

export function Directive(directiveDescriptor) {

    if (typeof directiveDescriptor.selector !== 'string' // Selector is not a string
        || directiveDescriptor.selector.length === 0 // Or it's empty
        || /^[^a-z0-9][a-z0-9]*$/.test(directiveDescriptor.selector)) // Or is not a valid tag name
        throw new TypeError('Component selector must be a valid string representing an html tag')

    return function(controller) {

        const opts = Object.assign({}, {
            restrict: 'A',
            scope: false,
            link: (scope, elem, attrs, ctrl) => {
                if (typeof ctrl.$onDestroy === 'function')
                    elem.on('$destroy', (...args) => ctrl.$onDestroy(...args))
            },
        }, directiveDescriptor, { controller })

        if (typeof controller !== 'function')
            throw new TypeError(`Controller for ${ opts.selector } must be a valid constructor`)

        markAsDirective(controller, opts)
    }
}