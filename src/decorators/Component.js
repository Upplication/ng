import { markAsDirective } from './Directive'

const $COMPONENT = Symbol('@Component({ ... }')

function markAsComponent(controller, declaration) {
    markAsDirective(controller, declaration)
    Object.defineProperty(controller, $COMPONENT, {
        value: declaration
    })
}

export function isComponent(controller) {
    return Object.prototype.hasOwnProperty
        .call(controller, $COMPONENT)
}

export function Component(componentDescriptor) {

    if (typeof componentDescriptor.selector !== 'string' // Selector is not a string
        || componentDescriptor.selector.length === 0 // Or it's empty
        || /^[^a-z0-9][a-z0-9]*$/.test(componentDescriptor.selector)) // Or is not a valid tag name
        throw new TypeError('Component selector must be a valid string representing an html tag')

    return function(controller) {
        const opts = Object.assign({}, componentDescriptor, { controller })

        if (typeof controller !== 'function')
            throw new TypeError(`Controller for ${opts.selector} must be a valid constructor`)

        markAsComponent(controller, opts)
    }
}