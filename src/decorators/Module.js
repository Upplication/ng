import angular from 'angular'
import { getInjects } from './Inject'
import { getInjectableName } from './Injectable'
import { getDirectiveName, getDirectiveDefinition} from './Directive'
import { isComponent } from './Component'
import { isConfig } from './Config'
import { isRun } from './Run'

export function Module({
	name,
	services = [],
	pipes = [],
	directives = [],
	requires = [],
}) {
	return (moduleController) => {
		requires = requires.map(m => m.name || m)
		const module = angular.module(name, requires)

		const isRegistered = (_type, _name) =>
			module._invokeQueue.find(([ , type, [ name ] ]) => 
				type === _type && name === _name)

		const registerInjects = (injected) => {
			let injectables = getInjects(injected)
			for (let injectable of injectables)
				registerInjectable(injectable)
		}

		const registerInjectable = (injectable) => {
			const name = getInjectableName(injectable)
			if (!name || isRegistered('service', name))
				return
			registerInjects(injectable)
			module.service(name, injectable)
		}

		const registerPipe = (pipe) => {
			// @TODO: 
		}

		const registerDirective = (directive) => {
			registerInjects(directive)
			const name = getDirectiveName(directive)
			const def = getDirectiveDefinition(directive)
			registerDependencies(def)
			if (isComponent(directive)) 
				!isRegistered('component', name) && module.component(name, def)
			else
				!isRegistered('directive', name) && module.directive(name, () => def)
		}

		const registerDependencies = (e) => {
			const {
				services = [],
				pipes = [],
				directives = [],
			} = e
			services.forEach(s => registerInjectable(s))
			pipes.forEach(p => registerPipe(p))
			directives.forEach(d => registerDirective(d))
		}

		let fns = []
		for (let name of Object.getOwnPropertyNames(moduleController))
			fns.push(moduleController[name])
		for (let name of Object.getOwnPropertyNames(moduleController.prototype))
			fns.push(moduleController.prototype[name])


		for (let fn of fns) {
			if (isConfig(fn))
				module.config(fn)
			else if (isRun(fn))
				module.run(fn)
		}

		if (typeof moduleController.config === 'function')
			module.config(moduleController.config)

		if (typeof moduleController.run === 'function')
			module.run(moduleController.run)

		registerDependencies({ services, pipes, directives })
		return module
	}
}
