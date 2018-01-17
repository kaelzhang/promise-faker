const {
  FakePromise,
  RESOLVE,
  REJECT,
  REJECTED,
  PENDING,
  tryCatch
} = require('./fake-promise')

class _Promise {
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
  resolve
} = FakePromise

_Promise.resolve = resolve
_Promise.reject = FakePromise.reject

const all = tasks => tasks.map(task => resolve(task, true))

_Promise.all = tasks => tryCatch(all, tasks)

module.exports = _Promise
