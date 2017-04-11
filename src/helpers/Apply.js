import { element } from 'angular'

/**
 * Traverses al the elements of the document and evaluates the
 * given function on them. The first element that returns a truthy
 * value after evaluated will be returned. If no element is found
 * the return value will be null
 *
 * @param  {Function} fn
 * @return {HTMLElement}
 */
function findDocumentElement(fn) {
    const items = document.getElementsByTagName("*")
    return Array.from(items).find(i => fn(i))
}

/**
 * Finds and triggers a $rootScope apply on the current application
 * bootstraped on the document
 * @yield {null}
 */
function* findRootScopeAndApply() {
    const findNgRoot = () => {
        let ngRoot = findDocumentElement(e => {
            return typeof element(e).injector() !== 'undefined'
        })
        if (ngRoot !== null)
            return element(ngRoot)
        else
            return null
    }
    let nAttempts = 0
    let ngRoot = findNgRoot()

    while (!ngRoot) {
        ngRoot = findNgRoot()
        console.error(`
            Could\'t find angular app root nor self-inject $rootScope.
            @apply anotation will not work.
            Numer of attempts ${++nAttempts}`
        )
        yield
    }

    let $rootScope = null
    let $safeApply = () => {
        if (!$rootScope)
            return
        let phase = $rootScope.$$phase
        let isDigestCyleInProgress = [ '$apply', '$digest' ].includes(phase)
        // This states should not trigger an apply
        if (!isDigestCyleInProgress)
            $rootScope.$apply()

    }
    // Yield here because the first apply will be invoked after injection
    // is resolved. Afterwards the while will take care of yielding $apply
    // executions
    yield ngRoot.injector()
    .invoke([ '$rootScope', rS => {
        $rootScope = rS
        $safeApply()
    }])

    while (true)
        yield $safeApply()
}

const rootScopeApply = findRootScopeAndApply()

/**
 * Decorator for async functions inside @Component.
 *
 * The problem with async functions is that they are wrapped
 * arround vanilla Promises (not $q promises) making them not
 * trigger a $scope applyance, and thus, not refreshing the view.
 *
 * So using this decorator and making the said function return the
 * promise to be waited, will solve the problem.
 *
 * @example
 * ```
 * @Component({ ··· })
 * export class MyComponentController {
 *     // ···
 *     @$apply
 *     async consumeApi() { ··· }
 *     // ···
 * }
 * ```
 */
export function $apply(target, name, descriptor) {
    // Store original fn reference
    let asyncFn = descriptor.value
    if (typeof asyncFn !== 'function')
        throw new TypeError(`async function must be a function, got ${ typeof asyncFn }`)
    // Warp the real function on an async try catch, with a final apply
    const asyncWrapper = (async function(...args) {
        try { return await (asyncFn.bind(this))(...args) }
        catch(e) { throw e }
        finally { rootScopeApply.next() }
    })
    // Update descriptor values
    Object.assign(descriptor, { value: asyncWrapper })
    return descriptor
}
