const $PIPE = Symbol('@Pipe(name)')

function markAsPipe(clazz, pipeDef) {
    Object.defineProperty(clazz, $PIPE, {
        value: pipeDef,
    })
}

/**
 * Any class that has been decorated with @{@link Pipe}.
 * @interface
 */
class IPipe {}

/**
 * @interface PipeTransform
 */
class PipeTransform {
    /**
     * Transforms the given input to
     * @abstract
     * @param  {string|number|array|object}   input
     * @param  {...*} args  - Any extra amount of arguments passed to the pipe
     * @return {string|number|array|object} Result after piping through, same type as input
     */
    transform(input, ...args) {}
}

/**
 * Determines if the provided argument has been decorated with @{@link Pipe}
 * @param  {*} pipe
 * @return {Boolean}
 */
export function isPipe(pipe) {
    return Object.prototype.hasOwnProperty
        .call(pipe, $INJECTABLE)
}

/**
 * Registers the given pipe as a filter in an angularjs module.
 * @param  {AngularJS.module} module
 * @param  {IInjectable} injectable
 * @return {AngularJS.module}
 */
export function registerPipe(module, pipe) {
    let { name } = pipe[$PIPE]
    module.filter(name, () =>
        (input, ...args) => 
            (pipe.prototype.transform.bind(pipe.prototype))(input, ...args))
    return module
}

/**
 * Pipe Decorator. Marks a class as a Pipe(Angular)/Filter(AngularJS).
 * @param {!string} name - Name of the filter in *camelCase*
 * @throws {TypeError} If no name is provided to the @Pipe
 * @throws {Error} If the decorated class doesn't implement {@link PipeTransform}
 *
 * @example
 * @Pipe('uppercase')
 * export class UppercasePipe {
 *      transform(input, ...otherArgs) {
 *          return String(input).toUpperCase();
 *      }
 * }
 *
 * @Component({
 *     selector: 'span-upper',
 *     template: '<span>{{ someString | uppercase }}</span>',
 * })
 * export class SpanUpperComponent {}
 * 
 */
export function Pipe(name) {
    if (!name || typeof name !== 'string')
        throw new TypeError('@Pipe name can\'t be empty')
    return (clazz) => {
        if (typeof clazz.transform !== 'function')
            throw new Error('@Pipe decorated class must have a transform method')
        markAsPipe(clazz, { name })
    }
}