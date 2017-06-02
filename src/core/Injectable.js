const $INJECTABLE = Symbol('@Injectable(["..."])')

function markAsInjectable(injectable, name) {
    Object.defineProperty(injectable, $INJECTABLE, {
        value: name
    })
}

/**
 * Any class that has been decorated with @Injectable
 * @interface
 */
export class IInjectable {}

/**
 * Determines if the provided argument has been decorated with @{@link Injectable}
 * @param  {*} injectable
 * @return {Boolean}
 */
export function isInjectable(injectable) {
    return Object.prototype.hasOwnProperty
        .call(injectable, $INJECTABLE)
}

/**
 * Returns the name that was assigned to a class when decorated with @{@link Injectable}.
 * @param  {class} injectable
 * @return {string}
 * @throws {TypeError} If provided argument was never decorated with @{@link Injectable}.
 */
export function getInjectableName(injectable) {
    if (!isInjectable(injectable))
        throw new TypeError('Provided argument has not been decorated with @Injectable')
    return injectable[$INJECTABLE] || null
}

/**
 * Registers the given injectable as a service in an angularjs module.
 * @param  {AngularJS.module} module
 * @param  {IInjectable} injectable
 * @return {AngularJS.module}
 */
export function registerInjectable(module, injectable) {
    module.service(getInjectableName(injectable), injectable)
    return module
}

/**
 * Decorator. Marks a class as an injectable resource having by injectable name
 * the name provided as argument or, if no explicit name provided, the class name
 * itself.
 * @param {?string} name - Injectable name. If not provided it will be the class name.
 */
export function Injectable(name) {
    return function(clazz) {
        if (typeof clazz !== 'function')
            throw new TypeError('element to be turned into injectable must be a class')
        const actualName = name || clazz.name
        markAsInjectable(clazz, actualName)
    }
}
