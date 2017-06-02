const ACTION_LOCKS = new WeakMap()

function getActionLocks(ctrl) {
    if (!ACTION_LOCKS.has(ctrl))
        ACTION_LOCKS.set(ctrl, {})
    return ACTION_LOCKS.get(ctrl)
}

function setActionLock(ctrl, action, value) {
    let ctrlLocks = getActionLocks(ctrl, action)
    ctrlLocks[action] = !!value
}

export function isActionLocked(ctrl, action) {
    let ctrlLocks = getActionLocks(ctrl, action)
    return ctrlLocks[action] === true
}

export function actionLock(action) {
    if (!action)
        throw new Error('action must be defined')
    action = String(action)
    return (target, name, descriptor) => {
        // Store the actual fn reference
        let fn = descriptor.value
        // Only decorating functions is allowed
        if (typeof fn !== 'function')
            throw new TypeError(`element to set lock on must be a function, got ${typeof fn}`)
        // Wrap fn on an async try/catch AND add the lock enable/release mechanisms
        let lockWrapperFn = (async function(...args) {
            let isLocked = isActionLocked(this, action)
            let setLock = (v) => setActionLock(this, action, v)
            if (isLocked === true)
                return
            try {
                setLock(true)
                return await (fn.bind(this))(...args)
            } catch(e) {
                throw e
            } finally {
                setLock(false)
            }
        })
        Object.assign(descriptor, {
            value: lockWrapperFn,
        })
        return descriptor
    }
}