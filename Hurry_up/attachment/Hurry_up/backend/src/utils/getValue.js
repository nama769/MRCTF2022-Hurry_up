var stringToParts = require('./stringToParts');

var ignoreProperties = ['__proto__', 'constructor', 'prototype'];
var blacklist = ['{', '}', 'function','ook'];

exports.get = function(path, o, special, map) {
    var lookup;

    if ('function' == typeof special) {
        if (special.length < 2) {
            map = special;
            special = undefined;
        } else {
            lookup = special;
            special = undefined;
        }
    }

    map || (map = K);

    var parts = 'string' == typeof path
        ? stringToParts(path)
        : path;

    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }

    var obj = o,
        part;

    for (var i = 0; i < parts.length; ++i) {
        part = parts[i];
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `get()` must be a string or number, got ' + typeof parts[i]);
        }

        if (Array.isArray(obj) && !/^\d+$/.test(part)) {
            // reading a property from the array items
            var paths = parts.slice(i);

            return [].concat(obj).map(function(item) {
                return item
                    ? exports.get(paths, item, special || lookup, map)
                    : map(undefined);
            });
        }

        if (lookup) {
            obj = lookup(obj, part);
        } else {
            var _from = special && obj[special] ? obj[special] : obj;
            obj = _from instanceof Map ?
                _from.get(part) :
                _from[part];
        }

        if (!obj) return map(obj);
    }

    return map(obj);
};


exports.has = function(path, o) {
    var parts = typeof path === 'string' ?
        stringToParts(path) :
        path;

    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }

    var len = parts.length;
    var cur = o;
    for (var i = 0; i < len; ++i) {
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `has()` must be a string or number, got ' + typeof parts[i]);
        }
        if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
            return false;
        }
        cur = cur[parts[i]];
    }

    return true;
};


exports.set = function(path, val, o, special, map, _copying) {
    var lookup;
    if (typeof (val)!=="string"&&JSON.stringify(val) !== '{}') {
        return;
    }

    map || (map = K);

    var parts = 'string' == typeof path
        ? stringToParts(path)
        : path;

    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }

    if (null == o) return;

    for (var i = 0; i < parts.length; ++i) {
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `set()` must be a string or number, got ' + typeof parts[i]);
        }
    }
    obj=o;

    for (var i = 0, len = parts.length - 1; i < len; ++i) {
        part = parts[i];

        if (lookup) {
            obj = lookup(obj, part);
        } else {
            try{
                _to = special && obj[special] ? obj[special] : obj;
                obj = _to instanceof Map ?
                    _to.get(part) :
                    _to[part];
            }catch (e){
                return;
            }
        }
        if (!obj) {
            var pa='';
            for(var x=0;x<i;++x){
                pa+=parts[x]+'.';
            }
            pa+=parts[i];
            exports.set(pa, {},o);
            try{
                _to = special && obj[special] ? obj[special] : obj;
                obj = _to instanceof Map ?
                    _to.get(part) :
                    _to[part];
            }catch (e){
                return;
            }
        };
    }

    part = parts[len];

    if (lookup) {
        lookup(obj, part, map(val));
    } else if (obj instanceof Map) {
        obj.set(part, map(val));
    } else {
        try{
            obj[part] = map(val);
        }catch (e){
        }
    }
};

/*!
 * Returns the value passed to it.
 */

function K(v) {
    return v;
}
