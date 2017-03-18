# @upplication/ng
_AngularJS, but with decorators_

## Installation
```
$ npm install --save angular @upplication/ng
```

Take in mind that this library relies on the use of `@Decorators` syntax,
so you maybe want to install something for handling that too. We'd recomend
using [babel](https://babeljs.io/) alongside
[a decorators plugin](https://babeljs.io/docs/plugins/transform-decorators/):

**Install babel**
```
$ npm install --save-dev babel-cli \
	babel-preset-es2015 \
	babel-preset-es2016 \
	babel-preset-es2017 \
	babel-plugin-transform-decorators
```
**.babelrc**
```json
{
  "presets": [
    "es2015",
    "es2016",
    "es2017"
  ],
  "plugins": [
    "transform-decorators"
  ]
}
```

## Docs

* [@Injectable](#injectable)
* [@Inject](#inject)
* [@Pipe](#pipe)
* [@Directive](#directive)
* [@Component](#component)
* [@Module](#module)
* [@$apply](#apply)

### @Injectable
```js
@Injectable(name? : String)
class MyClass() {}
```
Marks the decorated class as injectable, or in other words, an angular service.
The name of the service will be the name of the class or the provided name to
the decorator function. Also makes the class injectable via refenrece when
using `@Inject`

#### Example
```js
import { Injectable } from '@upplication/ng'

@Injectable()
export class HeroStoreService { ... }

@Injectable('HeroApi')
export class HeroApiService { ... }

// classic way
angular
    .module('app', [])
    .service('HeroService', HeroStoreService)
    .service('HeroApi', HeroApiService)
```

### @Inject
```js
@Inject(...dependencies : <String|Injectable>[])
class MyClass() {}
```
Injects the class with the specified angular services and injectables. This is
equivalent to adding the `$inject` property to the class or using the array
injection notation (`[ 'a', 'b',  function(a, b) { .. } ]`).

Every dependency passed as an argument must be either a service name, which can
be an angular core service (like `'$http'`) or a service provided by dependency
module (like `'$translate'`), or the reference to a class already decorated
with `@Injectable`.

The injected dependencies are passed to the constructor of the class.

#### Example
```js
import { Injectable, Inject } from '@upplication/ng'

@Injectable()
export class ApiConfiguration { ... }

@Injectable()
@Inject('$http', ApiConfiguration)
export class ApiConsumer {
    constructor($http, apiConfiguration) {
        // Do something with the injections, usually store them locally
        this.$http = $http
        this.apiConfiguration = apiConfiguration
    }
}

@Injectable()
@Inject('$q', ApiConsumer)
export class HeroApi {
    constructor($q, apiConsumer) { ... }
}

// classic way
angular
    .module('app', [])
    .service('ApiConfiguration', ApiConfiguration)
    .service('ApiConsumer', [ '$http', 'ApiConfiguration', ApiConsumer ])
    .service('HeroApi', [ '$q', 'ApiConsumer', HeroApi ])

```

### @Pipe
**TODO**

### @Directive
```js
@Directive({
	selector: string,
	services?: Inectable[],
	pipes?: Pipe[]
	directives?: <Directive|Component>[]
})
class MyClass() {}
```
Registers a new directive with the object passed as argument being the
[directive definition](https://docs.angularjs.org/guide/directive) and
the decorated class the controller to be used by said directive.

The directive name must be provided as a *selector* property on the
definition object and *must* be a _kebab-case_ string representing the
attribute name that would use this directive.

Also, any local service, pipe, or other directives being used by this
directive must be specified as properties on the directive definition object
as follows:
* **services**: Array of `@Injectable` decorated classes. *Don't* include here
    services that come from angular core or module dependencies.
* **pipes**: Array of `@Pipe` decorated classes. *Don't* include here
    filters that come from angular core or module dependencies.
* **directives**: Array of `@Directive` or `@Component` decorated classes.

#### Example
```js
import { Injectable, Inject } from '@upplication/ng'

@Directive({
    selector: 'fading-background',
    services: [
        HeroStoreService,
    ]
})
@Inject('$scope', '$element', '$attrs', HeroStoreService)
export class FadingBackgroundDirective {
    constructor($scope, $element, $attrs, heroStoreService) {
        // Set up $element listeners? maybe scope $watchers
    }

    $onDestroy() {
        // Dont forget to unregister your listeners :)
    }
}

// classic way
angular
    .module('app', [])
    // (...)
    .directive('fadingBackground', function() {
        return {
            scope: false,
            restrict: 'A',
            controller: [ 'HeroStoreService', FadingBackgroundDirectiveCtrl ],
            link: function(scope, element, attrs, ctrl) {
                element.on('$destroy', function() { ctrl.$onDestroy && ctrl.$onDestroy() })
            }
        }
    }])
```

### @Component
```js
@Component({
	selector: string,
	services?: Inectable[],
	pipes?: Pipe[]
	directives?: <Directive|Component>[]
})
class MyClass() {}
```
Registers a new component with the object passed as argument being the
[component definition](https://docs.angularjs.org/guide/component) and
the decorated class the controller of said component.

Also, any local service, pipe, or other directives being used by this
directive must be specified as properties on the directive definition object
as follows:
* **services**: Array of `@Injectable` decorated classes. *Don't* include here
    services that come from angular core or module dependencies.
* **pipes**: Array of `@Pipe` decorated classes. *Don't* include here
    filters that come from angular core or module dependencies.
* **directives**: Array of `@Directive` or `@Component` decorated classes

#### Example
```js
import { Component } from '@upplication/ng'

@Component({
    selector: 'hello-world',
    template: `Hello world, I'm {{ $ctrl.name }}`,
    styles: [],
    bindings: {
        name: '<'
    }
})
export class HelloWorldComponent { ... }
```

### @Module
```js
@Module({
	name: string,
	services?: Inectable[],
	pipes?: Pipe[]
	directives?: <Directive|Component>[]
})
class MyClass() {}
```
Bundles a whole set of classes decorated with previous decorators into
an actual `angular.module`. Prior to actually declaring the injectables,
pipes, directives and components as dependencies of a Module, no real
registration of said modules happen.

The decorator must be passed an object containing all the parts to be
exposed and the module name itself as follows:
* **name**: Name of the angular module
* **services**: Array of `@Injectable` decorated classes to be bundled on this
    module
* **pipes**: Array of `@Pipe` decorated classes.  to be bundled on this
    module
* **directives**: Array of `@Directive` or `@Component` decorated classes to be
	bundled in this module
* **requires**: Array of `angular.module`-s or `angular.module` names that this
	module requires to work.

If the decorated class provides a static `config()` method, that method will be
executed on module config phase.

If the decorated class provides a static `run()` method, that method will be
executed on module run phase.

```js
@Module({
    name: 'app',
    services: [
        HeroApiService,
        HeroStoreService,
        ApiConsumer,
    ],
    pipes: [
        UppercasePipe,
        CamelCasePipe,
    ],
    directives: [
        FadingBackgroundDirective,
        HelloWorldComponent,
    ],
})
export class MyApp {
    static config() {
        console.log('Config!')
    }

    static run() {
        console.log('Running!')
    }
}
```

### @$apply
```js
class MyClass() {
	@$apply
	async myAsyncFn() {
		// ...
	}
}
```
Helper decorator for triggering a `$rootScope.$apply()` after the decorated
function. This is specially useful when you are using ES6+ features (like
async/await).

#### Example
```js
import { Component, $async } from '@upplication/ng'

@Component({
    selector: 'hello-world',
    template: `Hello world, I'm {{ $ctrl.name }}`,
    styles: [],
    bindings: {
        name: '<'
    }
})
export class HelloWorldComponent {
    constructor() {...}

    @$apply
    async someAsyncAction() {
        await this.request(...)
    }
}
```