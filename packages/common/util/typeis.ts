export function isArray (arg: any) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}

export function isBoolean (arg: any) {
  return typeof arg === 'boolean';
}

export function isNull (arg: any) {
  return arg === null;
}

export function isNullOrUndefined (arg: any) {
  return arg == null;
}

export function isNumber (arg: any) {
  return typeof arg === 'number';
}

export function isString (arg: any) {
  return typeof arg === 'string';
}

export function isSymbol (arg: any) {
  return typeof arg === 'symbol';
}

export function isUndefined (arg: any) {
  return arg === undefined;
}

export function isRegExp (re: any) {
  return objectToString(re) === '[object RegExp]';
}

export function isObject (arg: any) {
  return typeof arg === 'object' && arg !== null && !isArray(arg);
}

export function isDate (d: any) {
  return objectToString(d) === '[object Date]';
}

export function isError (e: any) {
  return objectToString(e) === '[object Error]' || e instanceof Error;
}

export function isFunction (arg: any) {
  return typeof arg === 'function';
}

export function isPrimitive (arg: any) {
  return (
    arg === null ||
    typeof arg === 'boolean' ||
    typeof arg === 'number' ||
    typeof arg === 'string' ||
    typeof arg === 'symbol' || // ES6 symbol
    typeof arg === 'undefined'
  );
}

function objectToString (o: any) {
  return Object.prototype.toString.call(o);
}
