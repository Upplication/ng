const $RUN = Symbol('@Run()')

function markAsRun(fn) {
    Object.defineProperty(fn, $RUN, {
        value: true
    })
}

export function isRun(fn) {
    return Object.prototype.hasOwnProperty
        .call(fn, $RUN)
}

export function Run() {
    return (clazz, name, descriptor) => {
        markAsRun(descriptor.value)
        return descriptor
    }
}