/**
 * _: extend javascript language.
 */
(function() {
    var root = this;
    var afn = Array.prototype,
    ofn = Object.prototype,
    ffn = Function.prototype,
    sfn = String.prototype;
    var slice = afn.slice,
    unshift = afn.unshift,
    toString = ofn.toString,
    hasOwnProperty = ofn.hasOwnProperty;
    var nativeForEach = afn.forEach,
    nativeMap = afn.map,
    nativeReduce = afn.reduce,
    nativeReduceRight = afn.reduceRight,
    nativeFilter = afn.filter,
    nativeEvery = afn.every,
    nativeSome = afn.some,
    nativeIndexOf = afn.indexOf,
    nativeLastIndexOf = afn.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = ffn.bind;
    var _previous = root._;
    var _ = function(obj) {
        return new wrapper(obj);
    };
    root._ = _;
    _.VERSION = _.V = "1.0";
    /**
	 * if you want to break in a loop,return breaker;
	 */
    var breaker = _.BREAKER = {};
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (_.isNumber(obj.length)) {
            for (var i = 0,
            l = obj.length; i < l; i++) {
                if (breaker === iterator.call(context, obj[i], i, obj)) return;
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (breaker === iterator.call(context, obj[key], key, obj)) return;
                }
            }
        }
    };
    _.map = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj,
        function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        },
        context);
        return results;
    };
    _.reduce = function(obj, iterator, memo, context) {
        var initial = memo !== void 0; // void 0 means undefined.
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) {
                iterator = _.bind(iterator, context);
            }
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj,
        function(value, index, list) {
            if (!initial && index === 0) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) {
            throw new TypeError("Reduce on an emply array without a initial value.");
        }
        return memo;
    };
    _.reduceRight = function(obj, iterator, memo, context) {
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
        return _.reduce(obj, iterator, memo, context);
    };
    _.find = function(obj, iterator, context) {
        var result;
        any(obj,
        function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };
    _.filter = _.select = function(obj, iterator, context) {
        var result = [];
        if (obj == null) return result;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj,
        function(value, index, list) {
            if (iterator.call(context, value, index, list)) result[result.length] = value;
        });
        return result;
    };
    _.reject = function(obj, iterator, context) {
        var result = [];
        if (obj == null) return result;
        each(obj,
        function(value, index, list) {
            if (!iterator.call(context, value, index, list)) result[result.length] = value;
        });
        return result;
    };
    _.every = _.all = function(obj, iterator, context) {
        iterator = iterator || _.identity;
        var result = true;
        if (obj == null) return true;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj,
        function(value, index, list) {
            if (! (result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return result;
    };
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator = iterator || _.identity;
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj,
        function(value, index, list) {
            if (result = iterator.call(context, value, index, list)) return breaker;
        });
        return result;
    };
    _.include = _.contains = function(obj, target) {
        return _.indexOf(obj, target) !== -1;
    };
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        return _.map(obj,
        function(value) {
            return (method ? value[method] : value).apply(value, args);
        });
    };
    _.pluck = function(obj, key) {
        return _.map(obj,
        function(value) {
            return value[key];
        });
    };
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
        var result = {
            computed: -Infinity
        };
        each(obj,
        function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
        var result = {
            computed: Infinity
        };
        each(obj,
        function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.sortBy = function(obj, iterator, context) {
        return _.pluck(_.map(obj,
        function(value, index, list) {
            return {
                value: value,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria,
            b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }), 'value');
    };
    _.sortedIndex = function(array, obj, iterator) {
        iterator || (iterator = _.identity);
        var low = 0,
        high = array.length;
        while (low < high) {
            var mid = (low + high) >> 1;
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }
        return low;
    };
    _.toArray = function(iterable) {
        if (!iterable) return [];
        if (iterable.toArray) return iterable.toArray();
        if (_.isArray(iterable)) return iterable;
        if (_.isArguments(iterable)) return slice.call(iterable);
        return _.values(iterable);
    };
    _.size = function(obj) {
        return _.toArray(obj).length;
    };
    _.first = _.head = function(array, n, guard) {
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };
    _.rest = _.tail = function(array, index, guard) {
        return slice.call(array, (index == null) || guard ? 1 : index);
    };
    _.last = function(array) {
        return array[array.length - 1];
    };
    _.compact = function(array) {
        return _.filter(array,
        function(value) {
            return !! value;
        });
    };
    /** 递归调用，将所有对象合并到一个数组* */
    _.flatten = function(array) {
        return _.reduce(array,
        function(memo, value) {
            if (_.isArray(value)) return memo.concat(_.flatten(value));
            memo[memo.length] = value;
            return memo;
        },
        []);
    };
    _.without = function(array) {
        var values = slice.call(arguments, 1);
        return _.filter(array,
        function(value) {
            return ! _.include(values, value);
        });
    };
    /** 删除重复的项* */
    _.uniq = _.unique = function(array, isSorted) {
        return _.reduce(array,
        function(memo, el, i) {
            if (0 == i || (isSorted === true ? _.last(memo) != el: !_.include(memo, el))) memo[memo.length] = el;
            return memo;
        },
        []);
    };
    /**
	 * 生成两个集合的∩交集
	 */
    _.intersect = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array),
        function(item) {
            return _.every(rest,
            function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };
    /**
	 * 将多个集合序号相同的项合在一起[a1,a2],[b1,b2]-->[a1,b1,][a2,b2]
	 */
    _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
        return results;
    };
    _.indexOf = function(array, item, isSorted) {
        if (array == null) return - 1;
        var i, l;
        if (isSorted) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i: -1;
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
        for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
        return - 1;
    };
    _.lastIndexOf = function(array, item) {
        if (array == null) return - 1;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
        var i = array.length;
        while (i--) if (array[i] === item) return i;
        return - 1;
    };
    /** 生成一个递增的整数数组* */
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (idx < len) {
            range[idx++] = start;
            start += step;
        }
        return range;
    };
    // Function Functions
    /**
	 * 将方法的this绑定为指定对象，并设置固定的参数
	 */
    _.bind = function(func, obj) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    };
    /**
	 * 将指定对象的所有方法都绑定给它自身
	 */
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length == 0) funcs = _.functions(obj);
        each(funcs,
        function(f) {
            obj[f] = _.bind(obj[f], obj);
        });
        return obj;
    };
    /**
	 * 使方法的计算值得到缓存
	 */
    _.memoize = function(func, hasher) {
        var memo = {}; // 闭包，存储方法的返回值
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments); // 获取参数的hash值
            return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };
    /** 延迟调用方法，参数为第二个参数之后* */
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(func, args);
        },
        wait);
    };
    /**
	 * 当前调用堆栈结束后立即运行
	 */
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
    // Internal function used to implement `_.throttle` and `_.debounce`.
    var limit = function(func, wait, debounce) {
        var timeout;
        return function() {
            var context = this,
            args = arguments;
            var throttler = function() {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    };

    // Returns a function, that, when invoked, will only be triggered at most
    // once
    // during a given window of time.
    /**
	 * 控制在指定时间内，某方法调用的次数
	 */
    _.throttle = function(func, wait) {
        return limit(func, wait, false);
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds.
    /**
	 * 控制在指定时间之后，某方法才可以调用
	 */
    _.debounce = function(func, wait) {
        return limit(func, wait, true);
    };

    /**
	 * 让一个方法最多只能执行一次，以后执行的结果都同第一次
	 */
    _.once = function(func) {
        var ran = false,
        memo;
        return function() {
            if (ran) return memo;
            ran = true;
            return memo = func.apply(this, arguments);
        };
    };
    /** 包装一个函数* */
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [func].concat(slice.call(arguments));
            return wrapper.apply(this, args);
        };
    };
    /**
	 * 将多个方法组合起来新城新的方法，调用的时候参数需要依次传递
	 */
    _.compose = function() {
        var funcs = slice.call(arguments);
        return function() {
            var args = slice.call(arguments);
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };
    var K = _.K = function() {};
    /**
	 * 供继承使用
	 */
    var ctor = function() {};
    /**
	 * OOP继承
	 */
    _.subClass = _.inherit = function(parent, protoProps, staticProps) {
        var child;
        // The constructor function for the new subclass is either defined by
        // you
        // (the "constructor" property in your `extend` definition), or
        // defaulted
        // by us to simply call `super()`.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() {
                return parent.apply(this, arguments);
            };
        }
        // Inherit class (static) properties from parent.
        _.extend(child, parent);
        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);
        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);
        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;
        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;
        return child;
    };
    // String Functions
    _.trim = function(str) {
        return str.trim ? str.trim() : str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    _.startWith = function(str, pattern) {
        return str.lastIndexOf(pattern, 0) === 0;
    },
    _.endWith = function(str, pattern) {
        var d = str.length - pattern.length;
        return d >= 0 && str.indexOf(pattern, d) === d;
    },
    // Object Functions
    _.keys = nativeKeys ||
    function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
        return keys;
    };
    _.values = function(obj) {
        return _.map(obj, _.identity);
    };
    _.functions = _.methods = function(obj) {
        return _.filter(_.keys(obj),
        function(key) {
            return _.isFunction(obj[key]);
        }).sort();
    };
    _.extend = function(obj) {
        each(slice.call(arguments, 1),
        function(source) {
            for (var prop in source) obj[prop] = source[prop];
        });
        return obj;
    };
    /**
	 * 设置对象的默认值，第一个参数为要设置的对象，后面的hash都是要设置的默认值
	 */
    _.defaults = function(obj) {
        each(slice.call(arguments, 1),
        function(source) {
            for (var prop in source) if (obj[prop] == null) obj[prop] = source[prop];
        });
        return obj;
    };
    _.clone = function(obj) {
        return _.isArray(obj) ? obj.slice() : _.extend({},
        obj);
    };
    /**
	 * 执行某个方法，然后返回本身，主要是用来调试
	 */
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    _.isEqual = function(a, b) {
        if (a === b) return true;
        var atype = typeof(a),
        btype = typeof(b);
        if (atype != btype) return false;
        if (a == b) return true;
        if ((!a && b) || (a && !b)) return false;
        if (a._chain) a = a._wrapped;
        if (b._chain) b = b._wrapped;
        if (a.isEqual) return a.isEqual(b);
        if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
        if (_.isNaN(a) && _.isNaN(b)) return false;
        if (_.isRegExp(a) && _.isRegExp(b)) return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
        if (atype !== 'object') return false;
        if (a.length && (a.length !== b.length)) return false;
        var aKeys = _.keys(a),
        bKeys = _.keys(b);
        if (aKeys.length != bKeys.length) return false;
        for (var key in a) if (! (key in b) || !_.isEqual(a[key], b[key])) return false;
        return true;
    };
    _.isEmpty = function(obj) {
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
        return true;
    };
    /**
	 * 是否是一个Dom对象
	 */
    _.isElement = function(obj) {
        return !! (obj && obj.nodeType == 1);
    };
    _.isArray = nativeIsArray ||
    function(obj) {
        return toString.call(obj) === '[object Array]';
    };
    _.isArguments = function(obj) {
        return !! (obj && hasOwnProperty.call(obj, 'callee'));
    };
    _.isFunction = function(obj) {
        return !! (obj && obj.constructor && obj.call && obj.apply);
    };
    _.isString = function(obj) {
        return !! (obj === '' || (obj && obj.charCodeAt && obj.substr));
    };
    _.isNumber = function(obj) {
        return !! (obj === 0 || (obj && obj.toExponential && obj.toFixed));
    };
    /**
	 * 这里不是判断对象是不是数字，数字的判断用isNumber，这里是判断一个对象是否是它自己
	 */
    _.isNaN = function(obj) {
        return obj !== obj;
    };
    _.isBoolean = function(obj) {
        return obj === true || obj === false;
    };
    _.isDate = function(obj) {
        return !! (obj && obj.getTimezoneOffset && obj.setUTCFullYear);
    };
    _.isRegExp = function(obj) {
        return !! (obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
    };
    _.isNull = function(obj) {
        return obj === null;
    };
    _.isUndefined = function(obj) {
        return obj === void 0;
    };
    _.noConflict = function() {
        root._ = _previous;
        return this;
    };
    _.identity = function(value) {
        return value;
    };
    /**
	 * 多次调用传入的方法
	 */
    _.times = function(n, iterator, context) {
        for (var i = 0; i < n; i++) iterator.call(context, i);
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = idCounter++;
        return prefix ? prefix + id: id;
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g
    };
    _.template = function(str, data) {
        var c = _.templateSettings;
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' + 'with(obj||{}){__p.push(\'' + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(c.interpolate,
        function(match, code) {
            return "'," + code.replace(/\\'/g, "'") + ",'";
        }).replace(c.evaluate || null,
        function(match, code) {
            return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('";
        }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "');}return __p.join('');";
        var func = new Function('obj', tmpl);
        return data ? func(data) : func;
    };

    var wrapper = function(obj) {
        this._wrapped = obj;
    };
    var fn = _.prototype = wrapper.prototype;
    var result = function(obj, chain) {
        return chain ? _(obj).chain() : obj;
    };
    var addToWrapper = function(name, func) {
        fn[name] = function() {
            var args = slice.call(arguments);
            unshift.call(args, this._wrapped);
            return result(func.apply(_, args), this._chain);
        };
    };
    _.mixin = function(obj) {
        each(_.functions(obj),
        function(name) {
            // add function for _ and _.prototype
            addToWrapper(name, _[name] = obj[name]);
        });
    };
    _.mixin(_);
    each(['pop', 'push', 'reverse', 'shift', 'unshift', 'sort', 'splice'],
    function(name) {
        var func = afn[name];
        fn[name] = function() {
            func.apply(this._wrapped, arguments);
            return result(this._wrapped, this._chain);
        };
    });
    each(['concat', 'join', 'slice'],
    function(name) {
        var method = afn[name];
        fn[name] = function() {
            return result(method.apply(this._wrapped, arguments), this._chain);
        };
    });
    /**
	 * after call a method, for example: slice;return wrapper object or native
	 * object;
	 */
    fn.chain = function() {
        this._chain = true;
        return this;
    };
    fn.value = function() {
        return this._wrapped;
    };
})();

/**
 * require('un.js');
 * 
 */
var handlers = [];
var runtimeHandlers = [];
/**
 * 由选项界面更改竞品配置后调用
 */
function updateRuntimeHandlers() {
    runtimeHandlers = [];
    for (var i = 0,
    l = handlers.length; i < l; i++) {
        runtimeHandlers.push(handlers[i]);
        if (handlers[i] == baiduHandler) {
            var competitor = localStorage['competitor'] || '360';
            if (competitor == "360") {
                baiduHandler.setIconAndTitle('so.png', '360搜索');

            } else if (competitor == "google") {
                baiduHandler.setIconAndTitle('google.png', 'Google搜索');
            } else if (competitor == "sogou") {
                baiduHandler.setIconAndTitle('sogou.png', 'Sogou搜索');
            } else {
                baiduHandler.setIconAndTitle('so.png', '360搜索');
            }
        }
    }
}
function findHandler(url) {
    if (url == null || url == '') return null;
    return _.find(runtimeHandlers,
    function(handler) {
        return handler.acceptURL(url);
    });
}
function toArray(obj) {
    if (_.isArray(obj)) return obj;
    return [obj];
}
function Handler() {}
Handler.matchURL = function(url, patterns) {
    patterns = toArray(patterns);
    return _.any(patterns,
    function(pattern) {
        if (typeof pattern === 'string') {
            return url == pattern;
        }
        if (_.isRegExp(pattern)) {
            return url.match(pattern) != null;
        }
        return false;
    });
}
Handler.prototype = {
    /**
	 * patterns canbe arrary or single string|regexp
	 */
    setPattern: function(patterns) {
        this.patterns = toArray(patterns);
    },
    acceptURL: function(url, tab) {
        return Handler.matchURL(url, this.patterns);
    },
    handle: function(url, tab) {
        // todo
    },
    /** what to do when click icon* */
    onClick: function(url, tab) {
        // todo
    }
};

var WebSwitchHandler = _.subClass(Handler, {
    setSwitchPattern: function(p1, p2) {
        this.p1 = toArray(p1);
        this.p2 = toArray(p2);
        this.setPattern(this.p1.concat(this.p2));
        return this;
    },
    setSwitchIcon: function(icon1, icon2) {
        this.icon1 = icon1;
        this.icon2 = icon2;
        return this;
    },
    setSwitchTitle: function(title1, title2) {
        this.title1 = title1;
        this.title2 = title2;
    },
    isFirst: function(url) {
        return Handler.matchURL(url, this.p1);
    },
    handle: function(url, tab) {
        var f = this.isFirst(url);
        chrome.pageAction.setIcon({
            tabId: tab.id,
            path: f ? this.icon2: this.icon1
        });
        chrome.pageAction.setTitle({
            tabId: tab.id,
            title: f ? this.title2: this.title1
        });
        chrome.pageAction.show(tab.id);
    },
    onClick: function(url, tab) {
        var f = this.isFirst(url);
        chrome.tabs.update(tab.id, {
            url: f ? this.p2[0] : this.p1[0]
        });
    }
});

var WebHandler = _.subClass(Handler, {
    setIconAndTitle: function(icon, title) {
        this.icon = icon;
        this.title = title;
    },
    handle: function(url, tab) {
        chrome.pageAction.setIcon({
            tabId: tab.id,
            path: this.icon
        });
        chrome.pageAction.setTitle({
            tabId: tab.id,
            title: this.title
        });
        chrome.pageAction.show(tab.id);
    }
});

//google handler
var gs = /^https?:\/\/www\.google\.com(?:\.\w+)?\/(webhp\?|search\?|#|nwshp\?|imghp\?)?/;
var gsq = /(?:&|\?)q=([^&]+)/;
var googleHandler = new WebHandler();
googleHandler.setPattern([gs]);
googleHandler.setIconAndTitle('baidu.png', '百度一下');
googleHandler.onClick = function(url, tab) {
    word = (e = gsq.exec(url)) ? e[1] : null;
    url = 'http://www.baidu.com/' + (word ? 's?' + 'wd=' + word: '');
    chrome.tabs.update(tab.id, {
        url: url
    });
};
handlers.push(googleHandler);
//baidu handler
var bs = /^http:\/\/www\.baidu\.com(?:\.\w+)?\/(s\?.*)?$/;
var bsq = /(?:&|\?)wd=([^&]+)/;
var baiduHandler = new WebHandler();
baiduHandler.setPattern([bs]);
baiduHandler.setIconAndTitle('so.png', '360搜索');
baiduHandler.onClick = function(url, tab) {
    var competitor = localStorage['competitor'] || '360';
    var e, url, word;
    word = (e = bsq.exec(url)) ? e[1] : null;
    if (competitor == "360") {

        url = 'http://www.so.com/' + (word ? 's?' + 'q=' + word: '');

    } else if (competitor == "google") {
        url = 'https://www.google.com/' + (word ? 'search?' + 'q=' + word: '');

    } else if (competitor == "sogou") {
        url = 'http://www.sogou.com/' + (word ? 'web?' + 'query=' + word: '');

    }
    chrome.tabs.update(tab.id, {
        url: url
    });
};
//360 handler
var ss = /^http?:\/\/www\.so\.com(?:\.\w+)?\/(s\?.*)?$/;
var ssq = /(?:&|\?)q=([^&]+)/;
var soHandler = new WebHandler();
soHandler.setPattern([ss]);
soHandler.setIconAndTitle('baidu.png', '百度一下');
soHandler.onClick = function(url, tab) {
    word = (e = ssq.exec(url)) ? e[1] : null;
    url = 'http://www.baidu.com/' + (word ? 's?' + 'wd=' + word: '');
    chrome.tabs.update(tab.id, {
        url: url
    });
};
handlers.push(soHandler);

//sogou handler
var sgs = /^https?:\/\/www\.sogou\.com(?:\.\w+)?\/(web\?.*)?$/;
var sgsq = /(?:&|\?)query=([^&]+)/;
var sogouHandler = new WebHandler();
sogouHandler.setPattern([sgs]);
sogouHandler.setIconAndTitle('baidu.png', '百度一下');
sogouHandler.onClick = function(url, tab) {
    word = (e = sgsq.exec(url)) ? e[1] : null;
    url = 'http://www.baidu.com/' + (word ? 's?' + 'wd=' + word: '');
    chrome.tabs.update(tab.id, {
        url: url
    });
};
handlers.push(sogouHandler);

function getTask(tabid, url_pre, q) {
    var finished = false;
    var task = function(kw) {
        if (finished) return;
        var url = url_pre + (kw || q);
        chrome.tabs.update(tabid, {
            url: url
        });
        finished = true;
    }
    window.setTimeout(task, 50);
    return task;
}

handlers.push(baiduHandler);
updateRuntimeHandlers();

function updateAddress(tabId, loading) {
    chrome.tabs.get(tabId,
    function(tab) {
        var url = tab.url;
        var handler = findHandler(url);
        if (handler) {
            handler.handle(url, tab);
        } else {
            chrome.pageAction.hide(tab.id);
        }

    });

}

chrome.tabs.onUpdated.addListener(function(tabId, change) {
    if (change.status == "loading") {
        updateAddress(tabId, true);
    }
});
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    updateAddress(tabId, false);
});
// Ensure the current selected tab is set up.
chrome.tabs.getSelected(null,function(tab) {
	updateAddress(tab.id, false);
});
chrome.pageAction.onClicked.addListener(function(tab) {
    switchOnTab(tab);
});
function switchOnTab(tab) {
    var url = tab.url;
    var handler = findHandler(url);
    if (handler) {
        handler.onClick(url, tab);
    }
}
