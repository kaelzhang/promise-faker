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

_Promise.resolve = FakePromise.resolve
_Promise.reject = FakePromise.reject

module.exports = _Promise
