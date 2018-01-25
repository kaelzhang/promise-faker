import {
  FakePromise,
  RESOLVE,
  REJECT,
  REJECTED,
  PENDING,
  tryCatch
} from './fake-promise'

export default class Promise {
  constructor (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError(`Promise resolver ${callback} is not a function`)
    }

    const p = new FakePromise()
    const result = tryCatch(
      callback,
      value => p[RESOLVE](value),
      error => p[REJECT](error)
    )

    // resolve or reject already called
    if (!p[PENDING]) {
      return p
    }

    // not called, but there is an error
    if (result[REJECTED]) {
      return result
    }

    // Promise<pending>
    return p
  }
}

const {
  resolve,
} = FakePromise

const all = tasks => tasks.map(task => resolve(task, true))

const define = (object, key, value) => Object.defineProperty(object, key, {
  value
})

define(Promise, 'resolve', resolve)
define(Promise, 'reject', FakePromise.reject)
define(Promise, 'all', tasks => tryCatch(all, tasks))
