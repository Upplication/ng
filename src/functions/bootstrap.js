import { bootstrap } from 'angular'

export function bootstrapModule(modules) {
    bootstrap(document, [ ...modules ])
}