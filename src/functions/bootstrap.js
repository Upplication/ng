import { bootstrap } from 'angular'

export function bootstrapModule(module) {
	boostrap(document, [ module ])
}