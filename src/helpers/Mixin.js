// This module should probably use mixwith.js pacakge, but currently
// it is not updated on NPM and throws problems when transpiling

/**
 * Symbol added to variables to mark them as {@link Mixin} decorated
 * @type {Symbol}
 */
const $IS_MIXIN = Symbol('@Mixin() decorated')

/**
 * Marks the given function as a mixin that can be used with the
 * {@link Mix} function for creating classes with mixins.
 *
 * The function being marked as a mixin is expected to accept a
 * class as first argument and return a class that extends said
 * class.
 *
 * @example
 * import { Mixin } from '@upplication/ng'
 * export const MyMixin = Mixin(superclass => class extends superclass {
 *     constructor() {}
 *     method() {}
 * })
 *
 * @param {Function} target
 * @return {Class}
 */
export function Mixin(target) {
    if (typeof target !== 'function')
        throw new TypeError('target of @Mixin must be a function')
    Object.defineProperty(target, $IS_MIXIN, {
        value: $IS_MIXIN,
    })
    return target
}

/**
 * Determines if the given object has been marked as Mixin
 * via {@link Mixin}
 *
 * @param  {*}  a
 * @return {Boolean}
 */
function isMixin(a) {
    return a && a[$IS_MIXIN] === $IS_MIXIN
}

/**
 * Creates a class of mixin hieriachy composition. The given mixins
 * must all be {@link Mixin} decorated functions.
 * Also, if the first mixin provided is a function BUT is not a Mixin
 * it will be used as the base of the hieriachy chain.
 *
 * @param {...Function} mixins [description]
 */
export function Mix(...mixins) {
    // Asume first element is the superclass
    let superclass = class {}
    mixins = mixins.filter((mixin, idx) => {
        let isValidMixin = isMixin(mixin)
        if (!isValidMixin && idx === 0) {
            // Allow first argument to be a superclass without failing
            superclass = mixin
            return false
        } else if (isValidMixin)
            return true
        else
            throw new TypeError('Trying to mix something that is not a @Mixin')
    })
    return mixins
        .reduce((c, m) => m(c), superclass)
}
