const $CONFIG = Symbol('@Config()')

function markAsConfig(fn) {
    Object.defineProperty(fn, $CONFIG, {
        value: true
    })
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