const symbol = require('symbol-for')
const instanceOf = require('graceful-instanceof')
const type = instanceOf('promise-faker')

const RESOLVE = symbol.for('promise-faker:resolve')
const REJECT = symbol.for('promise-faker:reject')
const REJECTED = symbol.for('promise-faker:rejected')
const PENDING = symbol.for('promise-faker:PENDING')
const VALUE = symbol.for('promise-faker:value')

class FakePromise {
  constructor () {
    this._resolved = undefined
    this._rejected = undefined
    this[REJECTED] = false
    this[PENDING] = true
  }

  [RESOLVE] (subject) {
    if (!this[PENDING]) {
      return
    }

    this[PENDING] = false
    this._resolved = subject
  }

  [REJECT] (subject) {
    if (!this[PENDING]) {
      return
    }

    this[PENDING] = false
    this._rejected = subject
    this[REJECTED] = true
  }

  [VALUE] (shoudThrow) {
    if (!this[REJECTED]) {
      return this._resolved
    }

    throw this._rejected
  }

  then (onResolve, onReject) {
    if (!this[REJECTED]) {
      return tryCatch(onResolve, this._resolved)
    }

    if (!onReject) {
      // Just skip
      return this
    }

    return tryCatch(onReject, this._rejected)
  }

  catch (onReject) {
    if (!this[REJECTED]) {
      return this
    }

    return tryCatch()
  }

  static resolve (subject) {
    if (type.is(subject)) {
      return subject
    }

    const p = new FakePromise()
    p[RESOLVE](subject)
    return p
  }

  static reject (error) {
    const p = new FakePromise()
    p[REJECT](error)
    return p
  }
}

function tryCatch (func, ...args) {
  try {
    return FakePromise.resolve(func(...args))
  } catch (error) {
    return FakePromise.reject(error)
  }

  return FakePromise.resolve(ret)
}

module.exports = {
  FakePromise,
  RESOLVE,
  REJECT,
  PENDING,
  VALUE,
  tryCatch,
  type
}
