import { bootstrap } from 'angular'
import { getNgComponentName } from '../core/NgModule'

export function bootstrapModule(...modules) {
	let _modules = modules.map(m => getNgComponentName(m) || m)
	document.addEventListener('DOMContentLoaded', () => 
	    angular.bootstrap(document, [ ..._modules ]), false)
}
