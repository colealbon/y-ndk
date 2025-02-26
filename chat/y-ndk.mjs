/**
 * Utility module to work with key-value stores.
 *
 * @module map
 */

/**
 * Creates a new Map instance.
 *
 * @function
 * @return {Map<any, any>}
 *
 * @function
 */
const create$1 = () => new Map()

/**
 * Get map property. Create T if property is undefined and set T on map.
 *
 * ```js
 * const listeners = map.setIfUndefined(events, 'eventName', set.create)
 * listeners.add(listener)
 * ```
 *
 * @function
 * @template {Map<any, any>} MAP
 * @template {MAP extends Map<any,infer V> ? function():V : unknown} CF
 * @param {MAP} map
 * @param {MAP extends Map<infer K,any> ? K : unknown} key
 * @param {CF} createT
 * @return {ReturnType<CF>}
 */
const setIfUndefined = (map, key, createT) => {
  let set = map.get(key)
  if (set === undefined) {
    map.set(key, set = createT())
  }
  return set
}

/**
 * Utility module to work with sets.
 *
 * @module set
 */

const create = () => new Set()

/**
 * Utility module to work with Arrays.
 *
 * @module array
 */

/**
 * Transforms something array-like to an actual Array.
 *
 * @function
 * @template T
 * @param {ArrayLike<T>|Iterable<T>} arraylike
 * @return {T}
 */
const from = Array.from

/**
 * Observable class prototype.
 *
 * @module observable
 */

/**
 * Handles named events.
 * @experimental
 *
 * This is basically a (better typed) duplicate of Observable, which will replace Observable in the
 * next release.
 *
 * @template {{[key in keyof EVENTS]: function(...any):void}} EVENTS
 */
class ObservableV2 {
  constructor () {
    /**
     * Some desc.
     * @type {Map<string, Set<any>>}
     */
    this._observers = create$1()
  }

  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on (name, f) {
    setIfUndefined(this._observers, /** @type {string} */ (name), create).add(f)
    return f
  }

  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once (name, f) {
    /**
     * @param  {...any} args
     */
    const _f = (...args) => {
      this.off(name, /** @type {any} */ (_f))
      f(...args)
    }
    this.on(name, /** @type {any} */ (_f))
  }

  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off (name, f) {
    const observers = this._observers.get(name)
    if (observers !== undefined) {
      observers.delete(f)
      if (observers.size === 0) {
        this._observers.delete(name)
      }
    }
  }

  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */
  emit (name, args) {
    // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
    return from((this._observers.get(name) || create$1()).values()).forEach(f => f(...args))
  }

  destroy () {
    this._observers = create$1()
  }
}
/* c8 ignore end */

/**
 * Utility module to work with strings.
 *
 * @module string
 */

const fromCharCode = String.fromCharCode

/**
 * @param {string} s
 * @return {string}
 */
const toLowerCase = s => s.toLowerCase()

const trimLeftRegex = /^\s*/g

/**
 * @param {string} s
 * @return {string}
 */
const trimLeft = s => s.replace(trimLeftRegex, '')

const fromCamelCaseRegex = /([A-Z])/g

/**
 * @param {string} s
 * @param {string} separator
 * @return {string}
 */
const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`))

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Polyfill = str => {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */ (encodedString.codePointAt(i))
  }
  return buf
}

/* c8 ignore next */
const utf8TextEncoder = /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null)

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Native = str => utf8TextEncoder.encode(str)

/**
 * @param {string} str
 * @return {Uint8Array}
 */
/* c8 ignore next */
const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill

/* c8 ignore next */
let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

/* c8 ignore start */
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  // Safari doesn't handle BOM correctly.
  // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
  // Another issue is that from then on no BOM chars are recognized anymore
  /* c8 ignore next */
  utf8TextDecoder = null
}

/**
 * Often used conditions.
 *
 * @module conditions
 */

/**
 * @template T
 * @param {T|null|undefined} v
 * @return {T|null}
 */
/* c8 ignore next */
const undefinedToNull = v => v === undefined ? null : v

/* eslint-env browser */

/**
 * Isomorphic variable storage.
 *
 * Uses LocalStorage in the browser and falls back to in-memory storage.
 *
 * @module storage
 */

/* c8 ignore start */
class VarStoragePolyfill {
  constructor () {
    this.map = new Map()
  }

  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem (key, newValue) {
    this.map.set(key, newValue)
  }

  /**
   * @param {string} key
   */
  getItem (key) {
    return this.map.get(key)
  }
}
/* c8 ignore stop */

/**
 * @type {any}
 */
let _localStorage = new VarStoragePolyfill()
let usePolyfill = true

/* c8 ignore start */
try {
  // if the same-origin rule is violated, accessing localStorage might thrown an error
  if (typeof localStorage !== 'undefined' && localStorage) {
    _localStorage = localStorage
    usePolyfill = false
  }
} catch (e) { }
/* c8 ignore stop */

/**
 * This is basically localStorage in browser, or a polyfill in nodejs
 */
/* c8 ignore next */
const varStorage = _localStorage

/**
 * Common functions and function call helpers.
 *
 * @module function
 */

/**
 * @template V
 * @template {V} OPTS
 *
 * @param {V} value
 * @param {Array<OPTS>} options
 */
// @ts-ignore
const isOneOf = (value, options) => options.includes(value)

/**
 * Isomorphic module to work access the environment (query params, env variables).
 *
 * @module environment
 */

/* c8 ignore next 2 */
// @ts-ignore
const isNode = typeof process !== 'undefined' && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'

/* c8 ignore next */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && !isNode

/**
 * @type {Map<string,string>}
 */
let params

/* c8 ignore start */
const computeParams = () => {
  if (params === undefined) {
    if (isNode) {
      params = create$1()
      const pargs = process.argv
      let currParamName = null
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i]
        if (parg[0] === '-') {
          if (currParamName !== null) {
            params.set(currParamName, '')
          }
          currParamName = parg
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg)
            currParamName = null
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, '')
      }
      // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
    } else if (typeof location === 'object') {
      params = create$1(); // eslint-disable-next-line no-undef
      (location.search || '?').slice(1).split('&').forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split('=')
          params.set(`--${fromCamelCase(key, '-')}`, value)
          params.set(`-${fromCamelCase(key, '-')}`, value)
        }
      })
    } else {
      params = create$1()
    }
  }
  return params
}
/* c8 ignore stop */

/**
 * @param {string} name
 * @return {boolean}
 */
/* c8 ignore next */
const hasParam = (name) => computeParams().has(name)

/**
 * @param {string} name
 * @return {string|null}
 */
/* c8 ignore next 4 */
const getVariable = (name) =>
  isNode
    ? undefinedToNull(process.env[name.toUpperCase().replaceAll('-', '_')])
    : undefinedToNull(varStorage.getItem(name))

/**
 * @param {string} name
 * @return {boolean}
 */
/* c8 ignore next 2 */
const hasConf = (name) =>
  hasParam('--' + name) || getVariable(name) !== null

/* c8 ignore next */
hasConf('production')

/* c8 ignore next 2 */
const forceColor = isNode &&
  isOneOf(process.env.FORCE_COLOR, ['true', '1', '2'])

/* c8 ignore start */
/**
 * Color is enabled by default if the terminal supports it.
 *
 * Explicitly enable color using `--color` parameter
 * Disable color using `--no-color` parameter or using `NO_COLOR=1` environment variable.
 * `FORCE_COLOR=1` enables color and takes precedence over all.
 */
forceColor || (
  !hasParam('--no-colors') && // @todo deprecate --no-colors
  !hasConf('no-color') &&
  (!isNode || process.stdout.isTTY) && (
    !isNode ||
    hasParam('--color') ||
    getVariable('COLORTERM') !== null ||
    (getVariable('TERM') || '').includes('color')
  )
)
/* c8 ignore stop */

/**
 * Common Math expressions.
 *
 * @module math
 */

const floor = Math.floor

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The smaller element of a and b
 */
const min = (a, b) => a < b ? a : b

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The bigger element of a and b
 */
const max = (a, b) => a > b ? a : b

/* eslint-env browser */

const BIT8 = 128
const BITS7 = 127

/**
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module encoding
 */

/**
 * Write one byte to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The byte that is to be encoded.
 */
const write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf)
    encoder.cbuf = new Uint8Array(bufferLen * 2)
    encoder.cpos = 0
  }
  encoder.cbuf[encoder.cpos++] = num
}

/**
 * Write a variable length unsigned integer. Max encodable integer is 2^53.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | (BITS7 & num))
    num = floor(num / 128) // shift >>> 7
  }
  write(encoder, BITS7 & num)
}

/**
 * A cache to store strings temporarily
 */
const _strBuffer = new Uint8Array(30000)
const _maxStrBSize = _strBuffer.length / 3

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    // We can encode the string into the existing buffer
    /* c8 ignore next */
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0
    writeVarUint(encoder, written)
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i])
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str))
  }
}

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str))
  const len = encodedString.length
  writeVarUint(encoder, len)
  for (let i = 0; i < len; i++) {
    write(encoder, /** @type {number} */ (encodedString.codePointAt(i)))
  }
};

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
/* c8 ignore next */
(utf8TextEncoder && /** @type {any} */ (utf8TextEncoder).encodeInto) ? _writeVarStringNative : _writeVarStringPolyfill

/**
 * Append fixed-length Uint8Array to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length
  const cpos = encoder.cpos
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length)
  const rightCopyLen = uint8Array.length - leftCopyLen
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos)
  encoder.cpos += leftCopyLen
  if (rightCopyLen > 0) {
    // Still something to write, write right half..
    // Append new buffer
    encoder.bufs.push(encoder.cbuf)
    // must have at least size of remaining buffer
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen))
    // copy array
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen))
    encoder.cpos = rightCopyLen
  }
}

/**
 * Append an Uint8Array to Encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength)
  writeUint8Array(encoder, uint8Array)
}

/**
 * Utility functions to work with buffers (Uint8Array).
 *
 * @module buffer
 */

/**
 * @param {number} len
 */
const createUint8ArrayFromLen = len => new Uint8Array(len)

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 * @param {number} byteOffset
 * @param {number} length
 */
const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length)

/* c8 ignore start */
/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Browser = bytes => {
  let s = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    s += fromCharCode(bytes[i])
  }
  // eslint-disable-next-line no-undef
  return btoa(s)
}
/* c8 ignore stop */

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64')

/* c8 ignore start */
/**
 * @param {string} s
 * @return {Uint8Array}
 */
const fromBase64Browser = s => {
  // eslint-disable-next-line no-undef
  const a = atob(s)
  const bytes = createUint8ArrayFromLen(a.length)
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i)
  }
  return bytes
}
/* c8 ignore stop */

/**
 * @param {string} s
 */
const fromBase64Node = s => {
  const buf = Buffer.from(s, 'base64')
  return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength)
}

/* c8 ignore next */
const toBase64 = isBrowser ? toBase64Browser : toBase64Node

/* c8 ignore next */
const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node

const commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

function getDefaultExportFromCjs (x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x
}

function getAugmentedNamespace (n) {
  if (n.__esModule) return n
  const f = n.default
  if (typeof f === 'function') {
    var a = function a () {
      if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor)
      }
      return f.apply(this, arguments)
    }
    a.prototype = f.prototype
  } else a = {}
  Object.defineProperty(a, '__esModule', { value: true })
  Object.keys(n).forEach(function (k) {
    const d = Object.getOwnPropertyDescriptor(n, k)
    Object.defineProperty(a, k, d.get
      ? d
      : {
          enumerable: true,
          get: function () {
            return n[k]
          }
        })
  })
  return a
}

const lib = {}

const types = {}

Object.defineProperty(types, '__esModule', { value: true })

const ee = {}

const taskCollection$1 = {}

const taskCollection = {}

const utils$2 = {}

Object.defineProperty(utils$2, '__esModule', { value: true })
utils$2._fast_remove_single = void 0
function _fast_remove_single (arr, index) {
  if (index === -1) { return }
  if (index === 0) { arr.shift() } else if (index === arr.length - 1) { arr.length = arr.length - 1 } else { arr.splice(index, 1) }
}
utils$2._fast_remove_single = _fast_remove_single

const bakeCollection = {};

(function (exports) {
  Object.defineProperty(exports, '__esModule', { value: true })
  exports.bakeCollectionVariadic = exports.bakeCollectionAwait = exports.bakeCollection = exports.BAKED_EMPTY_FUNC = void 0
  exports.BAKED_EMPTY_FUNC = function () { }
  const FORLOOP_FALLBACK = 1500
  function generateArgsDefCode (numArgs) {
	    let argsDefCode = ''
	    if (numArgs === 0) { return argsDefCode }
	    for (let i = 0; i < numArgs - 1; ++i) {
	        argsDefCode += ('arg' + String(i) + ', ')
	    }
	    argsDefCode += ('arg' + String(numArgs - 1))
	    return argsDefCode
  }
  function generateBodyPartsCode (argsDefCode, collectionLength) {
	    let funcDefCode = ''; let funcCallCode = ''
	    for (let i = 0; i < collectionLength; ++i) {
	        funcDefCode += 'var f'.concat(i, ' = collection[').concat(i, '];\n')
	        funcCallCode += 'f'.concat(i, '(').concat(argsDefCode, ')\n')
	    }
	    return { funcDefCode, funcCallCode }
  }
  function generateBodyPartsVariadicCode (collectionLength) {
	    let funcDefCode = ''; let funcCallCode = ''
	    for (let i = 0; i < collectionLength; ++i) {
	        funcDefCode += 'var f'.concat(i, ' = collection[').concat(i, '];\n')
	        funcCallCode += 'f'.concat(i, '.apply(undefined, arguments)\n')
	    }
	    return { funcDefCode, funcCallCode }
  }
  function bakeCollection (collection, fixedArgsNum) {
	    if (collection.length === 0) { return exports.BAKED_EMPTY_FUNC } else if (collection.length === 1) { return collection[0] }
	    let funcFactoryCode
	    if (collection.length < FORLOOP_FALLBACK) {
	        var argsDefCode = generateArgsDefCode(fixedArgsNum)
	        const _a = generateBodyPartsCode(argsDefCode, collection.length); const funcDefCode = _a.funcDefCode; const funcCallCode = _a.funcCallCode
	        funcFactoryCode = '(function(collection) {\n            '.concat(funcDefCode, '\n            collection = undefined;\n            return (function(').concat(argsDefCode, ') {\n                ').concat(funcCallCode, '\n            });\n        })')
	    } else {
	        var argsDefCode = generateArgsDefCode(fixedArgsNum)
	        // loop unroll
	        if (collection.length % 10 === 0) {
	            funcFactoryCode = '(function(collection) {\n                return (function('.concat(argsDefCode, ') {\n                    for (var i = 0; i < collection.length; i += 10) {\n                        collection[i](').concat(argsDefCode, ');\n                        collection[i+1](').concat(argsDefCode, ');\n                        collection[i+2](').concat(argsDefCode, ');\n                        collection[i+3](').concat(argsDefCode, ');\n                        collection[i+4](').concat(argsDefCode, ');\n                        collection[i+5](').concat(argsDefCode, ');\n                        collection[i+6](').concat(argsDefCode, ');\n                        collection[i+7](').concat(argsDefCode, ');\n                        collection[i+8](').concat(argsDefCode, ');\n                        collection[i+9](').concat(argsDefCode, ');\n                    }\n                });\n            })')
	        } else if (collection.length % 4 === 0) {
	            funcFactoryCode = '(function(collection) {\n                return (function('.concat(argsDefCode, ') {\n                    for (var i = 0; i < collection.length; i += 4) {\n                        collection[i](').concat(argsDefCode, ');\n                        collection[i+1](').concat(argsDefCode, ');\n                        collection[i+2](').concat(argsDefCode, ');\n                        collection[i+3](').concat(argsDefCode, ');\n                    }\n                });\n            })')
	        } else if (collection.length % 3 === 0) {
	            funcFactoryCode = '(function(collection) {\n                return (function('.concat(argsDefCode, ') {\n                    for (var i = 0; i < collection.length; i += 3) {\n                        collection[i](').concat(argsDefCode, ');\n                        collection[i+1](').concat(argsDefCode, ');\n                        collection[i+2](').concat(argsDefCode, ');\n                    }\n                });\n            })')
	        } else {
	            funcFactoryCode = '(function(collection) {\n                return (function('.concat(argsDefCode, ') {\n                    for (var i = 0; i < collection.length; ++i) {\n                        collection[i](').concat(argsDefCode, ');\n                    }\n                });\n            })')
	        }
	    }
	    {
	        const funcFactory = eval(funcFactoryCode)
	        return funcFactory(collection)
	    }
  }
  exports.bakeCollection = bakeCollection
  function bakeCollectionAwait (collection, fixedArgsNum) {
	    if (collection.length === 0) { return exports.BAKED_EMPTY_FUNC } else if (collection.length === 1) { return collection[0] }
	    let funcFactoryCode
	    if (collection.length < FORLOOP_FALLBACK) {
	        var argsDefCode = generateArgsDefCode(fixedArgsNum)
	        const _a = generateBodyPartsCode(argsDefCode, collection.length); const funcDefCode = _a.funcDefCode; const funcCallCode = _a.funcCallCode
	        funcFactoryCode = '(function(collection) {\n            '.concat(funcDefCode, '\n            collection = undefined;\n            return (function(').concat(argsDefCode, ') {\n                return Promise.all([ ').concat(funcCallCode, ' ]);\n            });\n        })')
	    } else {
	        var argsDefCode = generateArgsDefCode(fixedArgsNum)
	        funcFactoryCode = '(function(collection) {\n            return (function('.concat(argsDefCode, ') {\n                var promises = Array(collection.length);\n                for (var i = 0; i < collection.length; ++i) {\n                    promises[i] = collection[i](').concat(argsDefCode, ');\n                }\n                return Promise.all(promises);\n            });\n        })')
	    }
	    {
	        const funcFactory = eval(funcFactoryCode)
	        return funcFactory(collection)
	    }
  }
  exports.bakeCollectionAwait = bakeCollectionAwait
  function bakeCollectionVariadic (collection) {
	    if (collection.length === 0) { return exports.BAKED_EMPTY_FUNC } else if (collection.length === 1) { return collection[0] }
	    let funcFactoryCode
	    if (collection.length < FORLOOP_FALLBACK) {
	        const _a = generateBodyPartsVariadicCode(collection.length); const funcDefCode = _a.funcDefCode; const funcCallCode = _a.funcCallCode
	        funcFactoryCode = '(function(collection) {\n            '.concat(funcDefCode, '\n            collection = undefined;\n            return (function() {\n                ').concat(funcCallCode, '\n            });\n        })')
	    } else {
	        funcFactoryCode = '(function(collection) {\n            return (function() {\n                for (var i = 0; i < collection.length; ++i) {\n                    collection[i].apply(undefined, arguments);\n                }\n            });\n        })'
	    }
	    {
	        const funcFactory = eval(funcFactoryCode)
	        return funcFactory(collection)
	    }
  }
  exports.bakeCollectionVariadic = bakeCollectionVariadic
}(bakeCollection))

const __spreadArray$1 = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
  if (pack || arguments.length === 2) {
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i)
        ar[i] = from[i]
      }
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from))
}
Object.defineProperty(taskCollection, '__esModule', { value: true })
taskCollection.TaskCollection = void 0
const utils_1$1 = utils$2
const bake_collection_1 = bakeCollection
function push_norebuild (a, b /*, ...func: Func[] */) {
  const len = this.length
  if (len > 1) { // tasks is array
    if (b) { // if multiple args
      let _a;
      (_a = this._tasks).push.apply(_a, arguments)
      this.length += arguments.length
    } else { // if single arg (most often case)
      this._tasks.push(a)
      this.length++
    }
  } else { // tasks is (function or null)
    if (b) { // if multiple args
      if (len === 1) { // if this._tasks is function
        var newAr = Array(1 + arguments.length)
        newAr.push(newAr)
        newAr.push.apply(newAr, arguments)
        this._tasks = newAr
      } else {
        var newAr = Array(arguments.length)
        newAr.push.apply(newAr, arguments)
        this._tasks = newAr
      }
      this.length += arguments.length
    } else { // if single arg (most often case)
      if (len === 1) { this._tasks = [this._tasks, a] } else { this._tasks = a }
      this.length++
    }
  }
}
function push_rebuild (a, b /*, ...func: Func[] */) {
  const len = this.length
  if (len > 1) { // tasks is array
    if (b) { // if multiple args
      let _a;
      (_a = this._tasks).push.apply(_a, arguments)
      this.length += arguments.length
    } else { // if single arg (most often case)
      this._tasks.push(a)
      this.length++
    }
  } else { // tasks is (function or null)
    if (b) { // if multiple args
      if (len === 1) { // if this._tasks is function
        var newAr = Array(1 + arguments.length)
        newAr.push(newAr)
        newAr.push.apply(newAr, arguments)
        this._tasks = newAr
      } else {
        var newAr = Array(arguments.length)
        newAr.push.apply(newAr, arguments)
        this._tasks = newAr
      }
      this.length += arguments.length
    } else { // if single arg (most often case)
      if (len === 1) { this._tasks = [this._tasks, a] } else { this._tasks = a }
      this.length++
    }
  }
  if (this.firstEmitBuildStrategy) { this.call = rebuild_on_first_call } else { this.rebuild() }
}
function removeLast_norebuild (a) {
  if (this.length === 0) { return }
  if (this.length === 1) {
    if (this._tasks === a) {
      this.length = 0
    }
  } else {
    (0, utils_1$1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a))
    if (this._tasks.length === 1) {
      this._tasks = this._tasks[0]
      this.length = 1
    } else { this.length = this._tasks.length }
  }
}
function removeLast_rebuild (a) {
  if (this.length === 0) { return }
  if (this.length === 1) {
    if (this._tasks === a) {
      this.length = 0
    }
    if (this.firstEmitBuildStrategy) {
      this.call = bake_collection_1.BAKED_EMPTY_FUNC
      return
    } else {
      this.rebuild()
      return
    }
  } else {
    (0, utils_1$1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a))
    if (this._tasks.length === 1) {
      this._tasks = this._tasks[0]
      this.length = 1
    } else { this.length = this._tasks.length }
  }
  if (this.firstEmitBuildStrategy) { this.call = rebuild_on_first_call } else { this.rebuild() }
}
function insert_norebuild (index) {
  let _b
  const func = []
  for (let _i = 1; _i < arguments.length; _i++) {
    func[_i - 1] = arguments[_i]
  }
  if (this.length === 0) {
    this._tasks = func
    this.length = 1
  } else if (this.length === 1) {
    func.unshift(this._tasks)
    this._tasks = func
    this.length = this._tasks.length
  } else {
    (_b = this._tasks).splice.apply(_b, __spreadArray$1([index, 0], func, false))
    this.length = this._tasks.length
  }
}
function insert_rebuild (index) {
  let _b
  const func = []
  for (let _i = 1; _i < arguments.length; _i++) {
    func[_i - 1] = arguments[_i]
  }
  if (this.length === 0) {
    this._tasks = func
    this.length = 1
  } else if (this.length === 1) {
    func.unshift(this._tasks)
    this._tasks = func
    this.length = this._tasks.length
  } else {
    (_b = this._tasks).splice.apply(_b, __spreadArray$1([index, 0], func, false))
    this.length = this._tasks.length
  }
  if (this.firstEmitBuildStrategy) { this.call = rebuild_on_first_call } else { this.rebuild() }
}
function rebuild_noawait () {
  if (this.length === 0) { this.call = bake_collection_1.BAKED_EMPTY_FUNC } else if (this.length === 1) { this.call = this._tasks } else { this.call = (0, bake_collection_1.bakeCollection)(this._tasks, this.argsNum) }
}
function rebuild_await () {
  if (this.length === 0) { this.call = bake_collection_1.BAKED_EMPTY_FUNC } else if (this.length === 1) { this.call = this._tasks } else { this.call = (0, bake_collection_1.bakeCollectionAwait)(this._tasks, this.argsNum) }
}
function rebuild_on_first_call () {
  this.rebuild()
  this.call.apply(undefined, arguments)
}
const TaskCollection = /** @class */ (function () {
  function TaskCollection (argsNum, autoRebuild, initialTasks, awaitTasks) {
    if (autoRebuild === void 0) { autoRebuild = true }
    if (initialTasks === void 0) { initialTasks = null }
    if (awaitTasks === void 0) { awaitTasks = false }
    this.awaitTasks = awaitTasks
    this.call = bake_collection_1.BAKED_EMPTY_FUNC
    this.argsNum = argsNum
    this.firstEmitBuildStrategy = true
    if (awaitTasks) { this.rebuild = rebuild_await.bind(this) } else { this.rebuild = rebuild_noawait.bind(this) }
    this.setAutoRebuild(autoRebuild)
    if (initialTasks) {
      if (typeof initialTasks === 'function') {
        this._tasks = initialTasks
        this.length = 1
      } else {
        this._tasks = initialTasks
        this.length = initialTasks.length
      }
    } else {
      this._tasks = null
      this.length = 0
    }
    if (autoRebuild) { this.rebuild() }
  }
  return TaskCollection
}())
taskCollection.TaskCollection = TaskCollection
function fastClear () {
  this._tasks = null
  this.length = 0
  this.call = bake_collection_1.BAKED_EMPTY_FUNC
}
function clear () {
  this._tasks = null
  this.length = 0
  this.call = bake_collection_1.BAKED_EMPTY_FUNC
}
function growArgsNum (argsNum) {
  if (this.argsNum < argsNum) {
    this.argsNum = argsNum
    if (this.firstEmitBuildStrategy) { this.call = rebuild_on_first_call } else { this.rebuild() }
  }
}
function setAutoRebuild (newVal) {
  if (newVal) {
    this.push = push_rebuild.bind(this)
    this.insert = insert_rebuild.bind(this)
    this.removeLast = removeLast_rebuild.bind(this)
  } else {
    this.push = push_norebuild.bind(this)
    this.insert = insert_norebuild.bind(this)
    this.removeLast = removeLast_norebuild.bind(this)
  }
}
function tasksAsArray () {
  if (this.length === 0) { return [] }
  if (this.length === 1) { return [this._tasks] }
  return this._tasks
}
function setTasks (tasks) {
  if (tasks.length === 0) {
    this.length = 0
    this.call = bake_collection_1.BAKED_EMPTY_FUNC
  } else if (tasks.length === 1) {
    this.length = 1
    this.call = tasks[0]
    this._tasks = tasks[0]
  } else {
    this.length = tasks.length
    this._tasks = tasks
    if (this.firstEmitBuildStrategy) { this.call = rebuild_on_first_call } else { this.rebuild() }
  }
}
TaskCollection.prototype.fastClear = fastClear
TaskCollection.prototype.clear = clear
TaskCollection.prototype.growArgsNum = growArgsNum
TaskCollection.prototype.setAutoRebuild = setAutoRebuild
TaskCollection.prototype.tasksAsArray = tasksAsArray
TaskCollection.prototype.setTasks = setTasks;

(function (exports) {
  const __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create
    ? function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    let desc = Object.getOwnPropertyDescriptor(m, k)
	    if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function () { return m[k] } }
	    }
	    Object.defineProperty(o, k2, desc)
    }
    : function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    o[k2] = m[k]
    })
  const __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function (m, exports) {
	    for (const p in m) if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p)
  }
  Object.defineProperty(exports, '__esModule', { value: true })
  __exportStar(taskCollection, exports)
}(taskCollection$1))

const utils$1 = {}

Object.defineProperty(utils$1, '__esModule', { value: true })
utils$1.nullObj = void 0
function nullObj () {
  const x = {}
  x.__proto__ = null
  return x
}
utils$1.nullObj = nullObj

const __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
  if (pack || arguments.length === 2) {
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i)
        ar[i] = from[i]
      }
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from))
}
Object.defineProperty(ee, '__esModule', { value: true })
ee.EventEmitter = void 0
const task_collection_1 = taskCollection$1
const utils_1 = utils$2
const utils_2 = utils$1
function emit (event, a, b, c, d, e) {
  const ev = this.events[event]
  if (ev) {
    if (ev.length === 0) { return false }
    if (ev.argsNum < 6) {
      ev.call(a, b, c, d, e)
    } else {
      const arr = new Array(ev.argsNum)
      for (let i = 0, len = arr.length; i < len; ++i) {
        arr[i] = arguments[i + 1]
      }
      ev.call.apply(undefined, arr)
    }
    return true
  }
  return false
}
function emitHasOnce (event, a, b, c, d, e) {
  const ev = this.events[event]
  let argsArr
  if (ev !== undefined) {
    if (ev.length === 0) { return false }
    if (ev.argsNum < 6) {
      ev.call(a, b, c, d, e)
    } else {
      argsArr = new Array(ev.argsNum)
      for (var i = 0, len = argsArr.length; i < len; ++i) {
        argsArr[i] = arguments[i + 1]
      }
      ev.call.apply(undefined, argsArr)
    }
  }
  const oev = this.onceEvents[event]
  if (oev) {
    if (typeof oev === 'function') {
      this.onceEvents[event] = undefined
      if (arguments.length < 6) {
        oev(a, b, c, d, e)
      } else {
        if (argsArr === undefined) {
          argsArr = new Array(arguments.length - 1)
          for (var i = 0, len = argsArr.length; i < len; ++i) {
            argsArr[i] = arguments[i + 1]
          }
        }
        oev.apply(undefined, argsArr)
      }
    } else {
      const fncs = oev
      this.onceEvents[event] = undefined
      if (arguments.length < 6) {
        for (var i = 0; i < fncs.length; ++i) {
          fncs[i](a, b, c, d, e)
        }
      } else {
        if (argsArr === undefined) {
          argsArr = new Array(arguments.length - 1)
          for (var i = 0, len = argsArr.length; i < len; ++i) {
            argsArr[i] = arguments[i + 1]
          }
        }
        for (var i = 0; i < fncs.length; ++i) {
          fncs[i].apply(undefined, argsArr)
        }
      }
    }
    return true
  }
  return ev !== undefined
}
/** Implemented event emitter */
const EventEmitter = /** @class */ (function () {
  function EventEmitter () {
    this.events = (0, utils_2.nullObj)()
    this.onceEvents = (0, utils_2.nullObj)()
    this._symbolKeys = new Set()
    this.maxListeners = Infinity
  }
  Object.defineProperty(EventEmitter.prototype, '_eventsCount', {
    get: function () {
      return this.eventNames().length
    },
    enumerable: false,
    configurable: true
  })
  return EventEmitter
}())
ee.EventEmitter = EventEmitter
function once (event, listener) {
  if (this.emit === emit) {
    this.emit = emitHasOnce
  }
  switch (typeof this.onceEvents[event]) {
    case 'undefined':
      this.onceEvents[event] = listener
      if (typeof event === 'symbol') { this._symbolKeys.add(event) }
      break
    case 'function':
      this.onceEvents[event] = [this.onceEvents[event], listener]
      break
    case 'object':
      this.onceEvents[event].push(listener)
  }
  return this
}
function addListener (event, listener, argsNum) {
  if (argsNum === void 0) { argsNum = listener.length }
  if (typeof listener !== 'function') { throw new TypeError('The listener must be a function') }
  const evtmap = this.events[event]
  if (!evtmap) {
    this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false)
    if (typeof event === 'symbol') { this._symbolKeys.add(event) }
  } else {
    evtmap.push(listener)
    evtmap.growArgsNum(argsNum)
    if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length) { console.warn('Maximum event listeners for "'.concat(String(event), '" event!')) }
  }
  return this
}
function removeListener (event, listener) {
  const evt = this.events[event]
  if (evt) {
    evt.removeLast(listener)
  }
  const evto = this.onceEvents[event]
  if (evto) {
    if (typeof evto === 'function') {
      this.onceEvents[event] = undefined
    } else if (typeof evto === 'object') {
      if (evto.length === 1 && evto[0] === listener) {
        this.onceEvents[event] = undefined
      } else {
        (0, utils_1._fast_remove_single)(evto, evto.lastIndexOf(listener))
      }
    }
  }
  return this
}
function addListenerBound (event, listener, bindTo, argsNum) {
  if (bindTo === void 0) { bindTo = this }
  if (argsNum === void 0) { argsNum = listener.length }
  if (!this.boundFuncs) { this.boundFuncs = new Map() }
  const bound = listener.bind(bindTo)
  this.boundFuncs.set(listener, bound)
  return this.addListener(event, bound, argsNum)
}
function removeListenerBound (event, listener) {
  let _a, _b
  const bound = (_a = this.boundFuncs) === null || _a === void 0 ? void 0 : _a.get(listener);
  (_b = this.boundFuncs) === null || _b === void 0 ? void 0 : _b.delete(listener)
  return this.removeListener(event, bound)
}
function hasListeners (event) {
  return this.events[event] && !!this.events[event].length
}
function prependListener (event, listener, argsNum) {
  if (argsNum === void 0) { argsNum = listener.length }
  if (typeof listener !== 'function') { throw new TypeError('The listener must be a function') }
  let evtmap = this.events[event]
  if (!evtmap || !(evtmap instanceof task_collection_1.TaskCollection)) {
    evtmap = this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false)
    if (typeof event === 'symbol') { this._symbolKeys.add(event) }
  } else {
    evtmap.insert(0, listener)
    evtmap.growArgsNum(argsNum)
    if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length) { console.warn('Maximum event listeners for "'.concat(String(event), '" event!')) }
  }
  return this
}
function prependOnceListener (event, listener) {
  if (this.emit === emit) {
    this.emit = emitHasOnce
  }
  const evtmap = this.onceEvents[event]
  if (!evtmap) {
    this.onceEvents[event] = [listener]
    if (typeof event === 'symbol') { this._symbolKeys.add(event) }
  } else if (typeof evtmap !== 'object') {
    this.onceEvents[event] = [listener, evtmap]
    if (typeof event === 'symbol') { this._symbolKeys.add(event) }
  } else {
    evtmap.unshift(listener)
    if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length) {
      console.warn('Maximum event listeners for "'.concat(String(event), '" once event!'))
    }
  }
  return this
}
function removeAllListeners (event) {
  if (event === undefined) {
    this.events = (0, utils_2.nullObj)()
    this.onceEvents = (0, utils_2.nullObj)()
    this._symbolKeys = new Set()
  } else {
    this.events[event] = undefined
    this.onceEvents[event] = undefined
    if (typeof event === 'symbol') { this._symbolKeys.delete(event) }
  }
  return this
}
function setMaxListeners (n) {
  this.maxListeners = n
  return this
}
function getMaxListeners () {
  return this.maxListeners
}
function listeners (event) {
  if (this.emit === emit) { return this.events[event] ? this.events[event].tasksAsArray().slice() : [] } else {
    if (this.events[event] && this.onceEvents[event]) {
      return __spreadArray(__spreadArray([], this.events[event].tasksAsArray(), true), (typeof this.onceEvents[event] === 'function' ? [this.onceEvents[event]] : this.onceEvents[event]), true)
    } else if (this.events[event]) { return this.events[event].tasksAsArray() } else if (this.onceEvents[event]) { return (typeof this.onceEvents[event] === 'function' ? [this.onceEvents[event]] : this.onceEvents[event]) } else { return [] }
  }
}
function eventNames () {
  const _this = this
  if (this.emit === emit) {
    var keys = Object.keys(this.events)
    return __spreadArray(__spreadArray([], keys, true), Array.from(this._symbolKeys), true).filter(function (x) { return (x in _this.events) && _this.events[x] && _this.events[x].length })
  } else {
    var keys = Object.keys(this.events).filter(function (x) { return _this.events[x] && _this.events[x].length })
    const keysO = Object.keys(this.onceEvents).filter(function (x) { return _this.onceEvents[x] && _this.onceEvents[x].length })
    return __spreadArray(__spreadArray(__spreadArray([], keys, true), keysO, true), Array.from(this._symbolKeys).filter(function (x) {
      return (((x in _this.events) && _this.events[x] && _this.events[x].length) ||
            ((x in _this.onceEvents) && _this.onceEvents[x] && _this.onceEvents[x].length))
    }), true)
  }
}
function listenerCount (type) {
  if (this.emit === emit) { return this.events[type] && this.events[type].length || 0 } else { return (this.events[type] && this.events[type].length || 0) + (this.onceEvents[type] && this.onceEvents[type].length || 0) }
}
EventEmitter.prototype.emit = emit
EventEmitter.prototype.on = addListener
EventEmitter.prototype.once = once
EventEmitter.prototype.addListener = addListener
EventEmitter.prototype.removeListener = removeListener
EventEmitter.prototype.addListenerBound = addListenerBound
EventEmitter.prototype.removeListenerBound = removeListenerBound
EventEmitter.prototype.hasListeners = hasListeners
EventEmitter.prototype.prependListener = prependListener
EventEmitter.prototype.prependOnceListener = prependOnceListener
EventEmitter.prototype.off = removeListener
EventEmitter.prototype.removeAllListeners = removeAllListeners
EventEmitter.prototype.setMaxListeners = setMaxListeners
EventEmitter.prototype.getMaxListeners = getMaxListeners
EventEmitter.prototype.listeners = listeners
EventEmitter.prototype.eventNames = eventNames
EventEmitter.prototype.listenerCount = listenerCount;

(function (exports) {
  const __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create
    ? function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    let desc = Object.getOwnPropertyDescriptor(m, k)
	    if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function () { return m[k] } }
	    }
	    Object.defineProperty(o, k2, desc)
    }
    : function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    o[k2] = m[k]
    })
  const __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function (m, exports) {
	    for (const p in m) if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p)
  }
  Object.defineProperty(exports, '__esModule', { value: true })
  __exportStar(types, exports)
  __exportStar(ee, exports)
}(lib))

const browser = { exports: {} }

/**
 * Helpers.
 */

let ms
let hasRequiredMs

function requireMs () {
  if (hasRequiredMs) return ms
  hasRequiredMs = 1
  const s = 1000
  const m = s * 60
  const h = m * 60
  const d = h * 24
  const w = d * 7
  const y = d * 365.25

  /**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

  ms = function (val, options) {
	  options = options || {}
	  const type = typeof val
	  if (type === 'string' && val.length > 0) {
	    return parse(val)
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val)
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  )
  }

  /**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

  function parse (str) {
	  str = String(str)
	  if (str.length > 100) {
	    return
	  }
	  const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  )
	  if (!match) {
	    return
	  }
	  const n = parseFloat(match[1])
	  const type = (match[2] || 'ms').toLowerCase()
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n
	    default:
	      return undefined
	  }
  }

  /**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

  function fmtShort (ms) {
	  const msAbs = Math.abs(ms)
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd'
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h'
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm'
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's'
	  }
	  return ms + 'ms'
  }

  /**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

  function fmtLong (ms) {
	  const msAbs = Math.abs(ms)
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day')
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour')
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute')
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second')
	  }
	  return ms + ' ms'
  }

  /**
	 * Pluralization helper.
	 */

  function plural (ms, msAbs, n, name) {
	  const isPlural = msAbs >= n * 1.5
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '')
  }
  return ms
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup (env) {
  createDebug.debug = createDebug
  createDebug.default = createDebug
  createDebug.coerce = coerce
  createDebug.disable = disable
  createDebug.enable = enable
  createDebug.enabled = enabled
  createDebug.humanize = requireMs()
  createDebug.destroy = destroy

  Object.keys(env).forEach(key => {
    createDebug[key] = env[key]
  })

  /**
	* The currently active debug mode names, and names to skip.
	*/

  createDebug.names = []
  createDebug.skips = []

  /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
  createDebug.formatters = {}

  /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
  function selectColor (namespace) {
    let hash = 0

    for (let i = 0; i < namespace.length; i++) {
      hash = ((hash << 5) - hash) + namespace.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length]
  }
  createDebug.selectColor = selectColor

  /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
  function createDebug (namespace) {
    let prevTime
    let enableOverride = null
    let namespacesCache
    let enabledCache

    function debug (...args) {
      // Disabled?
      if (!debug.enabled) {
        return
      }

      const self = debug

      // Set `diff` timestamp
      const curr = Number(new Date())
      const ms = curr - (prevTime || curr)
      self.diff = ms
      self.prev = prevTime
      self.curr = curr
      prevTime = curr

      args[0] = createDebug.coerce(args[0])

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O')
      }

      // Apply any `formatters` transformations
      let index = 0
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return '%'
        }
        index++
        const formatter = createDebug.formatters[format]
        if (typeof formatter === 'function') {
          const val = args[index]
          match = formatter.call(self, val)

          // Now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1)
          index--
        }
        return match
      })

      // Apply env-specific formatting (colors, etc.)
      createDebug.formatArgs.call(self, args)

      const logFn = self.log || createDebug.log
      logFn.apply(self, args)
    }

    debug.namespace = namespace
    debug.useColors = createDebug.useColors()
    debug.color = createDebug.selectColor(namespace)
    debug.extend = extend
    debug.destroy = createDebug.destroy // XXX Temporary. Will be removed in the next major release.

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces
          enabledCache = createDebug.enabled(namespace)
        }

        return enabledCache
      },
      set: v => {
        enableOverride = v
      }
    })

    // Env-specific initialization logic for debug instances
    if (typeof createDebug.init === 'function') {
      createDebug.init(debug)
    }

    return debug
  }

  function extend (namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace)
    newDebug.log = this.log
    return newDebug
  }

  /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
  function enable (namespaces) {
    createDebug.save(namespaces)
    createDebug.namespaces = namespaces

    createDebug.names = []
    createDebug.skips = []

    const split = (typeof namespaces === 'string' ? namespaces : '')
      .trim()
      .replace(' ', ',')
      .split(',')
      .filter(Boolean)

    for (const ns of split) {
      if (ns[0] === '-') {
        createDebug.skips.push(ns.slice(1))
      } else {
        createDebug.names.push(ns)
      }
    }
  }

  /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */
  function matchesTemplate (search, template) {
    let searchIndex = 0
    let templateIndex = 0
    let starIndex = -1
    let matchIndex = 0

    while (searchIndex < search.length) {
      if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
        // Match character or proceed with wildcard
        if (template[templateIndex] === '*') {
          starIndex = templateIndex
          matchIndex = searchIndex
          templateIndex++ // Skip the '*'
        } else {
          searchIndex++
          templateIndex++
        }
      } else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
        // Backtrack to the last '*' and try to match more characters
        templateIndex = starIndex + 1
        matchIndex++
        searchIndex = matchIndex
      } else {
        return false // No match
      }
    }

    // Handle trailing '*' in template
    while (templateIndex < template.length && template[templateIndex] === '*') {
      templateIndex++
    }

    return templateIndex === template.length
  }

  /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
  function disable () {
    const namespaces = [
      ...createDebug.names,
      ...createDebug.skips.map(namespace => '-' + namespace)
    ].join(',')
    createDebug.enable('')
    return namespaces
  }

  /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
  function enabled (name) {
    for (const skip of createDebug.skips) {
      if (matchesTemplate(name, skip)) {
        return false
      }
    }

    for (const ns of createDebug.names) {
      if (matchesTemplate(name, ns)) {
        return true
      }
    }

    return false
  }

  /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
  function coerce (val) {
    if (val instanceof Error) {
      return val.stack || val.message
    }
    return val
  }

  /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
  function destroy () {
    console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
  }

  createDebug.enable(createDebug.load())

  return createDebug
}

const common = setup;

/* eslint-env browser */

(function (module, exports) {
  /**
	 * This is the web browser implementation of `debug()`.
	 */

  exports.formatArgs = formatArgs
  exports.save = save
  exports.load = load
  exports.useColors = useColors
  exports.storage = localstorage()
  exports.destroy = (() => {
    let warned = false

    return () => {
      if (!warned) {
        warned = true
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
      }
    }
  })()

  /**
	 * Colors.
	 */

  exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
  ]

  /**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

  // eslint-disable-next-line complexity
  function useColors () {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
      return true
    }

    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false
    }

    let m

    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
  }

  /**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

  function formatArgs (args) {
    args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff)

    if (!this.useColors) {
      return
    }

    const c = 'color: ' + this.color
    args.splice(1, 0, c, 'color: inherit')

    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0
    let lastC = 0
    args[0].replace(/%[a-zA-Z%]/g, match => {
      if (match === '%%') {
        return
      }
      index++
      if (match === '%c') {
        // We only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index
      }
    })

    args.splice(lastC, 0, c)
  }

  /**
	 * Invokes `console.debug()` when available.
	 * No-op when `console.debug` is not a "function".
	 * If `console.debug` is not available, falls back
	 * to `console.log`.
	 *
	 * @api public
	 */
  exports.log = console.debug || console.log || (() => {})

  /**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
  function save (namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem('debug', namespaces)
      } else {
        exports.storage.removeItem('debug')
      }
    } catch (error) {
      // Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }

  /**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
  function load () {
    let r
    try {
      r = exports.storage.getItem('debug')
    } catch (error) {
      // Swallow
      // XXX (@Qix-) should we be logging these?
    }

    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG
    }

    return r
  }

  /**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

  function localstorage () {
    try {
      // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
      // The Browser also has localStorage in the global context.
      return localStorage
    } catch (error) {
      // Swallow
      // XXX (@Qix-) should we be logging these?
    }
  }

  module.exports = common(exports)

  const { formatters } = module.exports

  /**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

  formatters.j = function (v) {
    try {
      return JSON.stringify(v)
    } catch (error) {
      return '[UnexpectedJSONParseError]: ' + error.message
    }
  }
}(browser, browser.exports))

const browserExports = browser.exports
const createDebug5 = /* @__PURE__ */getDefaultExportFromCjs(browserExports)

function number$2 (n) {
  if (!Number.isSafeInteger(n) || n < 0) { throw new Error(`Wrong positive integer: ${n}`) }
}
function bytes$3 (b, ...lengths) {
  if (!(b instanceof Uint8Array)) { throw new Error('Expected Uint8Array') }
  if (lengths.length > 0 && !lengths.includes(b.length)) { throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`) }
}
function hash$1 (hash) {
  if (typeof hash !== 'function' || typeof hash.create !== 'function') { throw new Error('Hash should be wrapped by utils.wrapConstructor') }
  number$2(hash.outputLen)
  number$2(hash.blockLen)
}
function exists$2 (instance, checkFinished = true) {
  if (instance.destroyed) { throw new Error('Hash instance has been destroyed') }
  if (checkFinished && instance.finished) { throw new Error('Hash#digest() has already been called') }
}
function output$2 (out, instance) {
  bytes$3(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`)
  }
}

const crypto$2 = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined

/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated, we can just drop the import.
const u8a$2 = (a) => a instanceof Uint8Array
// Cast array to view
const createView$3 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength)
// The rotate right (circular right shift) operation for uint32
const rotr$2 = (word, shift) => (word << (32 - shift)) | (word >>> shift)
// big-endian hardware is rare. Just in case someone still decides to run hashes:
// early-throw an error because we don't support BE yet.
const isLE$2 = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44
if (!isLE$2) { throw new Error('Non little-endian hardware is not supported') }
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes$5 (str) {
  if (typeof str !== 'string') { throw new Error(`utf8ToBytes expected string, got ${typeof str}`) }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes$3 (data) {
  if (typeof data === 'string') { data = utf8ToBytes$5(data) }
  if (!u8a$2(data)) { throw new Error(`expected Uint8Array, got ${typeof data}`) }
  return data
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes$4 (...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0))
  let pad = 0 // walk through each item, ensure they have proper type
  arrays.forEach((a) => {
    if (!u8a$2(a)) { throw new Error('Uint8Array expected') }
    r.set(a, pad)
    pad += a.length
  })
  return r
}
// For runtime check if class implements interface
const Hash$2 = class Hash {
  // Safe version that clones internal state
  clone () {
    return this._cloneInto()
  }
}
function wrapConstructor$2 (hashCons) {
  const hashC = (msg) => hashCons().update(toBytes$3(msg)).digest()
  const tmp = hashCons()
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = () => hashCons()
  return hashC
}
/**
 * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
 */
function randomBytes$2 (bytesLength = 32) {
  if (crypto$2 && typeof crypto$2.getRandomValues === 'function') {
    return crypto$2.getRandomValues(new Uint8Array(bytesLength))
  }
  throw new Error('crypto.getRandomValues must be defined')
}

// Polyfill for Safari 14
function setBigUint64$2 (view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === 'function') { return view.setBigUint64(byteOffset, value, isLE) }
  const _32n = BigInt(32)
  const _u32_max = BigInt(0xffffffff)
  const wh = Number((value >> _32n) & _u32_max)
  const wl = Number(value & _u32_max)
  const h = isLE ? 4 : 0
  const l = isLE ? 0 : 4
  view.setUint32(byteOffset + h, wh, isLE)
  view.setUint32(byteOffset + l, wl, isLE)
}
// Base SHA2 class (RFC 6234)
const SHA2$1 = class SHA2 extends Hash$2 {
  constructor (blockLen, outputLen, padOffset, isLE) {
    super()
    this.blockLen = blockLen
    this.outputLen = outputLen
    this.padOffset = padOffset
    this.isLE = isLE
    this.finished = false
    this.length = 0
    this.pos = 0
    this.destroyed = false
    this.buffer = new Uint8Array(blockLen)
    this.view = createView$3(this.buffer)
  }

  update (data) {
    exists$2(this)
    const { view, buffer, blockLen } = this
    data = toBytes$3(data)
    const len = data.length
    for (let pos = 0; pos < len;) {
      const take = Math.min(blockLen - this.pos, len - pos)
      // Fast path: we have at least one block in input, cast it to view and process
      if (take === blockLen) {
        const dataView = createView$3(data)
        for (; blockLen <= len - pos; pos += blockLen) { this.process(dataView, pos) }
        continue
      }
      buffer.set(data.subarray(pos, pos + take), this.pos)
      this.pos += take
      pos += take
      if (this.pos === blockLen) {
        this.process(view, 0)
        this.pos = 0
      }
    }
    this.length += data.length
    this.roundClean()
    return this
  }

  digestInto (out) {
    exists$2(this)
    output$2(out, this)
    this.finished = true
    // Padding
    // We can avoid allocation of buffer for padding completely if it
    // was previously not allocated here. But it won't change performance.
    const { buffer, view, blockLen, isLE } = this
    let { pos } = this
    // append the bit '1' to the message
    buffer[pos++] = 0b10000000
    this.buffer.subarray(pos).fill(0)
    // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0)
      pos = 0
    }
    // Pad until full block byte with zeros
    for (let i = pos; i < blockLen; i++) { buffer[i] = 0 }
    // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
    // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
    // So we just write lowest 64 bits of that value.
    setBigUint64$2(view, blockLen - 8, BigInt(this.length * 8), isLE)
    this.process(view, 0)
    const oview = createView$3(out)
    const len = this.outputLen
    // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
    if (len % 4) { throw new Error('_sha2: outputLen should be aligned to 32bit') }
    const outLen = len / 4
    const state = this.get()
    if (outLen > state.length) { throw new Error('_sha2: outputLen bigger than state') }
    for (let i = 0; i < outLen; i++) { oview.setUint32(4 * i, state[i], isLE) }
  }

  digest () {
    const { buffer, outputLen } = this
    this.digestInto(buffer)
    const res = buffer.slice(0, outputLen)
    this.destroy()
    return res
  }

  _cloneInto (to) {
    to || (to = new this.constructor())
    to.set(...this.get())
    const { blockLen, buffer, length, finished, destroyed, pos } = this
    to.length = length
    to.pos = pos
    to.finished = finished
    to.destroyed = destroyed
    if (length % blockLen) { to.buffer.set(buffer) }
    return to
  }
}

// SHA2-256 need to try 2^128 hashes to execute birthday attack.
// BTC network is doing 2^67 hashes/sec as per early 2023.
// Choice: a ? b : c
const Chi$2 = (a, b, c) => (a & b) ^ (~a & c)
// Majority function, true if any two inpust is true
const Maj$2 = (a, b, c) => (a & b) ^ (a & c) ^ (b & c)
// Round constants:
// first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
// prettier-ignore
const SHA256_K$2 = /* @__PURE__ */ new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
])
// Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
// prettier-ignore
const IV$1 = /* @__PURE__ */ new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
])
// Temporary buffer, not used to store anything between runs
// Named this way because it matches specification.
const SHA256_W$2 = /* @__PURE__ */ new Uint32Array(64)
const SHA256$2 = class SHA256 extends SHA2$1 {
  constructor () {
    super(64, 32, 8, false)
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    this.A = IV$1[0] | 0
    this.B = IV$1[1] | 0
    this.C = IV$1[2] | 0
    this.D = IV$1[3] | 0
    this.E = IV$1[4] | 0
    this.F = IV$1[5] | 0
    this.G = IV$1[6] | 0
    this.H = IV$1[7] | 0
  }

  get () {
    const { A, B, C, D, E, F, G, H } = this
    return [A, B, C, D, E, F, G, H]
  }

  // prettier-ignore
  set (A, B, C, D, E, F, G, H) {
    this.A = A | 0
    this.B = B | 0
    this.C = C | 0
    this.D = D | 0
    this.E = E | 0
    this.F = F | 0
    this.G = G | 0
    this.H = H | 0
  }

  process (view, offset) {
    // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
    for (let i = 0; i < 16; i++, offset += 4) { SHA256_W$2[i] = view.getUint32(offset, false) }
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W$2[i - 15]
      const W2 = SHA256_W$2[i - 2]
      const s0 = rotr$2(W15, 7) ^ rotr$2(W15, 18) ^ (W15 >>> 3)
      const s1 = rotr$2(W2, 17) ^ rotr$2(W2, 19) ^ (W2 >>> 10)
      SHA256_W$2[i] = (s1 + SHA256_W$2[i - 7] + s0 + SHA256_W$2[i - 16]) | 0
    }
    // Compression function main loop, 64 rounds
    let { A, B, C, D, E, F, G, H } = this
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr$2(E, 6) ^ rotr$2(E, 11) ^ rotr$2(E, 25)
      const T1 = (H + sigma1 + Chi$2(E, F, G) + SHA256_K$2[i] + SHA256_W$2[i]) | 0
      const sigma0 = rotr$2(A, 2) ^ rotr$2(A, 13) ^ rotr$2(A, 22)
      const T2 = (sigma0 + Maj$2(A, B, C)) | 0
      H = G
      G = F
      F = E
      E = (D + T1) | 0
      D = C
      C = B
      B = A
      A = (T1 + T2) | 0
    }
    // Add the compressed chunk to the current hash value
    A = (A + this.A) | 0
    B = (B + this.B) | 0
    C = (C + this.C) | 0
    D = (D + this.D) | 0
    E = (E + this.E) | 0
    F = (F + this.F) | 0
    G = (G + this.G) | 0
    H = (H + this.H) | 0
    this.set(A, B, C, D, E, F, G, H)
  }

  roundClean () {
    SHA256_W$2.fill(0)
  }

  destroy () {
    this.set(0, 0, 0, 0, 0, 0, 0, 0)
    this.buffer.fill(0)
  }
}
/**
 * SHA2-256 hash function
 * @param message - data that would be hashed
 */
const sha256$2 = /* @__PURE__ */ wrapConstructor$2(() => new SHA256$2())

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// 100 lines of code in the file are duplicated from noble-hashes (utils).
// This is OK: `abstract` directory does not use noble-hashes.
// User may opt-in into using different hashing library. This way, noble-hashes
// won't be included into their bundle.
const _0n$9 = BigInt(0)
const _1n$9 = BigInt(1)
const _2n$5 = BigInt(2)
const u8a$1 = (a) => a instanceof Uint8Array
const hexes$3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'))
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex$3 (bytes) {
  if (!u8a$1(bytes)) { throw new Error('Uint8Array expected') }
  // pre-caching improves the speed 6x
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes$3[bytes[i]]
  }
  return hex
}
function numberToHexUnpadded$1 (num) {
  const hex = num.toString(16)
  return hex.length & 1 ? `0${hex}` : hex
}
function hexToNumber$1 (hex) {
  if (typeof hex !== 'string') { throw new Error('hex string expected, got ' + typeof hex) }
  // Big Endian
  return BigInt(hex === '' ? '0' : `0x${hex}`)
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes$2 (hex) {
  if (typeof hex !== 'string') { throw new Error('hex string expected, got ' + typeof hex) }
  const len = hex.length
  if (len % 2) { throw new Error('padded hex string expected, got unpadded hex of length ' + len) }
  const array = new Uint8Array(len / 2)
  for (let i = 0; i < array.length; i++) {
    const j = i * 2
    const hexByte = hex.slice(j, j + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0) { throw new Error('Invalid byte sequence') }
    array[i] = byte
  }
  return array
}
// BE: Big Endian, LE: Little Endian
function bytesToNumberBE$1 (bytes) {
  return hexToNumber$1(bytesToHex$3(bytes))
}
function bytesToNumberLE$1 (bytes) {
  if (!u8a$1(bytes)) { throw new Error('Uint8Array expected') }
  return hexToNumber$1(bytesToHex$3(Uint8Array.from(bytes).reverse()))
}
function numberToBytesBE$1 (n, len) {
  return hexToBytes$2(n.toString(16).padStart(len * 2, '0'))
}
function numberToBytesLE$1 (n, len) {
  return numberToBytesBE$1(n, len).reverse()
}
// Unpadded, rarely used
function numberToVarBytesBE$1 (n) {
  return hexToBytes$2(numberToHexUnpadded$1(n))
}
/**
 * Takes hex string or Uint8Array, converts to Uint8Array.
 * Validates output length.
 * Will throw error for other types.
 * @param title descriptive title for an error e.g. 'private key'
 * @param hex hex string or Uint8Array
 * @param expectedLength optional, will compare to result array's length
 * @returns
 */
function ensureBytes$1 (title, hex, expectedLength) {
  let res
  if (typeof hex === 'string') {
    try {
      res = hexToBytes$2(hex)
    } catch (e) {
      throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`)
    }
  } else if (u8a$1(hex)) {
    // Uint8Array.from() instead of hash.slice() because node.js Buffer
    // is instance of Uint8Array, and its slice() creates **mutable** copy
    res = Uint8Array.from(hex)
  } else {
    throw new Error(`${title} must be hex string or Uint8Array`)
  }
  const len = res.length
  if (typeof expectedLength === 'number' && len !== expectedLength) { throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`) }
  return res
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes$3 (...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0))
  let pad = 0 // walk through each item, ensure they have proper type
  arrays.forEach((a) => {
    if (!u8a$1(a)) { throw new Error('Uint8Array expected') }
    r.set(a, pad)
    pad += a.length
  })
  return r
}
function equalBytes$2 (b1, b2) {
  // We don't care about timing attacks here
  if (b1.length !== b2.length) { return false }
  for (let i = 0; i < b1.length; i++) {
    if (b1[i] !== b2[i]) { return false }
  }
  return true
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes$4 (str) {
  if (typeof str !== 'string') { throw new Error(`utf8ToBytes expected string, got ${typeof str}`) }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
// Bit operations
/**
 * Calculates amount of bits in a bigint.
 * Same as `n.toString(2).length`
 */
function bitLen$1 (n) {
  let len
  for (len = 0; n > _0n$9; n >>= _1n$9, len += 1)
    ;
  return len
}
/**
 * Gets single bit at position.
 * NOTE: first bit position is 0 (same as arrays)
 * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
 */
function bitGet$1 (n, pos) {
  return (n >> BigInt(pos)) & _1n$9
}
/**
 * Sets single bit at position.
 */
const bitSet$1 = (n, pos, value) => {
  return n | ((value ? _1n$9 : _0n$9) << BigInt(pos))
}
/**
 * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
 * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
 */
const bitMask$1 = (n) => (_2n$5 << BigInt(n - 1)) - _1n$9
// DRBG
const u8n$1 = (data) => new Uint8Array(data) // creates Uint8Array
const u8fr$1 = (arr) => Uint8Array.from(arr) // another shortcut
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
function createHmacDrbg$1 (hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== 'number' || hashLen < 2) { throw new Error('hashLen must be a number') }
  if (typeof qByteLen !== 'number' || qByteLen < 2) { throw new Error('qByteLen must be a number') }
  if (typeof hmacFn !== 'function') { throw new Error('hmacFn must be a function') }
  // Step B, Step C: set hashLen to 8*ceil(hlen/8)
  let v = u8n$1(hashLen) // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
  let k = u8n$1(hashLen) // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
  let i = 0 // Iterations counter, will throw when over 1000
  const reset = () => {
    v.fill(1)
    k.fill(0)
    i = 0
  }
  const h = (...b) => hmacFn(k, v, ...b) // hmac(k)(v, ...values)
  const reseed = (seed = u8n$1()) => {
    // HMAC-DRBG reseed() function. Steps D-G
    k = h(u8fr$1([0x00]), seed) // k = hmac(k || v || 0x00 || seed)
    v = h() // v = hmac(k || v)
    if (seed.length === 0) { return }
    k = h(u8fr$1([0x01]), seed) // k = hmac(k || v || 0x01 || seed)
    v = h() // v = hmac(k || v)
  }
  const gen = () => {
    // HMAC-DRBG generate() function
    if (i++ >= 1000) { throw new Error('drbg: tried 1000 values') }
    let len = 0
    const out = []
    while (len < qByteLen) {
      v = h()
      const sl = v.slice()
      out.push(sl)
      len += v.length
    }
    return concatBytes$3(...out)
  }
  const genUntil = (seed, pred) => {
    reset()
    reseed(seed) // Steps D-G
    let res // Step H: grind until k is in [1..n-1]
    while (!(res = pred(gen()))) { reseed() }
    reset()
    return res
  }
  return genUntil
}
// Validating curves and fields
const validatorFns$1 = {
  bigint: (val) => typeof val === 'bigint',
  function: (val) => typeof val === 'function',
  boolean: (val) => typeof val === 'boolean',
  string: (val) => typeof val === 'string',
  stringOrUint8Array: (val) => typeof val === 'string' || val instanceof Uint8Array,
  isSafeInteger: (val) => Number.isSafeInteger(val),
  array: (val) => Array.isArray(val),
  field: (val, object) => object.Fp.isValid(val),
  hash: (val) => typeof val === 'function' && Number.isSafeInteger(val.outputLen)
}
// type Record<K extends string | number | symbol, T> = { [P in K]: T; }
function validateObject$1 (object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns$1[type]
    if (typeof checkVal !== 'function') { throw new Error(`Invalid validator "${type}", expected function`) }
    const val = object[fieldName]
    if (isOptional && val === undefined) { return }
    if (!checkVal(val, object)) {
      throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`)
    }
  }
  for (const [fieldName, type] of Object.entries(validators)) { checkField(fieldName, type, false) }
  for (const [fieldName, type] of Object.entries(optValidators)) { checkField(fieldName, type, true) }
  return object
}
// validate type tests
// const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
// const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
// // Should fail type-check
// const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
// const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
// const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
// const z4 = validateObject(o, { a: 'boolean', z: 'bug' });

const ut$1 = /* #__PURE__ */Object.freeze({
  __proto__: null,
  bitGet: bitGet$1,
  bitLen: bitLen$1,
  bitMask: bitMask$1,
  bitSet: bitSet$1,
  bytesToHex: bytesToHex$3,
  bytesToNumberBE: bytesToNumberBE$1,
  bytesToNumberLE: bytesToNumberLE$1,
  concatBytes: concatBytes$3,
  createHmacDrbg: createHmacDrbg$1,
  ensureBytes: ensureBytes$1,
  equalBytes: equalBytes$2,
  hexToBytes: hexToBytes$2,
  hexToNumber: hexToNumber$1,
  numberToBytesBE: numberToBytesBE$1,
  numberToBytesLE: numberToBytesLE$1,
  numberToHexUnpadded: numberToHexUnpadded$1,
  numberToVarBytesBE: numberToVarBytesBE$1,
  utf8ToBytes: utf8ToBytes$4,
  validateObject: validateObject$1
})

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// Utilities for modular arithmetics and finite fields
// prettier-ignore
const _0n$8 = BigInt(0); const _1n$8 = BigInt(1); const _2n$4 = BigInt(2); const _3n$3 = BigInt(3)
// prettier-ignore
const _4n$1 = BigInt(4); const _5n$1 = BigInt(5); const _8n$1 = BigInt(8)
// prettier-ignore
BigInt(9); BigInt(16)
// Calculates a modulo b
function mod$1 (a, b) {
  const result = a % b
  return result >= _0n$8 ? result : b + result
}
/**
 * Efficiently raise num to power and do modular division.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 * @example
 * pow(2n, 6n, 11n) // 64n % 11n == 9n
 */
// TODO: use field version && remove
function pow$1 (num, power, modulo) {
  if (modulo <= _0n$8 || power < _0n$8) { throw new Error('Expected power/modulo > 0') }
  if (modulo === _1n$8) { return _0n$8 }
  let res = _1n$8
  while (power > _0n$8) {
    if (power & _1n$8) { res = (res * num) % modulo }
    num = (num * num) % modulo
    power >>= _1n$8
  }
  return res
}
// Does x ^ (2 ^ power) mod p. pow2(30, 4) == 30 ^ (2 ^ 4)
function pow2$1 (x, power, modulo) {
  let res = x
  while (power-- > _0n$8) {
    res *= res
    res %= modulo
  }
  return res
}
// Inverses number over modulo
function invert$1 (number, modulo) {
  if (number === _0n$8 || modulo <= _0n$8) {
    throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`)
  }
  // Euclidean GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
  // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.
  let a = mod$1(number, modulo)
  let b = modulo
  // prettier-ignore
  let x = _0n$8; let u = _1n$8
  while (a !== _0n$8) {
    // JIT applies optimization if those two lines follow each other
    const q = b / a
    const r = b % a
    const m = x - u * q
    // prettier-ignore
    b = a, a = r, x = u, u = m
  }
  const gcd = b
  if (gcd !== _1n$8) { throw new Error('invert: does not exist') }
  return mod$1(x, modulo)
}
/**
 * Tonelli-Shanks square root search algorithm.
 * 1. https://eprint.iacr.org/2012/685.pdf (page 12)
 * 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
 * Will start an infinite loop if field order P is not prime.
 * @param P field order
 * @returns function that takes field Fp (created from P) and number n
 */
function tonelliShanks$1 (P) {
  // Legendre constant: used to calculate Legendre symbol (a | p),
  // which denotes the value of a^((p-1)/2) (mod p).
  // (a | p) ≡ 1    if a is a square (mod p)
  // (a | p) ≡ -1   if a is not a square (mod p)
  // (a | p) ≡ 0    if a ≡ 0 (mod p)
  const legendreC = (P - _1n$8) / _2n$4
  let Q, S, Z
  // Step 1: By factoring out powers of 2 from p - 1,
  // find q and s such that p - 1 = q*(2^s) with q odd
  for (Q = P - _1n$8, S = 0; Q % _2n$4 === _0n$8; Q /= _2n$4, S++)
    ;
    // Step 2: Select a non-square z such that (z | p) ≡ -1 and set c ≡ zq
  for (Z = _2n$4; Z < P && pow$1(Z, legendreC, P) !== P - _1n$8; Z++)
    ;
    // Fast-path
  if (S === 1) {
    const p1div4 = (P + _1n$8) / _4n$1
    return function tonelliFast (Fp, n) {
      const root = Fp.pow(n, p1div4)
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Slow-path
  const Q1div2 = (Q + _1n$8) / _2n$4
  return function tonelliSlow (Fp, n) {
    // Step 0: Check that n is indeed a square: (n | p) should not be ≡ -1
    if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE)) { throw new Error('Cannot find square root') }
    let r = S
    // TODO: will fail at Fp2/etc
    let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q) // will update both x and b
    let x = Fp.pow(n, Q1div2) // first guess at the square root
    let b = Fp.pow(n, Q) // first guess at the fudge factor
    while (!Fp.eql(b, Fp.ONE)) {
      if (Fp.eql(b, Fp.ZERO)) { return Fp.ZERO } // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm (4. If t = 0, return r = 0)
      // Find m such b^(2^m)==1
      let m = 1
      for (let t2 = Fp.sqr(b); m < r; m++) {
        if (Fp.eql(t2, Fp.ONE)) { break }
        t2 = Fp.sqr(t2) // t2 *= t2
      }
      // NOTE: r-m-1 can be bigger than 32, need to convert to bigint before shift, otherwise there will be overflow
      const ge = Fp.pow(g, _1n$8 << BigInt(r - m - 1)) // ge = 2^(r-m-1)
      g = Fp.sqr(ge) // g = ge * ge
      x = Fp.mul(x, ge) // x *= ge
      b = Fp.mul(b, g) // b *= g
      r = m
    }
    return x
  }
}
function FpSqrt$1 (P) {
  // NOTE: different algorithms can give different roots, it is up to user to decide which one they want.
  // For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
  // P ≡ 3 (mod 4)
  // √n = n^((P+1)/4)
  if (P % _4n$1 === _3n$3) {
    // Not all roots possible!
    // const ORDER =
    //   0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
    // const NUM = 72057594037927816n;
    const p1div4 = (P + _1n$8) / _4n$1
    return function sqrt3mod4 (Fp, n) {
      const root = Fp.pow(n, p1div4)
      // Throw if root**2 != n
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Atkin algorithm for q ≡ 5 (mod 8), https://eprint.iacr.org/2012/685.pdf (page 10)
  if (P % _8n$1 === _5n$1) {
    const c1 = (P - _5n$1) / _8n$1
    return function sqrt5mod8 (Fp, n) {
      const n2 = Fp.mul(n, _2n$4)
      const v = Fp.pow(n2, c1)
      const nv = Fp.mul(n, v)
      const i = Fp.mul(Fp.mul(nv, _2n$4), v)
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE))
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Other cases: Tonelli-Shanks algorithm
  return tonelliShanks$1(P)
}
// prettier-ignore
const FIELD_FIELDS$1 = [
  'create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr',
  'eql', 'add', 'sub', 'mul', 'pow', 'div',
  'addN', 'subN', 'mulN', 'sqrN'
]
function validateField$1 (field) {
  const initial = {
    ORDER: 'bigint',
    MASK: 'bigint',
    BYTES: 'isSafeInteger',
    BITS: 'isSafeInteger'
  }
  const opts = FIELD_FIELDS$1.reduce((map, val) => {
    map[val] = 'function'
    return map
  }, initial)
  return validateObject$1(field, opts)
}
// Generic field functions
/**
 * Same as `pow` but for Fp: non-constant-time.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 */
function FpPow$1 (f, num, power) {
  // Should have same speed as pow for bigints
  // TODO: benchmark!
  if (power < _0n$8) { throw new Error('Expected power > 0') }
  if (power === _0n$8) { return f.ONE }
  if (power === _1n$8) { return num }
  let p = f.ONE
  let d = num
  while (power > _0n$8) {
    if (power & _1n$8) { p = f.mul(p, d) }
    d = f.sqr(d)
    power >>= _1n$8
  }
  return p
}
/**
 * Efficiently invert an array of Field elements.
 * `inv(0)` will return `undefined` here: make sure to throw an error.
 */
function FpInvertBatch$1 (f, nums) {
  const tmp = new Array(nums.length)
  // Walk from first to last, multiply them by each other MOD p
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (f.is0(num)) { return acc }
    tmp[i] = acc
    return f.mul(acc, num)
  }, f.ONE)
  // Invert last element
  const inverted = f.inv(lastMultiplied)
  // Walk from last to first, multiply them by inverted each other MOD p
  nums.reduceRight((acc, num, i) => {
    if (f.is0(num)) { return acc }
    tmp[i] = f.mul(acc, tmp[i])
    return f.mul(acc, num)
  }, inverted)
  return tmp
}
// CURVE.n lengths
function nLength$1 (n, nBitLength) {
  // Bit size, byte size of CURVE.n
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length
  const nByteLength = Math.ceil(_nBitLength / 8)
  return { nBitLength: _nBitLength, nByteLength }
}
/**
 * Initializes a finite field over prime. **Non-primes are not supported.**
 * Do not init in loop: slow. Very fragile: always run a benchmark on a change.
 * Major performance optimizations:
 * * a) denormalized operations like mulN instead of mul
 * * b) same object shape: never add or remove keys
 * * c) Object.freeze
 * @param ORDER prime positive bigint
 * @param bitLen how many bits the field consumes
 * @param isLE (def: false) if encoding / decoding should be in little-endian
 * @param redef optional faster redefinitions of sqrt and other methods
 */
function Field$1 (ORDER, bitLen, isLE = false, redef = {}) {
  if (ORDER <= _0n$8) { throw new Error(`Expected Field ORDER > 0, got ${ORDER}`) }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength$1(ORDER, bitLen)
  if (BYTES > 2048) { throw new Error('Field lengths over 2048 bytes are not supported') }
  const sqrtP = FpSqrt$1(ORDER)
  const f = Object.freeze({
    ORDER,
    BITS,
    BYTES,
    MASK: bitMask$1(BITS),
    ZERO: _0n$8,
    ONE: _1n$8,
    create: (num) => mod$1(num, ORDER),
    isValid: (num) => {
      if (typeof num !== 'bigint') { throw new Error(`Invalid field element: expected bigint, got ${typeof num}`) }
      return _0n$8 <= num && num < ORDER // 0 is valid element, but it's not invertible
    },
    is0: (num) => num === _0n$8,
    isOdd: (num) => (num & _1n$8) === _1n$8,
    neg: (num) => mod$1(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod$1(num * num, ORDER),
    add: (lhs, rhs) => mod$1(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod$1(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod$1(lhs * rhs, ORDER),
    pow: (num, power) => FpPow$1(f, num, power),
    div: (lhs, rhs) => mod$1(lhs * invert$1(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert$1(num, ORDER),
    sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
    invertBatch: (lst) => FpInvertBatch$1(f, lst),
    // TODO: do we really need constant cmov?
    // We don't have const-time bigints anyway, so probably will be not very useful
    cmov: (a, b, c) => (c ? b : a),
    toBytes: (num) => (isLE ? numberToBytesLE$1(num, BYTES) : numberToBytesBE$1(num, BYTES)),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES) { throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes.length}`) }
      return isLE ? bytesToNumberLE$1(bytes) : bytesToNumberBE$1(bytes)
    }
  })
  return Object.freeze(f)
}
/**
 * Returns total number of bytes consumed by the field element.
 * For example, 32 bytes for usual 256-bit weierstrass curve.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of field
 */
function getFieldBytesLength$1 (fieldOrder) {
  if (typeof fieldOrder !== 'bigint') { throw new Error('field order must be bigint') }
  const bitLength = fieldOrder.toString(2).length
  return Math.ceil(bitLength / 8)
}
/**
 * Returns minimal amount of bytes that can be safely reduced
 * by field order.
 * Should be 2^-128 for 128-bit curve such as P256.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of target hash
 */
function getMinHashLength$1 (fieldOrder) {
  const length = getFieldBytesLength$1(fieldOrder)
  return length + Math.ceil(length / 2)
}
/**
 * "Constant-time" private key generation utility.
 * Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
 * and convert them into private scalar, with the modulo bias being negligible.
 * Needs at least 48 bytes of input for 32-byte private key.
 * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
 * FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
 * RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
 * @param hash hash output from SHA3 or a similar function
 * @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
 * @param isLE interpret hash bytes as LE num
 * @returns valid private scalar
 */
function mapHashToField$1 (key, fieldOrder, isLE = false) {
  const len = key.length
  const fieldLen = getFieldBytesLength$1(fieldOrder)
  const minLen = getMinHashLength$1(fieldOrder)
  // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
  if (len < 16 || len < minLen || len > 1024) { throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`) }
  const num = isLE ? bytesToNumberBE$1(key) : bytesToNumberLE$1(key)
  // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
  const reduced = mod$1(num, fieldOrder - _1n$8) + _1n$8
  return isLE ? numberToBytesLE$1(reduced, fieldLen) : numberToBytesBE$1(reduced, fieldLen)
}

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// Abelian group utilities
const _0n$7 = BigInt(0)
const _1n$7 = BigInt(1)
// Elliptic curve multiplication of Point by scalar. Fragile.
// Scalars should always be less than curve order: this should be checked inside of a curve itself.
// Creates precomputation tables for fast multiplication:
// - private scalar is split by fixed size windows of W bits
// - every window point is collected from window's table & added to accumulator
// - since windows are different, same point inside tables won't be accessed more than once per calc
// - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
// - +1 window is neccessary for wNAF
// - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
// TODO: Research returning 2d JS array of windows, instead of a single window. This would allow
// windows to be in different memory locations
function wNAF$1 (c, bits) {
  const constTimeNegate = (condition, item) => {
    const neg = item.negate()
    return condition ? neg : item
  }
  const opts = (W) => {
    const windows = Math.ceil(bits / W) + 1 // +1, because
    const windowSize = 2 ** (W - 1) // -1 because we skip zero
    return { windows, windowSize }
  }
  return {
    constTimeNegate,
    // non-const time multiplication ladder
    unsafeLadder (elm, n) {
      let p = c.ZERO
      let d = elm
      while (n > _0n$7) {
        if (n & _1n$7) { p = p.add(d) }
        d = d.double()
        n >>= _1n$7
      }
      return p
    },
    /**
         * Creates a wNAF precomputation window. Used for caching.
         * Default window size is set by `utils.precompute()` and is equal to 8.
         * Number of precomputed points depends on the curve size:
         * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
         * - 𝑊 is the window size
         * - 𝑛 is the bitlength of the curve order.
         * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
         * @returns precomputed point tables flattened to a single array
         */
    precomputeWindow (elm, W) {
      const { windows, windowSize } = opts(W)
      const points = []
      let p = elm
      let base = p
      for (let window = 0; window < windows; window++) {
        base = p
        points.push(base)
        // =1, because we skip zero
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p)
          points.push(base)
        }
        p = base.double()
      }
      return points
    },
    /**
         * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
         * @param W window size
         * @param precomputes precomputed tables
         * @param n scalar (we don't check here, but should be less than curve order)
         * @returns real and fake (for const-time) points
         */
    wNAF (W, precomputes, n) {
      // TODO: maybe check that scalar is less than group order? wNAF behavious is undefined otherwise
      // But need to carefully remove other checks before wNAF. ORDER == bits here
      const { windows, windowSize } = opts(W)
      let p = c.ZERO
      let f = c.BASE
      const mask = BigInt(2 ** W - 1) // Create mask with W ones: 0b1111 for W=4 etc.
      const maxNumber = 2 ** W
      const shiftBy = BigInt(W)
      for (let window = 0; window < windows; window++) {
        const offset = window * windowSize
        // Extract W bits.
        let wbits = Number(n & mask)
        // Shift number by W bits.
        n >>= shiftBy
        // If the bits are bigger than max size, we'll split those.
        // +224 => 256 - 32
        if (wbits > windowSize) {
          wbits -= maxNumber
          n += _1n$7
        }
        // This code was first written with assumption that 'f' and 'p' will never be infinity point:
        // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
        // there is negate now: it is possible that negated element from low value
        // would be the same as high element, which will create carry into next window.
        // It's not obvious how this can fail, but still worth investigating later.
        // Check if we're onto Zero point.
        // Add random point inside current window to f.
        const offset1 = offset
        const offset2 = offset + Math.abs(wbits) - 1 // -1 because we skip zero
        const cond1 = window % 2 !== 0
        const cond2 = wbits < 0
        if (wbits === 0) {
          // The most important part for const-time getPublicKey
          f = f.add(constTimeNegate(cond1, precomputes[offset1]))
        } else {
          p = p.add(constTimeNegate(cond2, precomputes[offset2]))
        }
      }
      // JIT-compiler should not eliminate f here, since it will later be used in normalizeZ()
      // Even if the variable is still unused, there are some checks which will
      // throw an exception, so compiler needs to prove they won't happen, which is hard.
      // At this point there is a way to F be infinity-point even if p is not,
      // which makes it less const-time: around 1 bigint multiply.
      return { p, f }
    },
    wNAFCached (P, precomputesMap, n, transform) {
      // @ts-ignore
      const W = P._WINDOW_SIZE || 1
      // Calculate precomputes on a first run, reuse them after
      let comp = precomputesMap.get(P)
      if (!comp) {
        comp = this.precomputeWindow(P, W)
        if (W !== 1) {
          precomputesMap.set(P, transform(comp))
        }
      }
      return this.wNAF(W, comp, n)
    }
  }
}
function validateBasic$1 (curve) {
  validateField$1(curve.Fp)
  validateObject$1(curve, {
    n: 'bigint',
    h: 'bigint',
    Gx: 'field',
    Gy: 'field'
  }, {
    nBitLength: 'isSafeInteger',
    nByteLength: 'isSafeInteger'
  })
  // Set defaults
  return Object.freeze({
    ...nLength$1(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  })
}

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// Short Weierstrass curve. The formula is: y² = x³ + ax + b
function validatePointOpts$1 (curve) {
  const opts = validateBasic$1(curve)
  validateObject$1(opts, {
    a: 'field',
    b: 'field'
  }, {
    allowedPrivateKeyLengths: 'array',
    wrapPrivateKey: 'boolean',
    isTorsionFree: 'function',
    clearCofactor: 'function',
    allowInfinityPoint: 'boolean',
    fromBytes: 'function',
    toBytes: 'function'
  })
  const { endo, Fp, a } = opts
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error('Endomorphism can only be defined for Koblitz curves that have a=0')
    }
    if (typeof endo !== 'object' ||
            typeof endo.beta !== 'bigint' ||
            typeof endo.splitScalar !== 'function') {
      throw new Error('Expected endomorphism with beta: bigint and splitScalar: function')
    }
  }
  return Object.freeze({ ...opts })
}
// ASN.1 DER encoding utilities
const { bytesToNumberBE: b2n$1, hexToBytes: h2b$1 } = ut$1
const DER$1 = {
  // asn.1 DER encoding utils
  Err: class DERErr extends Error {
    constructor (m = '') {
      super(m)
    }
  },
  _parseInt (data) {
    const { Err: E } = DER$1
    if (data.length < 2 || data[0] !== 0x02) { throw new E('Invalid signature integer tag') }
    const len = data[1]
    const res = data.subarray(2, len + 2)
    if (!len || res.length !== len) { throw new E('Invalid signature integer: wrong length') }
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    if (res[0] & 0b10000000) { throw new E('Invalid signature integer: negative') }
    if (res[0] === 0x00 && !(res[1] & 0b10000000)) { throw new E('Invalid signature integer: unnecessary leading zero') }
    return { d: b2n$1(res), l: data.subarray(len + 2) } // d is data, l is left
  },
  toSig (hex) {
    // parse DER signature
    const { Err: E } = DER$1
    const data = typeof hex === 'string' ? h2b$1(hex) : hex
    if (!(data instanceof Uint8Array)) { throw new Error('ui8a expected') }
    const l = data.length
    if (l < 2 || data[0] != 0x30) { throw new E('Invalid signature tag') }
    if (data[1] !== l - 2) { throw new E('Invalid signature: incorrect length') }
    const { d: r, l: sBytes } = DER$1._parseInt(data.subarray(2))
    const { d: s, l: rBytesLeft } = DER$1._parseInt(sBytes)
    if (rBytesLeft.length) { throw new E('Invalid signature: left bytes after parsing') }
    return { r, s }
  },
  hexFromSig (sig) {
    // Add leading zero if first byte has negative bit enabled. More details in '_parseInt'
    const slice = (s) => (Number.parseInt(s[0], 16) & 0b1000 ? '00' + s : s)
    const h = (num) => {
      const hex = num.toString(16)
      return hex.length & 1 ? `0${hex}` : hex
    }
    const s = slice(h(sig.s))
    const r = slice(h(sig.r))
    const shl = s.length / 2
    const rhl = r.length / 2
    const sl = h(shl)
    const rl = h(rhl)
    return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`
  }
}
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const _0n$6 = BigInt(0); const _1n$6 = BigInt(1); BigInt(2); const _3n$2 = BigInt(3); BigInt(4)
function weierstrassPoints$1 (opts) {
  const CURVE = validatePointOpts$1(opts)
  const { Fp } = CURVE // All curves has same field / group length as for now, but they can differ
  const toBytes = CURVE.toBytes ||
        ((_c, point, _isCompressed) => {
          const a = point.toAffine()
          return concatBytes$3(Uint8Array.from([0x04]), Fp.toBytes(a.x), Fp.toBytes(a.y))
        })
  const fromBytes = CURVE.fromBytes ||
        ((bytes) => {
          // const head = bytes[0];
          const tail = bytes.subarray(1)
          // if (head !== 0x04) throw new Error('Only non-compressed encoding is supported');
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
          return { x, y }
        })
  /**
     * y² = x³ + ax + b: Short weierstrass curve formula
     * @returns y²
     */
  function weierstrassEquation (x) {
    const { a, b } = CURVE
    const x2 = Fp.sqr(x) // x * x
    const x3 = Fp.mul(x2, x) // x2 * x
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b) // x3 + a * x + b
  }
  // Validate whether the passed curve params are valid.
  // We check if curve equation works for generator point.
  // `assertValidity()` won't work: `isTorsionFree()` is not available at this point in bls12-381.
  // ProjectivePoint class has not been initialized yet.
  if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx))) { throw new Error('bad generator point: equation left != right') }
  // Valid group elements reside in range 1..n-1
  function isWithinCurveOrder (num) {
    return typeof num === 'bigint' && _0n$6 < num && num < CURVE.n
  }
  function assertGE (num) {
    if (!isWithinCurveOrder(num)) { throw new Error('Expected valid bigint: 0 < bigint < curve.n') }
  }
  // Validates if priv key is valid and converts it to bigint.
  // Supports options allowedPrivateKeyLengths and wrapPrivateKey.
  function normPrivateKeyToScalar (key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n } = CURVE
    if (lengths && typeof key !== 'bigint') {
      if (key instanceof Uint8Array) { key = bytesToHex$3(key) }
      // Normalize to hex string, pad. E.g. P521 would norm 130-132 char hex to 132-char bytes
      if (typeof key !== 'string' || !lengths.includes(key.length)) { throw new Error('Invalid key') }
      key = key.padStart(nByteLength * 2, '0')
    }
    let num
    try {
      num =
                typeof key === 'bigint'
                  ? key
                  : bytesToNumberBE$1(ensureBytes$1('private key', key, nByteLength))
    } catch (error) {
      throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`)
    }
    if (wrapPrivateKey) { num = mod$1(num, n) } // disabled by default, enabled for BLS
    assertGE(num) // num in range [1..N-1]
    return num
  }
  const pointPrecomputes = new Map()
  function assertPrjPoint (other) {
    if (!(other instanceof Point)) { throw new Error('ProjectivePoint expected') }
  }
  /**
     * Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
     * Default Point works in 2d / affine coordinates: (x, y)
     * We're doing calculations in projective, because its operations don't require costly inversion.
     */
  class Point {
    constructor (px, py, pz) {
      this.px = px
      this.py = py
      this.pz = pz
      if (px == null || !Fp.isValid(px)) { throw new Error('x required') }
      if (py == null || !Fp.isValid(py)) { throw new Error('y required') }
      if (pz == null || !Fp.isValid(pz)) { throw new Error('z required') }
    }

    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine (p) {
      const { x, y } = p || {}
      if (!p || !Fp.isValid(x) || !Fp.isValid(y)) { throw new Error('invalid affine point') }
      if (p instanceof Point) { throw new Error('projective point not allowed') }
      const is0 = (i) => Fp.eql(i, Fp.ZERO)
      // fromAffine(x:0, y:0) would produce (x:0, y:0, z:1), but we need (x:0, y:1, z:0)
      if (is0(x) && is0(y)) { return Point.ZERO }
      return new Point(x, y, Fp.ONE)
    }

    get x () {
      return this.toAffine().x
    }

    get y () {
      return this.toAffine().y
    }

    /**
         * Takes a bunch of Projective Points but executes only one
         * inversion on all of them. Inversion is very slow operation,
         * so this improves performance massively.
         * Optimization: converts a list of projective points to a list of identical points with Z=1.
         */
    static normalizeZ (points) {
      const toInv = Fp.invertBatch(points.map((p) => p.pz))
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine)
    }

    /**
         * Converts hash string or Uint8Array to Point.
         * @param hex short/long ECDSA hex
         */
    static fromHex (hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes$1('pointHex', hex)))
      P.assertValidity()
      return P
    }

    // Multiplies generator point by privateKey.
    static fromPrivateKey (privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey))
    }

    // "Private method", don't use it directly
    _setWindowSize (windowSize) {
      this._WINDOW_SIZE = windowSize
      pointPrecomputes.delete(this)
    }

    // A point on curve is valid if it conforms to equation.
    assertValidity () {
      if (this.is0()) {
        // (0, 1, 0) aka ZERO is invalid in most contexts.
        // In BLS, ZERO can be serialized, so we allow it.
        // (0, 0, 0) is wrong representation of ZERO and is always invalid.
        if (CURVE.allowInfinityPoint && !Fp.is0(this.py)) { return }
        throw new Error('bad point: ZERO')
      }
      // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`
      const { x, y } = this.toAffine()
      // Check if x, y are valid field elements
      if (!Fp.isValid(x) || !Fp.isValid(y)) { throw new Error('bad point: x or y not FE') }
      const left = Fp.sqr(y) // y²
      const right = weierstrassEquation(x) // x³ + ax + b
      if (!Fp.eql(left, right)) { throw new Error('bad point: equation left != right') }
      if (!this.isTorsionFree()) { throw new Error('bad point: not in prime-order subgroup') }
    }

    hasEvenY () {
      const { y } = this.toAffine()
      if (Fp.isOdd) { return !Fp.isOdd(y) }
      throw new Error("Field doesn't support isOdd")
    }

    /**
         * Compare one point to another.
         */
    equals (other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1))
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1))
      return U1 && U2
    }

    /**
         * Flips point to one corresponding to (x, -y) in Affine coordinates.
         */
    negate () {
      return new Point(this.px, Fp.neg(this.py), this.pz)
    }

    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double () {
      const { a, b } = CURVE
      const b3 = Fp.mul(b, _3n$2)
      const { px: X1, py: Y1, pz: Z1 } = this
      let X3 = Fp.ZERO; let Y3 = Fp.ZERO; let Z3 = Fp.ZERO // prettier-ignore
      let t0 = Fp.mul(X1, X1) // step 1
      const t1 = Fp.mul(Y1, Y1)
      let t2 = Fp.mul(Z1, Z1)
      let t3 = Fp.mul(X1, Y1)
      t3 = Fp.add(t3, t3) // step 5
      Z3 = Fp.mul(X1, Z1)
      Z3 = Fp.add(Z3, Z3)
      X3 = Fp.mul(a, Z3)
      Y3 = Fp.mul(b3, t2)
      Y3 = Fp.add(X3, Y3) // step 10
      X3 = Fp.sub(t1, Y3)
      Y3 = Fp.add(t1, Y3)
      Y3 = Fp.mul(X3, Y3)
      X3 = Fp.mul(t3, X3)
      Z3 = Fp.mul(b3, Z3) // step 15
      t2 = Fp.mul(a, t2)
      t3 = Fp.sub(t0, t2)
      t3 = Fp.mul(a, t3)
      t3 = Fp.add(t3, Z3)
      Z3 = Fp.add(t0, t0) // step 20
      t0 = Fp.add(Z3, t0)
      t0 = Fp.add(t0, t2)
      t0 = Fp.mul(t0, t3)
      Y3 = Fp.add(Y3, t0)
      t2 = Fp.mul(Y1, Z1) // step 25
      t2 = Fp.add(t2, t2)
      t0 = Fp.mul(t2, t3)
      X3 = Fp.sub(X3, t0)
      Z3 = Fp.mul(t2, t1)
      Z3 = Fp.add(Z3, Z3) // step 30
      Z3 = Fp.add(Z3, Z3)
      return new Point(X3, Y3, Z3)
    }

    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add (other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      let X3 = Fp.ZERO; let Y3 = Fp.ZERO; let Z3 = Fp.ZERO // prettier-ignore
      const a = CURVE.a
      const b3 = Fp.mul(CURVE.b, _3n$2)
      let t0 = Fp.mul(X1, X2) // step 1
      let t1 = Fp.mul(Y1, Y2)
      let t2 = Fp.mul(Z1, Z2)
      let t3 = Fp.add(X1, Y1)
      let t4 = Fp.add(X2, Y2) // step 5
      t3 = Fp.mul(t3, t4)
      t4 = Fp.add(t0, t1)
      t3 = Fp.sub(t3, t4)
      t4 = Fp.add(X1, Z1)
      let t5 = Fp.add(X2, Z2) // step 10
      t4 = Fp.mul(t4, t5)
      t5 = Fp.add(t0, t2)
      t4 = Fp.sub(t4, t5)
      t5 = Fp.add(Y1, Z1)
      X3 = Fp.add(Y2, Z2) // step 15
      t5 = Fp.mul(t5, X3)
      X3 = Fp.add(t1, t2)
      t5 = Fp.sub(t5, X3)
      Z3 = Fp.mul(a, t4)
      X3 = Fp.mul(b3, t2) // step 20
      Z3 = Fp.add(X3, Z3)
      X3 = Fp.sub(t1, Z3)
      Z3 = Fp.add(t1, Z3)
      Y3 = Fp.mul(X3, Z3)
      t1 = Fp.add(t0, t0) // step 25
      t1 = Fp.add(t1, t0)
      t2 = Fp.mul(a, t2)
      t4 = Fp.mul(b3, t4)
      t1 = Fp.add(t1, t2)
      t2 = Fp.sub(t0, t2) // step 30
      t2 = Fp.mul(a, t2)
      t4 = Fp.add(t4, t2)
      t0 = Fp.mul(t1, t4)
      Y3 = Fp.add(Y3, t0)
      t0 = Fp.mul(t5, t4) // step 35
      X3 = Fp.mul(t3, X3)
      X3 = Fp.sub(X3, t0)
      t0 = Fp.mul(t3, t1)
      Z3 = Fp.mul(t5, Z3)
      Z3 = Fp.add(Z3, t0) // step 40
      return new Point(X3, Y3, Z3)
    }

    subtract (other) {
      return this.add(other.negate())
    }

    is0 () {
      return this.equals(Point.ZERO)
    }

    wNAF (n) {
      return wnaf.wNAFCached(this, pointPrecomputes, n, (comp) => {
        const toInv = Fp.invertBatch(comp.map((p) => p.pz))
        return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine)
      })
    }

    /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed private key e.g. sig verification, which works over *public* keys.
         */
    multiplyUnsafe (n) {
      const I = Point.ZERO
      if (n === _0n$6) { return I }
      assertGE(n) // Will throw on 0
      if (n === _1n$6) { return this }
      const { endo } = CURVE
      if (!endo) { return wnaf.unsafeLadder(this, n) }
      // Apply endomorphism
      let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n)
      let k1p = I
      let k2p = I
      let d = this
      while (k1 > _0n$6 || k2 > _0n$6) {
        if (k1 & _1n$6) { k1p = k1p.add(d) }
        if (k2 & _1n$6) { k2p = k2p.add(d) }
        d = d.double()
        k1 >>= _1n$6
        k2 >>= _1n$6
      }
      if (k1neg) { k1p = k1p.negate() }
      if (k2neg) { k2p = k2p.negate() }
      k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
      return k1p.add(k2p)
    }

    /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */
    multiply (scalar) {
      assertGE(scalar)
      const n = scalar
      let point, fake // Fake point is used to const-time mult
      const { endo } = CURVE
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n)
        let { p: k1p, f: f1p } = this.wNAF(k1)
        let { p: k2p, f: f2p } = this.wNAF(k2)
        k1p = wnaf.constTimeNegate(k1neg, k1p)
        k2p = wnaf.constTimeNegate(k2neg, k2p)
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
        point = k1p.add(k2p)
        fake = f1p.add(f2p)
      } else {
        const { p, f } = this.wNAF(n)
        point = p
        fake = f
      }
      // Normalize `z` for both points, but return only real one
      return Point.normalizeZ([point, fake])[0]
    }

    /**
         * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
         * Not using Strauss-Shamir trick: precomputation tables are faster.
         * The trick could be useful if both P and Q are not G (not in our case).
         * @returns non-zero affine point
         */
    multiplyAndAddUnsafe (Q, a, b) {
      const G = Point.BASE // No Strauss-Shamir trick: we have 10% faster G precomputes
      const mul = (P, a // Select faster multiply() method
      ) => (a === _0n$6 || a === _1n$6 || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a))
      const sum = mul(this, a).add(mul(Q, b))
      return sum.is0() ? undefined : sum
    }

    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine (iz) {
      const { px: x, py: y, pz: z } = this
      const is0 = this.is0()
      // If invZ was 0, we return zero point. However we still want to execute
      // all operations, so we replace invZ with a random number, 1.
      if (iz == null) { iz = is0 ? Fp.ONE : Fp.inv(z) }
      const ax = Fp.mul(x, iz)
      const ay = Fp.mul(y, iz)
      const zz = Fp.mul(z, iz)
      if (is0) { return { x: Fp.ZERO, y: Fp.ZERO } }
      if (!Fp.eql(zz, Fp.ONE)) { throw new Error('invZ was invalid') }
      return { x: ax, y: ay }
    }

    isTorsionFree () {
      const { h: cofactor, isTorsionFree } = CURVE
      if (cofactor === _1n$6) { return true } // No subgroups, always torsion-free
      if (isTorsionFree) { return isTorsionFree(Point, this) }
      throw new Error('isTorsionFree() has not been declared for the elliptic curve')
    }

    clearCofactor () {
      const { h: cofactor, clearCofactor } = CURVE
      if (cofactor === _1n$6) { return this } // Fast-path
      if (clearCofactor) { return clearCofactor(Point, this) }
      return this.multiplyUnsafe(CURVE.h)
    }

    toRawBytes (isCompressed = true) {
      this.assertValidity()
      return toBytes(Point, this, isCompressed)
    }

    toHex (isCompressed = true) {
      return bytesToHex$3(this.toRawBytes(isCompressed))
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE)
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO)
  const _bits = CURVE.nBitLength
  const wnaf = wNAF$1(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits)
  // Validate if generator point is on curve
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  }
}
function validateOpts$1 (curve) {
  const opts = validateBasic$1(curve)
  validateObject$1(opts, {
    hash: 'hash',
    hmac: 'function',
    randomBytes: 'function'
  }, {
    bits2int: 'function',
    bits2int_modN: 'function',
    lowS: 'boolean'
  })
  return Object.freeze({ lowS: true, ...opts })
}
function weierstrass$1 (curveDef) {
  const CURVE = validateOpts$1(curveDef)
  const { Fp, n: CURVE_ORDER } = CURVE
  const compressedLen = Fp.BYTES + 1 // e.g. 33 for 32
  const uncompressedLen = 2 * Fp.BYTES + 1 // e.g. 65 for 32
  function isValidFieldElement (num) {
    return _0n$6 < num && num < Fp.ORDER // 0 is banned since it's not invertible FE
  }
  function modN (a) {
    return mod$1(a, CURVE_ORDER)
  }
  function invN (a) {
    return invert$1(a, CURVE_ORDER)
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints$1({
    ...CURVE,
    toBytes (_c, point, isCompressed) {
      const a = point.toAffine()
      const x = Fp.toBytes(a.x)
      const cat = concatBytes$3
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x)
      } else {
        return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y))
      }
    },
    fromBytes (bytes) {
      const len = bytes.length
      const head = bytes[0]
      const tail = bytes.subarray(1)
      // this.assertValidity() is done inside of fromHex
      if (len === compressedLen && (head === 0x02 || head === 0x03)) {
        const x = bytesToNumberBE$1(tail)
        if (!isValidFieldElement(x)) { throw new Error('Point is not on curve') }
        const y2 = weierstrassEquation(x) // y² = x³ + ax + b
        let y = Fp.sqrt(y2) // y = y² ^ (p+1)/4
        const isYOdd = (y & _1n$6) === _1n$6
        // ECDSA
        const isHeadOdd = (head & 1) === 1
        if (isHeadOdd !== isYOdd) { y = Fp.neg(y) }
        return { x, y }
      } else if (len === uncompressedLen && head === 0x04) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
        return { x, y }
      } else {
        throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`)
      }
    }
  })
  const numToNByteStr = (num) => bytesToHex$3(numberToBytesBE$1(num, CURVE.nByteLength))
  function isBiggerThanHalfOrder (number) {
    const HALF = CURVE_ORDER >> _1n$6
    return number > HALF
  }
  function normalizeS (s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s
  }
  // slice bytes num
  const slcNum = (b, from, to) => bytesToNumberBE$1(b.slice(from, to))
  /**
     * ECDSA signature with its (r, s) properties. Supports DER & compact representations.
     */
  class Signature {
    constructor (r, s, recovery) {
      this.r = r
      this.s = s
      this.recovery = recovery
      this.assertValidity()
    }

    // pair (bytes of r, bytes of s)
    static fromCompact (hex) {
      const l = CURVE.nByteLength
      hex = ensureBytes$1('compactSignature', hex, l * 2)
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l))
    }

    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER (hex) {
      const { r, s } = DER$1.toSig(ensureBytes$1('DER', hex))
      return new Signature(r, s)
    }

    assertValidity () {
      // can use assertGE here
      if (!isWithinCurveOrder(this.r)) { throw new Error('r must be 0 < r < CURVE.n') }
      if (!isWithinCurveOrder(this.s)) { throw new Error('s must be 0 < s < CURVE.n') }
    }

    addRecoveryBit (recovery) {
      return new Signature(this.r, this.s, recovery)
    }

    recoverPublicKey (msgHash) {
      const { r, s, recovery: rec } = this
      const h = bits2int_modN(ensureBytes$1('msgHash', msgHash)) // Truncate hash
      if (rec == null || ![0, 1, 2, 3].includes(rec)) { throw new Error('recovery id invalid') }
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r
      if (radj >= Fp.ORDER) { throw new Error('recovery id 2 or 3 invalid') }
      const prefix = (rec & 1) === 0 ? '02' : '03'
      const R = Point.fromHex(prefix + numToNByteStr(radj))
      const ir = invN(radj) // r^-1
      const u1 = modN(-h * ir) // -hr^-1
      const u2 = modN(s * ir) // sr^-1
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2) // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1)
      if (!Q) { throw new Error('point at infinify') } // unsafe is fine: no priv data leaked
      Q.assertValidity()
      return Q
    }

    // Signatures should be low-s, to prevent malleability.
    hasHighS () {
      return isBiggerThanHalfOrder(this.s)
    }

    normalizeS () {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this
    }

    // DER-encoded
    toDERRawBytes () {
      return hexToBytes$2(this.toDERHex())
    }

    toDERHex () {
      return DER$1.hexFromSig({ r: this.r, s: this.s })
    }

    // padded bytes of r, then padded bytes of s
    toCompactRawBytes () {
      return hexToBytes$2(this.toCompactHex())
    }

    toCompactHex () {
      return numToNByteStr(this.r) + numToNByteStr(this.s)
    }
  }
  const utils = {
    isValidPrivateKey (privateKey) {
      try {
        normPrivateKeyToScalar(privateKey)
        return true
      } catch (error) {
        return false
      }
    },
    normPrivateKeyToScalar,
    /**
         * Produces cryptographically secure private key from random of size
         * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
         */
    randomPrivateKey: () => {
      const length = getMinHashLength$1(CURVE.n)
      return mapHashToField$1(CURVE.randomBytes(length), CURVE.n)
    },
    /**
         * Creates precompute table for an arbitrary EC point. Makes point "cached".
         * Allows to massively speed-up `point.multiply(scalar)`.
         * @returns cached point
         * @example
         * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
         * fast.multiply(privKey); // much faster ECDH now
         */
    precompute (windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize)
      point.multiply(BigInt(3)) // 3 is arbitrary, just need any number here
      return point
    }
  }
  /**
     * Computes public key for a private key. Checks for validity of the private key.
     * @param privateKey private key
     * @param isCompressed whether to return compact (default), or full key
     * @returns Public key, full when isCompressed=false; short when isCompressed=true
     */
  function getPublicKey (privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed)
  }
  /**
     * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
     */
  function isProbPub (item) {
    const arr = item instanceof Uint8Array
    const str = typeof item === 'string'
    const len = (arr || str) && item.length
    if (arr) { return len === compressedLen || len === uncompressedLen }
    if (str) { return len === 2 * compressedLen || len === 2 * uncompressedLen }
    if (item instanceof Point) { return true }
    return false
  }
  /**
     * ECDH (Elliptic Curve Diffie Hellman).
     * Computes shared public key from private key and public key.
     * Checks: 1) private key validity 2) shared key is on-curve.
     * Does NOT hash the result.
     * @param privateA private key
     * @param publicB different public key
     * @param isCompressed whether to return compact (default), or full key
     * @returns shared public key
     */
  function getSharedSecret (privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA)) { throw new Error('first arg must be private key') }
    if (!isProbPub(publicB)) { throw new Error('second arg must be public key') }
    const b = Point.fromHex(publicB) // check for being on-curve
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed)
  }
  // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
  // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
  // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
  // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors
  const bits2int = CURVE.bits2int ||
        function (bytes) {
          // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
          // for some cases, since bytes.length * 8 is not actual bitLength.
          const num = bytesToNumberBE$1(bytes) // check for == u8 done here
          const delta = bytes.length * 8 - CURVE.nBitLength // truncate to nBitLength leftmost bits
          return delta > 0 ? num >> BigInt(delta) : num
        }
  const bits2int_modN = CURVE.bits2int_modN ||
        function (bytes) {
          return modN(bits2int(bytes)) // can't use bytesToNumberBE here
        }
  // NOTE: pads output with zero as per spec
  const ORDER_MASK = bitMask$1(CURVE.nBitLength)
  /**
     * Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
     */
  function int2octets (num) {
    if (typeof num !== 'bigint') { throw new Error('bigint expected') }
    if (!(_0n$6 <= num && num < ORDER_MASK)) { throw new Error(`bigint expected < 2^${CURVE.nBitLength}`) }
    // works with order, can have different size than numToField!
    return numberToBytesBE$1(num, CURVE.nByteLength)
  }
  // Steps A, D of RFC6979 3.2
  // Creates RFC6979 seed; converts msg/privKey to numbers.
  // Used only in sign, not in verify.
  // NOTE: we cannot assume here that msgHash has same amount of bytes as curve order, this will be wrong at least for P521.
  // Also it can be bigger for P224 + SHA256
  function prepSig (msgHash, privateKey, opts = defaultSigOpts) {
    if (['recovered', 'canonical'].some((k) => k in opts)) { throw new Error('sign() legacy options not supported') }
    const { hash, randomBytes } = CURVE
    let { lowS, prehash, extraEntropy: ent } = opts // generates low-s sigs by default
    if (lowS == null) { lowS = true } // RFC6979 3.2: we skip step A, because we already provide hash
    msgHash = ensureBytes$1('msgHash', msgHash)
    if (prehash) { msgHash = ensureBytes$1('prehashed msgHash', hash(msgHash)) }
    // We can't later call bits2octets, since nested bits2int is broken for curves
    // with nBitLength % 8 !== 0. Because of that, we unwrap it here as int2octets call.
    // const bits2octets = (bits) => int2octets(bits2int_modN(bits))
    const h1int = bits2int_modN(msgHash)
    const d = normPrivateKeyToScalar(privateKey) // validate private key, convert to bigint
    const seedArgs = [int2octets(d), int2octets(h1int)]
    // extraEntropy. RFC6979 3.6: additional k' (optional).
    if (ent != null) {
      // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
      const e = ent === true ? randomBytes(Fp.BYTES) : ent // generate random bytes OR pass as-is
      seedArgs.push(ensureBytes$1('extraEntropy', e)) // check for being bytes
    }
    const seed = concatBytes$3(...seedArgs) // Step D of RFC6979 3.2
    const m = h1int // NOTE: no need to call bits2int second time here, it is inside truncateHash!
    // Converts signature params into point w r/s, checks result for validity.
    function k2sig (kBytes) {
      // RFC 6979 Section 3.2, step 3: k = bits2int(T)
      const k = bits2int(kBytes) // Cannot use fields methods, since it is group element
      if (!isWithinCurveOrder(k)) { return } // Important: all mod() calls here must be done over N
      const ik = invN(k) // k^-1 mod n
      const q = Point.BASE.multiply(k).toAffine() // q = Gk
      const r = modN(q.x) // r = q.x mod n
      if (r === _0n$6) { return }
      // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
      // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
      // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT
      const s = modN(ik * modN(m + r * d)) // Not using blinding here
      if (s === _0n$6) { return }
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n$6) // recovery bit (2 or 3, when q.x > n)
      let normS = s
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s) // if lowS was passed, ensure s is always
        recovery ^= 1 // // in the bottom half of N
      }
      return new Signature(r, normS, recovery) // use normS, not s
    }
    return { seed, k2sig }
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false }
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false }
  /**
     * Signs message hash with a private key.
     * ```
     * sign(m, d, k) where
     *   (x, y) = G × k
     *   r = x mod n
     *   s = (m + dr)/k mod n
     * ```
     * @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
     * @param privKey private key
     * @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
     * @returns signature with recovery param
     */
  function sign (msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts) // Steps A, D of RFC6979 3.2.
    const C = CURVE
    const drbg = createHmacDrbg$1(C.hash.outputLen, C.nByteLength, C.hmac)
    return drbg(seed, k2sig) // Steps B, C, D, E, F, G
  }
  // Enable precomputes. Slows down first publicKey computation by 20ms.
  Point.BASE._setWindowSize(8)
  // utils.precompute(8, ProjectivePoint.BASE)
  /**
     * Verifies a signature against message hash and public key.
     * Rejects lowS signatures by default: to override,
     * specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
     *
     * ```
     * verify(r, s, h, P) where
     *   U1 = hs^-1 mod n
     *   U2 = rs^-1 mod n
     *   R = U1⋅G - U2⋅P
     *   mod(R.x, n) == r
     * ```
     */
  function verify (signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature
    msgHash = ensureBytes$1('msgHash', msgHash)
    publicKey = ensureBytes$1('publicKey', publicKey)
    if ('strict' in opts) { throw new Error('options.strict was renamed to lowS') }
    const { lowS, prehash } = opts
    let _sig
    let P
    try {
      if (typeof sg === 'string' || sg instanceof Uint8Array) {
        // Signature can be represented in 2 ways: compact (2*nByteLength) & DER (variable-length).
        // Since DER can also be 2*nByteLength bytes, we check for it first.
        try {
          _sig = Signature.fromDER(sg)
        } catch (derError) {
          if (!(derError instanceof DER$1.Err)) { throw derError }
          _sig = Signature.fromCompact(sg)
        }
      } else if (typeof sg === 'object' && typeof sg.r === 'bigint' && typeof sg.s === 'bigint') {
        const { r, s } = sg
        _sig = new Signature(r, s)
      } else {
        throw new Error('PARSE')
      }
      P = Point.fromHex(publicKey)
    } catch (error) {
      if (error.message === 'PARSE') { throw new Error('signature must be Signature instance, Uint8Array or hex string') }
      return false
    }
    if (lowS && _sig.hasHighS()) { return false }
    if (prehash) { msgHash = CURVE.hash(msgHash) }
    const { r, s } = _sig
    const h = bits2int_modN(msgHash) // Cannot use fields methods, since it is group element
    const is = invN(s) // s^-1
    const u1 = modN(h * is) // u1 = hs^-1 mod n
    const u2 = modN(r * is) // u2 = rs^-1 mod n
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine() // R = u1⋅G + u2⋅P
    if (!R) { return false }
    const v = modN(R.x)
    return v === r
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  }
}

// HMAC (RFC 2104)
const HMAC$2 = class HMAC extends Hash$2 {
  constructor (hash, _key) {
    super()
    this.finished = false
    this.destroyed = false
    hash$1(hash)
    const key = toBytes$3(_key)
    this.iHash = hash.create()
    if (typeof this.iHash.update !== 'function') { throw new Error('Expected instance of class which extends utils.Hash') }
    this.blockLen = this.iHash.blockLen
    this.outputLen = this.iHash.outputLen
    const blockLen = this.blockLen
    const pad = new Uint8Array(blockLen)
    // blockLen can be bigger than outputLen
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key)
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 }
    this.iHash.update(pad)
    // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
    this.oHash = hash.create()
    // Undo internal XOR && apply outer XOR
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 ^ 0x5c }
    this.oHash.update(pad)
    pad.fill(0)
  }

  update (buf) {
    exists$2(this)
    this.iHash.update(buf)
    return this
  }

  digestInto (out) {
    exists$2(this)
    bytes$3(out, this.outputLen)
    this.finished = true
    this.iHash.digestInto(out)
    this.oHash.update(out)
    this.oHash.digestInto(out)
    this.destroy()
  }

  digest () {
    const out = new Uint8Array(this.oHash.outputLen)
    this.digestInto(out)
    return out
  }

  _cloneInto (to) {
    // Create new instance without calling constructor since key already in state and we don't know it.
    to || (to = Object.create(Object.getPrototypeOf(this), {}))
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this
    to = to
    to.finished = finished
    to.destroyed = destroyed
    to.blockLen = blockLen
    to.outputLen = outputLen
    to.oHash = oHash._cloneInto(to.oHash)
    to.iHash = iHash._cloneInto(to.iHash)
    return to
  }

  destroy () {
    this.destroyed = true
    this.oHash.destroy()
    this.iHash.destroy()
  }
}
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 */
const hmac$2 = (hash, key, message) => new HMAC$2(hash, key).update(message).digest()
hmac$2.create = (hash, key) => new HMAC$2(hash, key)

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// connects noble-curves to noble-hashes
function getHash$1 (hash) {
  return {
    hash,
    hmac: (key, ...msgs) => hmac$2(hash, key, concatBytes$4(...msgs)),
    randomBytes: randomBytes$2
  }
}
function createCurve$1 (curveDef, defHash) {
  const create = (hash) => weierstrass$1({ ...curveDef, ...getHash$1(hash) })
  return Object.freeze({ ...create(defHash), create })
}

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const secp256k1P$1 = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f')
const secp256k1N$1 = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
const _1n$5 = BigInt(1)
const _2n$3 = BigInt(2)
const divNearest$1 = (a, b) => (a + b / _2n$3) / b
/**
 * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
 * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
 */
function sqrtMod$1 (y) {
  const P = secp256k1P$1
  // prettier-ignore
  const _3n = BigInt(3); const _6n = BigInt(6); const _11n = BigInt(11); const _22n = BigInt(22)
  // prettier-ignore
  const _23n = BigInt(23); const _44n = BigInt(44); const _88n = BigInt(88)
  const b2 = (y * y * y) % P // x^3, 11
  const b3 = (b2 * b2 * y) % P // x^7
  const b6 = (pow2$1(b3, _3n, P) * b3) % P
  const b9 = (pow2$1(b6, _3n, P) * b3) % P
  const b11 = (pow2$1(b9, _2n$3, P) * b2) % P
  const b22 = (pow2$1(b11, _11n, P) * b11) % P
  const b44 = (pow2$1(b22, _22n, P) * b22) % P
  const b88 = (pow2$1(b44, _44n, P) * b44) % P
  const b176 = (pow2$1(b88, _88n, P) * b88) % P
  const b220 = (pow2$1(b176, _44n, P) * b44) % P
  const b223 = (pow2$1(b220, _3n, P) * b3) % P
  const t1 = (pow2$1(b223, _23n, P) * b22) % P
  const t2 = (pow2$1(t1, _6n, P) * b2) % P
  const root = pow2$1(t2, _2n$3, P)
  if (!Fp.eql(Fp.sqr(root), y)) { throw new Error('Cannot find square root') }
  return root
}
const Fp = Field$1(secp256k1P$1, undefined, undefined, { sqrt: sqrtMod$1 })
const secp256k1$1 = createCurve$1({
  a: BigInt(0),
  b: BigInt(7),
  Fp,
  n: secp256k1N$1,
  // Base point (x, y) aka generator point
  Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
  Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
  h: BigInt(1),
  lowS: true,
  /**
     * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
     * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
     * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
     * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
     */
  endo: {
    beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
    splitScalar: (k) => {
      const n = secp256k1N$1
      const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15')
      const b1 = -_1n$5 * BigInt('0xe4437ed6010e88286f547fa90abfe4c3')
      const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8')
      const b2 = a1
      const POW_2_128 = BigInt('0x100000000000000000000000000000000') // (2n**128n).toString(16)
      const c1 = divNearest$1(b2 * k, n)
      const c2 = divNearest$1(-b1 * k, n)
      let k1 = mod$1(k - c1 * a1 - c2 * a2, n)
      let k2 = mod$1(-c1 * b1 - c2 * b2, n)
      const k1neg = k1 > POW_2_128
      const k2neg = k2 > POW_2_128
      if (k1neg) { k1 = n - k1 }
      if (k2neg) { k2 = n - k2 }
      if (k1 > POW_2_128 || k2 > POW_2_128) {
        throw new Error('splitScalar: Endomorphism failed, k=' + k)
      }
      return { k1neg, k1, k2neg, k2 }
    }
  }
}, sha256$2)
// Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
const _0n$5 = BigInt(0)
const fe = (x) => typeof x === 'bigint' && _0n$5 < x && x < secp256k1P$1
const ge = (x) => typeof x === 'bigint' && _0n$5 < x && x < secp256k1N$1
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
const TAGGED_HASH_PREFIXES$1 = {}
function taggedHash$1 (tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES$1[tag]
  if (tagP === undefined) {
    const tagH = sha256$2(Uint8Array.from(tag, (c) => c.charCodeAt(0)))
    tagP = concatBytes$3(tagH, tagH)
    TAGGED_HASH_PREFIXES$1[tag] = tagP
  }
  return sha256$2(concatBytes$3(tagP, ...messages))
}
// ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03
const pointToBytes$1 = (point) => point.toRawBytes(true).slice(1)
const numTo32b$1 = (n) => numberToBytesBE$1(n, 32)
const modP$1 = (x) => mod$1(x, secp256k1P$1)
const modN$1 = (x) => mod$1(x, secp256k1N$1)
const Point$1 = secp256k1$1.ProjectivePoint
const GmulAdd$1 = (Q, a, b) => Point$1.BASE.multiplyAndAddUnsafe(Q, a, b)
// Calculate point, scalar and bytes
function schnorrGetExtPubKey$1 (priv) {
  const d_ = secp256k1$1.utils.normPrivateKeyToScalar(priv) // same method executed in fromPrivateKey
  const p = Point$1.fromPrivateKey(d_) // P = d'⋅G; 0 < d' < n check is done inside
  const scalar = p.hasEvenY() ? d_ : modN$1(-d_)
  return { scalar, bytes: pointToBytes$1(p) }
}
/**
 * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
 * @returns valid point checked for being on-curve
 */
function lift_x$1 (x) {
  if (!fe(x)) { throw new Error('bad x: need 0 < x < p') } // Fail if x ≥ p.
  const xx = modP$1(x * x)
  const c = modP$1(xx * x + BigInt(7)) // Let c = x³ + 7 mod p.
  let y = sqrtMod$1(c) // Let y = c^(p+1)/4 mod p.
  if (y % _2n$3 !== _0n$5) { y = modP$1(-y) } // Return the unique point P such that x(P) = x and
  const p = new Point$1(x, y, _1n$5) // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.
  p.assertValidity()
  return p
}
/**
 * Create tagged hash, convert it to bigint, reduce modulo-n.
 */
function challenge$1 (...args) {
  return modN$1(bytesToNumberBE$1(taggedHash$1('BIP0340/challenge', ...args)))
}
/**
 * Schnorr public key is just `x` coordinate of Point as per BIP340.
 */
function schnorrGetPublicKey$1 (privateKey) {
  return schnorrGetExtPubKey$1(privateKey).bytes // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
}
/**
 * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
 * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
 */
function schnorrSign$1 (message, privateKey, auxRand = randomBytes$2(32)) {
  const m = ensureBytes$1('message', message)
  const { bytes: px, scalar: d } = schnorrGetExtPubKey$1(privateKey) // checks for isWithinCurveOrder
  const a = ensureBytes$1('auxRand', auxRand, 32) // Auxiliary random data a: a 32-byte array
  const t = numTo32b$1(d ^ bytesToNumberBE$1(taggedHash$1('BIP0340/aux', a))) // Let t be the byte-wise xor of bytes(d) and hash/aux(a)
  const rand = taggedHash$1('BIP0340/nonce', t, px, m) // Let rand = hash/nonce(t || bytes(P) || m)
  const k_ = modN$1(bytesToNumberBE$1(rand)) // Let k' = int(rand) mod n
  if (k_ === _0n$5) { throw new Error('sign failed: k is zero') } // Fail if k' = 0.
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey$1(k_) // Let R = k'⋅G.
  const e = challenge$1(rx, px, m) // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.
  const sig = new Uint8Array(64) // Let sig = bytes(R) || bytes((k + ed) mod n).
  sig.set(rx, 0)
  sig.set(numTo32b$1(modN$1(k + e * d)), 32)
  // If Verify(bytes(P), m, sig) (see below) returns failure, abort
  if (!schnorrVerify$1(sig, m, px)) { throw new Error('sign: Invalid signature produced') }
  return sig
}
/**
 * Verifies Schnorr signature.
 * Will swallow errors & return false except for initial type validation of arguments.
 */
function schnorrVerify$1 (signature, message, publicKey) {
  const sig = ensureBytes$1('signature', signature, 64)
  const m = ensureBytes$1('message', message)
  const pub = ensureBytes$1('publicKey', publicKey, 32)
  try {
    const P = lift_x$1(bytesToNumberBE$1(pub)) // P = lift_x(int(pk)); fail if that fails
    const r = bytesToNumberBE$1(sig.subarray(0, 32)) // Let r = int(sig[0:32]); fail if r ≥ p.
    if (!fe(r)) { return false }
    const s = bytesToNumberBE$1(sig.subarray(32, 64)) // Let s = int(sig[32:64]); fail if s ≥ n.
    if (!ge(s)) { return false }
    const e = challenge$1(numTo32b$1(r), pointToBytes$1(P), m) // int(challenge(bytes(r)||bytes(P)||m))%n
    const R = GmulAdd$1(P, s, modN$1(-e)) // R = s⋅G - e⋅P
    if (!R || !R.hasEvenY() || R.toAffine().x !== r) { return false } // -eP == (n-e)P
    return true // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
  } catch (error) {
    return false
  }
}
const schnorr$1 = /* @__PURE__ */ (() => ({
  getPublicKey: schnorrGetPublicKey$1,
  sign: schnorrSign$1,
  verify: schnorrVerify$1,
  utils: {
    randomPrivateKey: secp256k1$1.utils.randomPrivateKey,
    lift_x: lift_x$1,
    pointToBytes: pointToBytes$1,
    numberToBytesBE: numberToBytesBE$1,
    bytesToNumberBE: bytesToNumberBE$1,
    taggedHash: taggedHash$1,
    mod: mod$1
  }
}))()

const crypto$1 = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined

/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated, we can just drop the import.
const u8a = (a) => a instanceof Uint8Array
// Cast array to view
const createView$2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength)
// The rotate right (circular right shift) operation for uint32
const rotr$1 = (word, shift) => (word << (32 - shift)) | (word >>> shift)
// big-endian hardware is rare. Just in case someone still decides to run hashes:
// early-throw an error because we don't support BE yet.
const isLE$1 = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44
if (!isLE$1) { throw new Error('Non little-endian hardware is not supported') }
const hexes$2 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'))
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex$2 (bytes) {
  if (!u8a(bytes)) { throw new Error('Uint8Array expected') }
  // pre-caching improves the speed 6x
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes$2[bytes[i]]
  }
  return hex
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes$1 (hex) {
  if (typeof hex !== 'string') { throw new Error('hex string expected, got ' + typeof hex) }
  const len = hex.length
  if (len % 2) { throw new Error('padded hex string expected, got unpadded hex of length ' + len) }
  const array = new Uint8Array(len / 2)
  for (let i = 0; i < array.length; i++) {
    const j = i * 2
    const hexByte = hex.slice(j, j + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0) { throw new Error('Invalid byte sequence') }
    array[i] = byte
  }
  return array
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes$3 (str) {
  if (typeof str !== 'string') { throw new Error(`utf8ToBytes expected string, got ${typeof str}`) }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes$2 (data) {
  if (typeof data === 'string') { data = utf8ToBytes$3(data) }
  if (!u8a(data)) { throw new Error(`expected Uint8Array, got ${typeof data}`) }
  return data
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes$2 (...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0))
  let pad = 0 // walk through each item, ensure they have proper type
  arrays.forEach((a) => {
    if (!u8a(a)) { throw new Error('Uint8Array expected') }
    r.set(a, pad)
    pad += a.length
  })
  return r
}
// For runtime check if class implements interface
const Hash$1 = class Hash {
  // Safe version that clones internal state
  clone () {
    return this._cloneInto()
  }
}
function wrapConstructor$1 (hashCons) {
  const hashC = (msg) => hashCons().update(toBytes$2(msg)).digest()
  const tmp = hashCons()
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = () => hashCons()
  return hashC
}
/**
 * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
 */
function randomBytes$1 (bytesLength = 32) {
  if (crypto$1 && typeof crypto$1.getRandomValues === 'function') {
    return crypto$1.getRandomValues(new Uint8Array(bytesLength))
  }
  throw new Error('crypto.getRandomValues must be defined')
}

function number$1 (n) {
  if (!Number.isSafeInteger(n) || n < 0) { throw new Error(`Wrong positive integer: ${n}`) }
}
function bool$1 (b) {
  if (typeof b !== 'boolean') { throw new Error(`Expected boolean, not ${b}`) }
}
function bytes$2 (b, ...lengths) {
  if (!(b instanceof Uint8Array)) { throw new Error('Expected Uint8Array') }
  if (lengths.length > 0 && !lengths.includes(b.length)) { throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`) }
}
function hash (hash) {
  if (typeof hash !== 'function' || typeof hash.create !== 'function') { throw new Error('Hash should be wrapped by utils.wrapConstructor') }
  number$1(hash.outputLen)
  number$1(hash.blockLen)
}
function exists$1 (instance, checkFinished = true) {
  if (instance.destroyed) { throw new Error('Hash instance has been destroyed') }
  if (checkFinished && instance.finished) { throw new Error('Hash#digest() has already been called') }
}
function output$1 (out, instance) {
  bytes$2(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`)
  }
}
const assert = {
  number: number$1,
  bool: bool$1,
  bytes: bytes$2,
  hash,
  exists: exists$1,
  output: output$1
}

// Polyfill for Safari 14
function setBigUint64$1 (view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === 'function') { return view.setBigUint64(byteOffset, value, isLE) }
  const _32n = BigInt(32)
  const _u32_max = BigInt(0xffffffff)
  const wh = Number((value >> _32n) & _u32_max)
  const wl = Number(value & _u32_max)
  const h = isLE ? 4 : 0
  const l = isLE ? 0 : 4
  view.setUint32(byteOffset + h, wh, isLE)
  view.setUint32(byteOffset + l, wl, isLE)
}
// Base SHA2 class (RFC 6234)
class SHA2 extends Hash$1 {
  constructor (blockLen, outputLen, padOffset, isLE) {
    super()
    this.blockLen = blockLen
    this.outputLen = outputLen
    this.padOffset = padOffset
    this.isLE = isLE
    this.finished = false
    this.length = 0
    this.pos = 0
    this.destroyed = false
    this.buffer = new Uint8Array(blockLen)
    this.view = createView$2(this.buffer)
  }

  update (data) {
    assert.exists(this)
    const { view, buffer, blockLen } = this
    data = toBytes$2(data)
    const len = data.length
    for (let pos = 0; pos < len;) {
      const take = Math.min(blockLen - this.pos, len - pos)
      // Fast path: we have at least one block in input, cast it to view and process
      if (take === blockLen) {
        const dataView = createView$2(data)
        for (; blockLen <= len - pos; pos += blockLen) { this.process(dataView, pos) }
        continue
      }
      buffer.set(data.subarray(pos, pos + take), this.pos)
      this.pos += take
      pos += take
      if (this.pos === blockLen) {
        this.process(view, 0)
        this.pos = 0
      }
    }
    this.length += data.length
    this.roundClean()
    return this
  }

  digestInto (out) {
    assert.exists(this)
    assert.output(out, this)
    this.finished = true
    // Padding
    // We can avoid allocation of buffer for padding completely if it
    // was previously not allocated here. But it won't change performance.
    const { buffer, view, blockLen, isLE } = this
    let { pos } = this
    // append the bit '1' to the message
    buffer[pos++] = 0b10000000
    this.buffer.subarray(pos).fill(0)
    // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0)
      pos = 0
    }
    // Pad until full block byte with zeros
    for (let i = pos; i < blockLen; i++) { buffer[i] = 0 }
    // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
    // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
    // So we just write lowest 64 bits of that value.
    setBigUint64$1(view, blockLen - 8, BigInt(this.length * 8), isLE)
    this.process(view, 0)
    const oview = createView$2(out)
    const len = this.outputLen
    // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
    if (len % 4) { throw new Error('_sha2: outputLen should be aligned to 32bit') }
    const outLen = len / 4
    const state = this.get()
    if (outLen > state.length) { throw new Error('_sha2: outputLen bigger than state') }
    for (let i = 0; i < outLen; i++) { oview.setUint32(4 * i, state[i], isLE) }
  }

  digest () {
    const { buffer, outputLen } = this
    this.digestInto(buffer)
    const res = buffer.slice(0, outputLen)
    this.destroy()
    return res
  }

  _cloneInto (to) {
    to || (to = new this.constructor())
    to.set(...this.get())
    const { blockLen, buffer, length, finished, destroyed, pos } = this
    to.length = length
    to.pos = pos
    to.finished = finished
    to.destroyed = destroyed
    if (length % blockLen) { to.buffer.set(buffer) }
    return to
  }
}

// Choice: a ? b : c
const Chi$1 = (a, b, c) => (a & b) ^ (~a & c)
// Majority function, true if any two inpust is true
const Maj$1 = (a, b, c) => (a & b) ^ (a & c) ^ (b & c)
// Round constants:
// first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
// prettier-ignore
const SHA256_K$1 = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
])
// Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
// prettier-ignore
const IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
])
// Temporary buffer, not used to store anything between runs
// Named this way because it matches specification.
const SHA256_W$1 = new Uint32Array(64)
const SHA256$1 = class SHA256 extends SHA2 {
  constructor () {
    super(64, 32, 8, false)
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    this.A = IV[0] | 0
    this.B = IV[1] | 0
    this.C = IV[2] | 0
    this.D = IV[3] | 0
    this.E = IV[4] | 0
    this.F = IV[5] | 0
    this.G = IV[6] | 0
    this.H = IV[7] | 0
  }

  get () {
    const { A, B, C, D, E, F, G, H } = this
    return [A, B, C, D, E, F, G, H]
  }

  // prettier-ignore
  set (A, B, C, D, E, F, G, H) {
    this.A = A | 0
    this.B = B | 0
    this.C = C | 0
    this.D = D | 0
    this.E = E | 0
    this.F = F | 0
    this.G = G | 0
    this.H = H | 0
  }

  process (view, offset) {
    // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
    for (let i = 0; i < 16; i++, offset += 4) { SHA256_W$1[i] = view.getUint32(offset, false) }
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W$1[i - 15]
      const W2 = SHA256_W$1[i - 2]
      const s0 = rotr$1(W15, 7) ^ rotr$1(W15, 18) ^ (W15 >>> 3)
      const s1 = rotr$1(W2, 17) ^ rotr$1(W2, 19) ^ (W2 >>> 10)
      SHA256_W$1[i] = (s1 + SHA256_W$1[i - 7] + s0 + SHA256_W$1[i - 16]) | 0
    }
    // Compression function main loop, 64 rounds
    let { A, B, C, D, E, F, G, H } = this
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr$1(E, 6) ^ rotr$1(E, 11) ^ rotr$1(E, 25)
      const T1 = (H + sigma1 + Chi$1(E, F, G) + SHA256_K$1[i] + SHA256_W$1[i]) | 0
      const sigma0 = rotr$1(A, 2) ^ rotr$1(A, 13) ^ rotr$1(A, 22)
      const T2 = (sigma0 + Maj$1(A, B, C)) | 0
      H = G
      G = F
      F = E
      E = (D + T1) | 0
      D = C
      C = B
      B = A
      A = (T1 + T2) | 0
    }
    // Add the compressed chunk to the current hash value
    A = (A + this.A) | 0
    B = (B + this.B) | 0
    C = (C + this.C) | 0
    D = (D + this.D) | 0
    E = (E + this.E) | 0
    F = (F + this.F) | 0
    G = (G + this.G) | 0
    H = (H + this.H) | 0
    this.set(A, B, C, D, E, F, G, H)
  }

  roundClean () {
    SHA256_W$1.fill(0)
  }

  destroy () {
    this.set(0, 0, 0, 0, 0, 0, 0, 0)
    this.buffer.fill(0)
  }
}
// Constants from https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
class SHA224 extends SHA256$1 {
  constructor () {
    super()
    this.A = 0xc1059ed8 | 0
    this.B = 0x367cd507 | 0
    this.C = 0x3070dd17 | 0
    this.D = 0xf70e5939 | 0
    this.E = 0xffc00b31 | 0
    this.F = 0x68581511 | 0
    this.G = 0x64f98fa7 | 0
    this.H = 0xbefa4fa4 | 0
    this.outputLen = 28
  }
}
/**
 * SHA2-256 hash function
 * @param message - data that would be hashed
 */
const sha256$1 = wrapConstructor$1(() => new SHA256$1())
wrapConstructor$1(() => new SHA224())

/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function assertNumber (n) {
  if (!Number.isSafeInteger(n)) { throw new Error(`Wrong integer: ${n}`) }
}
function chain (...args) {
  const wrap = (a, b) => (c) => a(b(c))
  const encode = Array.from(args)
    .reverse()
    .reduce((acc, i) => (acc ? wrap(acc, i.encode) : i.encode), undefined)
  const decode = args.reduce((acc, i) => (acc ? wrap(acc, i.decode) : i.decode), undefined)
  return { encode, decode }
}
function alphabet (alphabet) {
  return {
    encode: (digits) => {
      if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number')) { throw new Error('alphabet.encode input should be an array of numbers') }
      return digits.map((i) => {
        assertNumber(i)
        if (i < 0 || i >= alphabet.length) { throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`) }
        return alphabet[i]
      })
    },
    decode: (input) => {
      if (!Array.isArray(input) || (input.length && typeof input[0] !== 'string')) { throw new Error('alphabet.decode input should be array of strings') }
      return input.map((letter) => {
        if (typeof letter !== 'string') { throw new Error(`alphabet.decode: not string element=${letter}`) }
        const index = alphabet.indexOf(letter)
        if (index === -1) { throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`) }
        return index
      })
    }
  }
}
function join (separator = '') {
  if (typeof separator !== 'string') { throw new Error('join separator should be string') }
  return {
    encode: (from) => {
      if (!Array.isArray(from) || (from.length && typeof from[0] !== 'string')) { throw new Error('join.encode input should be array of strings') }
      for (const i of from) {
        if (typeof i !== 'string') { throw new Error(`join.encode: non-string input=${i}`) }
      }
      return from.join(separator)
    },
    decode: (to) => {
      if (typeof to !== 'string') { throw new Error('join.decode input should be string') }
      return to.split(separator)
    }
  }
}
function padding (bits, chr = '=') {
  assertNumber(bits)
  if (typeof chr !== 'string') { throw new Error('padding chr should be string') }
  return {
    encode (data) {
      if (!Array.isArray(data) || (data.length && typeof data[0] !== 'string')) { throw new Error('padding.encode input should be array of strings') }
      for (const i of data) {
        if (typeof i !== 'string') { throw new Error(`padding.encode: non-string input=${i}`) }
      }
      while ((data.length * bits) % 8) { data.push(chr) }
      return data
    },
    decode (input) {
      if (!Array.isArray(input) || (input.length && typeof input[0] !== 'string')) { throw new Error('padding.encode input should be array of strings') }
      for (const i of input) {
        if (typeof i !== 'string') { throw new Error(`padding.decode: non-string input=${i}`) }
      }
      let end = input.length
      if ((end * bits) % 8) { throw new Error('Invalid padding: string should have whole number of bytes') }
      for (; end > 0 && input[end - 1] === chr; end--) {
        if (!(((end - 1) * bits) % 8)) { throw new Error('Invalid padding: string has too much padding') }
      }
      return input.slice(0, end)
    }
  }
}
function normalize (fn) {
  if (typeof fn !== 'function') { throw new Error('normalize fn should be function') }
  return { encode: (from) => from, decode: (to) => fn(to) }
}
function convertRadix (data, from, to) {
  if (from < 2) { throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`) }
  if (to < 2) { throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`) }
  if (!Array.isArray(data)) { throw new Error('convertRadix: data should be array') }
  if (!data.length) { return [] }
  let pos = 0
  const res = []
  const digits = Array.from(data)
  digits.forEach((d) => {
    assertNumber(d)
    if (d < 0 || d >= from) { throw new Error(`Wrong integer: ${d}`) }
  })
  while (true) {
    let carry = 0
    let done = true
    for (let i = pos; i < digits.length; i++) {
      const digit = digits[i]
      const digitBase = from * carry + digit
      if (!Number.isSafeInteger(digitBase) ||
                (from * carry) / from !== carry ||
                digitBase - digit !== from * carry) {
        throw new Error('convertRadix: carry overflow')
      }
      carry = digitBase % to
      digits[i] = Math.floor(digitBase / to)
      if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase) { throw new Error('convertRadix: carry overflow') }
      if (!done) { continue } else if (!digits[i]) { pos = i } else { done = false }
    }
    res.push(carry)
    if (done) { break }
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++) { res.push(0) }
  return res.reverse()
}
const gcd = (a, b) => (!b ? a : gcd(b, a % b))
const radix2carry = (from, to) => from + (to - gcd(from, to))
function convertRadix2 (data, from, to, padding) {
  if (!Array.isArray(data)) { throw new Error('convertRadix2: data should be array') }
  if (from <= 0 || from > 32) { throw new Error(`convertRadix2: wrong from=${from}`) }
  if (to <= 0 || to > 32) { throw new Error(`convertRadix2: wrong to=${to}`) }
  if (radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`)
  }
  let carry = 0
  let pos = 0
  const mask = 2 ** to - 1
  const res = []
  for (const n of data) {
    assertNumber(n)
    if (n >= 2 ** from) { throw new Error(`convertRadix2: invalid data word=${n} from=${from}`) }
    carry = (carry << from) | n
    if (pos + from > 32) { throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`) }
    pos += from
    for (; pos >= to; pos -= to) { res.push(((carry >> (pos - to)) & mask) >>> 0) }
    carry &= 2 ** pos - 1
  }
  carry = (carry << (to - pos)) & mask
  if (!padding && pos >= from) { throw new Error('Excess padding') }
  if (!padding && carry) { throw new Error(`Non-zero padding: ${carry}`) }
  if (padding && pos > 0) { res.push(carry >>> 0) }
  return res
}
function radix (num) {
  assertNumber(num)
  return {
    encode: (bytes) => {
      if (!(bytes instanceof Uint8Array)) { throw new Error('radix.encode input should be Uint8Array') }
      return convertRadix(Array.from(bytes), 2 ** 8, num)
    },
    decode: (digits) => {
      if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number')) { throw new Error('radix.decode input should be array of strings') }
      return Uint8Array.from(convertRadix(digits, num, 2 ** 8))
    }
  }
}
function radix2 (bits, revPadding = false) {
  assertNumber(bits)
  if (bits <= 0 || bits > 32) { throw new Error('radix2: bits should be in (0..32]') }
  if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32) { throw new Error('radix2: carry overflow') }
  return {
    encode: (bytes) => {
      if (!(bytes instanceof Uint8Array)) { throw new Error('radix2.encode input should be Uint8Array') }
      return convertRadix2(Array.from(bytes), 8, bits, !revPadding)
    },
    decode: (digits) => {
      if (!Array.isArray(digits) || (digits.length && typeof digits[0] !== 'number')) { throw new Error('radix2.decode input should be array of strings') }
      return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding))
    }
  }
}
function unsafeWrapper (fn) {
  if (typeof fn !== 'function') { throw new Error('unsafeWrapper fn should be function') }
  return function (...args) {
    try {
      return fn.apply(null, args)
    } catch (e) { }
  }
}
function checksum (len, fn) {
  assertNumber(len)
  if (typeof fn !== 'function') { throw new Error('checksum fn should be function') }
  return {
    encode (data) {
      if (!(data instanceof Uint8Array)) { throw new Error('checksum.encode: input should be Uint8Array') }
      const checksum = fn(data).slice(0, len)
      const res = new Uint8Array(data.length + len)
      res.set(data)
      res.set(checksum, data.length)
      return res
    },
    decode (data) {
      if (!(data instanceof Uint8Array)) { throw new Error('checksum.decode: input should be Uint8Array') }
      const payload = data.slice(0, -len)
      const newChecksum = fn(payload).slice(0, len)
      const oldChecksum = data.slice(-len)
      for (let i = 0; i < len; i++) {
        if (newChecksum[i] !== oldChecksum[i]) { throw new Error('Invalid checksum') }
      }
      return payload
    }
  }
}
const utils = { alphabet, chain, checksum, radix, radix2, join, padding }
const base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''))
const base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''))
const base32hex = chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''))
const base32crockford = chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize((s) => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')))
const base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''))
const base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''))
const genBase58 = (abc) => chain(radix(58), alphabet(abc), join(''))
const base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
const base58flickr = genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ')
const base58xrp = genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz')
const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11]
const base58xmr = {
  encode (data) {
    let res = ''
    for (let i = 0; i < data.length; i += 8) {
      const block = data.subarray(i, i + 8)
      res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1')
    }
    return res
  },
  decode (str) {
    let res = []
    for (let i = 0; i < str.length; i += 11) {
      const slice = str.slice(i, i + 11)
      const blockLen = XMR_BLOCK_LEN.indexOf(slice.length)
      const block = base58.decode(slice)
      for (let j = 0; j < block.length - blockLen; j++) {
        if (block[j] !== 0) { throw new Error('base58xmr: wrong padding') }
      }
      res = res.concat(Array.from(block.slice(block.length - blockLen)))
    }
    return Uint8Array.from(res)
  }
}
const base58check = (sha256) => chain(checksum(4, (data) => sha256(sha256(data))), base58)
const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''))
const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
function bech32Polymod (pre) {
  const b = pre >> 25
  let chk = (pre & 0x1ffffff) << 5
  for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
    if (((b >> i) & 1) === 1) { chk ^= POLYMOD_GENERATORS[i] }
  }
  return chk
}
function bechChecksum (prefix, words, encodingConst = 1) {
  const len = prefix.length
  let chk = 1
  for (let i = 0; i < len; i++) {
    const c = prefix.charCodeAt(i)
    if (c < 33 || c > 126) { throw new Error(`Invalid prefix (${prefix})`) }
    chk = bech32Polymod(chk) ^ (c >> 5)
  }
  chk = bech32Polymod(chk)
  for (let i = 0; i < len; i++) { chk = bech32Polymod(chk) ^ (prefix.charCodeAt(i) & 0x1f) }
  for (const v of words) { chk = bech32Polymod(chk) ^ v }
  for (let i = 0; i < 6; i++) { chk = bech32Polymod(chk) }
  chk ^= encodingConst
  return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false))
}
function genBech32 (encoding) {
  const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3
  const _words = radix2(5)
  const fromWords = _words.decode
  const toWords = _words.encode
  const fromWordsUnsafe = unsafeWrapper(fromWords)
  function encode (prefix, words, limit = 90) {
    if (typeof prefix !== 'string') { throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`) }
    if (!Array.isArray(words) || (words.length && typeof words[0] !== 'number')) { throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`) }
    const actualLength = prefix.length + 7 + words.length
    if (limit !== false && actualLength > limit) { throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`) }
    prefix = prefix.toLowerCase()
    return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`
  }
  function decode (str, limit = 90) {
    if (typeof str !== 'string') { throw new Error(`bech32.decode input should be string, not ${typeof str}`) }
    if (str.length < 8 || (limit !== false && str.length > limit)) { throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`) }
    const lowered = str.toLowerCase()
    if (str !== lowered && str !== str.toUpperCase()) { throw new Error('String must be lowercase or uppercase') }
    str = lowered
    const sepIndex = str.lastIndexOf('1')
    if (sepIndex === 0 || sepIndex === -1) { throw new Error('Letter "1" must be present between prefix and data only') }
    const prefix = str.slice(0, sepIndex)
    const _words = str.slice(sepIndex + 1)
    if (_words.length < 6) { throw new Error('Data must be at least 6 characters long') }
    const words = BECH_ALPHABET.decode(_words).slice(0, -6)
    const sum = bechChecksum(prefix, words, ENCODING_CONST)
    if (!_words.endsWith(sum)) { throw new Error(`Invalid checksum in ${str}: expected "${sum}"`) }
    return { prefix, words }
  }
  const decodeUnsafe = unsafeWrapper(decode)
  function decodeToBytes (str) {
    const { prefix, words } = decode(str, false)
    return { prefix, words, bytes: fromWords(words) }
  }
  return { encode, decode, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords }
}
const bech32$1 = genBech32('bech32')
const bech32m = genBech32('bech32m')
const utf8$1 = {
  encode: (data) => new TextDecoder().decode(data),
  decode: (str) => new TextEncoder().encode(str)
}
const hex$1 = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize((s) => {
  if (typeof s !== 'string' || s.length % 2) { throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`) }
  return s.toLowerCase()
}))
const CODERS = {
  utf8: utf8$1, hex: hex$1, base16, base32, base64, base64url, base58, base58xmr
}
const coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(', ')}`
const bytesToString = (type, bytes) => {
  if (typeof type !== 'string' || !CODERS.hasOwnProperty(type)) { throw new TypeError(coderTypeError) }
  if (!(bytes instanceof Uint8Array)) { throw new TypeError('bytesToString() expects Uint8Array') }
  return CODERS[type].encode(bytes)
}
const str = bytesToString
const stringToBytes = (type, str) => {
  if (!CODERS.hasOwnProperty(type)) { throw new TypeError(coderTypeError) }
  if (typeof str !== 'string') { throw new TypeError('stringToBytes() expects string') }
  return CODERS[type].decode(str)
}
const bytes$1 = stringToBytes

const esm = /* #__PURE__ */Object.freeze({
  __proto__: null,
  assertNumber,
  base16,
  base32,
  base32crockford,
  base32hex,
  base58,
  base58check,
  base58flickr,
  base58xmr,
  base58xrp,
  base64,
  base64url,
  bech32: bech32$1,
  bech32m,
  bytes: bytes$1,
  bytesToString,
  hex: hex$1,
  str,
  stringToBytes,
  utf8: utf8$1,
  utils
})

function number (n) {
  if (!Number.isSafeInteger(n) || n < 0) { throw new Error(`positive integer expected, not ${n}`) }
}
function bool (b) {
  if (typeof b !== 'boolean') { throw new Error(`boolean expected, not ${b}`) }
}
function isBytes$2 (a) {
  return (a instanceof Uint8Array ||
        (a != null && typeof a === 'object' && a.constructor.name === 'Uint8Array'))
}
function bytes (b, ...lengths) {
  if (!isBytes$2(b)) { throw new Error('Uint8Array expected') }
  if (lengths.length > 0 && !lengths.includes(b.length)) { throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`) }
}
function exists (instance, checkFinished = true) {
  if (instance.destroyed) { throw new Error('Hash instance has been destroyed') }
  if (checkFinished && instance.finished) { throw new Error('Hash#digest() has already been called') }
}
function output (out, instance) {
  bytes(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`)
  }
}

/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4))
// Cast array to view
const createView$1 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength)
// big-endian hardware is rare. Just in case someone still decides to run ciphers:
// early-throw an error because we don't support BE yet.
const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44
if (!isLE) { throw new Error('Non little-endian hardware is not supported') }
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes$2 (str) {
  if (typeof str !== 'string') { throw new Error(`string expected, got ${typeof str}`) }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes$1 (data) {
  if (typeof data === 'string') { data = utf8ToBytes$2(data) } else if (isBytes$2(data)) { data = data.slice() } else { throw new Error(`Uint8Array expected, got ${typeof data}`) }
  return data
}
function checkOpts (defaults, opts) {
  if (opts == null || typeof opts !== 'object') { throw new Error('options must be defined') }
  const merged = Object.assign(defaults, opts)
  return merged
}
// Compares 2 u8a-s in kinda constant time
function equalBytes$1 (a, b) {
  if (a.length !== b.length) { return false }
  let diff = 0
  for (let i = 0; i < a.length; i++) { diff |= a[i] ^ b[i] }
  return diff === 0
}
/**
 * @__NO_SIDE_EFFECTS__
 */
const wrapCipher = (params, c) => {
  Object.assign(c, params)
  return c
}

// GHash from AES-GCM and its little-endian "mirror image" Polyval from AES-SIV.
// Implemented in terms of GHash with conversion function for keys
// GCM GHASH from NIST SP800-38d, SIV from RFC 8452.
// https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
// GHASH   modulo: x^128 + x^7   + x^2   + x     + 1
// POLYVAL modulo: x^128 + x^127 + x^126 + x^121 + 1
const BLOCK_SIZE$1 = 16
// TODO: rewrite
// temporary padding buffer
const ZEROS16 = /* @__PURE__ */ new Uint8Array(16)
const ZEROS32 = u32(ZEROS16)
const POLY$1 = 0xe1 // v = 2*v % POLY
// v = 2*v % POLY
// NOTE: because x + x = 0 (add/sub is same), mul2(x) != x+x
// We can multiply any number using montgomery ladder and this function (works as double, add is simple xor)
const mul2$1 = (s0, s1, s2, s3) => {
  const hiBit = s3 & 1
  return {
    s3: (s2 << 31) | (s3 >>> 1),
    s2: (s1 << 31) | (s2 >>> 1),
    s1: (s0 << 31) | (s1 >>> 1),
    s0: (s0 >>> 1) ^ ((POLY$1 << 24) & -(hiBit & 1)) // reduce % poly
  }
}
const swapLE = (n) => (((n >>> 0) & 0xff) << 24) |
    (((n >>> 8) & 0xff) << 16) |
    (((n >>> 16) & 0xff) << 8) |
    ((n >>> 24) & 0xff) |
    0
/**
 * `mulX_POLYVAL(ByteReverse(H))` from spec
 * @param k mutated in place
 */
function _toGHASHKey (k) {
  k.reverse()
  const hiBit = k[15] & 1
  // k >>= 1
  let carry = 0
  for (let i = 0; i < k.length; i++) {
    const t = k[i]
    k[i] = (t >>> 1) | carry
    carry = (t & 1) << 7
  }
  k[0] ^= -hiBit & 0xe1 // if (hiBit) n ^= 0xe1000000000000000000000000000000;
  return k
}
const estimateWindow = (bytes) => {
  if (bytes > 64 * 1024) { return 8 }
  if (bytes > 1024) { return 4 }
  return 2
}
class GHASH {
  // We select bits per window adaptively based on expectedLength
  constructor (key, expectedLength) {
    this.blockLen = BLOCK_SIZE$1
    this.outputLen = BLOCK_SIZE$1
    this.s0 = 0
    this.s1 = 0
    this.s2 = 0
    this.s3 = 0
    this.finished = false
    key = toBytes$1(key)
    bytes(key, 16)
    const kView = createView$1(key)
    let k0 = kView.getUint32(0, false)
    let k1 = kView.getUint32(4, false)
    let k2 = kView.getUint32(8, false)
    let k3 = kView.getUint32(12, false)
    // generate table of doubled keys (half of montgomery ladder)
    const doubles = []
    for (let i = 0; i < 128; i++) {
      doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
      ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2$1(k0, k1, k2, k3))
    }
    const W = estimateWindow(expectedLength || 1024)
    if (![1, 2, 4, 8].includes(W)) { throw new Error(`ghash: wrong window size=${W}, should be 2, 4 or 8`) }
    this.W = W
    const bits = 128 // always 128 bits;
    const windows = bits / W
    const windowSize = (this.windowSize = 2 ** W)
    const items = []
    // Create precompute table for window of W bits
    for (let w = 0; w < windows; w++) {
      // truth table: 00, 01, 10, 11
      for (let byte = 0; byte < windowSize; byte++) {
        // prettier-ignore
        let s0 = 0; let s1 = 0; let s2 = 0; let s3 = 0
        for (let j = 0; j < W; j++) {
          const bit = (byte >>> (W - j - 1)) & 1
          if (!bit) { continue }
          const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
          (s0 ^= d0), (s1 ^= d1), (s2 ^= d2), (s3 ^= d3)
        }
        items.push({ s0, s1, s2, s3 })
      }
    }
    this.t = items
  }

  _updateBlock (s0, s1, s2, s3) {
    (s0 ^= this.s0), (s1 ^= this.s1), (s2 ^= this.s2), (s3 ^= this.s3)
    const { W, t, windowSize } = this
    // prettier-ignore
    let o0 = 0; let o1 = 0; let o2 = 0; let o3 = 0
    const mask = (1 << W) - 1 // 2**W will kill performance.
    let w = 0
    for (const num of [s0, s1, s2, s3]) {
      for (let bytePos = 0; bytePos < 4; bytePos++) {
        const byte = (num >>> (8 * bytePos)) & 0xff
        for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
          const bit = (byte >>> (W * bitPos)) & mask
          const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
          (o0 ^= e0), (o1 ^= e1), (o2 ^= e2), (o3 ^= e3)
          w += 1
        }
      }
    }
    this.s0 = o0
    this.s1 = o1
    this.s2 = o2
    this.s3 = o3
  }

  update (data) {
    data = toBytes$1(data)
    exists(this)
    const b32 = u32(data)
    const blocks = Math.floor(data.length / BLOCK_SIZE$1)
    const left = data.length % BLOCK_SIZE$1
    for (let i = 0; i < blocks; i++) {
      this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3])
    }
    if (left) {
      ZEROS16.set(data.subarray(blocks * BLOCK_SIZE$1))
      this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3])
      ZEROS32.fill(0) // clean tmp buffer
    }
    return this
  }

  destroy () {
    const { t } = this
    // clean precompute table
    for (const elm of t) {
      (elm.s0 = 0), (elm.s1 = 0), (elm.s2 = 0), (elm.s3 = 0)
    }
  }

  digestInto (out) {
    exists(this)
    output(out, this)
    this.finished = true
    const { s0, s1, s2, s3 } = this
    const o32 = u32(out)
    o32[0] = s0
    o32[1] = s1
    o32[2] = s2
    o32[3] = s3
    return out
  }

  digest () {
    const res = new Uint8Array(BLOCK_SIZE$1)
    this.digestInto(res)
    this.destroy()
    return res
  }
}
class Polyval extends GHASH {
  constructor (key, expectedLength) {
    key = toBytes$1(key)
    const ghKey = _toGHASHKey(key.slice())
    super(ghKey, expectedLength)
    ghKey.fill(0)
  }

  update (data) {
    data = toBytes$1(data)
    exists(this)
    const b32 = u32(data)
    const left = data.length % BLOCK_SIZE$1
    const blocks = Math.floor(data.length / BLOCK_SIZE$1)
    for (let i = 0; i < blocks; i++) {
      this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]))
    }
    if (left) {
      ZEROS16.set(data.subarray(blocks * BLOCK_SIZE$1))
      this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]))
      ZEROS32.fill(0) // clean tmp buffer
    }
    return this
  }

  digestInto (out) {
    exists(this)
    output(out, this)
    this.finished = true
    // tmp ugly hack
    const { s0, s1, s2, s3 } = this
    const o32 = u32(out)
    o32[0] = s0
    o32[1] = s1
    o32[2] = s2
    o32[3] = s3
    return out.reverse()
  }
}
function wrapConstructorWithKey$1 (hashCons) {
  const hashC = (msg, key) => hashCons(key, msg.length).update(toBytes$1(msg)).digest()
  const tmp = hashCons(new Uint8Array(16), 0)
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = (key, expectedLength) => hashCons(key, expectedLength)
  return hashC
}
wrapConstructorWithKey$1((key, expectedLength) => new GHASH(key, expectedLength))
wrapConstructorWithKey$1((key, expectedLength) => new Polyval(key, expectedLength))

// prettier-ignore
/*
AES (Advanced Encryption Standard) aka Rijndael block cipher.

Data is split into 128-bit blocks. Encrypted in 10/12/14 rounds (128/192/256 bits). In every round:
1. **S-box**, table substitution
2. **Shift rows**, cyclic shift left of all rows of data array
3. **Mix columns**, multiplying every column by fixed polynomial
4. **Add round key**, round_key xor i-th column of array

Resources:
- FIPS-197 https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf
- Original proposal: https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/aes-development/rijndael-ammended.pdf
*/
const BLOCK_SIZE = 16
const POLY = 0x11b // 1 + x + x**3 + x**4 + x**8
// TODO: remove multiplication, binary ops only
function mul2 (n) {
  return (n << 1) ^ (POLY & -(n >> 7))
}
function mul (a, b) {
  let res = 0
  for (; b > 0; b >>= 1) {
    // Montgomery ladder
    res ^= a & -(b & 1) // if (b&1) res ^=a (but const-time).
    a = mul2(a) // a = 2*a
  }
  return res
}
// AES S-box is generated using finite field inversion,
// an affine transform, and xor of a constant 0x63.
const sbox = /* @__PURE__ */ (() => {
  const t = new Uint8Array(256)
  for (let i = 0, x = 1; i < 256; i++, x ^= mul2(x)) { t[i] = x }
  const box = new Uint8Array(256)
  box[0] = 0x63 // first elm
  for (let i = 0; i < 255; i++) {
    let x = t[255 - i]
    x |= x << 8
    box[t[i]] = (x ^ (x >> 4) ^ (x >> 5) ^ (x >> 6) ^ (x >> 7) ^ 0x63) & 0xff
  }
  return box
})()
// Inverted S-box
const invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j))
// Rotate u32 by 8
const rotr32_8 = (n) => (n << 24) | (n >>> 8)
const rotl32_8 = (n) => (n << 8) | (n >>> 24)
// T-table is optimization suggested in 5.2 of original proposal (missed from FIPS-197). Changes:
// - LE instead of BE
// - bigger tables: T0 and T1 are merged into T01 table and T2 & T3 into T23;
//   so index is u16, instead of u8. This speeds up things, unexpectedly
function genTtable (sbox, fn) {
  if (sbox.length !== 256) { throw new Error('Wrong sbox length') }
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox[j]))
  const T1 = T0.map(rotl32_8)
  const T2 = T1.map(rotl32_8)
  const T3 = T2.map(rotl32_8)
  const T01 = new Uint32Array(256 * 256)
  const T23 = new Uint32Array(256 * 256)
  const sbox2 = new Uint16Array(256 * 256)
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
      const idx = i * 256 + j
      T01[idx] = T0[i] ^ T1[j]
      T23[idx] = T2[i] ^ T3[j]
      sbox2[idx] = (sbox[i] << 8) | sbox[j]
    }
  }
  return { sbox, sbox2, T0, T1, T2, T3, T01, T23 }
}
const tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => (mul(s, 3) << 24) | (s << 16) | (s << 8) | mul(s, 2))
const tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => (mul(s, 11) << 24) | (mul(s, 13) << 16) | (mul(s, 9) << 8) | mul(s, 14))
const xPowers = /* @__PURE__ */ (() => {
  const p = new Uint8Array(16)
  for (let i = 0, x = 1; i < 16; i++, x = mul2(x)) { p[i] = x }
  return p
})()
function expandKeyLE (key) {
  bytes(key)
  const len = key.length
  if (![16, 24, 32].includes(len)) { throw new Error(`aes: wrong key size: should be 16, 24 or 32, got: ${len}`) }
  const { sbox2 } = tableEncoding
  const k32 = u32(key)
  const Nk = k32.length
  const subByte = (n) => applySbox(sbox2, n, n, n, n)
  const xk = new Uint32Array(len + 28) // expanded key
  xk.set(k32)
  // 4.3.1 Key expansion
  for (let i = Nk; i < xk.length; i++) {
    let t = xk[i - 1]
    if (i % Nk === 0) { t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1] } else if (Nk > 6 && i % Nk === 4) { t = subByte(t) }
    xk[i] = xk[i - Nk] ^ t
  }
  return xk
}
function expandKeyDecLE (key) {
  const encKey = expandKeyLE(key)
  const xk = encKey.slice()
  const Nk = encKey.length
  const { sbox2 } = tableEncoding
  const { T0, T1, T2, T3 } = tableDecoding
  // Inverse key by chunks of 4 (rounds)
  for (let i = 0; i < Nk; i += 4) {
    for (let j = 0; j < 4; j++) { xk[i + j] = encKey[Nk - i - 4 + j] }
  }
  encKey.fill(0)
  // apply InvMixColumn except first & last round
  for (let i = 4; i < Nk - 4; i++) {
    const x = xk[i]
    const w = applySbox(sbox2, x, x, x, x)
    xk[i] = T0[w & 0xff] ^ T1[(w >>> 8) & 0xff] ^ T2[(w >>> 16) & 0xff] ^ T3[w >>> 24]
  }
  return xk
}
// Apply tables
function apply0123 (T01, T23, s0, s1, s2, s3) {
  return (T01[((s0 << 8) & 0xff00) | ((s1 >>> 8) & 0xff)] ^
        T23[((s2 >>> 8) & 0xff00) | ((s3 >>> 24) & 0xff)])
}
function applySbox (sbox2, s0, s1, s2, s3) {
  return (sbox2[(s0 & 0xff) | (s1 & 0xff00)] |
        (sbox2[((s2 >>> 16) & 0xff) | ((s3 >>> 16) & 0xff00)] << 16))
}
function encrypt$2 (xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding
  let k = 0;
  (s0 ^= xk[k++]), (s1 ^= xk[k++]), (s2 ^= xk[k++]), (s3 ^= xk[k++])
  const rounds = xk.length / 4 - 2
  for (let i = 0; i < rounds; i++) {
    const t0 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3)
    const t1 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0)
    const t2 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1)
    const t3 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    (s0 = t0), (s1 = t1), (s2 = t2), (s3 = t3)
  }
  // last round (without mixcolumns, so using SBOX2 table)
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3)
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0)
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1)
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2)
  return { s0: t0, s1: t1, s2: t2, s3: t3 }
}
function decrypt$2 (xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding
  let k = 0;
  (s0 ^= xk[k++]), (s1 ^= xk[k++]), (s2 ^= xk[k++]), (s3 ^= xk[k++])
  const rounds = xk.length / 4 - 2
  for (let i = 0; i < rounds; i++) {
    const t0 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1)
    const t1 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2)
    const t2 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3)
    const t3 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    (s0 = t0), (s1 = t1), (s2 = t2), (s3 = t3)
  }
  // Last round
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1)
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2)
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3)
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0)
  return { s0: t0, s1: t1, s2: t2, s3: t3 }
}
function getDst (len, dst) {
  if (!dst) { return new Uint8Array(len) }
  bytes(dst)
  if (dst.length < len) { throw new Error(`aes: wrong destination length, expected at least ${len}, got: ${dst.length}`) }
  return dst
}
function validateBlockDecrypt (data) {
  bytes(data)
  if (data.length % BLOCK_SIZE !== 0) {
    throw new Error(`aes/(cbc-ecb).decrypt ciphertext should consist of blocks with size ${BLOCK_SIZE}`)
  }
}
function validateBlockEncrypt (plaintext, pcks5, dst) {
  let outLen = plaintext.length
  const remaining = outLen % BLOCK_SIZE
  if (!pcks5 && remaining !== 0) { throw new Error('aec/(cbc-ecb): unpadded plaintext with disabled padding') }
  const b = u32(plaintext)
  if (pcks5) {
    let left = BLOCK_SIZE - remaining
    if (!left) { left = BLOCK_SIZE } // if no bytes left, create empty padding block
    outLen = outLen + left
  }
  const out = getDst(outLen, dst)
  const o = u32(out)
  return { b, o, out }
}
function validatePCKS (data, pcks5) {
  if (!pcks5) { return data }
  const len = data.length
  if (!len) { throw new Error('aes/pcks5: empty ciphertext not allowed') }
  const lastByte = data[len - 1]
  if (lastByte <= 0 || lastByte > 16) { throw new Error(`aes/pcks5: wrong padding byte: ${lastByte}`) }
  const out = data.subarray(0, -lastByte)
  for (let i = 0; i < lastByte; i++) {
    if (data[len - i - 1] !== lastByte) { throw new Error('aes/pcks5: wrong padding') }
  }
  return out
}
function padPCKS (left) {
  const tmp = new Uint8Array(16)
  const tmp32 = u32(tmp)
  tmp.set(left)
  const paddingByte = BLOCK_SIZE - left.length
  for (let i = BLOCK_SIZE - paddingByte; i < BLOCK_SIZE; i++) { tmp[i] = paddingByte }
  return tmp32
}
/**
 * CBC: Cipher-Block-Chaining. Key is previous round’s block.
 * Fragile: needs proper padding. Unauthenticated: needs MAC.
 */
const cbc = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cbc (key, iv, opts = {}) {
  bytes(key)
  bytes(iv, 16)
  const pcks5 = !opts.disablePadding
  return {
    encrypt: (plaintext, dst) => {
      const xk = expandKeyLE(key)
      const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst)
      const n32 = u32(iv)
      // prettier-ignore
      let s0 = n32[0]; let s1 = n32[1]; let s2 = n32[2]; let s3 = n32[3]
      let i = 0
      for (; i + 4 <= b.length;) {
        (s0 ^= b[i + 0]), (s1 ^= b[i + 1]), (s2 ^= b[i + 2]), (s3 ^= b[i + 3]);
        ({ s0, s1, s2, s3 } = encrypt$2(xk, s0, s1, s2, s3));
        (o[i++] = s0), (o[i++] = s1), (o[i++] = s2), (o[i++] = s3)
      }
      if (pcks5) {
        const tmp32 = padPCKS(plaintext.subarray(i * 4));
        (s0 ^= tmp32[0]), (s1 ^= tmp32[1]), (s2 ^= tmp32[2]), (s3 ^= tmp32[3]);
        ({ s0, s1, s2, s3 } = encrypt$2(xk, s0, s1, s2, s3));
        (o[i++] = s0), (o[i++] = s1), (o[i++] = s2), (o[i++] = s3)
      }
      xk.fill(0)
      return _out
    },
    decrypt: (ciphertext, dst) => {
      validateBlockDecrypt(ciphertext)
      const xk = expandKeyDecLE(key)
      const n32 = u32(iv)
      const out = getDst(ciphertext.length, dst)
      const b = u32(ciphertext)
      const o = u32(out)
      // prettier-ignore
      let s0 = n32[0]; let s1 = n32[1]; let s2 = n32[2]; let s3 = n32[3]
      for (let i = 0; i + 4 <= b.length;) {
        // prettier-ignore
        const ps0 = s0; const ps1 = s1; const ps2 = s2; const ps3 = s3;
        (s0 = b[i + 0]), (s1 = b[i + 1]), (s2 = b[i + 2]), (s3 = b[i + 3])
        const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt$2(xk, s0, s1, s2, s3);
        (o[i++] = o0 ^ ps0), (o[i++] = o1 ^ ps1), (o[i++] = o2 ^ ps2), (o[i++] = o3 ^ ps3)
      }
      xk.fill(0)
      return validatePCKS(out, pcks5)
    }
  }
})

// Poly1305 is a fast and parallel secret-key message-authentication code.
// https://cr.yp.to/mac.html, https://cr.yp.to/mac/poly1305-20050329.pdf
// https://datatracker.ietf.org/doc/html/rfc8439
// Based on Public Domain poly1305-donna https://github.com/floodyberry/poly1305-donna
const u8to16 = (a, i) => (a[i++] & 0xff) | ((a[i++] & 0xff) << 8)
class Poly1305 {
  constructor (key) {
    this.blockLen = 16
    this.outputLen = 16
    this.buffer = new Uint8Array(16)
    this.r = new Uint16Array(10)
    this.h = new Uint16Array(10)
    this.pad = new Uint16Array(8)
    this.pos = 0
    this.finished = false
    key = toBytes$1(key)
    bytes(key, 32)
    const t0 = u8to16(key, 0)
    const t1 = u8to16(key, 2)
    const t2 = u8to16(key, 4)
    const t3 = u8to16(key, 6)
    const t4 = u8to16(key, 8)
    const t5 = u8to16(key, 10)
    const t6 = u8to16(key, 12)
    const t7 = u8to16(key, 14)
    // https://github.com/floodyberry/poly1305-donna/blob/e6ad6e091d30d7f4ec2d4f978be1fcfcbce72781/poly1305-donna-16.h#L47
    this.r[0] = t0 & 0x1fff
    this.r[1] = ((t0 >>> 13) | (t1 << 3)) & 0x1fff
    this.r[2] = ((t1 >>> 10) | (t2 << 6)) & 0x1f03
    this.r[3] = ((t2 >>> 7) | (t3 << 9)) & 0x1fff
    this.r[4] = ((t3 >>> 4) | (t4 << 12)) & 0x00ff
    this.r[5] = (t4 >>> 1) & 0x1ffe
    this.r[6] = ((t4 >>> 14) | (t5 << 2)) & 0x1fff
    this.r[7] = ((t5 >>> 11) | (t6 << 5)) & 0x1f81
    this.r[8] = ((t6 >>> 8) | (t7 << 8)) & 0x1fff
    this.r[9] = (t7 >>> 5) & 0x007f
    for (let i = 0; i < 8; i++) { this.pad[i] = u8to16(key, 16 + 2 * i) }
  }

  process (data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11
    const { h, r } = this
    const r0 = r[0]
    const r1 = r[1]
    const r2 = r[2]
    const r3 = r[3]
    const r4 = r[4]
    const r5 = r[5]
    const r6 = r[6]
    const r7 = r[7]
    const r8 = r[8]
    const r9 = r[9]
    const t0 = u8to16(data, offset + 0)
    const t1 = u8to16(data, offset + 2)
    const t2 = u8to16(data, offset + 4)
    const t3 = u8to16(data, offset + 6)
    const t4 = u8to16(data, offset + 8)
    const t5 = u8to16(data, offset + 10)
    const t6 = u8to16(data, offset + 12)
    const t7 = u8to16(data, offset + 14)
    const h0 = h[0] + (t0 & 0x1fff)
    const h1 = h[1] + (((t0 >>> 13) | (t1 << 3)) & 0x1fff)
    const h2 = h[2] + (((t1 >>> 10) | (t2 << 6)) & 0x1fff)
    const h3 = h[3] + (((t2 >>> 7) | (t3 << 9)) & 0x1fff)
    const h4 = h[4] + (((t3 >>> 4) | (t4 << 12)) & 0x1fff)
    const h5 = h[5] + ((t4 >>> 1) & 0x1fff)
    const h6 = h[6] + (((t4 >>> 14) | (t5 << 2)) & 0x1fff)
    const h7 = h[7] + (((t5 >>> 11) | (t6 << 5)) & 0x1fff)
    const h8 = h[8] + (((t6 >>> 8) | (t7 << 8)) & 0x1fff)
    const h9 = h[9] + ((t7 >>> 5) | hibit)
    let c = 0
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6)
    c = d0 >>> 13
    d0 &= 0x1fff
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1)
    c += d0 >>> 13
    d0 &= 0x1fff
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7)
    c = d1 >>> 13
    d1 &= 0x1fff
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2)
    c += d1 >>> 13
    d1 &= 0x1fff
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8)
    c = d2 >>> 13
    d2 &= 0x1fff
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3)
    c += d2 >>> 13
    d2 &= 0x1fff
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9)
    c = d3 >>> 13
    d3 &= 0x1fff
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4)
    c += d3 >>> 13
    d3 &= 0x1fff
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0
    c = d4 >>> 13
    d4 &= 0x1fff
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5)
    c += d4 >>> 13
    d4 &= 0x1fff
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1
    c = d5 >>> 13
    d5 &= 0x1fff
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6)
    c += d5 >>> 13
    d5 &= 0x1fff
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2
    c = d6 >>> 13
    d6 &= 0x1fff
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7)
    c += d6 >>> 13
    d6 &= 0x1fff
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3
    c = d7 >>> 13
    d7 &= 0x1fff
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8)
    c += d7 >>> 13
    d7 &= 0x1fff
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4
    c = d8 >>> 13
    d8 &= 0x1fff
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9)
    c += d8 >>> 13
    d8 &= 0x1fff
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5
    c = d9 >>> 13
    d9 &= 0x1fff
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0
    c += d9 >>> 13
    d9 &= 0x1fff
    c = ((c << 2) + c) | 0
    c = (c + d0) | 0
    d0 = c & 0x1fff
    c = c >>> 13
    d1 += c
    h[0] = d0
    h[1] = d1
    h[2] = d2
    h[3] = d3
    h[4] = d4
    h[5] = d5
    h[6] = d6
    h[7] = d7
    h[8] = d8
    h[9] = d9
  }

  finalize () {
    const { h, pad } = this
    const g = new Uint16Array(10)
    let c = h[1] >>> 13
    h[1] &= 0x1fff
    for (let i = 2; i < 10; i++) {
      h[i] += c
      c = h[i] >>> 13
      h[i] &= 0x1fff
    }
    h[0] += c * 5
    c = h[0] >>> 13
    h[0] &= 0x1fff
    h[1] += c
    c = h[1] >>> 13
    h[1] &= 0x1fff
    h[2] += c
    g[0] = h[0] + 5
    c = g[0] >>> 13
    g[0] &= 0x1fff
    for (let i = 1; i < 10; i++) {
      g[i] = h[i] + c
      c = g[i] >>> 13
      g[i] &= 0x1fff
    }
    g[9] -= 1 << 13
    let mask = (c ^ 1) - 1
    for (let i = 0; i < 10; i++) { g[i] &= mask }
    mask = ~mask
    for (let i = 0; i < 10; i++) { h[i] = (h[i] & mask) | g[i] }
    h[0] = (h[0] | (h[1] << 13)) & 0xffff
    h[1] = ((h[1] >>> 3) | (h[2] << 10)) & 0xffff
    h[2] = ((h[2] >>> 6) | (h[3] << 7)) & 0xffff
    h[3] = ((h[3] >>> 9) | (h[4] << 4)) & 0xffff
    h[4] = ((h[4] >>> 12) | (h[5] << 1) | (h[6] << 14)) & 0xffff
    h[5] = ((h[6] >>> 2) | (h[7] << 11)) & 0xffff
    h[6] = ((h[7] >>> 5) | (h[8] << 8)) & 0xffff
    h[7] = ((h[8] >>> 8) | (h[9] << 5)) & 0xffff
    let f = h[0] + pad[0]
    h[0] = f & 0xffff
    for (let i = 1; i < 8; i++) {
      f = (((h[i] + pad[i]) | 0) + (f >>> 16)) | 0
      h[i] = f & 0xffff
    }
  }

  update (data) {
    exists(this)
    const { buffer, blockLen } = this
    data = toBytes$1(data)
    const len = data.length
    for (let pos = 0; pos < len;) {
      const take = Math.min(blockLen - this.pos, len - pos)
      // Fast path: we have at least one block in input
      if (take === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen) { this.process(data, pos) }
        continue
      }
      buffer.set(data.subarray(pos, pos + take), this.pos)
      this.pos += take
      pos += take
      if (this.pos === blockLen) {
        this.process(buffer, 0, false)
        this.pos = 0
      }
    }
    return this
  }

  destroy () {
    this.h.fill(0)
    this.r.fill(0)
    this.buffer.fill(0)
    this.pad.fill(0)
  }

  digestInto (out) {
    exists(this)
    output(out, this)
    this.finished = true
    const { buffer, h } = this
    let { pos } = this
    if (pos) {
      buffer[pos++] = 1
      // buffer.subarray(pos).fill(0);
      for (; pos < 16; pos++) { buffer[pos] = 0 }
      this.process(buffer, 0, true)
    }
    this.finalize()
    let opos = 0
    for (let i = 0; i < 8; i++) {
      out[opos++] = h[i] >>> 0
      out[opos++] = h[i] >>> 8
    }
    return out
  }

  digest () {
    const { buffer, outputLen } = this
    this.digestInto(buffer)
    const res = buffer.slice(0, outputLen)
    this.destroy()
    return res
  }
}
function wrapConstructorWithKey (hashCons) {
  const hashC = (msg, key) => hashCons(key).update(toBytes$1(msg)).digest()
  const tmp = hashCons(new Uint8Array(32))
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = (key) => hashCons(key)
  return hashC
}
wrapConstructorWithKey((key) => new Poly1305(key))

// Basic utils for ARX (add-rotate-xor) salsa and chacha ciphers.
/*
RFC8439 requires multi-step cipher stream, where
authKey starts with counter: 0, actual msg with counter: 1.

For this, we need a way to re-use nonce / counter:

    const counter = new Uint8Array(4);
    chacha(..., counter, ...); // counter is now 1
    chacha(..., counter, ...); // counter is now 2

This is complicated:

- 32-bit counters are enough, no need for 64-bit: max ArrayBuffer size in JS is 4GB
- Original papers don't allow mutating counters
- Counter overflow is undefined [^1]
- Idea A: allow providing (nonce | counter) instead of just nonce, re-use it
- Caveat: Cannot be re-used through all cases:
- * chacha has (counter | nonce)
- * xchacha has (nonce16 | counter | nonce16)
- Idea B: separate nonce / counter and provide separate API for counter re-use
- Caveat: there are different counter sizes depending on an algorithm.
- salsa & chacha also differ in structures of key & sigma:
  salsa20:      s[0] | k(4) | s[1] | nonce(2) | ctr(2) | s[2] | k(4) | s[3]
  chacha:       s(4) | k(8) | ctr(1) | nonce(3)
  chacha20orig: s(4) | k(8) | ctr(2) | nonce(2)
- Idea C: helper method such as `setSalsaState(key, nonce, sigma, data)`
- Caveat: we can't re-use counter array

xchacha [^2] uses the subkey and remaining 8 byte nonce with ChaCha20 as normal
(prefixed by 4 NUL bytes, since [RFC8439] specifies a 12-byte nonce).

[^1]: https://mailarchive.ietf.org/arch/msg/cfrg/gsOnTJzcbgG6OqD8Sc0GO5aR_tU/
[^2]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha#appendix-A.2
*/
// We can't make top-level var depend on utils.utf8ToBytes
// because it's not present in all envs. Creating a similar fn here
const _utf8ToBytes = (str) => Uint8Array.from(str.split('').map((c) => c.charCodeAt(0)))
const sigma16 = _utf8ToBytes('expand 16-byte k')
const sigma32 = _utf8ToBytes('expand 32-byte k')
const sigma16_32 = u32(sigma16)
const sigma32_32 = u32(sigma32)
sigma32_32.slice()
function rotl (a, b) {
  return (a << b) | (a >>> (32 - b))
}
// Is byte array aligned to 4 byte offset (u32)?
function isAligned32 (b) {
  return b.byteOffset % 4 === 0
}
// Salsa and Chacha block length is always 512-bit
const BLOCK_LEN = 64
const BLOCK_LEN32 = 16
// new Uint32Array([2**32])   // => Uint32Array(1) [ 0 ]
// new Uint32Array([2**32-1]) // => Uint32Array(1) [ 4294967295 ]
const MAX_COUNTER = 2 ** 32 - 1
const U32_EMPTY = new Uint32Array()
function runCipher (core, sigma, key, nonce, data, output, counter, rounds) {
  const len = data.length
  const block = new Uint8Array(BLOCK_LEN)
  const b32 = u32(block)
  // Make sure that buffers aligned to 4 bytes
  const isAligned = isAligned32(data) && isAligned32(output)
  const d32 = isAligned ? u32(data) : U32_EMPTY
  const o32 = isAligned ? u32(output) : U32_EMPTY
  for (let pos = 0; pos < len; counter++) {
    core(sigma, key, nonce, b32, counter, rounds)
    if (counter >= MAX_COUNTER) { throw new Error('arx: counter overflow') }
    const take = Math.min(BLOCK_LEN, len - pos)
    // aligned to 4 bytes
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4
      if (pos % 4 !== 0) { throw new Error('arx: invalid block position') }
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j
        o32[posj] = d32[posj] ^ b32[j]
      }
      pos += BLOCK_LEN
      continue
    }
    for (let j = 0, posj; j < take; j++) {
      posj = pos + j
      output[posj] = data[posj] ^ block[j]
    }
    pos += take
  }
}
function createCipher (core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts)
  if (typeof core !== 'function') { throw new Error('core must be a function') }
  number(counterLength)
  number(rounds)
  bool(counterRight)
  bool(allowShortKeys)
  return (key, nonce, data, output, counter = 0) => {
    bytes(key)
    bytes(nonce)
    bytes(data)
    const len = data.length
    if (!output) { output = new Uint8Array(len) }
    bytes(output)
    number(counter)
    if (counter < 0 || counter >= MAX_COUNTER) { throw new Error('arx: counter overflow') }
    if (output.length < len) { throw new Error(`arx: output (${output.length}) is shorter than data (${len})`) }
    const toClean = []
    // Key & sigma
    // key=16 -> sigma16, k=key|key
    // key=32 -> sigma32, k=key
    const l = key.length; let k; let sigma
    if (l === 32) {
      k = key.slice()
      toClean.push(k)
      sigma = sigma32_32
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32)
      k.set(key)
      k.set(key, 16)
      sigma = sigma16_32
      toClean.push(k)
    } else {
      throw new Error(`arx: invalid 32-byte key, got length=${l}`)
    }
    // Nonce
    // salsa20:      8   (8-byte counter)
    // chacha20orig: 8   (8-byte counter)
    // chacha20:     12  (4-byte counter)
    // xsalsa20:     24  (16 -> hsalsa,  8 -> old nonce)
    // xchacha20:    24  (16 -> hchacha, 8 -> old nonce)
    // Align nonce to 4 bytes
    if (!isAligned32(nonce)) {
      nonce = nonce.slice()
      toClean.push(nonce)
    }
    const k32 = u32(k)
    // hsalsa & hchacha: handle extended nonce
    if (extendNonceFn) {
      if (nonce.length !== 24) { throw new Error('arx: extended nonce must be 24 bytes') }
      extendNonceFn(sigma, k32, u32(nonce.subarray(0, 16)), k32)
      nonce = nonce.subarray(16)
    }
    // Handle nonce counter
    const nonceNcLen = 16 - counterLength
    if (nonceNcLen !== nonce.length) { throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`) }
    // Pad counter when nonce is 64 bit
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12)
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length)
      nonce = nc
      toClean.push(nonce)
    }
    const n32 = u32(nonce)
    runCipher(core, sigma, k32, n32, data, output, counter, rounds)
    while (toClean.length > 0) { toClean.pop().fill(0) }
    return output
  }
}

// prettier-ignore
// ChaCha20 stream cipher was released in 2008. ChaCha aims to increase
// the diffusion per round, but had slightly less cryptanalysis.
// https://cr.yp.to/chacha.html, http://cr.yp.to/chacha/chacha-20080128.pdf
/**
 * ChaCha core function.
 */
// prettier-ignore
function chachaCore (s, k, n, out, cnt, rounds = 20) {
  const y00 = s[0]; const y01 = s[1]; const y02 = s[2]; const y03 = s[3] // "expa"   "nd 3"  "2-by"  "te k"
  const y04 = k[0]; const y05 = k[1]; const y06 = k[2]; const y07 = k[3] // Key      Key     Key     Key
  const y08 = k[4]; const y09 = k[5]; const y10 = k[6]; const y11 = k[7] // Key      Key     Key     Key
  const y12 = cnt; const y13 = n[0]; const y14 = n[1]; const y15 = n[2] // Counter  Counter	Nonce   Nonce
  // Save state to temporary variables
  let x00 = y00; let x01 = y01; let x02 = y02; let x03 = y03; let x04 = y04; let x05 = y05; let x06 = y06; let x07 = y07; let x08 = y08; let x09 = y09; let x10 = y10; let x11 = y11; let x12 = y12; let x13 = y13; let x14 = y14; let x15 = y15
  for (let r = 0; r < rounds; r += 2) {
    x00 = (x00 + x04) | 0
    x12 = rotl(x12 ^ x00, 16)
    x08 = (x08 + x12) | 0
    x04 = rotl(x04 ^ x08, 12)
    x00 = (x00 + x04) | 0
    x12 = rotl(x12 ^ x00, 8)
    x08 = (x08 + x12) | 0
    x04 = rotl(x04 ^ x08, 7)
    x01 = (x01 + x05) | 0
    x13 = rotl(x13 ^ x01, 16)
    x09 = (x09 + x13) | 0
    x05 = rotl(x05 ^ x09, 12)
    x01 = (x01 + x05) | 0
    x13 = rotl(x13 ^ x01, 8)
    x09 = (x09 + x13) | 0
    x05 = rotl(x05 ^ x09, 7)
    x02 = (x02 + x06) | 0
    x14 = rotl(x14 ^ x02, 16)
    x10 = (x10 + x14) | 0
    x06 = rotl(x06 ^ x10, 12)
    x02 = (x02 + x06) | 0
    x14 = rotl(x14 ^ x02, 8)
    x10 = (x10 + x14) | 0
    x06 = rotl(x06 ^ x10, 7)
    x03 = (x03 + x07) | 0
    x15 = rotl(x15 ^ x03, 16)
    x11 = (x11 + x15) | 0
    x07 = rotl(x07 ^ x11, 12)
    x03 = (x03 + x07) | 0
    x15 = rotl(x15 ^ x03, 8)
    x11 = (x11 + x15) | 0
    x07 = rotl(x07 ^ x11, 7)
    x00 = (x00 + x05) | 0
    x15 = rotl(x15 ^ x00, 16)
    x10 = (x10 + x15) | 0
    x05 = rotl(x05 ^ x10, 12)
    x00 = (x00 + x05) | 0
    x15 = rotl(x15 ^ x00, 8)
    x10 = (x10 + x15) | 0
    x05 = rotl(x05 ^ x10, 7)
    x01 = (x01 + x06) | 0
    x12 = rotl(x12 ^ x01, 16)
    x11 = (x11 + x12) | 0
    x06 = rotl(x06 ^ x11, 12)
    x01 = (x01 + x06) | 0
    x12 = rotl(x12 ^ x01, 8)
    x11 = (x11 + x12) | 0
    x06 = rotl(x06 ^ x11, 7)
    x02 = (x02 + x07) | 0
    x13 = rotl(x13 ^ x02, 16)
    x08 = (x08 + x13) | 0
    x07 = rotl(x07 ^ x08, 12)
    x02 = (x02 + x07) | 0
    x13 = rotl(x13 ^ x02, 8)
    x08 = (x08 + x13) | 0
    x07 = rotl(x07 ^ x08, 7)
    x03 = (x03 + x04) | 0
    x14 = rotl(x14 ^ x03, 16)
    x09 = (x09 + x14) | 0
    x04 = rotl(x04 ^ x09, 12)
    x03 = (x03 + x04) | 0
    x14 = rotl(x14 ^ x03, 8)
    x09 = (x09 + x14) | 0
    x04 = rotl(x04 ^ x09, 7)
  }
  // Write output
  let oi = 0
  out[oi++] = (y00 + x00) | 0
  out[oi++] = (y01 + x01) | 0
  out[oi++] = (y02 + x02) | 0
  out[oi++] = (y03 + x03) | 0
  out[oi++] = (y04 + x04) | 0
  out[oi++] = (y05 + x05) | 0
  out[oi++] = (y06 + x06) | 0
  out[oi++] = (y07 + x07) | 0
  out[oi++] = (y08 + x08) | 0
  out[oi++] = (y09 + x09) | 0
  out[oi++] = (y10 + x10) | 0
  out[oi++] = (y11 + x11) | 0
  out[oi++] = (y12 + x12) | 0
  out[oi++] = (y13 + x13) | 0
  out[oi++] = (y14 + x14) | 0
  out[oi++] = (y15 + x15) | 0
}
/**
 * ChaCha stream cipher. Conforms to RFC 8439 (IETF, TLS). 12-byte nonce, 4-byte counter.
 * With 12-byte nonce, it's not safe to use fill it with random (CSPRNG), due to collision chance.
 */
const chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 4,
  allowShortKeys: false
})

// HMAC (RFC 2104)
const HMAC$1 = class HMAC extends Hash$1 {
  constructor (hash, _key) {
    super()
    this.finished = false
    this.destroyed = false
    assert.hash(hash)
    const key = toBytes$2(_key)
    this.iHash = hash.create()
    if (typeof this.iHash.update !== 'function') { throw new Error('Expected instance of class which extends utils.Hash') }
    this.blockLen = this.iHash.blockLen
    this.outputLen = this.iHash.outputLen
    const blockLen = this.blockLen
    const pad = new Uint8Array(blockLen)
    // blockLen can be bigger than outputLen
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key)
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 }
    this.iHash.update(pad)
    // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
    this.oHash = hash.create()
    // Undo internal XOR && apply outer XOR
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 ^ 0x5c }
    this.oHash.update(pad)
    pad.fill(0)
  }

  update (buf) {
    assert.exists(this)
    this.iHash.update(buf)
    return this
  }

  digestInto (out) {
    assert.exists(this)
    assert.bytes(out, this.outputLen)
    this.finished = true
    this.iHash.digestInto(out)
    this.oHash.update(out)
    this.oHash.digestInto(out)
    this.destroy()
  }

  digest () {
    const out = new Uint8Array(this.oHash.outputLen)
    this.digestInto(out)
    return out
  }

  _cloneInto (to) {
    // Create new instance without calling constructor since key already in state and we don't know it.
    to || (to = Object.create(Object.getPrototypeOf(this), {}))
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this
    to = to
    to.finished = finished
    to.destroyed = destroyed
    to.blockLen = blockLen
    to.outputLen = outputLen
    to.oHash = oHash._cloneInto(to.oHash)
    to.iHash = iHash._cloneInto(to.iHash)
    return to
  }

  destroy () {
    this.destroyed = true
    this.oHash.destroy()
    this.iHash.destroy()
  }
}
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 */
const hmac$1 = (hash, key, message) => new HMAC$1(hash, key).update(message).digest()
hmac$1.create = (hash, key) => new HMAC$1(hash, key)

// HKDF (RFC 5869)
// https://soatok.blog/2021/11/17/understanding-hkdf/
/**
 * HKDF-Extract(IKM, salt) -> PRK
 * Arguments position differs from spec (IKM is first one, since it is not optional)
 * @param hash
 * @param ikm
 * @param salt
 * @returns
 */
function extract (hash, ikm, salt) {
  assert.hash(hash)
  return hmac$1(hash, toBytes$2(salt), toBytes$2(ikm))
}
// HKDF-Expand(PRK, info, L) -> OKM
const HKDF_COUNTER = new Uint8Array([0])
const EMPTY_BUFFER = new Uint8Array()
/**
 * HKDF-expand from the spec.
 * @param prk - a pseudorandom key of at least HashLen octets (usually, the output from the extract step)
 * @param info - optional context and application specific information (can be a zero-length string)
 * @param length - length of output keying material in octets
 */
function expand (hash, prk, info, length = 32) {
  assert.hash(hash)
  assert.number(length)
  if (length > 255 * hash.outputLen) { throw new Error('Length should be <= 255*HashLen') }
  const blocks = Math.ceil(length / hash.outputLen)
  if (info === undefined) { info = EMPTY_BUFFER }
  // first L(ength) octets of T
  const okm = new Uint8Array(blocks * hash.outputLen)
  // Re-use HMAC instance between blocks
  const HMAC = hmac$1.create(hash, prk)
  const HMACTmp = HMAC._cloneInto()
  const T = new Uint8Array(HMAC.outputLen)
  for (let counter = 0; counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1
    // T(0) = empty string (zero length)
    // T(N) = HMAC-Hash(PRK, T(N-1) | info | N)
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T)
      .update(info)
      .update(HKDF_COUNTER)
      .digestInto(T)
    okm.set(T, hash.outputLen * counter)
    HMAC._cloneInto(HMACTmp)
  }
  HMAC.destroy()
  HMACTmp.destroy()
  T.fill(0)
  HKDF_COUNTER.fill(0)
  return okm.slice(0, length)
}

const __defProp = Object.defineProperty
const __export = (target, all) => {
  for (const name in all) { __defProp(target, name, { get: all[name], enumerable: true }) }
}

// core.ts
const verifiedSymbol = Symbol('verified')
const isRecord = (obj) => obj instanceof Object
function validateEvent (event) {
  if (!isRecord(event)) { return false }
  if (typeof event.kind !== 'number') { return false }
  if (typeof event.content !== 'string') { return false }
  if (typeof event.created_at !== 'number') { return false }
  if (typeof event.pubkey !== 'string') { return false }
  if (!event.pubkey.match(/^[a-f0-9]{64}$/)) { return false }
  if (!Array.isArray(event.tags)) { return false }
  for (let i2 = 0; i2 < event.tags.length; i2++) {
    const tag = event.tags[i2]
    if (!Array.isArray(tag)) { return false }
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === 'object') { return false }
    }
  }
  return true
}

// utils.ts
const utils_exports = {}
__export(utils_exports, {
  Queue: () => Queue,
  QueueNode: () => QueueNode,
  binarySearch: () => binarySearch,
  insertEventIntoAscendingList: () => insertEventIntoAscendingList,
  insertEventIntoDescendingList: () => insertEventIntoDescendingList,
  normalizeURL: () => normalizeURL,
  utf8Decoder: () => utf8Decoder,
  utf8Encoder: () => utf8Encoder
})
var utf8Decoder = new TextDecoder('utf-8')
var utf8Encoder = new TextEncoder()
function normalizeURL (url) {
  if (url.indexOf('://') === -1) { url = 'wss://' + url }
  const p = new URL(url)
  p.pathname = p.pathname.replace(/\/+/g, '/')
  if (p.pathname.endsWith('/')) { p.pathname = p.pathname.slice(0, -1) }
  if (p.port === '80' && p.protocol === 'ws:' || p.port === '443' && p.protocol === 'wss:') { p.port = '' }
  p.searchParams.sort()
  p.hash = ''
  return p.toString()
}
function insertEventIntoDescendingList (sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id) { return 0 }
    if (event.created_at === b.created_at) { return -1 }
    return b.created_at - event.created_at
  })
  if (!found) {
    sortedArray.splice(idx, 0, event)
  }
  return sortedArray
}
function insertEventIntoAscendingList (sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id) { return 0 }
    if (event.created_at === b.created_at) { return -1 }
    return event.created_at - b.created_at
  })
  if (!found) {
    sortedArray.splice(idx, 0, event)
  }
  return sortedArray
}
function binarySearch (arr, compare) {
  let start = 0
  let end = arr.length - 1
  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    const cmp = compare(arr[mid])
    if (cmp === 0) {
      return [mid, true]
    }
    if (cmp < 0) {
      end = mid - 1
    } else {
      start = mid + 1
    }
  }
  return [start, false]
}
var QueueNode = class {
  value
  next = null
  prev = null
  constructor (message) {
    this.value = message
  }
}
var Queue = class {
  first
  last
  constructor () {
    this.first = null
    this.last = null
  }

  enqueue (value) {
    const newNode = new QueueNode(value)
    if (!this.last) {
      this.first = newNode
      this.last = newNode
    } else if (this.last === this.first) {
      this.last = newNode
      this.last.prev = this.first
      this.first.next = newNode
    } else {
      newNode.prev = this.last
      this.last.next = newNode
      this.last = newNode
    }
    return true
  }

  dequeue () {
    if (!this.first) { return null }
    if (this.first === this.last) {
      const target2 = this.first
      this.first = null
      this.last = null
      return target2.value
    }
    const target = this.first
    this.first = target.next
    return target.value
  }
}

// pure.ts
const JS = class {
  generateSecretKey () {
    return schnorr$1.utils.randomPrivateKey()
  }

  getPublicKey (secretKey) {
    return bytesToHex$2(schnorr$1.getPublicKey(secretKey))
  }

  finalizeEvent (t, secretKey) {
    const event = t
    event.pubkey = bytesToHex$2(schnorr$1.getPublicKey(secretKey))
    event.id = getEventHash$1(event)
    event.sig = bytesToHex$2(schnorr$1.sign(getEventHash$1(event), secretKey))
    event[verifiedSymbol] = true
    return event
  }

  verifyEvent (event) {
    if (typeof event[verifiedSymbol] === 'boolean') { return event[verifiedSymbol] }
    const hash = getEventHash$1(event)
    if (hash !== event.id) {
      event[verifiedSymbol] = false
      return false
    }
    try {
      const valid = schnorr$1.verify(event.sig, hash, event.pubkey)
      event[verifiedSymbol] = valid
      return valid
    } catch (err) {
      event[verifiedSymbol] = false
      return false
    }
  }
}
function serializeEvent (evt) {
  if (!validateEvent(evt)) { throw new Error("can't serialize event with wrong or missing properties") }
  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content])
}
function getEventHash$1 (event) {
  const eventHash = sha256$1(utf8Encoder.encode(serializeEvent(event)))
  return bytesToHex$2(eventHash)
}
const i = new JS()
const generateSecretKey = i.generateSecretKey
const getPublicKey = i.getPublicKey
const finalizeEvent = i.finalizeEvent
const verifyEvent = i.verifyEvent

// kinds.ts
const kinds_exports = {}
__export(kinds_exports, {
  Application: () => Application,
  BadgeAward: () => BadgeAward,
  BadgeDefinition: () => BadgeDefinition,
  BlockedRelaysList: () => BlockedRelaysList,
  BookmarkList: () => BookmarkList,
  Bookmarksets: () => Bookmarksets,
  Calendar: () => Calendar,
  CalendarEventRSVP: () => CalendarEventRSVP,
  ChannelCreation: () => ChannelCreation,
  ChannelHideMessage: () => ChannelHideMessage,
  ChannelMessage: () => ChannelMessage,
  ChannelMetadata: () => ChannelMetadata,
  ChannelMuteUser: () => ChannelMuteUser,
  ClassifiedListing: () => ClassifiedListing,
  ClientAuth: () => ClientAuth,
  CommunitiesList: () => CommunitiesList,
  CommunityDefinition: () => CommunityDefinition,
  CommunityPostApproval: () => CommunityPostApproval,
  Contacts: () => Contacts,
  CreateOrUpdateProduct: () => CreateOrUpdateProduct,
  CreateOrUpdateStall: () => CreateOrUpdateStall,
  Curationsets: () => Curationsets,
  Date: () => Date2,
  DirectMessageRelaysList: () => DirectMessageRelaysList,
  DraftClassifiedListing: () => DraftClassifiedListing,
  DraftLong: () => DraftLong,
  Emojisets: () => Emojisets,
  EncryptedDirectMessage: () => EncryptedDirectMessage,
  EventDeletion: () => EventDeletion,
  FileMetadata: () => FileMetadata,
  FileServerPreference: () => FileServerPreference,
  Followsets: () => Followsets,
  GenericRepost: () => GenericRepost,
  Genericlists: () => Genericlists,
  GiftWrap: () => GiftWrap,
  HTTPAuth: () => HTTPAuth,
  Handlerinformation: () => Handlerinformation,
  Handlerrecommendation: () => Handlerrecommendation,
  Highlights: () => Highlights,
  InterestsList: () => InterestsList,
  Interestsets: () => Interestsets,
  JobFeedback: () => JobFeedback,
  JobRequest: () => JobRequest,
  JobResult: () => JobResult,
  Label: () => Label,
  LightningPubRPC: () => LightningPubRPC,
  LiveChatMessage: () => LiveChatMessage,
  LiveEvent: () => LiveEvent,
  LongFormArticle: () => LongFormArticle,
  Metadata: () => Metadata,
  Mutelist: () => Mutelist,
  NWCWalletInfo: () => NWCWalletInfo,
  NWCWalletRequest: () => NWCWalletRequest,
  NWCWalletResponse: () => NWCWalletResponse,
  NostrConnect: () => NostrConnect,
  OpenTimestamps: () => OpenTimestamps,
  Pinlist: () => Pinlist,
  PrivateDirectMessage: () => PrivateDirectMessage,
  ProblemTracker: () => ProblemTracker,
  ProfileBadges: () => ProfileBadges,
  PublicChatsList: () => PublicChatsList,
  Reaction: () => Reaction,
  RecommendRelay: () => RecommendRelay,
  RelayList: () => RelayList,
  Relaysets: () => Relaysets,
  Report: () => Report,
  Reporting: () => Reporting,
  Repost: () => Repost,
  Seal: () => Seal,
  SearchRelaysList: () => SearchRelaysList,
  ShortTextNote: () => ShortTextNote,
  Time: () => Time,
  UserEmojiList: () => UserEmojiList,
  UserStatuses: () => UserStatuses,
  Zap: () => Zap,
  ZapGoal: () => ZapGoal,
  ZapRequest: () => ZapRequest,
  classifyKind: () => classifyKind,
  isEphemeralKind: () => isEphemeralKind,
  isKind: () => isKind,
  isParameterizedReplaceableKind: () => isParameterizedReplaceableKind,
  isRegularKind: () => isRegularKind,
  isReplaceableKind: () => isReplaceableKind
})
function isRegularKind (kind) {
  return kind >= 1e3 && kind < 1e4 || [1, 2, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44].includes(kind)
}
function isReplaceableKind (kind) {
  return [0, 3].includes(kind) || kind >= 1e4 && kind < 2e4
}
function isEphemeralKind (kind) {
  return kind >= 2e4 && kind < 3e4
}
function isParameterizedReplaceableKind (kind) {
  return kind >= 3e4 && kind < 4e4
}
function classifyKind (kind) {
  if (isRegularKind(kind)) { return 'regular' }
  if (isReplaceableKind(kind)) { return 'replaceable' }
  if (isEphemeralKind(kind)) { return 'ephemeral' }
  if (isParameterizedReplaceableKind(kind)) { return 'parameterized' }
  return 'unknown'
}
function isKind (event, kind) {
  const kindAsArray = kind instanceof Array ? kind : [kind]
  return validateEvent(event) && kindAsArray.includes(event.kind) || false
}
var Metadata = 0
var ShortTextNote = 1
var RecommendRelay = 2
var Contacts = 3
var EncryptedDirectMessage = 4
var EventDeletion = 5
var Repost = 6
var Reaction = 7
var BadgeAward = 8
var Seal = 13
var PrivateDirectMessage = 14
var GenericRepost = 16
var ChannelCreation = 40
var ChannelMetadata = 41
var ChannelMessage = 42
var ChannelHideMessage = 43
var ChannelMuteUser = 44
var OpenTimestamps = 1040
var GiftWrap = 1059
var FileMetadata = 1063
var LiveChatMessage = 1311
var ProblemTracker = 1971
var Report = 1984
var Reporting = 1984
var Label = 1985
var CommunityPostApproval = 4550
var JobRequest = 5999
var JobResult = 6999
var JobFeedback = 7e3
var ZapGoal = 9041
var ZapRequest = 9734
var Zap = 9735
var Highlights = 9802
var Mutelist = 1e4
var Pinlist = 10001
var RelayList = 10002
var BookmarkList = 10003
var CommunitiesList = 10004
var PublicChatsList = 10005
var BlockedRelaysList = 10006
var SearchRelaysList = 10007
var InterestsList = 10015
var UserEmojiList = 10030
var DirectMessageRelaysList = 10050
var FileServerPreference = 10096
var NWCWalletInfo = 13194
var LightningPubRPC = 21e3
var ClientAuth = 22242
var NWCWalletRequest = 23194
var NWCWalletResponse = 23195
var NostrConnect = 24133
var HTTPAuth = 27235
var Followsets = 3e4
var Genericlists = 30001
var Relaysets = 30002
var Bookmarksets = 30003
var Curationsets = 30004
var ProfileBadges = 30008
var BadgeDefinition = 30009
var Interestsets = 30015
var CreateOrUpdateStall = 30017
var CreateOrUpdateProduct = 30018
var LongFormArticle = 30023
var DraftLong = 30024
var Emojisets = 30030
var Application = 30078
var LiveEvent = 30311
var UserStatuses = 30315
var ClassifiedListing = 30402
var DraftClassifiedListing = 30403
var Date2 = 31922
var Time = 31923
var Calendar = 31924
var CalendarEventRSVP = 31925
var Handlerrecommendation = 31989
var Handlerinformation = 31990
var CommunityDefinition = 34550

// fakejson.ts
const fakejson_exports = {}
__export(fakejson_exports, {
  getHex64: () => getHex64,
  getInt: () => getInt,
  getSubscriptionId: () => getSubscriptionId,
  matchEventId: () => matchEventId,
  matchEventKind: () => matchEventKind,
  matchEventPubkey: () => matchEventPubkey
})
function getHex64 (json, field) {
  const len = field.length + 3
  const idx = json.indexOf(`"${field}":`) + len
  const s = json.slice(idx).indexOf('"') + idx + 1
  return json.slice(s, s + 64)
}
function getInt (json, field) {
  const len = field.length
  const idx = json.indexOf(`"${field}":`) + len + 3
  const sliced = json.slice(idx)
  const end = Math.min(sliced.indexOf(','), sliced.indexOf('}'))
  return parseInt(sliced.slice(0, end), 10)
}
function getSubscriptionId (json) {
  const idx = json.slice(0, 22).indexOf('"EVENT"')
  if (idx === -1) { return null }
  const pstart = json.slice(idx + 7 + 1).indexOf('"')
  if (pstart === -1) { return null }
  const start = idx + 7 + 1 + pstart
  const pend = json.slice(start + 1, 80).indexOf('"')
  if (pend === -1) { return null }
  const end = start + 1 + pend
  return json.slice(start + 1, end)
}
function matchEventId (json, id) {
  return id === getHex64(json, 'id')
}
function matchEventPubkey (json, pubkey) {
  return pubkey === getHex64(json, 'pubkey')
}
function matchEventKind (json, kind) {
  return kind === getInt(json, 'kind')
}

// nip42.ts
const nip42_exports = {}
__export(nip42_exports, {
  makeAuthEvent: () => makeAuthEvent
})
function makeAuthEvent (relayURL, challenge) {
  return {
    kind: ClientAuth,
    created_at: Math.floor(Date.now() / 1e3),
    tags: [
      ['relay', relayURL],
      ['challenge', challenge]
    ],
    content: ''
  }
}

// relay.ts
let _WebSocket
try {
  _WebSocket = WebSocket
} catch {
}

// pool.ts
let _WebSocket2
try {
  _WebSocket2 = WebSocket
} catch {
}

// nip19.ts
const nip19_exports = {}
__export(nip19_exports, {
  BECH32_REGEX: () => BECH32_REGEX,
  Bech32MaxSize: () => Bech32MaxSize,
  NostrTypeGuard: () => NostrTypeGuard,
  decode: () => decode,
  encodeBytes: () => encodeBytes,
  naddrEncode: () => naddrEncode,
  neventEncode: () => neventEncode,
  noteEncode: () => noteEncode,
  nprofileEncode: () => nprofileEncode,
  npubEncode: () => npubEncode,
  nsecEncode: () => nsecEncode
})
var NostrTypeGuard = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ''),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ''),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ''),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ''),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ''),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ''),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || '')
}
var Bech32MaxSize = 5e3
var BECH32_REGEX = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/
function integerToUint8Array (number) {
  const uint8Array = new Uint8Array(4)
  uint8Array[0] = number >> 24 & 255
  uint8Array[1] = number >> 16 & 255
  uint8Array[2] = number >> 8 & 255
  uint8Array[3] = number & 255
  return uint8Array
}
function decode (nip19) {
  const { prefix, words } = bech32$1.decode(nip19, Bech32MaxSize)
  const data = new Uint8Array(bech32$1.fromWords(words))
  switch (prefix) {
    case 'nprofile': {
      const tlv = parseTLV(data)
      if (!tlv[0]?.[0]) { throw new Error('missing TLV 0 for nprofile') }
      if (tlv[0][0].length !== 32) { throw new Error('TLV 0 should be 32 bytes') }
      return {
        type: 'nprofile',
        data: {
          pubkey: bytesToHex$2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      }
    }
    case 'nevent': {
      const tlv = parseTLV(data)
      if (!tlv[0]?.[0]) { throw new Error('missing TLV 0 for nevent') }
      if (tlv[0][0].length !== 32) { throw new Error('TLV 0 should be 32 bytes') }
      if (tlv[2] && tlv[2][0].length !== 32) { throw new Error('TLV 2 should be 32 bytes') }
      if (tlv[3] && tlv[3][0].length !== 4) { throw new Error('TLV 3 should be 4 bytes') }
      return {
        type: 'nevent',
        data: {
          id: bytesToHex$2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : [],
          author: tlv[2]?.[0] ? bytesToHex$2(tlv[2][0]) : void 0,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex$2(tlv[3][0]), 16) : void 0
        }
      }
    }
    case 'naddr': {
      const tlv = parseTLV(data)
      if (!tlv[0]?.[0]) { throw new Error('missing TLV 0 for naddr') }
      if (!tlv[2]?.[0]) { throw new Error('missing TLV 2 for naddr') }
      if (tlv[2][0].length !== 32) { throw new Error('TLV 2 should be 32 bytes') }
      if (!tlv[3]?.[0]) { throw new Error('missing TLV 3 for naddr') }
      if (tlv[3][0].length !== 4) { throw new Error('TLV 3 should be 4 bytes') }
      return {
        type: 'naddr',
        data: {
          identifier: utf8Decoder.decode(tlv[0][0]),
          pubkey: bytesToHex$2(tlv[2][0]),
          kind: parseInt(bytesToHex$2(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      }
    }
    case 'nsec':
      return { type: prefix, data }
    case 'npub':
    case 'note':
      return { type: prefix, data: bytesToHex$2(data) }
    default:
      throw new Error(`unknown prefix ${prefix}`)
  }
}
function parseTLV (data) {
  const result = {}
  let rest = data
  while (rest.length > 0) {
    const t = rest[0]
    const l = rest[1]
    const v = rest.slice(2, 2 + l)
    rest = rest.slice(2 + l)
    if (v.length < l) { throw new Error(`not enough data to read on TLV ${t}`) }
    result[t] = result[t] || []
    result[t].push(v)
  }
  return result
}
function nsecEncode (key) {
  return encodeBytes('nsec', key)
}
function npubEncode (hex) {
  return encodeBytes('npub', hexToBytes$1(hex))
}
function noteEncode (hex) {
  return encodeBytes('note', hexToBytes$1(hex))
}
function encodeBech32 (prefix, data) {
  const words = bech32$1.toWords(data)
  return bech32$1.encode(prefix, words, Bech32MaxSize)
}
function encodeBytes (prefix, bytes) {
  return encodeBech32(prefix, bytes)
}
function nprofileEncode (profile) {
  const data = encodeTLV({
    0: [hexToBytes$1(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
  })
  return encodeBech32('nprofile', data)
}
function neventEncode (event) {
  let kindArray
  if (event.kind !== void 0) {
    kindArray = integerToUint8Array(event.kind)
  }
  const data = encodeTLV({
    0: [hexToBytes$1(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
    2: event.author ? [hexToBytes$1(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  })
  return encodeBech32('nevent', data)
}
function naddrEncode (addr) {
  const kind = new ArrayBuffer(4)
  new DataView(kind).setUint32(0, addr.kind, false)
  const data = encodeTLV({
    0: [utf8Encoder.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
    2: [hexToBytes$1(addr.pubkey)],
    3: [new Uint8Array(kind)]
  })
  return encodeBech32('naddr', data)
}
function encodeTLV (tlv) {
  const entries = []
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      const entry = new Uint8Array(v.length + 2)
      entry.set([parseInt(t)], 0)
      entry.set([v.length], 1)
      entry.set(v, 2)
      entries.push(entry)
    })
  })
  return concatBytes$2(...entries)
}

// nip04.ts
const nip04_exports = {}
__export(nip04_exports, {
  decrypt: () => decrypt$1,
  encrypt: () => encrypt$1
})
async function encrypt$1 (secretKey, pubkey, text) {
  const privkey = secretKey instanceof Uint8Array ? bytesToHex$2(secretKey) : secretKey
  const key = secp256k1$1.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getNormalizedX(key)
  const iv = Uint8Array.from(randomBytes$1(16))
  const plaintext = utf8Encoder.encode(text)
  const ciphertext = cbc(normalizedKey, iv).encrypt(plaintext)
  const ctb64 = base64.encode(new Uint8Array(ciphertext))
  const ivb64 = base64.encode(new Uint8Array(iv.buffer))
  return `${ctb64}?iv=${ivb64}`
}
async function decrypt$1 (secretKey, pubkey, data) {
  const privkey = secretKey instanceof Uint8Array ? bytesToHex$2(secretKey) : secretKey
  const [ctb64, ivb64] = data.split('?iv=')
  const key = secp256k1$1.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getNormalizedX(key)
  const iv = base64.decode(ivb64)
  const ciphertext = base64.decode(ctb64)
  const plaintext = cbc(normalizedKey, iv).decrypt(ciphertext)
  return utf8Decoder.decode(plaintext)
}
function getNormalizedX (key) {
  return key.slice(1, 33)
}

// nip05.ts
const nip05_exports = {}
__export(nip05_exports, {
  NIP05_REGEX: () => NIP05_REGEX$1,
  isNip05: () => isNip05,
  isValid: () => isValid,
  queryProfile: () => queryProfile,
  searchDomain: () => searchDomain,
  useFetchImplementation: () => useFetchImplementation
})
var NIP05_REGEX$1 = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/
var isNip05 = (value) => NIP05_REGEX$1.test(value || '')
let _fetch
try {
  _fetch = fetch
} catch (_) {
}
function useFetchImplementation (fetchImplementation) {
  _fetch = fetchImplementation
}
async function searchDomain (domain, query = '') {
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${query}`
    const res = await _fetch(url, { redirect: 'manual' })
    if (res.status !== 200) {
      throw Error('Wrong response code')
    }
    const json = await res.json()
    return json.names
  } catch (_) {
    return {}
  }
}
async function queryProfile (fullname) {
  const match = fullname.match(NIP05_REGEX$1)
  if (!match) { return null }
  const [, name = '_', domain] = match
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${name}`
    const res = await _fetch(url, { redirect: 'manual' })
    if (res.status !== 200) {
      throw Error('Wrong response code')
    }
    const json = await res.json()
    const pubkey = json.names[name]
    return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null
  } catch (_e) {
    return null
  }
}
async function isValid (pubkey, nip05) {
  const res = await queryProfile(nip05)
  return res ? res.pubkey === pubkey : false
}

// nip10.ts
const nip10_exports = {}
__export(nip10_exports, {
  parse: () => parse
})
function parse (event) {
  const result = {
    reply: void 0,
    root: void 0,
    mentions: [],
    profiles: [],
    quotes: []
  }
  let maybeParent
  let maybeRoot
  for (let i2 = event.tags.length - 1; i2 >= 0; i2--) {
    const tag = event.tags[i2]
    if (tag[0] === 'e' && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl, eTagMarker, eTagAuthor] = tag
      const eventPointer = {
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : [],
        author: eTagAuthor
      }
      if (eTagMarker === 'root') {
        result.root = eventPointer
        continue
      }
      if (eTagMarker === 'reply') {
        result.reply = eventPointer
        continue
      }
      if (eTagMarker === 'mention') {
        result.mentions.push(eventPointer)
        continue
      }
      if (!maybeParent) {
        maybeParent = eventPointer
      } else {
        maybeRoot = eventPointer
      }
      result.mentions.push(eventPointer)
      continue
    }
    if (tag[0] === 'q' && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl] = tag
      result.quotes.push({
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : []
      })
    }
    if (tag[0] === 'p' && tag[1]) {
      result.profiles.push({
        pubkey: tag[1],
        relays: tag[2] ? [tag[2]] : []
      })
      continue
    }
  }
  if (!result.root) {
    result.root = maybeRoot || maybeParent || result.reply
  }
  if (!result.reply) {
    result.reply = maybeParent || result.root
  }
  [result.reply, result.root].forEach((ref) => {
    if (!ref) { return }
    const idx = result.mentions.indexOf(ref)
    if (idx !== -1) {
      result.mentions.splice(idx, 1)
    }
    if (ref.author) {
      const author = result.profiles.find((p) => p.pubkey === ref.author)
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = []
        }
        author.relays.forEach((url) => {
          if (ref.relays?.indexOf(url) === -1) { ref.relays.push(url) }
        })
        author.relays = ref.relays
      }
    }
  })
  result.mentions.forEach((ref) => {
    if (ref.author) {
      const author = result.profiles.find((p) => p.pubkey === ref.author)
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = []
        }
        author.relays.forEach((url) => {
          if (ref.relays.indexOf(url) === -1) { ref.relays.push(url) }
        })
        author.relays = ref.relays
      }
    }
  })
  return result
}

// nip11.ts
const nip11_exports = {}
__export(nip11_exports, {
  fetchRelayInformation: () => fetchRelayInformation,
  useFetchImplementation: () => useFetchImplementation2
})
let _fetch2
try {
  _fetch2 = fetch
} catch {
}
function useFetchImplementation2 (fetchImplementation) {
  _fetch2 = fetchImplementation
}
async function fetchRelayInformation (url) {
  return await (await fetch(url.replace('ws://', 'http://').replace('wss://', 'https://'), {
    headers: { Accept: 'application/nostr+json' }
  })).json()
}

// nip13.ts
const nip13_exports = {}
__export(nip13_exports, {
  fastEventHash: () => fastEventHash,
  getPow: () => getPow,
  minePow: () => minePow
})
function getPow (hex) {
  let count = 0
  for (let i2 = 0; i2 < 64; i2 += 8) {
    const nibble = parseInt(hex.substring(i2, i2 + 8), 16)
    if (nibble === 0) {
      count += 32
    } else {
      count += Math.clz32(nibble)
      break
    }
  }
  return count
}
function minePow (unsigned, difficulty) {
  let count = 0
  const event = unsigned
  const tag = ['nonce', count.toString(), difficulty.toString()]
  event.tags.push(tag)
  while (true) {
    const now2 = Math.floor(new Date().getTime() / 1e3)
    if (now2 !== event.created_at) {
      count = 0
      event.created_at = now2
    }
    tag[1] = (++count).toString()
    event.id = fastEventHash(event)
    if (getPow(event.id) >= difficulty) {
      break
    }
  }
  return event
}
function fastEventHash (evt) {
  return bytesToHex$2(
    sha256$1(utf8Encoder.encode(JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content])))
  )
}

// nip18.ts
const nip18_exports = {}
__export(nip18_exports, {
  finishRepostEvent: () => finishRepostEvent,
  getRepostedEvent: () => getRepostedEvent,
  getRepostedEventPointer: () => getRepostedEventPointer
})
function finishRepostEvent (t, reposted, relayUrl, privateKey) {
  return finalizeEvent(
    {
      kind: Repost,
      tags: [...t.tags ?? [], ['e', reposted.id, relayUrl], ['p', reposted.pubkey]],
      content: t.content === '' ? '' : JSON.stringify(reposted),
      created_at: t.created_at
    },
    privateKey
  )
}
function getRepostedEventPointer (event) {
  if (event.kind !== Repost) {
    return void 0
  }
  let lastETag
  let lastPTag
  for (let i2 = event.tags.length - 1; i2 >= 0 && (lastETag === void 0 || lastPTag === void 0); i2--) {
    const tag = event.tags[i2]
    if (tag.length >= 2) {
      if (tag[0] === 'e' && lastETag === void 0) {
        lastETag = tag
      } else if (tag[0] === 'p' && lastPTag === void 0) {
        lastPTag = tag
      }
    }
  }
  if (lastETag === void 0) {
    return void 0
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag?.[2]].filter((x) => typeof x === 'string'),
    author: lastPTag?.[1]
  }
}
function getRepostedEvent (event, { skipVerification } = {}) {
  const pointer = getRepostedEventPointer(event)
  if (pointer === void 0 || event.content === '') {
    return void 0
  }
  let repostedEvent
  try {
    repostedEvent = JSON.parse(event.content)
  } catch (error) {
    return void 0
  }
  if (repostedEvent.id !== pointer.id) {
    return void 0
  }
  if (!skipVerification && !verifyEvent(repostedEvent)) {
    return void 0
  }
  return repostedEvent
}

// nip21.ts
const nip21_exports = {}
__export(nip21_exports, {
  NOSTR_URI_REGEX: () => NOSTR_URI_REGEX,
  parse: () => parse2,
  test: () => test
})
var NOSTR_URI_REGEX = new RegExp(`nostr:(${BECH32_REGEX.source})`)
function test (value) {
  return typeof value === 'string' && new RegExp(`^${NOSTR_URI_REGEX.source}$`).test(value)
}
function parse2 (uri) {
  const match = uri.match(new RegExp(`^${NOSTR_URI_REGEX.source}$`))
  if (!match) { throw new Error(`Invalid Nostr URI: ${uri}`) }
  return {
    uri: match[0],
    value: match[1],
    decoded: decode(match[1])
  }
}

// nip25.ts
const nip25_exports = {}
__export(nip25_exports, {
  finishReactionEvent: () => finishReactionEvent,
  getReactedEventPointer: () => getReactedEventPointer
})
function finishReactionEvent (t, reacted, privateKey) {
  const inheritedTags = reacted.tags.filter((tag) => tag.length >= 2 && (tag[0] === 'e' || tag[0] === 'p'))
  return finalizeEvent(
    {
      ...t,
      kind: Reaction,
      tags: [...t.tags ?? [], ...inheritedTags, ['e', reacted.id], ['p', reacted.pubkey]],
      content: t.content ?? '+'
    },
    privateKey
  )
}
function getReactedEventPointer (event) {
  if (event.kind !== Reaction) {
    return void 0
  }
  let lastETag
  let lastPTag
  for (let i2 = event.tags.length - 1; i2 >= 0 && (lastETag === void 0 || lastPTag === void 0); i2--) {
    const tag = event.tags[i2]
    if (tag.length >= 2) {
      if (tag[0] === 'e' && lastETag === void 0) {
        lastETag = tag
      } else if (tag[0] === 'p' && lastPTag === void 0) {
        lastPTag = tag
      }
    }
  }
  if (lastETag === void 0 || lastPTag === void 0) {
    return void 0
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag[2]].filter((x) => x !== void 0),
    author: lastPTag[1]
  }
}

// nip27.ts
const nip27_exports = {}
__export(nip27_exports, {
  matchAll: () => matchAll,
  regex: () => regex,
  replaceAll: () => replaceAll
})
var regex = () => new RegExp(`\\b${NOSTR_URI_REGEX.source}\\b`, 'g')
function * matchAll (content) {
  const matches = content.matchAll(regex())
  for (const match of matches) {
    try {
      const [uri, value] = match
      yield {
        uri,
        value,
        decoded: decode(value),
        start: match.index,
        end: match.index + uri.length
      }
    } catch (_e) {
    }
  }
}
function replaceAll (content, replacer) {
  return content.replaceAll(regex(), (uri, value) => {
    return replacer({
      uri,
      value,
      decoded: decode(value)
    })
  })
}

// nip28.ts
const nip28_exports = {}
__export(nip28_exports, {
  channelCreateEvent: () => channelCreateEvent,
  channelHideMessageEvent: () => channelHideMessageEvent,
  channelMessageEvent: () => channelMessageEvent,
  channelMetadataEvent: () => channelMetadataEvent,
  channelMuteUserEvent: () => channelMuteUserEvent
})
var channelCreateEvent = (t, privateKey) => {
  let content
  if (typeof t.content === 'object') {
    content = JSON.stringify(t.content)
  } else if (typeof t.content === 'string') {
    content = t.content
  } else {
    return void 0
  }
  return finalizeEvent(
    {
      kind: ChannelCreation,
      tags: [...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  )
}
var channelMetadataEvent = (t, privateKey) => {
  let content
  if (typeof t.content === 'object') {
    content = JSON.stringify(t.content)
  } else if (typeof t.content === 'string') {
    content = t.content
  } else {
    return void 0
  }
  return finalizeEvent(
    {
      kind: ChannelMetadata,
      tags: [['e', t.channel_create_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  )
}
var channelMessageEvent = (t, privateKey) => {
  const tags = [['e', t.channel_create_event_id, t.relay_url, 'root']]
  if (t.reply_to_channel_message_event_id) {
    tags.push(['e', t.reply_to_channel_message_event_id, t.relay_url, 'reply'])
  }
  return finalizeEvent(
    {
      kind: ChannelMessage,
      tags: [...tags, ...t.tags ?? []],
      content: t.content,
      created_at: t.created_at
    },
    privateKey
  )
}
var channelHideMessageEvent = (t, privateKey) => {
  let content
  if (typeof t.content === 'object') {
    content = JSON.stringify(t.content)
  } else if (typeof t.content === 'string') {
    content = t.content
  } else {
    return void 0
  }
  return finalizeEvent(
    {
      kind: ChannelHideMessage,
      tags: [['e', t.channel_message_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  )
}
var channelMuteUserEvent = (t, privateKey) => {
  let content
  if (typeof t.content === 'object') {
    content = JSON.stringify(t.content)
  } else if (typeof t.content === 'string') {
    content = t.content
  } else {
    return void 0
  }
  return finalizeEvent(
    {
      kind: ChannelMuteUser,
      tags: [['p', t.pubkey_to_mute], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  )
}

// nip30.ts
const nip30_exports = {}
__export(nip30_exports, {
  EMOJI_SHORTCODE_REGEX: () => EMOJI_SHORTCODE_REGEX,
  matchAll: () => matchAll2,
  regex: () => regex2,
  replaceAll: () => replaceAll2
})
var EMOJI_SHORTCODE_REGEX = /:(\w+):/
var regex2 = () => new RegExp(`\\B${EMOJI_SHORTCODE_REGEX.source}\\B`, 'g')
function * matchAll2 (content) {
  const matches = content.matchAll(regex2())
  for (const match of matches) {
    try {
      const [shortcode, name] = match
      yield {
        shortcode,
        name,
        start: match.index,
        end: match.index + shortcode.length
      }
    } catch (_e) {
    }
  }
}
function replaceAll2 (content, replacer) {
  return content.replaceAll(regex2(), (shortcode, name) => {
    return replacer({
      shortcode,
      name
    })
  })
}

// nip39.ts
const nip39_exports = {}
__export(nip39_exports, {
  useFetchImplementation: () => useFetchImplementation3,
  validateGithub: () => validateGithub
})
let _fetch3
try {
  _fetch3 = fetch
} catch {
}
function useFetchImplementation3 (fetchImplementation) {
  _fetch3 = fetchImplementation
}
async function validateGithub (pubkey, username, proof) {
  try {
    const res = await (await _fetch3(`https://gist.github.com/${username}/${proof}/raw`)).text()
    return res === `Verifying that I control the following Nostr public key: ${pubkey}`
  } catch (_) {
    return false
  }
}

// nip44.ts
const nip44_exports = {}
__export(nip44_exports, {
  decrypt: () => decrypt2,
  encrypt: () => encrypt2,
  getConversationKey: () => getConversationKey,
  v2: () => v2
})
const minPlaintextSize = 1
const maxPlaintextSize = 65535
function getConversationKey (privkeyA, pubkeyB) {
  const sharedX = secp256k1$1.getSharedSecret(privkeyA, '02' + pubkeyB).subarray(1, 33)
  return extract(sha256$1, sharedX, 'nip44-v2')
}
function getMessageKeys (conversationKey, nonce) {
  const keys = expand(sha256$1, conversationKey, nonce, 76)
  return {
    chacha_key: keys.subarray(0, 32),
    chacha_nonce: keys.subarray(32, 44),
    hmac_key: keys.subarray(44, 76)
  }
}
function calcPaddedLen (len) {
  if (!Number.isSafeInteger(len) || len < 1) { throw new Error('expected positive integer') }
  if (len <= 32) { return 32 }
  const nextPower = 1 << Math.floor(Math.log2(len - 1)) + 1
  const chunk = nextPower <= 256 ? 32 : nextPower / 8
  return chunk * (Math.floor((len - 1) / chunk) + 1)
}
function writeU16BE (num) {
  if (!Number.isSafeInteger(num) || num < minPlaintextSize || num > maxPlaintextSize) { throw new Error('invalid plaintext size: must be between 1 and 65535 bytes') }
  const arr = new Uint8Array(2)
  new DataView(arr.buffer).setUint16(0, num, false)
  return arr
}
function pad (plaintext) {
  const unpadded = utf8Encoder.encode(plaintext)
  const unpaddedLen = unpadded.length
  const prefix = writeU16BE(unpaddedLen)
  const suffix = new Uint8Array(calcPaddedLen(unpaddedLen) - unpaddedLen)
  return concatBytes$2(prefix, unpadded, suffix)
}
function unpad (padded) {
  const unpaddedLen = new DataView(padded.buffer).getUint16(0)
  const unpadded = padded.subarray(2, 2 + unpaddedLen)
  if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize || unpadded.length !== unpaddedLen || padded.length !== 2 + calcPaddedLen(unpaddedLen)) { throw new Error('invalid padding') }
  return utf8Decoder.decode(unpadded)
}
function hmacAad (key, message, aad) {
  if (aad.length !== 32) { throw new Error('AAD associated data must be 32 bytes') }
  const combined = concatBytes$2(aad, message)
  return hmac$1(sha256$1, key, combined)
}
function decodePayload (payload) {
  if (typeof payload !== 'string') { throw new Error('payload must be a valid string') }
  const plen = payload.length
  if (plen < 132 || plen > 87472) { throw new Error('invalid payload length: ' + plen) }
  if (payload[0] === '#') { throw new Error('unknown encryption version') }
  let data
  try {
    data = base64.decode(payload)
  } catch (error) {
    throw new Error('invalid base64: ' + error.message)
  }
  const dlen = data.length
  if (dlen < 99 || dlen > 65603) { throw new Error('invalid data length: ' + dlen) }
  const vers = data[0]
  if (vers !== 2) { throw new Error('unknown encryption version ' + vers) }
  return {
    nonce: data.subarray(1, 33),
    ciphertext: data.subarray(33, -32),
    mac: data.subarray(-32)
  }
}
function encrypt2 (plaintext, conversationKey, nonce = randomBytes$1(32)) {
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce)
  const padded = pad(plaintext)
  const ciphertext = chacha20(chacha_key, chacha_nonce, padded)
  const mac = hmacAad(hmac_key, ciphertext, nonce)
  return base64.encode(concatBytes$2(new Uint8Array([2]), nonce, ciphertext, mac))
}
function decrypt2 (payload, conversationKey) {
  const { nonce, ciphertext, mac } = decodePayload(payload)
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce)
  const calculatedMac = hmacAad(hmac_key, ciphertext, nonce)
  if (!equalBytes$1(calculatedMac, mac)) { throw new Error('invalid MAC') }
  const padded = chacha20(chacha_key, chacha_nonce, ciphertext)
  return unpad(padded)
}
var v2 = {
  utils: {
    getConversationKey,
    calcPaddedLen
  },
  encrypt: encrypt2,
  decrypt: decrypt2
}

// nip47.ts
const nip47_exports = {}
__export(nip47_exports, {
  makeNwcRequestEvent: () => makeNwcRequestEvent,
  parseConnectionString: () => parseConnectionString
})
function parseConnectionString (connectionString) {
  const { pathname, searchParams } = new URL(connectionString)
  const pubkey = pathname
  const relay = searchParams.get('relay')
  const secret = searchParams.get('secret')
  if (!pubkey || !relay || !secret) {
    throw new Error('invalid connection string')
  }
  return { pubkey, relay, secret }
}
async function makeNwcRequestEvent (pubkey, secretKey, invoice) {
  const content = {
    method: 'pay_invoice',
    params: {
      invoice
    }
  }
  const encryptedContent = await encrypt$1(secretKey, pubkey, JSON.stringify(content))
  const eventTemplate = {
    kind: NWCWalletRequest,
    created_at: Math.round(Date.now() / 1e3),
    content: encryptedContent,
    tags: [['p', pubkey]]
  }
  return finalizeEvent(eventTemplate, secretKey)
}

// nip57.ts
const nip57_exports = {}
__export(nip57_exports, {
  getZapEndpoint: () => getZapEndpoint,
  makeZapReceipt: () => makeZapReceipt,
  makeZapRequest: () => makeZapRequest,
  useFetchImplementation: () => useFetchImplementation4,
  validateZapRequest: () => validateZapRequest
})
let _fetch4
try {
  _fetch4 = fetch
} catch {
}
function useFetchImplementation4 (fetchImplementation) {
  _fetch4 = fetchImplementation
}
async function getZapEndpoint (metadata) {
  try {
    let lnurl = ''
    const { lud06, lud16 } = JSON.parse(metadata.content)
    if (lud06) {
      const { words } = bech32$1.decode(lud06, 1e3)
      const data = bech32$1.fromWords(words)
      lnurl = utf8Decoder.decode(data)
    } else if (lud16) {
      const [name, domain] = lud16.split('@')
      lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString()
    } else {
      return null
    }
    const res = await _fetch4(lnurl)
    const body = await res.json()
    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback
    }
  } catch (err) {
  }
  return null
}
function makeZapRequest ({
  profile,
  event,
  amount,
  relays,
  comment = ''
}) {
  if (!amount) { throw new Error('amount not given') }
  if (!profile) { throw new Error('profile not given') }
  const zr = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1e3),
    content: comment,
    tags: [
      ['p', profile],
      ['amount', amount.toString()],
      ['relays', ...relays]
    ]
  }
  if (event) {
    zr.tags.push(['e', event])
  }
  return zr
}
function validateZapRequest (zapRequestString) {
  let zapRequest
  try {
    zapRequest = JSON.parse(zapRequestString)
  } catch (err) {
    return 'Invalid zap request JSON.'
  }
  if (!validateEvent(zapRequest)) { return 'Zap request is not a valid Nostr event.' }
  if (!verifyEvent(zapRequest)) { return 'Invalid signature on zap request.' }
  const p = zapRequest.tags.find(([t, v]) => t === 'p' && v)
  if (!p) { return "Zap request doesn't have a 'p' tag." }
  if (!p[1].match(/^[a-f0-9]{64}$/)) { return "Zap request 'p' tag is not valid hex." }
  const e = zapRequest.tags.find(([t, v]) => t === 'e' && v)
  if (e && !e[1].match(/^[a-f0-9]{64}$/)) { return "Zap request 'e' tag is not valid hex." }
  const relays = zapRequest.tags.find(([t, v]) => t === 'relays' && v)
  if (!relays) { return "Zap request doesn't have a 'relays' tag." }
  return null
}
function makeZapReceipt ({
  zapRequest,
  preimage,
  bolt11,
  paidAt
}) {
  const zr = JSON.parse(zapRequest)
  const tagsFromZapRequest = zr.tags.filter(([t]) => t === 'e' || t === 'p' || t === 'a')
  const zap = {
    kind: 9735,
    created_at: Math.round(paidAt.getTime() / 1e3),
    content: '',
    tags: [...tagsFromZapRequest, ['P', zr.pubkey], ['bolt11', bolt11], ['description', zapRequest]]
  }
  if (preimage) {
    zap.tags.push(['preimage', preimage])
  }
  return zap
}

// nip59.ts
const nip59_exports = {}
__export(nip59_exports, {
  createRumor: () => createRumor,
  createSeal: () => createSeal,
  createWrap: () => createWrap,
  unwrapEvent: () => unwrapEvent,
  unwrapManyEvents: () => unwrapManyEvents,
  wrapEvent: () => wrapEvent,
  wrapManyEvents: () => wrapManyEvents
})
const TWO_DAYS = 2 * 24 * 60 * 60
const now = () => Math.round(Date.now() / 1e3)
const randomNow = () => Math.round(now() - Math.random() * TWO_DAYS)
const nip44ConversationKey = (privateKey, publicKey) => getConversationKey(privateKey, publicKey)
const nip44Encrypt = (data, privateKey, publicKey) => encrypt2(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey))
const nip44Decrypt = (data, privateKey) => JSON.parse(decrypt2(data.content, nip44ConversationKey(privateKey, data.pubkey)))
function createRumor (event, privateKey) {
  const rumor = {
    created_at: now(),
    content: '',
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey)
  }
  rumor.id = getEventHash$1(rumor)
  return rumor
}
function createSeal (rumor, privateKey, recipientPublicKey) {
  return finalizeEvent(
    {
      kind: Seal,
      content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
      created_at: randomNow(),
      tags: []
    },
    privateKey
  )
}
function createWrap (seal, recipientPublicKey) {
  const randomKey = generateSecretKey()
  return finalizeEvent(
    {
      kind: GiftWrap,
      content: nip44Encrypt(seal, randomKey, recipientPublicKey),
      created_at: randomNow(),
      tags: [['p', recipientPublicKey]]
    },
    randomKey
  )
}
function wrapEvent (event, senderPrivateKey, recipientPublicKey) {
  const rumor = createRumor(event, senderPrivateKey)
  const seal = createSeal(rumor, senderPrivateKey, recipientPublicKey)
  return createWrap(seal, recipientPublicKey)
}
function wrapManyEvents (event, senderPrivateKey, recipientsPublicKeys) {
  if (!recipientsPublicKeys || recipientsPublicKeys.length === 0) {
    throw new Error('At least one recipient is required.')
  }
  const senderPublicKey = getPublicKey(senderPrivateKey)
  const wrappeds = [wrapEvent(event, senderPrivateKey, senderPublicKey)]
  recipientsPublicKeys.forEach((recipientPublicKey) => {
    wrappeds.push(wrapEvent(event, senderPrivateKey, recipientPublicKey))
  })
  return wrappeds
}
function unwrapEvent (wrap, recipientPrivateKey) {
  const unwrappedSeal = nip44Decrypt(wrap, recipientPrivateKey)
  return nip44Decrypt(unwrappedSeal, recipientPrivateKey)
}
function unwrapManyEvents (wrappedEvents, recipientPrivateKey) {
  const unwrappedEvents = []
  wrappedEvents.forEach((e) => {
    unwrappedEvents.push(unwrapEvent(e, recipientPrivateKey))
  })
  unwrappedEvents.sort((a, b) => a.created_at - b.created_at)
  return unwrappedEvents
}

// nip98.ts
const nip98_exports = {}
__export(nip98_exports, {
  getToken: () => getToken,
  hashPayload: () => hashPayload,
  unpackEventFromToken: () => unpackEventFromToken,
  validateEvent: () => validateEvent2,
  validateEventKind: () => validateEventKind,
  validateEventMethodTag: () => validateEventMethodTag,
  validateEventPayloadTag: () => validateEventPayloadTag,
  validateEventTimestamp: () => validateEventTimestamp,
  validateEventUrlTag: () => validateEventUrlTag,
  validateToken: () => validateToken
})
const _authorizationScheme = 'Nostr '
async function getToken (loginUrl, httpMethod, sign, includeAuthorizationScheme = false, payload) {
  const event = {
    kind: HTTPAuth,
    tags: [
      ['u', loginUrl],
      ['method', httpMethod]
    ],
    created_at: Math.round(new Date().getTime() / 1e3),
    content: ''
  }
  if (payload) {
    event.tags.push(['payload', hashPayload(payload)])
  }
  const signedEvent = await sign(event)
  const authorizationScheme = includeAuthorizationScheme ? _authorizationScheme : ''
  return authorizationScheme + base64.encode(utf8Encoder.encode(JSON.stringify(signedEvent)))
}
async function validateToken (token, url, method) {
  const event = await unpackEventFromToken(token).catch((error) => {
    throw error
  })
  const valid = await validateEvent2(event, url, method).catch((error) => {
    throw error
  })
  return valid
}
async function unpackEventFromToken (token) {
  if (!token) {
    throw new Error('Missing token')
  }
  token = token.replace(_authorizationScheme, '')
  const eventB64 = utf8Decoder.decode(base64.decode(token))
  if (!eventB64 || eventB64.length === 0 || !eventB64.startsWith('{')) {
    throw new Error('Invalid token')
  }
  const event = JSON.parse(eventB64)
  return event
}
function validateEventTimestamp (event) {
  if (!event.created_at) {
    return false
  }
  return Math.round(new Date().getTime() / 1e3) - event.created_at < 60
}
function validateEventKind (event) {
  return event.kind === HTTPAuth
}
function validateEventUrlTag (event, url) {
  const urlTag = event.tags.find((t) => t[0] === 'u')
  if (!urlTag) {
    return false
  }
  return urlTag.length > 0 && urlTag[1] === url
}
function validateEventMethodTag (event, method) {
  const methodTag = event.tags.find((t) => t[0] === 'method')
  if (!methodTag) {
    return false
  }
  return methodTag.length > 0 && methodTag[1].toLowerCase() === method.toLowerCase()
}
function hashPayload (payload) {
  const hash = sha256$1(utf8Encoder.encode(JSON.stringify(payload)))
  return bytesToHex$2(hash)
}
function validateEventPayloadTag (event, payload) {
  const payloadTag = event.tags.find((t) => t[0] === 'payload')
  if (!payloadTag) {
    return false
  }
  const payloadHash = hashPayload(payload)
  return payloadTag.length > 0 && payloadTag[1] === payloadHash
}
async function validateEvent2 (event, url, method, body) {
  if (!verifyEvent(event)) {
    throw new Error('Invalid nostr event, signature invalid')
  }
  if (!validateEventKind(event)) {
    throw new Error('Invalid nostr event, kind invalid')
  }
  if (!validateEventTimestamp(event)) {
    throw new Error('Invalid nostr event, created_at timestamp invalid')
  }
  if (!validateEventUrlTag(event, url)) {
    throw new Error('Invalid nostr event, url tag invalid')
  }
  if (!validateEventMethodTag(event, method)) {
    throw new Error('Invalid nostr event, method tag invalid')
  }
  if (Boolean(body) && typeof body === 'object' && Object.keys(body).length > 0) {
    if (!validateEventPayloadTag(event, body)) {
      throw new Error('Invalid nostr event, payload tag does not match request body hash')
    }
  }
  return true
}

/**
 * Internal assertion helpers.
 * @module
 */
/** Asserts something is positive integer. */
function anumber (n) {
  if (!Number.isSafeInteger(n) || n < 0) { throw new Error('positive integer expected, got ' + n) }
}
/** Is number an Uint8Array? Copied from utils for perf. */
function isBytes$1 (a) {
  return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array')
}
/** Asserts something is Uint8Array. */
function abytes$1 (b, ...lengths) {
  if (!isBytes$1(b)) { throw new Error('Uint8Array expected') }
  if (lengths.length > 0 && !lengths.includes(b.length)) { throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length) }
}
/** Asserts something is hash */
function ahash (h) {
  if (typeof h !== 'function' || typeof h.create !== 'function') { throw new Error('Hash should be wrapped by utils.wrapConstructor') }
  anumber(h.outputLen)
  anumber(h.blockLen)
}
/** Asserts a hash instance has not been destroyed / finished */
function aexists (instance, checkFinished = true) {
  if (instance.destroyed) { throw new Error('Hash instance has been destroyed') }
  if (checkFinished && instance.finished) { throw new Error('Hash#digest() has already been called') }
}
/** Asserts output is properly-sized byte array */
function aoutput (out, instance) {
  abytes$1(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error('digestInto() expects output buffer of length at least ' + min)
  }
}

const crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined

/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated (2025-04-30), we can just drop the import.
// Cast array to view
function createView (arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength)
}
/** The rotate right (circular right shift) operation for uint32 */
function rotr (word, shift) {
  return (word << (32 - shift)) | (word >>> shift)
}
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes$1 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'))
/**
 * Convert byte array to hex string.
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex$1 (bytes) {
  abytes$1(bytes)
  // pre-caching improves the speed 6x
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes$1[bytes[i]]
  }
  return hex
}
/**
 * Convert JS string to byte array.
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes$1 (str) {
  if (typeof str !== 'string') { throw new Error('utf8ToBytes expected string, got ' + typeof str) }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes (data) {
  if (typeof data === 'string') { data = utf8ToBytes$1(data) }
  abytes$1(data)
  return data
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes$1 (...arrays) {
  let sum = 0
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i]
    abytes$1(a)
    sum += a.length
  }
  const res = new Uint8Array(sum)
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i]
    res.set(a, pad)
    pad += a.length
  }
  return res
}
/** For runtime check if class implements interface */
class Hash {
  // Safe version that clones internal state
  clone () {
    return this._cloneInto()
  }
}
/** Wraps hash function, creating an interface on top of it */
function wrapConstructor (hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest()
  const tmp = hashCons()
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = () => hashCons()
  return hashC
}
/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
function randomBytes (bytesLength = 32) {
  if (crypto && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint8Array(bytesLength))
  }
  // Legacy Node.js compatibility
  if (crypto && typeof crypto.randomBytes === 'function') {
    return crypto.randomBytes(bytesLength)
  }
  throw new Error('crypto.getRandomValues must be defined')
}

/**
 * Internal Merkle-Damgard hash utils.
 * @module
 */
/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
function setBigUint64 (view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === 'function') { return view.setBigUint64(byteOffset, value, isLE) }
  const _32n = BigInt(32)
  const _u32_max = BigInt(0xffffffff)
  const wh = Number((value >> _32n) & _u32_max)
  const wl = Number(value & _u32_max)
  const h = isLE ? 4 : 0
  const l = isLE ? 0 : 4
  view.setUint32(byteOffset + h, wh, isLE)
  view.setUint32(byteOffset + l, wl, isLE)
}
/** Choice: a ? b : c */
function Chi (a, b, c) {
  return (a & b) ^ (~a & c)
}
/** Majority function, true if any two inputs is true. */
function Maj (a, b, c) {
  return (a & b) ^ (a & c) ^ (b & c)
}
/**
 * Merkle-Damgard hash construction base class.
 * Could be used to create MD5, RIPEMD, SHA1, SHA2.
 */
class HashMD extends Hash {
  constructor (blockLen, outputLen, padOffset, isLE) {
    super()
    this.blockLen = blockLen
    this.outputLen = outputLen
    this.padOffset = padOffset
    this.isLE = isLE
    this.finished = false
    this.length = 0
    this.pos = 0
    this.destroyed = false
    this.buffer = new Uint8Array(blockLen)
    this.view = createView(this.buffer)
  }

  update (data) {
    aexists(this)
    const { view, buffer, blockLen } = this
    data = toBytes(data)
    const len = data.length
    for (let pos = 0; pos < len;) {
      const take = Math.min(blockLen - this.pos, len - pos)
      // Fast path: we have at least one block in input, cast it to view and process
      if (take === blockLen) {
        const dataView = createView(data)
        for (; blockLen <= len - pos; pos += blockLen) { this.process(dataView, pos) }
        continue
      }
      buffer.set(data.subarray(pos, pos + take), this.pos)
      this.pos += take
      pos += take
      if (this.pos === blockLen) {
        this.process(view, 0)
        this.pos = 0
      }
    }
    this.length += data.length
    this.roundClean()
    return this
  }

  digestInto (out) {
    aexists(this)
    aoutput(out, this)
    this.finished = true
    // Padding
    // We can avoid allocation of buffer for padding completely if it
    // was previously not allocated here. But it won't change performance.
    const { buffer, view, blockLen, isLE } = this
    let { pos } = this
    // append the bit '1' to the message
    buffer[pos++] = 0b10000000
    this.buffer.subarray(pos).fill(0)
    // we have less than padOffset left in buffer, so we cannot put length in
    // current block, need process it and pad again
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0)
      pos = 0
    }
    // Pad until full block byte with zeros
    for (let i = pos; i < blockLen; i++) { buffer[i] = 0 }
    // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
    // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
    // So we just write lowest 64 bits of that value.
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE)
    this.process(view, 0)
    const oview = createView(out)
    const len = this.outputLen
    // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
    if (len % 4) { throw new Error('_sha2: outputLen should be aligned to 32bit') }
    const outLen = len / 4
    const state = this.get()
    if (outLen > state.length) { throw new Error('_sha2: outputLen bigger than state') }
    for (let i = 0; i < outLen; i++) { oview.setUint32(4 * i, state[i], isLE) }
  }

  digest () {
    const { buffer, outputLen } = this
    this.digestInto(buffer)
    const res = buffer.slice(0, outputLen)
    this.destroy()
    return res
  }

  _cloneInto (to) {
    to || (to = new this.constructor())
    to.set(...this.get())
    const { blockLen, buffer, length, finished, destroyed, pos } = this
    to.length = length
    to.pos = pos
    to.finished = finished
    to.destroyed = destroyed
    if (length % blockLen) { to.buffer.set(buffer) }
    return to
  }
}

/**
 * SHA2-256 a.k.a. sha256. In JS, it is the fastest hash, even faster than Blake3.
 *
 * To break sha256 using birthday attack, attackers need to try 2^128 hashes.
 * BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
 *
 * Check out [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
 * @module
 */
/** Round constants: first 32 bits of fractional parts of the cube roots of the first 64 primes 2..311). */
// prettier-ignore
const SHA256_K = /* @__PURE__ */ new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
])
/** Initial state: first 32 bits of fractional parts of the square roots of the first 8 primes 2..19. */
// prettier-ignore
const SHA256_IV = /* @__PURE__ */ new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
])
/**
 * Temporary buffer, not used to store anything between runs.
 * Named this way because it matches specification.
 */
const SHA256_W = /* @__PURE__ */ new Uint32Array(64)
class SHA256 extends HashMD {
  constructor () {
    super(64, 32, 8, false)
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    this.A = SHA256_IV[0] | 0
    this.B = SHA256_IV[1] | 0
    this.C = SHA256_IV[2] | 0
    this.D = SHA256_IV[3] | 0
    this.E = SHA256_IV[4] | 0
    this.F = SHA256_IV[5] | 0
    this.G = SHA256_IV[6] | 0
    this.H = SHA256_IV[7] | 0
  }

  get () {
    const { A, B, C, D, E, F, G, H } = this
    return [A, B, C, D, E, F, G, H]
  }

  // prettier-ignore
  set (A, B, C, D, E, F, G, H) {
    this.A = A | 0
    this.B = B | 0
    this.C = C | 0
    this.D = D | 0
    this.E = E | 0
    this.F = F | 0
    this.G = G | 0
    this.H = H | 0
  }

  process (view, offset) {
    // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
    for (let i = 0; i < 16; i++, offset += 4) { SHA256_W[i] = view.getUint32(offset, false) }
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15]
      const W2 = SHA256_W[i - 2]
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ (W15 >>> 3)
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ (W2 >>> 10)
      SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0
    }
    // Compression function main loop, 64 rounds
    let { A, B, C, D, E, F, G, H } = this
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25)
      const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22)
      const T2 = (sigma0 + Maj(A, B, C)) | 0
      H = G
      G = F
      F = E
      E = (D + T1) | 0
      D = C
      C = B
      B = A
      A = (T1 + T2) | 0
    }
    // Add the compressed chunk to the current hash value
    A = (A + this.A) | 0
    B = (B + this.B) | 0
    C = (C + this.C) | 0
    D = (D + this.D) | 0
    E = (E + this.E) | 0
    F = (F + this.F) | 0
    G = (G + this.G) | 0
    H = (H + this.H) | 0
    this.set(A, B, C, D, E, F, G, H)
  }

  roundClean () {
    SHA256_W.fill(0)
  }

  destroy () {
    this.set(0, 0, 0, 0, 0, 0, 0, 0)
    this.buffer.fill(0)
  }
}
/** SHA2-256 hash function */
const sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256())

/**
 * HMAC: RFC2104 message authentication code.
 * @module
 */
class HMAC extends Hash {
  constructor (hash, _key) {
    super()
    this.finished = false
    this.destroyed = false
    ahash(hash)
    const key = toBytes(_key)
    this.iHash = hash.create()
    if (typeof this.iHash.update !== 'function') { throw new Error('Expected instance of class which extends utils.Hash') }
    this.blockLen = this.iHash.blockLen
    this.outputLen = this.iHash.outputLen
    const blockLen = this.blockLen
    const pad = new Uint8Array(blockLen)
    // blockLen can be bigger than outputLen
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key)
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 }
    this.iHash.update(pad)
    // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
    this.oHash = hash.create()
    // Undo internal XOR && apply outer XOR
    for (let i = 0; i < pad.length; i++) { pad[i] ^= 0x36 ^ 0x5c }
    this.oHash.update(pad)
    pad.fill(0)
  }

  update (buf) {
    aexists(this)
    this.iHash.update(buf)
    return this
  }

  digestInto (out) {
    aexists(this)
    abytes$1(out, this.outputLen)
    this.finished = true
    this.iHash.digestInto(out)
    this.oHash.update(out)
    this.oHash.digestInto(out)
    this.destroy()
  }

  digest () {
    const out = new Uint8Array(this.oHash.outputLen)
    this.digestInto(out)
    return out
  }

  _cloneInto (to) {
    // Create new instance without calling constructor since key already in state and we don't know it.
    to || (to = Object.create(Object.getPrototypeOf(this), {}))
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this
    to = to
    to.finished = finished
    to.destroyed = destroyed
    to.blockLen = blockLen
    to.outputLen = outputLen
    to.oHash = oHash._cloneInto(to.oHash)
    to.iHash = iHash._cloneInto(to.iHash)
    return to
  }

  destroy () {
    this.destroyed = true
    this.oHash.destroy()
    this.iHash.destroy()
  }
}
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 * @example
 * import { hmac } from '@noble/hashes/hmac';
 * import { sha256 } from '@noble/hashes/sha2';
 * const mac1 = hmac(sha256, 'key', 'message');
 */
const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest()
hmac.create = (hash, key) => new HMAC(hash, key)

/**
 * Hex, bytes and number utilities.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// 100 lines of code in the file are duplicated from noble-hashes (utils).
// This is OK: `abstract` directory does not use noble-hashes.
// User may opt-in into using different hashing library. This way, noble-hashes
// won't be included into their bundle.
const _0n$4 = /* @__PURE__ */ BigInt(0)
const _1n$4 = /* @__PURE__ */ BigInt(1)
const _2n$2 = /* @__PURE__ */ BigInt(2)
function isBytes (a) {
  return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array')
}
function abytes (item) {
  if (!isBytes(item)) { throw new Error('Uint8Array expected') }
}
function abool (title, value) {
  if (typeof value !== 'boolean') { throw new Error(title + ' boolean expected, got ' + value) }
}
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'))
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex (bytes) {
  abytes(bytes)
  // pre-caching improves the speed 6x
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]]
  }
  return hex
}
function numberToHexUnpadded (num) {
  const hex = num.toString(16)
  return hex.length & 1 ? '0' + hex : hex
}
function hexToNumber (hex) {
  if (typeof hex !== 'string') { throw new Error('hex string expected, got ' + typeof hex) }
  return hex === '' ? _0n$4 : BigInt('0x' + hex) // Big Endian
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 }
function asciiToBase16 (ch) {
  if (ch >= asciis._0 && ch <= asciis._9) { return ch - asciis._0 } // '2' => 50-48
  if (ch >= asciis.A && ch <= asciis.F) { return ch - (asciis.A - 10) } // 'B' => 66-(65-10)
  if (ch >= asciis.a && ch <= asciis.f) { return ch - (asciis.a - 10) } // 'b' => 98-(97-10)
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes (hex) {
  if (typeof hex !== 'string') { throw new Error('hex string expected, got ' + typeof hex) }
  const hl = hex.length
  const al = hl / 2
  if (hl % 2) { throw new Error('hex string expected, got unpadded hex of length ' + hl) }
  const array = new Uint8Array(al)
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi))
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1))
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1]
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi)
    }
    array[ai] = n1 * 16 + n2 // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
  }
  return array
}
// BE: Big Endian, LE: Little Endian
function bytesToNumberBE (bytes) {
  return hexToNumber(bytesToHex(bytes))
}
function bytesToNumberLE (bytes) {
  abytes(bytes)
  return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()))
}
function numberToBytesBE (n, len) {
  return hexToBytes(n.toString(16).padStart(len * 2, '0'))
}
function numberToBytesLE (n, len) {
  return numberToBytesBE(n, len).reverse()
}
// Unpadded, rarely used
function numberToVarBytesBE (n) {
  return hexToBytes(numberToHexUnpadded(n))
}
/**
 * Takes hex string or Uint8Array, converts to Uint8Array.
 * Validates output length.
 * Will throw error for other types.
 * @param title descriptive title for an error e.g. 'private key'
 * @param hex hex string or Uint8Array
 * @param expectedLength optional, will compare to result array's length
 * @returns
 */
function ensureBytes (title, hex, expectedLength) {
  let res
  if (typeof hex === 'string') {
    try {
      res = hexToBytes(hex)
    } catch (e) {
      throw new Error(title + ' must be hex string or Uint8Array, cause: ' + e)
    }
  } else if (isBytes(hex)) {
    // Uint8Array.from() instead of hash.slice() because node.js Buffer
    // is instance of Uint8Array, and its slice() creates **mutable** copy
    res = Uint8Array.from(hex)
  } else {
    throw new Error(title + ' must be hex string or Uint8Array')
  }
  const len = res.length
  if (typeof expectedLength === 'number' && len !== expectedLength) { throw new Error(title + ' of length ' + expectedLength + ' expected, got ' + len) }
  return res
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes (...arrays) {
  let sum = 0
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i]
    abytes(a)
    sum += a.length
  }
  const res = new Uint8Array(sum)
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i]
    res.set(a, pad)
    pad += a.length
  }
  return res
}
// Compares 2 u8a-s in kinda constant time
function equalBytes (a, b) {
  if (a.length !== b.length) { return false }
  let diff = 0
  for (let i = 0; i < a.length; i++) { diff |= a[i] ^ b[i] }
  return diff === 0
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes (str) {
  if (typeof str !== 'string') { throw new Error('string expected') }
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
// Is positive bigint
const isPosBig = (n) => typeof n === 'bigint' && _0n$4 <= n
function inRange (n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max
}
/**
 * Asserts min <= n < max. NOTE: It's < max and not <= max.
 * @example
 * aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
 */
function aInRange (title, n, min, max) {
  // Why min <= n < max and not a (min < n < max) OR b (min <= n <= max)?
  // consider P=256n, min=0n, max=P
  // - a for min=0 would require -1:          `inRange('x', x, -1n, P)`
  // - b would commonly require subtraction:  `inRange('x', x, 0n, P - 1n)`
  // - our way is the cleanest:               `inRange('x', x, 0n, P)
  if (!inRange(n, min, max)) { throw new Error('expected valid ' + title + ': ' + min + ' <= n < ' + max + ', got ' + n) }
}
// Bit operations
/**
 * Calculates amount of bits in a bigint.
 * Same as `n.toString(2).length`
 */
function bitLen (n) {
  let len
  for (len = 0; n > _0n$4; n >>= _1n$4, len += 1)
    ;
  return len
}
/**
 * Gets single bit at position.
 * NOTE: first bit position is 0 (same as arrays)
 * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
 */
function bitGet (n, pos) {
  return (n >> BigInt(pos)) & _1n$4
}
/**
 * Sets single bit at position.
 */
function bitSet (n, pos, value) {
  return n | ((value ? _1n$4 : _0n$4) << BigInt(pos))
}
/**
 * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
 * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
 */
const bitMask = (n) => (_2n$2 << BigInt(n - 1)) - _1n$4
// DRBG
const u8n = (data) => new Uint8Array(data) // creates Uint8Array
const u8fr = (arr) => Uint8Array.from(arr) // another shortcut
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
function createHmacDrbg (hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== 'number' || hashLen < 2) { throw new Error('hashLen must be a number') }
  if (typeof qByteLen !== 'number' || qByteLen < 2) { throw new Error('qByteLen must be a number') }
  if (typeof hmacFn !== 'function') { throw new Error('hmacFn must be a function') }
  // Step B, Step C: set hashLen to 8*ceil(hlen/8)
  let v = u8n(hashLen) // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
  let k = u8n(hashLen) // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
  let i = 0 // Iterations counter, will throw when over 1000
  const reset = () => {
    v.fill(1)
    k.fill(0)
    i = 0
  }
  const h = (...b) => hmacFn(k, v, ...b) // hmac(k)(v, ...values)
  const reseed = (seed = u8n()) => {
    // HMAC-DRBG reseed() function. Steps D-G
    k = h(u8fr([0x00]), seed) // k = hmac(k || v || 0x00 || seed)
    v = h() // v = hmac(k || v)
    if (seed.length === 0) { return }
    k = h(u8fr([0x01]), seed) // k = hmac(k || v || 0x01 || seed)
    v = h() // v = hmac(k || v)
  }
  const gen = () => {
    // HMAC-DRBG generate() function
    if (i++ >= 1000) { throw new Error('drbg: tried 1000 values') }
    let len = 0
    const out = []
    while (len < qByteLen) {
      v = h()
      const sl = v.slice()
      out.push(sl)
      len += v.length
    }
    return concatBytes(...out)
  }
  const genUntil = (seed, pred) => {
    reset()
    reseed(seed) // Steps D-G
    let res // Step H: grind until k is in [1..n-1]
    while (!(res = pred(gen()))) { reseed() }
    reset()
    return res
  }
  return genUntil
}
// Validating curves and fields
const validatorFns = {
  bigint: (val) => typeof val === 'bigint',
  function: (val) => typeof val === 'function',
  boolean: (val) => typeof val === 'boolean',
  string: (val) => typeof val === 'string',
  stringOrUint8Array: (val) => typeof val === 'string' || isBytes(val),
  isSafeInteger: (val) => Number.isSafeInteger(val),
  array: (val) => Array.isArray(val),
  field: (val, object) => object.Fp.isValid(val),
  hash: (val) => typeof val === 'function' && Number.isSafeInteger(val.outputLen)
}
// type Record<K extends string | number | symbol, T> = { [P in K]: T; }
function validateObject (object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type]
    if (typeof checkVal !== 'function') { throw new Error('invalid validator function') }
    const val = object[fieldName]
    if (isOptional && val === undefined) { return }
    if (!checkVal(val, object)) {
      throw new Error('param ' + String(fieldName) + ' is invalid. Expected ' + type + ', got ' + val)
    }
  }
  for (const [fieldName, type] of Object.entries(validators)) { checkField(fieldName, type, false) }
  for (const [fieldName, type] of Object.entries(optValidators)) { checkField(fieldName, type, true) }
  return object
}
// validate type tests
// const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
// const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
// // Should fail type-check
// const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
// const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
// const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
// const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
/**
 * throws not implemented error
 */
const notImplemented = () => {
  throw new Error('not implemented')
}
/**
 * Memoizes (caches) computation result.
 * Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
 */
function memoized (fn) {
  const map = new WeakMap()
  return (arg, ...args) => {
    const val = map.get(arg)
    if (val !== undefined) { return val }
    const computed = fn(arg, ...args)
    map.set(arg, computed)
    return computed
  }
}

const ut = /* #__PURE__ */Object.freeze({
  __proto__: null,
  aInRange,
  abool,
  abytes,
  bitGet,
  bitLen,
  bitMask,
  bitSet,
  bytesToHex,
  bytesToNumberBE,
  bytesToNumberLE,
  concatBytes,
  createHmacDrbg,
  ensureBytes,
  equalBytes,
  hexToBytes,
  hexToNumber,
  inRange,
  isBytes,
  memoized,
  notImplemented,
  numberToBytesBE,
  numberToBytesLE,
  numberToHexUnpadded,
  numberToVarBytesBE,
  utf8ToBytes,
  validateObject
})

/**
 * Utils for modular division and finite fields.
 * A finite field over 11 is integer number operations `mod 11`.
 * There is no division: it is replaced by modular multiplicative inverse.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// prettier-ignore
const _0n$3 = BigInt(0); const _1n$3 = BigInt(1); const _2n$1 = /* @__PURE__ */ BigInt(2); const _3n$1 = /* @__PURE__ */ BigInt(3)
// prettier-ignore
const _4n = /* @__PURE__ */ BigInt(4); const _5n = /* @__PURE__ */ BigInt(5); const _8n = /* @__PURE__ */ BigInt(8)
// Calculates a modulo b
function mod (a, b) {
  const result = a % b
  return result >= _0n$3 ? result : b + result
}
/**
 * Efficiently raise num to power and do modular division.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 * @todo use field version && remove
 * @example
 * pow(2n, 6n, 11n) // 64n % 11n == 9n
 */
function pow (num, power, modulo) {
  if (power < _0n$3) { throw new Error('invalid exponent, negatives unsupported') }
  if (modulo <= _0n$3) { throw new Error('invalid modulus') }
  if (modulo === _1n$3) { return _0n$3 }
  let res = _1n$3
  while (power > _0n$3) {
    if (power & _1n$3) { res = (res * num) % modulo }
    num = (num * num) % modulo
    power >>= _1n$3
  }
  return res
}
/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
function pow2 (x, power, modulo) {
  let res = x
  while (power-- > _0n$3) {
    res *= res
    res %= modulo
  }
  return res
}
/**
 * Inverses number over modulo.
 * Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
 */
function invert (number, modulo) {
  if (number === _0n$3) { throw new Error('invert: expected non-zero number') }
  if (modulo <= _0n$3) { throw new Error('invert: expected positive modulus, got ' + modulo) }
  // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.
  let a = mod(number, modulo)
  let b = modulo
  // prettier-ignore
  let x = _0n$3; let u = _1n$3
  while (a !== _0n$3) {
    // JIT applies optimization if those two lines follow each other
    const q = b / a
    const r = b % a
    const m = x - u * q
    // prettier-ignore
    b = a, a = r, x = u, u = m
  }
  const gcd = b
  if (gcd !== _1n$3) { throw new Error('invert: does not exist') }
  return mod(x, modulo)
}
/**
 * Tonelli-Shanks square root search algorithm.
 * 1. https://eprint.iacr.org/2012/685.pdf (page 12)
 * 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
 * Will start an infinite loop if field order P is not prime.
 * @param P field order
 * @returns function that takes field Fp (created from P) and number n
 */
function tonelliShanks (P) {
  // Legendre constant: used to calculate Legendre symbol (a | p),
  // which denotes the value of a^((p-1)/2) (mod p).
  // (a | p) ≡ 1    if a is a square (mod p)
  // (a | p) ≡ -1   if a is not a square (mod p)
  // (a | p) ≡ 0    if a ≡ 0 (mod p)
  const legendreC = (P - _1n$3) / _2n$1
  let Q, S, Z
  // Step 1: By factoring out powers of 2 from p - 1,
  // find q and s such that p - 1 = q*(2^s) with q odd
  for (Q = P - _1n$3, S = 0; Q % _2n$1 === _0n$3; Q /= _2n$1, S++)
    ;
    // Step 2: Select a non-square z such that (z | p) ≡ -1 and set c ≡ zq
  for (Z = _2n$1; Z < P && pow(Z, legendreC, P) !== P - _1n$3; Z++) {
    // Crash instead of infinity loop, we cannot reasonable count until P.
    if (Z > 1000) { throw new Error('Cannot find square root: likely non-prime P') }
  }
  // Fast-path
  if (S === 1) {
    const p1div4 = (P + _1n$3) / _4n
    return function tonelliFast (Fp, n) {
      const root = Fp.pow(n, p1div4)
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Slow-path
  const Q1div2 = (Q + _1n$3) / _2n$1
  return function tonelliSlow (Fp, n) {
    // Step 0: Check that n is indeed a square: (n | p) should not be ≡ -1
    if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE)) { throw new Error('Cannot find square root') }
    let r = S
    // TODO: will fail at Fp2/etc
    let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q) // will update both x and b
    let x = Fp.pow(n, Q1div2) // first guess at the square root
    let b = Fp.pow(n, Q) // first guess at the fudge factor
    while (!Fp.eql(b, Fp.ONE)) {
      if (Fp.eql(b, Fp.ZERO)) { return Fp.ZERO } // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm (4. If t = 0, return r = 0)
      // Find m such b^(2^m)==1
      let m = 1
      for (let t2 = Fp.sqr(b); m < r; m++) {
        if (Fp.eql(t2, Fp.ONE)) { break }
        t2 = Fp.sqr(t2) // t2 *= t2
      }
      // NOTE: r-m-1 can be bigger than 32, need to convert to bigint before shift, otherwise there will be overflow
      const ge = Fp.pow(g, _1n$3 << BigInt(r - m - 1)) // ge = 2^(r-m-1)
      g = Fp.sqr(ge) // g = ge * ge
      x = Fp.mul(x, ge) // x *= ge
      b = Fp.mul(b, g) // b *= g
      r = m
    }
    return x
  }
}
/**
 * Square root for a finite field. It will try to check if optimizations are applicable and fall back to 4:
 *
 * 1. P ≡ 3 (mod 4)
 * 2. P ≡ 5 (mod 8)
 * 3. P ≡ 9 (mod 16)
 * 4. Tonelli-Shanks algorithm
 *
 * Different algorithms can give different roots, it is up to user to decide which one they want.
 * For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
 */
function FpSqrt (P) {
  // P ≡ 3 (mod 4)
  // √n = n^((P+1)/4)
  if (P % _4n === _3n$1) {
    // Not all roots possible!
    // const ORDER =
    //   0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
    // const NUM = 72057594037927816n;
    const p1div4 = (P + _1n$3) / _4n
    return function sqrt3mod4 (Fp, n) {
      const root = Fp.pow(n, p1div4)
      // Throw if root**2 != n
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Atkin algorithm for q ≡ 5 (mod 8), https://eprint.iacr.org/2012/685.pdf (page 10)
  if (P % _8n === _5n) {
    const c1 = (P - _5n) / _8n
    return function sqrt5mod8 (Fp, n) {
      const n2 = Fp.mul(n, _2n$1)
      const v = Fp.pow(n2, c1)
      const nv = Fp.mul(n, v)
      const i = Fp.mul(Fp.mul(nv, _2n$1), v)
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE))
      if (!Fp.eql(Fp.sqr(root), n)) { throw new Error('Cannot find square root') }
      return root
    }
  }
  // Other cases: Tonelli-Shanks algorithm
  return tonelliShanks(P)
}
// prettier-ignore
const FIELD_FIELDS = [
  'create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr',
  'eql', 'add', 'sub', 'mul', 'pow', 'div',
  'addN', 'subN', 'mulN', 'sqrN'
]
function validateField (field) {
  const initial = {
    ORDER: 'bigint',
    MASK: 'bigint',
    BYTES: 'isSafeInteger',
    BITS: 'isSafeInteger'
  }
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = 'function'
    return map
  }, initial)
  return validateObject(field, opts)
}
// Generic field functions
/**
 * Same as `pow` but for Fp: non-constant-time.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 */
function FpPow (f, num, power) {
  // Should have same speed as pow for bigints
  // TODO: benchmark!
  if (power < _0n$3) { throw new Error('invalid exponent, negatives unsupported') }
  if (power === _0n$3) { return f.ONE }
  if (power === _1n$3) { return num }
  let p = f.ONE
  let d = num
  while (power > _0n$3) {
    if (power & _1n$3) { p = f.mul(p, d) }
    d = f.sqr(d)
    power >>= _1n$3
  }
  return p
}
/**
 * Efficiently invert an array of Field elements.
 * `inv(0)` will return `undefined` here: make sure to throw an error.
 */
function FpInvertBatch (f, nums) {
  const tmp = new Array(nums.length)
  // Walk from first to last, multiply them by each other MOD p
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (f.is0(num)) { return acc }
    tmp[i] = acc
    return f.mul(acc, num)
  }, f.ONE)
  // Invert last element
  const inverted = f.inv(lastMultiplied)
  // Walk from last to first, multiply them by inverted each other MOD p
  nums.reduceRight((acc, num, i) => {
    if (f.is0(num)) { return acc }
    tmp[i] = f.mul(acc, tmp[i])
    return f.mul(acc, num)
  }, inverted)
  return tmp
}
// CURVE.n lengths
function nLength (n, nBitLength) {
  // Bit size, byte size of CURVE.n
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length
  const nByteLength = Math.ceil(_nBitLength / 8)
  return { nBitLength: _nBitLength, nByteLength }
}
/**
 * Initializes a finite field over prime.
 * Major performance optimizations:
 * * a) denormalized operations like mulN instead of mul
 * * b) same object shape: never add or remove keys
 * * c) Object.freeze
 * Fragile: always run a benchmark on a change.
 * Security note: operations don't check 'isValid' for all elements for performance reasons,
 * it is caller responsibility to check this.
 * This is low-level code, please make sure you know what you're doing.
 * @param ORDER prime positive bigint
 * @param bitLen how many bits the field consumes
 * @param isLE (def: false) if encoding / decoding should be in little-endian
 * @param redef optional faster redefinitions of sqrt and other methods
 */
function Field (ORDER, bitLen, isLE = false, redef = {}) {
  if (ORDER <= _0n$3) { throw new Error('invalid field: expected ORDER > 0, got ' + ORDER) }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen)
  if (BYTES > 2048) { throw new Error('invalid field: expected ORDER of <= 2048 bytes') }
  let sqrtP // cached sqrtP
  const f = Object.freeze({
    ORDER,
    isLE,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n$3,
    ONE: _1n$3,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== 'bigint') { throw new Error('invalid field element: expected bigint, got ' + typeof num) }
      return _0n$3 <= num && num < ORDER // 0 is valid element, but it's not invertible
    },
    is0: (num) => num === _0n$3,
    isOdd: (num) => (num & _1n$3) === _1n$3,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt ||
            ((n) => {
              if (!sqrtP) { sqrtP = FpSqrt(ORDER) }
              return sqrtP(f, n)
            }),
    invertBatch: (lst) => FpInvertBatch(f, lst),
    // TODO: do we really need constant cmov?
    // We don't have const-time bigints anyway, so probably will be not very useful
    cmov: (a, b, c) => (c ? b : a),
    toBytes: (num) => (isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES)),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES) { throw new Error('Field.fromBytes: expected ' + BYTES + ' bytes, got ' + bytes.length) }
      return isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes)
    }
  })
  return Object.freeze(f)
}
/**
 * Returns total number of bytes consumed by the field element.
 * For example, 32 bytes for usual 256-bit weierstrass curve.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of field
 */
function getFieldBytesLength (fieldOrder) {
  if (typeof fieldOrder !== 'bigint') { throw new Error('field order must be bigint') }
  const bitLength = fieldOrder.toString(2).length
  return Math.ceil(bitLength / 8)
}
/**
 * Returns minimal amount of bytes that can be safely reduced
 * by field order.
 * Should be 2^-128 for 128-bit curve such as P256.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of target hash
 */
function getMinHashLength (fieldOrder) {
  const length = getFieldBytesLength(fieldOrder)
  return length + Math.ceil(length / 2)
}
/**
 * "Constant-time" private key generation utility.
 * Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
 * and convert them into private scalar, with the modulo bias being negligible.
 * Needs at least 48 bytes of input for 32-byte private key.
 * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
 * FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
 * RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
 * @param hash hash output from SHA3 or a similar function
 * @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
 * @param isLE interpret hash bytes as LE num
 * @returns valid private scalar
 */
function mapHashToField (key, fieldOrder, isLE = false) {
  const len = key.length
  const fieldLen = getFieldBytesLength(fieldOrder)
  const minLen = getMinHashLength(fieldOrder)
  // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
  if (len < 16 || len < minLen || len > 1024) { throw new Error('expected ' + minLen + '-1024 bytes of input, got ' + len) }
  const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key)
  // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
  const reduced = mod(num, fieldOrder - _1n$3) + _1n$3
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen)
}

/**
 * Methods for elliptic curve multiplication by scalars.
 * Contains wNAF, pippenger
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const _0n$2 = BigInt(0)
const _1n$2 = BigInt(1)
function constTimeNegate (condition, item) {
  const neg = item.negate()
  return condition ? neg : item
}
function validateW (W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits) { throw new Error('invalid window size, expected [1..' + bits + '], got W=' + W) }
}
function calcWOpts (W, bits) {
  validateW(W, bits)
  const windows = Math.ceil(bits / W) + 1 // +1, because
  const windowSize = 2 ** (W - 1) // -1 because we skip zero
  return { windows, windowSize }
}
function validateMSMPoints (points, c) {
  if (!Array.isArray(points)) { throw new Error('array expected') }
  points.forEach((p, i) => {
    if (!(p instanceof c)) { throw new Error('invalid point at index ' + i) }
  })
}
function validateMSMScalars (scalars, field) {
  if (!Array.isArray(scalars)) { throw new Error('array of scalars expected') }
  scalars.forEach((s, i) => {
    if (!field.isValid(s)) { throw new Error('invalid scalar at index ' + i) }
  })
}
// Since points in different groups cannot be equal (different object constructor),
// we can have single place to store precomputes
const pointPrecomputes = new WeakMap()
const pointWindowSizes = new WeakMap() // This allows use make points immutable (nothing changes inside)
function getW (P) {
  return pointWindowSizes.get(P) || 1
}
/**
 * Elliptic curve multiplication of Point by scalar. Fragile.
 * Scalars should always be less than curve order: this should be checked inside of a curve itself.
 * Creates precomputation tables for fast multiplication:
 * - private scalar is split by fixed size windows of W bits
 * - every window point is collected from window's table & added to accumulator
 * - since windows are different, same point inside tables won't be accessed more than once per calc
 * - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
 * - +1 window is neccessary for wNAF
 * - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
 *
 * @todo Research returning 2d JS array of windows, instead of a single window.
 * This would allow windows to be in different memory locations
 */
function wNAF (c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes (elm) {
      return getW(elm) !== 1
    },
    // non-const time multiplication ladder
    unsafeLadder (elm, n, p = c.ZERO) {
      let d = elm
      while (n > _0n$2) {
        if (n & _1n$2) { p = p.add(d) }
        d = d.double()
        n >>= _1n$2
      }
      return p
    },
    /**
         * Creates a wNAF precomputation window. Used for caching.
         * Default window size is set by `utils.precompute()` and is equal to 8.
         * Number of precomputed points depends on the curve size:
         * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
         * - 𝑊 is the window size
         * - 𝑛 is the bitlength of the curve order.
         * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
         * @param elm Point instance
         * @param W window size
         * @returns precomputed point tables flattened to a single array
         */
    precomputeWindow (elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits)
      const points = []
      let p = elm
      let base = p
      for (let window = 0; window < windows; window++) {
        base = p
        points.push(base)
        // =1, because we skip zero
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p)
          points.push(base)
        }
        p = base.double()
      }
      return points
    },
    /**
         * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
         * @param W window size
         * @param precomputes precomputed tables
         * @param n scalar (we don't check here, but should be less than curve order)
         * @returns real and fake (for const-time) points
         */
    wNAF (W, precomputes, n) {
      // TODO: maybe check that scalar is less than group order? wNAF behavious is undefined otherwise
      // But need to carefully remove other checks before wNAF. ORDER == bits here
      const { windows, windowSize } = calcWOpts(W, bits)
      let p = c.ZERO
      let f = c.BASE
      const mask = BigInt(2 ** W - 1) // Create mask with W ones: 0b1111 for W=4 etc.
      const maxNumber = 2 ** W
      const shiftBy = BigInt(W)
      for (let window = 0; window < windows; window++) {
        const offset = window * windowSize
        // Extract W bits.
        let wbits = Number(n & mask)
        // Shift number by W bits.
        n >>= shiftBy
        // If the bits are bigger than max size, we'll split those.
        // +224 => 256 - 32
        if (wbits > windowSize) {
          wbits -= maxNumber
          n += _1n$2
        }
        // This code was first written with assumption that 'f' and 'p' will never be infinity point:
        // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
        // there is negate now: it is possible that negated element from low value
        // would be the same as high element, which will create carry into next window.
        // It's not obvious how this can fail, but still worth investigating later.
        // Check if we're onto Zero point.
        // Add random point inside current window to f.
        const offset1 = offset
        const offset2 = offset + Math.abs(wbits) - 1 // -1 because we skip zero
        const cond1 = window % 2 !== 0
        const cond2 = wbits < 0
        if (wbits === 0) {
          // The most important part for const-time getPublicKey
          f = f.add(constTimeNegate(cond1, precomputes[offset1]))
        } else {
          p = p.add(constTimeNegate(cond2, precomputes[offset2]))
        }
      }
      // JIT-compiler should not eliminate f here, since it will later be used in normalizeZ()
      // Even if the variable is still unused, there are some checks which will
      // throw an exception, so compiler needs to prove they won't happen, which is hard.
      // At this point there is a way to F be infinity-point even if p is not,
      // which makes it less const-time: around 1 bigint multiply.
      return { p, f }
    },
    /**
         * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
         * @param W window size
         * @param precomputes precomputed tables
         * @param n scalar (we don't check here, but should be less than curve order)
         * @param acc accumulator point to add result of multiplication
         * @returns point
         */
    wNAFUnsafe (W, precomputes, n, acc = c.ZERO) {
      const { windows, windowSize } = calcWOpts(W, bits)
      const mask = BigInt(2 ** W - 1) // Create mask with W ones: 0b1111 for W=4 etc.
      const maxNumber = 2 ** W
      const shiftBy = BigInt(W)
      for (let window = 0; window < windows; window++) {
        const offset = window * windowSize
        if (n === _0n$2) { break } // No need to go over empty scalar
        // Extract W bits.
        let wbits = Number(n & mask)
        // Shift number by W bits.
        n >>= shiftBy
        // If the bits are bigger than max size, we'll split those.
        // +224 => 256 - 32
        if (wbits > windowSize) {
          wbits -= maxNumber
          n += _1n$2
        }
        if (wbits === 0) { continue }
        let curr = precomputes[offset + Math.abs(wbits) - 1] // -1 because we skip zero
        if (wbits < 0) { curr = curr.negate() }
        // NOTE: by re-using acc, we can save a lot of additions in case of MSM
        acc = acc.add(curr)
      }
      return acc
    },
    getPrecomputes (W, P, transform) {
      // Calculate precomputes on a first run, reuse them after
      let comp = pointPrecomputes.get(P)
      if (!comp) {
        comp = this.precomputeWindow(P, W)
        if (W !== 1) { pointPrecomputes.set(P, transform(comp)) }
      }
      return comp
    },
    wNAFCached (P, n, transform) {
      const W = getW(P)
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n)
    },
    wNAFCachedUnsafe (P, n, transform, prev) {
      const W = getW(P)
      if (W === 1) { return this.unsafeLadder(P, n, prev) } // For W=1 ladder is ~x2 faster
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev)
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize (P, W) {
      validateW(W, bits)
      pointWindowSizes.set(P, W)
      pointPrecomputes.delete(P)
    }
  }
}
/**
 * Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
 * 30x faster vs naive addition on L=4096, 10x faster with precomputes.
 * For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
 * Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
 * @param c Curve Point constructor
 * @param fieldN field over CURVE.N - important that it's not over CURVE.P
 * @param points array of L curve points
 * @param scalars array of L scalars (aka private keys / bigints)
 */
function pippenger (c, fieldN, points, scalars) {
  // If we split scalars by some window (let's say 8 bits), every chunk will only
  // take 256 buckets even if there are 4096 scalars, also re-uses double.
  // TODO:
  // - https://eprint.iacr.org/2024/750.pdf
  // - https://tches.iacr.org/index.php/TCHES/article/view/10287
  // 0 is accepted in scalars
  validateMSMPoints(points, c)
  validateMSMScalars(scalars, fieldN)
  if (points.length !== scalars.length) { throw new Error('arrays of points and scalars must have equal length') }
  const zero = c.ZERO
  const wbits = bitLen(BigInt(points.length))
  const windowSize = wbits > 12 ? wbits - 3 : wbits > 4 ? wbits - 2 : wbits ? 2 : 1 // in bits
  const MASK = (1 << windowSize) - 1
  const buckets = new Array(MASK + 1).fill(zero) // +1 for zero array
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize
  let sum = zero
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero)
    for (let j = 0; j < scalars.length; j++) {
      const scalar = scalars[j]
      const wbits = Number((scalar >> BigInt(i)) & BigInt(MASK))
      buckets[wbits] = buckets[wbits].add(points[j])
    }
    let resI = zero // not using this will do small speed-up, but will lose ct
    // Skip first bucket, because it is zero
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j])
      resI = resI.add(sumI)
    }
    sum = sum.add(resI)
    if (i !== 0) {
      for (let j = 0; j < windowSize; j++) { sum = sum.double() }
    }
  }
  return sum
}
function validateBasic (curve) {
  validateField(curve.Fp)
  validateObject(curve, {
    n: 'bigint',
    h: 'bigint',
    Gx: 'field',
    Gy: 'field'
  }, {
    nBitLength: 'isSafeInteger',
    nByteLength: 'isSafeInteger'
  })
  // Set defaults
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  })
}

/**
 * Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
 *
 * ### Design rationale for types
 *
 * * Interaction between classes from different curves should fail:
 *   `k256.Point.BASE.add(p256.Point.BASE)`
 * * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
 * * Different calls of `curve()` would return different classes -
 *   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
 *   it won't affect others
 *
 * TypeScript can't infer types for classes created inside a function. Classes is one instance
 * of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
 * unique type for every function call.
 *
 * We can use generic types via some param, like curve opts, but that would:
 *     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
 *     which is hard to debug.
 *     2. Params can be generic and we can't enforce them to be constant value:
 *     if somebody creates curve from non-constant params,
 *     it would be allowed to interact with other curves with non-constant params
 *
 * @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function validateSigVerOpts (opts) {
  if (opts.lowS !== undefined) { abool('lowS', opts.lowS) }
  if (opts.prehash !== undefined) { abool('prehash', opts.prehash) }
}
function validatePointOpts (curve) {
  const opts = validateBasic(curve)
  validateObject(opts, {
    a: 'field',
    b: 'field'
  }, {
    allowedPrivateKeyLengths: 'array',
    wrapPrivateKey: 'boolean',
    isTorsionFree: 'function',
    clearCofactor: 'function',
    allowInfinityPoint: 'boolean',
    fromBytes: 'function',
    toBytes: 'function'
  })
  const { endo, Fp, a } = opts
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error('invalid endomorphism, can only be defined for Koblitz curves that have a=0')
    }
    if (typeof endo !== 'object' ||
            typeof endo.beta !== 'bigint' ||
            typeof endo.splitScalar !== 'function') {
      throw new Error('invalid endomorphism, expected beta: bigint and splitScalar: function')
    }
  }
  return Object.freeze({ ...opts })
}
const { bytesToNumberBE: b2n, hexToBytes: h2b } = ut
class DERErr extends Error {
  constructor (m = '') {
    super(m)
  }
}
/**
 * ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
 *
 *     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
 *
 * Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
 */
const DER = {
  // asn.1 DER encoding utils
  Err: DERErr,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER
      if (tag < 0 || tag > 256) { throw new E('tlv.encode: wrong tag') }
      if (data.length & 1) { throw new E('tlv.encode: unpadded data') }
      const dataLen = data.length / 2
      const len = numberToHexUnpadded(dataLen)
      if ((len.length / 2) & 128) { throw new E('tlv.encode: long form length too big') }
      // length of length with long form flag
      const lenLen = dataLen > 127 ? numberToHexUnpadded((len.length / 2) | 128) : ''
      const t = numberToHexUnpadded(tag)
      return t + lenLen + len + data
    },
    // v - value, l - left bytes (unparsed)
    decode (tag, data) {
      const { Err: E } = DER
      let pos = 0
      if (tag < 0 || tag > 256) { throw new E('tlv.encode: wrong tag') }
      if (data.length < 2 || data[pos++] !== tag) { throw new E('tlv.decode: wrong tlv') }
      const first = data[pos++]
      const isLong = !!(first & 128) // First bit of first length byte is flag for short/long form
      let length = 0
      if (!isLong) { length = first } else {
        // Long form: [longFlag(1bit), lengthLength(7bit), length (BE)]
        const lenLen = first & 127
        if (!lenLen) { throw new E('tlv.decode(long): indefinite length not supported') }
        if (lenLen > 4) { throw new E('tlv.decode(long): byte length is too big') } // this will overflow u32 in js
        const lengthBytes = data.subarray(pos, pos + lenLen)
        if (lengthBytes.length !== lenLen) { throw new E('tlv.decode: length bytes not complete') }
        if (lengthBytes[0] === 0) { throw new E('tlv.decode(long): zero leftmost byte') }
        for (const b of lengthBytes) { length = (length << 8) | b }
        pos += lenLen
        if (length < 128) { throw new E('tlv.decode(long): not minimal encoding') }
      }
      const v = data.subarray(pos, pos + length)
      if (v.length !== length) { throw new E('tlv.decode: wrong value length') }
      return { v, l: data.subarray(pos + length) }
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode (num) {
      const { Err: E } = DER
      if (num < _0n$1) { throw new E('integer: negative integers are not allowed') }
      let hex = numberToHexUnpadded(num)
      // Pad with zero byte if negative flag is present
      if (Number.parseInt(hex[0], 16) & 0b1000) { hex = '00' + hex }
      if (hex.length & 1) { throw new E('unexpected DER parsing assertion: unpadded hex') }
      return hex
    },
    decode (data) {
      const { Err: E } = DER
      if (data[0] & 128) { throw new E('invalid signature integer: negative') }
      if (data[0] === 0x00 && !(data[1] & 128)) { throw new E('invalid signature integer: unnecessary leading zero') }
      return b2n(data)
    }
  },
  toSig (hex) {
    // parse DER signature
    const { Err: E, _int: int, _tlv: tlv } = DER
    const data = typeof hex === 'string' ? h2b(hex) : hex
    abytes(data)
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(0x30, data)
    if (seqLeftBytes.length) { throw new E('invalid signature: left bytes after parsing') }
    const { v: rBytes, l: rLeftBytes } = tlv.decode(0x02, seqBytes)
    const { v: sBytes, l: sLeftBytes } = tlv.decode(0x02, rLeftBytes)
    if (sLeftBytes.length) { throw new E('invalid signature: left bytes after parsing') }
    return { r: int.decode(rBytes), s: int.decode(sBytes) }
  },
  hexFromSig (sig) {
    const { _tlv: tlv, _int: int } = DER
    const rs = tlv.encode(0x02, int.encode(sig.r))
    const ss = tlv.encode(0x02, int.encode(sig.s))
    const seq = rs + ss
    return tlv.encode(0x30, seq)
  }
}
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const _0n$1 = BigInt(0); const _1n$1 = BigInt(1); BigInt(2); const _3n = BigInt(3); BigInt(4)
function weierstrassPoints (opts) {
  const CURVE = validatePointOpts(opts)
  const { Fp } = CURVE // All curves has same field / group length as for now, but they can differ
  const Fn = Field(CURVE.n, CURVE.nBitLength)
  const toBytes = CURVE.toBytes ||
        ((_c, point, _isCompressed) => {
          const a = point.toAffine()
          return concatBytes(Uint8Array.from([0x04]), Fp.toBytes(a.x), Fp.toBytes(a.y))
        })
  const fromBytes = CURVE.fromBytes ||
        ((bytes) => {
          // const head = bytes[0];
          const tail = bytes.subarray(1)
          // if (head !== 0x04) throw new Error('Only non-compressed encoding is supported');
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
          return { x, y }
        })
  /**
     * y² = x³ + ax + b: Short weierstrass curve formula
     * @returns y²
     */
  function weierstrassEquation (x) {
    const { a, b } = CURVE
    const x2 = Fp.sqr(x) // x * x
    const x3 = Fp.mul(x2, x) // x2 * x
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b) // x3 + a * x + b
  }
  // Validate whether the passed curve params are valid.
  // We check if curve equation works for generator point.
  // `assertValidity()` won't work: `isTorsionFree()` is not available at this point in bls12-381.
  // ProjectivePoint class has not been initialized yet.
  if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx))) { throw new Error('bad generator point: equation left != right') }
  // Valid group elements reside in range 1..n-1
  function isWithinCurveOrder (num) {
    return inRange(num, _1n$1, CURVE.n)
  }
  // Validates if priv key is valid and converts it to bigint.
  // Supports options allowedPrivateKeyLengths and wrapPrivateKey.
  function normPrivateKeyToScalar (key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE
    if (lengths && typeof key !== 'bigint') {
      if (isBytes(key)) { key = bytesToHex(key) }
      // Normalize to hex string, pad. E.g. P521 would norm 130-132 char hex to 132-char bytes
      if (typeof key !== 'string' || !lengths.includes(key.length)) { throw new Error('invalid private key') }
      key = key.padStart(nByteLength * 2, '0')
    }
    let num
    try {
      num =
                typeof key === 'bigint'
                  ? key
                  : bytesToNumberBE(ensureBytes('private key', key, nByteLength))
    } catch (error) {
      throw new Error('invalid private key, expected hex or ' + nByteLength + ' bytes, got ' + typeof key)
    }
    if (wrapPrivateKey) { num = mod(num, N) } // disabled by default, enabled for BLS
    aInRange('private key', num, _1n$1, N) // num in range [1..N-1]
    return num
  }
  function assertPrjPoint (other) {
    if (!(other instanceof Point)) { throw new Error('ProjectivePoint expected') }
  }
  // Memoized toAffine / validity check. They are heavy. Points are immutable.
  // Converts Projective point to affine (x, y) coordinates.
  // Can accept precomputed Z^-1 - for example, from invertBatch.
  // (x, y, z) ∋ (x=x/z, y=y/z)
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p
    // Fast-path for normalized points
    if (Fp.eql(z, Fp.ONE)) { return { x, y } }
    const is0 = p.is0()
    // If invZ was 0, we return zero point. However we still want to execute
    // all operations, so we replace invZ with a random number, 1.
    if (iz == null) { iz = is0 ? Fp.ONE : Fp.inv(z) }
    const ax = Fp.mul(x, iz)
    const ay = Fp.mul(y, iz)
    const zz = Fp.mul(z, iz)
    if (is0) { return { x: Fp.ZERO, y: Fp.ZERO } }
    if (!Fp.eql(zz, Fp.ONE)) { throw new Error('invZ was invalid') }
    return { x: ax, y: ay }
  })
  // NOTE: on exception this will crash 'cached' and no value will be set.
  // Otherwise true will be return
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      // (0, 1, 0) aka ZERO is invalid in most contexts.
      // In BLS, ZERO can be serialized, so we allow it.
      // (0, 0, 0) is invalid representation of ZERO.
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py)) { return }
      throw new Error('bad point: ZERO')
    }
    // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`
    const { x, y } = p.toAffine()
    // Check if x, y are valid field elements
    if (!Fp.isValid(x) || !Fp.isValid(y)) { throw new Error('bad point: x or y not FE') }
    const left = Fp.sqr(y) // y²
    const right = weierstrassEquation(x) // x³ + ax + b
    if (!Fp.eql(left, right)) { throw new Error('bad point: equation left != right') }
    if (!p.isTorsionFree()) { throw new Error('bad point: not in prime-order subgroup') }
    return true
  })
  /**
     * Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
     * Default Point works in 2d / affine coordinates: (x, y)
     * We're doing calculations in projective, because its operations don't require costly inversion.
     */
  class Point {
    constructor (px, py, pz) {
      this.px = px
      this.py = py
      this.pz = pz
      if (px == null || !Fp.isValid(px)) { throw new Error('x required') }
      if (py == null || !Fp.isValid(py)) { throw new Error('y required') }
      if (pz == null || !Fp.isValid(pz)) { throw new Error('z required') }
      Object.freeze(this)
    }

    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine (p) {
      const { x, y } = p || {}
      if (!p || !Fp.isValid(x) || !Fp.isValid(y)) { throw new Error('invalid affine point') }
      if (p instanceof Point) { throw new Error('projective point not allowed') }
      const is0 = (i) => Fp.eql(i, Fp.ZERO)
      // fromAffine(x:0, y:0) would produce (x:0, y:0, z:1), but we need (x:0, y:1, z:0)
      if (is0(x) && is0(y)) { return Point.ZERO }
      return new Point(x, y, Fp.ONE)
    }

    get x () {
      return this.toAffine().x
    }

    get y () {
      return this.toAffine().y
    }

    /**
         * Takes a bunch of Projective Points but executes only one
         * inversion on all of them. Inversion is very slow operation,
         * so this improves performance massively.
         * Optimization: converts a list of projective points to a list of identical points with Z=1.
         */
    static normalizeZ (points) {
      const toInv = Fp.invertBatch(points.map((p) => p.pz))
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine)
    }

    /**
         * Converts hash string or Uint8Array to Point.
         * @param hex short/long ECDSA hex
         */
    static fromHex (hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes('pointHex', hex)))
      P.assertValidity()
      return P
    }

    // Multiplies generator point by privateKey.
    static fromPrivateKey (privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey))
    }

    // Multiscalar Multiplication
    static msm (points, scalars) {
      return pippenger(Point, Fn, points, scalars)
    }

    // "Private method", don't use it directly
    _setWindowSize (windowSize) {
      wnaf.setWindowSize(this, windowSize)
    }

    // A point on curve is valid if it conforms to equation.
    assertValidity () {
      assertValidMemo(this)
    }

    hasEvenY () {
      const { y } = this.toAffine()
      if (Fp.isOdd) { return !Fp.isOdd(y) }
      throw new Error("Field doesn't support isOdd")
    }

    /**
         * Compare one point to another.
         */
    equals (other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1))
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1))
      return U1 && U2
    }

    /**
         * Flips point to one corresponding to (x, -y) in Affine coordinates.
         */
    negate () {
      return new Point(this.px, Fp.neg(this.py), this.pz)
    }

    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double () {
      const { a, b } = CURVE
      const b3 = Fp.mul(b, _3n)
      const { px: X1, py: Y1, pz: Z1 } = this
      let X3 = Fp.ZERO; let Y3 = Fp.ZERO; let Z3 = Fp.ZERO // prettier-ignore
      let t0 = Fp.mul(X1, X1) // step 1
      const t1 = Fp.mul(Y1, Y1)
      let t2 = Fp.mul(Z1, Z1)
      let t3 = Fp.mul(X1, Y1)
      t3 = Fp.add(t3, t3) // step 5
      Z3 = Fp.mul(X1, Z1)
      Z3 = Fp.add(Z3, Z3)
      X3 = Fp.mul(a, Z3)
      Y3 = Fp.mul(b3, t2)
      Y3 = Fp.add(X3, Y3) // step 10
      X3 = Fp.sub(t1, Y3)
      Y3 = Fp.add(t1, Y3)
      Y3 = Fp.mul(X3, Y3)
      X3 = Fp.mul(t3, X3)
      Z3 = Fp.mul(b3, Z3) // step 15
      t2 = Fp.mul(a, t2)
      t3 = Fp.sub(t0, t2)
      t3 = Fp.mul(a, t3)
      t3 = Fp.add(t3, Z3)
      Z3 = Fp.add(t0, t0) // step 20
      t0 = Fp.add(Z3, t0)
      t0 = Fp.add(t0, t2)
      t0 = Fp.mul(t0, t3)
      Y3 = Fp.add(Y3, t0)
      t2 = Fp.mul(Y1, Z1) // step 25
      t2 = Fp.add(t2, t2)
      t0 = Fp.mul(t2, t3)
      X3 = Fp.sub(X3, t0)
      Z3 = Fp.mul(t2, t1)
      Z3 = Fp.add(Z3, Z3) // step 30
      Z3 = Fp.add(Z3, Z3)
      return new Point(X3, Y3, Z3)
    }

    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add (other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      let X3 = Fp.ZERO; let Y3 = Fp.ZERO; let Z3 = Fp.ZERO // prettier-ignore
      const a = CURVE.a
      const b3 = Fp.mul(CURVE.b, _3n)
      let t0 = Fp.mul(X1, X2) // step 1
      let t1 = Fp.mul(Y1, Y2)
      let t2 = Fp.mul(Z1, Z2)
      let t3 = Fp.add(X1, Y1)
      let t4 = Fp.add(X2, Y2) // step 5
      t3 = Fp.mul(t3, t4)
      t4 = Fp.add(t0, t1)
      t3 = Fp.sub(t3, t4)
      t4 = Fp.add(X1, Z1)
      let t5 = Fp.add(X2, Z2) // step 10
      t4 = Fp.mul(t4, t5)
      t5 = Fp.add(t0, t2)
      t4 = Fp.sub(t4, t5)
      t5 = Fp.add(Y1, Z1)
      X3 = Fp.add(Y2, Z2) // step 15
      t5 = Fp.mul(t5, X3)
      X3 = Fp.add(t1, t2)
      t5 = Fp.sub(t5, X3)
      Z3 = Fp.mul(a, t4)
      X3 = Fp.mul(b3, t2) // step 20
      Z3 = Fp.add(X3, Z3)
      X3 = Fp.sub(t1, Z3)
      Z3 = Fp.add(t1, Z3)
      Y3 = Fp.mul(X3, Z3)
      t1 = Fp.add(t0, t0) // step 25
      t1 = Fp.add(t1, t0)
      t2 = Fp.mul(a, t2)
      t4 = Fp.mul(b3, t4)
      t1 = Fp.add(t1, t2)
      t2 = Fp.sub(t0, t2) // step 30
      t2 = Fp.mul(a, t2)
      t4 = Fp.add(t4, t2)
      t0 = Fp.mul(t1, t4)
      Y3 = Fp.add(Y3, t0)
      t0 = Fp.mul(t5, t4) // step 35
      X3 = Fp.mul(t3, X3)
      X3 = Fp.sub(X3, t0)
      t0 = Fp.mul(t3, t1)
      Z3 = Fp.mul(t5, Z3)
      Z3 = Fp.add(Z3, t0) // step 40
      return new Point(X3, Y3, Z3)
    }

    subtract (other) {
      return this.add(other.negate())
    }

    is0 () {
      return this.equals(Point.ZERO)
    }

    wNAF (n) {
      return wnaf.wNAFCached(this, n, Point.normalizeZ)
    }

    /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed private key e.g. sig verification, which works over *public* keys.
         */
    multiplyUnsafe (sc) {
      const { endo, n: N } = CURVE
      aInRange('scalar', sc, _0n$1, N)
      const I = Point.ZERO
      if (sc === _0n$1) { return I }
      if (this.is0() || sc === _1n$1) { return this }
      // Case a: no endomorphism. Case b: has precomputes.
      if (!endo || wnaf.hasPrecomputes(this)) { return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ) }
      // Case c: endomorphism
      let { k1neg, k1, k2neg, k2 } = endo.splitScalar(sc)
      let k1p = I
      let k2p = I
      let d = this
      while (k1 > _0n$1 || k2 > _0n$1) {
        if (k1 & _1n$1) { k1p = k1p.add(d) }
        if (k2 & _1n$1) { k2p = k2p.add(d) }
        d = d.double()
        k1 >>= _1n$1
        k2 >>= _1n$1
      }
      if (k1neg) { k1p = k1p.negate() }
      if (k2neg) { k2p = k2p.negate() }
      k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
      return k1p.add(k2p)
    }

    /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */
    multiply (scalar) {
      const { endo, n: N } = CURVE
      aInRange('scalar', scalar, _1n$1, N)
      let point, fake // Fake point is used to const-time mult
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = endo.splitScalar(scalar)
        let { p: k1p, f: f1p } = this.wNAF(k1)
        let { p: k2p, f: f2p } = this.wNAF(k2)
        k1p = wnaf.constTimeNegate(k1neg, k1p)
        k2p = wnaf.constTimeNegate(k2neg, k2p)
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
        point = k1p.add(k2p)
        fake = f1p.add(f2p)
      } else {
        const { p, f } = this.wNAF(scalar)
        point = p
        fake = f
      }
      // Normalize `z` for both points, but return only real one
      return Point.normalizeZ([point, fake])[0]
    }

    /**
         * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
         * Not using Strauss-Shamir trick: precomputation tables are faster.
         * The trick could be useful if both P and Q are not G (not in our case).
         * @returns non-zero affine point
         */
    multiplyAndAddUnsafe (Q, a, b) {
      const G = Point.BASE // No Strauss-Shamir trick: we have 10% faster G precomputes
      const mul = (P, a // Select faster multiply() method
      ) => (a === _0n$1 || a === _1n$1 || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a))
      const sum = mul(this, a).add(mul(Q, b))
      return sum.is0() ? undefined : sum
    }

    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine (iz) {
      return toAffineMemo(this, iz)
    }

    isTorsionFree () {
      const { h: cofactor, isTorsionFree } = CURVE
      if (cofactor === _1n$1) { return true } // No subgroups, always torsion-free
      if (isTorsionFree) { return isTorsionFree(Point, this) }
      throw new Error('isTorsionFree() has not been declared for the elliptic curve')
    }

    clearCofactor () {
      const { h: cofactor, clearCofactor } = CURVE
      if (cofactor === _1n$1) { return this } // Fast-path
      if (clearCofactor) { return clearCofactor(Point, this) }
      return this.multiplyUnsafe(CURVE.h)
    }

    toRawBytes (isCompressed = true) {
      abool('isCompressed', isCompressed)
      this.assertValidity()
      return toBytes(Point, this, isCompressed)
    }

    toHex (isCompressed = true) {
      abool('isCompressed', isCompressed)
      return bytesToHex(this.toRawBytes(isCompressed))
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE)
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO)
  const _bits = CURVE.nBitLength
  const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits)
  // Validate if generator point is on curve
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  }
}
function validateOpts (curve) {
  const opts = validateBasic(curve)
  validateObject(opts, {
    hash: 'hash',
    hmac: 'function',
    randomBytes: 'function'
  }, {
    bits2int: 'function',
    bits2int_modN: 'function',
    lowS: 'boolean'
  })
  return Object.freeze({ lowS: true, ...opts })
}
/**
 * Creates short weierstrass curve and ECDSA signature methods for it.
 * @example
 * import { Field } from '@noble/curves/abstract/modular';
 * // Before that, define BigInt-s: a, b, p, n, Gx, Gy
 * const curve = weierstrass({ a, b, Fp: Field(p), n, Gx, Gy, h: 1n })
 */
function weierstrass (curveDef) {
  const CURVE = validateOpts(curveDef)
  const { Fp, n: CURVE_ORDER } = CURVE
  const compressedLen = Fp.BYTES + 1 // e.g. 33 for 32
  const uncompressedLen = 2 * Fp.BYTES + 1 // e.g. 65 for 32
  function modN (a) {
    return mod(a, CURVE_ORDER)
  }
  function invN (a) {
    return invert(a, CURVE_ORDER)
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes (_c, point, isCompressed) {
      const a = point.toAffine()
      const x = Fp.toBytes(a.x)
      const cat = concatBytes
      abool('isCompressed', isCompressed)
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x)
      } else {
        return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y))
      }
    },
    fromBytes (bytes) {
      const len = bytes.length
      const head = bytes[0]
      const tail = bytes.subarray(1)
      // this.assertValidity() is done inside of fromHex
      if (len === compressedLen && (head === 0x02 || head === 0x03)) {
        const x = bytesToNumberBE(tail)
        if (!inRange(x, _1n$1, Fp.ORDER)) { throw new Error('Point is not on curve') }
        const y2 = weierstrassEquation(x) // y² = x³ + ax + b
        let y
        try {
          y = Fp.sqrt(y2) // y = y² ^ (p+1)/4
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ': ' + sqrtError.message : ''
          throw new Error('Point is not on curve' + suffix)
        }
        const isYOdd = (y & _1n$1) === _1n$1
        // ECDSA
        const isHeadOdd = (head & 1) === 1
        if (isHeadOdd !== isYOdd) { y = Fp.neg(y) }
        return { x, y }
      } else if (len === uncompressedLen && head === 0x04) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
        return { x, y }
      } else {
        const cl = compressedLen
        const ul = uncompressedLen
        throw new Error('invalid Point, expected length of ' + cl + ', or uncompressed ' + ul + ', got ' + len)
      }
    }
  })
  const numToNByteStr = (num) => bytesToHex(numberToBytesBE(num, CURVE.nByteLength))
  function isBiggerThanHalfOrder (number) {
    const HALF = CURVE_ORDER >> _1n$1
    return number > HALF
  }
  function normalizeS (s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s
  }
  // slice bytes num
  const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to))
  /**
     * ECDSA signature with its (r, s) properties. Supports DER & compact representations.
     */
  class Signature {
    constructor (r, s, recovery) {
      this.r = r
      this.s = s
      this.recovery = recovery
      this.assertValidity()
    }

    // pair (bytes of r, bytes of s)
    static fromCompact (hex) {
      const l = CURVE.nByteLength
      hex = ensureBytes('compactSignature', hex, l * 2)
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l))
    }

    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER (hex) {
      const { r, s } = DER.toSig(ensureBytes('DER', hex))
      return new Signature(r, s)
    }

    assertValidity () {
      aInRange('r', this.r, _1n$1, CURVE_ORDER) // r in [1..N]
      aInRange('s', this.s, _1n$1, CURVE_ORDER) // s in [1..N]
    }

    addRecoveryBit (recovery) {
      return new Signature(this.r, this.s, recovery)
    }

    recoverPublicKey (msgHash) {
      const { r, s, recovery: rec } = this
      const h = bits2int_modN(ensureBytes('msgHash', msgHash)) // Truncate hash
      if (rec == null || ![0, 1, 2, 3].includes(rec)) { throw new Error('recovery id invalid') }
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r
      if (radj >= Fp.ORDER) { throw new Error('recovery id 2 or 3 invalid') }
      const prefix = (rec & 1) === 0 ? '02' : '03'
      const R = Point.fromHex(prefix + numToNByteStr(radj))
      const ir = invN(radj) // r^-1
      const u1 = modN(-h * ir) // -hr^-1
      const u2 = modN(s * ir) // sr^-1
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2) // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1)
      if (!Q) { throw new Error('point at infinify') } // unsafe is fine: no priv data leaked
      Q.assertValidity()
      return Q
    }

    // Signatures should be low-s, to prevent malleability.
    hasHighS () {
      return isBiggerThanHalfOrder(this.s)
    }

    normalizeS () {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this
    }

    // DER-encoded
    toDERRawBytes () {
      return hexToBytes(this.toDERHex())
    }

    toDERHex () {
      return DER.hexFromSig({ r: this.r, s: this.s })
    }

    // padded bytes of r, then padded bytes of s
    toCompactRawBytes () {
      return hexToBytes(this.toCompactHex())
    }

    toCompactHex () {
      return numToNByteStr(this.r) + numToNByteStr(this.s)
    }
  }
  const utils = {
    isValidPrivateKey (privateKey) {
      try {
        normPrivateKeyToScalar(privateKey)
        return true
      } catch (error) {
        return false
      }
    },
    normPrivateKeyToScalar,
    /**
         * Produces cryptographically secure private key from random of size
         * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
         */
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n)
      return mapHashToField(CURVE.randomBytes(length), CURVE.n)
    },
    /**
         * Creates precompute table for an arbitrary EC point. Makes point "cached".
         * Allows to massively speed-up `point.multiply(scalar)`.
         * @returns cached point
         * @example
         * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
         * fast.multiply(privKey); // much faster ECDH now
         */
    precompute (windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize)
      point.multiply(BigInt(3)) // 3 is arbitrary, just need any number here
      return point
    }
  }
  /**
     * Computes public key for a private key. Checks for validity of the private key.
     * @param privateKey private key
     * @param isCompressed whether to return compact (default), or full key
     * @returns Public key, full when isCompressed=false; short when isCompressed=true
     */
  function getPublicKey (privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed)
  }
  /**
     * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
     */
  function isProbPub (item) {
    const arr = isBytes(item)
    const str = typeof item === 'string'
    const len = (arr || str) && item.length
    if (arr) { return len === compressedLen || len === uncompressedLen }
    if (str) { return len === 2 * compressedLen || len === 2 * uncompressedLen }
    if (item instanceof Point) { return true }
    return false
  }
  /**
     * ECDH (Elliptic Curve Diffie Hellman).
     * Computes shared public key from private key and public key.
     * Checks: 1) private key validity 2) shared key is on-curve.
     * Does NOT hash the result.
     * @param privateA private key
     * @param publicB different public key
     * @param isCompressed whether to return compact (default), or full key
     * @returns shared public key
     */
  function getSharedSecret (privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA)) { throw new Error('first arg must be private key') }
    if (!isProbPub(publicB)) { throw new Error('second arg must be public key') }
    const b = Point.fromHex(publicB) // check for being on-curve
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed)
  }
  // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
  // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
  // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
  // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors
  const bits2int = CURVE.bits2int ||
        function (bytes) {
          // Our custom check "just in case"
          if (bytes.length > 8192) { throw new Error('input is too large') }
          // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
          // for some cases, since bytes.length * 8 is not actual bitLength.
          const num = bytesToNumberBE(bytes) // check for == u8 done here
          const delta = bytes.length * 8 - CURVE.nBitLength // truncate to nBitLength leftmost bits
          return delta > 0 ? num >> BigInt(delta) : num
        }
  const bits2int_modN = CURVE.bits2int_modN ||
        function (bytes) {
          return modN(bits2int(bytes)) // can't use bytesToNumberBE here
        }
  // NOTE: pads output with zero as per spec
  const ORDER_MASK = bitMask(CURVE.nBitLength)
  /**
     * Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
     */
  function int2octets (num) {
    aInRange('num < 2^' + CURVE.nBitLength, num, _0n$1, ORDER_MASK)
    // works with order, can have different size than numToField!
    return numberToBytesBE(num, CURVE.nByteLength)
  }
  // Steps A, D of RFC6979 3.2
  // Creates RFC6979 seed; converts msg/privKey to numbers.
  // Used only in sign, not in verify.
  // NOTE: we cannot assume here that msgHash has same amount of bytes as curve order,
  // this will be invalid at least for P521. Also it can be bigger for P224 + SHA256
  function prepSig (msgHash, privateKey, opts = defaultSigOpts) {
    if (['recovered', 'canonical'].some((k) => k in opts)) { throw new Error('sign() legacy options not supported') }
    const { hash, randomBytes } = CURVE
    let { lowS, prehash, extraEntropy: ent } = opts // generates low-s sigs by default
    if (lowS == null) { lowS = true } // RFC6979 3.2: we skip step A, because we already provide hash
    msgHash = ensureBytes('msgHash', msgHash)
    validateSigVerOpts(opts)
    if (prehash) { msgHash = ensureBytes('prehashed msgHash', hash(msgHash)) }
    // We can't later call bits2octets, since nested bits2int is broken for curves
    // with nBitLength % 8 !== 0. Because of that, we unwrap it here as int2octets call.
    // const bits2octets = (bits) => int2octets(bits2int_modN(bits))
    const h1int = bits2int_modN(msgHash)
    const d = normPrivateKeyToScalar(privateKey) // validate private key, convert to bigint
    const seedArgs = [int2octets(d), int2octets(h1int)]
    // extraEntropy. RFC6979 3.6: additional k' (optional).
    if (ent != null && ent !== false) {
      // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
      const e = ent === true ? randomBytes(Fp.BYTES) : ent // generate random bytes OR pass as-is
      seedArgs.push(ensureBytes('extraEntropy', e)) // check for being bytes
    }
    const seed = concatBytes(...seedArgs) // Step D of RFC6979 3.2
    const m = h1int // NOTE: no need to call bits2int second time here, it is inside truncateHash!
    // Converts signature params into point w r/s, checks result for validity.
    function k2sig (kBytes) {
      // RFC 6979 Section 3.2, step 3: k = bits2int(T)
      const k = bits2int(kBytes) // Cannot use fields methods, since it is group element
      if (!isWithinCurveOrder(k)) { return } // Important: all mod() calls here must be done over N
      const ik = invN(k) // k^-1 mod n
      const q = Point.BASE.multiply(k).toAffine() // q = Gk
      const r = modN(q.x) // r = q.x mod n
      if (r === _0n$1) { return }
      // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
      // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
      // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT
      const s = modN(ik * modN(m + r * d)) // Not using blinding here
      if (s === _0n$1) { return }
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n$1) // recovery bit (2 or 3, when q.x > n)
      let normS = s
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s) // if lowS was passed, ensure s is always
        recovery ^= 1 // // in the bottom half of N
      }
      return new Signature(r, normS, recovery) // use normS, not s
    }
    return { seed, k2sig }
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false }
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false }
  /**
     * Signs message hash with a private key.
     * ```
     * sign(m, d, k) where
     *   (x, y) = G × k
     *   r = x mod n
     *   s = (m + dr)/k mod n
     * ```
     * @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
     * @param privKey private key
     * @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
     * @returns signature with recovery param
     */
  function sign (msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts) // Steps A, D of RFC6979 3.2.
    const C = CURVE
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac)
    return drbg(seed, k2sig) // Steps B, C, D, E, F, G
  }
  // Enable precomputes. Slows down first publicKey computation by 20ms.
  Point.BASE._setWindowSize(8)
  // utils.precompute(8, ProjectivePoint.BASE)
  /**
     * Verifies a signature against message hash and public key.
     * Rejects lowS signatures by default: to override,
     * specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
     *
     * ```
     * verify(r, s, h, P) where
     *   U1 = hs^-1 mod n
     *   U2 = rs^-1 mod n
     *   R = U1⋅G - U2⋅P
     *   mod(R.x, n) == r
     * ```
     */
  function verify (signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature
    msgHash = ensureBytes('msgHash', msgHash)
    publicKey = ensureBytes('publicKey', publicKey)
    const { lowS, prehash, format } = opts
    // Verify opts, deduce signature format
    validateSigVerOpts(opts)
    if ('strict' in opts) { throw new Error('options.strict was renamed to lowS') }
    if (format !== undefined && format !== 'compact' && format !== 'der') { throw new Error('format must be compact or der') }
    const isHex = typeof sg === 'string' || isBytes(sg)
    const isObj = !isHex &&
            !format &&
            typeof sg === 'object' &&
            sg !== null &&
            typeof sg.r === 'bigint' &&
            typeof sg.s === 'bigint'
    if (!isHex && !isObj) { throw new Error('invalid signature, expected Uint8Array, hex string or Signature instance') }
    let _sig
    let P
    try {
      if (isObj) { _sig = new Signature(sg.r, sg.s) }
      if (isHex) {
        // Signature can be represented in 2 ways: compact (2*nByteLength) & DER (variable-length).
        // Since DER can also be 2*nByteLength bytes, we check for it first.
        try {
          if (format !== 'compact') { _sig = Signature.fromDER(sg) }
        } catch (derError) {
          if (!(derError instanceof DER.Err)) { throw derError }
        }
        if (!_sig && format !== 'der') { _sig = Signature.fromCompact(sg) }
      }
      P = Point.fromHex(publicKey)
    } catch (error) {
      return false
    }
    if (!_sig) { return false }
    if (lowS && _sig.hasHighS()) { return false }
    if (prehash) { msgHash = CURVE.hash(msgHash) }
    const { r, s } = _sig
    const h = bits2int_modN(msgHash) // Cannot use fields methods, since it is group element
    const is = invN(s) // s^-1
    const u1 = modN(h * is) // u1 = hs^-1 mod n
    const u2 = modN(r * is) // u2 = rs^-1 mod n
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine() // R = u1⋅G + u2⋅P
    if (!R) { return false }
    const v = modN(R.x)
    return v === r
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  }
}

/**
 * Utilities for short weierstrass curves, combined with noble-hashes.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
/** connects noble-curves to noble-hashes */
function getHash (hash) {
  return {
    hash,
    hmac: (key, ...msgs) => hmac(hash, key, concatBytes$1(...msgs)),
    randomBytes
  }
}
function createCurve (curveDef, defHash) {
  const create = (hash) => weierstrass({ ...curveDef, ...getHash(hash) })
  return { ...create(defHash), create }
}

/**
 * NIST secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
 *
 * Seems to be rigid (not backdoored)
 * [as per discussion](https://bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975).
 *
 * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
 * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
 * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
 * [See explanation](https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066).
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const secp256k1P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f')
const secp256k1N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
const _1n = BigInt(1)
const _2n = BigInt(2)
const divNearest = (a, b) => (a + b / _2n) / b
/**
 * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
 * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
 */
function sqrtMod (y) {
  const P = secp256k1P
  // prettier-ignore
  const _3n = BigInt(3); const _6n = BigInt(6); const _11n = BigInt(11); const _22n = BigInt(22)
  // prettier-ignore
  const _23n = BigInt(23); const _44n = BigInt(44); const _88n = BigInt(88)
  const b2 = (y * y * y) % P // x^3, 11
  const b3 = (b2 * b2 * y) % P // x^7
  const b6 = (pow2(b3, _3n, P) * b3) % P
  const b9 = (pow2(b6, _3n, P) * b3) % P
  const b11 = (pow2(b9, _2n, P) * b2) % P
  const b22 = (pow2(b11, _11n, P) * b11) % P
  const b44 = (pow2(b22, _22n, P) * b22) % P
  const b88 = (pow2(b44, _44n, P) * b44) % P
  const b176 = (pow2(b88, _88n, P) * b88) % P
  const b220 = (pow2(b176, _44n, P) * b44) % P
  const b223 = (pow2(b220, _3n, P) * b3) % P
  const t1 = (pow2(b223, _23n, P) * b22) % P
  const t2 = (pow2(t1, _6n, P) * b2) % P
  const root = pow2(t2, _2n, P)
  if (!Fpk1.eql(Fpk1.sqr(root), y)) { throw new Error('Cannot find square root') }
  return root
}
const Fpk1 = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod })
/**
 * secp256k1 short weierstrass curve and ECDSA signatures over it.
 *
 * @example
 * import { secp256k1 } from '@noble/curves/secp256k1';
 *
 * const priv = secp256k1.utils.randomPrivateKey();
 * const pub = secp256k1.getPublicKey(priv);
 * const msg = new Uint8Array(32).fill(1); // message hash (not message) in ecdsa
 * const sig = secp256k1.sign(msg, priv); // `{prehash: true}` option is available
 * const isValid = secp256k1.verify(sig, msg, pub) === true;
 */
const secp256k1 = createCurve({
  a: BigInt(0), // equation params: a, b
  b: BigInt(7),
  Fp: Fpk1, // Field's prime: 2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n
  n: secp256k1N, // Curve order, total count of valid points in the field
  // Base point (x, y) aka generator point
  Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
  Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
  h: BigInt(1), // Cofactor
  lowS: true, // Allow only low-S signatures by default in sign() and verify()
  endo: {
    // Endomorphism, see above
    beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
    splitScalar: (k) => {
      const n = secp256k1N
      const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15')
      const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3')
      const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8')
      const b2 = a1
      const POW_2_128 = BigInt('0x100000000000000000000000000000000') // (2n**128n).toString(16)
      const c1 = divNearest(b2 * k, n)
      const c2 = divNearest(-b1 * k, n)
      let k1 = mod(k - c1 * a1 - c2 * a2, n)
      let k2 = mod(-c1 * b1 - c2 * b2, n)
      const k1neg = k1 > POW_2_128
      const k2neg = k2 > POW_2_128
      if (k1neg) { k1 = n - k1 }
      if (k2neg) { k2 = n - k2 }
      if (k1 > POW_2_128 || k2 > POW_2_128) {
        throw new Error('splitScalar: Endomorphism failed, k=' + k)
      }
      return { k1neg, k1, k2neg, k2 }
    }
  }
}, sha256)
// Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
const _0n = BigInt(0)
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
const TAGGED_HASH_PREFIXES = {}
function taggedHash (tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag]
  if (tagP === undefined) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)))
    tagP = concatBytes(tagH, tagH)
    TAGGED_HASH_PREFIXES[tag] = tagP
  }
  return sha256(concatBytes(tagP, ...messages))
}
// ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03
const pointToBytes = (point) => point.toRawBytes(true).slice(1)
const numTo32b = (n) => numberToBytesBE(n, 32)
const modP = (x) => mod(x, secp256k1P)
const modN = (x) => mod(x, secp256k1N)
const Point = secp256k1.ProjectivePoint
const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b)
// Calculate point, scalar and bytes
function schnorrGetExtPubKey (priv) {
  const d_ = secp256k1.utils.normPrivateKeyToScalar(priv) // same method executed in fromPrivateKey
  const p = Point.fromPrivateKey(d_) // P = d'⋅G; 0 < d' < n check is done inside
  const scalar = p.hasEvenY() ? d_ : modN(-d_)
  return { scalar, bytes: pointToBytes(p) }
}
/**
 * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
 * @returns valid point checked for being on-curve
 */
function lift_x (x) {
  aInRange('x', x, _1n, secp256k1P) // Fail if x ≥ p.
  const xx = modP(x * x)
  const c = modP(xx * x + BigInt(7)) // Let c = x³ + 7 mod p.
  let y = sqrtMod(c) // Let y = c^(p+1)/4 mod p.
  if (y % _2n !== _0n) { y = modP(-y) } // Return the unique point P such that x(P) = x and
  const p = new Point(x, y, _1n) // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.
  p.assertValidity()
  return p
}
const num = bytesToNumberBE
/**
 * Create tagged hash, convert it to bigint, reduce modulo-n.
 */
function challenge (...args) {
  return modN(num(taggedHash('BIP0340/challenge', ...args)))
}
/**
 * Schnorr public key is just `x` coordinate of Point as per BIP340.
 */
function schnorrGetPublicKey (privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
}
/**
 * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
 * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
 */
function schnorrSign (message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes('message', message)
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey) // checks for isWithinCurveOrder
  const a = ensureBytes('auxRand', auxRand, 32) // Auxiliary random data a: a 32-byte array
  const t = numTo32b(d ^ num(taggedHash('BIP0340/aux', a))) // Let t be the byte-wise xor of bytes(d) and hash/aux(a)
  const rand = taggedHash('BIP0340/nonce', t, px, m) // Let rand = hash/nonce(t || bytes(P) || m)
  const k_ = modN(num(rand)) // Let k' = int(rand) mod n
  if (k_ === _0n) { throw new Error('sign failed: k is zero') } // Fail if k' = 0.
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_) // Let R = k'⋅G.
  const e = challenge(rx, px, m) // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.
  const sig = new Uint8Array(64) // Let sig = bytes(R) || bytes((k + ed) mod n).
  sig.set(rx, 0)
  sig.set(numTo32b(modN(k + e * d)), 32)
  // If Verify(bytes(P), m, sig) (see below) returns failure, abort
  if (!schnorrVerify(sig, m, px)) { throw new Error('sign: Invalid signature produced') }
  return sig
}
/**
 * Verifies Schnorr signature.
 * Will swallow errors & return false except for initial type validation of arguments.
 */
function schnorrVerify (signature, message, publicKey) {
  const sig = ensureBytes('signature', signature, 64)
  const m = ensureBytes('message', message)
  const pub = ensureBytes('publicKey', publicKey, 32)
  try {
    const P = lift_x(num(pub)) // P = lift_x(int(pk)); fail if that fails
    const r = num(sig.subarray(0, 32)) // Let r = int(sig[0:32]); fail if r ≥ p.
    if (!inRange(r, _1n, secp256k1P)) { return false }
    const s = num(sig.subarray(32, 64)) // Let s = int(sig[32:64]); fail if s ≥ n.
    if (!inRange(s, _1n, secp256k1N)) { return false }
    const e = challenge(numTo32b(r), pointToBytes(P), m) // int(challenge(bytes(r)||bytes(P)||m))%n
    const R = GmulAdd(P, s, modN(-e)) // R = s⋅G - e⋅P
    if (!R || !R.hasEvenY() || R.toAffine().x !== r) { return false } // -eP == (n-e)P
    return true // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
  } catch (error) {
    return false
  }
}
/**
 * Schnorr signatures over secp256k1.
 * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
 * @example
 * import { schnorr } from '@noble/curves/secp256k1';
 * const priv = schnorr.utils.randomPrivateKey();
 * const pub = schnorr.getPublicKey(priv);
 * const msg = new TextEncoder().encode('hello');
 * const sig = schnorr.sign(msg, priv);
 * const isValid = schnorr.verify(sig, msg, pub);
 */
const schnorr = /* @__PURE__ */ (() => ({
  getPublicKey: schnorrGetPublicKey,
  sign: schnorrSign,
  verify: schnorrVerify,
  utils: {
    randomPrivateKey: secp256k1.utils.randomPrivateKey,
    lift_x,
    pointToBytes,
    numberToBytesBE,
    bytesToNumberBE,
    taggedHash,
    mod
  }
}))()

const dist = {}

const LRUCache$1 = {}

const LRUCacheNode$1 = {}

Object.defineProperty(LRUCacheNode$1, '__esModule', { value: true })
LRUCacheNode$1.LRUCacheNode = void 0
class LRUCacheNode {
  constructor (key, value, options) {
    const { entryExpirationTimeInMS = null, next = null, prev = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, clone, cloneFn } = options !== null && options !== void 0 ? options : {}
    if (typeof entryExpirationTimeInMS === 'number' &&
            (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
      throw new Error('entryExpirationTimeInMS must either be null (no expiry) or greater than 0')
    }
    this.clone = clone !== null && clone !== void 0 ? clone : false
    this.cloneFn = cloneFn !== null && cloneFn !== void 0 ? cloneFn : this.defaultClone
    this.key = key
    this.internalValue = this.clone ? this.cloneFn(value) : value
    this.created = Date.now()
    this.entryExpirationTimeInMS = entryExpirationTimeInMS
    this.next = next
    this.prev = prev
    this.onEntryEvicted = onEntryEvicted
    this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed
  }

  get value () {
    return this.clone ? this.cloneFn(this.internalValue) : this.internalValue
  }

  get isExpired () {
    return typeof this.entryExpirationTimeInMS === 'number' && Date.now() - this.created > this.entryExpirationTimeInMS
  }

  invokeOnEvicted () {
    if (this.onEntryEvicted) {
      const { key, value, isExpired } = this
      this.onEntryEvicted({ key, value, isExpired })
    }
  }

  invokeOnEntryMarkedAsMostRecentlyUsed () {
    if (this.onEntryMarkedAsMostRecentlyUsed) {
      const { key, value } = this
      this.onEntryMarkedAsMostRecentlyUsed({ key, value })
    }
  }

  defaultClone (value) {
    if (typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
      return value
    }
    return JSON.parse(JSON.stringify(value))
  }
}
LRUCacheNode$1.LRUCacheNode = LRUCacheNode

Object.defineProperty(LRUCache$1, '__esModule', { value: true })
LRUCache$1.LRUCache = void 0
const LRUCacheNode_1 = LRUCacheNode$1
/**
 * A key value cache that implements the LRU policy.
 *
 * @typeparam TKey The type of the keys in the cache. Defaults to `string`.
 * @typeparam TValue The type of the values in the cache. Defaults to `any`.
 *
 * @see {@link https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)}
 */
class LRUCache {
  /**
     * Creates a new instance of the LRUCache.
     *
     * @param options Additional configuration options for the LRUCache.
     *
     * @example
     * ```typescript
     * // No options.
     * const cache = new LRUCache();
     *
     * // With options.
     * const cache = new LRUCache({
     *  entryExpirationTimeInMS: 10000
     * });
     * ```
     */
  constructor (options) {
    this.lookupTable = new Map()
    this.head = null
    this.tail = null
    const { maxSize = 25, entryExpirationTimeInMS = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, cloneFn, clone } = options !== null && options !== void 0 ? options : {}
    if (Number.isNaN(maxSize) || maxSize <= 0) {
      throw new Error('maxSize must be greater than 0.')
    }
    if (typeof entryExpirationTimeInMS === 'number' &&
            (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
      throw new Error('entryExpirationTimeInMS must either be null (no expiry) or greater than 0')
    }
    this.maxSizeInternal = maxSize
    this.entryExpirationTimeInMS = entryExpirationTimeInMS
    this.onEntryEvicted = onEntryEvicted
    this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed
    this.clone = clone
    this.cloneFn = cloneFn
  }

  /**
     * Returns the number of entries in the LRUCache object.
     * If the cache has entryExpirationTimeInMS set, expired entries will be removed before the size is returned.
     *
     * @returns The number of entries in the cache.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * cache.set('testKey', 'testValue');
     *
     * const size = cache.size;
     *
     * // Will log 1
     * console.log(size);
     * ```
     */
  get size () {
    this.cleanCache()
    return this.lookupTable.size
  }

  /**
     * Returns the number of entries that can still be added to the LRUCache without evicting existing entries.
     *
     * @returns The number of entries that can still be added without evicting existing entries.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache({ maxSize: 10 });
     *
     * cache.set('testKey', 'testValue');
     *
     * const remainingSize = cache.remainingSize;
     *
     * // Will log 9 due to 9 spots remaining before reaching maxSize of 10.
     * console.log(remainingSize);
     * ```
     */
  get remainingSize () {
    return this.maxSizeInternal - this.size
  }

  /**
     * Returns the most recently used (newest) entry in the cache.
     * This will not mark the entry as recently used.
     * If the newest node is expired, it will be removed.
     *
     * @returns The most recently used (newest) entry in the cache.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache({ maxSize: 10 });
     *
     * cache.set('testKey', 'testValue');
     *
     * const newest = cache.newest;
     *
     * // Will log testValue
     * console.log(newest.value);
     *
     * // Will log testKey
     * console.log(newest.key);
     * ```
     */
  get newest () {
    if (!this.head) {
      return null
    }
    if (this.head.isExpired) {
      this.removeNodeFromListAndLookupTable(this.head)
      return this.newest
    }
    return this.mapNodeToEntry(this.head)
  }

  /**
     * Returns the least recently used (oldest) entry in the cache.
     * This will not mark the entry as recently used.
     * If the oldest node is expired, it will be removed.
     *
     * @returns The least recently used (oldest) entry in the cache.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache({ maxSize: 10 });
     *
     * cache.set('testKey', 'testValue');
     *
     * const oldest = cache.oldest;
     *
     * // Will log testValue
     * console.log(oldest.value);
     *
     * // Will log testKey
     * console.log(oldest.key);
     * ```
     */
  get oldest () {
    if (!this.tail) {
      return null
    }
    if (this.tail.isExpired) {
      this.removeNodeFromListAndLookupTable(this.tail)
      return this.oldest
    }
    return this.mapNodeToEntry(this.tail)
  }

  /**
     * Gets or sets the maxSize of the cache.
     * This will evict the least recently used entries if needed to reach new maxSize.
     *
     * @param value The new value for maxSize. Must be greater than 0.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache({ maxSize: 10 });
     *
     * cache.set('testKey', 'testValue');
     *
     * // Will be 10
     * const maxSize = cache.maxSize;
     *
     * // Set new maxSize to 5. If there are more than 5 items in the cache, the least recently used entries will be removed until cache size is 5.
     * cache.maxSize = 5;
     * ```
     */
  get maxSize () {
    return this.maxSizeInternal
  }

  set maxSize (value) {
    if (Number.isNaN(value) || value <= 0) {
      throw new Error('maxSize must be greater than 0.')
    }
    this.maxSizeInternal = value
    this.enforceSizeLimit()
  }

  /**
     * Sets the value for the key in the LRUCache object. Returns the LRUCache object.
     * This marks the newly added entry as the most recently used entry.
     * If adding the new entry makes the cache size go above maxSize,
     * this will evict the least recently used entries until size is equal to maxSize.
     *
     * @param key The key of the entry.
     * @param value The value to set for the key.
     * @param entryOptions Additional configuration options for the cache entry.
     *
     * @returns The LRUCache instance.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Set the key key2 to value value2. Pass in optional options.
     * cache.set('key2', 'value2', { entryExpirationTimeInMS: 10 });
     * ```
     */
  set (key, value, entryOptions) {
    const currentNodeForKey = this.lookupTable.get(key)
    if (currentNodeForKey) {
      this.removeNodeFromListAndLookupTable(currentNodeForKey)
    }
    const node = new LRUCacheNode_1.LRUCacheNode(key, value, {
      entryExpirationTimeInMS: this.entryExpirationTimeInMS,
      onEntryEvicted: this.onEntryEvicted,
      onEntryMarkedAsMostRecentlyUsed: this.onEntryMarkedAsMostRecentlyUsed,
      clone: this.clone,
      cloneFn: this.cloneFn,
      ...entryOptions
    })
    this.setNodeAsHead(node)
    this.lookupTable.set(key, node)
    this.enforceSizeLimit()
    return this
  }

  /**
     * Returns the value associated to the key, or null if there is none or if the entry is expired.
     * If an entry is returned, this marks the returned entry as the most recently used entry.
     *
     * @param key The key of the entry to get.
     *
     * @returns The cached value or null.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Will be 'testValue'. Entry will now be most recently used.
     * const item1 = cache.get('testKey');
     *
     * // Will be null
     * const item2 = cache.get('keyNotInCache');
     * ```
     */
  get (key) {
    const node = this.lookupTable.get(key)
    if (!node) {
      return null
    }
    if (node.isExpired) {
      this.removeNodeFromListAndLookupTable(node)
      return null
    }
    this.setNodeAsHead(node)
    return node.value
  }

  /**
     * Returns the value associated to the key, or null if there is none or if the entry is expired.
     * If an entry is returned, this will not mark the entry as most recently accessed.
     * Useful if a value is needed but the order of the cache should not be changed.
     *
     * @param key The key of the entry to get.
     *
     * @returns The cached value or null.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Will be 'testValue'
     * const item1 = cache.peek('testKey');
     *
     * // Will be null
     * const item2 = cache.peek('keyNotInCache');
     * ```
     */
  peek (key) {
    const node = this.lookupTable.get(key)
    if (!node) {
      return null
    }
    if (node.isExpired) {
      this.removeNodeFromListAndLookupTable(node)
      return null
    }
    return node.value
  }

  /**
     * Deletes the entry for the passed in key.
     *
     * @param key The key of the entry to delete
     *
     * @returns True if an element in the LRUCache object existed and has been removed,
     * or false if the element does not exist.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Will be true
     * const wasDeleted = cache.delete('testKey');
     *
     * // Will be false
     * const wasDeleted2 = cache.delete('keyNotInCache');
     * ```
     */
  delete (key) {
    const node = this.lookupTable.get(key)
    if (!node) {
      return false
    }
    return this.removeNodeFromListAndLookupTable(node)
  }

  /**
     * Returns a boolean asserting whether a value has been associated to the key in the LRUCache object or not.
     * This does not mark the entry as recently used.
     * If the cache has a key but the entry is expired, it will be removed and false will be returned.
     *
     * @param key The key of the entry to check if exists
     *
     * @returns true if the cache contains the supplied key. False if not.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Will be true
     * const wasDeleted = cache.has('testKey');
     *
     * // Will be false
     * const wasDeleted2 = cache.has('keyNotInCache');
     * ```
     */
  has (key) {
    const node = this.lookupTable.get(key)
    if (!node) {
      return false
    }
    if (node.isExpired) {
      this.removeNodeFromListAndLookupTable(node)
      return false
    }
    return true
  }

  /**
     * Removes all entries in the cache.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // Clear cache.
     * cache.clear();
     * ```
     */
  clear () {
    this.head = null
    this.tail = null
    this.lookupTable.clear()
  }

  /**
     * Searches the cache for an entry matching the passed in condition.
     * Expired entries will be skipped (and removed).
     * If multiply entries in the cache match the condition, the most recently used entry will be returned.
     * If an entry is returned, this marks the returned entry as the most recently used entry.
     *
     * @param condition The condition to apply to each entry in the
     *
     * @returns The first cache entry to match the condition. Null if none match.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * // item will be { key: 'testKey', value: 'testValue }
     * const item = cache.find(entry => {
     *   const { key, value } = entry;
     *
     *   if (key === 'testKey' || value === 'something') {
     *     return true;
     *   }
     *
     *   return false;
     * });
     *
     * // item2 will be null
     * const item2 = cache.find(entry => entry.key === 'notInCache');
     * ```
     */
  find (condition) {
    let node = this.head
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      const entry = this.mapNodeToEntry(node)
      if (condition(entry)) {
        this.setNodeAsHead(node)
        return entry
      }
      node = node.next
    }
    return null
  }

  /**
     * Iterates over and applies the callback function to each entry in the cache.
     * Iterates in order from most recently accessed entry to least recently.
     * Expired entries will be skipped (and removed).
     * No entry will be marked as recently used.
     *
     * @param callback the callback function to apply to the entry
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * cache.forEach((key, value, index) => {
     *   // do something with key, value, and/or index
     * });
     * ```
     */
  forEach (callback) {
    let node = this.head
    let index = 0
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      callback(node.value, node.key, index)
      node = node.next
      index++
    }
  }

  /**
     * Creates a Generator which can be used with for ... of ... to iterate over the cache values.
     * Iterates in order from most recently accessed entry to least recently.
     * Expired entries will be skipped (and removed).
     * No entry will be marked as accessed.
     *
     * @returns A Generator for the cache values.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * for (const value of cache.values()) {
     *   // do something with the value
     * }
     * ```
     */
  * values () {
    let node = this.head
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      yield node.value
      node = node.next
    }
  }

  /**
     * Creates a Generator which can be used with for ... of ... to iterate over the cache keys.
     * Iterates in order from most recently accessed entry to least recently.
     * Expired entries will be skipped (and removed).
     * No entry will be marked as accessed.
     *
     * @returns A Generator for the cache keys.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * for (const key of cache.keys()) {
     *   // do something with the key
     * }
     * ```
     */
  * keys () {
    let node = this.head
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      yield node.key
      node = node.next
    }
  }

  /**
     * Creates a Generator which can be used with for ... of ... to iterate over the cache entries.
     * Iterates in order from most recently accessed entry to least recently.
     * Expired entries will be skipped (and removed).
     * No entry will be marked as accessed.
     *
     * @returns A Generator for the cache entries.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * for (const entry of cache.entries()) {
     *   const { key, value } = entry;
     *   // do something with the entry
     * }
     * ```
     */
  * entries () {
    let node = this.head
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      yield this.mapNodeToEntry(node)
      node = node.next
    }
  }

  /**
     * Creates a Generator which can be used with for ... of ... to iterate over the cache entries.
     * Iterates in order from most recently accessed entry to least recently.
     * Expired entries will be skipped (and removed).
     * No entry will be marked as accessed.
     *
     * @returns A Generator for the cache entries.
     *
     * @example
     * ```typescript
     * const cache = new LRUCache();
     *
     * // Set the key testKey to value testValue
     * cache.set('testKey', 'testValue');
     *
     * for (const entry of cache) {
     *   const { key, value } = entry;
     *   // do something with the entry
     * }
     * ```
     */
  * [Symbol.iterator] () {
    let node = this.head
    while (node) {
      if (node.isExpired) {
        const next = node.next
        this.removeNodeFromListAndLookupTable(node)
        node = next
        continue
      }
      yield this.mapNodeToEntry(node)
      node = node.next
    }
  }

  enforceSizeLimit () {
    let node = this.tail
    while (node !== null && this.size > this.maxSizeInternal) {
      const prev = node.prev
      this.removeNodeFromListAndLookupTable(node)
      node = prev
    }
  }

  mapNodeToEntry ({ key, value }) {
    return {
      key,
      value
    }
  }

  setNodeAsHead (node) {
    this.removeNodeFromList(node)
    if (!this.head) {
      this.head = node
      this.tail = node
    } else {
      node.next = this.head
      this.head.prev = node
      this.head = node
    }
    node.invokeOnEntryMarkedAsMostRecentlyUsed()
  }

  removeNodeFromList (node) {
    if (node.prev !== null) {
      node.prev.next = node.next
    }
    if (node.next !== null) {
      node.next.prev = node.prev
    }
    if (this.head === node) {
      this.head = node.next
    }
    if (this.tail === node) {
      this.tail = node.prev
    }
    node.next = null
    node.prev = null
  }

  removeNodeFromListAndLookupTable (node) {
    node.invokeOnEvicted()
    this.removeNodeFromList(node)
    return this.lookupTable.delete(node.key)
  }

  cleanCache () {
    // Don't spend time cleaning if entries don't expire.
    if (!this.entryExpirationTimeInMS) {
      return
    }
    const expiredNodes = []
    for (const node of this.lookupTable.values()) {
      if (node.isExpired) {
        expiredNodes.push(node)
      }
    }
    expiredNodes.forEach(node => this.removeNodeFromListAndLookupTable(node))
  }
}
LRUCache$1.LRUCache = LRUCache;

(function (exports) {
  const __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create
    ? function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    let desc = Object.getOwnPropertyDescriptor(m, k)
	    if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function () { return m[k] } }
	    }
	    Object.defineProperty(o, k2, desc)
    }
    : function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k
	    o[k2] = m[k]
    })
  const __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function (m, exports) {
	    for (const p in m) if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p)
  }
  Object.defineProperty(exports, '__esModule', { value: true })
  __exportStar(LRUCache$1, exports)
}(dist))

const require$$0 = /* @__PURE__ */getAugmentedNamespace(esm)

const { bech32, hex, utf8 } = require$$0;

({
  m: BigInt(1e3),
  u: BigInt(1e6),
  n: BigInt(1e9),
  p: BigInt(1e12)
})

BigInt('2100000000000000000')

BigInt(1e11)

const TAGCODES = {
  payment_hash: 1,
  payment_secret: 16,
  description: 13,
  payee: 19,
  description_hash: 23, // commit to longer descriptions (used by lnurl-pay)
  expiry: 6, // default: 3600 (1 hour)
  min_final_cltv_expiry: 24, // default: 9
  fallback_address: 9,
  route_hint: 3, // for extra routing info (private etc.)
  feature_bits: 5,
  metadata: 27
}
for (let i = 0, keys = Object.keys(TAGCODES); i < keys.length; i++) {
  keys[i]
  TAGCODES[keys[i]].toString()
}

// src/relay/pool/index.ts

// src/outbox/write.ts
function getRelaysForSync (ndk, author, type = 'write') {
  if (!ndk.outboxTracker) return void 0
  const item = ndk.outboxTracker.data.get(author)
  if (!item) return void 0
  if (type === 'write') {
    return item.writeRelays
  } else {
    return item.readRelays
  }
}
async function getWriteRelaysFor (ndk, author, type = 'write') {
  if (!ndk.outboxTracker) return void 0
  if (!ndk.outboxTracker.data.has(author)) {
    await ndk.outboxTracker.trackUsers([author])
  }
  return getRelaysForSync(ndk, author, type)
}

// src/outbox/relay-ranking.ts
function getTopRelaysForAuthors (ndk, authors) {
  const relaysWithCount = /* @__PURE__ */ new Map()
  authors.forEach((author) => {
    const writeRelays = getRelaysForSync(ndk, author)
    if (writeRelays) {
      writeRelays.forEach((relay) => {
        const count = relaysWithCount.get(relay) || 0
        relaysWithCount.set(relay, count + 1)
      })
    }
  })
  const sortedRelays = Array.from(relaysWithCount.entries()).sort((a, b) => b[1] - a[1])
  return sortedRelays.map((entry) => entry[0])
}

// src/outbox/index.ts
function getAllRelaysForAllPubkeys (ndk, pubkeys, type = 'read') {
  const pubkeysToRelays = /* @__PURE__ */ new Map()
  const authorsMissingRelays = /* @__PURE__ */ new Set()
  pubkeys.forEach((pubkey) => {
    const relays = getRelaysForSync(ndk, pubkey, type)
    if (relays && relays.size > 0) {
      relays.forEach((relay) => {
        const pubkeysInRelay = pubkeysToRelays.get(relay) || /* @__PURE__ */ new Set()
        pubkeysInRelay.add(pubkey)
      })
      pubkeysToRelays.set(pubkey, relays)
    } else {
      authorsMissingRelays.add(pubkey)
    }
  })
  return { pubkeysToRelays, authorsMissingRelays }
}
function chooseRelayCombinationForPubkeys (ndk, pubkeys, type, { count, preferredRelays } = {}) {
  count ??= 2
  preferredRelays ??= /* @__PURE__ */ new Set()
  const pool = ndk.pool
  const connectedRelays = pool.connectedRelays()
  connectedRelays.forEach((relay) => {
    preferredRelays.add(relay.url)
  })
  const relayToAuthorsMap = /* @__PURE__ */ new Map()
  const { pubkeysToRelays, authorsMissingRelays } = getAllRelaysForAllPubkeys(ndk, pubkeys, type)
  const sortedRelays = getTopRelaysForAuthors(ndk, pubkeys)
  const addAuthorToRelay = (author, relay) => {
    const authorsInRelay = relayToAuthorsMap.get(relay) || []
    authorsInRelay.push(author)
    relayToAuthorsMap.set(relay, authorsInRelay)
  }
  for (const [author, authorRelays] of pubkeysToRelays.entries()) {
    let missingRelayCount = count
    for (const relay of connectedRelays) {
      if (authorRelays.has(relay.url)) {
        addAuthorToRelay(author, relay.url)
        missingRelayCount--
      }
    }
    for (const authorRelay of authorRelays) {
      if (relayToAuthorsMap.has(authorRelay)) {
        addAuthorToRelay(author, authorRelay)
        missingRelayCount--
      }
    }
    if (missingRelayCount <= 0) continue
    for (const relay of sortedRelays) {
      if (missingRelayCount <= 0) break
      if (authorRelays.has(relay)) {
        addAuthorToRelay(author, relay)
        missingRelayCount--
      }
    }
  }
  for (const author of authorsMissingRelays) {
    pool.permanentAndConnectedRelays().forEach((relay) => {
      const authorsInRelay = relayToAuthorsMap.get(relay.url) || []
      authorsInRelay.push(author)
      relayToAuthorsMap.set(relay.url, authorsInRelay)
    })
  }
  return relayToAuthorsMap
}
function normalizeRelayUrl (url) {
  let r = normalizeUrl(url, {
    stripAuthentication: false,
    stripWWW: false,
    stripHash: true
  })
  if (!r.endsWith('/')) {
    r += '/'
  }
  return r
}
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain'
const DATA_URL_DEFAULT_CHARSET = 'us-ascii'
const testParameter = (name, filters) => filters.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name)
const supportedProtocols = /* @__PURE__ */ new Set(['https:', 'http:', 'file:'])
const hasCustomProtocol = (urlString) => {
  try {
    const { protocol } = new URL(urlString)
    return protocol.endsWith(':') && !protocol.includes('.') && !supportedProtocols.has(protocol)
  } catch {
    return false
  }
}
const normalizeDataURL = (urlString, { stripHash }) => {
  const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString)
  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`)
  }
  const type = match.groups?.type ?? ''
  const data = match.groups?.data ?? ''
  let hash = match.groups?.hash ?? ''
  const mediaType = type.split(';')
  hash = stripHash ? '' : hash
  let isBase64 = false
  if (mediaType[mediaType.length - 1] === 'base64') {
    mediaType.pop()
    isBase64 = true
  }
  const mimeType = mediaType.shift()?.toLowerCase() ?? ''
  const attributes = mediaType.map((attribute) => {
    let [key, value = ''] = attribute.split('=').map((string) => string.trim())
    if (key === 'charset') {
      value = value.toLowerCase()
      if (value === DATA_URL_DEFAULT_CHARSET) {
        return ''
      }
    }
    return `${key}${value ? `=${value}` : ''}`
  }).filter(Boolean)
  const normalizedMediaType = [...attributes]
  if (isBase64) {
    normalizedMediaType.push('base64')
  }
  if (normalizedMediaType.length > 0 || mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE) {
    normalizedMediaType.unshift(mimeType)
  }
  return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ''}`
}
function normalizeUrl (urlString, options = {}) {
  options = {
    defaultProtocol: 'http',
    normalizeProtocol: true,
    forceHttp: false,
    forceHttps: false,
    stripAuthentication: true,
    stripHash: false,
    stripTextFragment: true,
    stripWWW: true,
    removeQueryParameters: [/^utm_\w+/i],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeDirectoryIndex: false,
    removeExplicitPort: false,
    sortQueryParameters: true,
    ...options
  }
  if (typeof options.defaultProtocol === 'string' && !options.defaultProtocol.endsWith(':')) {
    options.defaultProtocol = `${options.defaultProtocol}:`
  }
  urlString = urlString.trim()
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options)
  }
  if (hasCustomProtocol(urlString)) {
    return urlString
  }
  const hasRelativeProtocol = urlString.startsWith('//')
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString)
  if (!isRelativeUrl) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol)
  }
  const urlObject = new URL(urlString)
  urlObject.hostname = urlObject.hostname.toLowerCase()
  if (options.forceHttp && options.forceHttps) {
    throw new Error('The `forceHttp` and `forceHttps` options cannot be used together')
  }
  if (options.forceHttp && urlObject.protocol === 'https:') {
    urlObject.protocol = 'http:'
  }
  if (options.forceHttps && urlObject.protocol === 'http:') {
    urlObject.protocol = 'https:'
  }
  if (options.stripAuthentication) {
    urlObject.username = ''
    urlObject.password = ''
  }
  if (options.stripHash) {
    urlObject.hash = ''
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, '')
  }
  if (urlObject.pathname) {
    const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g
    let lastIndex = 0
    let result = ''
    for (; ;) {
      const match = protocolRegex.exec(urlObject.pathname)
      if (!match) {
        break
      }
      const protocol = match[0]
      const protocolAtIndex = match.index
      const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex)
      result += intermediate.replace(/\/{2,}/g, '/')
      result += protocol
      lastIndex = protocolAtIndex + protocol.length
    }
    const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length)
    result += remnant.replace(/\/{2,}/g, '/')
    urlObject.pathname = result
  }
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname)
    } catch {
    }
  }
  if (options.removeDirectoryIndex === true) {
    options.removeDirectoryIndex = [/^index\.[a-z]+$/]
  }
  if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    let pathComponents = urlObject.pathname.split('/')
    const lastComponent = pathComponents[pathComponents.length - 1]
    if (testParameter(lastComponent, options.removeDirectoryIndex)) {
      pathComponents = pathComponents.slice(0, -1)
      urlObject.pathname = pathComponents.slice(1).join('/') + '/'
    }
  }
  if (urlObject.hostname) {
    urlObject.hostname = urlObject.hostname.replace(/\.$/, '')
    if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
      urlObject.hostname = urlObject.hostname.replace(/^www\./, '')
    }
  }
  if (Array.isArray(options.removeQueryParameters)) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams.delete(key)
      }
    }
  }
  if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
    urlObject.search = ''
  }
  if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (!testParameter(key, options.keepQueryParameters)) {
        urlObject.searchParams.delete(key)
      }
    }
  }
  if (options.sortQueryParameters) {
    urlObject.searchParams.sort()
    try {
      urlObject.search = decodeURIComponent(urlObject.search)
    } catch {
    }
  }
  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(/\/$/, '')
  }
  if (options.removeExplicitPort && urlObject.port) {
    urlObject.port = ''
  }
  const oldUrlString = urlString
  urlString = urlObject.toString()
  if (!options.removeSingleSlash && urlObject.pathname === '/' && !oldUrlString.endsWith('/') && urlObject.hash === '') {
    urlString = urlString.replace(/\/$/, '')
  }
  if ((options.removeTrailingSlash || urlObject.pathname === '/') && urlObject.hash === '' && options.removeSingleSlash) {
    urlString = urlString.replace(/\/$/, '')
  }
  if (hasRelativeProtocol && !options.normalizeProtocol) {
    urlString = urlString.replace(/^http:\/\//, '//')
  }
  if (options.stripProtocol) {
    urlString = urlString.replace(/^(?:https?:)?\/\//, '')
  }
  return urlString
}

// src/relay/sets/index.ts
const NDKPublishError = class extends Error {
  errors
  publishedToRelays
  /**
   * Intended relay set where the publishing was intended to happen.
   */
  intendedRelaySet
  constructor (message, errors, publishedToRelays, intendedRelaySet) {
    super(message)
    this.errors = errors
    this.publishedToRelays = publishedToRelays
    this.intendedRelaySet = intendedRelaySet
  }

  get relayErrors () {
    const errors = []
    for (const [relay, err] of this.errors) {
      errors.push(`${relay.url}: ${err}`)
    }
    return errors.join('\n')
  }
}
const NDKRelaySet = class _NDKRelaySet {
  relays
  debug
  ndk
  pool
  constructor (relays, ndk, pool) {
    this.relays = relays
    this.ndk = ndk
    this.pool = pool ?? ndk.pool
    this.debug = ndk.debug.extend('relayset')
  }

  /**
   * Adds a relay to this set.
   */
  addRelay (relay) {
    this.relays.add(relay)
  }

  get relayUrls () {
    return Array.from(this.relays).map((r) => r.url)
  }

  /**
   * Creates a relay set from a list of relay URLs.
   *
   * If no connection to the relay is found in the pool it will temporarily
   * connect to it.
   *
   * @param relayUrls - list of relay URLs to include in this set
   * @param ndk
   * @param connect - whether to connect to the relay immediately if it was already in the pool but not connected
   * @returns NDKRelaySet
   */
  static fromRelayUrls (relayUrls, ndk, connect = true, pool) {
    pool = pool ?? ndk.pool
    if (!pool) throw new Error('No pool provided')
    const relays = /* @__PURE__ */ new Set()
    for (const url of relayUrls) {
      const relay = pool.relays.get(normalizeRelayUrl(url))
      if (relay) {
        if (relay.status < 5 /* CONNECTED */ && connect) {
          relay.connect()
        }
        relays.add(relay)
      } else {
        const temporaryRelay = new NDKRelay(
          normalizeRelayUrl(url),
          ndk?.relayAuthDefaultPolicy,
          ndk
        )
        pool.useTemporaryRelay(
          temporaryRelay,
          void 0,
          'requested from fromRelayUrls ' + relayUrls
        )
        relays.add(temporaryRelay)
      }
    }
    return new _NDKRelaySet(new Set(relays), ndk, pool)
  }

  /**
   * Publish an event to all relays in this set. Returns the number of relays that have received the event.
   * @param event
   * @param timeoutMs - timeout in milliseconds for each publish operation and connection operation
   * @returns A set where the event was successfully published to
   * @throws NDKPublishError if no relay was able to receive the event
   * @example
   * ```typescript
   * const event = new NDKEvent(ndk, {kinds: [NDKKind.Message], "#d": ["123"]});
   * try {
   *    const publishedToRelays = await relaySet.publish(event);
   *    console.log(`published to ${publishedToRelays.size} relays`)
   * } catch (error) {
   *   console.error("error publishing to relays", error);
   *
   *   if (error instanceof NDKPublishError) {
   *      for (const [relay, err] of error.errors) {
   *         console.error(`error publishing to relay ${relay.url}`, err);
   *       }
   *   }
   * }
   * ```
   */
  async publish (event, timeoutMs, requiredRelayCount = 1) {
    const publishedToRelays = /* @__PURE__ */ new Set()
    const errors = /* @__PURE__ */ new Map()
    const isEphemeral2 = event.isEphemeral()
    event.publishStatus = 'pending'
    const promises = Array.from(this.relays).map((relay) => {
      return new Promise((resolve) => {
        relay.publish(event, timeoutMs).then((e) => {
          publishedToRelays.add(relay)
          resolve()
        }).catch((err) => {
          if (!isEphemeral2) {
            errors.set(relay, err)
          }
          resolve()
        })
      })
    })
    await Promise.all(promises)
    if (publishedToRelays.size < requiredRelayCount) {
      if (!isEphemeral2) {
        const error = new NDKPublishError(
          'Not enough relays received the event',
          errors,
          publishedToRelays,
          this
        )
        event.publishStatus = 'error'
        event.publishError = error
        this.ndk.emit('event:publish-failed', event, error, this.relayUrls)
        throw error
      }
    } else {
      event.emit('published', { relaySet: this, publishedToRelays })
    }
    return publishedToRelays
  }

  get size () {
    return this.relays.size
  }
}
const d = createDebug5('ndk:outbox:calculate')
async function calculateRelaySetFromEvent (ndk, event) {
  const relays = /* @__PURE__ */ new Set()
  const authorWriteRelays = await getWriteRelaysFor(ndk, event.pubkey)
  if (authorWriteRelays) {
    authorWriteRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl)
      if (relay) relays.add(relay)
    })
  }
  let relayHints = event.tags.filter((tag) => ['a', 'e'].includes(tag[0])).map((tag) => tag[2]).filter((url) => url && url.startsWith('wss://')).filter((url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }).map((url) => normalizeRelayUrl(url))
  relayHints = Array.from(new Set(relayHints)).slice(0, 5)
  relayHints.forEach((relayUrl) => {
    const relay = ndk.pool?.getRelay(relayUrl, true, true)
    if (relay) {
      d('Adding relay hint %s', relayUrl)
      relays.add(relay)
    }
  })
  const pTags = event.getMatchingTags('p').map((tag) => tag[1])
  if (pTags.length < 5) {
    const pTaggedRelays = Array.from(
      chooseRelayCombinationForPubkeys(ndk, pTags, 'read', {
        preferredRelays: new Set(authorWriteRelays)
      }).keys()
    )
    pTaggedRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl, false, true)
      if (relay) {
        d('Adding p-tagged relay %s', relayUrl)
        relays.add(relay)
      }
    })
  } else {
    d('Too many p-tags to consider %d', pTags.length)
  }
  ndk.pool?.permanentAndConnectedRelays().forEach((relay) => relays.add(relay))
  return new NDKRelaySet(relays, ndk)
}
function mergeTags (tags1, tags2) {
  const tagMap = /* @__PURE__ */ new Map()
  const generateKey = (tag) => tag.join(',')
  const isContained = (smaller, larger) => {
    return smaller.every((value, index) => value === larger[index])
  }
  const processTag = (tag) => {
    for (const [key, existingTag] of tagMap) {
      if (isContained(existingTag, tag) || isContained(tag, existingTag)) {
        if (tag.length >= existingTag.length) {
          tagMap.set(key, tag)
        }
        return
      }
    }
    tagMap.set(generateKey(tag), tag)
  }
  tags1.concat(tags2).forEach(processTag)
  return Array.from(tagMap.values())
}
const hashtagRegex = /(?<=\s|^)(#[^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g
function generateHashtags (content) {
  const hashtags = content.match(hashtagRegex)
  const tagIds = /* @__PURE__ */ new Set()
  const tag = /* @__PURE__ */ new Set()
  if (hashtags) {
    for (const hashtag of hashtags) {
      if (tagIds.has(hashtag.slice(1))) continue
      tag.add(hashtag.slice(1))
      tagIds.add(hashtag.slice(1))
    }
  }
  return Array.from(tag)
}
async function generateContentTags (content, tags = []) {
  const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+/g
  const promises = []
  const addTagIfNew = (t) => {
    if (!tags.find((t2) => ['q', t[0]].includes(t2[0]) && t2[1] === t[1])) {
      tags.push(t)
    }
  }
  content = content.replace(tagRegex, (tag) => {
    try {
      const entity = tag.split(/(@|nostr:)/)[2]
      const { type, data } = nip19_exports.decode(entity)
      let t
      switch (type) {
        case 'npub':
          t = ['p', data]
          break
        case 'nprofile':
          t = ['p', data.pubkey]
          break
        case 'note':
          promises.push(
            new Promise(async (resolve) => {
              addTagIfNew([
                'q',
                data,
                await maybeGetEventRelayUrl(entity)
              ])
              resolve()
            })
          )
          break
        case 'nevent':
          promises.push(
            new Promise(async (resolve) => {
              const { id, author } = data
              let { relays } = data
              if (!relays || relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)]
              }
              addTagIfNew(['q', id, relays[0]])
              if (author) addTagIfNew(['p', author])
              resolve()
            })
          )
          break
        case 'naddr':
          promises.push(
            new Promise(async (resolve) => {
              const id = [data.kind, data.pubkey, data.identifier].join(':')
              let relays = data.relays ?? []
              if (relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)]
              }
              addTagIfNew(['q', id, relays[0]])
              addTagIfNew(['p', data.pubkey])
              resolve()
            })
          )
          break
        default:
          return tag
      }
      if (t) addTagIfNew(t)
      return `nostr:${entity}`
    } catch (error) {
      return tag
    }
  })
  await Promise.all(promises)
  const newTags = generateHashtags(content).map((hashtag) => ['t', hashtag])
  tags = mergeTags(tags, newTags)
  return { content, tags }
}
async function maybeGetEventRelayUrl (nip19Id) {
  return ''
}

// src/events/kind.ts
function isReplaceable () {
  if (this.kind === void 0) throw new Error('Kind not set')
  return [0, 3].includes(this.kind) || this.kind >= 1e4 && this.kind < 2e4 || this.kind >= 3e4 && this.kind < 4e4
}
function isEphemeral () {
  if (this.kind === void 0) throw new Error('Kind not set')
  return this.kind >= 2e4 && this.kind < 3e4
}
function isParamReplaceable () {
  if (this.kind === void 0) throw new Error('Kind not set')
  return this.kind >= 3e4 && this.kind < 4e4
}

// src/events/encryption.ts
async function encrypt (recipient, signer, scheme = 'nip44') {
  let encrypted
  if (!this.ndk) throw new Error('No NDK instance found!')
  if (!signer) {
    this.ndk.assertSigner()
    signer = this.ndk.signer
  }
  if (!recipient) {
    const pTags = this.getMatchingTags('p')
    if (pTags.length !== 1) {
      throw new Error(
        'No recipient could be determined and no explicit recipient was provided'
      )
    }
    recipient = this.ndk.getUser({ pubkey: pTags[0][1] })
  }
  if (scheme === 'nip44' && await isEncryptionEnabled(signer, 'nip44')) {
    encrypted = await signer?.encrypt(recipient, this.content, 'nip44')
  }
  if ((!encrypted || scheme === 'nip04') && await isEncryptionEnabled(signer, 'nip04')) {
    encrypted = await signer.encrypt(recipient, this.content, 'nip04')
  }
  if (!encrypted) throw new Error('Failed to encrypt event.')
  this.content = encrypted
}
async function decrypt (sender, signer, scheme) {
  let decrypted
  if (!this.ndk) throw new Error('No NDK instance found!')
  if (!signer) {
    this.ndk.assertSigner()
    signer = this.ndk.signer
  }
  if (!signer) throw new Error('no NDK signer')
  if (!sender) {
    sender = this.author
  }
  if (!scheme) scheme = this.content.search('\\?iv=') ? 'nip04' : 'nip44'
  if ((scheme === 'nip04' || this.kind === 4) && await isEncryptionEnabled(signer, 'nip04') && this.content.search('\\?iv=')) {
    decrypted = await signer.decrypt(sender, this.content, 'nip04')
  }
  if (!decrypted && scheme === 'nip44' && await isEncryptionEnabled(signer, 'nip44')) {
    decrypted = await signer.decrypt(sender, this.content, 'nip44')
  }
  if (!decrypted) throw new Error('Failed to decrypt event.')
  this.content = decrypted
}
async function isEncryptionEnabled (signer, scheme) {
  if (!signer.encryptionEnabled) return false
  if (!scheme) return true
  return Boolean(await signer.encryptionEnabled(scheme))
}
const DEFAULT_RELAY_COUNT = 2
function encode (maxRelayCount = DEFAULT_RELAY_COUNT) {
  let relays = []
  if (this.onRelays.length > 0) {
    relays = this.onRelays.map((relay) => relay.url)
  } else if (this.relay) {
    relays = [this.relay.url]
  }
  if (relays.length > maxRelayCount) {
    relays = relays.slice(0, maxRelayCount)
  }
  if (this.isParamReplaceable()) {
    return nip19_exports.naddrEncode({
      kind: this.kind,
      pubkey: this.pubkey,
      identifier: this.replaceableDTag(),
      relays
    })
  } else if (relays.length > 0) {
    return nip19_exports.neventEncode({
      id: this.tagId(),
      relays,
      author: this.pubkey
    })
  } else {
    return nip19_exports.noteEncode(this.tagId())
  }
}

// src/events/repost.ts
async function repost (publish = true, signer) {
  if (!signer && publish) {
    if (!this.ndk) throw new Error('No NDK instance found')
    this.ndk.assertSigner()
    signer = this.ndk.signer
  }
  const e = new NDKEvent(this.ndk, {
    kind: getKind(this)
  })
  if (!this.isProtected) { e.content = JSON.stringify(this.rawEvent()) }
  e.tag(this)
  if (this.kind !== 1 /* Text */) {
    e.tags.push(['k', `${this.kind}`])
  }
  if (signer) await e.sign(signer)
  if (publish) await e.publish()
  return e
}
function getKind (event) {
  if (event.kind === 1) {
    return 6 /* Repost */
  }
  return 16 /* GenericRepost */
}
function eventHasETagMarkers (event) {
  for (const tag of event.tags) {
    if (tag[0] === 'e' && (tag[3] ?? '').length > 0) return true
  }
  return false
}
function getRootTag (event, searchTag) {
  searchTag ??= event.tagType()
  const rootEventTag = event.tags.find(isTagRootTag)
  if (!rootEventTag) {
    if (eventHasETagMarkers(event)) return
    const matchingTags = event.getMatchingTags(searchTag)
    if (matchingTags.length < 3) return matchingTags[0]
  }
  return rootEventTag
}
const nip22RootTags = /* @__PURE__ */ new Set(['A', 'E', 'I'])
const nip22ReplyTags = /* @__PURE__ */ new Set(['a', 'e', 'i'])
function getReplyTag (event, searchTag) {
  if (event.kind === 1111 /* GenericReply */) {
    let replyTag2
    for (const tag of event.tags) {
      if (nip22RootTags.has(tag[0])) replyTag2 = tag
      else if (nip22ReplyTags.has(tag[0])) {
        replyTag2 = tag
        break
      }
    }
    return replyTag2
  }
  searchTag ??= event.tagType()
  let hasMarkers2 = false
  let replyTag
  for (const tag of event.tags) {
    if (tag[0] !== searchTag) continue
    if ((tag[3] ?? '').length > 0) hasMarkers2 = true
    if (hasMarkers2 && tag[3] === 'reply') return tag
    if (hasMarkers2 && tag[3] === 'root') replyTag = tag
    if (!hasMarkers2) replyTag = tag
  }
  return replyTag
}
function isTagRootTag (tag) {
  return tag[0] === 'E' || tag[3] === 'root'
}

// src/events/fetch-tagged-event.ts
async function fetchTaggedEvent (tag, marker) {
  if (!this.ndk) throw new Error('NDK instance not found')
  const t = this.getMatchingTags(tag, marker)
  if (t.length === 0) return void 0
  const [_, id, hint] = t[0]
  let relay
  const event = await this.ndk.fetchEvent(id, {}, relay)
  return event
}
async function fetchRootEvent (subOpts) {
  if (!this.ndk) throw new Error('NDK instance not found')
  const rootTag = getRootTag(this)
  if (!rootTag) return void 0
  return this.ndk.fetchEventFromTag(rootTag, this, subOpts)
}
async function fetchReplyEvent (subOpts) {
  if (!this.ndk) throw new Error('NDK instance not found')
  const replyTag = getReplyTag(this)
  if (!replyTag) return void 0
  return this.ndk.fetchEventFromTag(replyTag, this, subOpts)
}

// src/events/serializer.ts
function serialize (includeSig = false, includeId = false) {
  const payload = [0, this.pubkey, this.created_at, this.kind, this.tags, this.content]
  if (includeSig) payload.push(this.sig)
  if (includeId) payload.push(this.id)
  return JSON.stringify(payload)
}
function deserialize (serializedEvent) {
  const eventArray = JSON.parse(serializedEvent)
  const ret = {
    pubkey: eventArray[1],
    created_at: eventArray[2],
    kind: eventArray[3],
    tags: eventArray[4],
    content: eventArray[5]
  }
  if (eventArray.length >= 7) ret.sig = eventArray[6]
  if (eventArray.length >= 8) ret.id = eventArray[7]
  return ret
}

// src/events/signature.ts
let worker
const processingQueue = {}
async function verifySignatureAsync (event, persist) {
  const promise = new Promise((resolve) => {
    const serialized = event.serialize()
    let enqueue = false
    if (!processingQueue[event.id]) {
      processingQueue[event.id] = { event, resolves: [] }
      enqueue = true
    }
    processingQueue[event.id].resolves.push(resolve)
    if (!enqueue) return
    worker.postMessage({
      serialized,
      id: event.id,
      sig: event.sig,
      pubkey: event.pubkey
    })
  })
  return promise
}
const PUBKEY_REGEX = /^[a-f0-9]{64}$/
function validate () {
  if (typeof this.kind !== 'number') return false
  if (typeof this.content !== 'string') return false
  if (typeof this.created_at !== 'number') return false
  if (typeof this.pubkey !== 'string') return false
  if (!this.pubkey.match(PUBKEY_REGEX)) return false
  if (!Array.isArray(this.tags)) return false
  for (let i = 0; i < this.tags.length; i++) {
    const tag = this.tags[i]
    if (!Array.isArray(tag)) return false
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === 'object') return false
    }
  }
  return true
}
const verifiedSignatures = new dist.LRUCache({
  maxSize: 1e3,
  entryExpirationTimeInMS: 6e4
})
function verifySignature (persist) {
  if (typeof this.signatureVerified === 'boolean') return this.signatureVerified
  const prevVerification = verifiedSignatures.get(this.id)
  if (prevVerification !== null) {
    return this.signatureVerified = !!prevVerification
  }
  try {
    if (this.ndk?.asyncSigVerification) {
      verifySignatureAsync(this, persist).then((result) => {
        if (persist) {
          this.signatureVerified = result
          if (result) verifiedSignatures.set(this.id, this.sig)
        }
        if (!result) {
          this.ndk.emit('event:invalid-sig', this)
          verifiedSignatures.set(this.id, false)
        }
      })
    } else {
      const hash = sha256(new TextEncoder().encode(this.serialize()))
      const res = schnorr.verify(this.sig, hash, this.pubkey)
      if (res) verifiedSignatures.set(this.id, this.sig)
      else verifiedSignatures.set(this.id, false)
      return this.signatureVerified = res
    }
  } catch (err) {
    return this.signatureVerified = false
  }
}
function getEventHash () {
  return getEventHashFromSerializedEvent(this.serialize())
}
function getEventHashFromSerializedEvent (serializedEvent) {
  const eventHash = sha256(new TextEncoder().encode(serializedEvent))
  return bytesToHex$1(eventHash)
}

// src/events/index.ts
const skipClientTagOnKinds = /* @__PURE__ */ new Set([
  0 /* Metadata */,
  4 /* EncryptedDirectMessage */,
  1059 /* GiftWrap */,
  13 /* GiftWrapSeal */,
  3 /* Contacts */,
  9734 /* ZapRequest */,
  5 /* EventDeletion */
])
var NDKEvent = class _NDKEvent extends lib.EventEmitter {
  ndk
  created_at
  content = ''
  tags = []
  kind
  id = ''
  sig
  pubkey = ''
  signatureVerified
  _author = void 0
  /**
   * The relay that this event was first received from.
   */
  relay
  /**
   * The relays that this event was received from and/or successfully published to.
   */
  get onRelays () {
    let res = []
    if (!this.ndk) {
      if (this.relay) res.push(this.relay)
    } else {
      res = this.ndk.subManager.seenEvents.get(this.id) || []
    }
    return res
  }

  /**
   * The status of the publish operation.
   */
  publishStatus = 'success'
  publishError
  constructor (ndk, event) {
    super()
    this.ndk = ndk
    this.created_at = event?.created_at
    this.content = event?.content || ''
    this.tags = event?.tags || []
    this.id = event?.id || ''
    this.sig = event?.sig
    this.pubkey = event?.pubkey || ''
    this.kind = event?.kind
    if (event instanceof _NDKEvent) {
      if (this.relay) {
        this.relay = event.relay
        this.ndk?.subManager.seenEvent(event.id, this.relay)
      }
      this.publishStatus = event.publishStatus
      this.publishError = event.publishError
    }
  }

  /**
   * Deserialize an NDKEvent from a serialized payload.
   * @param ndk
   * @param event
   * @returns
   */
  static deserialize (ndk, event) {
    return new _NDKEvent(ndk, deserialize(event))
  }

  /**
   * Returns the event as is.
   */
  rawEvent () {
    return {
      created_at: this.created_at,
      content: this.content,
      tags: this.tags,
      kind: this.kind,
      pubkey: this.pubkey,
      id: this.id,
      sig: this.sig
    }
  }

  set author (user) {
    this.pubkey = user.pubkey
    this._author = user
    this._author.ndk ??= this.ndk
  }

  /**
   * Returns an NDKUser for the author of the event.
   */
  get author () {
    if (this._author) return this._author
    if (!this.ndk) throw new Error('No NDK instance found')
    const user = this.ndk.getUser({ pubkey: this.pubkey })
    this._author = user
    return user
  }

  /**
   * NIP-73 tagging of external entities
   * @param entity to be tagged
   * @param type of the entity
   * @param markerUrl to be used as the marker URL
   *
   * @example
   * ```typescript
   * event.tagExternal("https://example.com/article/123#nostr", "url");
   * event.tags => [["i", "https://example.com/123"], ["k", "https://example.com"]]
   * ```
   *
   * @example tag a podcast:item:guid
   * ```typescript
   * event.tagExternal("e32b4890-b9ea-4aef-a0bf-54b787833dc5", "podcast:item:guid");
   * event.tags => [["i", "podcast:item:guid:e32b4890-b9ea-4aef-a0bf-54b787833dc5"], ["k", "podcast:item:guid"]]
   * ```
   *
   * @see https://github.com/nostr-protocol/nips/blob/master/73.md
   */
  tagExternal (entity, type, markerUrl) {
    const iTag = ['i']
    const kTag = ['k']
    switch (type) {
      case 'url':
        const url = new URL(entity)
        url.hash = ''
        iTag.push(url.toString())
        kTag.push(`${url.protocol}//${url.host}`)
        break
      case 'hashtag':
        iTag.push(`#${entity.toLowerCase()}`)
        kTag.push('#')
        break
      case 'geohash':
        iTag.push(`geo:${entity.toLowerCase()}`)
        kTag.push('geo')
        break
      case 'isbn':
        iTag.push(`isbn:${entity.replace(/-/g, '')}`)
        kTag.push('isbn')
        break
      case 'podcast:guid':
        iTag.push(`podcast:guid:${entity}`)
        kTag.push('podcast:guid')
        break
      case 'podcast:item:guid':
        iTag.push(`podcast:item:guid:${entity}`)
        kTag.push('podcast:item:guid')
        break
      case 'podcast:publisher:guid':
        iTag.push(`podcast:publisher:guid:${entity}`)
        kTag.push('podcast:publisher:guid')
        break
      case 'isan':
        iTag.push(`isan:${entity.split('-').slice(0, 4).join('-')}`)
        kTag.push('isan')
        break
      case 'doi':
        iTag.push(`doi:${entity.toLowerCase()}`)
        kTag.push('doi')
        break
      default:
        throw new Error(`Unsupported NIP-73 entity type: ${type}`)
    }
    if (markerUrl) {
      iTag.push(markerUrl)
    }
    this.tags.push(iTag)
    this.tags.push(kTag)
  }

  /**
   * Tag a user with an optional marker.
   * @param target What is to be tagged. Can be an NDKUser, NDKEvent, or an NDKTag.
   * @param marker The marker to use in the tag.
   * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event.
   * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag.
   * @example
   * ```typescript
   * reply.tag(opEvent, "reply");
   * // reply.tags => [["e", <id>, <relay>, "reply"]]
   * ```
   */
  tag (target, marker, skipAuthorTag, forceTag) {
    let tags = []
    const isNDKUser = target.fetchProfile !== void 0
    if (isNDKUser) {
      forceTag ??= 'p'
      const tag = [forceTag, target.pubkey]
      if (marker) tag.push(...['', marker])
      tags.push(tag)
    } else if (target instanceof _NDKEvent) {
      const event = target
      skipAuthorTag ??= event?.pubkey === this.pubkey
      tags = event.referenceTags(marker, skipAuthorTag, forceTag)
      for (const pTag of event.getMatchingTags('p')) {
        if (pTag[1] === this.pubkey) continue
        if (this.tags.find((t) => t[0] === 'p' && t[1] === pTag[1])) continue
        this.tags.push(['p', pTag[1]])
      }
    } else if (Array.isArray(target)) {
      tags = [target]
    } else {
      throw new Error('Invalid argument', target)
    }
    this.tags = mergeTags(this.tags, tags)
  }

  /**
   * Return a NostrEvent object, trying to fill in missing fields
   * when possible, adding tags when necessary.
   * @param pubkey {string} The pubkey of the user who the event belongs to.
   * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
   */
  async toNostrEvent (pubkey) {
    if (!pubkey && this.pubkey === '') {
      const user = await this.ndk?.signer?.user()
      this.pubkey = user?.pubkey || ''
    }
    if (!this.created_at) {
      this.created_at = Math.floor(Date.now() / 1e3)
    }
    const { content, tags } = await this.generateTags()
    this.content = content || ''
    this.tags = tags
    try {
      this.id = this.getEventHash()
    } catch (e) {
    }
    return this.rawEvent()
  }

  serialize = serialize.bind(this)
  getEventHash = getEventHash.bind(this)
  validate = validate.bind(this)
  verifySignature = verifySignature.bind(this)
  /**
   * Is this event replaceable (whether parameterized or not)?
   *
   * This will return true for kind 0, 3, 10k-20k and 30k-40k
   */
  isReplaceable = isReplaceable.bind(this)
  isEphemeral = isEphemeral.bind(this)
  /**
   * Is this event parameterized replaceable?
   *
   * This will return true for kind 30k-40k
   */
  isParamReplaceable = isParamReplaceable.bind(this)
  /**
   * Encodes a bech32 id.
   *
   * @param relays {string[]} The relays to encode in the id
   * @returns {string} - Encoded naddr, note or nevent.
   */
  encode = encode.bind(this)
  encrypt = encrypt.bind(this)
  decrypt = decrypt.bind(this)
  /**
   * Get all tags with the given name
   * @param tagName {string} The name of the tag to search for
   * @returns {NDKTag[]} An array of the matching tags
   */
  getMatchingTags (tagName, marker) {
    const t = this.tags.filter((tag) => tag[0] === tagName)
    if (marker === void 0) return t
    return t.filter((tag) => tag[3] === marker)
  }

  /**
   * Check if the event has a tag with the given name
   * @param tagName
   * @param marker
   * @returns
   */
  hasTag (tagName, marker) {
    return this.tags.some((tag) => tag[0] === tagName && (!marker || tag[3] === marker))
  }

  /**
   * Get the first tag with the given name
   * @param tagName Tag name to search for
   * @returns The value of the first tag with the given name, or undefined if no such tag exists
   */
  tagValue (tagName) {
    const tags = this.getMatchingTags(tagName)
    if (tags.length === 0) return void 0
    return tags[0][1]
  }

  /**
   * Gets the NIP-31 "alt" tag of the event.
   */
  get alt () {
    return this.tagValue('alt')
  }

  /**
   * Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
   * clients that don't handle a particular event kind can display something
   * useful for users.
   */
  set alt (alt) {
    this.removeTag('alt')
    if (alt) this.tags.push(['alt', alt])
  }

  /**
   * Gets the NIP-33 "d" tag of the event.
   */
  get dTag () {
    return this.tagValue('d')
  }

  /**
   * Sets the NIP-33 "d" tag of the event.
   */
  set dTag (value) {
    this.removeTag('d')
    if (value) this.tags.push(['d', value])
  }

  /**
   * Remove all tags with the given name (e.g. "d", "a", "p")
   * @param tagName Tag name(s) to search for and remove
   * @returns {void}
   */
  removeTag (tagName) {
    const tagNames = Array.isArray(tagName) ? tagName : [tagName]
    this.tags = this.tags.filter((tag) => !tagNames.includes(tag[0]))
  }

  /**
   * Sign the event if a signer is present.
   *
   * It will generate tags.
   * Repleacable events will have their created_at field set to the current time.
   * @param signer {NDKSigner} The NDKSigner to use to sign the event
   * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
   */
  async sign (signer) {
    if (!signer) {
      this.ndk?.assertSigner()
      signer = this.ndk.signer
    } else {
      this.author = await signer.user()
    }
    const nostrEvent = await this.toNostrEvent()
    this.sig = await signer.sign(nostrEvent)
    return this.sig
  }

  /**
   *
   * @param relaySet
   * @param timeoutMs
   * @param requiredRelayCount
   * @returns
   */
  async publishReplaceable (relaySet, timeoutMs, requiredRelayCount) {
    this.id = ''
    this.created_at = Math.floor(Date.now() / 1e3)
    this.sig = ''
    return this.publish(relaySet, timeoutMs, requiredRelayCount)
  }

  /**
   * Attempt to sign and then publish an NDKEvent to a given relaySet.
   * If no relaySet is provided, the relaySet will be calculated by NDK.
   * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
   * @param timeoutM {number} The timeout for the publish operation in milliseconds.
   * @param requiredRelayCount The number of relays that must receive the event for the publish to be considered successful.
   * @returns A promise that resolves to the relays the event was published to.
   */
  async publish (relaySet, timeoutMs, requiredRelayCount) {
    if (!this.sig) await this.sign()
    if (!this.ndk) { throw new Error('NDKEvent must be associated with an NDK instance to publish') }
    if (!relaySet) {
      relaySet = this.ndk.devWriteRelaySet || await calculateRelaySetFromEvent(this.ndk, this)
    }
    if (this.kind === 5 /* EventDeletion */ && this.ndk.cacheAdapter?.deleteEventIds) {
      const eTags = this.getMatchingTags('e').map((tag) => tag[1])
      this.ndk.cacheAdapter.deleteEventIds(eTags)
    }
    const rawEvent = this.rawEvent()
    if (this.ndk.cacheAdapter?.addUnpublishedEvent && shouldTrackUnpublishedEvent(this)) {
      try {
        this.ndk.cacheAdapter.addUnpublishedEvent(this, relaySet.relayUrls)
      } catch (e) {
        console.error('Error adding unpublished event to cache', e)
      }
    }
    if (this.kind === 5 /* EventDeletion */ && this.ndk.cacheAdapter?.deleteEventIds) {
      this.ndk.cacheAdapter.deleteEventIds(this.getMatchingTags('e').map((tag) => tag[1]))
    }
    this.ndk.subManager.dispatchEvent(rawEvent, void 0, true)
    const relays = await relaySet.publish(this, timeoutMs, requiredRelayCount)
    relays.forEach((relay) => this.ndk?.subManager.seenEvent(this.id, relay))
    return relays
  }

  /**
   * Generates tags for users, notes, and other events tagged in content.
   * Will also generate random "d" tag for parameterized replaceable events where needed.
   * @returns {ContentTag} The tags and content of the event.
   */
  async generateTags () {
    let tags = []
    const g = await generateContentTags(this.content, this.tags)
    const content = g.content
    tags = g.tags
    if (this.kind && this.isParamReplaceable()) {
      const dTag = this.getMatchingTags('d')[0]
      if (!dTag) {
        const title = this.tagValue('title')
        const randLength = title ? 6 : 16
        let str = [...Array(randLength)].map(() => Math.random().toString(36)[2]).join('')
        if (title && title.length > 0) {
          str = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '-' + str
        }
        tags.push(['d', str])
      }
    }
    if (this.shouldAddClientTag) {
      const clientTag = ['client', this.ndk.clientName ?? '']
      if (this.ndk.clientNip89) clientTag.push(this.ndk.clientNip89)
      tags.push(clientTag)
    } else if (this.shouldStripClientTag) {
      tags = tags.filter((tag) => tag[0] !== 'client')
    }
    return { content: content || '', tags }
  }

  get shouldAddClientTag () {
    if (!this.ndk?.clientName && !this.ndk?.clientNip89) return false
    if (skipClientTagOnKinds.has(this.kind)) return false
    if (this.isEphemeral() || this.isReplaceable()) return false
    if (this.hasTag('client')) return false
    return true
  }

  get shouldStripClientTag () {
    return skipClientTagOnKinds.has(this.kind)
  }

  muted () {
    const authorMutedEntry = this.ndk?.mutedIds.get(this.pubkey)
    if (authorMutedEntry && authorMutedEntry === 'p') return 'author'
    const eventTagReference = this.tagReference()
    const eventMutedEntry = this.ndk?.mutedIds.get(eventTagReference[1])
    if (eventMutedEntry && eventMutedEntry === eventTagReference[0]) return 'event'
    return null
  }

  /**
   * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
   * a parameterized replaceable event.
   * @returns {string} the "d" tag of the event.
   *
   * @deprecated Use `dTag` instead.
   */
  replaceableDTag () {
    if (this.kind && this.kind >= 3e4 && this.kind <= 4e4) {
      const dTag = this.getMatchingTags('d')[0]
      const dTagId = dTag ? dTag[1] : ''
      return dTagId
    }
    throw new Error('Event is not a parameterized replaceable event')
  }

  /**
   * Provides a deduplication key for the event.
   *
   * For kinds 0, 3, 10k-20k this will be the event <kind>:<pubkey>
   * For kinds 30k-40k this will be the event <kind>:<pubkey>:<d-tag>
   * For all other kinds this will be the event id
   */
  deduplicationKey () {
    if (this.kind === 0 || this.kind === 3 || this.kind && this.kind >= 1e4 && this.kind < 2e4) {
      return `${this.kind}:${this.pubkey}`
    } else {
      return this.tagId()
    }
  }

  /**
   * Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.
   * @returns {string} The id
   */
  tagId () {
    if (this.isParamReplaceable()) {
      return this.tagAddress()
    }
    return this.id
  }

  /**
   * Returns a stable reference value for a replaceable event.
   *
   * Param replaceable events are returned in the expected format of `<kind>:<pubkey>:<d-tag>`.
   * Kind-replaceable events are returned in the format of `<kind>:<pubkey>:`.
   *
   * @returns {string} A stable reference value for replaceable events
   */
  tagAddress () {
    if (this.isParamReplaceable()) {
      const dTagId = this.dTag ?? ''
      return `${this.kind}:${this.pubkey}:${dTagId}`
    } else if (this.isReplaceable()) {
      return `${this.kind}:${this.pubkey}:`
    }
    throw new Error('Event is not a replaceable event')
  }

  /**
   * Determines the type of tag that can be used to reference this event from another event.
   * @returns {string} The tag type
   * @example
   * event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   * event.tagType(); // "a"
   */
  tagType () {
    return this.isParamReplaceable() ? 'a' : 'e'
  }

  /**
   * Get the tag that can be used to reference this event from another event.
   *
   * Consider using referenceTags() instead (unless you have a good reason to use this)
   *
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.tagReference(); // ["a", "30000:pubkey:d-code"]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.tagReference(); // ["e", "eventid"]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  tagReference (marker) {
    let tag
    if (this.isParamReplaceable()) {
      tag = ['a', this.tagAddress()]
    } else {
      tag = ['e', this.tagId()]
    }
    if (this.relay) {
      tag.push(this.relay.url)
    } else {
      tag.push('')
    }
    tag.push(marker ?? '')
    if (!this.isParamReplaceable()) {
      tag.push(this.pubkey)
    }
    return tag
  }

  /**
   * Get the tags that can be used to reference this event from another event
   * @param marker The marker to use in the tag
   * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event
   * @param forceTag Force a specific tag to be used instead of the default "e" or "a" tag
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.referenceTags(); // [["a", "30000:pubkey:d-code"], ["e", "parent-id"]]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.referenceTags(); // [["e", "parent-id"]]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  referenceTags (marker, skipAuthorTag, forceTag) {
    let tags = []
    if (this.isParamReplaceable()) {
      tags = [
        [forceTag ?? 'a', this.tagAddress()],
        [forceTag ?? 'e', this.id]
      ]
    } else {
      tags = [[forceTag ?? 'e', this.id]]
    }
    tags = tags.map((tag) => {
      if (tag[0] === 'e' || marker) {
        tag.push(this.relay?.url ?? '')
      } else if (this.relay?.url) {
        tag.push(this.relay?.url)
      }
      return tag
    })
    tags.forEach((tag) => {
      if (tag[0] === 'e') {
        tag.push(marker ?? '')
        tag.push(this.pubkey)
      } else if (marker) {
        tag.push(marker)
      }
    })
    tags = [...tags, ...this.getMatchingTags('h')]
    if (!skipAuthorTag) tags.push(...this.author.referenceTags())
    return tags
  }

  /**
   * Provides the filter that will return matching events for this event.
   *
   * @example
   *    event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *    event.filter(); // { "#a": ["30000:pubkey:d-code"] }
   * @example
   *    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *    event.filter(); // { "#e": ["eventid"] }
   *
   * @returns The filter that will return matching events for this event
   */
  filter () {
    if (this.isParamReplaceable()) {
      return { '#a': [this.tagId()] }
    } else {
      return { '#e': [this.tagId()] }
    }
  }

  nip22Filter () {
    if (this.isParamReplaceable()) {
      return { '#A': [this.tagId()] }
    } else {
      return { '#E': [this.tagId()] }
    }
  }

  /**
   * Generates a deletion event of the current event
   *
   * @param reason The reason for the deletion
   * @param publish Whether to publish the deletion event automatically
   * @returns The deletion event
   */
  async delete (reason, publish = true) {
    if (!this.ndk) throw new Error('No NDK instance found')
    this.ndk.assertSigner()
    const e = new _NDKEvent(this.ndk, {
      kind: 5 /* EventDeletion */,
      content: reason || ''
    })
    e.tag(this, void 0, true)
    e.tags.push(['k', this.kind.toString()])
    if (publish) {
      this.emit('deleted')
      await e.publish()
    }
    return e
  }

  /**
   * Establishes whether this is a NIP-70-protectede event.
   * @@satisfies NIP-70
   */
  set isProtected (val) {
    this.removeTag('-')
    if (val) this.tags.push(['-'])
  }

  /**
   * Whether this is a NIP-70-protectede event.
   * @@satisfies NIP-70
   */
  get isProtected () {
    return this.hasTag('-')
  }

  /**
   * Fetch an event tagged with the given tag following relay hints if provided.
   * @param tag The tag to search for
   * @param marker The marker to use in the tag (e.g. "root")
   * @returns The fetched event or null if no event was found, undefined if no matching tag was found in the event
   * * @example
   * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
   * const originalEvent = await replyEvent.fetchTaggedEvent("e", "reply");
   * console.log(replyEvent.encode() + " is a reply to event " + originalEvent?.encode());
   */
  fetchTaggedEvent = fetchTaggedEvent.bind(this)
  /**
   * Fetch the root event of the current event.
   * @returns The fetched root event or null if no event was found
   * @example
   * const replyEvent = await ndk.fetchEvent("nevent1qqs8x8vnycyha73grv380gmvlury4wtmx0nr9a5ds2dngqwgu87wn6gpzemhxue69uhhyetvv9ujuurjd9kkzmpwdejhgq3ql2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqz4cwjd")
   * const rootEvent = await replyEvent.fetchRootEvent();
   * console.log(replyEvent.encode() + " is a reply in the thread " + rootEvent?.encode());
   */
  fetchRootEvent = fetchRootEvent.bind(this)
  /**
   * Fetch the event the current event is replying to.
   * @returns The fetched reply event or null if no event was found
   */
  fetchReplyEvent = fetchReplyEvent.bind(this)
  /**
   * NIP-18 reposting event.
   *
   * @param publish Whether to publish the reposted event automatically @default true
   * @param signer The signer to use for signing the reposted event
   * @returns The reposted event
   *
   * @function
   */
  repost = repost.bind(this)
  /**
   * React to an existing event
   *
   * @param content The content of the reaction
   */
  async react (content, publish = true) {
    if (!this.ndk) throw new Error('No NDK instance found')
    this.ndk.assertSigner()
    const e = new _NDKEvent(this.ndk, {
      kind: 7 /* Reaction */,
      content
    })
    e.tag(this)
    if (publish) {
      await e.publish()
    } else {
      await e.sign()
    }
    return e
  }

  /**
   * Checks whether the event is valid per underlying NIPs.
   *
   * This method is meant to be overridden by subclasses that implement specific NIPs
   * to allow the enforcement of NIP-specific validation rules.
   *
   * Otherwise, it will only check for basic event properties.
   *
   */
  get isValid () {
    return this.validate()
  }

  /**
   * Creates a reply event for the current event.
   *
   * This function will use NIP-22 when appropriate (i.e. replies to non-kind:1 events).
   * This function does not have side-effects; it will just return an event with the appropriate tags
   * to generate the reply event; the caller is responsible for publishing the event.
   */
  reply () {
    const reply = new _NDKEvent(this.ndk)
    if (this.kind === 1) {
      reply.kind = 1
      const opHasETag = this.hasTag('e')
      if (opHasETag) {
        reply.tags = [
          ...reply.tags,
          ...this.getMatchingTags('e'),
          ...this.getMatchingTags('p'),
          ...this.getMatchingTags('a'),
          ...this.referenceTags('reply')
        ]
      } else {
        reply.tag(this, 'root')
      }
    } else {
      reply.kind = 1111 /* GenericReply */
      const carryOverTags = ['A', 'E', 'I', 'P']
      const rootTags = this.tags.filter((tag) => carryOverTags.includes(tag[0]))
      if (rootTags.length > 0) {
        const rootKind = this.tagValue('K')
        reply.tags.push(...rootTags)
        if (rootKind) reply.tags.push(['K', rootKind])
        const [type, id, _, ...extra] = this.tagReference()
        const tag = [type, id, ...extra]
        reply.tags.push(tag)
      } else {
        const [type, id, _, relayHint] = this.tagReference()
        const tag = [type, id, relayHint ?? '']
        if (type === 'e') tag.push(this.pubkey)
        reply.tags.push(tag)
        const uppercaseTag = [...tag]
        uppercaseTag[0] = uppercaseTag[0].toUpperCase()
        reply.tags.push(uppercaseTag)
        reply.tags.push(['K', this.kind.toString()])
        reply.tags.push(['P', this.pubkey])
      }
      reply.tags.push(['k', this.kind.toString()])
      reply.tags.push(...this.getMatchingTags('p'))
      reply.tags.push(['p', this.pubkey])
    }
    return reply
  }
}
const untrackedUnpublishedEvents = /* @__PURE__ */ new Set([
  24133 /* NostrConnect */,
  13194 /* NostrWaletConnectInfo */,
  23194 /* NostrWalletConnectReq */,
  23195 /* NostrWalletConnectRes */
])
function shouldTrackUnpublishedEvent (event) {
  return !untrackedUnpublishedEvents.has(event.kind)
}

// src/relay/connectivity.ts
const MAX_RECONNECT_ATTEMPTS = 5
const FLAPPING_THRESHOLD_MS = 1e3
const NDKRelayConnectivity = class {
  ndkRelay
  ws
  _status
  timeoutMs
  connectedAt
  _connectionStats = {
    attempts: 0,
    success: 0,
    durations: []
  }

  debug
  netDebug
  connectTimeout
  reconnectTimeout
  ndk
  openSubs = /* @__PURE__ */ new Map()
  openCountRequests = /* @__PURE__ */ new Map()
  openEventPublishes = /* @__PURE__ */ new Map()
  serial = 0
  baseEoseTimeout = 4400
  constructor (ndkRelay, ndk) {
    this.ndkRelay = ndkRelay
    this._status = 1 /* DISCONNECTED */
    const rand = Math.floor(Math.random() * 1e3)
    this.debug = this.ndkRelay.debug.extend('connectivity' + rand)
    this.ndk = ndk
  }

  /**
   * Connects to the NDK relay and handles the connection lifecycle.
   *
   * This method attempts to establish a WebSocket connection to the NDK relay specified in the `ndkRelay` object.
   * If the connection is successful, it updates the connection statistics, sets the connection status to `CONNECTED`,
   * and emits `connect` and `ready` events on the `ndkRelay` object.
   *
   * If the connection attempt fails, it handles the error by either initiating a reconnection attempt or emitting a
   * `delayed-connect` event on the `ndkRelay` object, depending on the `reconnect` parameter.
   *
   * @param timeoutMs - The timeout in milliseconds for the connection attempt. If not provided, the default timeout from the `ndkRelay` object is used.
   * @param reconnect - Indicates whether a reconnection should be attempted if the connection fails. Defaults to `true`.
   * @returns A Promise that resolves when the connection is established, or rejects if the connection fails.
   */
  async connect (timeoutMs, reconnect = true) {
    if (this._status !== 2 /* RECONNECTING */ && this._status !== 1 /* DISCONNECTED */ || this.reconnectTimeout) {
      this.debug(
        'Relay requested to be connected but was in state %s or it had a reconnect timeout',
        this._status
      )
      return
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = void 0
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout)
      this.connectTimeout = void 0
    }
    timeoutMs ??= this.timeoutMs
    if (!this.timeoutMs && timeoutMs) this.timeoutMs = timeoutMs
    if (this.timeoutMs) {
      this.connectTimeout = setTimeout(
        () => this.onConnectionError(reconnect),
        this.timeoutMs
      )
    }
    try {
      this.updateConnectionStats.attempt()
      if (this._status === 1 /* DISCONNECTED */) { this._status = 4 /* CONNECTING */ } else this._status = 2 /* RECONNECTING */
      this.ws = new WebSocket(this.ndkRelay.url)
      this.ws.onopen = this.onConnect.bind(this)
      this.ws.onclose = this.onDisconnect.bind(this)
      this.ws.onmessage = this.onMessage.bind(this)
      this.ws.onerror = this.onError.bind(this)
    } catch (e) {
      this.debug(`Failed to connect to ${this.ndkRelay.url}`, e)
      this._status = 1 /* DISCONNECTED */
      if (reconnect) this.handleReconnection()
      else this.ndkRelay.emit('delayed-connect', 2 * 24 * 60 * 60 * 1e3)
      throw e
    }
  }

  /**
   * Disconnects the WebSocket connection to the NDK relay.
   * This method sets the connection status to `NDKRelayStatus.DISCONNECTING`,
   * attempts to close the WebSocket connection, and sets the status to
   * `NDKRelayStatus.DISCONNECTED` if the disconnect operation fails.
   */
  disconnect () {
    this._status = 0 /* DISCONNECTING */
    try {
      this.ws?.close()
    } catch (e) {
      this.debug('Failed to disconnect', e)
      this._status = 1 /* DISCONNECTED */
    }
  }

  /**
   * Handles the error that occurred when attempting to connect to the NDK relay.
   * If `reconnect` is `true`, this method will initiate a reconnection attempt.
   * Otherwise, it will emit a `delayed-connect` event on the `ndkRelay` object,
   * indicating that a reconnection should be attempted after a delay.
   *
   * @param reconnect - Indicates whether a reconnection should be attempted.
   */
  onConnectionError (reconnect) {
    this.debug(`Error connecting to ${this.ndkRelay.url}`, this.timeoutMs)
    if (reconnect && !this.reconnectTimeout) {
      this.handleReconnection()
    }
  }

  /**
   * Handles the connection event when the WebSocket connection is established.
   * This method is called when the WebSocket connection is successfully opened.
   * It clears any existing connection and reconnection timeouts, updates the connection statistics,
   * sets the connection status to `CONNECTED`, and emits `connect` and `ready` events on the `ndkRelay` object.
   */
  onConnect () {
    this.netDebug?.('connected', this.ndkRelay)
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = void 0
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout)
      this.connectTimeout = void 0
    }
    this.updateConnectionStats.connected()
    this._status = 5 /* CONNECTED */
    this.ndkRelay.emit('connect')
    this.ndkRelay.emit('ready')
  }

  /**
   * Handles the disconnection event when the WebSocket connection is closed.
   * This method is called when the WebSocket connection is successfully closed.
   * It updates the connection statistics, sets the connection status to `DISCONNECTED`,
   * initiates a reconnection attempt if we didn't disconnect ourselves,
   * and emits a `disconnect` event on the `ndkRelay` object.
   */
  onDisconnect () {
    this.netDebug?.('disconnected', this.ndkRelay)
    this.updateConnectionStats.disconnected()
    if (this._status === 5 /* CONNECTED */) {
      this.handleReconnection()
    }
    this._status = 1 /* DISCONNECTED */
    this.ndkRelay.emit('disconnect')
  }

  /**
   * Handles incoming messages from the NDK relay WebSocket connection.
   * This method is called whenever a message is received from the relay.
   * It parses the message data and dispatches the appropriate handling logic based on the message type.
   *
   * @param event - The MessageEvent containing the received message data.
   */
  onMessage (event) {
    this.netDebug?.(event.data, this.ndkRelay, 'recv')
    try {
      const data = JSON.parse(event.data)
      const [cmd, id, ...rest] = data
      switch (cmd) {
        case 'EVENT': {
          const so = this.openSubs.get(id)
          const event2 = data[2]
          if (!so) {
            this.debug(`Received event for unknown subscription ${id}`)
            return
          }
          so.onevent(event2)
          return
        }
        case 'COUNT': {
          const payload = data[2]
          const cr = this.openCountRequests.get(id)
          if (cr) {
            cr.resolve(payload.count)
            this.openCountRequests.delete(id)
          }
          return
        }
        case 'EOSE': {
          const so = this.openSubs.get(id)
          if (!so) return
          so.oneose(id)
          return
        }
        case 'OK': {
          const ok = data[2]
          const reason = data[3]
          const ep = this.openEventPublishes.get(id)
          const firstEp = ep?.pop()
          if (!ep || !firstEp) {
            this.debug('Received OK for unknown event publish', id)
            return
          }
          if (ok) firstEp.resolve(reason)
          else firstEp.reject(new Error(reason))
          if (ep.length === 0) {
            this.openEventPublishes.delete(id)
          } else {
            this.openEventPublishes.set(id, ep)
          }
          return
        }
        case 'CLOSED': {
          const so = this.openSubs.get(id)
          if (!so) return
          so.onclosed(data[2])
          return
        }
        case 'NOTICE':
          this.onNotice(data[1])
          return
        case 'AUTH': {
          this.onAuthRequested(data[1])
        }
      }
    } catch (error) {
      this.debug(
        `Error parsing message from ${this.ndkRelay.url}: ${error.message}`,
        error?.stack
      )
    }
  }

  /**
   * Handles an authentication request from the NDK relay.
   *
   * If an authentication policy is configured, it will be used to authenticate the connection.
   * Otherwise, the `auth` event will be emitted to allow the application to handle the authentication.
   *
   * @param challenge - The authentication challenge provided by the NDK relay.
   */
  async onAuthRequested (challenge) {
    const authPolicy = this.ndkRelay.authPolicy ?? this.ndk?.relayAuthDefaultPolicy
    this.debug('Relay requested authentication', {
      havePolicy: !!authPolicy
    })
    if (this._status === 7 /* AUTHENTICATING */) {
      this.debug('Already authenticating, ignoring')
      return
    }
    this._status = 6 /* AUTH_REQUESTED */
    if (authPolicy) {
      if (this._status >= 5 /* CONNECTED */) {
        this._status = 7 /* AUTHENTICATING */
        let res
        try {
          res = await authPolicy(this.ndkRelay, challenge)
        } catch (e) {
          this.debug('Authentication policy threw an error', e)
          res = false
        }
        this.debug('Authentication policy returned', !!res)
        if (res instanceof NDKEvent || res === true) {
          if (res instanceof NDKEvent) {
            await this.auth(res)
          }
          const authenticate = async () => {
            if (this._status >= 5 /* CONNECTED */ && this._status < 8 /* AUTHENTICATED */) {
              const event = new NDKEvent(this.ndk)
              event.kind = 22242 /* ClientAuth */
              event.tags = [
                ['relay', this.ndkRelay.url],
                ['challenge', challenge]
              ]
              await event.sign()
              this.auth(event).then(() => {
                this._status = 8 /* AUTHENTICATED */
                this.ndkRelay.emit('authed')
                this.debug('Authentication successful')
              }).catch((e) => {
                this._status = 6 /* AUTH_REQUESTED */
                this.ndkRelay.emit('auth:failed', e)
                this.debug('Authentication failed', e)
              })
            } else {
              this.debug(
                'Authentication failed, it changed status, status is %d',
                this._status
              )
            }
          }
          if (res === true) {
            if (!this.ndk?.signer) {
              this.debug('No signer available for authentication localhost')
              this.ndk?.once('signer:ready', authenticate)
            } else {
              authenticate().catch((e) => {
                console.error('Error authenticating', e)
              })
            }
          }
          this._status = 5 /* CONNECTED */
          this.ndkRelay.emit('authed')
        }
      }
    } else {
      this.ndkRelay.emit('auth', challenge)
    }
  }

  /**
   * Handles errors that occur on the WebSocket connection to the relay.
   * @param error - The error or event that occurred.
   */
  onError (error) {
    this.debug(`WebSocket error on ${this.ndkRelay.url}:`, error)
  }

  /**
   * Gets the current status of the NDK relay connection.
   * @returns {NDKRelayStatus} The current status of the NDK relay connection.
   */
  get status () {
    return this._status
  }

  /**
   * Checks if the NDK relay connection is currently available.
   * @returns {boolean} `true` if the relay connection is in the `CONNECTED` status, `false` otherwise.
   */
  isAvailable () {
    return this._status === 5 /* CONNECTED */
  }

  /**
   * Checks if the NDK relay connection is flapping, which means the connection is rapidly
   * disconnecting and reconnecting. This is determined by analyzing the durations of the
   * last three connection attempts. If the standard deviation of the durations is less
   * than 1000 milliseconds, the connection is considered to be flapping.
   *
   * @returns {boolean} `true` if the connection is flapping, `false` otherwise.
   */
  isFlapping () {
    const durations = this._connectionStats.durations
    if (durations.length % 3 !== 0) return false
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const variance = durations.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / durations.length
    const stdDev = Math.sqrt(variance)
    const isFlapping = stdDev < FLAPPING_THRESHOLD_MS
    return isFlapping
  }

  /**
   * Handles a notice received from the NDK relay.
   * If the notice indicates the relay is complaining (e.g. "too many" or "maximum"),
   * the method disconnects from the relay and attempts to reconnect after a 2-second delay.
   * A debug message is logged with the relay URL and the notice text.
   * The "notice" event is emitted on the ndkRelay instance with the notice text.
   *
   * @param notice - The notice text received from the NDK relay.
   */
  async onNotice (notice) {
    this.ndkRelay.emit('notice', notice)
  }

  /**
   * Attempts to reconnect to the NDK relay after a connection is lost.
   * This function is called recursively to handle multiple reconnection attempts.
   * It checks if the relay is flapping and emits a "flapping" event if so.
   * It then calculates a delay before the next reconnection attempt based on the number of previous attempts.
   * The function sets a timeout to execute the next reconnection attempt after the calculated delay.
   * If the maximum number of reconnection attempts is reached, a debug message is logged.
   *
   * @param attempt - The current attempt number (default is 0).
   */
  handleReconnection (attempt = 0) {
    if (this.reconnectTimeout) return
    if (this.isFlapping()) {
      this.ndkRelay.emit('flapping', this._connectionStats)
      this._status = 3 /* FLAPPING */
      return
    }
    const reconnectDelay = this.connectedAt ? Math.max(0, 6e4 - (Date.now() - this.connectedAt)) : 5e3 * (this._connectionStats.attempts + 1)
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = void 0
      this._status = 2 /* RECONNECTING */
      this.connect().catch((err) => {
        if (attempt < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(
            () => {
              this.handleReconnection(attempt + 1)
            },
            1e3 * (attempt + 1) ^ 4
          )
        } else {
          this.debug('Reconnect failed')
        }
      })
    }, reconnectDelay)
    this.ndkRelay.emit('delayed-connect', reconnectDelay)
    this.debug('Reconnecting in', reconnectDelay)
    this._connectionStats.nextReconnectAt = Date.now() + reconnectDelay
  }

  /**
   * Sends a message to the NDK relay if the connection is in the CONNECTED state and the WebSocket is open.
   * If the connection is not in the CONNECTED state or the WebSocket is not open, logs a debug message and throws an error.
   *
   * @param message - The message to send to the NDK relay.
   * @throws {Error} If attempting to send on a closed relay connection.
   */
  async send (message) {
    if (this._status >= 5 /* CONNECTED */ && this.ws?.readyState === WebSocket.OPEN) {
      this.ws?.send(message)
      this.netDebug?.(message, this.ndkRelay, 'send')
    } else {
      this.debug(
        `Not connected to ${this.ndkRelay.url} (%d), not sending message ${message}`,
        this._status
      )
    }
  }

  /**
   * Authenticates the NDK event by sending it to the NDK relay and returning a promise that resolves with the result.
   *
   * @param event - The NDK event to authenticate.
   * @returns A promise that resolves with the authentication result.
   */
  async auth (event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? []
      val.push({ resolve, reject })
      this.openEventPublishes.set(event.id, val)
    })
    this.send('["AUTH",' + JSON.stringify(event.rawEvent()) + ']')
    return ret
  }

  /**
   * Publishes an NDK event to the relay and returns a promise that resolves with the result.
   *
   * @param event - The NDK event to publish.
   * @returns A promise that resolves with the result of the event publication.
   * @throws {Error} If attempting to publish on a closed relay connection.
   */
  async publish (event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? []
      if (val.length > 0) {
        console.warn(
          'Duplicate event publishing detected, you are publishing event ' + event.id + ' twice'
        )
      }
      val.push({ resolve, reject })
      this.openEventPublishes.set(event.id, val)
    })
    this.send('["EVENT",' + JSON.stringify(event) + ']')
    return ret
  }

  /**
   * Counts the number of events that match the provided filters.
   *
   * @param filters - The filters to apply to the count request.
   * @param params - An optional object containing a custom id for the count request.
   * @returns A promise that resolves with the number of matching events.
   * @throws {Error} If attempting to send the count request on a closed relay connection.
   */
  async count (filters, params) {
    this.serial++
    const id = params?.id || 'count:' + this.serial
    const ret = new Promise((resolve, reject) => {
      this.openCountRequests.set(id, { resolve, reject })
    })
    this.send('["COUNT","' + id + '",' + JSON.stringify(filters).substring(1))
    return ret
  }

  close (subId, reason) {
    this.send('["CLOSE","' + subId + '"]')
    const sub = this.openSubs.get(subId)
    this.openSubs.delete(subId)
    if (sub) sub.onclose(reason)
  }

  /**
   * Subscribes to the NDK relay with the provided filters and parameters.
   *
   * @param filters - The filters to apply to the subscription.
   * @param params - The subscription parameters, including an optional custom id.
   * @returns A new NDKRelaySubscription instance.
   */
  req (relaySub) {
    this.send(
      '["REQ","' + relaySub.subId + '",' + JSON.stringify(relaySub.executeFilters).substring(1)
    ) + ']'
    this.openSubs.set(relaySub.subId, relaySub)
  }

  /**
   * Utility functions to update the connection stats.
   */
  updateConnectionStats = {
    connected: () => {
      this._connectionStats.success++
      this._connectionStats.connectedAt = Date.now()
    },
    disconnected: () => {
      if (this._connectionStats.connectedAt) {
        this._connectionStats.durations.push(
          Date.now() - this._connectionStats.connectedAt
        )
        if (this._connectionStats.durations.length > 100) {
          this._connectionStats.durations.shift()
        }
      }
      this._connectionStats.connectedAt = void 0
    },
    attempt: () => {
      this._connectionStats.attempts++
      this._connectionStats.connectedAt = Date.now()
    }
  }

  /** Returns the connection stats. */
  get connectionStats () {
    return this._connectionStats
  }

  /** Returns the relay URL */
  get url () {
    return this.ndkRelay.url
  }

  get connected () {
    return this._status >= 5 /* CONNECTED */ && this.ws?.readyState === WebSocket.OPEN
  }
}

// src/relay/publisher.ts
const NDKRelayPublisher = class {
  ndkRelay
  debug
  constructor (ndkRelay) {
    this.ndkRelay = ndkRelay
    this.debug = ndkRelay.debug.extend('publisher')
  }

  /**
   * Published an event to the relay; if the relay is not connected, it will
   * wait for the relay to connect before publishing the event.
   *
   * If the relay does not connect within the timeout, the publish operation
   * will fail.
   * @param event  The event to publish
   * @param timeoutMs  The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish (event, timeoutMs = 2500) {
    let timeout
    const publishConnected = () => {
      return new Promise((resolve, reject) => {
        try {
          this.publishEvent(event).then((result) => {
            this.ndkRelay.emit('published', event)
            event.emit('relay:published', this.ndkRelay)
            resolve(true)
          }).catch(reject)
        } catch (err) {
          reject(err)
        }
      })
    }
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        timeout = void 0
        reject(new Error('Timeout: ' + timeoutMs + 'ms'))
      }, timeoutMs)
    })
    const onConnectHandler = () => {
      publishConnected().then((result) => connectResolve(result)).catch((err) => connectReject(err))
    }
    let connectResolve
    let connectReject
    const onError = (err) => {
      this.ndkRelay.debug('Publish failed', err, event.id)
      this.ndkRelay.emit('publish:failed', event, err)
      event.emit('relay:publish:failed', this.ndkRelay, err)
      throw err
    }
    const onFinally = () => {
      if (timeout) clearTimeout(timeout)
      this.ndkRelay.removeListener('connect', onConnectHandler)
    }
    if (this.ndkRelay.status >= 5 /* CONNECTED */) {
      return Promise.race([publishConnected(), timeoutPromise]).catch(onError).finally(onFinally)
    } else {
      if (this.ndkRelay.status <= 1 /* DISCONNECTED */) {
        console.warn(
          'Relay is disconnected, trying to connect to publish an event',
          this.ndkRelay.url
        )
        this.ndkRelay.connect()
      } else {
        console.warn(
          'Relay not connected, waiting for connection to publish an event',
          this.ndkRelay.url
        )
      }
      return Promise.race([
        new Promise((resolve, reject) => {
          connectResolve = resolve
          connectReject = reject
          this.ndkRelay.once('connect', onConnectHandler)
        }),
        timeoutPromise
      ]).catch(onError).finally(onFinally)
    }
  }

  async publishEvent (event) {
    return this.ndkRelay.connectivity.publish(event.rawEvent())
  }
}

// src/subscription/grouping.ts
function filterFingerprint (filters, closeOnEose) {
  const elements = []
  for (const filter of filters) {
    const keys = Object.entries(filter || {}).map(([key, values]) => {
      if (['since', 'until'].includes(key)) {
        return key + ':' + values
      } else {
        return key
      }
    }).sort().join('-')
    elements.push(keys)
  }
  let id = closeOnEose ? '+' : ''
  id += elements.join('|')
  return id
}
function mergeFilters (filters) {
  const result = []
  const lastResult = {}
  filters.filter((f) => !!f.limit).forEach((filterWithLimit) => result.push(filterWithLimit))
  filters = filters.filter((f) => !f.limit)
  if (filters.length === 0) return result
  filters.forEach((filter) => {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (lastResult[key] === void 0) {
          lastResult[key] = [...value]
        } else {
          lastResult[key] = Array.from(/* @__PURE__ */ new Set([...lastResult[key], ...value]))
        }
      } else {
        lastResult[key] = value
      }
    })
  })
  return [...result, lastResult]
}

// src/relay/subscription.ts
const NDKRelaySubscription = class {
  fingerprint
  items = /* @__PURE__ */ new Map()
  topSubManager
  debug
  /**
   * Tracks the status of this REQ.
   */
  status = 0 /* INITIAL */
  onClose
  relay
  /**
   * Whether this subscription has reached EOSE.
   */
  eosed = false
  /**
   * Timeout at which this subscription will
   * start executing.
   */
  executionTimer
  /**
   * Track the time at which this subscription will fire.
   */
  fireTime
  /**
   * The delay type that the current fireTime was calculated with.
   */
  delayType
  /**
   * The filters that have been executed.
   */
  executeFilters
  id = Math.random().toString(36).substring(7)
  /**
   *
   * @param fingerprint The fingerprint of this subscription.
   */
  constructor (relay, fingerprint, topSubManager) {
    this.relay = relay
    this.topSubManager = topSubManager
    this.debug = relay.debug.extend('subscription-' + this.id)
    this.fingerprint = fingerprint || Math.random().toString(36).substring(7)
  }

  _subId
  get subId () {
    if (this._subId) return this._subId
    this._subId = this.fingerprint.slice(0, 15)
    return this._subId
  }

  subIdParts = /* @__PURE__ */ new Set()
  addSubIdPart (part) {
    this.subIdParts.add(part)
  }

  addItem (subscription, filters) {
    this.debug('Adding item', { filters, internalId: subscription.internalId, status: this.status, fingerprint: this.fingerprint, id: this.subId, items: this.items, itemsSize: this.items.size })
    if (this.items.has(subscription.internalId)) return
    subscription.on('close', this.removeItem.bind(this, subscription))
    this.items.set(subscription.internalId, { subscription, filters })
    if (this.status !== 3 /* RUNNING */) {
      if (subscription.subId && (!this._subId || this._subId.length < 48)) {
        if (this.status === 0 /* INITIAL */ || this.status === 1 /* PENDING */) {
          this.addSubIdPart(subscription.subId)
        }
      }
    }
    switch (this.status) {
      case 0 /* INITIAL */:
        this.evaluateExecutionPlan(subscription)
        break
      case 3 /* RUNNING */:
        console.log(
          'BUG: This should not happen: This subscription needs to catch up with a subscription that was already running',
          filters
        )
        break
      case 1 /* PENDING */:
        this.evaluateExecutionPlan(subscription)
        break
      case 4 /* CLOSED */:
        this.debug(
          'Subscription is closed, cannot add new items %o (%o)',
          subscription,
          filters
        )
        throw new Error('Cannot add new items to a closed subscription')
    }
  }

  /**
   * A subscription has been closed, remove it from the list of items.
   * @param subscription
   */
  removeItem (subscription) {
    this.items.delete(subscription.internalId)
    if (this.items.size === 0) {
      if (!this.eosed) return
      this.close()
      this.cleanup()
    }
  }

  close () {
    if (this.status === 4 /* CLOSED */) return
    const prevStatus = this.status
    this.status = 4 /* CLOSED */
    if (prevStatus === 3 /* RUNNING */) {
      try {
        this.relay.close(this.subId)
      } catch (e) {
        this.debug('Error closing subscription', e, this)
      }
    } else {
      this.debug("Subscription wanted to close but it wasn't running, this is probably ok", {
        subId: this.subId,
        prevStatus,
        sub: this
      })
    }
    this.cleanup()
  }

  cleanup () {
    if (this.executionTimer) clearTimeout(this.executionTimer)
    this.relay.off('ready', this.executeOnRelayReady)
    this.relay.off('authed', this.reExecuteAfterAuth)
    if (this.onClose) this.onClose(this)
  }

  evaluateExecutionPlan (subscription) {
    if (!subscription.isGroupable()) {
      this.status = 1 /* PENDING */
      this.execute()
      return
    }
    if (subscription.filters.find((filter) => !!filter.limit)) {
      this.executeFilters = this.compileFilters()
      if (this.executeFilters.length >= 10) {
        this.status = 1 /* PENDING */
        this.execute()
        return
      }
    }
    const delay = subscription.groupableDelay
    const delayType = subscription.groupableDelayType
    if (!delay) throw new Error('Cannot group a subscription without a delay')
    if (this.status === 0 /* INITIAL */) {
      this.schedule(delay, delayType)
    } else {
      const existingDelayType = this.delayType
      const timeUntilFire = this.fireTime - Date.now()
      if (existingDelayType === 'at-least' && delayType === 'at-least') {
        if (timeUntilFire < delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer)
          this.schedule(delay, delayType)
        }
      } else if (existingDelayType === 'at-least' && delayType === 'at-most') {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer)
          this.schedule(delay, delayType)
        }
      } else if (existingDelayType === 'at-most' && delayType === 'at-most') {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer)
          this.schedule(delay, delayType)
        }
      } else if (existingDelayType === 'at-most' && delayType === 'at-least') {
        if (timeUntilFire > delay) {
          if (this.executionTimer) clearTimeout(this.executionTimer)
          this.schedule(delay, delayType)
        }
      } else {
        throw new Error(
          'Unknown delay type combination ' + existingDelayType + ' ' + delayType
        )
      }
    }
  }

  schedule (delay, delayType) {
    this.status = 1 /* PENDING */
    const currentTime = Date.now()
    this.fireTime = currentTime + delay
    this.delayType = delayType
    const timer = setTimeout(this.execute.bind(this), delay)
    if (delayType === 'at-least') {
      this.executionTimer = timer
    }
  }

  executeOnRelayReady = () => {
    if (this.status !== 2 /* WAITING */) return
    if (this.items.size === 0) {
      this.debug('No items to execute; this relay was probably too slow to respond and the caller gave up', { status: this.status, fingerprint: this.fingerprint, items: this.items, itemsSize: this.items.size, id: this.id, subId: this.subId })
      this.cleanup()
      return
    }
    this.debug('Executing on relay ready', { status: this.status, fingerprint: this.fingerprint, items: this.items, itemsSize: this.items.size })
    this.status = 1 /* PENDING */
    this.execute()
  }

  finalizeSubId () {
    if (this.subIdParts.size > 0) {
      this._subId = Array.from(this.subIdParts).join('-')
    } else {
      this._subId = this.fingerprint.slice(0, 15)
    }
    this._subId += '-' + Math.random().toString(36).substring(2, 7)
  }

  // we do it this way so that we can remove the listener
  reExecuteAfterAuth = () => {
    const oldSubId = this.subId
    this.debug('Re-executing after auth', this.items.size)
    if (this.eosed) {
      this.relay.close(this.subId)
    } else {
      this.debug(
        "We are abandoning an opened subscription, once it EOSE's, the handler will close it",
        { oldSubId }
      )
    }
    this._subId = void 0
    this.status = 1 /* PENDING */
    this.execute()
    this.debug('Re-executed after auth %s \u{1F449} %s', oldSubId, this.subId)
  }

  execute () {
    if (this.status !== 1 /* PENDING */) {
      return
    }
    if (!this.relay.connected) {
      this.status = 2 /* WAITING */
      this.debug('Waiting for relay to be ready', { status: this.status, id: this.subId, fingerprint: this.fingerprint, items: this.items, itemsSize: this.items.size })
      this.relay.once('ready', this.executeOnRelayReady)
      return
    } else if (this.relay.status < 8 /* AUTHENTICATED */) {
      this.relay.once('authed', this.reExecuteAfterAuth)
    }
    this.status = 3 /* RUNNING */
    this.finalizeSubId()
    this.executeFilters = this.compileFilters()
    this.relay.req(this)
  }

  onstart () {
  }

  onevent (event) {
    this.topSubManager.dispatchEvent(event, this.relay)
  }

  oneose (subId) {
    this.eosed = true
    if (subId !== this.subId) {
      this.debug('Received EOSE for an abandoned subscription', subId, this.subId)
      this.relay.close(subId)
      return
    }
    if (this.items.size === 0) {
      this.close()
    }
    for (const { subscription } of this.items.values()) {
      subscription.eoseReceived(this.relay)
      if (subscription.closeOnEose) {
        this.debug('Removing item because of EOSE', { filters: subscription.filters, internalId: subscription.internalId, status: this.status, fingerprint: this.fingerprint, items: this.items, itemsSize: this.items.size })
        this.removeItem(subscription)
      }
    }
  }

  onclose (reason) {
    this.status = 4 /* CLOSED */
  }

  onclosed (reason) {
    if (!reason) return
    for (const { subscription } of this.items.values()) {
      subscription.closedReceived(this.relay, reason)
    }
  }

  /**
   * Grabs the filters from all the subscriptions
   * and merges them into a single filter.
   */
  compileFilters () {
    const mergedFilters = []
    const filters = Array.from(this.items.values()).map((item) => item.filters)
    if (!filters[0]) {
      this.debug('\u{1F440} No filters to merge', this.items)
      console.error('BUG: No filters to merge!', this.items)
      return []
    }
    const filterCount = filters[0].length
    for (let i = 0; i < filterCount; i++) {
      const allFiltersAtIndex = filters.map((filter) => filter[i])
      mergedFilters.push(...mergeFilters(allFiltersAtIndex))
    }
    return mergedFilters
  }
}

// src/relay/sub-manager.ts
const NDKRelaySubscriptionManager = class {
  relay
  subscriptions
  generalSubManager
  /**
   * @param relay - The relay instance.
   * @param generalSubManager - The subscription manager instance.
   */
  constructor (relay, generalSubManager) {
    this.relay = relay
    this.subscriptions = /* @__PURE__ */ new Map()
    this.generalSubManager = generalSubManager
  }

  /**
   * Adds a subscription to the manager.
   */
  addSubscription (sub, filters) {
    let relaySub
    if (!sub.isGroupable()) {
      relaySub = this.createSubscription(sub, filters)
    } else {
      const filterFp = filterFingerprint(filters, sub.closeOnEose)
      if (filterFp) {
        const existingSubs = this.subscriptions.get(filterFp)
        relaySub = (existingSubs || []).find(
          (sub2) => sub2.status < 3 /* RUNNING */
        )
      }
      relaySub ??= this.createSubscription(sub, filters, filterFp)
    }
    relaySub.addItem(sub, filters)
  }

  createSubscription (sub, filters, fingerprint) {
    const relaySub = new NDKRelaySubscription(this.relay, fingerprint || null, this.generalSubManager)
    relaySub.onClose = this.onRelaySubscriptionClose.bind(this)
    const currentVal = this.subscriptions.get(relaySub.fingerprint) ?? []
    this.subscriptions.set(relaySub.fingerprint, [...currentVal, relaySub])
    return relaySub
  }

  onRelaySubscriptionClose (sub) {
    let currentVal = this.subscriptions.get(sub.fingerprint) ?? []
    if (!currentVal) {
      console.warn(
        'Unexpectedly did not find a subscription with fingerprint',
        sub.fingerprint
      )
    } else if (currentVal.length === 1) {
      this.subscriptions.delete(sub.fingerprint)
    } else {
      currentVal = currentVal.filter((s) => s.id !== sub.id)
      this.subscriptions.set(sub.fingerprint, currentVal)
    }
  }
}
var NDKRelay = class _NDKRelay extends lib.EventEmitter {
  url
  scores
  connectivity
  subs
  publisher
  authPolicy
  /**
   * The lowest validation ratio this relay can reach.
   */
  lowestValidationRatio
  /**
   * Current validation ratio this relay is targeting.
   */
  targetValidationRatio
  validationRatioFn
  /**
   * This tracks events that have been seen by this relay
   * with a valid signature.
   */
  validatedEventCount = 0
  /**
   * This tracks events that have been seen by this relay
   * but have not been validated.
   */
  nonValidatedEventCount = 0
  /**
   * Whether this relay is trusted.
   *
   * Trusted relay's events do not get their signature verified.
   */
  trusted = false
  complaining = false
  debug
  static defaultValidationRatioUpdateFn = (relay, validatedCount, nonValidatedCount) => {
    if (relay.lowestValidationRatio === void 0 || relay.targetValidationRatio === void 0) { return 1 }
    let newRatio = relay.validationRatio
    if (relay.validationRatio > relay.targetValidationRatio) {
      const factor = validatedCount / 100
      newRatio = Math.max(relay.lowestValidationRatio, relay.validationRatio - factor)
    }
    if (newRatio < relay.validationRatio) {
      return newRatio
    }
    return relay.validationRatio
  }

  constructor (url, authPolicy, ndk) {
    super()
    this.url = normalizeRelayUrl(url)
    this.scores = /* @__PURE__ */ new Map()
    this.debug = createDebug5(`ndk:relay:${url}`)
    this.connectivity = new NDKRelayConnectivity(this, ndk)
    this.connectivity.netDebug = ndk?.netDebug
    this.req = this.connectivity.req.bind(this.connectivity)
    this.close = this.connectivity.close.bind(this.connectivity)
    this.subs = new NDKRelaySubscriptionManager(this, ndk.subManager)
    this.publisher = new NDKRelayPublisher(this)
    this.authPolicy = authPolicy
    this.targetValidationRatio = ndk?.initialValidationRatio
    this.lowestValidationRatio = ndk?.lowestValidationRatio
    this.validationRatioFn = (ndk?.validationRatioFn ?? _NDKRelay.defaultValidationRatioUpdateFn).bind(this)
    this.updateValidationRatio()
    if (!ndk) {
      console.trace('relay created without ndk')
    }
  }

  updateValidationRatio () {
    setTimeout(() => {
      this.updateValidationRatio()
    }, 3e4)
  }

  get status () {
    return this.connectivity.status
  }

  get connectionStats () {
    return this.connectivity.connectionStats
  }

  /**
   * Connects to the relay.
   */
  async connect (timeoutMs, reconnect = true) {
    return this.connectivity.connect(timeoutMs, reconnect)
  }

  /**
   * Disconnects from the relay.
   */
  disconnect () {
    if (this.status === 1 /* DISCONNECTED */) {
      return
    }
    this.connectivity.disconnect()
  }

  /**
   * Queues or executes the subscription of a specific set of filters
   * within this relay.
   *
   * @param subscription NDKSubscription this filters belong to.
   * @param filters Filters to execute
   */
  subscribe (subscription, filters) {
    this.subs.addSubscription(subscription, filters)
  }

  /**
   * Publishes an event to the relay with an optional timeout.
   *
   * If the relay is not connected, the event will be published when the relay connects,
   * unless the timeout is reached before the relay connects.
   *
   * @param event The event to publish
   * @param timeoutMs The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish (event, timeoutMs = 2500) {
    return this.publisher.publish(event, timeoutMs)
  }

  referenceTags () {
    return [['r', this.url]]
  }

  addValidatedEvent () {
    this.validatedEventCount++
  }

  addNonValidatedEvent () {
    this.nonValidatedEventCount++
  }

  /**
   * The current validation ratio this relay has achieved.
   */
  get validationRatio () {
    if (this.nonValidatedEventCount === 0) {
      return 1
    }
    return this.validatedEventCount / (this.validatedEventCount + this.nonValidatedEventCount)
  }

  shouldValidateEvent () {
    if (this.trusted) {
      return false
    }
    if (this.targetValidationRatio === void 0) {
      return true
    }
    return this.validationRatio < this.targetValidationRatio
  }

  get connected () {
    return this.connectivity.connected
  }

  req
  close
}

// src/user/follows.ts
async function follows (opts, outbox, kind = 3 /* Contacts */) {
  if (!this.ndk) throw new Error('NDK not set')
  const contactListEvent = await this.ndk.fetchEvent(
    { kinds: [kind], authors: [this.pubkey] },
    opts || { groupable: false }
  )
  if (contactListEvent) {
    const pubkeys = /* @__PURE__ */ new Set()
    contactListEvent.tags.forEach((tag) => {
      if (tag[0] === 'p') pubkeys.add(tag[1])
    })
    if (outbox) {
      this.ndk?.outboxTracker?.trackUsers(Array.from(pubkeys))
    }
    return [...pubkeys].reduce((acc, pubkey) => {
      const user = new NDKUser({ pubkey })
      user.ndk = this.ndk
      acc.add(user)
      return acc
    }, /* @__PURE__ */ new Set())
  }
  return /* @__PURE__ */ new Set()
}

// src/user/profile.ts
function profileFromEvent (event) {
  const profile = {}
  let payload
  try {
    payload = JSON.parse(event.content)
  } catch (error) {
    throw new Error(`Failed to parse profile event: ${error}`)
  }
  profile.created_at = event.created_at
  profile.profileEvent = JSON.stringify(event.rawEvent())
  Object.keys(payload).forEach((key) => {
    switch (key) {
      case 'name':
        profile.name = payload.name
        break
      case 'display_name':
        profile.displayName = payload.display_name
        break
      case 'image':
      case 'picture':
        profile.image = payload.picture || payload.image
        break
      case 'banner':
        profile.banner = payload.banner
        break
      case 'bio':
        profile.bio = payload.bio
        break
      case 'nip05':
        profile.nip05 = payload.nip05
        break
      case 'lud06':
        profile.lud06 = payload.lud06
        break
      case 'lud16':
        profile.lud16 = payload.lud16
        break
      case 'about':
        profile.about = payload.about
        break
      case 'zapService':
        profile.zapService = payload.zapService
        break
      case 'website':
        profile.website = payload.website
        break
      default:
        profile[key] = payload[key]
        break
    }
  })
  return profile
}
function serializeProfile (profile) {
  const payload = {}
  for (const [key, val] of Object.entries(profile)) {
    switch (key) {
      case 'username':
      case 'name':
        payload.name = val
        break
      case 'displayName':
        payload.display_name = val
        break
      case 'image':
      case 'picture':
        payload.picture = val
        break
      case 'bio':
      case 'about':
        payload.about = val
        break
      default:
        payload[key] = val
        break
    }
  }
  return JSON.stringify(payload)
}

// src/user/nip05.ts
const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/
async function getNip05For (ndk, fullname, _fetch = fetch, fetchOpts = {}) {
  return await ndk.queuesNip05.add({
    id: fullname,
    func: async () => {
      if (ndk.cacheAdapter && ndk.cacheAdapter.loadNip05) {
        const profile = await ndk.cacheAdapter.loadNip05(fullname)
        if (profile !== 'missing') {
          if (profile) {
            const user = new NDKUser({
              pubkey: profile.pubkey,
              relayUrls: profile.relays,
              nip46Urls: profile.nip46
            })
            user.ndk = ndk
            return user
          } else if (fetchOpts.cache !== 'no-cache') {
            return null
          }
        }
      }
      const match = fullname.match(NIP05_REGEX)
      if (!match) return null
      const [_, name = '_', domain] = match
      try {
        const res = await _fetch(
          `https://${domain}/.well-known/nostr.json?name=${name}`,
          fetchOpts
        )
        const { names, relays, nip46 } = parseNIP05Result(await res.json())
        const pubkey = names[name.toLowerCase()]
        let profile = null
        if (pubkey) {
          profile = { pubkey, relays: relays?.[pubkey], nip46: nip46?.[pubkey] }
        }
        if (ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
          ndk.cacheAdapter.saveNip05(fullname, profile)
        }
        return profile
      } catch (_e) {
        if (ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
          ndk?.cacheAdapter.saveNip05(fullname, null)
        }
        console.error('Failed to fetch NIP05 for', fullname, _e)
        return null
      }
    }
  })
}
function parseNIP05Result (json) {
  const result = {
    names: {}
  }
  for (const [name, pubkey] of Object.entries(json.names)) {
    if (typeof name === 'string' && typeof pubkey === 'string') {
      result.names[name.toLowerCase()] = pubkey
    }
  }
  if (json.relays) {
    result.relays = {}
    for (const [pubkey, relays] of Object.entries(json.relays)) {
      if (typeof pubkey === 'string' && Array.isArray(relays)) {
        result.relays[pubkey] = relays.filter(
          (relay) => typeof relay === 'string'
        )
      }
    }
  }
  if (json.nip46) {
    result.nip46 = {}
    for (const [pubkey, nip46] of Object.entries(json.nip46)) {
      if (typeof pubkey === 'string' && Array.isArray(nip46)) {
        result.nip46[pubkey] = nip46.filter((relay) => typeof relay === 'string')
      }
    }
  }
  return result
}

// src/events/kinds/nutzap/mint-list.ts
const NDKCashuMintList = class _NDKCashuMintList extends NDKEvent {
  static kind = 10019 /* CashuMintList */
  static kinds = [10019]
  _p2pk
  constructor (ndk, event) {
    super(ndk, event)
    this.kind ??= 10019 /* CashuMintList */
  }

  static from (event) {
    return new _NDKCashuMintList(event.ndk, event)
  }

  set relays (urls) {
    this.tags = this.tags.filter((t) => t[0] !== 'relay')
    for (const url of urls) {
      this.tags.push(['relay', url])
    }
  }

  get relays () {
    const r = []
    for (const tag of this.tags) {
      if (tag[0] === 'relay') {
        r.push(tag[1])
      }
    }
    return r
  }

  set mints (urls) {
    this.tags = this.tags.filter((t) => t[0] !== 'mint')
    for (const url of urls) {
      this.tags.push(['mint', url])
    }
  }

  get mints () {
    const r = []
    for (const tag of this.tags) {
      if (tag[0] === 'mint') {
        r.push(tag[1])
      }
    }
    return Array.from(new Set(r))
  }

  get p2pk () {
    if (this._p2pk) {
      return this._p2pk
    }
    this._p2pk = this.tagValue('pubkey') ?? this.pubkey
    return this._p2pk
  }

  set p2pk (pubkey) {
    this._p2pk = pubkey
    this.removeTag('pubkey')
    if (pubkey) {
      this.tags.push(['pubkey', pubkey])
    }
  }

  get relaySet () {
    return NDKRelaySet.fromRelayUrls(this.relays, this.ndk)
  }
}

// src/user/index.ts
var NDKUser = class _NDKUser {
  ndk
  profile
  profileEvent
  _npub
  _pubkey
  relayUrls = []
  nip46Urls = []
  constructor (opts) {
    if (opts.npub) this._npub = opts.npub
    if (opts.hexpubkey) this._pubkey = opts.hexpubkey
    if (opts.pubkey) this._pubkey = opts.pubkey
    if (opts.relayUrls) this.relayUrls = opts.relayUrls
    if (opts.nip46Urls) this.nip46Urls = opts.nip46Urls
  }

  get npub () {
    if (!this._npub) {
      if (!this._pubkey) throw new Error('pubkey not set')
      this._npub = nip19_exports.npubEncode(this.pubkey)
    }
    return this._npub
  }

  get nprofile () {
    const relays = this.profileEvent?.onRelays?.map((r) => r.url)
    return nip19_exports.nprofileEncode({
      pubkey: this.pubkey,
      relays
    })
  }

  set npub (npub) {
    this._npub = npub
  }

  /**
   * Get the user's pubkey
   * @returns {string} The user's pubkey
   */
  get pubkey () {
    if (!this._pubkey) {
      if (!this._npub) throw new Error('npub not set')
      this._pubkey = nip19_exports.decode(this.npub).data
    }
    return this._pubkey
  }

  /**
   * Set the user's pubkey
   * @param pubkey {string} The user's pubkey
   */
  set pubkey (pubkey) {
    this._pubkey = pubkey
  }

  /**
   * Equivalent to NDKEvent.filters().
   * @returns {NDKFilter}
   */
  filter () {
    return { '#p': [this.pubkey] }
  }

  /**
   * Gets NIP-57 and NIP-61 information that this user has signaled
   *
   * @param getAll {boolean} Whether to get all zap info or just the first one
   */
  async getZapInfo (timeoutMs) {
    if (!this.ndk) throw new Error('No NDK instance found')
    const promiseWithTimeout = async (promise) => {
      if (!timeoutMs) return promise
      try {
        return await Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(), timeoutMs))
        ])
      } catch {
        return void 0
      }
    }
    const [userProfile, mintListEvent] = await Promise.all([
      promiseWithTimeout(this.fetchProfile()),
      promiseWithTimeout(this.ndk.fetchEvent({ kinds: [10019], authors: [this.pubkey] }))
    ])
    const res = /* @__PURE__ */ new Map()
    if (mintListEvent) {
      const mintList = NDKCashuMintList.from(mintListEvent)
      if (mintList.mints.length > 0) {
        res.set('nip61', {
          mints: mintList.mints,
          relays: mintList.relays,
          p2pk: mintList.p2pk
        })
      }
    }
    if (userProfile) {
      const { lud06, lud16 } = userProfile
      res.set('nip57', { lud06, lud16 })
    }
    return res
  }

  /**
   * Instantiate an NDKUser from a NIP-05 string
   * @param nip05Id {string} The user's NIP-05
   * @param ndk {NDK} An NDK instance
   * @param skipCache {boolean} Whether to skip the cache or not
   * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
   */
  static async fromNip05 (nip05Id, ndk, skipCache = false) {
    if (!ndk) throw new Error('No NDK instance found')
    const opts = {}
    if (skipCache) opts.cache = 'no-cache'
    const profile = await getNip05For(ndk, nip05Id, ndk?.httpFetch, opts)
    if (profile) {
      const user = new _NDKUser({
        pubkey: profile.pubkey,
        relayUrls: profile.relays,
        nip46Urls: profile.nip46
      })
      user.ndk = ndk
      return user
    }
  }

  /**
   * Fetch a user's profile
   * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
   * @param storeProfileEvent {boolean} Whether to store the profile event or not
   * @returns User Profile
   */
  async fetchProfile (opts, storeProfileEvent = false) {
    if (!this.ndk) throw new Error('NDK not set')
    if (!this.profile) this.profile = {}
    let setMetadataEvent = null
    if (this.ndk.cacheAdapter && this.ndk.cacheAdapter.fetchProfile && opts?.cacheUsage !== 'ONLY_RELAY' /* ONLY_RELAY */) {
      const profile = await this.ndk.cacheAdapter.fetchProfile(this.pubkey)
      if (profile) {
        this.profile = profile
        return profile
      }
    }
    if (!opts && // if no options have been set
    this.ndk.cacheAdapter && // and we have a cache
    this.ndk.cacheAdapter.locking) {
      setMetadataEvent = await this.ndk.fetchEvent(
        {
          kinds: [0],
          authors: [this.pubkey]
        },
        {
          cacheUsage: 'ONLY_CACHE' /* ONLY_CACHE */,
          closeOnEose: true,
          groupable: false
        }
      )
      opts = {
        cacheUsage: 'ONLY_RELAY' /* ONLY_RELAY */,
        closeOnEose: true,
        groupable: true,
        groupableDelay: 250
      }
    }
    if (!setMetadataEvent) {
      setMetadataEvent = await this.ndk.fetchEvent(
        {
          kinds: [0],
          authors: [this.pubkey]
        },
        opts
      )
    }
    if (!setMetadataEvent) return null
    this.profile = profileFromEvent(setMetadataEvent)
    if (storeProfileEvent) {
      this.profile.profileEvent = JSON.stringify(setMetadataEvent)
    }
    if (this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
      this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile)
    }
    return this.profile
  }

  /**
   * Returns a set of users that this user follows.
   *
   * @deprecated Use followSet instead
   */
  follows = follows.bind(this)
  /**
   * Returns a set of pubkeys that this user follows.
   *
   * @param opts - NDKSubscriptionOptions
   * @param outbox - boolean
   * @param kind - number
   */
  async followSet (opts, outbox, kind = 3 /* Contacts */) {
    const follows2 = await this.follows(opts, outbox, kind)
    return new Set(Array.from(follows2).map((f) => f.pubkey))
  }

  /** @deprecated Use referenceTags instead. */
  /**
   * Get the tag that can be used to reference this user in an event
   * @returns {NDKTag} an NDKTag
   */
  tagReference () {
    return ['p', this.pubkey]
  }

  /**
   * Get the tags that can be used to reference this user in an event
   * @returns {NDKTag[]} an array of NDKTag
   */
  referenceTags (marker) {
    const tag = [['p', this.pubkey]]
    if (!marker) return tag
    tag[0].push('', marker)
    return tag
  }

  /**
   * Publishes the current profile.
   */
  async publish () {
    if (!this.ndk) throw new Error('No NDK instance found')
    if (!this.profile) throw new Error('No profile available')
    this.ndk.assertSigner()
    const event = new NDKEvent(this.ndk, {
      kind: 0,
      content: serializeProfile(this.profile)
    })
    await event.publish()
  }

  /**
   * Add a follow to this user's contact list
   *
   * @param newFollow {NDKUser} The user to follow
   * @param currentFollowList {Set<NDKUser>} The current follow list
   * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
   * @returns {Promise<boolean>} True if the follow was added, false if the follow already exists
   */
  async follow (newFollow, currentFollowList, kind = 3 /* Contacts */) {
    if (!this.ndk) throw new Error('No NDK instance found')
    this.ndk.assertSigner()
    if (!currentFollowList) {
      currentFollowList = await this.follows(void 0, void 0, kind)
    }
    if (currentFollowList.has(newFollow)) {
      return false
    }
    currentFollowList.add(newFollow)
    const event = new NDKEvent(this.ndk, { kind })
    for (const follow of currentFollowList) {
      event.tag(follow)
    }
    await event.publish()
    return true
  }

  /**
   * Remove a follow from this user's contact list
   *
   * @param user {NDKUser} The user to unfollow
   * @param currentFollowList {Set<NDKUser>} The current follow list
   * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
   * @returns The relays were the follow list was published or false if the user wasn't found
   */
  async unfollow (user, currentFollowList, kind = 3 /* Contacts */) {
    if (!this.ndk) throw new Error('No NDK instance found')
    this.ndk.assertSigner()
    if (!currentFollowList) {
      currentFollowList = await this.follows(void 0, void 0, kind)
    }
    const newUserFollowList = /* @__PURE__ */ new Set()
    let foundUser = false
    for (const follow of currentFollowList) {
      if (follow.pubkey !== user.pubkey) {
        newUserFollowList.add(follow)
      } else {
        foundUser = true
      }
    }
    if (!foundUser) return false
    const event = new NDKEvent(this.ndk, { kind })
    for (const follow of newUserFollowList) {
      event.tag(follow)
    }
    return await event.publish()
  }

  /**
   * Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)
   *
   * @param nip05Id The NIP-05 string to validate
   * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's pubkey,
   * False if the NIP-05 is found but doesn't match this user's pubkey,
   * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
   */
  async validateNip05 (nip05Id) {
    if (!this.ndk) throw new Error('No NDK instance found')
    const profilePointer = await getNip05For(this.ndk, nip05Id)
    if (profilePointer === null) return null
    return profilePointer.pubkey === this.pubkey
  }
}

// src/events/kinds/article.ts
const NDKArticle = class _NDKArticle extends NDKEvent {
  static kind = 30023 /* Article */
  static kinds = [30023]
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 30023 /* Article */
  }

  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from (event) {
    return new _NDKArticle(event.ndk, event)
  }

  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title () {
    return this.tagValue('title')
  }

  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title (title) {
    this.removeTag('title')
    if (title) this.tags.push(['title', title])
  }

  /**
   * Getter for the article image.
   *
   * @returns {string | undefined} - The article image if available, otherwise undefined.
   */
  get image () {
    return this.tagValue('image')
  }

  /**
   * Setter for the article image.
   *
   * @param {string | undefined} image - The image to set for the article.
   */
  set image (image) {
    this.removeTag('image')
    if (image) this.tags.push(['image', image])
  }

  get summary () {
    return this.tagValue('summary')
  }

  set summary (summary) {
    this.removeTag('summary')
    if (summary) this.tags.push(['summary', summary])
  }

  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at () {
    const tag = this.tagValue('published_at')
    if (tag) {
      let val = parseInt(tag)
      if (val > 1e12) {
        val = Math.floor(val / 1e3)
      }
      return val
    }
    return void 0
  }

  /**
   * Setter for the article's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
   */
  set published_at (timestamp) {
    this.removeTag('published_at')
    if (timestamp !== void 0) {
      this.tags.push(['published_at', timestamp.toString()])
    }
  }

  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags () {
    super.generateTags()
    if (!this.published_at) {
      this.published_at = this.created_at
    }
    return super.generateTags()
  }

  /**
   * Getter for the article's URL.
   *
   * @returns {string | undefined} - The article's URL if available, otherwise undefined.
   */
  get url () {
    return this.tagValue('url')
  }

  /**
   * Setter for the article's URL.
   *
   * @param {string | undefined} url - The URL to set for the article.
   */
  set url (url) {
    if (url) {
      this.tags.push(['url', url])
    } else {
      this.removeTag('url')
    }
  }
}
const NDKHighlight = class _NDKHighlight extends NDKEvent {
  _article
  static kind = 9802 /* Highlight */
  static kinds = [9802]
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 9802 /* Highlight */
  }

  static from (event) {
    return new _NDKHighlight(event.ndk, event)
  }

  get url () {
    return this.tagValue('r')
  }

  /**
   * Context tag.
   */
  set context (context) {
    if (context === void 0) {
      this.tags = this.tags.filter(([tag, value]) => tag !== 'context')
    } else {
      this.tags = this.tags.filter(([tag, value]) => tag !== 'context')
      this.tags.push(['context', context])
    }
  }

  get context () {
    return this.tags.find(([tag, value]) => tag === 'context')?.[1] ?? void 0
  }

  /**
   * Will return the article URL or NDKEvent if they have already been
   * set (it won't attempt to load remote events)
   */
  get article () {
    return this._article
  }

  /**
   * Article the highlight is coming from.
   *
   * @param article Article URL or NDKEvent.
   */
  set article (article) {
    this._article = article
    if (typeof article === 'string') {
      this.tags.push(['r', article])
    } else {
      this.tag(article)
    }
  }

  getArticleTag () {
    return this.getMatchingTags('a')[0] || this.getMatchingTags('e')[0] || this.getMatchingTags('r')[0]
  }

  async getArticle () {
    if (this._article !== void 0) return this._article
    let taggedBech32
    const articleTag = this.getArticleTag()
    if (!articleTag) return void 0
    switch (articleTag[0]) {
      case 'a':
        const [kind, pubkey, identifier] = articleTag[1].split(':')
        taggedBech32 = nip19_exports.naddrEncode({ kind: parseInt(kind), pubkey, identifier })
        break
      case 'e':
        taggedBech32 = nip19_exports.noteEncode(articleTag[1])
        break
      case 'r':
        this._article = articleTag[1]
        break
    }
    if (taggedBech32) {
      let a = await this.ndk?.fetchEvent(taggedBech32)
      if (a) {
        if (a.kind === 30023 /* Article */) {
          a = NDKArticle.from(a)
        }
        this._article = a
      }
    }
    return this._article
  }
}

// src/utils/imeta.ts
function mapImetaTag (tag) {
  const data = {}
  if (tag.length === 2) {
    const parts = tag[1].split(' ')
    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i]
      const value = parts[i + 1]
      if (key === 'fallback') {
        if (!data.fallback) data.fallback = []
        data.fallback.push(value)
      } else {
        data[key] = value
      }
    }
  }
  for (const val of tag) {
    const parts = val.split(' ')
    const key = parts[0]
    const value = parts.slice(1).join(' ')
    if (key === 'fallback') {
      if (!data.fallback) data.fallback = []
      data.fallback.push(value)
    } else {
      data[key] = value
    }
  }
  return data
}
function imetaTagToTag (imeta) {
  const tag = ['imeta']
  for (const [key, value] of Object.entries(imeta)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        tag.push(key, v)
      }
    } else if (value) {
      tag.push(key, value)
    }
  }
  return tag
}

// src/events/kinds/image.ts
const NDKImage = class _NDKImage extends NDKEvent {
  static kind = 20 /* Image */
  static kinds = [20]
  _imetas
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 20 /* Image */
  }

  /**
   * Creates a NDKImage from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKImage from.
   * @returns NDKImage
   */
  static from (event) {
    return new _NDKImage(event.ndk, event.rawEvent())
  }

  get isValid () {
    return this.imetas.length > 0
  }

  get imetas () {
    if (this._imetas) return this._imetas
    this._imetas = this.tags.filter((tag) => tag[0] === 'imeta').map(mapImetaTag).filter((imeta) => !!imeta.url)
    return this._imetas
  }

  set imetas (tags) {
    this._imetas = tags
    this.tags = this.tags.filter((tag) => tag[0] !== 'imeta')
    this.tags.push(...tags.map(imetaTagToTag))
  }
}
const NDKNutzap = class _NDKNutzap extends NDKEvent {
  debug
  _proofs = []
  static kind = 9321 /* Nutzap */
  static kinds = [_NDKNutzap.kind]
  constructor (ndk, event) {
    super(ndk, event)
    this.kind ??= 9321 /* Nutzap */
    this.debug = ndk?.debug.extend('nutzap') ?? createDebug5('ndk:nutzap')
    if (!this.alt) this.alt = 'This is a nutzap'
  }

  static from (event) {
    const e = new this(event.ndk, event)
    try {
      const proofTags = e.getMatchingTags('proof')
      if (proofTags.length) {
        e._proofs = proofTags.map((tag) => JSON.parse(tag[1]))
      } else {
        e._proofs = JSON.parse(e.content)
      }
    } catch {
      return
    }
    if (!e._proofs || !e._proofs.length) return
    return e
  }

  set comment (comment) {
    this.content = comment ?? ''
  }

  get comment () {
    const c = this.tagValue('comment')
    if (c) return c
    return this.content
  }

  set proofs (proofs) {
    this._proofs = proofs
    this.tags = this.tags.filter((tag) => tag[0] !== 'proof')
    for (const proof of proofs) {
      this.tags.push(['proof', JSON.stringify(proof)])
    }
  }

  get proofs () {
    return this._proofs
  }

  /**
   * Gets the p2pk pubkey that is embedded in the first proof
   */
  get p2pk () {
    const firstProof = this.proofs[0]
    try {
      const secret = JSON.parse(firstProof.secret)
      let payload = {}
      if (typeof secret === 'string') {
        payload = JSON.parse(secret)
        this.debug('stringified payload', firstProof.secret)
      } else if (typeof secret === 'object') {
        payload = secret
      }
      const isP2PKLocked = payload[0] === 'P2PK' && payload[1]?.data
      if (isP2PKLocked) {
        const paddedp2pk = payload[1].data
        const p2pk = paddedp2pk.slice(2)
        if (p2pk) return p2pk
      }
    } catch (e) {
      this.debug('error parsing p2pk pubkey', e, this.proofs[0])
    }
  }

  /**
   * Get the mint where this nutzap proofs exist
   */
  get mint () {
    return this.tagValue('u')
  }

  set mint (value) {
    this.removeTag('u')
    this.tag(['u', value])
  }

  get unit () {
    return this.tagValue('unit') ?? 'sat'
  }

  set unit (value) {
    this.removeTag('unit')
    if (value) this.tag(['unit', value])
  }

  get amount () {
    const amount = this.proofs.reduce((total, proof) => total + proof.amount, 0)
    if (this.unit === 'msat') return amount * 1e3
    return amount
  }

  sender = this.author
  /**
   * Set the target of the nutzap
   * @param target The target of the nutzap (a user or an event)
   */
  set target (target) {
    this.tags = this.tags.filter((t) => t[0] !== 'p')
    if (target instanceof NDKEvent) {
      this.tags.push(target.tagReference())
    }
  }

  set recipientPubkey (pubkey) {
    this.removeTag('p')
    this.tag(['p', pubkey])
  }

  get recipientPubkey () {
    return this.tagValue('p')
  }

  get recipient () {
    const pubkey = this.recipientPubkey
    if (this.ndk) return this.ndk.getUser({ pubkey })
    return new NDKUser({ pubkey })
  }

  async toNostrEvent () {
    if (this.unit === 'msat') {
      this.unit = 'sat'
    }
    this.removeTag('amount')
    this.tags.push(['amount', this.amount.toString()])
    const event = await super.toNostrEvent()
    event.content = this.comment
    return event
  }

  /**
   * Validates that the nutzap conforms to NIP-61
   */
  get isValid () {
    let eTagCount = 0
    let pTagCount = 0
    let mintTagCount = 0
    for (const tag of this.tags) {
      if (tag[0] === 'e') eTagCount++
      if (tag[0] === 'p') pTagCount++
      if (tag[0] === 'u') mintTagCount++
    }
    return (
      // exactly one recipient and mint
      pTagCount === 1 && mintTagCount === 1 && // must have at most one e tag
      eTagCount <= 1 && // must have at least one proof
      this.proofs.length > 0
    )
  }
}

// src/events/kinds/subscriptions/amount.ts
const possibleIntervalFrequencies = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
]
function newAmount (amount, currency, term) {
  return ['amount', amount.toString(), currency, term]
}
function parseTagToSubscriptionAmount (tag) {
  const amount = parseInt(tag[1])
  if (isNaN(amount) || amount === void 0 || amount === null || amount <= 0) return void 0
  const currency = tag[2]
  if (currency === void 0 || currency === '') return void 0
  const term = tag[3]
  if (term === void 0) return void 0
  if (!possibleIntervalFrequencies.includes(term)) return void 0
  return {
    amount,
    currency,
    term
  }
}

// src/events/kinds/subscriptions/tier.ts
const NDKSubscriptionTier = class _NDKSubscriptionTier extends NDKArticle {
  static kind = 37001 /* SubscriptionTier */
  static kinds = [37001]
  constructor (ndk, rawEvent) {
    const k = rawEvent?.kind ?? 37001 /* SubscriptionTier */
    super(ndk, rawEvent)
    this.kind = k
  }

  /**
   * Creates a new NDKSubscriptionTier from an event
   * @param event
   * @returns NDKSubscriptionTier
   */
  static from (event) {
    return new _NDKSubscriptionTier(event.ndk, event)
  }

  /**
   * Returns perks for this tier
   */
  get perks () {
    return this.getMatchingTags('perk').map((tag) => tag[1]).filter((perk) => perk !== void 0)
  }

  /**
   * Adds a perk to this tier
   */
  addPerk (perk) {
    this.tags.push(['perk', perk])
  }

  /**
   * Returns the amount for this tier
   */
  get amounts () {
    return this.getMatchingTags('amount').map((tag) => parseTagToSubscriptionAmount(tag)).filter((a) => a !== void 0)
  }

  /**
   * Adds an amount to this tier
   * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
   * @param currency Currency code. Use msat for millisatoshis
   * @param term One of daily, weekly, monthly, quarterly, yearly
   */
  addAmount (amount, currency, term) {
    this.tags.push(newAmount(amount, currency, term))
  }

  /**
   * Sets a relay where content related to this tier can be found
   * @param relayUrl URL of the relay
   */
  set relayUrl (relayUrl) {
    this.tags.push(['r', relayUrl])
  }

  /**
   * Returns the relay URLs for this tier
   */
  get relayUrls () {
    return this.getMatchingTags('r').map((tag) => tag[1]).filter((relay) => relay !== void 0)
  }

  /**
   * Gets the verifier pubkey for this tier. This is the pubkey that will generate
   * subscription payment receipts
   */
  get verifierPubkey () {
    return this.tagValue('p')
  }

  /**
   * Sets the verifier pubkey for this tier.
   */
  set verifierPubkey (pubkey) {
    this.removeTag('p')
    if (pubkey) this.tags.push(['p', pubkey])
  }

  /**
   * Checks if this tier is valid
   */
  get isValid () {
    return this.title !== void 0 && // Must have a title
    this.amounts.length > 0
  }
}

// src/events/kinds/video.ts
const NDKVideo = class _NDKVideo extends NDKEvent {
  static kind = 34235 /* HorizontalVideo */
  static kinds = [34235 /* HorizontalVideo */, 34236]
  _imetas
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 34235 /* HorizontalVideo */
  }

  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from (event) {
    return new _NDKVideo(event.ndk, event.rawEvent())
  }

  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title () {
    return this.tagValue('title')
  }

  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title (title) {
    this.removeTag('title')
    if (title) this.tags.push(['title', title])
  }

  /**
   * Getter for the article thumbnail.
   *
   * @returns {string | undefined} - The article thumbnail if available, otherwise undefined.
   */
  get thumbnail () {
    let thumbnail
    if (this.imetas && this.imetas.length > 0) {
      thumbnail = this.imetas[0].image?.[0]
    }
    return thumbnail ?? this.tagValue('thumb')
  }

  get imetas () {
    if (this._imetas) return this._imetas
    this._imetas = this.tags.filter((tag) => tag[0] === 'imeta').map(mapImetaTag)
    return this._imetas
  }

  set imetas (tags) {
    this._imetas = tags
    this.tags = this.tags.filter((tag) => tag[0] !== 'imeta')
    this.tags.push(...tags.map(imetaTagToTag))
  }

  get url () {
    if (this.imetas && this.imetas.length > 0) {
      return this.imetas[0].url
    }
    return this.tagValue('url')
  }

  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at () {
    const tag = this.tagValue('published_at')
    if (tag) {
      return parseInt(tag)
    }
    return void 0
  }

  /**
   * Setter for the article's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
   */
  set published_at (timestamp) {
    this.removeTag('published_at')
    if (timestamp !== void 0) {
      this.tags.push(['published_at', timestamp.toString()])
    }
  }

  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags () {
    super.generateTags()
    if (!this.published_at) {
      this.published_at = this.created_at
    }
    return super.generateTags()
  }

  get duration () {
    const tag = this.tagValue('duration')
    if (tag) {
      return parseInt(tag)
    }
    return void 0
  }

  /**
   * Setter for the video's duration
   *
   * @param {number | undefined} duration - The duration to set for the video (in seconds)
   */
  set duration (dur) {
    this.removeTag('duration')
    if (dur !== void 0) {
      this.tags.push(['duration', Math.floor(dur).toString()])
    }
  }
}

// src/events/kinds/wiki.ts
const NDKWiki = class extends NDKArticle {
  static kind = 30818 /* Wiki */
  static kinds = [30818]
}

// src/events/kinds/simple-group/member-list.ts
const NDKSimpleGroupMemberList = class _NDKSimpleGroupMemberList extends NDKEvent {
  relaySet
  memberSet = /* @__PURE__ */ new Set()
  static kind = 39002 /* GroupMembers */
  static kinds = [39002]
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 39002 /* GroupMembers */
    this.memberSet = new Set(this.members)
  }

  static from (event) {
    return new _NDKSimpleGroupMemberList(event.ndk, event)
  }

  get members () {
    return this.getMatchingTags('p').map((tag) => tag[1])
  }

  hasMember (member) {
    return this.memberSet.has(member)
  }

  async publish (relaySet, timeoutMs, requiredRelayCount) {
    relaySet ??= this.relaySet
    return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount)
  }
}

// src/events/kinds/simple-group/metadata.ts
const NDKSimpleGroupMetadata = class _NDKSimpleGroupMetadata extends NDKEvent {
  static kind = 39e3 /* GroupMetadata */
  static kinds = [39e3]
  constructor (ndk, rawEvent) {
    super(ndk, rawEvent)
    this.kind ??= 39e3 /* GroupMetadata */
  }

  static from (event) {
    return new _NDKSimpleGroupMetadata(event.ndk, event)
  }

  get name () {
    return this.tagValue('name')
  }

  get picture () {
    return this.tagValue('picture')
  }

  get about () {
    return this.tagValue('about')
  }

  get scope () {
    if (this.getMatchingTags('public').length > 0) return 'public'
    if (this.getMatchingTags('public').length > 0) return 'private'
  }

  set scope (scope) {
    this.removeTag('public')
    this.removeTag('private')
    if (scope === 'public') {
      this.tags.push(['public', ''])
    } else if (scope === 'private') {
      this.tags.push(['private', ''])
    }
  }

  get access () {
    if (this.getMatchingTags('open').length > 0) return 'open'
    if (this.getMatchingTags('closed').length > 0) return 'closed'
  }

  set access (access) {
    this.removeTag('open')
    this.removeTag('closed')
    if (access === 'open') {
      this.tags.push(['open', ''])
    } else if (access === 'closed') {
      this.tags.push(['closed', ''])
    }
  }
}

// src/events/wrap.ts
const eventWrappingMap = /* @__PURE__ */ new Map();
[
  NDKImage,
  NDKVideo,
  NDKCashuMintList,
  NDKArticle,
  NDKHighlight,
  NDKWiki,
  NDKNutzap,
  NDKSimpleGroupMemberList,
  NDKSimpleGroupMetadata,
  NDKSubscriptionTier
].forEach((klass) => {
  klass.kinds.forEach((kind) => {
    eventWrappingMap.set(kind, klass)
  })
})
createDebug5('ndk:active-user')
createDebug5('ndk:zapper:ln')

// src/zapper/index.ts
createDebug5('ndk:zapper')

function arrayBuffersAreEqual (a, b) {
  return dataViewsAreEqual(new DataView(a), new DataView(b))
}
function dataViewsAreEqual (a, b) {
  if (a.byteLength !== b.byteLength) return false
  for (let i = 0; i < a.byteLength; i++) {
    if (a.getUint8(i) !== b.getUint8(i)) return false
  }
  return true
}

function snapshotContainsAllDeletes (
  newSnapshot,
  oldSnapshot
) {
  // only contains deleteSet
  for (const [client, dsitems1] of oldSnapshot.ds.clients.entries()) {
    const dsitems2 = newSnapshot.ds.clients.get(client) || []
    if (dsitems1.length > dsitems2.length) {
      return false
    }
    for (let i = 0; i < dsitems1.length; i++) {
      const dsitem1 = dsitems1[i]
      const dsitem2 = dsitems2[i]
      if (dsitem1.clock !== dsitem2.clock || dsitem1.len !== dsitem2.len) {
        return false
      }
    }
  }
  return true
}

async function createNostrCRDTRoom (
  ndk,
  label,
  initialLocalState,
  YJS_UPDATE_EVENT_KIND,
  encrypt = (passthrough) => passthrough
) {
  // plagiarized from:
  // https://github.com/YousefED/nostr-crdt/blob/main/packages/nostr-crdt/src/createNostrCRDTRoom.ts
  return new Promise((resolve) => {
    const sub = ndk.subscribe({
      since: Math.floor(Date.now() / 1000) - 1,
      kinds: [YJS_UPDATE_EVENT_KIND]
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event.id)
    })
    const ndkEvent = new NDKEvent(ndk)
    ndkEvent.created_at = Math.floor(Date.now() / 1000)
    ndkEvent.kind = YJS_UPDATE_EVENT_KIND
    ndkEvent.content = toBase64(encrypt(initialLocalState))
    ndkEvent.tags = [['crdt', label]]
    ndk.publish(ndkEvent)
  })
}

const hello = () => console.log('hello from y-ndk.js')

class NostrProvider extends ObservableV2 {
  constructor (
    yjs,
    ydoc,
    nostrRoomCreateEventId,
    ndk,
    publicKey,
    YJS_UPDATE_EVENT_KIND,
    encrypt = (passthrough) => passthrough,
    decrypt = (passthrough) => passthrough
  ) {
    super()
    this.yjs = yjs
    this.ydoc = ydoc
    this.ndk = ndk
    this.nostrRoomCreateEventId = nostrRoomCreateEventId
    this.ydoc.on('update', this.documentUpdateListener)
    this.publicKey = publicKey
    this.YJS_UPDATE_EVENT_KIND = YJS_UPDATE_EVENT_KIND
    this.encrypt = encrypt
    this.decrypt = decrypt
  }

  updateFromEvents (events) {
    let updates = null
    updates = events.map((e) => {
      return this.decrypt(fromBase64(e.content))
    })
    const update = this.yjs.mergeUpdates(updates)
    return update
  }

  publishUpdate (update) {
    const ndkEvent = new NDKEvent(this.ndk)
    ndkEvent.kind = this.YJS_UPDATE_EVENT_KIND
    ndkEvent.created_at = Math.floor(Date.now() / 1000)
    ndkEvent.content = toBase64(this.encrypt(update))
    ndkEvent.tags = [
      ['e', this.nostrRoomCreateEventId]
    ]
    this.ndk.publish(ndkEvent)
  }

  pendingUpdates = []
  sendPendingTimeout

  async documentUpdateListener (update, origin) {
    // https://discuss.yjs.dev/t/how-to-distinguish-which-user-triggered-this-update/2584
    if (origin === this) {
      return
    }
    if (origin?.provider) {
      return
    }
    this?.pendingUpdates.push(update)

    if (this?.sendPendingTimeout) {
      clearTimeout(this.sendPendingTimeout)
    }

    // buffer every 100ms
    if (this === undefined) {
      return
    }
    this.sendPendingTimeout = setTimeout(() => {
      this.publishUpdate(this.yjs.mergeUpdates(this.pendingUpdates))
      this.pendingUpdates = []
    }, 100)
  }

  /**
  * Handles incoming events from nostr
  */
  processIncomingEvents = (events) => {
    const update = this.updateFromEvents(events)
    this.yjs.applyUpdate(this.ydoc, update, this)
  }

  async initialize () {
    try {
      let eoseSeen = false
      const initialEvents = []
      const sub = this.ndk.subscribe([
        {
          ids: [this.nostrRoomCreateEventId],
          kinds: [this.YJS_UPDATE_EVENT_KIND],
          limit: 1,
          since: 0
        },
        {
          '#e': [this.nostrRoomCreateEventId],
          kinds: [this.YJS_UPDATE_EVENT_KIND]
        }
      ])
      sub.on('event', (e) => {
        if (!eoseSeen) {
          initialEvents.push(e)
        } else {
          this.processIncomingEvents([e])
        }
      })
      sub.on('eose', () => {
        eoseSeen = true
        const initialLocalState = this.yjs.encodeStateAsUpdate(this.ydoc)
        const initialLocalStateVector = this.yjs.encodeStateVectorFromUpdate(initialLocalState)
        const deleteSetOnlyUpdate = this.yjs.diffUpdate(
          initialLocalState,
          initialLocalStateVector
        )
        const oldSnapshot = this.yjs.snapshot(this.ydoc)
        // This can fail because of no access to room. Because the room history should always be available,
        // we don't catch this event here
        const update = this.updateFromEvents(initialEvents)
        if (initialEvents.length > 0) {
          this.yjs.applyUpdate(this.ydoc, update, this)
        }

        // this.emit('documentAvailable') <-- this breaks stuff, don't know why, y-nkd seems to work without
        // Next, find if there are local changes that haven't been synced to the server
        const remoteStateVector = this.yjs.encodeStateVectorFromUpdate(update)
        const missingOnWire = this.yjs.diffUpdate(
          initialLocalState,
          remoteStateVector
        )
        // missingOnWire will always contain the entire deleteSet on startup.
        // Unfortunately diffUpdate doesn't work well with deletes. In the if-statement
        // below, we try to detect when missingOnWire only contains the deleteSet, with
        // deletes that already exist on the wire
        if (
          arrayBuffersAreEqual(
            deleteSetOnlyUpdate.buffer,
            missingOnWire.buffer
          )
        ) {
          // TODO: instead of next 3 lines, we can probably get deleteSet directly from 'update'
          const serverDoc = new this.yjs.Doc()
          this.yjs.applyUpdate(serverDoc, update)
          const serverSnapshot = this.yjs.snapshot(serverDoc)
          // TODO: could also compare whether snapshot equal? instead of snapshotContainsAllDeletes?
          if (snapshotContainsAllDeletes(serverSnapshot, oldSnapshot)) {
            // missingOnWire only contains a deleteSet with items that are already in the deleteSet on server
          }
        }
        if (missingOnWire.length > 2) {
          this.publishUpdate(missingOnWire)
        }
      })
    } catch (e) {
      console.error(e)
    }
  }
}

export { NostrProvider, createNostrCRDTRoom, hello }
// # sourceMappingURL=y-ndk.mjs.map
