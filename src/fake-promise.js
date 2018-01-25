import symbol from 'symbol-for'
import instanceOf from 'graceful-instanceof'
export const type = instanceOf('promise-faker')

export const RESOLVE = symbol.for('promise-faker:resolve')
export const REJECT = symbol.for('promise-faker:reject')
export const REJECTED = symbol.for('promise-faker:rejected')
export const PENDING = symbol.for('promise-faker:pending')
export const VALUE = symbol.for('promise-faker:value')

export class FakePromise {
  constructor () {
    type.attach(this)
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

  [VALUE] () {
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

    return tryCatch(onReject, this._rejected)
  }

  static resolve (subject, end) {
    const is = type.is(subject)

    if (!end) {
      return is
        ? subject
        : resolve(subject)
    }

    if (!is) {
      return subject
    }

    if (subject[PENDING]) {
      throw new Error('pending unexpectedly')
    }

    return subject[VALUE]()
  }

  static reject (error) {
    const p = new FakePromise()
    p[REJECT](error)
    return p
  }
}

function resolve (subject) {
  const p = new FakePromise()
  p[RESOLVE](subject)
  return p
}

export function tryCatch (func, ...args) {
  try {
    return FakePromise.resolve(func(...args))
  } catch (error) {
    return FakePromise.reject(error)
  }
}
