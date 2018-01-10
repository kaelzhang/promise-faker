[![Build Status](https://travis-ci.org/kaelzhang/promise-faker.svg?branch=master)](https://travis-ci.org/kaelzhang/promise-faker)
[![Coverage](https://codecov.io/gh/kaelzhang/promise-faker/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/promise-faker)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/promise-faker?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/promise-faker)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/promise-faker.svg)](http://badge.fury.io/js/promise-faker)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/promise-faker.svg)](https://www.npmjs.org/package/promise-faker)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/promise-faker.svg)](https://david-dm.org/kaelzhang/promise-faker)
-->

# promise-faker

Provides promise-like APIs but does the synchronous things. This module is useful for controlling flows.

## Install

```sh
$ npm install promise-faker
```

## Usage

```js
import FakePromise from 'promise-faker'

// Write flows as normal Promise does
function factory (p) {
  const result = p.resolve(1)
  .then(() => {
    return 2
  })

  // Not to make the following chain.
  return p.resolve(result, true)
}

// Then, run them as synchronous flows
factory(FakePromise)  // 2
factory(Promise)      // Promise {2}
```

## new FakePromise(executor)

- **executor** `Function(resolve, reject)`

Returns a fake promise

### FakePromise.resolve(subject [, end])

- **end** `?boolean=false` The additional parameter only for `FakePromise`, and if this parameter is `true`, it will try to get the final value or throw an error if there is a rejection.

```js
FakePromise.resolve(FakePromise.reject('2'), true)
// -> throw '2'
```

And if the fake promise is still pending, an `Error('pending unexpectedly')` error will thrown.

```js
const p = new FakePromise((resolve, reject) => {
  return 1
})

try {
  FakePromise.resolve(p, true)
} catch (e) {
  console.log(e.message)  // 'pending unexpectedly'
}
```

### FakePromise.reject(subject)

Similar as `Promise.reject`

## License

MIT
