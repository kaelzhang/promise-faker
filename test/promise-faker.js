import test from 'ava'
import FakePromise from '../src'
import {type} from '../src/fake-promise'

const only = true

const CASES = [

// Creation
//////////////////////////////////////////////////////////////
{
  d: 'new, resolve',
  factory (P, a) {
    return new P((resolve) => {
      resolve(a)
    })
  },
  // should be the first value
  resolve: 0
},
{
  d: 'new, throw after resolve',
  factory (P, a, b) {
    return new P((resolve) => {
      resolve(a)

      throw b
    })
  },
  resolve: 0
},
{
  d: 'new, reject',
  factory (P, a) {
    return new P((resolve, reject) => {
      reject(a)
    })
  },
  reject: 0
},
{
  d: 'new, resolve then reject',
  factory (P, a, b) {
    return new P((resolve, reject) => {
      resolve(a)
      reject(b)
    })
  },
  resolve: 0
},
{
  d: 'new, reject then resolve',
  factory (P, a, b) {
    return new P((resolve, reject) => {
      reject(a)
      resolve(b)
    })
  },
  reject: 0
},
{
  d: 'new, throw then resolve',
  factory (P, a, b) {
    return new P((resolve) => {
      throw a

      resolve(b)
    })
  },
  reject: 0
},
{
  d: 'new, throw then reject',
  factory (P, a, b) {
    return new P((resolve, reject) => {
      throw a
      reject(b)
    })
  },
  reject: 0
},
{
  d: 'new, resolve resolve',
  factory (P, a) {
    return new P((resolve) => {
      resolve(P.resolve(a))
    })
  },
  resolve: 0
},
{
  d: 'new, resolve reject',
  factory (P, a) {
    return new P((resolve) => {
      resolve(P.reject(a))
    })
  },
  reject: 0
},
{
  d: 'new, reject resolve',
  factory (P, a) {
    return new P((resolve, reject) => {
      reject(P.resolve(a))
    })
  },
  reject: 0,
  pResolve: true
},
{
  d: 'new, reject reject',
  factory (P, a) {
    return new P((resolve, reject) => {
      reject(P.reject(a))
    })
  },
  reject: 0,
  pReject: true
},
{
  d: 'resolve',
  factory (P, a) {
    return P.resolve(a)
  },
  resolve: 0
},
{
  d: 'resolve reject',
  factory (P, a) {
    return P.resolve(P.reject(a))
  },
  reject: 0
},
{
  d: 'resolve resolve',
  factory (P, a) {
    return P.resolve(P.resolve(a))
  },
  resolve: 0
},

// Flow
//////////////////////////////////////////////////////////////

]

const VALUES = [
  [undefined, null, false, 1],
  [null, undefined, false, 2],
  [1, 2, 3],
  [0, 1, 2],
  ['1', '2', '3'],
  [{a: 1}, {a: 2}, {a: 3}]
]

function promiseGet (p) {
  return p
}

function fakePromiseGet (p) {
  return FakePromise.resolve(p, true)
}

function getTest (c) {
  return c.only
    ? test.only
    : test
}

async function resolveResult (c, p, t, callback) {
  let ret

  try {
    ret = await p
  } catch (e) {
    if ('pReject' in c) {
      return await callback(e)
    }

    t.fail('result itself should not be rejected')
    return
  }

  if ('pResolve' in c) {
    return await callback(ret)
  }

  // And should not be Promise
  if (ret !== p) {
    t.fail('result itself should not be a promise')
  }

  await callback(ret)
}

function assert (t, a, expect) {
  if (Object(expect) === expect) {
    t.deepEqual(a, expect)
    return
  }

  t.is(a, expect)
}

function run(c, P, get) {
  const {
    factory,
    d
  } = c

  const descPromise = P === Promise
    ? 'Promise'
    : 'FakePromise'

  VALUES.forEach(values => {
    const desc = `${d}: ${descPromise}: ${JSON.stringify(values)}`

    getTest(c)(desc, async t => {
      let result

      try {
        result = await get(factory(P, ...values))
      } catch (e) {
        if ('reject' in c) {
          await resolveResult(c, e, t, result => {
            assert(t, result, values[c.reject])
          })
          return
        }

        console.log('unexpected error', e.stack)
        t.fail('should not reject')
        return
      }

      if ('reject' in c) {
        t.fail('should reject')
        return
      }

      await resolveResult(c, result, t, result => {
        assert(t, result, values[c.resolve])
      })
    })
  })
}

CASES.forEach(c => {
  run(c, Promise, promiseGet)
  run(c, FakePromise, fakePromiseGet)
})
