import { kebabToCamel } from '../utils/convert-case'

const $COMPONENT = Symbol('@Component({ ... }')

/**
 * Marks the given component controller class as a component by adding the component
 * definition as a "private" symbol.
 * @param  {class} component
 * @param  {object} declaration
 * @return {void}
 */
function markAsComponent(component, definition) {
    Object.defineProperty(component, $COMPONENT, {
        value: definition
    })
}

/**
 * Determines if the provided argument has been decorated with @{@link Component}
 * @param  {*} component
 * @return {Boolean}
 */
export function isComponent(component) {
    return Object.prototype.hasOwnProperty
        .call(component, $COMPONENT)
}

/**
 * Returns the object that was passed to @{@link Component} when decorating
 * the given class.
 * @param  {class} clazz
 * @return {object}
 * @throws {TypeError} If provided class was not decorated with @Component
 */
export function getComponentDefinition(clazz) {
    if (!isComponent(clazz))
        throw new TypeError('Provided argument has not been decorated with @Component')
    return clazz[$COMPONENT]
}

/**
 * Registers the given component as a component in an angularjs module.
 * @param  {AngularJS.module} module
 * @param  {class} component - decorated with @{@link Component}
 * @return {AngularJS.module}
 */
export function registerComponent(module, component) {
    let def = getComponentDefinition(component)
    let name = kebabToCamel(def.selector)
    let adaptedDefinition = Object.assign({}, def, {
        // Add the class itself as the controller property
        controller: component,
    })
    module.component(name, adaptedDefinition)
    return module
}


/**
 * Decorator. Marks a class as a component controller and defines its component configuration
 * such as selector, template, styles and providers
 * @param {object} def
 * @param {!string} def.selector - HTML tag that this component will have
 */
export function Component(def) {
    if (typeof def.selector !== 'string' // Selector is not a string
        || def.selector.length === 0 // Or it's empty
        || /^[^a-z0-9][a-z0-9]*$/.test(def.selector)) // Or is not a valid tag name
        throw new TypeError('Component selector must be a valid string representing an html tag')

    return (clazz) => {
        // TODO: Do something with the bindings insetad of using it directly
        if (typeof clazz !== 'function')
            throw new TypeError('@Component must be applied over a class')
        markAsComponent(clazz, def)
    }
}
