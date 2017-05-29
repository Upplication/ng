import { module } from 'angular'
import { isConfig, registerConfig } from './Config'
import { isRun, registerRun } from './Run'
import { isInjectable, registerInjectable } from './Injectable'
import { isDirective, registerDirective } from './Directive'
import { isComponent, registerComponent } from './Component'
import { isPipe, registerPipe } from './Pipe'

/**
 * Property where the NgModule id/name will be stored
 * @type {Symbol<String>}
 */
const $ngModuleName = Symbol('@NgModule({ id })')

/**
 * Any class that has been decorated with @NgModule when declareds
 * @typedef {class} NgModuleDecorated
 */

/**
 * Bridge between the Angular `@NgModule` declaration and the classic AngularJS `angular.module` registration.
 * - Id
 *
 * @see   [Angular NgModule declaration](https://angular.io/docs/ts/latest/api/core/index/NgModule-interface.html)
 * @see   [AngularJS module declaration](https://docs.angularjs.org/api/ng/function/angular.module)
 *
 * @property {object}           moduleDef
 * @property {?string}          moduleDef.id                - The Angular id of the module / the AngularJS name of the module.
 * @property {string[]|class[]} moduleDef.imports           - Other angularjs modules that this module needs. These can be the module
 *                                                          names or classes decorated with {@link NgModule}
 * @property {any[]}            moduleDef.providers         - Set of classes injectable to component or providers in this module.
 * @property {any[]}            moduleDef.declarations      - Components, directives, pipes and services that belong to this module
 * @property {any[]}            moduleDef.exports           - List of components, directives, pipes, services and modules that this module allow
 *                                                          to be used by others that are depending on him.
 */
export function NgModule({
    id,
    providers = [],
    declarations = [],
    imports = [],
    exports = [],
} = {}) {
    if (id && typeof id !== 'string')
        throw new TypeError('NgModule id must be an string')
    if (id.length == 0)
        throw new TypeError('NgModule id can\'t be empty')
    if (!Array.isArray(providers))
        throw new TypeError('NgModule providers must be an array')
    if (!Array.isArray(declarations))
        throw new TypeError('NgModule declarations must be an array')
    if (!Array.isArray(imports))
        throw new TypeError('NgModule imports must be an array')
    if (!Array.isArray(exports))
        throw new TypeError('NgModule exports must be an array')

    return (moduleClass) => {
        /**
         * AngularJS Module dependencies.
         * @example
         * // This is what would go after the module name
         * angular.module('my.module', [ 'ui.router' ])
         * @type {string[]}
         */
        const requires = []
        /**
         * Functions inside the moduleClass that should be run as module
         * config steps
         * @example
         * angular.module(...)
         * .config(function() { ... })
         * @type {function[]}
         */
        const configs = []
        /**
         * Functions inside the moduleClass that should be run as module
         * run steps
         * @example
         * angular.module(...)
         * .config(function() { ... })
         * @type {function[]}
         */
        const runs = []
        /**
         * Classes decorated with @Injectable that can be injected into other
         * services, components, directives or pipes which will be included in
         * the AngularJS module as follows
         * @example
         * angular.module(...)
         * .service(['dep', 'depw', function() {} ])
         * @type {class[]}
         */
        const services = []
        /**
         * Classes decorated with @Directive that will generate a directive
         * on the AngularJS module.
         * @example
         * angular.module(...)
         * .directive('myDirective', ...)
         * @type {class[]}
         */
        const directives = []
        /**
         * Classes decorated with @Component that will generate a component
         * on the AngularJS module.
         * @example
         * angular.module(...)
         * .directive('myDirective', ...)
         * @type {class[]}
         */
        const components = []
        /**
         * Classes decorated with @Pipe that will generate a filter on the
         * AnuglarJS module
         * @example
         * angular.module(...)
         * .filter('uppercase', UppercasePipe)
         * @type {Array}
         */
        const filters = []

        // Define the internal property of NgModule name for dependency
        // module injection.
        let moduleId = id || moduleClass.name
        Object.defineProperty(moduleClass, $ngModuleName, {
            value: moduleId,
        })

        // Map imports to AngularJS require array as follows:
        // - If is a class decorated with @NgModule, use it's internal id
        // - If is an angular.component(...) use its name
        // - Otherwise assume it's an string and use it
        requires.push(...imports.map(m => m[$ngModuleName] || m.name || m))

        // Every require should be a string at this point, check it
        requires.forEach((r, idx) => {
            if (!r || typeof r !== 'string')
                throw new Error(`NgModule ${moduleId}: Could't resolve 'import' at position ${i}`)
        })

        // Check every provider is valid and is @Inectable decorated, if so add it to the services array
        providers.forEach((p, idx) => {
            if (!p)
                throw new TypeError(`NgModule ${moduleId}: 'provider' at position ${idx} is not a valid provider`)
            if (!isInjectableDecorated(p))
                throw new Error(`NgModule ${moduleId}: 'provider' at position ${idx} is not @Injectable`)
            services.push(p)
        })

        // Save every `declaration` on its array depending on its type
        declarations.forEach((d, idx) => {
            if (!d)
                throw new TypeError(`NgModule ${moduleId}: 'declaration' at position ${idx} is not a valid declaration`)
            if (isDirectiveDecorated(d))
                directives.push(d)
            else if (isComponentDecorated(d))
                components.push(d)
            else if (isPipeDecorated(d))
                pipes.push(d)
            else
                throw new Error(`NgModule ${moduleId}: 'declaration' at position ${idx} is not any of these: @Component, @Directive, @Pipe`)
        })

        // Check everything exported by this module is actually declared...
        exports.forEach((e, idx) => {
            if (!declarations.includes(e))
                throw new Error(`NgModule ${moduleId}: 'export' at position ${idx} is not available on declarations`)
        })

        // Inspect the module class for config/run steps
        for (let name of Object.getOwnPropertyNames(moduleClass.prototype)) {
            let fn = moduleClass.prototype[name]
            if (isConfig(fn))
                configs.push(fn)
            else if (isRun(fn))
                runs.push(fn)
        }

        let module = angular.module(moduleId, requires)
        configs.forEach((c) => registrerConfig(module, c))
        runs.forEach((r) => registrerRun(module, r))
        services.forEach((s) => registerInjectable(module, s))
        pipes.forEach((p) => registerPipe(module,p))
        directives.forEach((d) => registerDirective(module, d))
        components.forEach((c) => registerComponent(module, c))
        return module
    }
}