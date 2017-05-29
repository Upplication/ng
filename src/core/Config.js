const $CONFIG = Symbol('@Config()')

function markAsConfig(fn) {
    Object.defineProperty(fn, $CONFIG, {
        value: true
    })
}

/**
 * Registers the given function as a config step in an angularjs module.
 * @param  {AngularJS.module} module
 * @param  {function} config - decorated with @{@link Config}
 * @return {AngularJS.module}
 */
export function registerConfig(module, config) {
    module.config(config)
    return module
}

export function isConfig(fn) {
    return Object.prototype.hasOwnProperty
        .call(fn, $CONFIG)
}

export function Config() {
    return (clazz, name, descriptor) => {
        markAsConfig(descriptor.value)
        return descriptor
    }
}