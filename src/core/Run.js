const $RUN = Symbol('@Run()')

function markAsRun(fn) {
    Object.defineProperty(fn, $RUN, {
        value: true
    })
}

/**
 * Registers the given function as a run step in an angularjs module.
 * @param  {AngularJS.module} module
 * @param  {function} run - decorated with @{@link Run}
 * @return {AngularJS.module}
 */
export function registerRun(module, run) {
    module.run(run)
    return module
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