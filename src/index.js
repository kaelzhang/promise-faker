const {
  FakePromise,
  RESOLVE,
  REJECT,
  PENDING,
  VALUE,
  tryCatch
} = require('./fake-promise')

class _Promise {
  constructor (callback) {
    const p = new FakePromise()
    const result = tryCatch(
      callback,
      value => p[RESOLVE](value),
      error => p[REJECT](error)
    )

    if (p[PENDING]) {
      // resolve or reject never called
      return result
    }

    return p
  }
}

_Promise.reject = FakePromise.reject

_Promise.resolve = (subject, end) => {
  const p = FakePromise.resolve(subject)

  if (!end) {
    return p
  }

  if (p[PENDING]) {
    throw new Error('pending unexpectedly')
  }

  return p[VALUE]()
}

module.exports = _Promise
