const $INJECTABLE = Symbol('@Injectable(["..."])')

function markAsInjectable(injectable, name) {
    Object.defineProperty(injectable, $INJECTABLE, {
    	value: name
    })
}

export function isInjectable(injectable) {
    return Object.prototype.hasOwnProperty
        .call(injectable, $INJECTABLE)
}

export function getInjectableName(injectable) {
	return injectable[$INJECTABLE] || null
}

export function Injectable(name) {
    return function(injectable) {
        if (typeof injectable !== 'function')
            throw new TypeError('element to be turned into injectable must be a class')
        const actualName = name || injectable.name        
        markAsInjectable(injectable, actualName)
    }
}
