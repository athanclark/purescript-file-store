(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
(function (Buffer){
// Written in 2014-2016 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
(function(root, f) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = f();
  else if (root.nacl) root.nacl.util = f();
  else {
    root.nacl = {};
    root.nacl.util = f();
  }
}(this, function() {
  'use strict';

  var util = {};

  function validateBase64(s) {
    if (!(/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s))) {
      throw new TypeError('invalid encoding');
    }
  }

  util.decodeUTF8 = function(s) {
    if (typeof s !== 'string') throw new TypeError('expected string');
    var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
    for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
    return b;
  };

  util.encodeUTF8 = function(arr) {
    var i, s = [];
    for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
    return decodeURIComponent(escape(s.join('')));
  };

  if (typeof atob === 'undefined') {
    // Node.js

    if (typeof Buffer.from !== 'undefined') {
       // Node v6 and later
      util.encodeBase64 = function (arr) { // v6 and later
          return Buffer.from(arr).toString('base64');
      };

      util.decodeBase64 = function (s) {
        validateBase64(s);
        return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, 'base64'), 0));
      };

    } else {
      // Node earlier than v6
      util.encodeBase64 = function (arr) { // v6 and later
        return (new Buffer(arr)).toString('base64');
      };

      util.decodeBase64 = function(s) {
        validateBase64(s);
        return new Uint8Array(Array.prototype.slice.call(new Buffer(s, 'base64'), 0));
      };
    }

  } else {
    // Browsers

    util.encodeBase64 = function(arr) {
      var i, s = [], len = arr.length;
      for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
      return btoa(s.join(''));
    };

    util.decodeBase64 = function(s) {
      validateBase64(s);
      var i, d = atob(s), b = new Uint8Array(d.length);
      for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
      return b;
    };

  }

  return util;

}));

}).call(this,require("buffer").Buffer)
},{"buffer":1}],5:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Functor = require("../Data.Functor/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Alt = function (Functor0, alt) {
    this.Functor0 = Functor0;
    this.alt = alt;
};
var altArray = new Alt(function () {
    return Data_Functor.functorArray;
}, Data_Semigroup.append(Data_Semigroup.semigroupArray));
var alt = function (dict) {
    return dict.alt;
};
module.exports = {
    Alt: Alt,
    alt: alt,
    altArray: altArray
};

},{"../Data.Functor/index.js":80,"../Data.Semigroup/index.js":113}],6:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Alternative = function (Applicative0, Plus1) {
    this.Applicative0 = Applicative0;
    this.Plus1 = Plus1;
};
var alternativeArray = new Alternative(function () {
    return Control_Applicative.applicativeArray;
}, function () {
    return Control_Plus.plusArray;
});
module.exports = {
    Alternative: Alternative,
    alternativeArray: alternativeArray
};

},{"../Control.Applicative/index.js":7,"../Control.Plus/index.js":38}],7:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Apply = require("../Control.Apply/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Applicative = function (Apply0, pure) {
    this.Apply0 = Apply0;
    this.pure = pure;
};
var pure = function (dict) {
    return dict.pure;
};
var unless = function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (!v) {
                return v1;
            };
            if (v) {
                return pure(dictApplicative)(Data_Unit.unit);
            };
            throw new Error("Failed pattern match at Control.Applicative (line 62, column 1 - line 62, column 65): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
var when = function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v) {
                return v1;
            };
            if (!v) {
                return pure(dictApplicative)(Data_Unit.unit);
            };
            throw new Error("Failed pattern match at Control.Applicative (line 57, column 1 - line 57, column 63): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
var liftA1 = function (dictApplicative) {
    return function (f) {
        return function (a) {
            return Control_Apply.apply(dictApplicative.Apply0())(pure(dictApplicative)(f))(a);
        };
    };
};
var applicativeFn = new Applicative(function () {
    return Control_Apply.applyFn;
}, function (x) {
    return function (v) {
        return x;
    };
});
var applicativeArray = new Applicative(function () {
    return Control_Apply.applyArray;
}, function (x) {
    return [ x ];
});
module.exports = {
    Applicative: Applicative,
    pure: pure,
    liftA1: liftA1,
    unless: unless,
    when: when,
    applicativeFn: applicativeFn,
    applicativeArray: applicativeArray
};

},{"../Control.Apply/index.js":9,"../Data.Unit/index.js":132}],8:[function(require,module,exports){
"use strict";

exports.arrayApply = function (fs) {
  return function (xs) {
    var l = fs.length;
    var k = xs.length;
    var result = new Array(l*k);
    var n = 0;
    for (var i = 0; i < l; i++) {
      var f = fs[i];
      for (var j = 0; j < k; j++) {
        result[n++] = f(xs[j]);
      }
    }
    return result;
  };
};

},{}],9:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Apply = function (Functor0, apply) {
    this.Functor0 = Functor0;
    this.apply = apply;
};
var applyFn = new Apply(function () {
    return Data_Functor.functorFn;
}, function (f) {
    return function (g) {
        return function (x) {
            return f(x)(g(x));
        };
    };
});
var applyArray = new Apply(function () {
    return Data_Functor.functorArray;
}, $foreign.arrayApply);
var apply = function (dict) {
    return dict.apply;
};
var applyFirst = function (dictApply) {
    return function (a) {
        return function (b) {
            return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"])(a))(b);
        };
    };
};
var applySecond = function (dictApply) {
    return function (a) {
        return function (b) {
            return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"](Control_Category.identity(Control_Category.categoryFn)))(a))(b);
        };
    };
};
var lift2 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b);
            };
        };
    };
};
var lift3 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c);
                };
            };
        };
    };
};
var lift4 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return apply(dictApply)(apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c))(d);
                    };
                };
            };
        };
    };
};
var lift5 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return function (e) {
                            return apply(dictApply)(apply(dictApply)(apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c))(d))(e);
                        };
                    };
                };
            };
        };
    };
};
module.exports = {
    Apply: Apply,
    apply: apply,
    applyFirst: applyFirst,
    applySecond: applySecond,
    lift2: lift2,
    lift3: lift3,
    lift4: lift4,
    lift5: lift5,
    applyFn: applyFn,
    applyArray: applyArray
};

},{"../Control.Category/index.js":14,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"./foreign.js":8}],10:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Biapplicative = function (Biapply0, bipure) {
    this.Biapply0 = Biapply0;
    this.bipure = bipure;
};
var bipure = function (dict) {
    return dict.bipure;
};
module.exports = {
    bipure: bipure,
    Biapplicative: Biapplicative
};

},{}],11:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Function = require("../Data.Function/index.js");
var Biapply = function (Bifunctor0, biapply) {
    this.Bifunctor0 = Bifunctor0;
    this.biapply = biapply;
};
var biapply = function (dict) {
    return dict.biapply;
};
var biapplyFirst = function (dictBiapply) {
    return function (a) {
        return function (b) {
            return biapply(dictBiapply)(Control_Category.identity(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(Data_Function["const"](Control_Category.identity(Control_Category.categoryFn)))(Data_Function["const"](Control_Category.identity(Control_Category.categoryFn))))(a))(b);
        };
    };
};
var biapplySecond = function (dictBiapply) {
    return function (a) {
        return function (b) {
            return biapply(dictBiapply)(Control_Category.identity(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(Data_Function["const"])(Data_Function["const"]))(a))(b);
        };
    };
};
var bilift2 = function (dictBiapply) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return biapply(dictBiapply)(Control_Category.identity(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(f)(g))(a))(b);
                };
            };
        };
    };
};
var bilift3 = function (dictBiapply) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return function (c) {
                        return biapply(dictBiapply)(biapply(dictBiapply)(Control_Category.identity(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(f)(g))(a))(b))(c);
                    };
                };
            };
        };
    };
};
module.exports = {
    biapply: biapply,
    Biapply: Biapply,
    biapplyFirst: biapplyFirst,
    biapplySecond: biapplySecond,
    bilift2: bilift2,
    bilift3: bilift3
};

},{"../Control.Category/index.js":14,"../Data.Bifunctor/index.js":56,"../Data.Function/index.js":75}],12:[function(require,module,exports){
"use strict";

exports.arrayBind = function (arr) {
  return function (f) {
    var result = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      Array.prototype.push.apply(result, f(arr[i]));
    }
    return result;
  };
};

},{}],13:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Function = require("../Data.Function/index.js");
var Discard = function (discard) {
    this.discard = discard;
};
var Bind = function (Apply0, bind) {
    this.Apply0 = Apply0;
    this.bind = bind;
};
var discard = function (dict) {
    return dict.discard;
};
var bindFn = new Bind(function () {
    return Control_Apply.applyFn;
}, function (m) {
    return function (f) {
        return function (x) {
            return f(m(x))(x);
        };
    };
});
var bindArray = new Bind(function () {
    return Control_Apply.applyArray;
}, $foreign.arrayBind);
var bind = function (dict) {
    return dict.bind;
};
var bindFlipped = function (dictBind) {
    return Data_Function.flip(bind(dictBind));
};
var composeKleisliFlipped = function (dictBind) {
    return function (f) {
        return function (g) {
            return function (a) {
                return bindFlipped(dictBind)(f)(g(a));
            };
        };
    };
};
var composeKleisli = function (dictBind) {
    return function (f) {
        return function (g) {
            return function (a) {
                return bind(dictBind)(f(a))(g);
            };
        };
    };
};
var discardUnit = new Discard(function (dictBind) {
    return bind(dictBind);
});
var ifM = function (dictBind) {
    return function (cond) {
        return function (t) {
            return function (f) {
                return bind(dictBind)(cond)(function (cond$prime) {
                    if (cond$prime) {
                        return t;
                    };
                    return f;
                });
            };
        };
    };
};
var join = function (dictBind) {
    return function (m) {
        return bind(dictBind)(m)(Control_Category.identity(Control_Category.categoryFn));
    };
};
module.exports = {
    Bind: Bind,
    bind: bind,
    bindFlipped: bindFlipped,
    Discard: Discard,
    discard: discard,
    join: join,
    composeKleisli: composeKleisli,
    composeKleisliFlipped: composeKleisliFlipped,
    ifM: ifM,
    bindFn: bindFn,
    bindArray: bindArray,
    discardUnit: discardUnit
};

},{"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Data.Function/index.js":75,"./foreign.js":12}],14:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Category = function (Semigroupoid0, identity) {
    this.Semigroupoid0 = Semigroupoid0;
    this.identity = identity;
};
var identity = function (dict) {
    return dict.identity;
};
var categoryFn = new Category(function () {
    return Control_Semigroupoid.semigroupoidFn;
}, function (x) {
    return x;
});
module.exports = {
    Category: Category,
    identity: identity,
    categoryFn: categoryFn
};

},{"../Control.Semigroupoid/index.js":39}],15:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Comonad = function (Extend0, extract) {
    this.Extend0 = Extend0;
    this.extract = extract;
};
var extract = function (dict) {
    return dict.extract;
};
module.exports = {
    Comonad: Comonad,
    extract: extract
};

},{}],16:[function(require,module,exports){
"use strict";

exports.arrayExtend = function(f) {
  return function(xs) {
    return xs.map(function (_, i, xs) {
      return f(xs.slice(i));
    });
  };
};

},{}],17:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Extend = function (Functor0, extend) {
    this.Functor0 = Functor0;
    this.extend = extend;
};
var extendFn = function (dictSemigroup) {
    return new Extend(function () {
        return Data_Functor.functorFn;
    }, function (f) {
        return function (g) {
            return function (w) {
                return f(function (w$prime) {
                    return g(Data_Semigroup.append(dictSemigroup)(w)(w$prime));
                });
            };
        };
    });
};
var extendArray = new Extend(function () {
    return Data_Functor.functorArray;
}, $foreign.arrayExtend);
var extend = function (dict) {
    return dict.extend;
};
var extendFlipped = function (dictExtend) {
    return function (w) {
        return function (f) {
            return extend(dictExtend)(f)(w);
        };
    };
};
var duplicate = function (dictExtend) {
    return extend(dictExtend)(Control_Category.identity(Control_Category.categoryFn));
};
var composeCoKleisliFlipped = function (dictExtend) {
    return function (f) {
        return function (g) {
            return function (w) {
                return f(extend(dictExtend)(g)(w));
            };
        };
    };
};
var composeCoKleisli = function (dictExtend) {
    return function (f) {
        return function (g) {
            return function (w) {
                return g(extend(dictExtend)(f)(w));
            };
        };
    };
};
module.exports = {
    Extend: Extend,
    extend: extend,
    extendFlipped: extendFlipped,
    composeCoKleisli: composeCoKleisli,
    composeCoKleisliFlipped: composeCoKleisliFlipped,
    duplicate: duplicate,
    extendFn: extendFn,
    extendArray: extendArray
};

},{"../Control.Category/index.js":14,"../Data.Functor/index.js":80,"../Data.Semigroup/index.js":113,"./foreign.js":16}],18:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Unit = require("../Data.Unit/index.js");
var Lazy = function (defer) {
    this.defer = defer;
};
var lazyUnit = new Lazy(function (v) {
    return Data_Unit.unit;
});
var lazyFn = new Lazy(function (f) {
    return function (x) {
        return f(Data_Unit.unit)(x);
    };
});
var defer = function (dict) {
    return dict.defer;
};
var fix = function (dictLazy) {
    return function (f) {
        var go = defer(dictLazy)(function (v) {
            return f(go);
        });
        return go;
    };
};
module.exports = {
    defer: defer,
    Lazy: Lazy,
    fix: fix,
    lazyFn: lazyFn,
    lazyUnit: lazyUnit
};

},{"../Data.Unit/index.js":132}],19:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var MonadCont = function (Monad0, callCC) {
    this.Monad0 = Monad0;
    this.callCC = callCC;
};
var callCC = function (dict) {
    return dict.callCC;
};
module.exports = {
    MonadCont: MonadCont,
    callCC: callCC
};

},{}],20:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var ContT = function (x) {
    return x;
};
var withContT = function (f) {
    return function (v) {
        return function (k) {
            return v(f(k));
        };
    };
};
var runContT = function (v) {
    return function (k) {
        return v(k);
    };
};
var newtypeContT = new Data_Newtype.Newtype(function (n) {
    return n;
}, ContT);
var monadTransContT = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    return function (m) {
        return function (k) {
            return Control_Bind.bind(dictMonad.Bind1())(m)(k);
        };
    };
});
var mapContT = function (f) {
    return function (v) {
        return function (k) {
            return f(v(k));
        };
    };
};
var functorContT = function (dictFunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return function (k) {
                return v(function (a) {
                    return k(f(a));
                });
            };
        };
    });
};
var applyContT = function (dictApply) {
    return new Control_Apply.Apply(function () {
        return functorContT(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return function (k) {
                return v(function (g) {
                    return v1(function (a) {
                        return k(g(a));
                    });
                });
            };
        };
    });
};
var bindContT = function (dictBind) {
    return new Control_Bind.Bind(function () {
        return applyContT(dictBind.Apply0());
    }, function (v) {
        return function (k) {
            return function (k$prime) {
                return v(function (a) {
                    var v1 = k(a);
                    return v1(k$prime);
                });
            };
        };
    });
};
var applicativeContT = function (dictApplicative) {
    return new Control_Applicative.Applicative(function () {
        return applyContT(dictApplicative.Apply0());
    }, function (a) {
        return function (k) {
            return k(a);
        };
    });
};
var monadContT = function (dictMonad) {
    return new Control_Monad.Monad(function () {
        return applicativeContT(dictMonad.Applicative0());
    }, function () {
        return bindContT(dictMonad.Bind1());
    });
};
var monadAskContT = function (dictMonadAsk) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
        return monadContT(dictMonadAsk.Monad0());
    }, Control_Monad_Trans_Class.lift(monadTransContT)(dictMonadAsk.Monad0())(Control_Monad_Reader_Class.ask(dictMonadAsk)));
};
var monadReaderContT = function (dictMonadReader) {
    return new Control_Monad_Reader_Class.MonadReader(function () {
        return monadAskContT(dictMonadReader.MonadAsk0());
    }, function (f) {
        return function (v) {
            return function (k) {
                return Control_Bind.bind(((dictMonadReader.MonadAsk0()).Monad0()).Bind1())(Control_Monad_Reader_Class.ask(dictMonadReader.MonadAsk0()))(function (v1) {
                    return Control_Monad_Reader_Class.local(dictMonadReader)(f)(v((function () {
                        var $45 = Control_Monad_Reader_Class.local(dictMonadReader)(Data_Function["const"](v1));
                        return function ($46) {
                            return $45(k($46));
                        };
                    })()));
                });
            };
        };
    });
};
var monadContContT = function (dictMonad) {
    return new Control_Monad_Cont_Class.MonadCont(function () {
        return monadContT(dictMonad);
    }, function (f) {
        return function (k) {
            var v = f(function (a) {
                return function (v1) {
                    return k(a);
                };
            });
            return v(k);
        };
    });
};
var monadEffectContT = function (dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
        return monadContT(dictMonadEffect.Monad0());
    }, (function () {
        var $47 = Control_Monad_Trans_Class.lift(monadTransContT)(dictMonadEffect.Monad0());
        var $48 = Effect_Class.liftEffect(dictMonadEffect);
        return function ($49) {
            return $47($48($49));
        };
    })());
};
var monadStateContT = function (dictMonadState) {
    return new Control_Monad_State_Class.MonadState(function () {
        return monadContT(dictMonadState.Monad0());
    }, (function () {
        var $50 = Control_Monad_Trans_Class.lift(monadTransContT)(dictMonadState.Monad0());
        var $51 = Control_Monad_State_Class.state(dictMonadState);
        return function ($52) {
            return $50($51($52));
        };
    })());
};
module.exports = {
    ContT: ContT,
    runContT: runContT,
    mapContT: mapContT,
    withContT: withContT,
    newtypeContT: newtypeContT,
    monadContContT: monadContContT,
    functorContT: functorContT,
    applyContT: applyContT,
    applicativeContT: applicativeContT,
    bindContT: bindContT,
    monadContT: monadContT,
    monadTransContT: monadTransContT,
    monadEffectContT: monadEffectContT,
    monadAskContT: monadAskContT,
    monadReaderContT: monadReaderContT,
    monadStateContT: monadStateContT
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Cont.Class/index.js":19,"../Control.Monad.Reader.Class/index.js":24,"../Control.Monad.State.Class/index.js":29,"../Control.Monad.Trans.Class/index.js":30,"../Control.Monad/index.js":33,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Effect.Class/index.js":136}],21:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect = require("../Effect/index.js");
var Effect_Exception = require("../Effect.Exception/index.js");
var MonadThrow = function (Monad0, throwError) {
    this.Monad0 = Monad0;
    this.throwError = throwError;
};
var MonadError = function (MonadThrow0, catchError) {
    this.MonadThrow0 = MonadThrow0;
    this.catchError = catchError;
};
var throwError = function (dict) {
    return dict.throwError;
};
var monadThrowMaybe = new MonadThrow(function () {
    return Data_Maybe.monadMaybe;
}, Data_Function["const"](Data_Maybe.Nothing.value));
var monadThrowEither = new MonadThrow(function () {
    return Data_Either.monadEither;
}, Data_Either.Left.create);
var monadThrowEffect = new MonadThrow(function () {
    return Effect.monadEffect;
}, Effect_Exception.throwException);
var monadErrorMaybe = new MonadError(function () {
    return monadThrowMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Data_Maybe.Nothing) {
            return v1(Data_Unit.unit);
        };
        if (v instanceof Data_Maybe.Just) {
            return new Data_Maybe.Just(v.value0);
        };
        throw new Error("Failed pattern match at Control.Monad.Error.Class (line 79, column 1 - line 81, column 33): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var monadErrorEither = new MonadError(function () {
    return monadThrowEither;
}, function (v) {
    return function (v1) {
        if (v instanceof Data_Either.Left) {
            return v1(v.value0);
        };
        if (v instanceof Data_Either.Right) {
            return new Data_Either.Right(v.value0);
        };
        throw new Error("Failed pattern match at Control.Monad.Error.Class (line 72, column 1 - line 74, column 35): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var monadErrorEffect = new MonadError(function () {
    return monadThrowEffect;
}, Data_Function.flip(Effect_Exception.catchException));
var catchError = function (dict) {
    return dict.catchError;
};
var catchJust = function (dictMonadError) {
    return function (p) {
        return function (act) {
            return function (handler) {
                var handle = function (e) {
                    var v = p(e);
                    if (v instanceof Data_Maybe.Nothing) {
                        return throwError(dictMonadError.MonadThrow0())(e);
                    };
                    if (v instanceof Data_Maybe.Just) {
                        return handler(v.value0);
                    };
                    throw new Error("Failed pattern match at Control.Monad.Error.Class (line 57, column 5 - line 59, column 26): " + [ v.constructor.name ]);
                };
                return catchError(dictMonadError)(act)(handle);
            };
        };
    };
};
var $$try = function (dictMonadError) {
    return function (a) {
        return catchError(dictMonadError)(Data_Functor.map(((((dictMonadError.MonadThrow0()).Monad0()).Bind1()).Apply0()).Functor0())(Data_Either.Right.create)(a))((function () {
            var $21 = Control_Applicative.pure(((dictMonadError.MonadThrow0()).Monad0()).Applicative0());
            return function ($22) {
                return $21(Data_Either.Left.create($22));
            };
        })());
    };
};
var withResource = function (dictMonadError) {
    return function (acquire) {
        return function (release) {
            return function (kleisli) {
                return Control_Bind.bind(((dictMonadError.MonadThrow0()).Monad0()).Bind1())(acquire)(function (v) {
                    return Control_Bind.bind(((dictMonadError.MonadThrow0()).Monad0()).Bind1())($$try(dictMonadError)(kleisli(v)))(function (v1) {
                        return Control_Bind.discard(Control_Bind.discardUnit)(((dictMonadError.MonadThrow0()).Monad0()).Bind1())(release(v))(function () {
                            return Data_Either.either(throwError(dictMonadError.MonadThrow0()))(Control_Applicative.pure(((dictMonadError.MonadThrow0()).Monad0()).Applicative0()))(v1);
                        });
                    });
                });
            };
        };
    };
};
module.exports = {
    catchError: catchError,
    throwError: throwError,
    MonadThrow: MonadThrow,
    MonadError: MonadError,
    catchJust: catchJust,
    "try": $$try,
    withResource: withResource,
    monadThrowEither: monadThrowEither,
    monadErrorEither: monadErrorEither,
    monadThrowMaybe: monadThrowMaybe,
    monadErrorMaybe: monadErrorMaybe,
    monadThrowEffect: monadThrowEffect,
    monadErrorEffect: monadErrorEffect
};

},{"../Control.Applicative/index.js":7,"../Control.Bind/index.js":13,"../Data.Either/index.js":65,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Unit/index.js":132,"../Effect.Exception/index.js":140,"../Effect/index.js":152}],22:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Control_Monad_Writer_Class = require("../Control.Monad.Writer.Class/index.js");
var Control_MonadPlus = require("../Control.MonadPlus/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var ExceptT = function (x) {
    return x;
};
var withExceptT = function (dictFunctor) {
    return function (f) {
        return function (v) {
            var mapLeft = function (v1) {
                return function (v2) {
                    if (v2 instanceof Data_Either.Right) {
                        return new Data_Either.Right(v2.value0);
                    };
                    if (v2 instanceof Data_Either.Left) {
                        return new Data_Either.Left(v1(v2.value0));
                    };
                    throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 42, column 3 - line 42, column 32): " + [ v1.constructor.name, v2.constructor.name ]);
                };
            };
            return ExceptT(Data_Functor.map(dictFunctor)(mapLeft(f))(v));
        };
    };
};
var runExceptT = function (v) {
    return v;
};
var newtypeExceptT = new Data_Newtype.Newtype(function (n) {
    return n;
}, ExceptT);
var monadTransExceptT = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    return function (m) {
        return Control_Bind.bind(dictMonad.Bind1())(m)(function (v) {
            return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Right(v));
        });
    };
});
var mapExceptT = function (f) {
    return function (v) {
        return f(v);
    };
};
var functorExceptT = function (dictFunctor) {
    return new Data_Functor.Functor(function (f) {
        return mapExceptT(Data_Functor.map(dictFunctor)(Data_Functor.map(Data_Either.functorEither)(f)));
    });
};
var except = function (dictApplicative) {
    var $96 = Control_Applicative.pure(dictApplicative);
    return function ($97) {
        return ExceptT($96($97));
    };
};
var monadExceptT = function (dictMonad) {
    return new Control_Monad.Monad(function () {
        return applicativeExceptT(dictMonad);
    }, function () {
        return bindExceptT(dictMonad);
    });
};
var bindExceptT = function (dictMonad) {
    return new Control_Bind.Bind(function () {
        return applyExceptT(dictMonad);
    }, function (v) {
        return function (k) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(Data_Either.either((function () {
                var $98 = Control_Applicative.pure(dictMonad.Applicative0());
                return function ($99) {
                    return $98(Data_Either.Left.create($99));
                };
            })())(function (a) {
                var v1 = k(a);
                return v1;
            }));
        };
    });
};
var applyExceptT = function (dictMonad) {
    return new Control_Apply.Apply(function () {
        return functorExceptT(((dictMonad.Bind1()).Apply0()).Functor0());
    }, Control_Monad.ap(monadExceptT(dictMonad)));
};
var applicativeExceptT = function (dictMonad) {
    return new Control_Applicative.Applicative(function () {
        return applyExceptT(dictMonad);
    }, (function () {
        var $100 = Control_Applicative.pure(dictMonad.Applicative0());
        return function ($101) {
            return ExceptT($100(Data_Either.Right.create($101)));
        };
    })());
};
var monadAskExceptT = function (dictMonadAsk) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
        return monadExceptT(dictMonadAsk.Monad0());
    }, Control_Monad_Trans_Class.lift(monadTransExceptT)(dictMonadAsk.Monad0())(Control_Monad_Reader_Class.ask(dictMonadAsk)));
};
var monadReaderExceptT = function (dictMonadReader) {
    return new Control_Monad_Reader_Class.MonadReader(function () {
        return monadAskExceptT(dictMonadReader.MonadAsk0());
    }, function (f) {
        return mapExceptT(Control_Monad_Reader_Class.local(dictMonadReader)(f));
    });
};
var monadContExceptT = function (dictMonadCont) {
    return new Control_Monad_Cont_Class.MonadCont(function () {
        return monadExceptT(dictMonadCont.Monad0());
    }, function (f) {
        return ExceptT(Control_Monad_Cont_Class.callCC(dictMonadCont)(function (c) {
            var v = f(function (a) {
                return ExceptT(c(new Data_Either.Right(a)));
            });
            return v;
        }));
    });
};
var monadEffectExceptT = function (dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
        return monadExceptT(dictMonadEffect.Monad0());
    }, (function () {
        var $102 = Control_Monad_Trans_Class.lift(monadTransExceptT)(dictMonadEffect.Monad0());
        var $103 = Effect_Class.liftEffect(dictMonadEffect);
        return function ($104) {
            return $102($103($104));
        };
    })());
};
var monadRecExceptT = function (dictMonadRec) {
    return new Control_Monad_Rec_Class.MonadRec(function () {
        return monadExceptT(dictMonadRec.Monad0());
    }, function (f) {
        var $105 = Control_Monad_Rec_Class.tailRecM(dictMonadRec)(function (a) {
            var v = f(a);
            return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(v)(function (m$prime) {
                return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())((function () {
                    if (m$prime instanceof Data_Either.Left) {
                        return new Control_Monad_Rec_Class.Done(new Data_Either.Left(m$prime.value0));
                    };
                    if (m$prime instanceof Data_Either.Right && m$prime.value0 instanceof Control_Monad_Rec_Class.Loop) {
                        return new Control_Monad_Rec_Class.Loop(m$prime.value0.value0);
                    };
                    if (m$prime instanceof Data_Either.Right && m$prime.value0 instanceof Control_Monad_Rec_Class.Done) {
                        return new Control_Monad_Rec_Class.Done(new Data_Either.Right(m$prime.value0.value0));
                    };
                    throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 74, column 14 - line 77, column 43): " + [ m$prime.constructor.name ]);
                })());
            });
        });
        return function ($106) {
            return ExceptT($105($106));
        };
    });
};
var monadStateExceptT = function (dictMonadState) {
    return new Control_Monad_State_Class.MonadState(function () {
        return monadExceptT(dictMonadState.Monad0());
    }, function (f) {
        return Control_Monad_Trans_Class.lift(monadTransExceptT)(dictMonadState.Monad0())(Control_Monad_State_Class.state(dictMonadState)(f));
    });
};
var monadTellExceptT = function (dictMonadTell) {
    return new Control_Monad_Writer_Class.MonadTell(function () {
        return monadExceptT(dictMonadTell.Monad0());
    }, (function () {
        var $107 = Control_Monad_Trans_Class.lift(monadTransExceptT)(dictMonadTell.Monad0());
        var $108 = Control_Monad_Writer_Class.tell(dictMonadTell);
        return function ($109) {
            return $107($108($109));
        };
    })());
};
var monadWriterExceptT = function (dictMonadWriter) {
    return new Control_Monad_Writer_Class.MonadWriter(function () {
        return monadTellExceptT(dictMonadWriter.MonadTell0());
    }, mapExceptT(function (m) {
        return Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(Control_Monad_Writer_Class.listen(dictMonadWriter)(m))(function (v) {
            return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())(Data_Functor.map(Data_Either.functorEither)(function (r) {
                return new Data_Tuple.Tuple(r, v.value1);
            })(v.value0));
        });
    }), mapExceptT(function (m) {
        return Control_Monad_Writer_Class.pass(dictMonadWriter)(Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(m)(function (v) {
            return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())((function () {
                if (v instanceof Data_Either.Left) {
                    return new Data_Tuple.Tuple(new Data_Either.Left(v.value0), Control_Category.identity(Control_Category.categoryFn));
                };
                if (v instanceof Data_Either.Right) {
                    return new Data_Tuple.Tuple(new Data_Either.Right(v.value0.value0), v.value0.value1);
                };
                throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 136, column 10 - line 138, column 45): " + [ v.constructor.name ]);
            })());
        }));
    }));
};
var monadThrowExceptT = function (dictMonad) {
    return new Control_Monad_Error_Class.MonadThrow(function () {
        return monadExceptT(dictMonad);
    }, (function () {
        var $110 = Control_Applicative.pure(dictMonad.Applicative0());
        return function ($111) {
            return ExceptT($110(Data_Either.Left.create($111)));
        };
    })());
};
var monadErrorExceptT = function (dictMonad) {
    return new Control_Monad_Error_Class.MonadError(function () {
        return monadThrowExceptT(dictMonad);
    }, function (v) {
        return function (k) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(Data_Either.either(function (a) {
                var v1 = k(a);
                return v1;
            })((function () {
                var $112 = Control_Applicative.pure(dictMonad.Applicative0());
                return function ($113) {
                    return $112(Data_Either.Right.create($113));
                };
            })()));
        };
    });
};
var altExceptT = function (dictSemigroup) {
    return function (dictMonad) {
        return new Control_Alt.Alt(function () {
            return functorExceptT(((dictMonad.Bind1()).Apply0()).Functor0());
        }, function (v) {
            return function (v1) {
                return Control_Bind.bind(dictMonad.Bind1())(v)(function (v2) {
                    if (v2 instanceof Data_Either.Right) {
                        return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Right(v2.value0));
                    };
                    if (v2 instanceof Data_Either.Left) {
                        return Control_Bind.bind(dictMonad.Bind1())(v1)(function (v3) {
                            if (v3 instanceof Data_Either.Right) {
                                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Right(v3.value0));
                            };
                            if (v3 instanceof Data_Either.Left) {
                                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Left(Data_Semigroup.append(dictSemigroup)(v2.value0)(v3.value0)));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 86, column 9 - line 88, column 49): " + [ v3.constructor.name ]);
                        });
                    };
                    throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 82, column 5 - line 88, column 49): " + [ v2.constructor.name ]);
                });
            };
        });
    };
};
var plusExceptT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_Plus.Plus(function () {
            return altExceptT(dictMonoid.Semigroup0())(dictMonad);
        }, Control_Monad_Error_Class.throwError(monadThrowExceptT(dictMonad))(Data_Monoid.mempty(dictMonoid)));
    };
};
var alternativeExceptT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_Alternative.Alternative(function () {
            return applicativeExceptT(dictMonad);
        }, function () {
            return plusExceptT(dictMonoid)(dictMonad);
        });
    };
};
var monadZeroExceptT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_MonadZero.MonadZero(function () {
            return alternativeExceptT(dictMonoid)(dictMonad);
        }, function () {
            return monadExceptT(dictMonad);
        });
    };
};
var monadPlusExceptT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_MonadPlus.MonadPlus(function () {
            return monadZeroExceptT(dictMonoid)(dictMonad);
        });
    };
};
module.exports = {
    ExceptT: ExceptT,
    runExceptT: runExceptT,
    withExceptT: withExceptT,
    mapExceptT: mapExceptT,
    except: except,
    newtypeExceptT: newtypeExceptT,
    functorExceptT: functorExceptT,
    applyExceptT: applyExceptT,
    applicativeExceptT: applicativeExceptT,
    bindExceptT: bindExceptT,
    monadExceptT: monadExceptT,
    monadRecExceptT: monadRecExceptT,
    altExceptT: altExceptT,
    plusExceptT: plusExceptT,
    alternativeExceptT: alternativeExceptT,
    monadPlusExceptT: monadPlusExceptT,
    monadZeroExceptT: monadZeroExceptT,
    monadTransExceptT: monadTransExceptT,
    monadEffectExceptT: monadEffectExceptT,
    monadContExceptT: monadContExceptT,
    monadThrowExceptT: monadThrowExceptT,
    monadErrorExceptT: monadErrorExceptT,
    monadAskExceptT: monadAskExceptT,
    monadReaderExceptT: monadReaderExceptT,
    monadStateExceptT: monadStateExceptT,
    monadTellExceptT: monadTellExceptT,
    monadWriterExceptT: monadWriterExceptT
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Control.Monad.Cont.Class/index.js":19,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad.Reader.Class/index.js":24,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad.State.Class/index.js":29,"../Control.Monad.Trans.Class/index.js":30,"../Control.Monad.Writer.Class/index.js":31,"../Control.Monad/index.js":33,"../Control.MonadPlus/index.js":34,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Either/index.js":65,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Tuple/index.js":124,"../Effect.Class/index.js":136}],23:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Control_Monad_Writer_Class = require("../Control.Monad.Writer.Class/index.js");
var Control_MonadPlus = require("../Control.MonadPlus/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var MaybeT = function (x) {
    return x;
};
var runMaybeT = function (v) {
    return v;
};
var newtypeMaybeT = new Data_Newtype.Newtype(function (n) {
    return n;
}, MaybeT);
var monadTransMaybeT = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    var $75 = Control_Monad.liftM1(dictMonad)(Data_Maybe.Just.create);
    return function ($76) {
        return MaybeT($75($76));
    };
});
var mapMaybeT = function (f) {
    return function (v) {
        return f(v);
    };
};
var functorMaybeT = function (dictFunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return Data_Functor.map(dictFunctor)(Data_Functor.map(Data_Maybe.functorMaybe)(f))(v);
        };
    });
};
var monadMaybeT = function (dictMonad) {
    return new Control_Monad.Monad(function () {
        return applicativeMaybeT(dictMonad);
    }, function () {
        return bindMaybeT(dictMonad);
    });
};
var bindMaybeT = function (dictMonad) {
    return new Control_Bind.Bind(function () {
        return applyMaybeT(dictMonad);
    }, function (v) {
        return function (f) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(function (v1) {
                if (v1 instanceof Data_Maybe.Nothing) {
                    return Control_Applicative.pure(dictMonad.Applicative0())(Data_Maybe.Nothing.value);
                };
                if (v1 instanceof Data_Maybe.Just) {
                    var v2 = f(v1.value0);
                    return v2;
                };
                throw new Error("Failed pattern match at Control.Monad.Maybe.Trans (line 54, column 11 - line 56, column 42): " + [ v1.constructor.name ]);
            });
        };
    });
};
var applyMaybeT = function (dictMonad) {
    return new Control_Apply.Apply(function () {
        return functorMaybeT(((dictMonad.Bind1()).Apply0()).Functor0());
    }, Control_Monad.ap(monadMaybeT(dictMonad)));
};
var applicativeMaybeT = function (dictMonad) {
    return new Control_Applicative.Applicative(function () {
        return applyMaybeT(dictMonad);
    }, (function () {
        var $77 = Control_Applicative.pure(dictMonad.Applicative0());
        return function ($78) {
            return MaybeT($77(Data_Maybe.Just.create($78)));
        };
    })());
};
var monadAskMaybeT = function (dictMonadAsk) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
        return monadMaybeT(dictMonadAsk.Monad0());
    }, Control_Monad_Trans_Class.lift(monadTransMaybeT)(dictMonadAsk.Monad0())(Control_Monad_Reader_Class.ask(dictMonadAsk)));
};
var monadReaderMaybeT = function (dictMonadReader) {
    return new Control_Monad_Reader_Class.MonadReader(function () {
        return monadAskMaybeT(dictMonadReader.MonadAsk0());
    }, function (f) {
        return mapMaybeT(Control_Monad_Reader_Class.local(dictMonadReader)(f));
    });
};
var monadContMaybeT = function (dictMonadCont) {
    return new Control_Monad_Cont_Class.MonadCont(function () {
        return monadMaybeT(dictMonadCont.Monad0());
    }, function (f) {
        return MaybeT(Control_Monad_Cont_Class.callCC(dictMonadCont)(function (c) {
            var v = f(function (a) {
                return MaybeT(c(new Data_Maybe.Just(a)));
            });
            return v;
        }));
    });
};
var monadEffectMaybe = function (dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
        return monadMaybeT(dictMonadEffect.Monad0());
    }, (function () {
        var $79 = Control_Monad_Trans_Class.lift(monadTransMaybeT)(dictMonadEffect.Monad0());
        var $80 = Effect_Class.liftEffect(dictMonadEffect);
        return function ($81) {
            return $79($80($81));
        };
    })());
};
var monadRecMaybeT = function (dictMonadRec) {
    return new Control_Monad_Rec_Class.MonadRec(function () {
        return monadMaybeT(dictMonadRec.Monad0());
    }, function (f) {
        var $82 = Control_Monad_Rec_Class.tailRecM(dictMonadRec)(function (a) {
            var v = f(a);
            return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(v)(function (m$prime) {
                return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())((function () {
                    if (m$prime instanceof Data_Maybe.Nothing) {
                        return new Control_Monad_Rec_Class.Done(Data_Maybe.Nothing.value);
                    };
                    if (m$prime instanceof Data_Maybe.Just && m$prime.value0 instanceof Control_Monad_Rec_Class.Loop) {
                        return new Control_Monad_Rec_Class.Loop(m$prime.value0.value0);
                    };
                    if (m$prime instanceof Data_Maybe.Just && m$prime.value0 instanceof Control_Monad_Rec_Class.Done) {
                        return new Control_Monad_Rec_Class.Done(new Data_Maybe.Just(m$prime.value0.value0));
                    };
                    throw new Error("Failed pattern match at Control.Monad.Maybe.Trans (line 84, column 16 - line 87, column 43): " + [ m$prime.constructor.name ]);
                })());
            });
        });
        return function ($83) {
            return MaybeT($82($83));
        };
    });
};
var monadStateMaybeT = function (dictMonadState) {
    return new Control_Monad_State_Class.MonadState(function () {
        return monadMaybeT(dictMonadState.Monad0());
    }, function (f) {
        return Control_Monad_Trans_Class.lift(monadTransMaybeT)(dictMonadState.Monad0())(Control_Monad_State_Class.state(dictMonadState)(f));
    });
};
var monadTellMaybeT = function (dictMonadTell) {
    return new Control_Monad_Writer_Class.MonadTell(function () {
        return monadMaybeT(dictMonadTell.Monad0());
    }, (function () {
        var $84 = Control_Monad_Trans_Class.lift(monadTransMaybeT)(dictMonadTell.Monad0());
        var $85 = Control_Monad_Writer_Class.tell(dictMonadTell);
        return function ($86) {
            return $84($85($86));
        };
    })());
};
var monadWriterMaybeT = function (dictMonadWriter) {
    return new Control_Monad_Writer_Class.MonadWriter(function () {
        return monadTellMaybeT(dictMonadWriter.MonadTell0());
    }, mapMaybeT(function (m) {
        return Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(Control_Monad_Writer_Class.listen(dictMonadWriter)(m))(function (v) {
            return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())(Data_Functor.map(Data_Maybe.functorMaybe)(function (r) {
                return new Data_Tuple.Tuple(r, v.value1);
            })(v.value0));
        });
    }), mapMaybeT(function (m) {
        return Control_Monad_Writer_Class.pass(dictMonadWriter)(Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(m)(function (v) {
            return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())((function () {
                if (v instanceof Data_Maybe.Nothing) {
                    return new Data_Tuple.Tuple(Data_Maybe.Nothing.value, Control_Category.identity(Control_Category.categoryFn));
                };
                if (v instanceof Data_Maybe.Just) {
                    return new Data_Tuple.Tuple(new Data_Maybe.Just(v.value0.value0), v.value0.value1);
                };
                throw new Error("Failed pattern match at Control.Monad.Maybe.Trans (line 121, column 10 - line 123, column 43): " + [ v.constructor.name ]);
            })());
        }));
    }));
};
var monadThrowMaybeT = function (dictMonadThrow) {
    return new Control_Monad_Error_Class.MonadThrow(function () {
        return monadMaybeT(dictMonadThrow.Monad0());
    }, function (e) {
        return Control_Monad_Trans_Class.lift(monadTransMaybeT)(dictMonadThrow.Monad0())(Control_Monad_Error_Class.throwError(dictMonadThrow)(e));
    });
};
var monadErrorMaybeT = function (dictMonadError) {
    return new Control_Monad_Error_Class.MonadError(function () {
        return monadThrowMaybeT(dictMonadError.MonadThrow0());
    }, function (v) {
        return function (h) {
            return MaybeT(Control_Monad_Error_Class.catchError(dictMonadError)(v)(function (a) {
                var v1 = h(a);
                return v1;
            }));
        };
    });
};
var altMaybeT = function (dictMonad) {
    return new Control_Alt.Alt(function () {
        return functorMaybeT(((dictMonad.Bind1()).Apply0()).Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(function (v2) {
                if (v2 instanceof Data_Maybe.Nothing) {
                    return v1;
                };
                return Control_Applicative.pure(dictMonad.Applicative0())(v2);
            });
        };
    });
};
var plusMaybeT = function (dictMonad) {
    return new Control_Plus.Plus(function () {
        return altMaybeT(dictMonad);
    }, Control_Applicative.pure(dictMonad.Applicative0())(Data_Maybe.Nothing.value));
};
var alternativeMaybeT = function (dictMonad) {
    return new Control_Alternative.Alternative(function () {
        return applicativeMaybeT(dictMonad);
    }, function () {
        return plusMaybeT(dictMonad);
    });
};
var monadZeroMaybeT = function (dictMonad) {
    return new Control_MonadZero.MonadZero(function () {
        return alternativeMaybeT(dictMonad);
    }, function () {
        return monadMaybeT(dictMonad);
    });
};
var monadPlusMaybeT = function (dictMonad) {
    return new Control_MonadPlus.MonadPlus(function () {
        return monadZeroMaybeT(dictMonad);
    });
};
module.exports = {
    MaybeT: MaybeT,
    runMaybeT: runMaybeT,
    mapMaybeT: mapMaybeT,
    newtypeMaybeT: newtypeMaybeT,
    functorMaybeT: functorMaybeT,
    applyMaybeT: applyMaybeT,
    applicativeMaybeT: applicativeMaybeT,
    bindMaybeT: bindMaybeT,
    monadMaybeT: monadMaybeT,
    monadTransMaybeT: monadTransMaybeT,
    altMaybeT: altMaybeT,
    plusMaybeT: plusMaybeT,
    alternativeMaybeT: alternativeMaybeT,
    monadPlusMaybeT: monadPlusMaybeT,
    monadZeroMaybeT: monadZeroMaybeT,
    monadRecMaybeT: monadRecMaybeT,
    monadEffectMaybe: monadEffectMaybe,
    monadContMaybeT: monadContMaybeT,
    monadThrowMaybeT: monadThrowMaybeT,
    monadErrorMaybeT: monadErrorMaybeT,
    monadAskMaybeT: monadAskMaybeT,
    monadReaderMaybeT: monadReaderMaybeT,
    monadStateMaybeT: monadStateMaybeT,
    monadTellMaybeT: monadTellMaybeT,
    monadWriterMaybeT: monadWriterMaybeT
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Control.Monad.Cont.Class/index.js":19,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad.Reader.Class/index.js":24,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad.State.Class/index.js":29,"../Control.Monad.Trans.Class/index.js":30,"../Control.Monad.Writer.Class/index.js":31,"../Control.Monad/index.js":33,"../Control.MonadPlus/index.js":34,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Newtype/index.js":98,"../Data.Tuple/index.js":124,"../Effect.Class/index.js":136}],24:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var MonadAsk = function (Monad0, ask) {
    this.Monad0 = Monad0;
    this.ask = ask;
};
var MonadReader = function (MonadAsk0, local) {
    this.MonadAsk0 = MonadAsk0;
    this.local = local;
};
var monadAskFun = new MonadAsk(function () {
    return Control_Monad.monadFn;
}, Control_Category.identity(Control_Category.categoryFn));
var monadReaderFun = new MonadReader(function () {
    return monadAskFun;
}, Control_Semigroupoid.composeFlipped(Control_Semigroupoid.semigroupoidFn));
var local = function (dict) {
    return dict.local;
};
var ask = function (dict) {
    return dict.ask;
};
var asks = function (dictMonadAsk) {
    return function (f) {
        return Data_Functor.map((((dictMonadAsk.Monad0()).Bind1()).Apply0()).Functor0())(f)(ask(dictMonadAsk));
    };
};
module.exports = {
    ask: ask,
    local: local,
    MonadAsk: MonadAsk,
    asks: asks,
    MonadReader: MonadReader,
    monadAskFun: monadAskFun,
    monadReaderFun: monadReaderFun
};

},{"../Control.Category/index.js":14,"../Control.Monad/index.js":33,"../Control.Semigroupoid/index.js":39,"../Data.Functor/index.js":80}],25:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Control_Monad_Writer_Class = require("../Control.Monad.Writer.Class/index.js");
var Control_MonadPlus = require("../Control.MonadPlus/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Distributive = require("../Data.Distributive/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var ReaderT = function (x) {
    return x;
};
var withReaderT = function (f) {
    return function (v) {
        return function ($66) {
            return v(f($66));
        };
    };
};
var runReaderT = function (v) {
    return v;
};
var newtypeReaderT = new Data_Newtype.Newtype(function (n) {
    return n;
}, ReaderT);
var monadTransReaderT = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    return function ($67) {
        return ReaderT(Data_Function["const"]($67));
    };
});
var mapReaderT = function (f) {
    return function (v) {
        return function ($68) {
            return f(v($68));
        };
    };
};
var functorReaderT = function (dictFunctor) {
    return new Data_Functor.Functor((function () {
        var $69 = Data_Functor.map(dictFunctor);
        return function ($70) {
            return mapReaderT($69($70));
        };
    })());
};
var distributiveReaderT = function (dictDistributive) {
    return new Data_Distributive.Distributive(function () {
        return functorReaderT(dictDistributive.Functor0());
    }, function (dictFunctor) {
        return function (f) {
            var $71 = Data_Distributive.distribute(distributiveReaderT(dictDistributive))(dictFunctor);
            var $72 = Data_Functor.map(dictFunctor)(f);
            return function ($73) {
                return $71($72($73));
            };
        };
    }, function (dictFunctor) {
        return function (a) {
            return function (e) {
                return Data_Distributive.collect(dictDistributive)(dictFunctor)(function (r) {
                    return r(e);
                })(a);
            };
        };
    });
};
var applyReaderT = function (dictApply) {
    return new Control_Apply.Apply(function () {
        return functorReaderT(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return function (r) {
                return Control_Apply.apply(dictApply)(v(r))(v1(r));
            };
        };
    });
};
var bindReaderT = function (dictBind) {
    return new Control_Bind.Bind(function () {
        return applyReaderT(dictBind.Apply0());
    }, function (v) {
        return function (k) {
            return function (r) {
                return Control_Bind.bind(dictBind)(v(r))(function (a) {
                    var v1 = k(a);
                    return v1(r);
                });
            };
        };
    });
};
var semigroupReaderT = function (dictApply) {
    return function (dictSemigroup) {
        return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyReaderT(dictApply))(Data_Semigroup.append(dictSemigroup)));
    };
};
var applicativeReaderT = function (dictApplicative) {
    return new Control_Applicative.Applicative(function () {
        return applyReaderT(dictApplicative.Apply0());
    }, (function () {
        var $74 = Control_Applicative.pure(dictApplicative);
        return function ($75) {
            return ReaderT(Data_Function["const"]($74($75)));
        };
    })());
};
var monadReaderT = function (dictMonad) {
    return new Control_Monad.Monad(function () {
        return applicativeReaderT(dictMonad.Applicative0());
    }, function () {
        return bindReaderT(dictMonad.Bind1());
    });
};
var monadAskReaderT = function (dictMonad) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
        return monadReaderT(dictMonad);
    }, Control_Applicative.pure(dictMonad.Applicative0()));
};
var monadReaderReaderT = function (dictMonad) {
    return new Control_Monad_Reader_Class.MonadReader(function () {
        return monadAskReaderT(dictMonad);
    }, withReaderT);
};
var monadContReaderT = function (dictMonadCont) {
    return new Control_Monad_Cont_Class.MonadCont(function () {
        return monadReaderT(dictMonadCont.Monad0());
    }, function (f) {
        return function (r) {
            return Control_Monad_Cont_Class.callCC(dictMonadCont)(function (c) {
                var v = f(function ($76) {
                    return ReaderT(Data_Function["const"](c($76)));
                });
                return v(r);
            });
        };
    });
};
var monadEffectReader = function (dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
        return monadReaderT(dictMonadEffect.Monad0());
    }, (function () {
        var $77 = Control_Monad_Trans_Class.lift(monadTransReaderT)(dictMonadEffect.Monad0());
        var $78 = Effect_Class.liftEffect(dictMonadEffect);
        return function ($79) {
            return $77($78($79));
        };
    })());
};
var monadRecReaderT = function (dictMonadRec) {
    return new Control_Monad_Rec_Class.MonadRec(function () {
        return monadReaderT(dictMonadRec.Monad0());
    }, function (k) {
        return function (a) {
            var k$prime = function (r) {
                return function (a$prime) {
                    var v = k(a$prime);
                    return Control_Bind.bindFlipped((dictMonadRec.Monad0()).Bind1())(Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0()))(v(r));
                };
            };
            return function (r) {
                return Control_Monad_Rec_Class.tailRecM(dictMonadRec)(k$prime(r))(a);
            };
        };
    });
};
var monadStateReaderT = function (dictMonadState) {
    return new Control_Monad_State_Class.MonadState(function () {
        return monadReaderT(dictMonadState.Monad0());
    }, (function () {
        var $80 = Control_Monad_Trans_Class.lift(monadTransReaderT)(dictMonadState.Monad0());
        var $81 = Control_Monad_State_Class.state(dictMonadState);
        return function ($82) {
            return $80($81($82));
        };
    })());
};
var monadTellReaderT = function (dictMonadTell) {
    return new Control_Monad_Writer_Class.MonadTell(function () {
        return monadReaderT(dictMonadTell.Monad0());
    }, (function () {
        var $83 = Control_Monad_Trans_Class.lift(monadTransReaderT)(dictMonadTell.Monad0());
        var $84 = Control_Monad_Writer_Class.tell(dictMonadTell);
        return function ($85) {
            return $83($84($85));
        };
    })());
};
var monadWriterReaderT = function (dictMonadWriter) {
    return new Control_Monad_Writer_Class.MonadWriter(function () {
        return monadTellReaderT(dictMonadWriter.MonadTell0());
    }, mapReaderT(Control_Monad_Writer_Class.listen(dictMonadWriter)), mapReaderT(Control_Monad_Writer_Class.pass(dictMonadWriter)));
};
var monadThrowReaderT = function (dictMonadThrow) {
    return new Control_Monad_Error_Class.MonadThrow(function () {
        return monadReaderT(dictMonadThrow.Monad0());
    }, (function () {
        var $86 = Control_Monad_Trans_Class.lift(monadTransReaderT)(dictMonadThrow.Monad0());
        var $87 = Control_Monad_Error_Class.throwError(dictMonadThrow);
        return function ($88) {
            return $86($87($88));
        };
    })());
};
var monadErrorReaderT = function (dictMonadError) {
    return new Control_Monad_Error_Class.MonadError(function () {
        return monadThrowReaderT(dictMonadError.MonadThrow0());
    }, function (v) {
        return function (h) {
            return function (r) {
                return Control_Monad_Error_Class.catchError(dictMonadError)(v(r))(function (e) {
                    var v1 = h(e);
                    return v1(r);
                });
            };
        };
    });
};
var monoidReaderT = function (dictApplicative) {
    return function (dictMonoid) {
        return new Data_Monoid.Monoid(function () {
            return semigroupReaderT(dictApplicative.Apply0())(dictMonoid.Semigroup0());
        }, Control_Applicative.pure(applicativeReaderT(dictApplicative))(Data_Monoid.mempty(dictMonoid)));
    };
};
var altReaderT = function (dictAlt) {
    return new Control_Alt.Alt(function () {
        return functorReaderT(dictAlt.Functor0());
    }, function (v) {
        return function (v1) {
            return function (r) {
                return Control_Alt.alt(dictAlt)(v(r))(v1(r));
            };
        };
    });
};
var plusReaderT = function (dictPlus) {
    return new Control_Plus.Plus(function () {
        return altReaderT(dictPlus.Alt0());
    }, Data_Function["const"](Control_Plus.empty(dictPlus)));
};
var alternativeReaderT = function (dictAlternative) {
    return new Control_Alternative.Alternative(function () {
        return applicativeReaderT(dictAlternative.Applicative0());
    }, function () {
        return plusReaderT(dictAlternative.Plus1());
    });
};
var monadZeroReaderT = function (dictMonadZero) {
    return new Control_MonadZero.MonadZero(function () {
        return alternativeReaderT(dictMonadZero.Alternative1());
    }, function () {
        return monadReaderT(dictMonadZero.Monad0());
    });
};
var monadPlusReaderT = function (dictMonadPlus) {
    return new Control_MonadPlus.MonadPlus(function () {
        return monadZeroReaderT(dictMonadPlus.MonadZero0());
    });
};
module.exports = {
    ReaderT: ReaderT,
    runReaderT: runReaderT,
    withReaderT: withReaderT,
    mapReaderT: mapReaderT,
    newtypeReaderT: newtypeReaderT,
    functorReaderT: functorReaderT,
    applyReaderT: applyReaderT,
    applicativeReaderT: applicativeReaderT,
    altReaderT: altReaderT,
    plusReaderT: plusReaderT,
    alternativeReaderT: alternativeReaderT,
    bindReaderT: bindReaderT,
    monadReaderT: monadReaderT,
    monadZeroReaderT: monadZeroReaderT,
    semigroupReaderT: semigroupReaderT,
    monoidReaderT: monoidReaderT,
    monadPlusReaderT: monadPlusReaderT,
    monadTransReaderT: monadTransReaderT,
    monadEffectReader: monadEffectReader,
    monadContReaderT: monadContReaderT,
    monadThrowReaderT: monadThrowReaderT,
    monadErrorReaderT: monadErrorReaderT,
    monadAskReaderT: monadAskReaderT,
    monadReaderReaderT: monadReaderReaderT,
    monadStateReaderT: monadStateReaderT,
    monadTellReaderT: monadTellReaderT,
    monadWriterReaderT: monadWriterReaderT,
    distributiveReaderT: distributiveReaderT,
    monadRecReaderT: monadRecReaderT
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Cont.Class/index.js":19,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad.Reader.Class/index.js":24,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad.State.Class/index.js":29,"../Control.Monad.Trans.Class/index.js":30,"../Control.Monad.Writer.Class/index.js":31,"../Control.Monad/index.js":33,"../Control.MonadPlus/index.js":34,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Distributive/index.js":63,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Effect.Class/index.js":136}],26:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Identity = require("../Data.Identity/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect = require("../Effect/index.js");
var Effect_Ref = require("../Effect.Ref/index.js");
var Loop = (function () {
    function Loop(value0) {
        this.value0 = value0;
    };
    Loop.create = function (value0) {
        return new Loop(value0);
    };
    return Loop;
})();
var Done = (function () {
    function Done(value0) {
        this.value0 = value0;
    };
    Done.create = function (value0) {
        return new Done(value0);
    };
    return Done;
})();
var MonadRec = function (Monad0, tailRecM) {
    this.Monad0 = Monad0;
    this.tailRecM = tailRecM;
};
var tailRecM = function (dict) {
    return dict.tailRecM;
};
var tailRecM2 = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (b) {
                return tailRecM(dictMonadRec)(function (o) {
                    return f(o.a)(o.b);
                })({
                    a: a,
                    b: b
                });
            };
        };
    };
};
var tailRecM3 = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return tailRecM(dictMonadRec)(function (o) {
                        return f(o.a)(o.b)(o.c);
                    })({
                        a: a,
                        b: b,
                        c: c
                    });
                };
            };
        };
    };
};
var untilJust = function (dictMonadRec) {
    return function (m) {
        return tailRecM(dictMonadRec)(function (v) {
            return Data_Functor.mapFlipped((((dictMonadRec.Monad0()).Bind1()).Apply0()).Functor0())(m)(function (v1) {
                if (v1 instanceof Data_Maybe.Nothing) {
                    return new Loop(Data_Unit.unit);
                };
                if (v1 instanceof Data_Maybe.Just) {
                    return new Done(v1.value0);
                };
                throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 155, column 43 - line 157, column 19): " + [ v1.constructor.name ]);
            });
        })(Data_Unit.unit);
    };
};
var whileJust = function (dictMonoid) {
    return function (dictMonadRec) {
        return function (m) {
            return tailRecM(dictMonadRec)(function (v) {
                return Data_Functor.mapFlipped((((dictMonadRec.Monad0()).Bind1()).Apply0()).Functor0())(m)(function (v1) {
                    if (v1 instanceof Data_Maybe.Nothing) {
                        return new Done(v);
                    };
                    if (v1 instanceof Data_Maybe.Just) {
                        return Loop.create(Data_Semigroup.append(dictMonoid.Semigroup0())(v)(v1.value0));
                    };
                    throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 148, column 45 - line 150, column 26): " + [ v1.constructor.name ]);
                });
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var tailRec = function (f) {
    var go = function ($copy_v) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v) {
            if (v instanceof Loop) {
                $copy_v = f(v.value0);
                return;
            };
            if (v instanceof Done) {
                $tco_done = true;
                return v.value0;
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 93, column 3 - line 93, column 25): " + [ v.constructor.name ]);
        };
        while (!$tco_done) {
            $tco_result = $tco_loop($copy_v);
        };
        return $tco_result;
    };
    return function ($63) {
        return go(f($63));
    };
};
var monadRecMaybe = new MonadRec(function () {
    return Data_Maybe.monadMaybe;
}, function (f) {
    return function (a0) {
        var g = function (v) {
            if (v instanceof Data_Maybe.Nothing) {
                return new Done(Data_Maybe.Nothing.value);
            };
            if (v instanceof Data_Maybe.Just && v.value0 instanceof Loop) {
                return new Loop(f(v.value0.value0));
            };
            if (v instanceof Data_Maybe.Just && v.value0 instanceof Done) {
                return new Done(new Data_Maybe.Just(v.value0.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 129, column 7 - line 129, column 31): " + [ v.constructor.name ]);
        };
        return tailRec(g)(f(a0));
    };
});
var monadRecIdentity = new MonadRec(function () {
    return Data_Identity.monadIdentity;
}, function (f) {
    var runIdentity = function (v) {
        return v;
    };
    var $64 = tailRec(function ($66) {
        return runIdentity(f($66));
    });
    return function ($65) {
        return Data_Identity.Identity($64($65));
    };
});
var monadRecFunction = new MonadRec(function () {
    return Control_Monad.monadFn;
}, function (f) {
    return function (a0) {
        return function (e) {
            return tailRec(function (a) {
                return f(a)(e);
            })(a0);
        };
    };
});
var monadRecEither = new MonadRec(function () {
    return Data_Either.monadEither;
}, function (f) {
    return function (a0) {
        var g = function (v) {
            if (v instanceof Data_Either.Left) {
                return new Done(new Data_Either.Left(v.value0));
            };
            if (v instanceof Data_Either.Right && v.value0 instanceof Loop) {
                return new Loop(f(v.value0.value0));
            };
            if (v instanceof Data_Either.Right && v.value0 instanceof Done) {
                return new Done(new Data_Either.Right(v.value0.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 121, column 7 - line 121, column 33): " + [ v.constructor.name ]);
        };
        return tailRec(g)(f(a0));
    };
});
var monadRecEffect = new MonadRec(function () {
    return Effect.monadEffect;
}, function (f) {
    return function (a) {
        var fromDone = function (v) {
            if (v instanceof Done) {
                return v.value0;
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 113, column 30 - line 113, column 44): " + [ v.constructor.name ]);
        };
        return function __do() {
            var v = Control_Bind.bindFlipped(Effect.bindEffect)(Effect_Ref["new"])(f(a))();
            (function () {
                while (!(function __do() {
                    var v1 = Effect_Ref.read(v)();
                    if (v1 instanceof Loop) {
                        var v2 = f(v1.value0)();
                        var v3 = Effect_Ref.write(v2)(v)();
                        return false;
                    };
                    if (v1 instanceof Done) {
                        return true;
                    };
                    throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 104, column 22 - line 109, column 28): " + [ v1.constructor.name ]);
                })()) {

                };
                return {};
            })();
            return Data_Functor.map(Effect.functorEffect)(fromDone)(Effect_Ref.read(v))();
        };
    };
});
var functorStep = new Data_Functor.Functor(function (f) {
    return function (m) {
        if (m instanceof Loop) {
            return new Loop(m.value0);
        };
        if (m instanceof Done) {
            return new Done(f(m.value0));
        };
        throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 27, column 1 - line 27, column 48): " + [ m.constructor.name ]);
    };
});
var forever = function (dictMonadRec) {
    return function (ma) {
        return tailRecM(dictMonadRec)(function (u) {
            return Data_Functor.voidRight((((dictMonadRec.Monad0()).Bind1()).Apply0()).Functor0())(new Loop(u))(ma);
        })(Data_Unit.unit);
    };
};
var bifunctorStep = new Data_Bifunctor.Bifunctor(function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Loop) {
                return new Loop(v(v2.value0));
            };
            if (v2 instanceof Done) {
                return new Done(v1(v2.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 29, column 1 - line 31, column 34): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
});
module.exports = {
    Loop: Loop,
    Done: Done,
    MonadRec: MonadRec,
    tailRec: tailRec,
    tailRecM: tailRecM,
    tailRecM2: tailRecM2,
    tailRecM3: tailRecM3,
    forever: forever,
    whileJust: whileJust,
    untilJust: untilJust,
    functorStep: functorStep,
    bifunctorStep: bifunctorStep,
    monadRecIdentity: monadRecIdentity,
    monadRecEffect: monadRecEffect,
    monadRecFunction: monadRecFunction,
    monadRecEither: monadRecEither,
    monadRecMaybe: monadRecMaybe
};

},{"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Bifunctor/index.js":56,"../Data.Either/index.js":65,"../Data.Functor/index.js":80,"../Data.Identity/index.js":85,"../Data.Maybe/index.js":90,"../Data.Monoid/index.js":97,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132,"../Effect.Ref/index.js":146,"../Effect/index.js":152}],27:[function(require,module,exports){
"use strict";

exports.map_ = function (f) {
  return function (a) {
    return function () {
      return f(a());
    };
  };
};

exports.pure_ = function (a) {
  return function () {
    return a;
  };
};

exports.bind_ = function (a) {
  return function (f) {
    return function () {
      return f(a())();
    };
  };
};

exports.run = function (f) {
  return f();
};

exports["while"] = function (f) {
  return function (a) {
    return function () {
      while (f()) {
        a();
      }
    };
  };
};

exports["for"] = function (lo) {
  return function (hi) {
    return function (f) {
      return function () {
        for (var i = lo; i < hi; i++) {
          f(i)();
        }
      };
    };
  };
};

exports.foreach = function (as) {
  return function (f) {
    return function () {
      for (var i = 0, l = as.length; i < l; i++) {
        f(as[i])();
      }
    };
  };
};

exports.new = function (val) {
  return function () {
    return { value: val };
  };
};

exports.read = function (ref) {
  return function () {
    return ref.value;
  };
};

exports["modify'"] = function (f) {
  return function (ref) {
    return function () {
      var t = f(ref.value);
      ref.value = t.state;
      return t.value;
    };
  };
};

exports.write = function (a) {
  return function (ref) {
    return function () {
      return ref.value = a; // eslint-disable-line no-return-assign
    };
  };
};

},{}],28:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var modify = function (f) {
    return $foreign["modify'"](function (s) {
        var s$prime = f(s);
        return {
            state: s$prime,
            value: s$prime
        };
    });
};
var functorST = new Data_Functor.Functor($foreign.map_);
var monadST = new Control_Monad.Monad(function () {
    return applicativeST;
}, function () {
    return bindST;
});
var bindST = new Control_Bind.Bind(function () {
    return applyST;
}, $foreign.bind_);
var applyST = new Control_Apply.Apply(function () {
    return functorST;
}, Control_Monad.ap(monadST));
var applicativeST = new Control_Applicative.Applicative(function () {
    return applyST;
}, $foreign.pure_);
var monadRecST = new Control_Monad_Rec_Class.MonadRec(function () {
    return monadST;
}, function (f) {
    return function (a) {
        var isLooping = function (v) {
            if (v instanceof Control_Monad_Rec_Class.Loop) {
                return true;
            };
            return false;
        };
        var fromDone = function (v) {
            if (v instanceof Control_Monad_Rec_Class.Done) {
                return v.value0;
            };
            throw new Error("Failed pattern match at Control.Monad.ST.Internal (line 54, column 32 - line 54, column 46): " + [ v.constructor.name ]);
        };
        return Control_Bind.bind(bindST)(Control_Bind.bindFlipped(bindST)($foreign["new"])(f(a)))(function (v) {
            return Control_Bind.discard(Control_Bind.discardUnit)(bindST)($foreign["while"](Data_Functor.map(functorST)(isLooping)($foreign.read(v)))(Control_Bind.bind(bindST)($foreign.read(v))(function (v1) {
                if (v1 instanceof Control_Monad_Rec_Class.Loop) {
                    return Control_Bind.bind(bindST)(f(v1.value0))(function (v2) {
                        return Data_Functor["void"](functorST)($foreign.write(v2)(v));
                    });
                };
                if (v1 instanceof Control_Monad_Rec_Class.Done) {
                    return Control_Applicative.pure(applicativeST)(Data_Unit.unit);
                };
                throw new Error("Failed pattern match at Control.Monad.ST.Internal (line 46, column 18 - line 50, column 28): " + [ v1.constructor.name ]);
            })))(function () {
                return Data_Functor.map(functorST)(fromDone)($foreign.read(v));
            });
        });
    };
});
module.exports = {
    modify: modify,
    functorST: functorST,
    applyST: applyST,
    applicativeST: applicativeST,
    bindST: bindST,
    monadST: monadST,
    monadRecST: monadRecST,
    map_: $foreign.map_,
    pure_: $foreign.pure_,
    bind_: $foreign.bind_,
    run: $foreign.run,
    "while": $foreign["while"],
    "for": $foreign["for"],
    foreach: $foreign.foreach,
    "new": $foreign["new"],
    read: $foreign.read,
    "modify'": $foreign["modify'"],
    write: $foreign.write
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad/index.js":33,"../Data.Functor/index.js":80,"../Data.Unit/index.js":132,"./foreign.js":27}],29:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var MonadState = function (Monad0, state) {
    this.Monad0 = Monad0;
    this.state = state;
};
var state = function (dict) {
    return dict.state;
};
var put = function (dictMonadState) {
    return function (s) {
        return state(dictMonadState)(function (v) {
            return new Data_Tuple.Tuple(Data_Unit.unit, s);
        });
    };
};
var modify_ = function (dictMonadState) {
    return function (f) {
        return state(dictMonadState)(function (s) {
            return new Data_Tuple.Tuple(Data_Unit.unit, f(s));
        });
    };
};
var modify = function (dictMonadState) {
    return function (f) {
        return state(dictMonadState)(function (s) {
            var s$prime = f(s);
            return new Data_Tuple.Tuple(s$prime, s$prime);
        });
    };
};
var gets = function (dictMonadState) {
    return function (f) {
        return state(dictMonadState)(function (s) {
            return new Data_Tuple.Tuple(f(s), s);
        });
    };
};
var get = function (dictMonadState) {
    return state(dictMonadState)(function (s) {
        return new Data_Tuple.Tuple(s, s);
    });
};
module.exports = {
    state: state,
    MonadState: MonadState,
    get: get,
    gets: gets,
    put: put,
    modify: modify,
    modify_: modify_
};

},{"../Data.Tuple/index.js":124,"../Data.Unit/index.js":132}],30:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var MonadTrans = function (lift) {
    this.lift = lift;
};
var lift = function (dict) {
    return dict.lift;
};
module.exports = {
    lift: lift,
    MonadTrans: MonadTrans
};

},{}],31:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var MonadTell = function (Monad0, tell) {
    this.Monad0 = Monad0;
    this.tell = tell;
};
var MonadWriter = function (MonadTell0, listen, pass) {
    this.MonadTell0 = MonadTell0;
    this.listen = listen;
    this.pass = pass;
};
var tell = function (dict) {
    return dict.tell;
};
var pass = function (dict) {
    return dict.pass;
};
var listen = function (dict) {
    return dict.listen;
};
var listens = function (dictMonadWriter) {
    return function (f) {
        return function (m) {
            return Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(listen(dictMonadWriter)(m))(function (v) {
                return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())(new Data_Tuple.Tuple(v.value0, f(v.value1)));
            });
        };
    };
};
var censor = function (dictMonadWriter) {
    return function (f) {
        return function (m) {
            return pass(dictMonadWriter)(Control_Bind.bind(((dictMonadWriter.MonadTell0()).Monad0()).Bind1())(m)(function (v) {
                return Control_Applicative.pure(((dictMonadWriter.MonadTell0()).Monad0()).Applicative0())(new Data_Tuple.Tuple(v, f));
            }));
        };
    };
};
module.exports = {
    listen: listen,
    pass: pass,
    tell: tell,
    MonadTell: MonadTell,
    MonadWriter: MonadWriter,
    listens: listens,
    censor: censor
};

},{"../Control.Applicative/index.js":7,"../Control.Bind/index.js":13,"../Data.Tuple/index.js":124}],32:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Cont_Class = require("../Control.Monad.Cont.Class/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Reader_Class = require("../Control.Monad.Reader.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_State_Class = require("../Control.Monad.State.Class/index.js");
var Control_Monad_Trans_Class = require("../Control.Monad.Trans.Class/index.js");
var Control_Monad_Writer_Class = require("../Control.Monad.Writer.Class/index.js");
var Control_MonadPlus = require("../Control.MonadPlus/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var WriterT = function (x) {
    return x;
};
var runWriterT = function (v) {
    return v;
};
var newtypeWriterT = new Data_Newtype.Newtype(function (n) {
    return n;
}, WriterT);
var monadTransWriterT = function (dictMonoid) {
    return new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
        return function (m) {
            return Control_Bind.bind(dictMonad.Bind1())(m)(function (v) {
                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(v, Data_Monoid.mempty(dictMonoid)));
            });
        };
    });
};
var mapWriterT = function (f) {
    return function (v) {
        return f(v);
    };
};
var functorWriterT = function (dictFunctor) {
    return new Data_Functor.Functor(function (f) {
        return mapWriterT(Data_Functor.map(dictFunctor)(function (v) {
            return new Data_Tuple.Tuple(f(v.value0), v.value1);
        }));
    });
};
var execWriterT = function (dictFunctor) {
    return function (v) {
        return Data_Functor.map(dictFunctor)(Data_Tuple.snd)(v);
    };
};
var applyWriterT = function (dictSemigroup) {
    return function (dictApply) {
        return new Control_Apply.Apply(function () {
            return functorWriterT(dictApply.Functor0());
        }, function (v) {
            return function (v1) {
                var k = function (v3) {
                    return function (v4) {
                        return new Data_Tuple.Tuple(v3.value0(v4.value0), Data_Semigroup.append(dictSemigroup)(v3.value1)(v4.value1));
                    };
                };
                return Control_Apply.apply(dictApply)(Data_Functor.map(dictApply.Functor0())(k)(v))(v1);
            };
        });
    };
};
var bindWriterT = function (dictSemigroup) {
    return function (dictBind) {
        return new Control_Bind.Bind(function () {
            return applyWriterT(dictSemigroup)(dictBind.Apply0());
        }, function (v) {
            return function (k) {
                return WriterT(Control_Bind.bind(dictBind)(v)(function (v1) {
                    var v2 = k(v1.value0);
                    return Data_Functor.map((dictBind.Apply0()).Functor0())(function (v3) {
                        return new Data_Tuple.Tuple(v3.value0, Data_Semigroup.append(dictSemigroup)(v1.value1)(v3.value1));
                    })(v2);
                }));
            };
        });
    };
};
var applicativeWriterT = function (dictMonoid) {
    return function (dictApplicative) {
        return new Control_Applicative.Applicative(function () {
            return applyWriterT(dictMonoid.Semigroup0())(dictApplicative.Apply0());
        }, function (a) {
            return WriterT(Control_Applicative.pure(dictApplicative)(new Data_Tuple.Tuple(a, Data_Monoid.mempty(dictMonoid))));
        });
    };
};
var monadWriterT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_Monad.Monad(function () {
            return applicativeWriterT(dictMonoid)(dictMonad.Applicative0());
        }, function () {
            return bindWriterT(dictMonoid.Semigroup0())(dictMonad.Bind1());
        });
    };
};
var monadAskWriterT = function (dictMonoid) {
    return function (dictMonadAsk) {
        return new Control_Monad_Reader_Class.MonadAsk(function () {
            return monadWriterT(dictMonoid)(dictMonadAsk.Monad0());
        }, Control_Monad_Trans_Class.lift(monadTransWriterT(dictMonoid))(dictMonadAsk.Monad0())(Control_Monad_Reader_Class.ask(dictMonadAsk)));
    };
};
var monadReaderWriterT = function (dictMonoid) {
    return function (dictMonadReader) {
        return new Control_Monad_Reader_Class.MonadReader(function () {
            return monadAskWriterT(dictMonoid)(dictMonadReader.MonadAsk0());
        }, function (f) {
            return mapWriterT(Control_Monad_Reader_Class.local(dictMonadReader)(f));
        });
    };
};
var monadContWriterT = function (dictMonoid) {
    return function (dictMonadCont) {
        return new Control_Monad_Cont_Class.MonadCont(function () {
            return monadWriterT(dictMonoid)(dictMonadCont.Monad0());
        }, function (f) {
            return WriterT(Control_Monad_Cont_Class.callCC(dictMonadCont)(function (c) {
                var v = f(function (a) {
                    return WriterT(c(new Data_Tuple.Tuple(a, Data_Monoid.mempty(dictMonoid))));
                });
                return v;
            }));
        });
    };
};
var monadEffectWriter = function (dictMonoid) {
    return function (dictMonadEffect) {
        return new Effect_Class.MonadEffect(function () {
            return monadWriterT(dictMonoid)(dictMonadEffect.Monad0());
        }, (function () {
            var $123 = Control_Monad_Trans_Class.lift(monadTransWriterT(dictMonoid))(dictMonadEffect.Monad0());
            var $124 = Effect_Class.liftEffect(dictMonadEffect);
            return function ($125) {
                return $123($124($125));
            };
        })());
    };
};
var monadRecWriterT = function (dictMonoid) {
    return function (dictMonadRec) {
        return new Control_Monad_Rec_Class.MonadRec(function () {
            return monadWriterT(dictMonoid)(dictMonadRec.Monad0());
        }, function (f) {
            return function (a) {
                var f$prime = function (v) {
                    var v1 = f(v.value0);
                    return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(v1)(function (v2) {
                        return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())((function () {
                            if (v2.value0 instanceof Control_Monad_Rec_Class.Loop) {
                                return new Control_Monad_Rec_Class.Loop(new Data_Tuple.Tuple(v2.value0.value0, Data_Semigroup.append(dictMonoid.Semigroup0())(v.value1)(v2.value1)));
                            };
                            if (v2.value0 instanceof Control_Monad_Rec_Class.Done) {
                                return new Control_Monad_Rec_Class.Done(new Data_Tuple.Tuple(v2.value0.value0, Data_Semigroup.append(dictMonoid.Semigroup0())(v.value1)(v2.value1)));
                            };
                            throw new Error("Failed pattern match at Control.Monad.Writer.Trans (line 83, column 16 - line 85, column 47): " + [ v2.value0.constructor.name ]);
                        })());
                    });
                };
                return WriterT(Control_Monad_Rec_Class.tailRecM(dictMonadRec)(f$prime)(new Data_Tuple.Tuple(a, Data_Monoid.mempty(dictMonoid))));
            };
        });
    };
};
var monadStateWriterT = function (dictMonoid) {
    return function (dictMonadState) {
        return new Control_Monad_State_Class.MonadState(function () {
            return monadWriterT(dictMonoid)(dictMonadState.Monad0());
        }, function (f) {
            return Control_Monad_Trans_Class.lift(monadTransWriterT(dictMonoid))(dictMonadState.Monad0())(Control_Monad_State_Class.state(dictMonadState)(f));
        });
    };
};
var monadTellWriterT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_Monad_Writer_Class.MonadTell(function () {
            return monadWriterT(dictMonoid)(dictMonad);
        }, (function () {
            var $126 = Control_Applicative.pure(dictMonad.Applicative0());
            var $127 = Data_Tuple.Tuple.create(Data_Unit.unit);
            return function ($128) {
                return WriterT($126($127($128)));
            };
        })());
    };
};
var monadWriterWriterT = function (dictMonoid) {
    return function (dictMonad) {
        return new Control_Monad_Writer_Class.MonadWriter(function () {
            return monadTellWriterT(dictMonoid)(dictMonad);
        }, function (v) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(function (v1) {
                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(new Data_Tuple.Tuple(v1.value0, v1.value1), v1.value1));
            });
        }, function (v) {
            return Control_Bind.bind(dictMonad.Bind1())(v)(function (v1) {
                return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Tuple.Tuple(v1.value0.value0, v1.value0.value1(v1.value1)));
            });
        });
    };
};
var monadThrowWriterT = function (dictMonoid) {
    return function (dictMonadThrow) {
        return new Control_Monad_Error_Class.MonadThrow(function () {
            return monadWriterT(dictMonoid)(dictMonadThrow.Monad0());
        }, function (e) {
            return Control_Monad_Trans_Class.lift(monadTransWriterT(dictMonoid))(dictMonadThrow.Monad0())(Control_Monad_Error_Class.throwError(dictMonadThrow)(e));
        });
    };
};
var monadErrorWriterT = function (dictMonoid) {
    return function (dictMonadError) {
        return new Control_Monad_Error_Class.MonadError(function () {
            return monadThrowWriterT(dictMonoid)(dictMonadError.MonadThrow0());
        }, function (v) {
            return function (h) {
                return WriterT(Control_Monad_Error_Class.catchError(dictMonadError)(v)(function (e) {
                    var v1 = h(e);
                    return v1;
                }));
            };
        });
    };
};
var altWriterT = function (dictAlt) {
    return new Control_Alt.Alt(function () {
        return functorWriterT(dictAlt.Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Alt.alt(dictAlt)(v)(v1);
        };
    });
};
var plusWriterT = function (dictPlus) {
    return new Control_Plus.Plus(function () {
        return altWriterT(dictPlus.Alt0());
    }, Control_Plus.empty(dictPlus));
};
var alternativeWriterT = function (dictMonoid) {
    return function (dictAlternative) {
        return new Control_Alternative.Alternative(function () {
            return applicativeWriterT(dictMonoid)(dictAlternative.Applicative0());
        }, function () {
            return plusWriterT(dictAlternative.Plus1());
        });
    };
};
var monadZeroWriterT = function (dictMonoid) {
    return function (dictMonadZero) {
        return new Control_MonadZero.MonadZero(function () {
            return alternativeWriterT(dictMonoid)(dictMonadZero.Alternative1());
        }, function () {
            return monadWriterT(dictMonoid)(dictMonadZero.Monad0());
        });
    };
};
var monadPlusWriterT = function (dictMonoid) {
    return function (dictMonadPlus) {
        return new Control_MonadPlus.MonadPlus(function () {
            return monadZeroWriterT(dictMonoid)(dictMonadPlus.MonadZero0());
        });
    };
};
module.exports = {
    WriterT: WriterT,
    runWriterT: runWriterT,
    execWriterT: execWriterT,
    mapWriterT: mapWriterT,
    newtypeWriterT: newtypeWriterT,
    functorWriterT: functorWriterT,
    applyWriterT: applyWriterT,
    applicativeWriterT: applicativeWriterT,
    altWriterT: altWriterT,
    plusWriterT: plusWriterT,
    alternativeWriterT: alternativeWriterT,
    bindWriterT: bindWriterT,
    monadWriterT: monadWriterT,
    monadRecWriterT: monadRecWriterT,
    monadZeroWriterT: monadZeroWriterT,
    monadPlusWriterT: monadPlusWriterT,
    monadTransWriterT: monadTransWriterT,
    monadEffectWriter: monadEffectWriter,
    monadContWriterT: monadContWriterT,
    monadThrowWriterT: monadThrowWriterT,
    monadErrorWriterT: monadErrorWriterT,
    monadAskWriterT: monadAskWriterT,
    monadReaderWriterT: monadReaderWriterT,
    monadStateWriterT: monadStateWriterT,
    monadTellWriterT: monadTellWriterT,
    monadWriterWriterT: monadWriterWriterT
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Cont.Class/index.js":19,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad.Reader.Class/index.js":24,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad.State.Class/index.js":29,"../Control.Monad.Trans.Class/index.js":30,"../Control.Monad.Writer.Class/index.js":31,"../Control.Monad/index.js":33,"../Control.MonadPlus/index.js":34,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Tuple/index.js":124,"../Data.Unit/index.js":132,"../Effect.Class/index.js":136}],33:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Monad = function (Applicative0, Bind1) {
    this.Applicative0 = Applicative0;
    this.Bind1 = Bind1;
};
var whenM = function (dictMonad) {
    return function (mb) {
        return function (m) {
            return Control_Bind.bind(dictMonad.Bind1())(mb)(function (v) {
                return Control_Applicative.when(dictMonad.Applicative0())(v)(m);
            });
        };
    };
};
var unlessM = function (dictMonad) {
    return function (mb) {
        return function (m) {
            return Control_Bind.bind(dictMonad.Bind1())(mb)(function (v) {
                return Control_Applicative.unless(dictMonad.Applicative0())(v)(m);
            });
        };
    };
};
var monadFn = new Monad(function () {
    return Control_Applicative.applicativeFn;
}, function () {
    return Control_Bind.bindFn;
});
var monadArray = new Monad(function () {
    return Control_Applicative.applicativeArray;
}, function () {
    return Control_Bind.bindArray;
});
var liftM1 = function (dictMonad) {
    return function (f) {
        return function (a) {
            return Control_Bind.bind(dictMonad.Bind1())(a)(function (v) {
                return Control_Applicative.pure(dictMonad.Applicative0())(f(v));
            });
        };
    };
};
var ap = function (dictMonad) {
    return function (f) {
        return function (a) {
            return Control_Bind.bind(dictMonad.Bind1())(f)(function (v) {
                return Control_Bind.bind(dictMonad.Bind1())(a)(function (v1) {
                    return Control_Applicative.pure(dictMonad.Applicative0())(v(v1));
                });
            });
        };
    };
};
module.exports = {
    Monad: Monad,
    liftM1: liftM1,
    ap: ap,
    whenM: whenM,
    unlessM: unlessM,
    monadFn: monadFn,
    monadArray: monadArray
};

},{"../Control.Applicative/index.js":7,"../Control.Bind/index.js":13}],34:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_MonadZero = require("../Control.MonadZero/index.js");
var MonadPlus = function (MonadZero0) {
    this.MonadZero0 = MonadZero0;
};
var monadPlusArray = new MonadPlus(function () {
    return Control_MonadZero.monadZeroArray;
});
module.exports = {
    MonadPlus: MonadPlus,
    monadPlusArray: monadPlusArray
};

},{"../Control.MonadZero/index.js":35}],35:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var MonadZero = function (Alternative1, Monad0) {
    this.Alternative1 = Alternative1;
    this.Monad0 = Monad0;
};
var monadZeroArray = new MonadZero(function () {
    return Control_Alternative.alternativeArray;
}, function () {
    return Control_Monad.monadArray;
});
var guard = function (dictMonadZero) {
    return function (v) {
        if (v) {
            return Control_Applicative.pure((dictMonadZero.Alternative1()).Applicative0())(Data_Unit.unit);
        };
        if (!v) {
            return Control_Plus.empty((dictMonadZero.Alternative1()).Plus1());
        };
        throw new Error("Failed pattern match at Control.MonadZero (line 54, column 1 - line 54, column 52): " + [ v.constructor.name ]);
    };
};
module.exports = {
    MonadZero: MonadZero,
    guard: guard,
    monadZeroArray: monadZeroArray
};

},{"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Monad/index.js":33,"../Control.Plus/index.js":38,"../Data.Unit/index.js":132}],36:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad_Cont_Trans = require("../Control.Monad.Cont.Trans/index.js");
var Control_Monad_Except_Trans = require("../Control.Monad.Except.Trans/index.js");
var Control_Monad_Maybe_Trans = require("../Control.Monad.Maybe.Trans/index.js");
var Control_Monad_Reader_Trans = require("../Control.Monad.Reader.Trans/index.js");
var Control_Monad_Writer_Trans = require("../Control.Monad.Writer.Trans/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_Compose = require("../Data.Functor.Compose/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var Effect_Ref = require("../Effect.Ref/index.js");
var ParCont = function (x) {
    return x;
};
var Parallel = function (Applicative1, Monad0, parallel, sequential) {
    this.Applicative1 = Applicative1;
    this.Monad0 = Monad0;
    this.parallel = parallel;
    this.sequential = sequential;
};
var sequential = function (dict) {
    return dict.sequential;
};
var parallel = function (dict) {
    return dict.parallel;
};
var newtypeParCont = new Data_Newtype.Newtype(function (n) {
    return n;
}, ParCont);
var monadParWriterT = function (dictMonoid) {
    return function (dictParallel) {
        return new Parallel(function () {
            return Control_Monad_Writer_Trans.applicativeWriterT(dictMonoid)(dictParallel.Applicative1());
        }, function () {
            return Control_Monad_Writer_Trans.monadWriterT(dictMonoid)(dictParallel.Monad0());
        }, Control_Monad_Writer_Trans.mapWriterT(parallel(dictParallel)), Control_Monad_Writer_Trans.mapWriterT(sequential(dictParallel)));
    };
};
var monadParReaderT = function (dictParallel) {
    return new Parallel(function () {
        return Control_Monad_Reader_Trans.applicativeReaderT(dictParallel.Applicative1());
    }, function () {
        return Control_Monad_Reader_Trans.monadReaderT(dictParallel.Monad0());
    }, Control_Monad_Reader_Trans.mapReaderT(parallel(dictParallel)), Control_Monad_Reader_Trans.mapReaderT(sequential(dictParallel)));
};
var monadParMaybeT = function (dictParallel) {
    return new Parallel(function () {
        return Data_Functor_Compose.applicativeCompose(dictParallel.Applicative1())(Data_Maybe.applicativeMaybe);
    }, function () {
        return Control_Monad_Maybe_Trans.monadMaybeT(dictParallel.Monad0());
    }, function (v) {
        return parallel(dictParallel)(v);
    }, function (v) {
        return sequential(dictParallel)(v);
    });
};
var monadParExceptT = function (dictParallel) {
    return new Parallel(function () {
        return Data_Functor_Compose.applicativeCompose(dictParallel.Applicative1())(Data_Either.applicativeEither);
    }, function () {
        return Control_Monad_Except_Trans.monadExceptT(dictParallel.Monad0());
    }, function (v) {
        return parallel(dictParallel)(v);
    }, function (v) {
        return sequential(dictParallel)(v);
    });
};
var monadParParCont = function (dictMonadEffect) {
    return new Parallel(function () {
        return applicativeParCont(dictMonadEffect);
    }, function () {
        return Control_Monad_Cont_Trans.monadContT(dictMonadEffect.Monad0());
    }, ParCont, function (v) {
        return v;
    });
};
var functorParCont = function (dictMonadEffect) {
    return new Data_Functor.Functor(function (f) {
        var $54 = parallel(monadParParCont(dictMonadEffect));
        var $55 = Data_Functor.map(Control_Monad_Cont_Trans.functorContT((((dictMonadEffect.Monad0()).Bind1()).Apply0()).Functor0()))(f);
        var $56 = sequential(monadParParCont(dictMonadEffect));
        return function ($57) {
            return $54($55($56($57)));
        };
    });
};
var applyParCont = function (dictMonadEffect) {
    return new Control_Apply.Apply(function () {
        return functorParCont(dictMonadEffect);
    }, function (v) {
        return function (v1) {
            return ParCont(function (k) {
                return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref["new"](Data_Maybe.Nothing.value)))(function (v2) {
                    return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref["new"](Data_Maybe.Nothing.value)))(function (v3) {
                        return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Control_Monad_Cont_Trans.runContT(v)(function (a) {
                            return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v3)))(function (v4) {
                                if (v4 instanceof Data_Maybe.Nothing) {
                                    return Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.write(new Data_Maybe.Just(a))(v2));
                                };
                                if (v4 instanceof Data_Maybe.Just) {
                                    return k(a(v4.value0));
                                };
                                throw new Error("Failed pattern match at Control.Parallel.Class (line 71, column 7 - line 73, column 26): " + [ v4.constructor.name ]);
                            });
                        }))(function () {
                            return Control_Monad_Cont_Trans.runContT(v1)(function (b) {
                                return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v2)))(function (v4) {
                                    if (v4 instanceof Data_Maybe.Nothing) {
                                        return Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.write(new Data_Maybe.Just(b))(v3));
                                    };
                                    if (v4 instanceof Data_Maybe.Just) {
                                        return k(v4.value0(b));
                                    };
                                    throw new Error("Failed pattern match at Control.Parallel.Class (line 77, column 7 - line 79, column 26): " + [ v4.constructor.name ]);
                                });
                            });
                        });
                    });
                });
            });
        };
    });
};
var applicativeParCont = function (dictMonadEffect) {
    return new Control_Applicative.Applicative(function () {
        return applyParCont(dictMonadEffect);
    }, (function () {
        var $58 = parallel(monadParParCont(dictMonadEffect));
        var $59 = Control_Applicative.pure(Control_Monad_Cont_Trans.applicativeContT((dictMonadEffect.Monad0()).Applicative0()));
        return function ($60) {
            return $58($59($60));
        };
    })());
};
var altParCont = function (dictMonadEffect) {
    return new Control_Alt.Alt(function () {
        return functorParCont(dictMonadEffect);
    }, function (v) {
        return function (v1) {
            return ParCont(function (k) {
                return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref["new"](false)))(function (v2) {
                    return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Control_Monad_Cont_Trans.runContT(v)(function (a) {
                        return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v2)))(function (v3) {
                            if (v3) {
                                return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())(Data_Unit.unit);
                            };
                            return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.write(true)(v2)))(function () {
                                return k(a);
                            });
                        });
                    }))(function () {
                        return Control_Monad_Cont_Trans.runContT(v1)(function (a) {
                            return Control_Bind.bind((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.read(v2)))(function (v3) {
                                if (v3) {
                                    return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())(Data_Unit.unit);
                                };
                                return Control_Bind.discard(Control_Bind.discardUnit)((dictMonadEffect.Monad0()).Bind1())(Effect_Class.liftEffect(dictMonadEffect)(Effect_Ref.write(true)(v2)))(function () {
                                    return k(a);
                                });
                            });
                        });
                    });
                });
            });
        };
    });
};
var plusParCont = function (dictMonadEffect) {
    return new Control_Plus.Plus(function () {
        return altParCont(dictMonadEffect);
    }, ParCont(function (v) {
        return Control_Applicative.pure((dictMonadEffect.Monad0()).Applicative0())(Data_Unit.unit);
    }));
};
var alternativeParCont = function (dictMonadEffect) {
    return new Control_Alternative.Alternative(function () {
        return applicativeParCont(dictMonadEffect);
    }, function () {
        return plusParCont(dictMonadEffect);
    });
};
module.exports = {
    parallel: parallel,
    sequential: sequential,
    Parallel: Parallel,
    ParCont: ParCont,
    monadParExceptT: monadParExceptT,
    monadParReaderT: monadParReaderT,
    monadParWriterT: monadParWriterT,
    monadParMaybeT: monadParMaybeT,
    newtypeParCont: newtypeParCont,
    functorParCont: functorParCont,
    applyParCont: applyParCont,
    applicativeParCont: applicativeParCont,
    altParCont: altParCont,
    plusParCont: plusParCont,
    alternativeParCont: alternativeParCont,
    monadParParCont: monadParParCont
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Cont.Trans/index.js":20,"../Control.Monad.Except.Trans/index.js":22,"../Control.Monad.Maybe.Trans/index.js":23,"../Control.Monad.Reader.Trans/index.js":25,"../Control.Monad.Writer.Trans/index.js":32,"../Control.Plus/index.js":38,"../Data.Either/index.js":65,"../Data.Functor.Compose/index.js":77,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Newtype/index.js":98,"../Data.Unit/index.js":132,"../Effect.Class/index.js":136,"../Effect.Ref/index.js":146}],37:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Parallel_Class = require("../Control.Parallel.Class/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var parTraverse_ = function (dictParallel) {
    return function (dictFoldable) {
        return function (f) {
            var $17 = Control_Parallel_Class.sequential(dictParallel);
            var $18 = Data_Foldable.traverse_(dictParallel.Applicative1())(dictFoldable)((function () {
                var $20 = Control_Parallel_Class.parallel(dictParallel);
                return function ($21) {
                    return $20(f($21));
                };
            })());
            return function ($19) {
                return $17($18($19));
            };
        };
    };
};
var parTraverse = function (dictParallel) {
    return function (dictTraversable) {
        return function (f) {
            var $22 = Control_Parallel_Class.sequential(dictParallel);
            var $23 = Data_Traversable.traverse(dictTraversable)(dictParallel.Applicative1())((function () {
                var $25 = Control_Parallel_Class.parallel(dictParallel);
                return function ($26) {
                    return $25(f($26));
                };
            })());
            return function ($24) {
                return $22($23($24));
            };
        };
    };
};
var parSequence_ = function (dictParallel) {
    return function (dictFoldable) {
        return parTraverse_(dictParallel)(dictFoldable)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var parSequence = function (dictParallel) {
    return function (dictTraversable) {
        return parTraverse(dictParallel)(dictTraversable)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var parOneOfMap = function (dictParallel) {
    return function (dictAlternative) {
        return function (dictFoldable) {
            return function (dictFunctor) {
                return function (f) {
                    var $27 = Control_Parallel_Class.sequential(dictParallel);
                    var $28 = Data_Foldable.oneOfMap(dictFoldable)(dictAlternative.Plus1())((function () {
                        var $30 = Control_Parallel_Class.parallel(dictParallel);
                        return function ($31) {
                            return $30(f($31));
                        };
                    })());
                    return function ($29) {
                        return $27($28($29));
                    };
                };
            };
        };
    };
};
var parOneOf = function (dictParallel) {
    return function (dictAlternative) {
        return function (dictFoldable) {
            return function (dictFunctor) {
                var $32 = Control_Parallel_Class.sequential(dictParallel);
                var $33 = Data_Foldable.oneOfMap(dictFoldable)(dictAlternative.Plus1())(Control_Parallel_Class.parallel(dictParallel));
                return function ($34) {
                    return $32($33($34));
                };
            };
        };
    };
};
var parApply = function (dictParallel) {
    return function (mf) {
        return function (ma) {
            return Control_Parallel_Class.sequential(dictParallel)(Control_Apply.apply((dictParallel.Applicative1()).Apply0())(Control_Parallel_Class.parallel(dictParallel)(mf))(Control_Parallel_Class.parallel(dictParallel)(ma)));
        };
    };
};
module.exports = {
    parApply: parApply,
    parTraverse: parTraverse,
    parTraverse_: parTraverse_,
    parSequence: parSequence,
    parSequence_: parSequence_,
    parOneOf: parOneOf,
    parOneOfMap: parOneOfMap
};

},{"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Control.Parallel.Class/index.js":36,"../Data.Foldable/index.js":71,"../Data.Traversable/index.js":122}],38:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Plus = function (Alt0, empty) {
    this.Alt0 = Alt0;
    this.empty = empty;
};
var plusArray = new Plus(function () {
    return Control_Alt.altArray;
}, [  ]);
var empty = function (dict) {
    return dict.empty;
};
module.exports = {
    Plus: Plus,
    empty: empty,
    plusArray: plusArray
};

},{"../Control.Alt/index.js":5}],39:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Semigroupoid = function (compose) {
    this.compose = compose;
};
var semigroupoidFn = new Semigroupoid(function (f) {
    return function (g) {
        return function (x) {
            return f(g(x));
        };
    };
});
var compose = function (dict) {
    return dict.compose;
};
var composeFlipped = function (dictSemigroupoid) {
    return function (f) {
        return function (g) {
            return compose(dictSemigroupoid)(g)(f);
        };
    };
};
module.exports = {
    compose: compose,
    Semigroupoid: Semigroupoid,
    composeFlipped: composeFlipped,
    semigroupoidFn: semigroupoidFn
};

},{}],40:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Monad_ST_Internal = require("../Control.Monad.ST.Internal/index.js");
var Data_Array_ST = require("../Data.Array.ST/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Iterator = (function () {
    function Iterator(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Iterator.create = function (value0) {
        return function (value1) {
            return new Iterator(value0, value1);
        };
    };
    return Iterator;
})();
var peek = function (v) {
    return function __do() {
        var v1 = Control_Monad_ST_Internal.read(v.value1)();
        return v.value0(v1);
    };
};
var next = function (v) {
    return function __do() {
        var v1 = Control_Monad_ST_Internal.read(v.value1)();
        var v2 = Control_Monad_ST_Internal.modify(function (v2) {
            return v2 + 1 | 0;
        })(v.value1)();
        return v.value0(v1);
    };
};
var pushWhile = function (p) {
    return function (iter) {
        return function (array) {
            return function __do() {
                var v = Control_Monad_ST_Internal["new"](false)();
                while (Data_Functor.map(Control_Monad_ST_Internal.functorST)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean))(Control_Monad_ST_Internal.read(v))()) {
                    (function __do() {
                        var v1 = peek(iter)();
                        if (v1 instanceof Data_Maybe.Just && p(v1.value0)) {
                            var v2 = Data_Array_ST.push(v1.value0)(array)();
                            return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(next(iter))();
                        };
                        return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Control_Monad_ST_Internal.write(true)(v))();
                    })();
                };
                return {};
            };
        };
    };
};
var pushAll = pushWhile(Data_Function["const"](true));
var iterator = function (f) {
    return Data_Functor.map(Control_Monad_ST_Internal.functorST)(Iterator.create(f))(Control_Monad_ST_Internal["new"](0));
};
var iterate = function (iter) {
    return function (f) {
        return function __do() {
            var v = Control_Monad_ST_Internal["new"](false)();
            while (Data_Functor.map(Control_Monad_ST_Internal.functorST)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean))(Control_Monad_ST_Internal.read(v))()) {
                (function __do() {
                    var v1 = next(iter)();
                    if (v1 instanceof Data_Maybe.Just) {
                        return f(v1.value0)();
                    };
                    if (v1 instanceof Data_Maybe.Nothing) {
                        return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Control_Monad_ST_Internal.write(true)(v))();
                    };
                    throw new Error("Failed pattern match at Data.Array.ST.Iterator (line 42, column 5 - line 44, column 47): " + [ v1.constructor.name ]);
                })();
            };
            return {};
        };
    };
};
var exhausted = (function () {
    var $27 = Data_Functor.map(Control_Monad_ST_Internal.functorST)(Data_Maybe.isNothing);
    return function ($28) {
        return $27(peek($28));
    };
})();
module.exports = {
    iterator: iterator,
    iterate: iterate,
    next: next,
    peek: peek,
    exhausted: exhausted,
    pushWhile: pushWhile,
    pushAll: pushAll
};

},{"../Control.Monad.ST.Internal/index.js":28,"../Data.Array.ST/index.js":42,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Maybe/index.js":90}],41:[function(require,module,exports){
"use strict";

exports.empty = function () {
  return [];
};

exports.peekImpl = function (just) {
  return function (nothing) {
    return function (i) {
      return function (xs) {
        return function () {
          return i >= 0 && i < xs.length ? just(xs[i]) : nothing;
        };
      };
    };
  };
};

exports.poke = function (i) {
  return function (a) {
    return function (xs) {
      return function () {
        var ret = i >= 0 && i < xs.length;
        if (ret) xs[i] = a;
        return ret;
      };
    };
  };
};

exports.popImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function () {
        return xs.length > 0 ? just(xs.pop()) : nothing;
      };
    };
  };
};

exports.pushAll = function (as) {
  return function (xs) {
    return function () {
      return xs.push.apply(xs, as);
    };
  };
};

exports.shiftImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function () {
        return xs.length > 0 ? just(xs.shift()) : nothing;
      };
    };
  };
};

exports.unshiftAll = function (as) {
  return function (xs) {
    return function () {
      return xs.unshift.apply(xs, as);
    };
  };
};

exports.splice = function (i) {
  return function (howMany) {
    return function (bs) {
      return function (xs) {
        return function () {
          return xs.splice.apply(xs, [i, howMany].concat(bs));
        };
      };
    };
  };
};

exports.unsafeFreeze = function (xs) {
  return function () {
    return xs;
  };
};

exports.unsafeThaw = function (xs) {
  return function () {
    return xs;
  };
};

function copyImpl(xs) {
  return function () {
    return xs.slice();
  };
}

exports.freeze = copyImpl;

exports.thaw = copyImpl;

exports.sortByImpl = function (comp) {
  return function (xs) {
    return function () {
      return xs.sort(function (x, y) {
        return comp(x)(y);
      });
    };
  };
};

exports.toAssocArray = function (xs) {
  return function () {
    var n = xs.length;
    var as = new Array(n);
    for (var i = 0; i < n; i++) as[i] = { value: xs[i], index: i };
    return as;
  };
};

},{}],42:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad_ST_Internal = require("../Control.Monad.ST.Internal/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var withArray = function (f) {
    return function (xs) {
        return function __do() {
            var v = $foreign.thaw(xs)();
            var v1 = f(v)();
            return $foreign.unsafeFreeze(v)();
        };
    };
};
var unshift = function (a) {
    return $foreign.unshiftAll([ a ]);
};
var sortBy = function (comp) {
    var comp$prime = function (x) {
        return function (y) {
            var v = comp(x)(y);
            if (v instanceof Data_Ordering.GT) {
                return 1;
            };
            if (v instanceof Data_Ordering.EQ) {
                return 0;
            };
            if (v instanceof Data_Ordering.LT) {
                return -1 | 0;
            };
            throw new Error("Failed pattern match at Data.Array.ST (line 105, column 15 - line 108, column 13): " + [ v.constructor.name ]);
        };
    };
    return $foreign.sortByImpl(comp$prime);
};
var sortWith = function (dictOrd) {
    return function (f) {
        return sortBy(Data_Ord.comparing(dictOrd)(f));
    };
};
var sort = function (dictOrd) {
    return sortBy(Data_Ord.compare(dictOrd));
};
var shift = $foreign.shiftImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var run = function (st) {
    return Control_Bind.bind(Control_Monad_ST_Internal.bindST)(st)($foreign.unsafeFreeze)();
};
var push = function (a) {
    return $foreign.pushAll([ a ]);
};
var pop = $foreign.popImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var peek = $foreign.peekImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var modify = function (i) {
    return function (f) {
        return function (xs) {
            return function __do() {
                var v = peek(i)(xs)();
                if (v instanceof Data_Maybe.Just) {
                    return $foreign.poke(i)(f(v.value0))(xs)();
                };
                if (v instanceof Data_Maybe.Nothing) {
                    return false;
                };
                throw new Error("Failed pattern match at Data.Array.ST (line 188, column 3 - line 190, column 26): " + [ v.constructor.name ]);
            };
        };
    };
};
module.exports = {
    run: run,
    withArray: withArray,
    peek: peek,
    modify: modify,
    pop: pop,
    push: push,
    shift: shift,
    unshift: unshift,
    sort: sort,
    sortBy: sortBy,
    sortWith: sortWith,
    empty: $foreign.empty,
    poke: $foreign.poke,
    pushAll: $foreign.pushAll,
    unshiftAll: $foreign.unshiftAll,
    splice: $foreign.splice,
    freeze: $foreign.freeze,
    thaw: $foreign.thaw,
    unsafeFreeze: $foreign.unsafeFreeze,
    unsafeThaw: $foreign.unsafeThaw,
    toAssocArray: $foreign.toAssocArray
};

},{"../Control.Bind/index.js":13,"../Control.Monad.ST.Internal/index.js":28,"../Data.Maybe/index.js":90,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"./foreign.js":41}],43:[function(require,module,exports){
"use strict";

//------------------------------------------------------------------------------
// Array creation --------------------------------------------------------------
//------------------------------------------------------------------------------

exports.range = function (start) {
  return function (end) {
    var step = start > end ? -1 : 1;
    var result = new Array(step * (end - start) + 1);
    var i = start, n = 0;
    while (i !== end) {
      result[n++] = i;
      i += step;
    }
    result[n] = i;
    return result;
  };
};

var replicateFill = function (count) {
  return function (value) {
    if (count < 1) {
      return [];
    }
    var result = new Array(count);
    return result.fill(value);
  };
};

var replicatePolyfill = function (count) {
  return function (value) {
    var result = [];
    var n = 0;
    for (var i = 0; i < count; i++) {
      result[n++] = value;
    }
    return result;
  };
};

// In browsers that have Array.prototype.fill we use it, as it's faster.
exports.replicate = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;

exports.fromFoldableImpl = (function () {
  function Cons(head, tail) {
    this.head = head;
    this.tail = tail;
  }
  var emptyList = {};

  function curryCons(head) {
    return function (tail) {
      return new Cons(head, tail);
    };
  }

  function listToArray(list) {
    var result = [];
    var count = 0;
    var xs = list;
    while (xs !== emptyList) {
      result[count++] = xs.head;
      xs = xs.tail;
    }
    return result;
  }

  return function (foldr) {
    return function (xs) {
      return listToArray(foldr(curryCons)(emptyList)(xs));
    };
  };
})();

//------------------------------------------------------------------------------
// Array size ------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.length = function (xs) {
  return xs.length;
};

//------------------------------------------------------------------------------
// Extending arrays ------------------------------------------------------------
//------------------------------------------------------------------------------

exports.cons = function (e) {
  return function (l) {
    return [e].concat(l);
  };
};

exports.snoc = function (l) {
  return function (e) {
    var l1 = l.slice();
    l1.push(e);
    return l1;
  };
};

//------------------------------------------------------------------------------
// Non-indexed reads -----------------------------------------------------------
//------------------------------------------------------------------------------

exports["uncons'"] = function (empty) {
  return function (next) {
    return function (xs) {
      return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
    };
  };
};

//------------------------------------------------------------------------------
// Indexed operations ----------------------------------------------------------
//------------------------------------------------------------------------------

exports.indexImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function (i) {
        return i < 0 || i >= xs.length ? nothing :  just(xs[i]);
      };
    };
  };
};

exports.findIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports.findLastIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = xs.length - 1; i >= 0; i--) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports._insertAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i > l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 0, a);
          return just(l1);
        };
      };
    };
  };
};

exports._deleteAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (l) {
        if (i < 0 || i >= l.length) return nothing;
        var l1 = l.slice();
        l1.splice(i, 1);
        return just(l1);
      };
    };
  };
};

exports._updateAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1[i] = a;
          return just(l1);
        };
      };
    };
  };
};

//------------------------------------------------------------------------------
// Transformations -------------------------------------------------------------
//------------------------------------------------------------------------------

exports.reverse = function (l) {
  return l.slice().reverse();
};

exports.concat = function (xss) {
  if (xss.length <= 10000) {
    // This method is faster, but it crashes on big arrays.
    // So we use it when can and fallback to simple variant otherwise.
    return Array.prototype.concat.apply([], xss);
  }

  var result = [];
  for (var i = 0, l = xss.length; i < l; i++) {
    var xs = xss[i];
    for (var j = 0, m = xs.length; j < m; j++) {
      result.push(xs[j]);
    }
  }
  return result;
};

exports.filter = function (f) {
  return function (xs) {
    return xs.filter(f);
  };
};

exports.partition = function (f) {
  return function (xs) {
    var yes = [];
    var no  = [];
    for (var i = 0; i < xs.length; i++) {
      var x = xs[i];
      if (f(x))
        yes.push(x);
      else
        no.push(x);
    }
    return { yes: yes, no: no };
  };
};

//------------------------------------------------------------------------------
// Sorting ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.sortImpl = function (f) {
  return function (l) {
    return l.slice().sort(function (x, y) {
      return f(x)(y);
    });
  };
};

//------------------------------------------------------------------------------
// Subarrays -------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.slice = function (s) {
  return function (e) {
    return function (l) {
      return l.slice(s, e);
    };
  };
};

exports.take = function (n) {
  return function (l) {
    return n < 1 ? [] : l.slice(0, n);
  };
};

exports.drop = function (n) {
  return function (l) {
    return n < 1 ? l : l.slice(n);
  };
};

//------------------------------------------------------------------------------
// Zipping ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.zipWith = function (f) {
  return function (xs) {
    return function (ys) {
      var l = xs.length < ys.length ? xs.length : ys.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(xs[i])(ys[i]);
      }
      return result;
    };
  };
};

//------------------------------------------------------------------------------
// Partial ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.unsafeIndexImpl = function (xs) {
  return function (n) {
    return xs[n];
  };
};

},{}],44:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Alt = require("../Control.Alt/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Lazy = require("../Control.Lazy/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Monad_ST_Internal = require("../Control.Monad.ST.Internal/index.js");
var Data_Array_ST = require("../Data.Array.ST/index.js");
var Data_Array_ST_Iterator = require("../Data.Array.ST.Iterator/index.js");
var Data_Boolean = require("../Data.Boolean/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unfoldable = require("../Data.Unfoldable/index.js");
var zipWithA = function (dictApplicative) {
    return function (f) {
        return function (xs) {
            return function (ys) {
                return Data_Traversable.sequence(Data_Traversable.traversableArray)(dictApplicative)($foreign.zipWith(f)(xs)(ys));
            };
        };
    };
};
var zip = $foreign.zipWith(Data_Tuple.Tuple.create);
var updateAtIndices = function (dictFoldable) {
    return function (us) {
        return function (xs) {
            return Data_Array_ST.withArray(function (res) {
                return Data_Foldable.traverse_(Control_Monad_ST_Internal.applicativeST)(dictFoldable)(function (v) {
                    return Data_Array_ST.poke(v.value0)(v.value1)(res);
                })(us);
            })(xs)();
        };
    };
};
var updateAt = $foreign["_updateAt"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var unsafeIndex = function (dictPartial) {
    return $foreign.unsafeIndexImpl;
};
var uncons = $foreign["uncons'"](Data_Function["const"](Data_Maybe.Nothing.value))(function (x) {
    return function (xs) {
        return new Data_Maybe.Just({
            head: x,
            tail: xs
        });
    };
});
var toUnfoldable = function (dictUnfoldable) {
    return function (xs) {
        var len = $foreign.length(xs);
        var f = function (i) {
            if (i < len) {
                return new Data_Maybe.Just(new Data_Tuple.Tuple(unsafeIndex()(xs)(i), i + 1 | 0));
            };
            if (Data_Boolean.otherwise) {
                return Data_Maybe.Nothing.value;
            };
            throw new Error("Failed pattern match at Data.Array (line 143, column 3 - line 145, column 26): " + [ i.constructor.name ]);
        };
        return Data_Unfoldable.unfoldr(dictUnfoldable)(f)(0);
    };
};
var takeEnd = function (n) {
    return function (xs) {
        return $foreign.drop($foreign.length(xs) - n | 0)(xs);
    };
};
var tail = $foreign["uncons'"](Data_Function["const"](Data_Maybe.Nothing.value))(function (v) {
    return function (xs) {
        return new Data_Maybe.Just(xs);
    };
});
var sortBy = function (comp) {
    return function (xs) {
        var comp$prime = function (x) {
            return function (y) {
                var v = comp(x)(y);
                if (v instanceof Data_Ordering.GT) {
                    return 1;
                };
                if (v instanceof Data_Ordering.EQ) {
                    return 0;
                };
                if (v instanceof Data_Ordering.LT) {
                    return -1 | 0;
                };
                throw new Error("Failed pattern match at Data.Array (line 702, column 15 - line 705, column 13): " + [ v.constructor.name ]);
            };
        };
        return $foreign.sortImpl(comp$prime)(xs);
    };
};
var sortWith = function (dictOrd) {
    return function (f) {
        return sortBy(Data_Ord.comparing(dictOrd)(f));
    };
};
var sort = function (dictOrd) {
    return function (xs) {
        return sortBy(Data_Ord.compare(dictOrd))(xs);
    };
};
var singleton = function (a) {
    return [ a ];
};
var $$null = function (xs) {
    return $foreign.length(xs) === 0;
};
var nubByEq = function (eq) {
    return function (xs) {
        return (function __do() {
            var v = Data_Array_ST.empty();
            Control_Monad_ST_Internal.foreach(xs)(function (x) {
                return function __do() {
                    var v1 = Data_Functor.map(Control_Monad_ST_Internal.functorST)((function () {
                        var $113 = Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean);
                        var $114 = Data_Foldable.any(Data_Foldable.foldableArray)(Data_HeytingAlgebra.heytingAlgebraBoolean)(function (v1) {
                            return eq(v1)(x);
                        });
                        return function ($115) {
                            return $113($114($115));
                        };
                    })())(Data_Array_ST.unsafeFreeze(v))();
                    return Control_Applicative.when(Control_Monad_ST_Internal.applicativeST)(v1)(Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(x)(v)))();
                };
            })();
            return Data_Array_ST.unsafeFreeze(v)();
        })();
    };
};
var nubEq = function (dictEq) {
    return nubByEq(Data_Eq.eq(dictEq));
};
var modifyAtIndices = function (dictFoldable) {
    return function (is) {
        return function (f) {
            return function (xs) {
                return Data_Array_ST.withArray(function (res) {
                    return Data_Foldable.traverse_(Control_Monad_ST_Internal.applicativeST)(dictFoldable)(function (i) {
                        return Data_Array_ST.modify(i)(f)(res);
                    })(is);
                })(xs)();
            };
        };
    };
};
var mapWithIndex = function (f) {
    return function (xs) {
        return $foreign.zipWith(f)($foreign.range(0)($foreign.length(xs) - 1 | 0))(xs);
    };
};
var some = function (dictAlternative) {
    return function (dictLazy) {
        return function (v) {
            return Control_Apply.apply((dictAlternative.Applicative0()).Apply0())(Data_Functor.map(((dictAlternative.Plus1()).Alt0()).Functor0())($foreign.cons)(v))(Control_Lazy.defer(dictLazy)(function (v1) {
                return many(dictAlternative)(dictLazy)(v);
            }));
        };
    };
};
var many = function (dictAlternative) {
    return function (dictLazy) {
        return function (v) {
            return Control_Alt.alt((dictAlternative.Plus1()).Alt0())(some(dictAlternative)(dictLazy)(v))(Control_Applicative.pure(dictAlternative.Applicative0())([  ]));
        };
    };
};
var insertAt = $foreign["_insertAt"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var init = function (xs) {
    if ($$null(xs)) {
        return Data_Maybe.Nothing.value;
    };
    if (Data_Boolean.otherwise) {
        return new Data_Maybe.Just($foreign.slice(0)($foreign.length(xs) - 1 | 0)(xs));
    };
    throw new Error("Failed pattern match at Data.Array (line 323, column 1 - line 323, column 45): " + [ xs.constructor.name ]);
};
var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var last = function (xs) {
    return index(xs)($foreign.length(xs) - 1 | 0);
};
var unsnoc = function (xs) {
    return Control_Apply.apply(Data_Maybe.applyMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(function (v) {
        return function (v1) {
            return {
                init: v,
                last: v1
            };
        };
    })(init(xs)))(last(xs));
};
var modifyAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                return updateAt(i)(f(x))(xs);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)(index(xs)(i));
        };
    };
};
var span = function (p) {
    return function (arr) {
        var go = function ($copy_i) {
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(i) {
                var v = index(arr)(i);
                if (v instanceof Data_Maybe.Just) {
                    var $77 = p(v.value0);
                    if ($77) {
                        $copy_i = i + 1 | 0;
                        return;
                    };
                    $tco_done = true;
                    return new Data_Maybe.Just(i);
                };
                if (v instanceof Data_Maybe.Nothing) {
                    $tco_done = true;
                    return Data_Maybe.Nothing.value;
                };
                throw new Error("Failed pattern match at Data.Array (line 834, column 5 - line 836, column 25): " + [ v.constructor.name ]);
            };
            while (!$tco_done) {
                $tco_result = $tco_loop($copy_i);
            };
            return $tco_result;
        };
        var breakIndex = go(0);
        if (breakIndex instanceof Data_Maybe.Just && breakIndex.value0 === 0) {
            return {
                init: [  ],
                rest: arr
            };
        };
        if (breakIndex instanceof Data_Maybe.Just) {
            return {
                init: $foreign.slice(0)(breakIndex.value0)(arr),
                rest: $foreign.slice(breakIndex.value0)($foreign.length(arr))(arr)
            };
        };
        if (breakIndex instanceof Data_Maybe.Nothing) {
            return {
                init: arr,
                rest: [  ]
            };
        };
        throw new Error("Failed pattern match at Data.Array (line 821, column 3 - line 827, column 30): " + [ breakIndex.constructor.name ]);
    };
};
var takeWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).init;
    };
};
var unzip = function (xs) {
    return (function __do() {
        var v = Data_Array_ST.empty();
        var v1 = Data_Array_ST.empty();
        var v2 = Data_Array_ST_Iterator.iterator(function (v2) {
            return index(xs)(v2);
        })();
        Data_Array_ST_Iterator.iterate(v2)(function (v3) {
            return function __do() {
                Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v3.value0)(v))();
                return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v3.value1)(v1))();
            };
        })();
        var v3 = Data_Array_ST.unsafeFreeze(v)();
        var v4 = Data_Array_ST.unsafeFreeze(v1)();
        return new Data_Tuple.Tuple(v3, v4);
    })();
};
var head = function (xs) {
    return index(xs)(0);
};
var nubBy = function (comp) {
    return function (xs) {
        var indexedAndSorted = sortBy(function (x) {
            return function (y) {
                return comp(Data_Tuple.snd(x))(Data_Tuple.snd(y));
            };
        })(mapWithIndex(Data_Tuple.Tuple.create)(xs));
        var v = head(indexedAndSorted);
        if (v instanceof Data_Maybe.Nothing) {
            return [  ];
        };
        if (v instanceof Data_Maybe.Just) {
            return Data_Functor.map(Data_Functor.functorArray)(Data_Tuple.snd)(sortWith(Data_Ord.ordInt)(Data_Tuple.fst)((function __do() {
                var v1 = Data_Array_ST.unsafeThaw(singleton(v.value0))();
                Control_Monad_ST_Internal.foreach(indexedAndSorted)(function (v2) {
                    return function __do() {
                        var v3 = Data_Functor.map(Control_Monad_ST_Internal.functorST)((function () {
                            var $116 = (function (dictPartial) {
                                var $118 = Data_Maybe.fromJust(dictPartial);
                                return function ($119) {
                                    return $118(last($119));
                                };
                            })();
                            return function ($117) {
                                return Data_Tuple.snd($116($117));
                            };
                        })())(Data_Array_ST.unsafeFreeze(v1))();
                        return Control_Applicative.when(Control_Monad_ST_Internal.applicativeST)(Data_Eq.notEq(Data_Ordering.eqOrdering)(comp(v3)(v2.value1))(Data_Ordering.EQ.value))(Data_Functor["void"](Control_Monad_ST_Internal.functorST)(Data_Array_ST.push(v2)(v1)))();
                    };
                })();
                return Data_Array_ST.unsafeFreeze(v1)();
            })()));
        };
        throw new Error("Failed pattern match at Data.Array (line 903, column 17 - line 911, column 29): " + [ v.constructor.name ]);
    };
};
var nub = function (dictOrd) {
    return nubBy(Data_Ord.compare(dictOrd));
};
var groupBy = function (op) {
    return function (xs) {
        return (function __do() {
            var v = Data_Array_ST.empty();
            var v1 = Data_Array_ST_Iterator.iterator(function (v1) {
                return index(xs)(v1);
            })();
            Data_Array_ST_Iterator.iterate(v1)(function (x) {
                return Data_Functor["void"](Control_Monad_ST_Internal.functorST)(function __do() {
                    var v2 = Data_Array_ST.empty();
                    var v3 = Data_Array_ST.push(x)(v2)();
                    Data_Array_ST_Iterator.pushWhile(op(x))(v1)(v2)();
                    var v4 = Data_Array_ST.unsafeFreeze(v2)();
                    return Data_Array_ST.push(v4)(v)();
                });
            })();
            return Data_Array_ST.unsafeFreeze(v)();
        })();
    };
};
var group = function (dictEq) {
    return function (xs) {
        return groupBy(Data_Eq.eq(dictEq))(xs);
    };
};
var group$prime = function (dictOrd) {
    var $120 = group(dictOrd.Eq0());
    var $121 = sort(dictOrd);
    return function ($122) {
        return $120($121($122));
    };
};
var fromFoldable = function (dictFoldable) {
    return $foreign.fromFoldableImpl(Data_Foldable.foldr(dictFoldable));
};
var foldRecM = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (array) {
                var go = function (res) {
                    return function (i) {
                        if (i >= $foreign.length(array)) {
                            return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())(new Control_Monad_Rec_Class.Done(res));
                        };
                        if (Data_Boolean.otherwise) {
                            return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(f(res)(unsafeIndex()(array)(i)))(function (v) {
                                return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())(new Control_Monad_Rec_Class.Loop({
                                    a: v,
                                    b: i + 1 | 0
                                }));
                            });
                        };
                        throw new Error("Failed pattern match at Data.Array (line 1101, column 3 - line 1105, column 42): " + [ res.constructor.name, i.constructor.name ]);
                    };
                };
                return Control_Monad_Rec_Class.tailRecM2(dictMonadRec)(go)(a)(0);
            };
        };
    };
};
var foldM = function (dictMonad) {
    return function (f) {
        return function (a) {
            return $foreign["uncons'"](function (v) {
                return Control_Applicative.pure(dictMonad.Applicative0())(a);
            })(function (b) {
                return function (bs) {
                    return Control_Bind.bind(dictMonad.Bind1())(f(a)(b))(function (a$prime) {
                        return foldM(dictMonad)(f)(a$prime)(bs);
                    });
                };
            });
        };
    };
};
var findLastIndex = $foreign.findLastIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var insertBy = function (cmp) {
    return function (x) {
        return function (ys) {
            var i = Data_Maybe.maybe(0)(function (v) {
                return v + 1 | 0;
            })(findLastIndex(function (y) {
                return Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(x)(y))(Data_Ordering.GT.value);
            })(ys));
            return Data_Maybe.fromJust()(insertAt(i)(x)(ys));
        };
    };
};
var insert = function (dictOrd) {
    return insertBy(Data_Ord.compare(dictOrd));
};
var findIndex = $foreign.findIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var intersectBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return $foreign.filter(function (x) {
                return Data_Maybe.isJust(findIndex(eq(x))(ys));
            })(xs);
        };
    };
};
var intersect = function (dictEq) {
    return intersectBy(Data_Eq.eq(dictEq));
};
var elemLastIndex = function (dictEq) {
    return function (x) {
        return findLastIndex(function (v) {
            return Data_Eq.eq(dictEq)(v)(x);
        });
    };
};
var elemIndex = function (dictEq) {
    return function (x) {
        return findIndex(function (v) {
            return Data_Eq.eq(dictEq)(v)(x);
        });
    };
};
var dropWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).rest;
    };
};
var dropEnd = function (n) {
    return function (xs) {
        return $foreign.take($foreign.length(xs) - n | 0)(xs);
    };
};
var deleteAt = $foreign["_deleteAt"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var deleteBy = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2.length === 0) {
                return [  ];
            };
            return Data_Maybe.maybe(v2)(function (i) {
                return Data_Maybe.fromJust()(deleteAt(i)(v2));
            })(findIndex(v(v1))(v2));
        };
    };
};
var unionBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return Data_Semigroup.append(Data_Semigroup.semigroupArray)(xs)(Data_Foldable.foldl(Data_Foldable.foldableArray)(Data_Function.flip(deleteBy(eq)))(nubByEq(eq)(ys))(xs));
        };
    };
};
var union = function (dictEq) {
    return unionBy(Data_Eq.eq(dictEq));
};
var $$delete = function (dictEq) {
    return deleteBy(Data_Eq.eq(dictEq));
};
var difference = function (dictEq) {
    return Data_Foldable.foldr(Data_Foldable.foldableArray)($$delete(dictEq));
};
var concatMap = Data_Function.flip(Control_Bind.bind(Control_Bind.bindArray));
var mapMaybe = function (f) {
    return concatMap((function () {
        var $123 = Data_Maybe.maybe([  ])(singleton);
        return function ($124) {
            return $123(f($124));
        };
    })());
};
var filterA = function (dictApplicative) {
    return function (p) {
        var $125 = Data_Functor.map((dictApplicative.Apply0()).Functor0())(mapMaybe(function (v) {
            if (v.value1) {
                return new Data_Maybe.Just(v.value0);
            };
            return Data_Maybe.Nothing.value;
        }));
        var $126 = Data_Traversable.traverse(Data_Traversable.traversableArray)(dictApplicative)(function (x) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Tuple.Tuple.create(x))(p(x));
        });
        return function ($127) {
            return $125($126($127));
        };
    };
};
var catMaybes = mapMaybe(Control_Category.identity(Control_Category.categoryFn));
var alterAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                var v = f(x);
                if (v instanceof Data_Maybe.Nothing) {
                    return deleteAt(i)(xs);
                };
                if (v instanceof Data_Maybe.Just) {
                    return updateAt(i)(v.value0)(xs);
                };
                throw new Error("Failed pattern match at Data.Array (line 544, column 10 - line 546, column 32): " + [ v.constructor.name ]);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)(index(xs)(i));
        };
    };
};
module.exports = {
    fromFoldable: fromFoldable,
    toUnfoldable: toUnfoldable,
    singleton: singleton,
    some: some,
    many: many,
    "null": $$null,
    insert: insert,
    insertBy: insertBy,
    head: head,
    last: last,
    tail: tail,
    init: init,
    uncons: uncons,
    unsnoc: unsnoc,
    index: index,
    elemIndex: elemIndex,
    elemLastIndex: elemLastIndex,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    insertAt: insertAt,
    deleteAt: deleteAt,
    updateAt: updateAt,
    updateAtIndices: updateAtIndices,
    modifyAt: modifyAt,
    modifyAtIndices: modifyAtIndices,
    alterAt: alterAt,
    concatMap: concatMap,
    filterA: filterA,
    mapMaybe: mapMaybe,
    catMaybes: catMaybes,
    mapWithIndex: mapWithIndex,
    sort: sort,
    sortBy: sortBy,
    sortWith: sortWith,
    takeEnd: takeEnd,
    takeWhile: takeWhile,
    dropEnd: dropEnd,
    dropWhile: dropWhile,
    span: span,
    group: group,
    "group'": group$prime,
    groupBy: groupBy,
    nub: nub,
    nubEq: nubEq,
    nubBy: nubBy,
    nubByEq: nubByEq,
    union: union,
    unionBy: unionBy,
    "delete": $$delete,
    deleteBy: deleteBy,
    difference: difference,
    intersect: intersect,
    intersectBy: intersectBy,
    zipWithA: zipWithA,
    zip: zip,
    unzip: unzip,
    foldM: foldM,
    foldRecM: foldRecM,
    unsafeIndex: unsafeIndex,
    range: $foreign.range,
    replicate: $foreign.replicate,
    length: $foreign.length,
    cons: $foreign.cons,
    snoc: $foreign.snoc,
    reverse: $foreign.reverse,
    concat: $foreign.concat,
    filter: $foreign.filter,
    partition: $foreign.partition,
    slice: $foreign.slice,
    take: $foreign.take,
    drop: $foreign.drop,
    zipWith: $foreign.zipWith
};

},{"../Control.Alt/index.js":5,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Control.Lazy/index.js":18,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad.ST.Internal/index.js":28,"../Data.Array.ST.Iterator/index.js":40,"../Data.Array.ST/index.js":42,"../Data.Boolean/index.js":58,"../Data.Eq/index.js":67,"../Data.Foldable/index.js":71,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Maybe/index.js":90,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Semigroup/index.js":113,"../Data.Traversable/index.js":122,"../Data.Tuple/index.js":124,"../Data.Unfoldable/index.js":128,"./foreign.js":43}],45:[function(require,module,exports){
"use strict";

var nacl_util = require('tweetnacl-util');

exports.encodeBase64 = nacl_util.encodeBase64;

exports.decodeBase64Impl = function (s) {
  var r;
  try {
    r = nacl_util.decodeBase64(s);
  } catch(e) {
    console.warn("Base64 decoding error: ", e, ", data: ", s);
    r = null;
  }

  return r;
};

},{"tweetnacl-util":4}],46:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var decodeBase64 = function (s) {
    return Data_Nullable.toMaybe($foreign.decodeBase64Impl(s));
};
module.exports = {
    decodeBase64: decodeBase64,
    encodeBase64: $foreign.encodeBase64
};

},{"../Data.Nullable/index.js":100,"./foreign.js":45}],47:[function(require,module,exports){
"use strict";



// Lightweight polyfill for ie - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#Methods_Polyfill
function polyFill () {
    var typedArrayTypes =
        [ Int8Array, Uint8Array, Uint8ClampedArray, Int16Array
        , Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array
        ];

    for (var k in typedArrayTypes) {
        for (var v in Array.prototype) {
            if (Array.prototype.hasOwnProperty(v) && !typedArrayTypes[k].prototype.hasOwnProperty(v))
                typedArrayTypes[k].prototype[v] = Array.prototype[v];
        }
    }
};

polyFill();

// module Data.ArrayBuffer.Typed

exports.buffer = function buffer (v) {
    return v.buffer;
};

exports.byteOffset = function byteOffset (v) {
    return v.byteOffset;
};

exports.byteLength = function byteLength (v) {
    return v.byteLength;
};

exports.lengthImpl = function lemgthImpl (v) {
    return v.length;
};


// Typed Arrays


function newArray (f) {
  return function newArray_ (a,mb,mc) {
    if (mb === null)
      return new f(a);
    var l = a.byteLength;
    var eb = f.BYTES_PER_ELEMENT;
    var off = Math.min(l, mb>>>0);
    if (mc === null)
      return new f(a,off);
    var len = Math.min((l - off) / eb, mc);
    return new f(a,off,len);
  };
}

exports.newUint8ClampedArray = newArray(Uint8ClampedArray);
exports.newUint32Array = newArray(Uint32Array);
exports.newUint16Array = newArray(Uint16Array);
exports.newUint8Array = newArray(Uint8Array);
exports.newInt32Array = newArray(Int32Array);
exports.newInt16Array = newArray(Int16Array);
exports.newInt8Array = newArray(Int8Array);
exports.newFloat32Array = newArray(Float32Array);
exports.newFloat64Array = newArray(Float64Array);


// ------

exports.everyImpl = function everyImpl (a,p) {
    return a.every(p);
};
exports.someImpl = function someImpl (a,p) {
    return a.some(p);
};


exports.fillImpl = function fillImpl (x, s, e, a) {
    return a.fill(x,s,e);
};


exports.mapImpl = function mapImpl (a,f) {
    return a.map(f);
};

exports.forEachImpl = function forEachImpl (a,f) {
    a.forEach(f);
};

exports.filterImpl = function filterImpl (a,p) {
    return a.filter(p);
};

exports.includesImpl = function includesImpl (a,x,mo) {
    return mo === null ? a.includes(x) : a.includes(x,mo);
};

exports.reduceImpl = function reduceImpl (a,f,i) {
    return a.reduce(f,i);
};
exports.reduce1Impl = function reduce1Impl (a,f) {
    return a.reduce(f);
};
exports.reduceRightImpl = function reduceRightImpl (a,f,i) {
    return a.reduceRight(f,i);
};
exports.reduceRight1Impl = function reduceRight1Impl (a,f) {
    return a.reduceRight(f);
};

exports.findImpl = function findImpl (a,f) {
    return a.find(f);
};

exports.findIndexImpl = function findIndexImpl (a,f) {
    var r = a.findIndex(f);
    return r === -1 ? null : r;
};
exports.indexOfImpl = function indexOfImpl (a,x,mo) {
    var r = mo === null ? a.indexOf(x) : a.indexOf(x,mo);
    return r === -1 ? null : r;
};
exports.lastIndexOfImpl = function lastIndexOfImpl (a,x,mo) {
    var r = mo === null ? a.lastIndexOf(x) : a.lastIndexOf(x,mo);
    return r === -1 ? null : r;
};



exports.copyWithinImpl = function copyWithinImpl (a,t,s,me) {
    if (me === null) {
        a.copyWithin(t,s);
    } else {
        a.copyWithin(t,s,me);
    }
};


exports.reverseImpl = function reverseImpl (a) {
    a.reverse();
};


exports.setImpl = function setImpl (a, off, b) {
  a.set(b,off);
};


exports.sliceImpl = function sliceImpl (a, s, e) {
  return a.slice(s,e);
};

exports.sortImpl = function sortImpl (a) {
    a.sort();
};


exports.subArrayImpl = function subArrayImpl (a, s, e) {
    return a.subarray(s, e);
};


exports.toStringImpl = function toStringImpl (a) {
    return a.toString();
};

exports.joinImpl = function joinImpl (a,s) {
    return a.join(s);
};

exports.unsafeAtImpl = function(a, i) {
    return a[i];
}

exports.hasIndexImpl = function(a, i) {
    return i in a;
}

exports.toArrayImpl = function(a) {
    var l = a.length;
    var ret = new Array(l);
    for (var i = 0; i < l; i++)
        ret[i] = a[i];
    return ret;
}

},{}],48:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Data_Array = require("../Data.Array/index.js");
var Data_ArrayBuffer_ValueMapping = require("../Data.ArrayBuffer.ValueMapping/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Function_Uncurried = require("../Data.Function.Uncurried/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Typelevel_Num_Sets = require("../Data.Typelevel.Num.Sets/index.js");
var Effect = require("../Effect/index.js");
var Effect_Uncurried = require("../Effect.Uncurried/index.js");
var Effect_Unsafe = require("../Effect.Unsafe/index.js");
var Type_Proxy = require("../Type.Proxy/index.js");
var TypedArray = function (BinaryValue0, create) {
    this.BinaryValue0 = BinaryValue0;
    this.create = create;
};
var unsafeAt = function (dictTypedArray) {
    return function (dictPartial) {
        return function (a) {
            return function (o) {
                return function () {
                    return $foreign.unsafeAtImpl(a, o);
                };
            };
        };
    };
};
var typedArrayUint8Clamped = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueUint8Clamped;
}, $foreign.newUint8ClampedArray);
var typedArrayUint8 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueUint8;
}, $foreign.newUint8Array);
var typedArrayUint32 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueUint32;
}, $foreign.newUint32Array);
var typedArrayUint16 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueUint16;
}, $foreign.newUint16Array);
var typedArrayInt8 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueInt8;
}, $foreign.newInt8Array);
var typedArrayInt32 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueInt32;
}, $foreign.newInt32Array);
var typedArrayInt16 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueInt16;
}, $foreign.newInt16Array);
var typedArrayFloat64 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueFloat64;
}, $foreign.newFloat64Array);
var typedArrayFloat32 = new TypedArray(function () {
    return Data_ArrayBuffer_ValueMapping.binaryValueFloat32;
}, $foreign.newFloat32Array);
var traverseWithIndex_$prime = function (dictTypedArray) {
    return function (f) {
        return function (a) {
            return function () {
                return $foreign.forEachImpl(a, Effect_Uncurried.mkEffectFn2(f));
            };
        };
    };
};
var traverseWithIndex_ = function (dictTypedArray) {
    var $66 = traverseWithIndex_$prime(dictTypedArray);
    return function ($67) {
        return $66(Data_Function.flip($67));
    };
};
var traverseWithIndex$prime = function (dictTypedArray) {
    return function (f) {
        return function (a) {
            return function () {
                return $foreign.mapImpl(a, Effect_Uncurried.mkEffectFn2(f));
            };
        };
    };
};
var traverseWithIndex = function (dictTypedArray) {
    var $68 = traverseWithIndex$prime(dictTypedArray);
    return function ($69) {
        return $68(Data_Function.flip($69));
    };
};
var toString = function (a) {
    return function () {
        return $foreign.toStringImpl(a);
    };
};
var toArray = function (dictTypedArray) {
    return function (a) {
        return function () {
            return $foreign.toArrayImpl(a);
        };
    };
};
var subArray = function (s) {
    return function (e) {
        return function (a) {
            return $foreign.subArrayImpl(a, s, e);
        };
    };
};
var sort = function (a) {
    return function () {
        return $foreign.sortImpl(a);
    };
};
var some = function (dictTypedArray) {
    return function (p) {
        return function (a) {
            return function () {
                return $foreign.someImpl(a, Data_Function_Uncurried.mkFn2(p));
            };
        };
    };
};
var slice = function (s) {
    return function (e) {
        return function (a) {
            return function () {
                return $foreign.sliceImpl(a, s, e);
            };
        };
    };
};
var reverse = function (a) {
    return function () {
        return $foreign.reverseImpl(a);
    };
};
var reduceRight1 = function (dictPartial) {
    return function (dictTypedArray) {
        return function (f) {
            return function (a) {
                return function () {
                    return $foreign.reduceRight1Impl(a, function (acc, x, o) {
                        return f(x)(acc)(o)();
                    });
                };
            };
        };
    };
};
var reduceRight = function (dictTypedArray) {
    return function (f) {
        return function (i) {
            return function (a) {
                return function () {
                    return $foreign.reduceRightImpl(a, function (acc, x, o) {
                        return f(x)(acc)(o)();
                    }, i);
                };
            };
        };
    };
};
var reduce1 = function (dictPartial) {
    return function (dictTypedArray) {
        return function (f) {
            return function (a) {
                return function () {
                    return $foreign.reduce1Impl(a, Effect_Uncurried.mkEffectFn3(f));
                };
            };
        };
    };
};
var reduce = function (dictTypedArray) {
    return function (f) {
        return function (i) {
            return function (a) {
                return function () {
                    return $foreign.reduceImpl(a, Effect_Uncurried.mkEffectFn3(f), i);
                };
            };
        };
    };
};
var mapWithIndex$prime = function (dictTypedArray) {
    return function (f) {
        return function (a) {
            return Effect_Unsafe.unsafePerformEffect(function () {
                return $foreign.mapImpl(a, function (x, o) {
                    return f(x)(o);
                });
            });
        };
    };
};
var mapWithIndex = function (dictTypedArray) {
    var $70 = mapWithIndex$prime(dictTypedArray);
    return function ($71) {
        return $70(Data_Function.flip($71));
    };
};
var length = $foreign.lengthImpl;
var setInternal = function (lenfn) {
    return function (a) {
        return function (mo) {
            return function (b) {
                var o = Data_Maybe.fromMaybe(0)(mo);
                var $65 = o >= 0 && lenfn(b) <= (length(a) - o | 0);
                if ($65) {
                    return Control_Apply.applySecond(Effect.applyEffect)(function () {
                        return $foreign.setImpl(a, o, b);
                    })(Control_Applicative.pure(Effect.applicativeEffect)(true));
                };
                return Control_Applicative.pure(Effect.applicativeEffect)(false);
            };
        };
    };
};
var set = function (dictTypedArray) {
    return setInternal(Data_Array.length);
};
var setTyped = setInternal(length);
var lastIndexOf = function (dictTypedArray) {
    return function (x) {
        return function (mo) {
            return function (a) {
                return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)(function () {
                    return $foreign.lastIndexOfImpl(a, x, Data_Nullable.toNullable(mo));
                });
            };
        };
    };
};
var join = function (s) {
    return function (a) {
        return function () {
            return $foreign.joinImpl(a, s);
        };
    };
};
var indexOf = function (dictTypedArray) {
    return function (x) {
        return function (mo) {
            return function (a) {
                return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)(function () {
                    return $foreign.indexOfImpl(a, x, Data_Nullable.toNullable(mo));
                });
            };
        };
    };
};
var hasIndex = function (a) {
    return function (o) {
        return $foreign.hasIndexImpl(a, o);
    };
};
var foldrWithIndex = function (dictTypedArray) {
    return function (f) {
        return reduceRight(dictTypedArray)(function (a) {
            return function (x) {
                return function (o) {
                    return Control_Applicative.pure(Effect.applicativeEffect)(f(o)(a)(x));
                };
            };
        });
    };
};
var foldr1 = function (dictPartial) {
    return function (dictTypedArray) {
        return function (f) {
            return reduceRight1(dictPartial)(dictTypedArray)(function (x) {
                return function (a) {
                    return function (v) {
                        return Control_Applicative.pure(Effect.applicativeEffect)(f(a)(x));
                    };
                };
            });
        };
    };
};
var foldr = function (dictTypedArray) {
    return function (f) {
        return reduceRight(dictTypedArray)(function (a) {
            return function (x) {
                return function (v) {
                    return Control_Applicative.pure(Effect.applicativeEffect)(f(a)(x));
                };
            };
        });
    };
};
var foldlWithIndex = function (dictTypedArray) {
    return function (f) {
        return reduce(dictTypedArray)(function (a) {
            return function (x) {
                return function (o) {
                    return Control_Applicative.pure(Effect.applicativeEffect)(f(o)(a)(x));
                };
            };
        });
    };
};
var foldl1 = function (dictPartial) {
    return function (dictTypedArray) {
        return function (f) {
            return reduce1(dictPartial)(dictTypedArray)(function (a) {
                return function (x) {
                    return function (v) {
                        return Control_Applicative.pure(Effect.applicativeEffect)(f(a)(x));
                    };
                };
            });
        };
    };
};
var foldl = function (dictTypedArray) {
    return function (f) {
        return reduce(dictTypedArray)(function (a) {
            return function (x) {
                return function (v) {
                    return Control_Applicative.pure(Effect.applicativeEffect)(f(a)(x));
                };
            };
        });
    };
};
var findWithIndex$prime = function (dictTypedArray) {
    return function (f) {
        return function (a) {
            return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)(function () {
                return $foreign.findImpl(a, Data_Function_Uncurried.mkFn2(f));
            });
        };
    };
};
var findWithIndex = function (dictTypedArray) {
    var $72 = findWithIndex$prime(dictTypedArray);
    return function ($73) {
        return $72(Data_Function.flip($73));
    };
};
var findIndex = function (dictTypedArray) {
    return function (f) {
        return function (a) {
            return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)(function () {
                return $foreign.findIndexImpl(a, Data_Function_Uncurried.mkFn2(f));
            });
        };
    };
};
var filterWithIndex$prime = function (dictTypedArray) {
    return function (p) {
        return function (a) {
            return function () {
                return $foreign.filterImpl(a, Data_Function_Uncurried.mkFn2(p));
            };
        };
    };
};
var filterWithIndex = function (dictTypedArray) {
    var $74 = filterWithIndex$prime(dictTypedArray);
    return function ($75) {
        return $74(Data_Function.flip($75));
    };
};
var fill = function (dictTypedArray) {
    return function (x) {
        return function (s) {
            return function (e) {
                return function (a) {
                    return function () {
                        return $foreign.fillImpl(x, s, e, a);
                    };
                };
            };
        };
    };
};
var every = function (dictTypedArray) {
    return function (p) {
        return function (a) {
            return function () {
                return $foreign.everyImpl(a, Data_Function_Uncurried.mkFn2(p));
            };
        };
    };
};
var eq = function (dictTypedArray) {
    return function (dictEq) {
        return function (a) {
            return function (b) {
                return Control_Apply.apply(Effect.applyEffect)(Data_Functor.map(Effect.functorEffect)(Data_Eq.eq(Data_Eq.eqArray(dictEq)))(toArray(dictTypedArray)(a)))(toArray(dictTypedArray)(b));
            };
        };
    };
};
var elem = function (dictTypedArray) {
    return function (x) {
        return function (mo) {
            return function (a) {
                return function () {
                    return $foreign.includesImpl(a, x, Data_Nullable.toNullable(mo));
                };
            };
        };
    };
};
var create = function (dict) {
    return dict.create;
};
var empty = function (dictTypedArray) {
    return function (n) {
        return function () {
            return create(dictTypedArray)(n, Data_Nullable["null"], Data_Nullable["null"]);
        };
    };
};
var fromArray = function (dictTypedArray) {
    return function (a) {
        return function () {
            return create(dictTypedArray)(a, Data_Nullable["null"], Data_Nullable["null"]);
        };
    };
};
var part$prime = function (dictTypedArray) {
    return function (a) {
        return function (x) {
            return function (y) {
                return function () {
                    return create(dictTypedArray)(a, Data_Nullable.notNull(x), Data_Nullable.notNull(y));
                };
            };
        };
    };
};
var part = function (dictTypedArray) {
    return function (dictNat) {
        return function (dictBytesPerValue) {
            return function (a) {
                return function (x) {
                    return function (y) {
                        var o = x * Data_Typelevel_Num_Sets["toInt'"](dictNat)(Type_Proxy["Proxy"].value) | 0;
                        return part$prime(dictTypedArray)(a)(o)(y);
                    };
                };
            };
        };
    };
};
var remainder$prime = function (dictTypedArray) {
    return function (a) {
        return function (x) {
            return function () {
                return create(dictTypedArray)(a, Data_Nullable.notNull(x), Data_Nullable["null"]);
            };
        };
    };
};
var remainder = function (dictTypedArray) {
    return function (dictNat) {
        return function (dictBytesPerValue) {
            return function (a) {
                return function (x) {
                    var o = x * Data_Typelevel_Num_Sets["toInt'"](dictNat)(Type_Proxy["Proxy"].value) | 0;
                    return remainder$prime(dictTypedArray)(a)(o);
                };
            };
        };
    };
};
var whole = function (dictTypedArray) {
    return function (a) {
        return function () {
            return create(dictTypedArray)(a, Data_Nullable["null"], Data_Nullable["null"]);
        };
    };
};
var copyWithin = function (a) {
    return function (t) {
        return function (s) {
            return function (me) {
                return function () {
                    return $foreign.copyWithinImpl(a, t, s, Data_Nullable.toNullable(me));
                };
            };
        };
    };
};
var compare = function (dictTypedArray) {
    return function (dictOrd) {
        return function (a) {
            return function (b) {
                return Control_Apply.apply(Effect.applyEffect)(Data_Functor.map(Effect.functorEffect)(Data_Ord.compare(Data_Ord.ordArray(dictOrd)))(toArray(dictTypedArray)(a)))(toArray(dictTypedArray)(b));
            };
        };
    };
};
var at = function (dictTypedArray) {
    return function (a) {
        return function (n) {
            return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)(function () {
                return $foreign.unsafeAtImpl(a, n);
            });
        };
    };
};
var ap1 = function (f) {
    return function (x) {
        return function (v) {
            return f(x);
        };
    };
};
var filter = function (dictTypedArray) {
    var $76 = filterWithIndex$prime(dictTypedArray);
    return function ($77) {
        return $76(ap1($77));
    };
};
var find = function (dictTypedArray) {
    var $78 = findWithIndex$prime(dictTypedArray);
    return function ($79) {
        return $78(ap1($79));
    };
};
var map = function (dictTypedArray) {
    var $80 = mapWithIndex$prime(dictTypedArray);
    return function ($81) {
        return $80(ap1($81));
    };
};
var traverse = function (dictTypedArray) {
    var $82 = traverseWithIndex$prime(dictTypedArray);
    return function ($83) {
        return $82(ap1($83));
    };
};
var traverse_ = function (dictTypedArray) {
    var $84 = traverseWithIndex_$prime(dictTypedArray);
    return function ($85) {
        return $84(ap1($85));
    };
};
var anyWithIndex = function (dictTypedArray) {
    var $86 = some(dictTypedArray);
    return function ($87) {
        return $86(Data_Function.flip($87));
    };
};
var any = function (dictTypedArray) {
    var $88 = some(dictTypedArray);
    return function ($89) {
        return $88(ap1($89));
    };
};
var allWithIndex = function (dictTypedArray) {
    var $90 = every(dictTypedArray);
    return function ($91) {
        return $90(Data_Function.flip($91));
    };
};
var all = function (dictTypedArray) {
    var $92 = every(dictTypedArray);
    return function ($93) {
        return $92(ap1($93));
    };
};
module.exports = {
    length: length,
    compare: compare,
    eq: eq,
    TypedArray: TypedArray,
    create: create,
    whole: whole,
    remainder: remainder,
    part: part,
    empty: empty,
    fromArray: fromArray,
    fill: fill,
    set: set,
    setTyped: setTyped,
    copyWithin: copyWithin,
    map: map,
    traverse: traverse,
    traverse_: traverse_,
    filter: filter,
    mapWithIndex: mapWithIndex,
    traverseWithIndex: traverseWithIndex,
    traverseWithIndex_: traverseWithIndex_,
    filterWithIndex: filterWithIndex,
    sort: sort,
    reverse: reverse,
    elem: elem,
    all: all,
    any: any,
    allWithIndex: allWithIndex,
    anyWithIndex: anyWithIndex,
    unsafeAt: unsafeAt,
    hasIndex: hasIndex,
    at: at,
    reduce: reduce,
    reduce1: reduce1,
    foldl: foldl,
    foldl1: foldl1,
    reduceRight: reduceRight,
    reduceRight1: reduceRight1,
    foldr: foldr,
    foldr1: foldr1,
    find: find,
    findIndex: findIndex,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    slice: slice,
    subArray: subArray,
    toString: toString,
    join: join,
    toArray: toArray,
    typedArrayUint8Clamped: typedArrayUint8Clamped,
    typedArrayUint32: typedArrayUint32,
    typedArrayUint16: typedArrayUint16,
    typedArrayUint8: typedArrayUint8,
    typedArrayInt32: typedArrayInt32,
    typedArrayInt16: typedArrayInt16,
    typedArrayInt8: typedArrayInt8,
    typedArrayFloat32: typedArrayFloat32,
    typedArrayFloat64: typedArrayFloat64,
    buffer: $foreign.buffer,
    byteOffset: $foreign.byteOffset,
    byteLength: $foreign.byteLength
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Data.Array/index.js":44,"../Data.ArrayBuffer.ValueMapping/index.js":49,"../Data.Eq/index.js":67,"../Data.Function.Uncurried/index.js":74,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Nullable/index.js":100,"../Data.Ord/index.js":104,"../Data.Typelevel.Num.Sets/index.js":125,"../Effect.Uncurried/index.js":148,"../Effect.Unsafe/index.js":150,"../Effect/index.js":152,"../Type.Proxy/index.js":170,"./foreign.js":47}],49:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var ShowArrayViewType = {};
var BytesPerValue = {};
var BinaryValue = {};
var showArrayViewTypeViewUint8 = ShowArrayViewType;
var showArrayViewTypeViewUint32 = ShowArrayViewType;
var showArrayViewTypeViewUint16 = ShowArrayViewType;
var showArrayViewTypeViewInt8 = ShowArrayViewType;
var showArrayViewTypeViewInt32 = ShowArrayViewType;
var showArrayViewTypeViewInt16 = ShowArrayViewType;
var showArrayViewTypeViewFloat64 = ShowArrayViewType;
var showArrayViewTypeViewFloat32 = ShowArrayViewType;
var showArrayViewTypeUint8Clamped = ShowArrayViewType;
var bytesPerValueUint8Clamped = BytesPerValue;
var bytesPerValueUint8 = BytesPerValue;
var bytesPerValueUint32 = BytesPerValue;
var bytesPerValueUint16 = BytesPerValue;
var bytesPerValueInt8 = BytesPerValue;
var bytesPerValueInt32 = BytesPerValue;
var bytesPerValueInt16 = BytesPerValue;
var bytesPerValueFloat64 = BytesPerValue;
var bytesPerValueFloat32 = BytesPerValue;
var binaryValueUint8Clamped = BinaryValue;
var binaryValueUint8 = BinaryValue;
var binaryValueUint32 = BinaryValue;
var binaryValueUint16 = BinaryValue;
var binaryValueInt8 = BinaryValue;
var binaryValueInt32 = BinaryValue;
var binaryValueInt16 = BinaryValue;
var binaryValueFloat64 = BinaryValue;
var binaryValueFloat32 = BinaryValue;
module.exports = {
    BytesPerValue: BytesPerValue,
    BinaryValue: BinaryValue,
    ShowArrayViewType: ShowArrayViewType,
    bytesPerValueUint8Clamped: bytesPerValueUint8Clamped,
    bytesPerValueUint32: bytesPerValueUint32,
    bytesPerValueUint16: bytesPerValueUint16,
    bytesPerValueUint8: bytesPerValueUint8,
    bytesPerValueInt32: bytesPerValueInt32,
    bytesPerValueInt16: bytesPerValueInt16,
    bytesPerValueInt8: bytesPerValueInt8,
    bytesPerValueFloat32: bytesPerValueFloat32,
    bytesPerValueFloat64: bytesPerValueFloat64,
    binaryValueUint8Clamped: binaryValueUint8Clamped,
    binaryValueUint32: binaryValueUint32,
    binaryValueUint16: binaryValueUint16,
    binaryValueUint8: binaryValueUint8,
    binaryValueInt32: binaryValueInt32,
    binaryValueInt16: binaryValueInt16,
    binaryValueInt8: binaryValueInt8,
    binaryValueFloat32: binaryValueFloat32,
    binaryValueFloat64: binaryValueFloat64,
    showArrayViewTypeUint8Clamped: showArrayViewTypeUint8Clamped,
    showArrayViewTypeViewUint32: showArrayViewTypeViewUint32,
    showArrayViewTypeViewUint16: showArrayViewTypeViewUint16,
    showArrayViewTypeViewUint8: showArrayViewTypeViewUint8,
    showArrayViewTypeViewInt32: showArrayViewTypeViewInt32,
    showArrayViewTypeViewInt16: showArrayViewTypeViewInt16,
    showArrayViewTypeViewInt8: showArrayViewTypeViewInt8,
    showArrayViewTypeViewFloat32: showArrayViewTypeViewFloat32,
    showArrayViewTypeViewFloat64: showArrayViewTypeViewFloat64
};

},{}],50:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Endo = require("../Data.Monoid.Endo/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Bifoldable = function (bifoldMap, bifoldl, bifoldr) {
    this.bifoldMap = bifoldMap;
    this.bifoldl = bifoldl;
    this.bifoldr = bifoldr;
};
var bifoldr = function (dict) {
    return dict.bifoldr;
};
var bitraverse_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return function (f) {
            return function (g) {
                return bifoldr(dictBifoldable)((function () {
                    var $97 = Control_Apply.applySecond(dictApplicative.Apply0());
                    return function ($98) {
                        return $97(f($98));
                    };
                })())((function () {
                    var $99 = Control_Apply.applySecond(dictApplicative.Apply0());
                    return function ($100) {
                        return $99(g($100));
                    };
                })())(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
            };
        };
    };
};
var bifor_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse_(dictBifoldable)(dictApplicative)(f)(g)(t);
                };
            };
        };
    };
};
var bisequence_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return bitraverse_(dictBifoldable)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn))(Control_Category.identity(Control_Category.categoryFn));
    };
};
var bifoldl = function (dict) {
    return dict.bifoldl;
};
var bifoldableJoker = function (dictFoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (v) {
            return function (r) {
                return function (v1) {
                    return Data_Foldable.foldMap(dictFoldable)(dictMonoid)(r)(v1);
                };
            };
        };
    }, function (v) {
        return function (r) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldl(dictFoldable)(r)(u)(v1);
                };
            };
        };
    }, function (v) {
        return function (r) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldr(dictFoldable)(r)(u)(v1);
                };
            };
        };
    });
};
var bifoldableClown = function (dictFoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (l) {
            return function (v) {
                return function (v1) {
                    return Data_Foldable.foldMap(dictFoldable)(dictMonoid)(l)(v1);
                };
            };
        };
    }, function (l) {
        return function (v) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldl(dictFoldable)(l)(u)(v1);
                };
            };
        };
    }, function (l) {
        return function (v) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldr(dictFoldable)(l)(u)(v1);
                };
            };
        };
    });
};
var bifoldMapDefaultR = function (dictBifoldable) {
    return function (dictMonoid) {
        return function (f) {
            return function (g) {
                return bifoldr(dictBifoldable)((function () {
                    var $101 = Data_Semigroup.append(dictMonoid.Semigroup0());
                    return function ($102) {
                        return $101(f($102));
                    };
                })())((function () {
                    var $103 = Data_Semigroup.append(dictMonoid.Semigroup0());
                    return function ($104) {
                        return $103(g($104));
                    };
                })())(Data_Monoid.mempty(dictMonoid));
            };
        };
    };
};
var bifoldMapDefaultL = function (dictBifoldable) {
    return function (dictMonoid) {
        return function (f) {
            return function (g) {
                return bifoldl(dictBifoldable)(function (m) {
                    return function (a) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(m)(f(a));
                    };
                })(function (m) {
                    return function (b) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(m)(g(b));
                    };
                })(Data_Monoid.mempty(dictMonoid));
            };
        };
    };
};
var bifoldMap = function (dict) {
    return dict.bifoldMap;
};
var bifoldableFlip = function (dictBifoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (r) {
            return function (l) {
                return function (v) {
                    return bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v);
                };
            };
        };
    }, function (r) {
        return function (l) {
            return function (u) {
                return function (v) {
                    return bifoldl(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    }, function (r) {
        return function (l) {
            return function (u) {
                return function (v) {
                    return bifoldr(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    });
};
var bifoldableWrap = function (dictBifoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (l) {
            return function (r) {
                return function (v) {
                    return bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v);
                };
            };
        };
    }, function (l) {
        return function (r) {
            return function (u) {
                return function (v) {
                    return bifoldl(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    }, function (l) {
        return function (r) {
            return function (u) {
                return function (v) {
                    return bifoldr(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    });
};
var bifoldlDefault = function (dictBifoldable) {
    return function (f) {
        return function (g) {
            return function (z) {
                return function (p) {
                    return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(Data_Newtype.unwrap(Data_Newtype.newtypeDual)(bifoldMap(dictBifoldable)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn)))((function () {
                        var $105 = Data_Function.flip(f);
                        return function ($106) {
                            return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo($105($106)));
                        };
                    })())((function () {
                        var $107 = Data_Function.flip(g);
                        return function ($108) {
                            return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo($107($108)));
                        };
                    })())(p)))(z);
                };
            };
        };
    };
};
var bifoldrDefault = function (dictBifoldable) {
    return function (f) {
        return function (g) {
            return function (z) {
                return function (p) {
                    return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(bifoldMap(dictBifoldable)(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn))(function ($109) {
                        return Data_Monoid_Endo.Endo(f($109));
                    })(function ($110) {
                        return Data_Monoid_Endo.Endo(g($110));
                    })(p))(z);
                };
            };
        };
    };
};
var bifoldableProduct = function (dictBifoldable) {
    return function (dictBifoldable1) {
        return new Bifoldable(function (dictMonoid) {
            return function (l) {
                return function (r) {
                    return function (v) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v.value0))(bifoldMap(dictBifoldable1)(dictMonoid)(l)(r)(v.value1));
                    };
                };
            };
        }, function (l) {
            return function (r) {
                return function (u) {
                    return function (m) {
                        return bifoldlDefault(bifoldableProduct(dictBifoldable)(dictBifoldable1))(l)(r)(u)(m);
                    };
                };
            };
        }, function (l) {
            return function (r) {
                return function (u) {
                    return function (m) {
                        return bifoldrDefault(bifoldableProduct(dictBifoldable)(dictBifoldable1))(l)(r)(u)(m);
                    };
                };
            };
        });
    };
};
var bifold = function (dictBifoldable) {
    return function (dictMonoid) {
        return bifoldMap(dictBifoldable)(dictMonoid)(Control_Category.identity(Control_Category.categoryFn))(Control_Category.identity(Control_Category.categoryFn));
    };
};
var biany = function (dictBifoldable) {
    return function (dictBooleanAlgebra) {
        return function (p) {
            return function (q) {
                var $111 = Data_Newtype.unwrap(Data_Newtype.newtypeDisj);
                var $112 = bifoldMap(dictBifoldable)(Data_Monoid_Disj.monoidDisj(dictBooleanAlgebra.HeytingAlgebra0()))(function ($114) {
                    return Data_Monoid_Disj.Disj(p($114));
                })(function ($115) {
                    return Data_Monoid_Disj.Disj(q($115));
                });
                return function ($113) {
                    return $111($112($113));
                };
            };
        };
    };
};
var biall = function (dictBifoldable) {
    return function (dictBooleanAlgebra) {
        return function (p) {
            return function (q) {
                var $116 = Data_Newtype.unwrap(Data_Newtype.newtypeConj);
                var $117 = bifoldMap(dictBifoldable)(Data_Monoid_Conj.monoidConj(dictBooleanAlgebra.HeytingAlgebra0()))(function ($119) {
                    return Data_Monoid_Conj.Conj(p($119));
                })(function ($120) {
                    return Data_Monoid_Conj.Conj(q($120));
                });
                return function ($118) {
                    return $116($117($118));
                };
            };
        };
    };
};
module.exports = {
    bifoldMap: bifoldMap,
    bifoldl: bifoldl,
    bifoldr: bifoldr,
    Bifoldable: Bifoldable,
    bifoldrDefault: bifoldrDefault,
    bifoldlDefault: bifoldlDefault,
    bifoldMapDefaultR: bifoldMapDefaultR,
    bifoldMapDefaultL: bifoldMapDefaultL,
    bifold: bifold,
    bitraverse_: bitraverse_,
    bifor_: bifor_,
    bisequence_: bisequence_,
    biany: biany,
    biall: biall,
    bifoldableClown: bifoldableClown,
    bifoldableJoker: bifoldableJoker,
    bifoldableFlip: bifoldableFlip,
    bifoldableProduct: bifoldableProduct,
    bifoldableWrap: bifoldableWrap
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Data.Foldable/index.js":71,"../Data.Function/index.js":75,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Endo/index.js":95,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132}],51:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Show = require("../Data.Show/index.js");
var Clown = function (x) {
    return x;
};
var showClown = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Clown " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordClown = function (dictOrd) {
    return dictOrd;
};
var newtypeClown = new Data_Newtype.Newtype(function (n) {
    return n;
}, Clown);
var functorClown = new Data_Functor.Functor(function (v) {
    return function (v1) {
        return v1;
    };
});
var eqClown = function (dictEq) {
    return dictEq;
};
var bifunctorClown = function (dictFunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (v) {
            return function (v1) {
                return Data_Functor.map(dictFunctor)(f)(v1);
            };
        };
    });
};
var biapplyClown = function (dictApply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorClown(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Apply.apply(dictApply)(v)(v1);
        };
    });
};
var biapplicativeClown = function (dictApplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyClown(dictApplicative.Apply0());
    }, function (a) {
        return function (v) {
            return Control_Applicative.pure(dictApplicative)(a);
        };
    });
};
module.exports = {
    Clown: Clown,
    newtypeClown: newtypeClown,
    eqClown: eqClown,
    ordClown: ordClown,
    showClown: showClown,
    functorClown: functorClown,
    bifunctorClown: bifunctorClown,
    biapplyClown: biapplyClown,
    biapplicativeClown: biapplicativeClown
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Data.Bifunctor/index.js":56,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Show/index.js":117}],52:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Show = require("../Data.Show/index.js");
var Flip = function (x) {
    return x;
};
var showFlip = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Flip " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordFlip = function (dictOrd) {
    return dictOrd;
};
var newtypeFlip = new Data_Newtype.Newtype(function (n) {
    return n;
}, Flip);
var functorFlip = function (dictBifunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return Data_Bifunctor.lmap(dictBifunctor)(f)(v);
        };
    });
};
var eqFlip = function (dictEq) {
    return dictEq;
};
var bifunctorFlip = function (dictBifunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (g) {
            return function (v) {
                return Data_Bifunctor.bimap(dictBifunctor)(g)(f)(v);
            };
        };
    });
};
var biapplyFlip = function (dictBiapply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorFlip(dictBiapply.Bifunctor0());
    }, function (v) {
        return function (v1) {
            return Control_Biapply.biapply(dictBiapply)(v)(v1);
        };
    });
};
var biapplicativeFlip = function (dictBiapplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyFlip(dictBiapplicative.Biapply0());
    }, function (a) {
        return function (b) {
            return Control_Biapplicative.bipure(dictBiapplicative)(b)(a);
        };
    });
};
module.exports = {
    Flip: Flip,
    newtypeFlip: newtypeFlip,
    eqFlip: eqFlip,
    ordFlip: ordFlip,
    showFlip: showFlip,
    functorFlip: functorFlip,
    bifunctorFlip: bifunctorFlip,
    biapplyFlip: biapplyFlip,
    biapplicativeFlip: biapplicativeFlip
};

},{"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Data.Bifunctor/index.js":56,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Show/index.js":117}],53:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Show = require("../Data.Show/index.js");
var Joker = function (x) {
    return x;
};
var showJoker = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Joker " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordJoker = function (dictOrd) {
    return dictOrd;
};
var newtypeJoker = new Data_Newtype.Newtype(function (n) {
    return n;
}, Joker);
var functorJoker = function (dictFunctor) {
    return new Data_Functor.Functor(function (g) {
        return function (v) {
            return Data_Functor.map(dictFunctor)(g)(v);
        };
    });
};
var eqJoker = function (dictEq) {
    return dictEq;
};
var bifunctorJoker = function (dictFunctor) {
    return new Data_Bifunctor.Bifunctor(function (v) {
        return function (g) {
            return function (v1) {
                return Data_Functor.map(dictFunctor)(g)(v1);
            };
        };
    });
};
var biapplyJoker = function (dictApply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorJoker(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Apply.apply(dictApply)(v)(v1);
        };
    });
};
var biapplicativeJoker = function (dictApplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyJoker(dictApplicative.Apply0());
    }, function (v) {
        return function (b) {
            return Control_Applicative.pure(dictApplicative)(b);
        };
    });
};
module.exports = {
    Joker: Joker,
    newtypeJoker: newtypeJoker,
    eqJoker: eqJoker,
    ordJoker: ordJoker,
    showJoker: showJoker,
    functorJoker: functorJoker,
    bifunctorJoker: bifunctorJoker,
    biapplyJoker: biapplyJoker,
    biapplicativeJoker: biapplicativeJoker
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Data.Bifunctor/index.js":56,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Show/index.js":117}],54:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Show = require("../Data.Show/index.js");
var Product = (function () {
    function Product(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Product.create = function (value0) {
        return function (value1) {
            return new Product(value0, value1);
        };
    };
    return Product;
})();
var showProduct = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            return "(Product " + (Data_Show.show(dictShow)(v.value0) + (" " + (Data_Show.show(dictShow1)(v.value1) + ")")));
        });
    };
};
var eqProduct = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0) && Data_Eq.eq(dictEq1)(x.value1)(y.value1);
            };
        });
    };
};
var ordProduct = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqProduct(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                var v = Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                if (v instanceof Data_Ordering.LT) {
                    return Data_Ordering.LT.value;
                };
                if (v instanceof Data_Ordering.GT) {
                    return Data_Ordering.GT.value;
                };
                return Data_Ord.compare(dictOrd1)(x.value1)(y.value1);
            };
        });
    };
};
var bifunctorProduct = function (dictBifunctor) {
    return function (dictBifunctor1) {
        return new Data_Bifunctor.Bifunctor(function (f) {
            return function (g) {
                return function (v) {
                    return new Product(Data_Bifunctor.bimap(dictBifunctor)(f)(g)(v.value0), Data_Bifunctor.bimap(dictBifunctor1)(f)(g)(v.value1));
                };
            };
        });
    };
};
var biapplyProduct = function (dictBiapply) {
    return function (dictBiapply1) {
        return new Control_Biapply.Biapply(function () {
            return bifunctorProduct(dictBiapply.Bifunctor0())(dictBiapply1.Bifunctor0());
        }, function (v) {
            return function (v1) {
                return new Product(Control_Biapply.biapply(dictBiapply)(v.value0)(v1.value0), Control_Biapply.biapply(dictBiapply1)(v.value1)(v1.value1));
            };
        });
    };
};
var biapplicativeProduct = function (dictBiapplicative) {
    return function (dictBiapplicative1) {
        return new Control_Biapplicative.Biapplicative(function () {
            return biapplyProduct(dictBiapplicative.Biapply0())(dictBiapplicative1.Biapply0());
        }, function (a) {
            return function (b) {
                return new Product(Control_Biapplicative.bipure(dictBiapplicative)(a)(b), Control_Biapplicative.bipure(dictBiapplicative1)(a)(b));
            };
        });
    };
};
module.exports = {
    Product: Product,
    eqProduct: eqProduct,
    ordProduct: ordProduct,
    showProduct: showProduct,
    bifunctorProduct: bifunctorProduct,
    biapplyProduct: biapplyProduct,
    biapplicativeProduct: biapplicativeProduct
};

},{"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Data.Bifunctor/index.js":56,"../Data.Eq/index.js":67,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Show/index.js":117}],55:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Show = require("../Data.Show/index.js");
var Wrap = function (x) {
    return x;
};
var showWrap = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Wrap " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordWrap = function (dictOrd) {
    return dictOrd;
};
var newtypeWrap = new Data_Newtype.Newtype(function (n) {
    return n;
}, Wrap);
var functorWrap = function (dictBifunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return Data_Bifunctor.rmap(dictBifunctor)(f)(v);
        };
    });
};
var eqWrap = function (dictEq) {
    return dictEq;
};
var bifunctorWrap = function (dictBifunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (g) {
            return function (v) {
                return Data_Bifunctor.bimap(dictBifunctor)(f)(g)(v);
            };
        };
    });
};
var biapplyWrap = function (dictBiapply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorWrap(dictBiapply.Bifunctor0());
    }, function (v) {
        return function (v1) {
            return Control_Biapply.biapply(dictBiapply)(v)(v1);
        };
    });
};
var biapplicativeWrap = function (dictBiapplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyWrap(dictBiapplicative.Biapply0());
    }, function (a) {
        return function (b) {
            return Control_Biapplicative.bipure(dictBiapplicative)(a)(b);
        };
    });
};
module.exports = {
    Wrap: Wrap,
    newtypeWrap: newtypeWrap,
    eqWrap: eqWrap,
    ordWrap: ordWrap,
    showWrap: showWrap,
    functorWrap: functorWrap,
    bifunctorWrap: bifunctorWrap,
    biapplyWrap: biapplyWrap,
    biapplicativeWrap: biapplicativeWrap
};

},{"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Data.Bifunctor/index.js":56,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Show/index.js":117}],56:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Bifunctor = function (bimap) {
    this.bimap = bimap;
};
var bimap = function (dict) {
    return dict.bimap;
};
var lmap = function (dictBifunctor) {
    return function (f) {
        return bimap(dictBifunctor)(f)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var rmap = function (dictBifunctor) {
    return bimap(dictBifunctor)(Control_Category.identity(Control_Category.categoryFn));
};
module.exports = {
    bimap: bimap,
    Bifunctor: Bifunctor,
    lmap: lmap,
    rmap: rmap
};

},{"../Control.Category/index.js":14}],57:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Bifoldable = require("../Data.Bifoldable/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Bifunctor_Clown = require("../Data.Bifunctor.Clown/index.js");
var Data_Bifunctor_Flip = require("../Data.Bifunctor.Flip/index.js");
var Data_Bifunctor_Joker = require("../Data.Bifunctor.Joker/index.js");
var Data_Bifunctor_Product = require("../Data.Bifunctor.Product/index.js");
var Data_Bifunctor_Wrap = require("../Data.Bifunctor.Wrap/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Bitraversable = function (Bifoldable1, Bifunctor0, bisequence, bitraverse) {
    this.Bifoldable1 = Bifoldable1;
    this.Bifunctor0 = Bifunctor0;
    this.bisequence = bisequence;
    this.bitraverse = bitraverse;
};
var bitraverse = function (dict) {
    return dict.bitraverse;
};
var lfor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return bitraverse(dictBitraversable)(dictApplicative)(f)(Control_Applicative.pure(dictApplicative))(t);
            };
        };
    };
};
var ltraverse = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (f) {
            return bitraverse(dictBitraversable)(dictApplicative)(f)(Control_Applicative.pure(dictApplicative));
        };
    };
};
var rfor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return bitraverse(dictBitraversable)(dictApplicative)(Control_Applicative.pure(dictApplicative))(f)(t);
            };
        };
    };
};
var rtraverse = function (dictBitraversable) {
    return function (dictApplicative) {
        return bitraverse(dictBitraversable)(dictApplicative)(Control_Applicative.pure(dictApplicative));
    };
};
var bitraversableJoker = function (dictTraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableJoker(dictTraversable.Foldable1());
    }, function () {
        return Data_Bifunctor_Joker.bifunctorJoker(dictTraversable.Functor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Joker.Joker)(Data_Traversable.sequence(dictTraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (v) {
            return function (r) {
                return function (v1) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Joker.Joker)(Data_Traversable.traverse(dictTraversable)(dictApplicative)(r)(v1));
                };
            };
        };
    });
};
var bitraversableClown = function (dictTraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableClown(dictTraversable.Foldable1());
    }, function () {
        return Data_Bifunctor_Clown.bifunctorClown(dictTraversable.Functor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Clown.Clown)(Data_Traversable.sequence(dictTraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (l) {
            return function (v) {
                return function (v1) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Clown.Clown)(Data_Traversable.traverse(dictTraversable)(dictApplicative)(l)(v1));
                };
            };
        };
    });
};
var bisequenceDefault = function (dictBitraversable) {
    return function (dictApplicative) {
        return bitraverse(dictBitraversable)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn))(Control_Category.identity(Control_Category.categoryFn));
    };
};
var bisequence = function (dict) {
    return dict.bisequence;
};
var bitraversableFlip = function (dictBitraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableFlip(dictBitraversable.Bifoldable1());
    }, function () {
        return Data_Bifunctor_Flip.bifunctorFlip(dictBitraversable.Bifunctor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Flip.Flip)(bisequence(dictBitraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (r) {
            return function (l) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Flip.Flip)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v));
                };
            };
        };
    });
};
var bitraversableProduct = function (dictBitraversable) {
    return function (dictBitraversable1) {
        return new Bitraversable(function () {
            return Data_Bifoldable.bifoldableProduct(dictBitraversable.Bifoldable1())(dictBitraversable1.Bifoldable1());
        }, function () {
            return Data_Bifunctor_Product.bifunctorProduct(dictBitraversable.Bifunctor0())(dictBitraversable1.Bifunctor0());
        }, function (dictApplicative) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Product.Product.create)(bisequence(dictBitraversable)(dictApplicative)(v.value0)))(bisequence(dictBitraversable1)(dictApplicative)(v.value1));
            };
        }, function (dictApplicative) {
            return function (l) {
                return function (r) {
                    return function (v) {
                        return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Product.Product.create)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v.value0)))(bitraverse(dictBitraversable1)(dictApplicative)(l)(r)(v.value1));
                    };
                };
            };
        });
    };
};
var bitraversableWrap = function (dictBitraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableWrap(dictBitraversable.Bifoldable1());
    }, function () {
        return Data_Bifunctor_Wrap.bifunctorWrap(dictBitraversable.Bifunctor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Wrap.Wrap)(bisequence(dictBitraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (l) {
            return function (r) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Wrap.Wrap)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v));
                };
            };
        };
    });
};
var bitraverseDefault = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (f) {
            return function (g) {
                return function (t) {
                    return bisequence(dictBitraversable)(dictApplicative)(Data_Bifunctor.bimap(dictBitraversable.Bifunctor0())(f)(g)(t));
                };
            };
        };
    };
};
var bifor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse(dictBitraversable)(dictApplicative)(f)(g)(t);
                };
            };
        };
    };
};
module.exports = {
    Bitraversable: Bitraversable,
    bitraverse: bitraverse,
    bisequence: bisequence,
    bitraverseDefault: bitraverseDefault,
    bisequenceDefault: bisequenceDefault,
    ltraverse: ltraverse,
    rtraverse: rtraverse,
    bifor: bifor,
    lfor: lfor,
    rfor: rfor,
    bitraversableClown: bitraversableClown,
    bitraversableJoker: bitraversableJoker,
    bitraversableFlip: bitraversableFlip,
    bitraversableProduct: bitraversableProduct,
    bitraversableWrap: bitraversableWrap
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Data.Bifoldable/index.js":50,"../Data.Bifunctor.Clown/index.js":51,"../Data.Bifunctor.Flip/index.js":52,"../Data.Bifunctor.Joker/index.js":53,"../Data.Bifunctor.Product/index.js":54,"../Data.Bifunctor.Wrap/index.js":55,"../Data.Bifunctor/index.js":56,"../Data.Functor/index.js":80,"../Data.Traversable/index.js":122}],58:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var otherwise = true;
module.exports = {
    otherwise: otherwise
};

},{}],59:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var BooleanAlgebraRecord = function (HeytingAlgebraRecord0) {
    this.HeytingAlgebraRecord0 = HeytingAlgebraRecord0;
};
var BooleanAlgebra = function (HeytingAlgebra0) {
    this.HeytingAlgebra0 = HeytingAlgebra0;
};
var booleanAlgebraUnit = new BooleanAlgebra(function () {
    return Data_HeytingAlgebra.heytingAlgebraUnit;
});
var booleanAlgebraRecordNil = new BooleanAlgebraRecord(function () {
    return Data_HeytingAlgebra.heytingAlgebraRecordNil;
});
var booleanAlgebraRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictBooleanAlgebraRecord) {
            return function (dictBooleanAlgebra) {
                return new BooleanAlgebraRecord(function () {
                    return Data_HeytingAlgebra.heytingAlgebraRecordCons(dictIsSymbol)(dictCons)(dictBooleanAlgebraRecord.HeytingAlgebraRecord0())(dictBooleanAlgebra.HeytingAlgebra0());
                });
            };
        };
    };
};
var booleanAlgebraRecord = function (dictRowToList) {
    return function (dictBooleanAlgebraRecord) {
        return new BooleanAlgebra(function () {
            return Data_HeytingAlgebra.heytingAlgebraRecord(dictRowToList)(dictBooleanAlgebraRecord.HeytingAlgebraRecord0());
        });
    };
};
var booleanAlgebraFn = function (dictBooleanAlgebra) {
    return new BooleanAlgebra(function () {
        return Data_HeytingAlgebra.heytingAlgebraFunction(dictBooleanAlgebra.HeytingAlgebra0());
    });
};
var booleanAlgebraBoolean = new BooleanAlgebra(function () {
    return Data_HeytingAlgebra.heytingAlgebraBoolean;
});
module.exports = {
    BooleanAlgebra: BooleanAlgebra,
    BooleanAlgebraRecord: BooleanAlgebraRecord,
    booleanAlgebraBoolean: booleanAlgebraBoolean,
    booleanAlgebraUnit: booleanAlgebraUnit,
    booleanAlgebraFn: booleanAlgebraFn,
    booleanAlgebraRecord: booleanAlgebraRecord,
    booleanAlgebraRecordNil: booleanAlgebraRecordNil,
    booleanAlgebraRecordCons: booleanAlgebraRecordCons
};

},{"../Data.HeytingAlgebra/index.js":84}],60:[function(require,module,exports){
"use strict";

exports.topInt = 2147483647;
exports.bottomInt = -2147483648;

exports.topChar = String.fromCharCode(65535);
exports.bottomChar = String.fromCharCode(0);

exports.topNumber = Number.POSITIVE_INFINITY;
exports.bottomNumber = Number.NEGATIVE_INFINITY;

},{}],61:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Bounded = function (Ord0, bottom, top) {
    this.Ord0 = Ord0;
    this.bottom = bottom;
    this.top = top;
};
var top = function (dict) {
    return dict.top;
};
var boundedUnit = new Bounded(function () {
    return Data_Ord.ordUnit;
}, Data_Unit.unit, Data_Unit.unit);
var boundedOrdering = new Bounded(function () {
    return Data_Ord.ordOrdering;
}, Data_Ordering.LT.value, Data_Ordering.GT.value);
var boundedNumber = new Bounded(function () {
    return Data_Ord.ordNumber;
}, $foreign.bottomNumber, $foreign.topNumber);
var boundedInt = new Bounded(function () {
    return Data_Ord.ordInt;
}, $foreign.bottomInt, $foreign.topInt);
var boundedChar = new Bounded(function () {
    return Data_Ord.ordChar;
}, $foreign.bottomChar, $foreign.topChar);
var boundedBoolean = new Bounded(function () {
    return Data_Ord.ordBoolean;
}, false, true);
var bottom = function (dict) {
    return dict.bottom;
};
module.exports = {
    Bounded: Bounded,
    bottom: bottom,
    top: top,
    boundedBoolean: boundedBoolean,
    boundedInt: boundedInt,
    boundedChar: boundedChar,
    boundedOrdering: boundedOrdering,
    boundedUnit: boundedUnit,
    boundedNumber: boundedNumber
};

},{"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Unit/index.js":132,"./foreign.js":60}],62:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Ring = require("../Data.Ring/index.js");
var CommutativeRingRecord = function (RingRecord0) {
    this.RingRecord0 = RingRecord0;
};
var CommutativeRing = function (Ring0) {
    this.Ring0 = Ring0;
};
var commutativeRingUnit = new CommutativeRing(function () {
    return Data_Ring.ringUnit;
});
var commutativeRingRecordNil = new CommutativeRingRecord(function () {
    return Data_Ring.ringRecordNil;
});
var commutativeRingRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictCommutativeRingRecord) {
            return function (dictCommutativeRing) {
                return new CommutativeRingRecord(function () {
                    return Data_Ring.ringRecordCons(dictIsSymbol)(dictCons)(dictCommutativeRingRecord.RingRecord0())(dictCommutativeRing.Ring0());
                });
            };
        };
    };
};
var commutativeRingRecord = function (dictRowToList) {
    return function (dictCommutativeRingRecord) {
        return new CommutativeRing(function () {
            return Data_Ring.ringRecord(dictRowToList)(dictCommutativeRingRecord.RingRecord0());
        });
    };
};
var commutativeRingNumber = new CommutativeRing(function () {
    return Data_Ring.ringNumber;
});
var commutativeRingInt = new CommutativeRing(function () {
    return Data_Ring.ringInt;
});
var commutativeRingFn = function (dictCommutativeRing) {
    return new CommutativeRing(function () {
        return Data_Ring.ringFn(dictCommutativeRing.Ring0());
    });
};
module.exports = {
    CommutativeRing: CommutativeRing,
    CommutativeRingRecord: CommutativeRingRecord,
    commutativeRingInt: commutativeRingInt,
    commutativeRingNumber: commutativeRingNumber,
    commutativeRingUnit: commutativeRingUnit,
    commutativeRingFn: commutativeRingFn,
    commutativeRingRecord: commutativeRingRecord,
    commutativeRingRecordNil: commutativeRingRecordNil,
    commutativeRingRecordCons: commutativeRingRecordCons
};

},{"../Data.Ring/index.js":107}],63:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Identity = require("../Data.Identity/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Distributive = function (Functor0, collect, distribute) {
    this.Functor0 = Functor0;
    this.collect = collect;
    this.distribute = distribute;
};
var distributiveIdentity = new Distributive(function () {
    return Data_Identity.functorIdentity;
}, function (dictFunctor) {
    return function (f) {
        var $11 = Data_Functor.map(dictFunctor)((function () {
            var $13 = Data_Newtype.unwrap(Data_Identity.newtypeIdentity);
            return function ($14) {
                return $13(f($14));
            };
        })());
        return function ($12) {
            return Data_Identity.Identity($11($12));
        };
    };
}, function (dictFunctor) {
    var $15 = Data_Functor.map(dictFunctor)(Data_Newtype.unwrap(Data_Identity.newtypeIdentity));
    return function ($16) {
        return Data_Identity.Identity($15($16));
    };
});
var distribute = function (dict) {
    return dict.distribute;
};
var distributiveFunction = new Distributive(function () {
    return Data_Functor.functorFn;
}, function (dictFunctor) {
    return function (f) {
        var $17 = distribute(distributiveFunction)(dictFunctor);
        var $18 = Data_Functor.map(dictFunctor)(f);
        return function ($19) {
            return $17($18($19));
        };
    };
}, function (dictFunctor) {
    return function (a) {
        return function (e) {
            return Data_Functor.map(dictFunctor)(function (v) {
                return v(e);
            })(a);
        };
    };
});
var cotraverse = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            var $20 = Data_Functor.map(dictDistributive.Functor0())(f);
            var $21 = distribute(dictDistributive)(dictFunctor);
            return function ($22) {
                return $20($21($22));
            };
        };
    };
};
var collectDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            var $23 = distribute(dictDistributive)(dictFunctor);
            var $24 = Data_Functor.map(dictFunctor)(f);
            return function ($25) {
                return $23($24($25));
            };
        };
    };
};
var collect = function (dict) {
    return dict.collect;
};
var distributeDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return collect(dictDistributive)(dictFunctor)(Control_Category.identity(Control_Category.categoryFn));
    };
};
module.exports = {
    collect: collect,
    distribute: distribute,
    Distributive: Distributive,
    distributeDefault: distributeDefault,
    collectDefault: collectDefault,
    cotraverse: cotraverse,
    distributiveIdentity: distributiveIdentity,
    distributiveFunction: distributiveFunction
};

},{"../Control.Category/index.js":14,"../Data.Functor/index.js":80,"../Data.Identity/index.js":85,"../Data.Newtype/index.js":98}],64:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var DivisionRing = function (Ring0, recip) {
    this.Ring0 = Ring0;
    this.recip = recip;
};
var recip = function (dict) {
    return dict.recip;
};
var rightDiv = function (dictDivisionRing) {
    return function (a) {
        return function (b) {
            return Data_Semiring.mul((dictDivisionRing.Ring0()).Semiring0())(a)(recip(dictDivisionRing)(b));
        };
    };
};
var leftDiv = function (dictDivisionRing) {
    return function (a) {
        return function (b) {
            return Data_Semiring.mul((dictDivisionRing.Ring0()).Semiring0())(recip(dictDivisionRing)(b))(a);
        };
    };
};
var divisionringNumber = new DivisionRing(function () {
    return Data_Ring.ringNumber;
}, function (x) {
    return 1.0 / x;
});
module.exports = {
    DivisionRing: DivisionRing,
    recip: recip,
    leftDiv: leftDiv,
    rightDiv: rightDiv,
    divisionringNumber: divisionringNumber
};

},{"../Data.Ring/index.js":107,"../Data.Semiring/index.js":115}],65:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Extend = require("../Control.Extend/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Bifoldable = require("../Data.Bifoldable/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Bitraversable = require("../Data.Bitraversable/index.js");
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_Invariant = require("../Data.Functor.Invariant/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_TraversableWithIndex = require("../Data.TraversableWithIndex/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Left = (function () {
    function Left(value0) {
        this.value0 = value0;
    };
    Left.create = function (value0) {
        return new Left(value0);
    };
    return Left;
})();
var Right = (function () {
    function Right(value0) {
        this.value0 = value0;
    };
    Right.create = function (value0) {
        return new Right(value0);
    };
    return Right;
})();
var showEither = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            if (v instanceof Left) {
                return "(Left " + (Data_Show.show(dictShow)(v.value0) + ")");
            };
            if (v instanceof Right) {
                return "(Right " + (Data_Show.show(dictShow1)(v.value0) + ")");
            };
            throw new Error("Failed pattern match at Data.Either (line 163, column 1 - line 165, column 46): " + [ v.constructor.name ]);
        });
    };
};
var note$prime = function (f) {
    return Data_Maybe["maybe'"](function ($198) {
        return Left.create(f($198));
    })(Right.create);
};
var note = function (a) {
    return Data_Maybe.maybe(new Left(a))(Right.create);
};
var functorEither = new Data_Functor.Functor(function (f) {
    return function (m) {
        if (m instanceof Left) {
            return new Left(m.value0);
        };
        if (m instanceof Right) {
            return new Right(f(m.value0));
        };
        throw new Error("Failed pattern match at Data.Either (line 38, column 1 - line 38, column 52): " + [ m.constructor.name ]);
    };
});
var functorWithIndexEither = new Data_FunctorWithIndex.FunctorWithIndex(function () {
    return functorEither;
}, function (f) {
    return Data_Functor.map(functorEither)(f(Data_Unit.unit));
});
var invariantEither = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorEither));
var fromRight = function (dictPartial) {
    return function (v) {
        if (v instanceof Right) {
            return v.value0;
        };
        throw new Error("Failed pattern match at Data.Either (line 261, column 1 - line 261, column 52): " + [ v.constructor.name ]);
    };
};
var fromLeft = function (dictPartial) {
    return function (v) {
        if (v instanceof Left) {
            return v.value0;
        };
        throw new Error("Failed pattern match at Data.Either (line 256, column 1 - line 256, column 51): " + [ v.constructor.name ]);
    };
};
var foldableEither = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            if (v instanceof Left) {
                return Data_Monoid.mempty(dictMonoid);
            };
            if (v instanceof Right) {
                return f(v.value0);
            };
            throw new Error("Failed pattern match at Data.Either (line 187, column 1 - line 193, column 28): " + [ f.constructor.name, v.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(z)(v1.value0);
            };
            throw new Error("Failed pattern match at Data.Either (line 187, column 1 - line 193, column 28): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(v1.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Either (line 187, column 1 - line 193, column 28): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
});
var foldableWithIndexEither = new Data_FoldableWithIndex.FoldableWithIndex(function () {
    return foldableEither;
}, function (dictMonoid) {
    return function (f) {
        return function (v) {
            if (v instanceof Left) {
                return Data_Monoid.mempty(dictMonoid);
            };
            if (v instanceof Right) {
                return f(Data_Unit.unit)(v.value0);
            };
            throw new Error("Failed pattern match at Data.Either (line 195, column 1 - line 201, column 42): " + [ f.constructor.name, v.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(Data_Unit.unit)(z)(v1.value0);
            };
            throw new Error("Failed pattern match at Data.Either (line 195, column 1 - line 201, column 42): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(Data_Unit.unit)(v1.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Either (line 195, column 1 - line 201, column 42): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
});
var traversableEither = new Data_Traversable.Traversable(function () {
    return foldableEither;
}, function () {
    return functorEither;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Left) {
            return Control_Applicative.pure(dictApplicative)(new Left(v.value0));
        };
        if (v instanceof Right) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Either (line 211, column 1 - line 215, column 36): " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v1 instanceof Left) {
                return Control_Applicative.pure(dictApplicative)(new Left(v1.value0));
            };
            if (v1 instanceof Right) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Either (line 211, column 1 - line 215, column 36): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
});
var traversableWithIndexEither = new Data_TraversableWithIndex.TraversableWithIndex(function () {
    return foldableWithIndexEither;
}, function () {
    return functorWithIndexEither;
}, function () {
    return traversableEither;
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v1 instanceof Left) {
                return Control_Applicative.pure(dictApplicative)(new Left(v1.value0));
            };
            if (v1 instanceof Right) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v(Data_Unit.unit)(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Either (line 217, column 1 - line 219, column 53): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
});
var extendEither = new Control_Extend.Extend(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v1 instanceof Left) {
            return new Left(v1.value0);
        };
        return new Right(v(v1));
    };
});
var eqEither = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                if (x instanceof Left && y instanceof Left) {
                    return Data_Eq.eq(dictEq)(x.value0)(y.value0);
                };
                if (x instanceof Right && y instanceof Right) {
                    return Data_Eq.eq(dictEq1)(x.value0)(y.value0);
                };
                return false;
            };
        });
    };
};
var ordEither = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqEither(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                if (x instanceof Left && y instanceof Left) {
                    return Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                };
                if (x instanceof Left) {
                    return Data_Ordering.LT.value;
                };
                if (y instanceof Left) {
                    return Data_Ordering.GT.value;
                };
                if (x instanceof Right && y instanceof Right) {
                    return Data_Ord.compare(dictOrd1)(x.value0)(y.value0);
                };
                throw new Error("Failed pattern match at Data.Either (line 179, column 1 - line 179, column 64): " + [ x.constructor.name, y.constructor.name ]);
            };
        });
    };
};
var eq1Either = function (dictEq) {
    return new Data_Eq.Eq1(function (dictEq1) {
        return Data_Eq.eq(eqEither(dictEq)(dictEq1));
    });
};
var ord1Either = function (dictOrd) {
    return new Data_Ord.Ord1(function () {
        return eq1Either(dictOrd.Eq0());
    }, function (dictOrd1) {
        return Data_Ord.compare(ordEither(dictOrd)(dictOrd1));
    });
};
var either = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Left) {
                return v(v2.value0);
            };
            if (v2 instanceof Right) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var hush = either(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
var isLeft = either(Data_Function["const"](true))(Data_Function["const"](false));
var isRight = either(Data_Function["const"](false))(Data_Function["const"](true));
var choose = function (dictAlt) {
    return function (a) {
        return function (b) {
            return Control_Alt.alt(dictAlt)(Data_Functor.map(dictAlt.Functor0())(Left.create)(a))(Data_Functor.map(dictAlt.Functor0())(Right.create)(b));
        };
    };
};
var boundedEither = function (dictBounded) {
    return function (dictBounded1) {
        return new Data_Bounded.Bounded(function () {
            return ordEither(dictBounded.Ord0())(dictBounded1.Ord0());
        }, new Left(Data_Bounded.bottom(dictBounded)), new Right(Data_Bounded.top(dictBounded1)));
    };
};
var bifunctorEither = new Data_Bifunctor.Bifunctor(function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Left) {
                return new Left(v(v2.value0));
            };
            if (v2 instanceof Right) {
                return new Right(v1(v2.value0));
            };
            throw new Error("Failed pattern match at Data.Either (line 46, column 1 - line 48, column 36): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
});
var bifoldableEither = new Data_Bifoldable.Bifoldable(function (dictMonoid) {
    return function (v) {
        return function (v1) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(v2.value0);
                };
                if (v2 instanceof Right) {
                    return v1(v2.value0);
                };
                throw new Error("Failed pattern match at Data.Either (line 203, column 1 - line 209, column 32): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
            };
        };
    };
}, function (v) {
    return function (v1) {
        return function (z) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(z)(v2.value0);
                };
                if (v2 instanceof Right) {
                    return v1(z)(v2.value0);
                };
                throw new Error("Failed pattern match at Data.Either (line 203, column 1 - line 209, column 32): " + [ v.constructor.name, v1.constructor.name, z.constructor.name, v2.constructor.name ]);
            };
        };
    };
}, function (v) {
    return function (v1) {
        return function (z) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(v2.value0)(z);
                };
                if (v2 instanceof Right) {
                    return v1(v2.value0)(z);
                };
                throw new Error("Failed pattern match at Data.Either (line 203, column 1 - line 209, column 32): " + [ v.constructor.name, v1.constructor.name, z.constructor.name, v2.constructor.name ]);
            };
        };
    };
});
var bitraversableEither = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableEither;
}, function () {
    return bifunctorEither;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Left) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Left.create)(v.value0);
        };
        if (v instanceof Right) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Either (line 221, column 1 - line 225, column 37): " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Left.create)(v(v2.value0));
                };
                if (v2 instanceof Right) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v1(v2.value0));
                };
                throw new Error("Failed pattern match at Data.Either (line 221, column 1 - line 225, column 37): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
            };
        };
    };
});
var applyEither = new Control_Apply.Apply(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v instanceof Left) {
            return new Left(v.value0);
        };
        if (v instanceof Right) {
            return Data_Functor.map(functorEither)(v.value0)(v1);
        };
        throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 84, column 30): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var bindEither = new Control_Bind.Bind(function () {
    return applyEither;
}, either(function (e) {
    return function (v) {
        return new Left(e);
    };
})(function (a) {
    return function (f) {
        return f(a);
    };
}));
var semigroupEither = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (x) {
        return function (y) {
            return Control_Apply.apply(applyEither)(Data_Functor.map(functorEither)(Data_Semigroup.append(dictSemigroup))(x))(y);
        };
    });
};
var applicativeEither = new Control_Applicative.Applicative(function () {
    return applyEither;
}, Right.create);
var monadEither = new Control_Monad.Monad(function () {
    return applicativeEither;
}, function () {
    return bindEither;
});
var altEither = new Control_Alt.Alt(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v instanceof Left) {
            return v1;
        };
        return v;
    };
});
module.exports = {
    Left: Left,
    Right: Right,
    either: either,
    choose: choose,
    isLeft: isLeft,
    isRight: isRight,
    fromLeft: fromLeft,
    fromRight: fromRight,
    note: note,
    "note'": note$prime,
    hush: hush,
    functorEither: functorEither,
    functorWithIndexEither: functorWithIndexEither,
    invariantEither: invariantEither,
    bifunctorEither: bifunctorEither,
    applyEither: applyEither,
    applicativeEither: applicativeEither,
    altEither: altEither,
    bindEither: bindEither,
    monadEither: monadEither,
    extendEither: extendEither,
    showEither: showEither,
    eqEither: eqEither,
    eq1Either: eq1Either,
    ordEither: ordEither,
    ord1Either: ord1Either,
    boundedEither: boundedEither,
    foldableEither: foldableEither,
    foldableWithIndexEither: foldableWithIndexEither,
    bifoldableEither: bifoldableEither,
    traversableEither: traversableEither,
    traversableWithIndexEither: traversableWithIndexEither,
    bitraversableEither: bitraversableEither,
    semigroupEither: semigroupEither
};

},{"../Control.Alt/index.js":5,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Extend/index.js":17,"../Control.Monad/index.js":33,"../Data.Bifoldable/index.js":50,"../Data.Bifunctor/index.js":56,"../Data.Bitraversable/index.js":57,"../Data.Bounded/index.js":61,"../Data.Eq/index.js":67,"../Data.Foldable/index.js":71,"../Data.FoldableWithIndex/index.js":72,"../Data.Function/index.js":75,"../Data.Functor.Invariant/index.js":78,"../Data.Functor/index.js":80,"../Data.FunctorWithIndex/index.js":82,"../Data.Maybe/index.js":90,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117,"../Data.Traversable/index.js":122,"../Data.TraversableWithIndex/index.js":123,"../Data.Unit/index.js":132}],66:[function(require,module,exports){
"use strict";

var refEq = function (r1) {
  return function (r2) {
    return r1 === r2;
  };
};

exports.eqBooleanImpl = refEq;
exports.eqIntImpl = refEq;
exports.eqNumberImpl = refEq;
exports.eqCharImpl = refEq;
exports.eqStringImpl = refEq;

exports.eqArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      if (xs === ys) return true;
      if (xs.length !== ys.length) return false;
      for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i])(ys[i])) return false;
      }
      return true;
    };
  };
};

},{}],67:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var EqRecord = function (eqRecord) {
    this.eqRecord = eqRecord;
};
var Eq1 = function (eq1) {
    this.eq1 = eq1;
};
var Eq = function (eq) {
    this.eq = eq;
};
var eqVoid = new Eq(function (v) {
    return function (v1) {
        return true;
    };
});
var eqUnit = new Eq(function (v) {
    return function (v1) {
        return true;
    };
});
var eqString = new Eq($foreign.eqStringImpl);
var eqRowNil = new EqRecord(function (v) {
    return function (v1) {
        return function (v2) {
            return true;
        };
    };
});
var eqRecord = function (dict) {
    return dict.eqRecord;
};
var eqRec = function (dictRowToList) {
    return function (dictEqRecord) {
        return new Eq(eqRecord(dictEqRecord)(Type_Data_RowList.RLProxy.value));
    };
};
var eqNumber = new Eq($foreign.eqNumberImpl);
var eqInt = new Eq($foreign.eqIntImpl);
var eqChar = new Eq($foreign.eqCharImpl);
var eqBoolean = new Eq($foreign.eqBooleanImpl);
var eq1 = function (dict) {
    return dict.eq1;
};
var eq = function (dict) {
    return dict.eq;
};
var eqArray = function (dictEq) {
    return new Eq($foreign.eqArrayImpl(eq(dictEq)));
};
var eq1Array = new Eq1(function (dictEq) {
    return eq(eqArray(dictEq));
});
var eqRowCons = function (dictEqRecord) {
    return function (dictCons) {
        return function (dictIsSymbol) {
            return function (dictEq) {
                return new EqRecord(function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = eqRecord(dictEqRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var get = Record_Unsafe.unsafeGet(key);
                            return eq(dictEq)(get(ra))(get(rb)) && tail;
                        };
                    };
                });
            };
        };
    };
};
var notEq = function (dictEq) {
    return function (x) {
        return function (y) {
            return eq(eqBoolean)(eq(dictEq)(x)(y))(false);
        };
    };
};
var notEq1 = function (dictEq1) {
    return function (dictEq) {
        return function (x) {
            return function (y) {
                return eq(eqBoolean)(eq1(dictEq1)(dictEq)(x)(y))(false);
            };
        };
    };
};
module.exports = {
    Eq: Eq,
    eq: eq,
    notEq: notEq,
    Eq1: Eq1,
    eq1: eq1,
    notEq1: notEq1,
    EqRecord: EqRecord,
    eqRecord: eqRecord,
    eqBoolean: eqBoolean,
    eqInt: eqInt,
    eqNumber: eqNumber,
    eqChar: eqChar,
    eqString: eqString,
    eqUnit: eqUnit,
    eqVoid: eqVoid,
    eqArray: eqArray,
    eqRec: eqRec,
    eq1Array: eq1Array,
    eqRowNil: eqRowNil,
    eqRowCons: eqRowCons
};

},{"../Data.Symbol/index.js":119,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168,"./foreign.js":66}],68:[function(require,module,exports){
"use strict";

exports.intDegree = function (x) {
  return Math.min(Math.abs(x), 2147483647);
};

// See the Euclidean definition in
// https://en.m.wikipedia.org/wiki/Modulo_operation.
exports.intDiv = function (x) {
  return function (y) {
    if (y === 0) return 0;
    return y > 0 ? Math.floor(x / y) : -Math.floor(x / -y);
  };
};

exports.intMod = function (x) {
  return function (y) {
    if (y === 0) return 0;
    var yy = Math.abs(y);
    return ((x % yy) + yy) % yy;
  };
};

exports.numDiv = function (n1) {
  return function (n2) {
    return n1 / n2;
  };
};

},{}],69:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_CommutativeRing = require("../Data.CommutativeRing/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var EuclideanRing = function (CommutativeRing0, degree, div, mod) {
    this.CommutativeRing0 = CommutativeRing0;
    this.degree = degree;
    this.div = div;
    this.mod = mod;
};
var mod = function (dict) {
    return dict.mod;
};
var gcd = function ($copy_dictEq) {
    return function ($copy_dictEuclideanRing) {
        return function ($copy_a) {
            return function ($copy_b) {
                var $tco_var_dictEq = $copy_dictEq;
                var $tco_var_dictEuclideanRing = $copy_dictEuclideanRing;
                var $tco_var_a = $copy_a;
                var $tco_done = false;
                var $tco_result;
                function $tco_loop(dictEq, dictEuclideanRing, a, b) {
                    var $7 = Data_Eq.eq(dictEq)(b)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0()));
                    if ($7) {
                        $tco_done = true;
                        return a;
                    };
                    $tco_var_dictEq = dictEq;
                    $tco_var_dictEuclideanRing = dictEuclideanRing;
                    $tco_var_a = b;
                    $copy_b = mod(dictEuclideanRing)(a)(b);
                    return;
                };
                while (!$tco_done) {
                    $tco_result = $tco_loop($tco_var_dictEq, $tco_var_dictEuclideanRing, $tco_var_a, $copy_b);
                };
                return $tco_result;
            };
        };
    };
};
var euclideanRingNumber = new EuclideanRing(function () {
    return Data_CommutativeRing.commutativeRingNumber;
}, function (v) {
    return 1;
}, $foreign.numDiv, function (v) {
    return function (v1) {
        return 0.0;
    };
});
var euclideanRingInt = new EuclideanRing(function () {
    return Data_CommutativeRing.commutativeRingInt;
}, $foreign.intDegree, $foreign.intDiv, $foreign.intMod);
var div = function (dict) {
    return dict.div;
};
var lcm = function (dictEq) {
    return function (dictEuclideanRing) {
        return function (a) {
            return function (b) {
                var $8 = Data_Eq.eq(dictEq)(a)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0())) || Data_Eq.eq(dictEq)(b)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0()));
                if ($8) {
                    return Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0());
                };
                return div(dictEuclideanRing)(Data_Semiring.mul(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0())(a)(b))(gcd(dictEq)(dictEuclideanRing)(a)(b));
            };
        };
    };
};
var degree = function (dict) {
    return dict.degree;
};
module.exports = {
    EuclideanRing: EuclideanRing,
    degree: degree,
    div: div,
    mod: mod,
    gcd: gcd,
    lcm: lcm,
    euclideanRingInt: euclideanRingInt,
    euclideanRingNumber: euclideanRingNumber
};

},{"../Data.CommutativeRing/index.js":62,"../Data.Eq/index.js":67,"../Data.Semiring/index.js":115,"./foreign.js":68}],70:[function(require,module,exports){
"use strict";

exports.foldrArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};

exports.foldlArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

},{}],71:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Alt = require("../Control.Alt/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Endo = require("../Data.Monoid.Endo/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Foldable = function (foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
};
var foldr = function (dict) {
    return dict.foldr;
};
var indexr = function (dictFoldable) {
    return function (idx) {
        var go = function (a) {
            return function (cursor) {
                if (cursor.elem instanceof Data_Maybe.Just) {
                    return cursor;
                };
                var $106 = cursor.pos === idx;
                if ($106) {
                    return {
                        elem: new Data_Maybe.Just(a),
                        pos: cursor.pos
                    };
                };
                return {
                    pos: cursor.pos + 1 | 0,
                    elem: cursor.elem
                };
            };
        };
        var $193 = foldr(dictFoldable)(go)({
            elem: Data_Maybe.Nothing.value,
            pos: 0
        });
        return function ($194) {
            return (function (v) {
                return v.elem;
            })($193($194));
        };
    };
};
var $$null = function (dictFoldable) {
    return foldr(dictFoldable)(function (v) {
        return function (v1) {
            return false;
        };
    })(true);
};
var oneOf = function (dictFoldable) {
    return function (dictPlus) {
        return foldr(dictFoldable)(Control_Alt.alt(dictPlus.Alt0()))(Control_Plus.empty(dictPlus));
    };
};
var oneOfMap = function (dictFoldable) {
    return function (dictPlus) {
        return function (f) {
            return foldr(dictFoldable)((function () {
                var $195 = Control_Alt.alt(dictPlus.Alt0());
                return function ($196) {
                    return $195(f($196));
                };
            })())(Control_Plus.empty(dictPlus));
        };
    };
};
var traverse_ = function (dictApplicative) {
    return function (dictFoldable) {
        return function (f) {
            return foldr(dictFoldable)((function () {
                var $197 = Control_Apply.applySecond(dictApplicative.Apply0());
                return function ($198) {
                    return $197(f($198));
                };
            })())(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
        };
    };
};
var for_ = function (dictApplicative) {
    return function (dictFoldable) {
        return Data_Function.flip(traverse_(dictApplicative)(dictFoldable));
    };
};
var sequence_ = function (dictApplicative) {
    return function (dictFoldable) {
        return traverse_(dictApplicative)(dictFoldable)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var foldl = function (dict) {
    return dict.foldl;
};
var indexl = function (dictFoldable) {
    return function (idx) {
        var go = function (cursor) {
            return function (a) {
                if (cursor.elem instanceof Data_Maybe.Just) {
                    return cursor;
                };
                var $109 = cursor.pos === idx;
                if ($109) {
                    return {
                        elem: new Data_Maybe.Just(a),
                        pos: cursor.pos
                    };
                };
                return {
                    pos: cursor.pos + 1 | 0,
                    elem: cursor.elem
                };
            };
        };
        var $199 = foldl(dictFoldable)(go)({
            elem: Data_Maybe.Nothing.value,
            pos: 0
        });
        return function ($200) {
            return (function (v) {
                return v.elem;
            })($199($200));
        };
    };
};
var intercalate = function (dictFoldable) {
    return function (dictMonoid) {
        return function (sep) {
            return function (xs) {
                var go = function (v) {
                    return function (x) {
                        if (v.init) {
                            return {
                                init: false,
                                acc: x
                            };
                        };
                        return {
                            init: false,
                            acc: Data_Semigroup.append(dictMonoid.Semigroup0())(v.acc)(Data_Semigroup.append(dictMonoid.Semigroup0())(sep)(x))
                        };
                    };
                };
                return (foldl(dictFoldable)(go)({
                    init: true,
                    acc: Data_Monoid.mempty(dictMonoid)
                })(xs)).acc;
            };
        };
    };
};
var length = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(function (c) {
            return function (v) {
                return Data_Semiring.add(dictSemiring)(Data_Semiring.one(dictSemiring))(c);
            };
        })(Data_Semiring.zero(dictSemiring));
    };
};
var maximumBy = function (dictFoldable) {
    return function (cmp) {
        var max$prime = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v1);
                };
                if (v instanceof Data_Maybe.Just) {
                    return new Data_Maybe.Just((function () {
                        var $116 = Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(v.value0)(v1))(Data_Ordering.GT.value);
                        if ($116) {
                            return v.value0;
                        };
                        return v1;
                    })());
                };
                throw new Error("Failed pattern match at Data.Foldable (line 389, column 3 - line 389, column 27): " + [ v.constructor.name, v1.constructor.name ]);
            };
        };
        return foldl(dictFoldable)(max$prime)(Data_Maybe.Nothing.value);
    };
};
var maximum = function (dictOrd) {
    return function (dictFoldable) {
        return maximumBy(dictFoldable)(Data_Ord.compare(dictOrd));
    };
};
var minimumBy = function (dictFoldable) {
    return function (cmp) {
        var min$prime = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v1);
                };
                if (v instanceof Data_Maybe.Just) {
                    return new Data_Maybe.Just((function () {
                        var $120 = Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(v.value0)(v1))(Data_Ordering.LT.value);
                        if ($120) {
                            return v.value0;
                        };
                        return v1;
                    })());
                };
                throw new Error("Failed pattern match at Data.Foldable (line 402, column 3 - line 402, column 27): " + [ v.constructor.name, v1.constructor.name ]);
            };
        };
        return foldl(dictFoldable)(min$prime)(Data_Maybe.Nothing.value);
    };
};
var minimum = function (dictOrd) {
    return function (dictFoldable) {
        return minimumBy(dictFoldable)(Data_Ord.compare(dictOrd));
    };
};
var product = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(Data_Semiring.mul(dictSemiring))(Data_Semiring.one(dictSemiring));
    };
};
var sum = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(Data_Semiring.add(dictSemiring))(Data_Semiring.zero(dictSemiring));
    };
};
var foldableMultiplicative = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableMaybe = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            if (v instanceof Data_Maybe.Nothing) {
                return Data_Monoid.mempty(dictMonoid);
            };
            if (v instanceof Data_Maybe.Just) {
                return f(v.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable (line 129, column 1 - line 135, column 27): " + [ f.constructor.name, v.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (v1 instanceof Data_Maybe.Just) {
                return v(z)(v1.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable (line 129, column 1 - line 135, column 27): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (v1 instanceof Data_Maybe.Just) {
                return v(v1.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Foldable (line 129, column 1 - line 135, column 27): " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
});
var foldableDual = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableDisj = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableConj = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableAdditive = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldMapDefaultR = function (dictFoldable) {
    return function (dictMonoid) {
        return function (f) {
            return foldr(dictFoldable)(function (x) {
                return function (acc) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(f(x))(acc);
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldableArray = new Foldable(function (dictMonoid) {
    return foldMapDefaultR(foldableArray)(dictMonoid);
}, $foreign.foldlArray, $foreign.foldrArray);
var foldMapDefaultL = function (dictFoldable) {
    return function (dictMonoid) {
        return function (f) {
            return foldl(dictFoldable)(function (acc) {
                return function (x) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(acc)(f(x));
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldMap = function (dict) {
    return dict.foldMap;
};
var foldableFirst = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return foldMap(foldableMaybe)(dictMonoid)(f)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldl(foldableMaybe)(f)(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldr(foldableMaybe)(f)(z)(v);
        };
    };
});
var foldableLast = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return foldMap(foldableMaybe)(dictMonoid)(f)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldl(foldableMaybe)(f)(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldr(foldableMaybe)(f)(z)(v);
        };
    };
});
var foldlDefault = function (dictFoldable) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(Data_Newtype.unwrap(Data_Newtype.newtypeDual)(foldMap(dictFoldable)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn)))((function () {
                    var $201 = Data_Function.flip(c);
                    return function ($202) {
                        return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo($201($202)));
                    };
                })())(xs)))(u);
            };
        };
    };
};
var foldrDefault = function (dictFoldable) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(foldMap(dictFoldable)(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn))(function ($203) {
                    return Data_Monoid_Endo.Endo(c($203));
                })(xs))(u);
            };
        };
    };
};
var surroundMap = function (dictFoldable) {
    return function (dictSemigroup) {
        return function (d) {
            return function (t) {
                return function (f) {
                    var joined = function (a) {
                        return function (m) {
                            return Data_Semigroup.append(dictSemigroup)(d)(Data_Semigroup.append(dictSemigroup)(t(a))(m));
                        };
                    };
                    return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(foldMap(dictFoldable)(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn))(joined)(f))(d);
                };
            };
        };
    };
};
var surround = function (dictFoldable) {
    return function (dictSemigroup) {
        return function (d) {
            return surroundMap(dictFoldable)(dictSemigroup)(d)(Control_Category.identity(Control_Category.categoryFn));
        };
    };
};
var foldM = function (dictFoldable) {
    return function (dictMonad) {
        return function (f) {
            return function (a0) {
                return foldl(dictFoldable)(function (ma) {
                    return function (b) {
                        return Control_Bind.bind(dictMonad.Bind1())(ma)(Data_Function.flip(f)(b));
                    };
                })(Control_Applicative.pure(dictMonad.Applicative0())(a0));
            };
        };
    };
};
var fold = function (dictFoldable) {
    return function (dictMonoid) {
        return foldMap(dictFoldable)(dictMonoid)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var findMap = function (dictFoldable) {
    return function (p) {
        var go = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return p(v1);
                };
                return v;
            };
        };
        return foldl(dictFoldable)(go)(Data_Maybe.Nothing.value);
    };
};
var find = function (dictFoldable) {
    return function (p) {
        var go = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing && p(v1)) {
                    return new Data_Maybe.Just(v1);
                };
                return v;
            };
        };
        return foldl(dictFoldable)(go)(Data_Maybe.Nothing.value);
    };
};
var any = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Newtype.newtypeDisj)(Data_Newtype.newtypeDisj)(Data_Monoid_Disj.Disj)(foldMap(dictFoldable)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra)));
    };
};
var elem = function (dictFoldable) {
    return function (dictEq) {
        var $204 = any(dictFoldable)(Data_HeytingAlgebra.heytingAlgebraBoolean);
        var $205 = Data_Eq.eq(dictEq);
        return function ($206) {
            return $204($205($206));
        };
    };
};
var notElem = function (dictFoldable) {
    return function (dictEq) {
        return function (x) {
            var $207 = Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean);
            var $208 = elem(dictFoldable)(dictEq)(x);
            return function ($209) {
                return $207($208($209));
            };
        };
    };
};
var or = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return any(dictFoldable)(dictHeytingAlgebra)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var all = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Newtype.newtypeConj)(Data_Newtype.newtypeConj)(Data_Monoid_Conj.Conj)(foldMap(dictFoldable)(Data_Monoid_Conj.monoidConj(dictHeytingAlgebra)));
    };
};
var and = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return all(dictFoldable)(dictHeytingAlgebra)(Control_Category.identity(Control_Category.categoryFn));
    };
};
module.exports = {
    Foldable: Foldable,
    foldr: foldr,
    foldl: foldl,
    foldMap: foldMap,
    foldrDefault: foldrDefault,
    foldlDefault: foldlDefault,
    foldMapDefaultL: foldMapDefaultL,
    foldMapDefaultR: foldMapDefaultR,
    fold: fold,
    foldM: foldM,
    traverse_: traverse_,
    for_: for_,
    sequence_: sequence_,
    oneOf: oneOf,
    oneOfMap: oneOfMap,
    intercalate: intercalate,
    surroundMap: surroundMap,
    surround: surround,
    and: and,
    or: or,
    all: all,
    any: any,
    sum: sum,
    product: product,
    elem: elem,
    notElem: notElem,
    indexl: indexl,
    indexr: indexr,
    find: find,
    findMap: findMap,
    maximum: maximum,
    maximumBy: maximumBy,
    minimum: minimum,
    minimumBy: minimumBy,
    "null": $$null,
    length: length,
    foldableArray: foldableArray,
    foldableMaybe: foldableMaybe,
    foldableFirst: foldableFirst,
    foldableLast: foldableLast,
    foldableAdditive: foldableAdditive,
    foldableDual: foldableDual,
    foldableDisj: foldableDisj,
    foldableConj: foldableConj,
    foldableMultiplicative: foldableMultiplicative
};

},{"../Control.Alt/index.js":5,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Control.Plus/index.js":38,"../Data.Eq/index.js":67,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Maybe/index.js":90,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Endo/index.js":95,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Unit/index.js":132,"./foreign.js":70}],72:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Endo = require("../Data.Monoid.Endo/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Tuple = (function () {
    function Tuple(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Tuple.create = function (value0) {
        return function (value1) {
            return new Tuple(value0, value1);
        };
    };
    return Tuple;
})();
var FoldableWithIndex = function (Foldable0, foldMapWithIndex, foldlWithIndex, foldrWithIndex) {
    this.Foldable0 = Foldable0;
    this.foldMapWithIndex = foldMapWithIndex;
    this.foldlWithIndex = foldlWithIndex;
    this.foldrWithIndex = foldrWithIndex;
};
var foldrWithIndex = function (dict) {
    return dict.foldrWithIndex;
};
var traverseWithIndex_ = function (dictApplicative) {
    return function (dictFoldableWithIndex) {
        return function (f) {
            return foldrWithIndex(dictFoldableWithIndex)(function (i) {
                var $46 = Control_Apply.applySecond(dictApplicative.Apply0());
                var $47 = f(i);
                return function ($48) {
                    return $46($47($48));
                };
            })(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
        };
    };
};
var forWithIndex_ = function (dictApplicative) {
    return function (dictFoldableWithIndex) {
        return Data_Function.flip(traverseWithIndex_(dictApplicative)(dictFoldableWithIndex));
    };
};
var foldrDefault = function (dictFoldableWithIndex) {
    return function (f) {
        return foldrWithIndex(dictFoldableWithIndex)(Data_Function["const"](f));
    };
};
var foldlWithIndex = function (dict) {
    return dict.foldlWithIndex;
};
var foldlDefault = function (dictFoldableWithIndex) {
    return function (f) {
        return foldlWithIndex(dictFoldableWithIndex)(Data_Function["const"](f));
    };
};
var foldableWithIndexMultiplicative = new FoldableWithIndex(function () {
    return Data_Foldable.foldableMultiplicative;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableMultiplicative)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableMultiplicative)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableMultiplicative)(f(Data_Unit.unit));
});
var foldableWithIndexMaybe = new FoldableWithIndex(function () {
    return Data_Foldable.foldableMaybe;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableMaybe)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableMaybe)(f(Data_Unit.unit));
});
var foldableWithIndexLast = new FoldableWithIndex(function () {
    return Data_Foldable.foldableLast;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableLast)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableLast)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableLast)(f(Data_Unit.unit));
});
var foldableWithIndexFirst = new FoldableWithIndex(function () {
    return Data_Foldable.foldableFirst;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableFirst)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableFirst)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableFirst)(f(Data_Unit.unit));
});
var foldableWithIndexDual = new FoldableWithIndex(function () {
    return Data_Foldable.foldableDual;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableDual)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableDual)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableDual)(f(Data_Unit.unit));
});
var foldableWithIndexDisj = new FoldableWithIndex(function () {
    return Data_Foldable.foldableDisj;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableDisj)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableDisj)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableDisj)(f(Data_Unit.unit));
});
var foldableWithIndexConj = new FoldableWithIndex(function () {
    return Data_Foldable.foldableConj;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableConj)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableConj)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableConj)(f(Data_Unit.unit));
});
var foldableWithIndexAdditive = new FoldableWithIndex(function () {
    return Data_Foldable.foldableAdditive;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableAdditive)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableAdditive)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableAdditive)(f(Data_Unit.unit));
});
var foldWithIndexM = function (dictFoldableWithIndex) {
    return function (dictMonad) {
        return function (f) {
            return function (a0) {
                return foldlWithIndex(dictFoldableWithIndex)(function (i) {
                    return function (ma) {
                        return function (b) {
                            return Control_Bind.bind(dictMonad.Bind1())(ma)(Data_Function.flip(f(i))(b));
                        };
                    };
                })(Control_Applicative.pure(dictMonad.Applicative0())(a0));
            };
        };
    };
};
var foldMapWithIndexDefaultR = function (dictFoldableWithIndex) {
    return function (dictMonoid) {
        return function (f) {
            return foldrWithIndex(dictFoldableWithIndex)(function (i) {
                return function (x) {
                    return function (acc) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(f(i)(x))(acc);
                    };
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldableWithIndexArray = new FoldableWithIndex(function () {
    return Data_Foldable.foldableArray;
}, function (dictMonoid) {
    return foldMapWithIndexDefaultR(foldableWithIndexArray)(dictMonoid);
}, function (f) {
    return function (z) {
        var $49 = Data_Foldable.foldl(Data_Foldable.foldableArray)(function (y) {
            return function (v) {
                return f(v.value0)(y)(v.value1);
            };
        })(z);
        var $50 = Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Tuple.create);
        return function ($51) {
            return $49($50($51));
        };
    };
}, function (f) {
    return function (z) {
        var $52 = Data_Foldable.foldr(Data_Foldable.foldableArray)(function (v) {
            return function (y) {
                return f(v.value0)(v.value1)(y);
            };
        })(z);
        var $53 = Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Tuple.create);
        return function ($54) {
            return $52($53($54));
        };
    };
});
var foldMapWithIndexDefaultL = function (dictFoldableWithIndex) {
    return function (dictMonoid) {
        return function (f) {
            return foldlWithIndex(dictFoldableWithIndex)(function (i) {
                return function (acc) {
                    return function (x) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(acc)(f(i)(x));
                    };
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldMapWithIndex = function (dict) {
    return dict.foldMapWithIndex;
};
var foldlWithIndexDefault = function (dictFoldableWithIndex) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(Data_Newtype.unwrap(Data_Newtype.newtypeDual)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn)))(function (i) {
                    var $55 = Data_Function.flip(c(i));
                    return function ($56) {
                        return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo($55($56)));
                    };
                })(xs)))(u);
            };
        };
    };
};
var foldrWithIndexDefault = function (dictFoldableWithIndex) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn))(function (i) {
                    var $57 = c(i);
                    return function ($58) {
                        return Data_Monoid_Endo.Endo($57($58));
                    };
                })(xs))(u);
            };
        };
    };
};
var surroundMapWithIndex = function (dictFoldableWithIndex) {
    return function (dictSemigroup) {
        return function (d) {
            return function (t) {
                return function (f) {
                    var joined = function (i) {
                        return function (a) {
                            return function (m) {
                                return Data_Semigroup.append(dictSemigroup)(d)(Data_Semigroup.append(dictSemigroup)(t(i)(a))(m));
                            };
                        };
                    };
                    return Data_Newtype.unwrap(Data_Newtype.newtypeEndo)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Endo.monoidEndo(Control_Category.categoryFn))(joined)(f))(d);
                };
            };
        };
    };
};
var foldMapDefault = function (dictFoldableWithIndex) {
    return function (dictMonoid) {
        return function (f) {
            return foldMapWithIndex(dictFoldableWithIndex)(dictMonoid)(Data_Function["const"](f));
        };
    };
};
var findWithIndex = function (dictFoldableWithIndex) {
    return function (p) {
        var go = function (v) {
            return function (v1) {
                return function (v2) {
                    if (v1 instanceof Data_Maybe.Nothing && p(v)(v2)) {
                        return new Data_Maybe.Just({
                            index: v,
                            value: v2
                        });
                    };
                    return v1;
                };
            };
        };
        return foldlWithIndex(dictFoldableWithIndex)(go)(Data_Maybe.Nothing.value);
    };
};
var anyWithIndex = function (dictFoldableWithIndex) {
    return function (dictHeytingAlgebra) {
        return function (t) {
            var $59 = Data_Newtype.unwrap(Data_Newtype.newtypeDisj);
            var $60 = foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra))(function (i) {
                var $62 = t(i);
                return function ($63) {
                    return Data_Monoid_Disj.Disj($62($63));
                };
            });
            return function ($61) {
                return $59($60($61));
            };
        };
    };
};
var allWithIndex = function (dictFoldableWithIndex) {
    return function (dictHeytingAlgebra) {
        return function (t) {
            var $64 = Data_Newtype.unwrap(Data_Newtype.newtypeConj);
            var $65 = foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Conj.monoidConj(dictHeytingAlgebra))(function (i) {
                var $67 = t(i);
                return function ($68) {
                    return Data_Monoid_Conj.Conj($67($68));
                };
            });
            return function ($66) {
                return $64($65($66));
            };
        };
    };
};
module.exports = {
    FoldableWithIndex: FoldableWithIndex,
    foldrWithIndex: foldrWithIndex,
    foldlWithIndex: foldlWithIndex,
    foldMapWithIndex: foldMapWithIndex,
    foldrWithIndexDefault: foldrWithIndexDefault,
    foldlWithIndexDefault: foldlWithIndexDefault,
    foldMapWithIndexDefaultR: foldMapWithIndexDefaultR,
    foldMapWithIndexDefaultL: foldMapWithIndexDefaultL,
    foldWithIndexM: foldWithIndexM,
    traverseWithIndex_: traverseWithIndex_,
    forWithIndex_: forWithIndex_,
    surroundMapWithIndex: surroundMapWithIndex,
    allWithIndex: allWithIndex,
    anyWithIndex: anyWithIndex,
    findWithIndex: findWithIndex,
    foldrDefault: foldrDefault,
    foldlDefault: foldlDefault,
    foldMapDefault: foldMapDefault,
    foldableWithIndexArray: foldableWithIndexArray,
    foldableWithIndexMaybe: foldableWithIndexMaybe,
    foldableWithIndexFirst: foldableWithIndexFirst,
    foldableWithIndexLast: foldableWithIndexLast,
    foldableWithIndexAdditive: foldableWithIndexAdditive,
    foldableWithIndexDual: foldableWithIndexDual,
    foldableWithIndexDisj: foldableWithIndexDisj,
    foldableWithIndexConj: foldableWithIndexConj,
    foldableWithIndexMultiplicative: foldableWithIndexMultiplicative
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Data.Foldable/index.js":71,"../Data.Function/index.js":75,"../Data.FunctorWithIndex/index.js":82,"../Data.Maybe/index.js":90,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Endo/index.js":95,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132}],73:[function(require,module,exports){
"use strict";

// module Data.Function.Uncurried

exports.mkFn0 = function (fn) {
  return function () {
    return fn({});
  };
};

exports.mkFn2 = function (fn) {
  /* jshint maxparams: 2 */
  return function (a, b) {
    return fn(a)(b);
  };
};

exports.mkFn3 = function (fn) {
  /* jshint maxparams: 3 */
  return function (a, b, c) {
    return fn(a)(b)(c);
  };
};

exports.mkFn4 = function (fn) {
  /* jshint maxparams: 4 */
  return function (a, b, c, d) {
    return fn(a)(b)(c)(d);
  };
};

exports.mkFn5 = function (fn) {
  /* jshint maxparams: 5 */
  return function (a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e);
  };
};

exports.mkFn6 = function (fn) {
  /* jshint maxparams: 6 */
  return function (a, b, c, d, e, f) {
    return fn(a)(b)(c)(d)(e)(f);
  };
};

exports.mkFn7 = function (fn) {
  /* jshint maxparams: 7 */
  return function (a, b, c, d, e, f, g) {
    return fn(a)(b)(c)(d)(e)(f)(g);
  };
};

exports.mkFn8 = function (fn) {
  /* jshint maxparams: 8 */
  return function (a, b, c, d, e, f, g, h) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h);
  };
};

exports.mkFn9 = function (fn) {
  /* jshint maxparams: 9 */
  return function (a, b, c, d, e, f, g, h, i) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i);
  };
};

exports.mkFn10 = function (fn) {
  /* jshint maxparams: 10 */
  return function (a, b, c, d, e, f, g, h, i, j) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j);
  };
};

exports.runFn0 = function (fn) {
  return fn();
};

exports.runFn2 = function (fn) {
  return function (a) {
    return function (b) {
      return fn(a, b);
    };
  };
};

exports.runFn3 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return fn(a, b, c);
      };
    };
  };
};

exports.runFn4 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return fn(a, b, c, d);
        };
      };
    };
  };
};

exports.runFn5 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return fn(a, b, c, d, e);
          };
        };
      };
    };
  };
};

exports.runFn6 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return fn(a, b, c, d, e, f);
            };
          };
        };
      };
    };
  };
};

exports.runFn7 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return fn(a, b, c, d, e, f, g);
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn8 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return fn(a, b, c, d, e, f, g, h);
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn9 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return fn(a, b, c, d, e, f, g, h, i);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn10 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return function (j) {
                      return fn(a, b, c, d, e, f, g, h, i, j);
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

},{}],74:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var runFn1 = function (f) {
    return f;
};
var mkFn1 = function (f) {
    return f;
};
module.exports = {
    mkFn1: mkFn1,
    runFn1: runFn1,
    mkFn0: $foreign.mkFn0,
    mkFn2: $foreign.mkFn2,
    mkFn3: $foreign.mkFn3,
    mkFn4: $foreign.mkFn4,
    mkFn5: $foreign.mkFn5,
    mkFn6: $foreign.mkFn6,
    mkFn7: $foreign.mkFn7,
    mkFn8: $foreign.mkFn8,
    mkFn9: $foreign.mkFn9,
    mkFn10: $foreign.mkFn10,
    runFn0: $foreign.runFn0,
    runFn2: $foreign.runFn2,
    runFn3: $foreign.runFn3,
    runFn4: $foreign.runFn4,
    runFn5: $foreign.runFn5,
    runFn6: $foreign.runFn6,
    runFn7: $foreign.runFn7,
    runFn8: $foreign.runFn8,
    runFn9: $foreign.runFn9,
    runFn10: $foreign.runFn10
};

},{"./foreign.js":73}],75:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Boolean = require("../Data.Boolean/index.js");
var on = function (f) {
    return function (g) {
        return function (x) {
            return function (y) {
                return f(g(x))(g(y));
            };
        };
    };
};
var flip = function (f) {
    return function (b) {
        return function (a) {
            return f(a)(b);
        };
    };
};
var $$const = function (a) {
    return function (v) {
        return a;
    };
};
var applyN = function (f) {
    var go = function ($copy_n) {
        return function ($copy_acc) {
            var $tco_var_n = $copy_n;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(n, acc) {
                if (n <= 0) {
                    $tco_done = true;
                    return acc;
                };
                if (Data_Boolean.otherwise) {
                    $tco_var_n = n - 1 | 0;
                    $copy_acc = f(acc);
                    return;
                };
                throw new Error("Failed pattern match at Data.Function (line 94, column 3 - line 96, column 37): " + [ n.constructor.name, acc.constructor.name ]);
            };
            while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_n, $copy_acc);
            };
            return $tco_result;
        };
    };
    return go;
};
var applyFlipped = function (x) {
    return function (f) {
        return f(x);
    };
};
var apply = function (f) {
    return function (x) {
        return f(x);
    };
};
module.exports = {
    flip: flip,
    "const": $$const,
    apply: apply,
    applyFlipped: applyFlipped,
    applyN: applyN,
    on: on
};

},{"../Data.Boolean/index.js":58}],76:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var App = function (x) {
    return x;
};
var traversableWithIndexApp = function (dictTraversableWithIndex) {
    return dictTraversableWithIndex;
};
var traversableApp = function (dictTraversable) {
    return dictTraversable;
};
var showApp = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(App " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupApp = function (dictApply) {
    return function (dictSemigroup) {
        return new Data_Semigroup.Semigroup(function (v) {
            return function (v1) {
                return Control_Apply.lift2(dictApply)(Data_Semigroup.append(dictSemigroup))(v)(v1);
            };
        });
    };
};
var plusApp = function (dictPlus) {
    return dictPlus;
};
var newtypeApp = new Data_Newtype.Newtype(function (n) {
    return n;
}, App);
var monoidApp = function (dictApplicative) {
    return function (dictMonoid) {
        return new Data_Monoid.Monoid(function () {
            return semigroupApp(dictApplicative.Apply0())(dictMonoid.Semigroup0());
        }, Control_Applicative.pure(dictApplicative)(Data_Monoid.mempty(dictMonoid)));
    };
};
var monadZeroApp = function (dictMonadZero) {
    return dictMonadZero;
};
var monadPlusApp = function (dictMonadPlus) {
    return dictMonadPlus;
};
var monadApp = function (dictMonad) {
    return dictMonad;
};
var lazyApp = function (dictLazy) {
    return dictLazy;
};
var hoistLowerApp = Unsafe_Coerce.unsafeCoerce;
var hoistLiftApp = Unsafe_Coerce.unsafeCoerce;
var hoistApp = function (f) {
    return function (v) {
        return f(v);
    };
};
var functorWithIndexApp = function (dictFunctorWithIndex) {
    return dictFunctorWithIndex;
};
var functorApp = function (dictFunctor) {
    return dictFunctor;
};
var foldableWithIndexApp = function (dictFoldableWithIndex) {
    return dictFoldableWithIndex;
};
var foldableApp = function (dictFoldable) {
    return dictFoldable;
};
var extendApp = function (dictExtend) {
    return dictExtend;
};
var eqApp = function (dictEq1) {
    return function (dictEq) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                return Data_Eq.eq1(dictEq1)(dictEq)(x)(y);
            };
        });
    };
};
var ordApp = function (dictOrd1) {
    return function (dictOrd) {
        return new Data_Ord.Ord(function () {
            return eqApp(dictOrd1.Eq10())(dictOrd.Eq0());
        }, function (x) {
            return function (y) {
                return Data_Ord.compare1(dictOrd1)(dictOrd)(x)(y);
            };
        });
    };
};
var eq1App = function (dictEq1) {
    return new Data_Eq.Eq1(function (dictEq) {
        return Data_Eq.eq(eqApp(dictEq1)(dictEq));
    });
};
var ord1App = function (dictOrd1) {
    return new Data_Ord.Ord1(function () {
        return eq1App(dictOrd1.Eq10());
    }, function (dictOrd) {
        return Data_Ord.compare(ordApp(dictOrd1)(dictOrd));
    });
};
var comonadApp = function (dictComonad) {
    return dictComonad;
};
var bindApp = function (dictBind) {
    return dictBind;
};
var applyApp = function (dictApply) {
    return dictApply;
};
var applicativeApp = function (dictApplicative) {
    return dictApplicative;
};
var alternativeApp = function (dictAlternative) {
    return dictAlternative;
};
var altApp = function (dictAlt) {
    return dictAlt;
};
module.exports = {
    App: App,
    hoistApp: hoistApp,
    hoistLiftApp: hoistLiftApp,
    hoistLowerApp: hoistLowerApp,
    newtypeApp: newtypeApp,
    eqApp: eqApp,
    eq1App: eq1App,
    ordApp: ordApp,
    ord1App: ord1App,
    showApp: showApp,
    semigroupApp: semigroupApp,
    monoidApp: monoidApp,
    functorApp: functorApp,
    functorWithIndexApp: functorWithIndexApp,
    applyApp: applyApp,
    applicativeApp: applicativeApp,
    bindApp: bindApp,
    monadApp: monadApp,
    altApp: altApp,
    plusApp: plusApp,
    alternativeApp: alternativeApp,
    monadZeroApp: monadZeroApp,
    monadPlusApp: monadPlusApp,
    lazyApp: lazyApp,
    foldableApp: foldableApp,
    traversableApp: traversableApp,
    foldableWithIndexApp: foldableWithIndexApp,
    traversableWithIndexApp: traversableWithIndexApp,
    extendApp: extendApp,
    comonadApp: comonadApp
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Data.Eq/index.js":67,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117,"../Unsafe.Coerce/index.js":172}],77:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_App = require("../Data.Functor.App/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Show = require("../Data.Show/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_TraversableWithIndex = require("../Data.TraversableWithIndex/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Compose = function (x) {
    return x;
};
var showCompose = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Compose " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var newtypeCompose = new Data_Newtype.Newtype(function (n) {
    return n;
}, Compose);
var functorCompose = function (dictFunctor) {
    return function (dictFunctor1) {
        return new Data_Functor.Functor(function (f) {
            return function (v) {
                return Compose(Data_Functor.map(dictFunctor)(Data_Functor.map(dictFunctor1)(f))(v));
            };
        });
    };
};
var functorWithIndexCompose = function (dictFunctorWithIndex) {
    return function (dictFunctorWithIndex1) {
        return new Data_FunctorWithIndex.FunctorWithIndex(function () {
            return functorCompose(dictFunctorWithIndex.Functor0())(dictFunctorWithIndex1.Functor0());
        }, function (f) {
            return function (v) {
                return Compose(Data_FunctorWithIndex.mapWithIndex(dictFunctorWithIndex)((function () {
                    var $100 = Data_FunctorWithIndex.mapWithIndex(dictFunctorWithIndex1);
                    var $101 = Data_Tuple.curry(f);
                    return function ($102) {
                        return $100($101($102));
                    };
                })())(v));
            };
        });
    };
};
var foldableCompose = function (dictFoldable) {
    return function (dictFoldable1) {
        return new Data_Foldable.Foldable(function (dictMonoid) {
            return function (f) {
                return function (v) {
                    return Data_Foldable.foldMap(dictFoldable)(dictMonoid)(Data_Foldable.foldMap(dictFoldable1)(dictMonoid)(f))(v);
                };
            };
        }, function (f) {
            return function (i) {
                return function (v) {
                    return Data_Foldable.foldl(dictFoldable)(Data_Foldable.foldl(dictFoldable1)(f))(i)(v);
                };
            };
        }, function (f) {
            return function (i) {
                return function (v) {
                    return Data_Foldable.foldr(dictFoldable)(Data_Function.flip(Data_Foldable.foldr(dictFoldable1)(f)))(i)(v);
                };
            };
        });
    };
};
var foldableWithIndexCompose = function (dictFoldableWithIndex) {
    return function (dictFoldableWithIndex1) {
        return new Data_FoldableWithIndex.FoldableWithIndex(function () {
            return foldableCompose(dictFoldableWithIndex.Foldable0())(dictFoldableWithIndex1.Foldable0());
        }, function (dictMonoid) {
            return function (f) {
                return function (v) {
                    return Data_FoldableWithIndex.foldMapWithIndex(dictFoldableWithIndex)(dictMonoid)((function () {
                        var $103 = Data_FoldableWithIndex.foldMapWithIndex(dictFoldableWithIndex1)(dictMonoid);
                        var $104 = Data_Tuple.curry(f);
                        return function ($105) {
                            return $103($104($105));
                        };
                    })())(v);
                };
            };
        }, function (f) {
            return function (i) {
                return function (v) {
                    return Data_FoldableWithIndex.foldlWithIndex(dictFoldableWithIndex)((function () {
                        var $106 = Data_FoldableWithIndex.foldlWithIndex(dictFoldableWithIndex1);
                        var $107 = Data_Tuple.curry(f);
                        return function ($108) {
                            return $106($107($108));
                        };
                    })())(i)(v);
                };
            };
        }, function (f) {
            return function (i) {
                return function (v) {
                    return Data_FoldableWithIndex.foldrWithIndex(dictFoldableWithIndex)(function (a) {
                        return Data_Function.flip(Data_FoldableWithIndex.foldrWithIndex(dictFoldableWithIndex1)(Data_Tuple.curry(f)(a)));
                    })(i)(v);
                };
            };
        });
    };
};
var traversableCompose = function (dictTraversable) {
    return function (dictTraversable1) {
        return new Data_Traversable.Traversable(function () {
            return foldableCompose(dictTraversable.Foldable1())(dictTraversable1.Foldable1());
        }, function () {
            return functorCompose(dictTraversable.Functor0())(dictTraversable1.Functor0());
        }, function (dictApplicative) {
            return Data_Traversable.traverse(traversableCompose(dictTraversable)(dictTraversable1))(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
        }, function (dictApplicative) {
            return function (f) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Compose)(Data_Traversable.traverse(dictTraversable)(dictApplicative)(Data_Traversable.traverse(dictTraversable1)(dictApplicative)(f))(v));
                };
            };
        });
    };
};
var traversableWithIndexCompose = function (dictTraversableWithIndex) {
    return function (dictTraversableWithIndex1) {
        return new Data_TraversableWithIndex.TraversableWithIndex(function () {
            return foldableWithIndexCompose(dictTraversableWithIndex.FoldableWithIndex1())(dictTraversableWithIndex1.FoldableWithIndex1());
        }, function () {
            return functorWithIndexCompose(dictTraversableWithIndex.FunctorWithIndex0())(dictTraversableWithIndex1.FunctorWithIndex0());
        }, function () {
            return traversableCompose(dictTraversableWithIndex.Traversable2())(dictTraversableWithIndex1.Traversable2());
        }, function (dictApplicative) {
            return function (f) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Compose)(Data_TraversableWithIndex.traverseWithIndex(dictTraversableWithIndex)(dictApplicative)((function () {
                        var $109 = Data_TraversableWithIndex.traverseWithIndex(dictTraversableWithIndex1)(dictApplicative);
                        var $110 = Data_Tuple.curry(f);
                        return function ($111) {
                            return $109($110($111));
                        };
                    })())(v));
                };
            };
        });
    };
};
var eqCompose = function (dictEq1) {
    return function (dictEq11) {
        return function (dictEq) {
            return new Data_Eq.Eq(function (v) {
                return function (v1) {
                    return Data_Eq.eq1(dictEq1)(Data_Functor_App.eqApp(dictEq11)(dictEq))(Data_Functor_App.hoistLiftApp(v))(Data_Functor_App.hoistLiftApp(v1));
                };
            });
        };
    };
};
var ordCompose = function (dictOrd1) {
    return function (dictOrd11) {
        return function (dictOrd) {
            return new Data_Ord.Ord(function () {
                return eqCompose(dictOrd1.Eq10())(dictOrd11.Eq10())(dictOrd.Eq0());
            }, function (v) {
                return function (v1) {
                    return Data_Ord.compare1(dictOrd1)(Data_Functor_App.ordApp(dictOrd11)(dictOrd))(Data_Functor_App.hoistLiftApp(v))(Data_Functor_App.hoistLiftApp(v1));
                };
            });
        };
    };
};
var eq1Compose = function (dictEq1) {
    return function (dictEq11) {
        return new Data_Eq.Eq1(function (dictEq) {
            return Data_Eq.eq(eqCompose(dictEq1)(dictEq11)(dictEq));
        });
    };
};
var ord1Compose = function (dictOrd1) {
    return function (dictOrd11) {
        return new Data_Ord.Ord1(function () {
            return eq1Compose(dictOrd1.Eq10())(dictOrd11.Eq10());
        }, function (dictOrd) {
            return Data_Ord.compare(ordCompose(dictOrd1)(dictOrd11)(dictOrd));
        });
    };
};
var bihoistCompose = function (dictFunctor) {
    return function (natF) {
        return function (natG) {
            return function (v) {
                return natF(Data_Functor.map(dictFunctor)(natG)(v));
            };
        };
    };
};
var applyCompose = function (dictApply) {
    return function (dictApply1) {
        return new Control_Apply.Apply(function () {
            return functorCompose(dictApply.Functor0())(dictApply1.Functor0());
        }, function (v) {
            return function (v1) {
                return Compose(Control_Apply.apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Control_Apply.apply(dictApply1))(v))(v1));
            };
        });
    };
};
var applicativeCompose = function (dictApplicative) {
    return function (dictApplicative1) {
        return new Control_Applicative.Applicative(function () {
            return applyCompose(dictApplicative.Apply0())(dictApplicative1.Apply0());
        }, (function () {
            var $112 = Control_Applicative.pure(dictApplicative);
            var $113 = Control_Applicative.pure(dictApplicative1);
            return function ($114) {
                return Compose($112($113($114)));
            };
        })());
    };
};
var altCompose = function (dictAlt) {
    return function (dictFunctor) {
        return new Control_Alt.Alt(function () {
            return functorCompose(dictAlt.Functor0())(dictFunctor);
        }, function (v) {
            return function (v1) {
                return Compose(Control_Alt.alt(dictAlt)(v)(v1));
            };
        });
    };
};
var plusCompose = function (dictPlus) {
    return function (dictFunctor) {
        return new Control_Plus.Plus(function () {
            return altCompose(dictPlus.Alt0())(dictFunctor);
        }, Control_Plus.empty(dictPlus));
    };
};
var alternativeCompose = function (dictAlternative) {
    return function (dictApplicative) {
        return new Control_Alternative.Alternative(function () {
            return applicativeCompose(dictAlternative.Applicative0())(dictApplicative);
        }, function () {
            return plusCompose(dictAlternative.Plus1())((dictApplicative.Apply0()).Functor0());
        });
    };
};
module.exports = {
    Compose: Compose,
    bihoistCompose: bihoistCompose,
    newtypeCompose: newtypeCompose,
    eqCompose: eqCompose,
    eq1Compose: eq1Compose,
    ordCompose: ordCompose,
    ord1Compose: ord1Compose,
    showCompose: showCompose,
    functorCompose: functorCompose,
    functorWithIndexCompose: functorWithIndexCompose,
    applyCompose: applyCompose,
    applicativeCompose: applicativeCompose,
    foldableCompose: foldableCompose,
    foldableWithIndexCompose: foldableWithIndexCompose,
    traversableCompose: traversableCompose,
    traversableWithIndexCompose: traversableWithIndexCompose,
    altCompose: altCompose,
    plusCompose: plusCompose,
    alternativeCompose: alternativeCompose
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Control.Plus/index.js":38,"../Data.Eq/index.js":67,"../Data.Foldable/index.js":71,"../Data.FoldableWithIndex/index.js":72,"../Data.Function/index.js":75,"../Data.Functor.App/index.js":76,"../Data.Functor/index.js":80,"../Data.FunctorWithIndex/index.js":82,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Show/index.js":117,"../Data.Traversable/index.js":122,"../Data.TraversableWithIndex/index.js":123,"../Data.Tuple/index.js":124}],78:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Functor = require("../Data.Functor/index.js");
var Invariant = function (imap) {
    this.imap = imap;
};
var invariantMultiplicative = new Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var invariantEndo = new Invariant(function (ab) {
    return function (ba) {
        return function (v) {
            return function ($31) {
                return ab(v(ba($31)));
            };
        };
    };
});
var invariantDual = new Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var invariantDisj = new Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var invariantConj = new Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var invariantAdditive = new Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var imapF = function (dictFunctor) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictFunctor)(f);
        };
    };
};
var invariantArray = new Invariant(imapF(Data_Functor.functorArray));
var invariantFn = new Invariant(imapF(Data_Functor.functorFn));
var imap = function (dict) {
    return dict.imap;
};
module.exports = {
    imap: imap,
    Invariant: Invariant,
    imapF: imapF,
    invariantFn: invariantFn,
    invariantArray: invariantArray,
    invariantAdditive: invariantAdditive,
    invariantConj: invariantConj,
    invariantDisj: invariantDisj,
    invariantDual: invariantDual,
    invariantEndo: invariantEndo,
    invariantMultiplicative: invariantMultiplicative
};

},{"../Data.Functor/index.js":80}],79:[function(require,module,exports){
"use strict";

exports.arrayMap = function (f) {
  return function (arr) {
    var l = arr.length;
    var result = new Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(arr[i]);
    }
    return result;
  };
};

},{}],80:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Functor = function (map) {
    this.map = map;
};
var map = function (dict) {
    return dict.map;
};
var mapFlipped = function (dictFunctor) {
    return function (fa) {
        return function (f) {
            return map(dictFunctor)(f)(fa);
        };
    };
};
var $$void = function (dictFunctor) {
    return map(dictFunctor)(Data_Function["const"](Data_Unit.unit));
};
var voidLeft = function (dictFunctor) {
    return function (f) {
        return function (x) {
            return map(dictFunctor)(Data_Function["const"](x))(f);
        };
    };
};
var voidRight = function (dictFunctor) {
    return function (x) {
        return map(dictFunctor)(Data_Function["const"](x));
    };
};
var functorFn = new Functor(Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn));
var functorArray = new Functor($foreign.arrayMap);
var flap = function (dictFunctor) {
    return function (ff) {
        return function (x) {
            return map(dictFunctor)(function (f) {
                return f(x);
            })(ff);
        };
    };
};
module.exports = {
    Functor: Functor,
    map: map,
    mapFlipped: mapFlipped,
    "void": $$void,
    voidRight: voidRight,
    voidLeft: voidLeft,
    flap: flap,
    functorFn: functorFn,
    functorArray: functorArray
};

},{"../Control.Semigroupoid/index.js":39,"../Data.Function/index.js":75,"../Data.Unit/index.js":132,"./foreign.js":79}],81:[function(require,module,exports){
"use strict";

exports.mapWithIndexArray = function (f) {
  return function (xs) {
    var l = xs.length;
    var result = Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(i)(xs[i]);
    }
    return result;
  };
};

},{}],82:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Maybe_First = require("../Data.Maybe.First/index.js");
var Data_Maybe_Last = require("../Data.Maybe.Last/index.js");
var Data_Monoid_Additive = require("../Data.Monoid.Additive/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var FunctorWithIndex = function (Functor0, mapWithIndex) {
    this.Functor0 = Functor0;
    this.mapWithIndex = mapWithIndex;
};
var mapWithIndex = function (dict) {
    return dict.mapWithIndex;
};
var mapDefault = function (dictFunctorWithIndex) {
    return function (f) {
        return mapWithIndex(dictFunctorWithIndex)(Data_Function["const"](f));
    };
};
var functorWithIndexMultiplicative = new FunctorWithIndex(function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Multiplicative.functorMultiplicative)(f(Data_Unit.unit));
});
var functorWithIndexMaybe = new FunctorWithIndex(function () {
    return Data_Maybe.functorMaybe;
}, function (f) {
    return Data_Functor.map(Data_Maybe.functorMaybe)(f(Data_Unit.unit));
});
var functorWithIndexLast = new FunctorWithIndex(function () {
    return Data_Maybe_Last.functorLast;
}, function (f) {
    return Data_Functor.map(Data_Maybe_Last.functorLast)(f(Data_Unit.unit));
});
var functorWithIndexFirst = new FunctorWithIndex(function () {
    return Data_Maybe_First.functorFirst;
}, function (f) {
    return Data_Functor.map(Data_Maybe_First.functorFirst)(f(Data_Unit.unit));
});
var functorWithIndexDual = new FunctorWithIndex(function () {
    return Data_Monoid_Dual.functorDual;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Dual.functorDual)(f(Data_Unit.unit));
});
var functorWithIndexDisj = new FunctorWithIndex(function () {
    return Data_Monoid_Disj.functorDisj;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Disj.functorDisj)(f(Data_Unit.unit));
});
var functorWithIndexConj = new FunctorWithIndex(function () {
    return Data_Monoid_Conj.functorConj;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Conj.functorConj)(f(Data_Unit.unit));
});
var functorWithIndexArray = new FunctorWithIndex(function () {
    return Data_Functor.functorArray;
}, $foreign.mapWithIndexArray);
var functorWithIndexAdditive = new FunctorWithIndex(function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Additive.functorAdditive)(f(Data_Unit.unit));
});
module.exports = {
    FunctorWithIndex: FunctorWithIndex,
    mapWithIndex: mapWithIndex,
    mapDefault: mapDefault,
    functorWithIndexArray: functorWithIndexArray,
    functorWithIndexMaybe: functorWithIndexMaybe,
    functorWithIndexFirst: functorWithIndexFirst,
    functorWithIndexLast: functorWithIndexLast,
    functorWithIndexAdditive: functorWithIndexAdditive,
    functorWithIndexDual: functorWithIndexDual,
    functorWithIndexConj: functorWithIndexConj,
    functorWithIndexDisj: functorWithIndexDisj,
    functorWithIndexMultiplicative: functorWithIndexMultiplicative
};

},{"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe.First/index.js":88,"../Data.Maybe.Last/index.js":89,"../Data.Maybe/index.js":90,"../Data.Monoid.Additive/index.js":91,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Multiplicative/index.js":96,"../Data.Unit/index.js":132,"./foreign.js":81}],83:[function(require,module,exports){
"use strict";

exports.boolConj = function (b1) {
  return function (b2) {
    return b1 && b2;
  };
};

exports.boolDisj = function (b1) {
  return function (b2) {
    return b1 || b2;
  };
};

exports.boolNot = function (b) {
  return !b;
};

},{}],84:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_Row = require("../Type.Data.Row/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var HeytingAlgebraRecord = function (conjRecord, disjRecord, ffRecord, impliesRecord, notRecord, ttRecord) {
    this.conjRecord = conjRecord;
    this.disjRecord = disjRecord;
    this.ffRecord = ffRecord;
    this.impliesRecord = impliesRecord;
    this.notRecord = notRecord;
    this.ttRecord = ttRecord;
};
var HeytingAlgebra = function (conj, disj, ff, implies, not, tt) {
    this.conj = conj;
    this.disj = disj;
    this.ff = ff;
    this.implies = implies;
    this.not = not;
    this.tt = tt;
};
var ttRecord = function (dict) {
    return dict.ttRecord;
};
var tt = function (dict) {
    return dict.tt;
};
var notRecord = function (dict) {
    return dict.notRecord;
};
var not = function (dict) {
    return dict.not;
};
var impliesRecord = function (dict) {
    return dict.impliesRecord;
};
var implies = function (dict) {
    return dict.implies;
};
var heytingAlgebraUnit = new HeytingAlgebra(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, Data_Unit.unit, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return Data_Unit.unit;
}, Data_Unit.unit);
var heytingAlgebraRecordNil = new HeytingAlgebraRecord(function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
}, function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
}, function (v) {
    return function (v1) {
        return {};
    };
}, function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
}, function (v) {
    return function (v1) {
        return {};
    };
}, function (v) {
    return function (v1) {
        return {};
    };
});
var ffRecord = function (dict) {
    return dict.ffRecord;
};
var ff = function (dict) {
    return dict.ff;
};
var disjRecord = function (dict) {
    return dict.disjRecord;
};
var disj = function (dict) {
    return dict.disj;
};
var heytingAlgebraBoolean = new HeytingAlgebra($foreign.boolConj, $foreign.boolDisj, false, function (a) {
    return function (b) {
        return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
    };
}, $foreign.boolNot, true);
var conjRecord = function (dict) {
    return dict.conjRecord;
};
var heytingAlgebraRecord = function (dictRowToList) {
    return function (dictHeytingAlgebraRecord) {
        return new HeytingAlgebra(conjRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value), disjRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value), ffRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value), impliesRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value), notRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value), ttRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value));
    };
};
var conj = function (dict) {
    return dict.conj;
};
var heytingAlgebraFunction = function (dictHeytingAlgebra) {
    return new HeytingAlgebra(function (f) {
        return function (g) {
            return function (a) {
                return conj(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (f) {
        return function (g) {
            return function (a) {
                return disj(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (v) {
        return ff(dictHeytingAlgebra);
    }, function (f) {
        return function (g) {
            return function (a) {
                return implies(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (f) {
        return function (a) {
            return not(dictHeytingAlgebra)(f(a));
        };
    }, function (v) {
        return tt(dictHeytingAlgebra);
    });
};
var heytingAlgebraRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictHeytingAlgebraRecord) {
            return function (dictHeytingAlgebra) {
                return new HeytingAlgebraRecord(function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = conjRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(conj(dictHeytingAlgebra)(get(ra))(get(rb)))(tail);
                        };
                    };
                }, function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = disjRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(disj(dictHeytingAlgebra)(get(ra))(get(rb)))(tail);
                        };
                    };
                }, function (v) {
                    return function (row) {
                        var tail = ffRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(row);
                        var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                        var insert = Record_Unsafe.unsafeSet(key);
                        return insert(ff(dictHeytingAlgebra))(tail);
                    };
                }, function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = impliesRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(implies(dictHeytingAlgebra)(get(ra))(get(rb)))(tail);
                        };
                    };
                }, function (v) {
                    return function (row) {
                        var tail = notRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(row);
                        var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                        var insert = Record_Unsafe.unsafeSet(key);
                        var get = Record_Unsafe.unsafeGet(key);
                        return insert(not(dictHeytingAlgebra)(get(row)))(tail);
                    };
                }, function (v) {
                    return function (row) {
                        var tail = ttRecord(dictHeytingAlgebraRecord)(Type_Data_RowList.RLProxy.value)(row);
                        var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                        var insert = Record_Unsafe.unsafeSet(key);
                        return insert(tt(dictHeytingAlgebra))(tail);
                    };
                });
            };
        };
    };
};
module.exports = {
    HeytingAlgebra: HeytingAlgebra,
    tt: tt,
    ff: ff,
    implies: implies,
    conj: conj,
    disj: disj,
    not: not,
    HeytingAlgebraRecord: HeytingAlgebraRecord,
    ffRecord: ffRecord,
    ttRecord: ttRecord,
    impliesRecord: impliesRecord,
    conjRecord: conjRecord,
    disjRecord: disjRecord,
    notRecord: notRecord,
    heytingAlgebraBoolean: heytingAlgebraBoolean,
    heytingAlgebraUnit: heytingAlgebraUnit,
    heytingAlgebraFunction: heytingAlgebraFunction,
    heytingAlgebraRecord: heytingAlgebraRecord,
    heytingAlgebraRecordNil: heytingAlgebraRecordNil,
    heytingAlgebraRecordCons: heytingAlgebraRecordCons
};

},{"../Data.Symbol/index.js":119,"../Data.Unit/index.js":132,"../Record.Unsafe/index.js":164,"../Type.Data.Row/index.js":167,"../Type.Data.RowList/index.js":168,"./foreign.js":83}],85:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Comonad = require("../Control.Comonad/index.js");
var Control_Extend = require("../Control.Extend/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_Invariant = require("../Data.Functor.Invariant/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup_Foldable = require("../Data.Semigroup.Foldable/index.js");
var Data_Semigroup_Traversable = require("../Data.Semigroup.Traversable/index.js");
var Data_Show = require("../Data.Show/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_TraversableWithIndex = require("../Data.TraversableWithIndex/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Identity = function (x) {
    return x;
};
var showIdentity = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Identity " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringIdentity = function (dictSemiring) {
    return dictSemiring;
};
var semigroupIdenity = function (dictSemigroup) {
    return dictSemigroup;
};
var ringIdentity = function (dictRing) {
    return dictRing;
};
var ordIdentity = function (dictOrd) {
    return dictOrd;
};
var newtypeIdentity = new Data_Newtype.Newtype(function (n) {
    return n;
}, Identity);
var monoidIdentity = function (dictMonoid) {
    return dictMonoid;
};
var lazyIdentity = function (dictLazy) {
    return dictLazy;
};
var heytingAlgebraIdentity = function (dictHeytingAlgebra) {
    return dictHeytingAlgebra;
};
var functorIdentity = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var functorWithIndexIdentity = new Data_FunctorWithIndex.FunctorWithIndex(function () {
    return functorIdentity;
}, function (f) {
    return function (v) {
        return f(Data_Unit.unit)(v);
    };
});
var invariantIdentity = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorIdentity));
var foldableIdentity = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableWithIndexIdentity = new Data_FoldableWithIndex.FoldableWithIndex(function () {
    return foldableIdentity;
}, function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(Data_Unit.unit)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(Data_Unit.unit)(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(Data_Unit.unit)(v)(z);
        };
    };
});
var traversableIdentity = new Data_Traversable.Traversable(function () {
    return foldableIdentity;
}, function () {
    return functorIdentity;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Identity)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Identity)(f(v));
        };
    };
});
var traversableWithIndexIdentity = new Data_TraversableWithIndex.TraversableWithIndex(function () {
    return foldableWithIndexIdentity;
}, function () {
    return functorWithIndexIdentity;
}, function () {
    return traversableIdentity;
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Identity)(f(Data_Unit.unit)(v));
        };
    };
});
var foldable1Identity = new Data_Semigroup_Foldable.Foldable1(function () {
    return foldableIdentity;
}, function (dictSemigroup) {
    return function (v) {
        return v;
    };
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
});
var traversable1Identity = new Data_Semigroup_Traversable.Traversable1(function () {
    return foldable1Identity;
}, function () {
    return traversableIdentity;
}, function (dictApply) {
    return function (v) {
        return Data_Functor.map(dictApply.Functor0())(Identity)(v);
    };
}, function (dictApply) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictApply.Functor0())(Identity)(f(v));
        };
    };
});
var extendIdentity = new Control_Extend.Extend(function () {
    return functorIdentity;
}, function (f) {
    return function (m) {
        return f(m);
    };
});
var euclideanRingIdentity = function (dictEuclideanRing) {
    return dictEuclideanRing;
};
var eqIdentity = function (dictEq) {
    return dictEq;
};
var eq1Identity = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqIdentity(dictEq));
});
var ord1Identity = new Data_Ord.Ord1(function () {
    return eq1Identity;
}, function (dictOrd) {
    return Data_Ord.compare(ordIdentity(dictOrd));
});
var comonadIdentity = new Control_Comonad.Comonad(function () {
    return extendIdentity;
}, function (v) {
    return v;
});
var commutativeRingIdentity = function (dictCommutativeRing) {
    return dictCommutativeRing;
};
var boundedIdentity = function (dictBounded) {
    return dictBounded;
};
var booleanAlgebraIdentity = function (dictBooleanAlgebra) {
    return dictBooleanAlgebra;
};
var applyIdentity = new Control_Apply.Apply(function () {
    return functorIdentity;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindIdentity = new Control_Bind.Bind(function () {
    return applyIdentity;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeIdentity = new Control_Applicative.Applicative(function () {
    return applyIdentity;
}, Identity);
var monadIdentity = new Control_Monad.Monad(function () {
    return applicativeIdentity;
}, function () {
    return bindIdentity;
});
var altIdentity = new Control_Alt.Alt(function () {
    return functorIdentity;
}, function (x) {
    return function (v) {
        return x;
    };
});
module.exports = {
    Identity: Identity,
    newtypeIdentity: newtypeIdentity,
    eqIdentity: eqIdentity,
    ordIdentity: ordIdentity,
    boundedIdentity: boundedIdentity,
    heytingAlgebraIdentity: heytingAlgebraIdentity,
    booleanAlgebraIdentity: booleanAlgebraIdentity,
    semigroupIdenity: semigroupIdenity,
    monoidIdentity: monoidIdentity,
    semiringIdentity: semiringIdentity,
    euclideanRingIdentity: euclideanRingIdentity,
    ringIdentity: ringIdentity,
    commutativeRingIdentity: commutativeRingIdentity,
    lazyIdentity: lazyIdentity,
    showIdentity: showIdentity,
    eq1Identity: eq1Identity,
    ord1Identity: ord1Identity,
    functorIdentity: functorIdentity,
    functorWithIndexIdentity: functorWithIndexIdentity,
    invariantIdentity: invariantIdentity,
    altIdentity: altIdentity,
    applyIdentity: applyIdentity,
    applicativeIdentity: applicativeIdentity,
    bindIdentity: bindIdentity,
    monadIdentity: monadIdentity,
    extendIdentity: extendIdentity,
    comonadIdentity: comonadIdentity,
    foldableIdentity: foldableIdentity,
    foldable1Identity: foldable1Identity,
    foldableWithIndexIdentity: foldableWithIndexIdentity,
    traversableIdentity: traversableIdentity,
    traversable1Identity: traversable1Identity,
    traversableWithIndexIdentity: traversableWithIndexIdentity
};

},{"../Control.Alt/index.js":5,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Comonad/index.js":15,"../Control.Extend/index.js":17,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Foldable/index.js":71,"../Data.FoldableWithIndex/index.js":72,"../Data.Functor.Invariant/index.js":78,"../Data.Functor/index.js":80,"../Data.FunctorWithIndex/index.js":82,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Semigroup.Foldable/index.js":109,"../Data.Semigroup.Traversable/index.js":111,"../Data.Show/index.js":117,"../Data.Traversable/index.js":122,"../Data.TraversableWithIndex/index.js":123,"../Data.Unit/index.js":132}],86:[function(require,module,exports){
"use strict";

exports.fromNumberImpl = function (just) {
  return function (nothing) {
    return function (n) {
      /* jshint bitwise: false */
      return (n | 0) === n ? just(n) : nothing;
    };
  };
};

exports.toNumber = function (n) {
  return n;
};

exports.fromStringAsImpl = function (just) {
  return function (nothing) {
    return function (radix) {
      var digits;
      if (radix < 11) {
        digits = "[0-" + (radix - 1).toString() + "]";
      } else if (radix === 11) {
        digits = "[0-9a]";
      } else {
        digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
      }
      var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");

      return function (s) {
        /* jshint bitwise: false */
        if (pattern.test(s)) {
          var i = parseInt(s, radix);
          return (i | 0) === i ? just(i) : nothing;
        } else {
          return nothing;
        }
      };
    };
  };
};

exports.toStringAs = function (radix) {
  return function (i) {
    return i.toString(radix);
  };
};


exports.quot = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x / y | 0;
  };
};

exports.rem = function (x) {
  return function (y) {
    return x % y;
  };
};

exports.pow = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return Math.pow(x,y) | 0;
  };
};

},{}],87:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Boolean = require("../Data.Boolean/index.js");
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_CommutativeRing = require("../Data.CommutativeRing/index.js");
var Data_DivisionRing = require("../Data.DivisionRing/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_EuclideanRing = require("../Data.EuclideanRing/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Global = require("../Global/index.js");
var $$Math = require("../Math/index.js");
var Radix = function (x) {
    return x;
};
var Even = (function () {
    function Even() {

    };
    Even.value = new Even();
    return Even;
})();
var Odd = (function () {
    function Odd() {

    };
    Odd.value = new Odd();
    return Odd;
})();
var showParity = new Data_Show.Show(function (v) {
    if (v instanceof Even) {
        return "Even";
    };
    if (v instanceof Odd) {
        return "Odd";
    };
    throw new Error("Failed pattern match at Data.Int (line 112, column 1 - line 114, column 19): " + [ v.constructor.name ]);
});
var radix = function (n) {
    if (n >= 2 && n <= 36) {
        return new Data_Maybe.Just(n);
    };
    if (Data_Boolean.otherwise) {
        return Data_Maybe.Nothing.value;
    };
    throw new Error("Failed pattern match at Data.Int (line 193, column 1 - line 193, column 28): " + [ n.constructor.name ]);
};
var odd = function (x) {
    return (x & 1) !== 0;
};
var octal = 8;
var hexadecimal = 16;
var fromStringAs = $foreign.fromStringAsImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var fromString = fromStringAs(10);
var fromNumber = $foreign.fromNumberImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var unsafeClamp = function (x) {
    if (x === Global.infinity) {
        return 0;
    };
    if (x === -Global.infinity) {
        return 0;
    };
    if (x >= $foreign.toNumber(Data_Bounded.top(Data_Bounded.boundedInt))) {
        return Data_Bounded.top(Data_Bounded.boundedInt);
    };
    if (x <= $foreign.toNumber(Data_Bounded.bottom(Data_Bounded.boundedInt))) {
        return Data_Bounded.bottom(Data_Bounded.boundedInt);
    };
    if (Data_Boolean.otherwise) {
        return Data_Maybe.fromMaybe(0)(fromNumber(x));
    };
    throw new Error("Failed pattern match at Data.Int (line 66, column 1 - line 66, column 29): " + [ x.constructor.name ]);
};
var round = function ($23) {
    return unsafeClamp($$Math.round($23));
};
var floor = function ($24) {
    return unsafeClamp($$Math.floor($24));
};
var even = function (x) {
    return (x & 1) === 0;
};
var parity = function (n) {
    var $14 = even(n);
    if ($14) {
        return Even.value;
    };
    return Odd.value;
};
var eqParity = new Data_Eq.Eq(function (x) {
    return function (y) {
        if (x instanceof Even && y instanceof Even) {
            return true;
        };
        if (x instanceof Odd && y instanceof Odd) {
            return true;
        };
        return false;
    };
});
var ordParity = new Data_Ord.Ord(function () {
    return eqParity;
}, function (x) {
    return function (y) {
        if (x instanceof Even && y instanceof Even) {
            return Data_Ordering.EQ.value;
        };
        if (x instanceof Even) {
            return Data_Ordering.LT.value;
        };
        if (y instanceof Even) {
            return Data_Ordering.GT.value;
        };
        if (x instanceof Odd && y instanceof Odd) {
            return Data_Ordering.EQ.value;
        };
        throw new Error("Failed pattern match at Data.Int (line 110, column 1 - line 110, column 40): " + [ x.constructor.name, y.constructor.name ]);
    };
});
var semiringParity = new Data_Semiring.Semiring(function (x) {
    return function (y) {
        var $19 = Data_Eq.eq(eqParity)(x)(y);
        if ($19) {
            return Even.value;
        };
        return Odd.value;
    };
}, function (v) {
    return function (v1) {
        if (v instanceof Odd && v1 instanceof Odd) {
            return Odd.value;
        };
        return Even.value;
    };
}, Odd.value, Even.value);
var ringParity = new Data_Ring.Ring(function () {
    return semiringParity;
}, Data_Semiring.add(semiringParity));
var divisionRingParity = new Data_DivisionRing.DivisionRing(function () {
    return ringParity;
}, Control_Category.identity(Control_Category.categoryFn));
var decimal = 10;
var commutativeRingParity = new Data_CommutativeRing.CommutativeRing(function () {
    return ringParity;
});
var euclideanRingParity = new Data_EuclideanRing.EuclideanRing(function () {
    return commutativeRingParity;
}, function (v) {
    if (v instanceof Even) {
        return 0;
    };
    if (v instanceof Odd) {
        return 1;
    };
    throw new Error("Failed pattern match at Data.Int (line 132, column 1 - line 136, column 17): " + [ v.constructor.name ]);
}, function (x) {
    return function (v) {
        return x;
    };
}, function (v) {
    return function (v1) {
        return Even.value;
    };
});
var ceil = function ($25) {
    return unsafeClamp($$Math.ceil($25));
};
var boundedParity = new Data_Bounded.Bounded(function () {
    return ordParity;
}, Even.value, Odd.value);
var binary = 2;
var base36 = 36;
module.exports = {
    fromNumber: fromNumber,
    ceil: ceil,
    floor: floor,
    round: round,
    fromString: fromString,
    radix: radix,
    binary: binary,
    octal: octal,
    decimal: decimal,
    hexadecimal: hexadecimal,
    base36: base36,
    fromStringAs: fromStringAs,
    Even: Even,
    Odd: Odd,
    parity: parity,
    even: even,
    odd: odd,
    eqParity: eqParity,
    ordParity: ordParity,
    showParity: showParity,
    boundedParity: boundedParity,
    semiringParity: semiringParity,
    ringParity: ringParity,
    commutativeRingParity: commutativeRingParity,
    euclideanRingParity: euclideanRingParity,
    divisionRingParity: divisionRingParity,
    toNumber: $foreign.toNumber,
    toStringAs: $foreign.toStringAs,
    quot: $foreign.quot,
    rem: $foreign.rem,
    pow: $foreign.pow
};

},{"../Control.Category/index.js":14,"../Data.Boolean/index.js":58,"../Data.Bounded/index.js":61,"../Data.CommutativeRing/index.js":62,"../Data.DivisionRing/index.js":64,"../Data.Eq/index.js":67,"../Data.EuclideanRing/index.js":69,"../Data.Maybe/index.js":90,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Ring/index.js":107,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117,"../Global/index.js":154,"../Math/index.js":158,"./foreign.js":86}],88:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var First = function (x) {
    return x;
};
var showFirst = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "First (" + (Data_Show.show(Data_Maybe.showMaybe(dictShow))(v) + ")");
    });
};
var semigroupFirst = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v instanceof Data_Maybe.Just) {
            return v;
        };
        return v1;
    };
});
var ordFirst = function (dictOrd) {
    return Data_Maybe.ordMaybe(dictOrd);
};
var ord1First = Data_Maybe.ord1Maybe;
var newtypeFirst = new Data_Newtype.Newtype(function (n) {
    return n;
}, First);
var monoidFirst = new Data_Monoid.Monoid(function () {
    return semigroupFirst;
}, Data_Maybe.Nothing.value);
var monadFirst = Data_Maybe.monadMaybe;
var invariantFirst = Data_Maybe.invariantMaybe;
var functorFirst = Data_Maybe.functorMaybe;
var extendFirst = Data_Maybe.extendMaybe;
var eqFirst = function (dictEq) {
    return Data_Maybe.eqMaybe(dictEq);
};
var eq1First = Data_Maybe.eq1Maybe;
var boundedFirst = function (dictBounded) {
    return Data_Maybe.boundedMaybe(dictBounded);
};
var bindFirst = Data_Maybe.bindMaybe;
var applyFirst = Data_Maybe.applyMaybe;
var applicativeFirst = Data_Maybe.applicativeMaybe;
var altFirst = new Control_Alt.Alt(function () {
    return functorFirst;
}, Data_Semigroup.append(semigroupFirst));
var plusFirst = new Control_Plus.Plus(function () {
    return altFirst;
}, Data_Monoid.mempty(monoidFirst));
var alternativeFirst = new Control_Alternative.Alternative(function () {
    return applicativeFirst;
}, function () {
    return plusFirst;
});
var monadZeroFirst = new Control_MonadZero.MonadZero(function () {
    return alternativeFirst;
}, function () {
    return monadFirst;
});
module.exports = {
    First: First,
    newtypeFirst: newtypeFirst,
    eqFirst: eqFirst,
    eq1First: eq1First,
    ordFirst: ordFirst,
    ord1First: ord1First,
    boundedFirst: boundedFirst,
    functorFirst: functorFirst,
    invariantFirst: invariantFirst,
    applyFirst: applyFirst,
    applicativeFirst: applicativeFirst,
    bindFirst: bindFirst,
    monadFirst: monadFirst,
    extendFirst: extendFirst,
    showFirst: showFirst,
    semigroupFirst: semigroupFirst,
    monoidFirst: monoidFirst,
    altFirst: altFirst,
    plusFirst: plusFirst,
    alternativeFirst: alternativeFirst,
    monadZeroFirst: monadZeroFirst
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Maybe/index.js":90,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],89:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Last = function (x) {
    return x;
};
var showLast = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Last " + (Data_Show.show(Data_Maybe.showMaybe(dictShow))(v) + ")");
    });
};
var semigroupLast = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v1 instanceof Data_Maybe.Just) {
            return v1;
        };
        if (v1 instanceof Data_Maybe.Nothing) {
            return v;
        };
        throw new Error("Failed pattern match at Data.Maybe.Last (line 52, column 1 - line 54, column 36): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var ordLast = function (dictOrd) {
    return Data_Maybe.ordMaybe(dictOrd);
};
var ord1Last = Data_Maybe.ord1Maybe;
var newtypeLast = new Data_Newtype.Newtype(function (n) {
    return n;
}, Last);
var monoidLast = new Data_Monoid.Monoid(function () {
    return semigroupLast;
}, Data_Maybe.Nothing.value);
var monadLast = Data_Maybe.monadMaybe;
var invariantLast = Data_Maybe.invariantMaybe;
var functorLast = Data_Maybe.functorMaybe;
var extendLast = Data_Maybe.extendMaybe;
var eqLast = function (dictEq) {
    return Data_Maybe.eqMaybe(dictEq);
};
var eq1Last = Data_Maybe.eq1Maybe;
var boundedLast = function (dictBounded) {
    return Data_Maybe.boundedMaybe(dictBounded);
};
var bindLast = Data_Maybe.bindMaybe;
var applyLast = Data_Maybe.applyMaybe;
var applicativeLast = Data_Maybe.applicativeMaybe;
var altLast = new Control_Alt.Alt(function () {
    return functorLast;
}, Data_Semigroup.append(semigroupLast));
var plusLast = new Control_Plus.Plus(function () {
    return altLast;
}, Data_Monoid.mempty(monoidLast));
var alternativeLast = new Control_Alternative.Alternative(function () {
    return applicativeLast;
}, function () {
    return plusLast;
});
var monadZeroLast = new Control_MonadZero.MonadZero(function () {
    return alternativeLast;
}, function () {
    return monadLast;
});
module.exports = {
    Last: Last,
    newtypeLast: newtypeLast,
    eqLast: eqLast,
    eq1Last: eq1Last,
    ordLast: ordLast,
    ord1Last: ord1Last,
    boundedLast: boundedLast,
    functorLast: functorLast,
    invariantLast: invariantLast,
    applyLast: applyLast,
    applicativeLast: applicativeLast,
    bindLast: bindLast,
    monadLast: monadLast,
    extendLast: extendLast,
    showLast: showLast,
    semigroupLast: semigroupLast,
    monoidLast: monoidLast,
    altLast: altLast,
    plusLast: plusLast,
    alternativeLast: alternativeLast,
    monadZeroLast: monadZeroLast
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Maybe/index.js":90,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],90:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Category = require("../Control.Category/index.js");
var Control_Extend = require("../Control.Extend/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_MonadZero = require("../Control.MonadZero/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_Invariant = require("../Data.Functor.Invariant/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Nothing = (function () {
    function Nothing() {

    };
    Nothing.value = new Nothing();
    return Nothing;
})();
var Just = (function () {
    function Just(value0) {
        this.value0 = value0;
    };
    Just.create = function (value0) {
        return new Just(value0);
    };
    return Just;
})();
var showMaybe = function (dictShow) {
    return new Data_Show.Show(function (v) {
        if (v instanceof Just) {
            return "(Just " + (Data_Show.show(dictShow)(v.value0) + ")");
        };
        if (v instanceof Nothing) {
            return "Nothing";
        };
        throw new Error("Failed pattern match at Data.Maybe (line 205, column 1 - line 207, column 28): " + [ v.constructor.name ]);
    });
};
var semigroupMaybe = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            if (v instanceof Nothing) {
                return v1;
            };
            if (v1 instanceof Nothing) {
                return v;
            };
            if (v instanceof Just && v1 instanceof Just) {
                return new Just(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Maybe (line 174, column 1 - line 177, column 43): " + [ v.constructor.name, v1.constructor.name ]);
        };
    });
};
var optional = function (dictAlternative) {
    return function (a) {
        return Control_Alt.alt((dictAlternative.Plus1()).Alt0())(Data_Functor.map(((dictAlternative.Plus1()).Alt0()).Functor0())(Just.create)(a))(Control_Applicative.pure(dictAlternative.Applicative0())(Nothing.value));
    };
};
var monoidMaybe = function (dictSemigroup) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMaybe(dictSemigroup);
    }, Nothing.value);
};
var maybe$prime = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Nothing) {
                return v(Data_Unit.unit);
            };
            if (v2 instanceof Just) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe (line 230, column 1 - line 230, column 62): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var maybe = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Nothing) {
                return v;
            };
            if (v2 instanceof Just) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var isNothing = maybe(true)(Data_Function["const"](false));
var isJust = maybe(false)(Data_Function["const"](true));
var functorMaybe = new Data_Functor.Functor(function (v) {
    return function (v1) {
        if (v1 instanceof Just) {
            return new Just(v(v1.value0));
        };
        return Nothing.value;
    };
});
var invariantMaybe = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorMaybe));
var fromMaybe$prime = function (a) {
    return maybe$prime(a)(Control_Category.identity(Control_Category.categoryFn));
};
var fromMaybe = function (a) {
    return maybe(a)(Control_Category.identity(Control_Category.categoryFn));
};
var fromJust = function (dictPartial) {
    return function (v) {
        if (v instanceof Just) {
            return v.value0;
        };
        throw new Error("Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ v.constructor.name ]);
    };
};
var extendMaybe = new Control_Extend.Extend(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v1 instanceof Nothing) {
            return Nothing.value;
        };
        return new Just(v(v1));
    };
});
var eqMaybe = function (dictEq) {
    return new Data_Eq.Eq(function (x) {
        return function (y) {
            if (x instanceof Nothing && y instanceof Nothing) {
                return true;
            };
            if (x instanceof Just && y instanceof Just) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0);
            };
            return false;
        };
    });
};
var ordMaybe = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqMaybe(dictOrd.Eq0());
    }, function (x) {
        return function (y) {
            if (x instanceof Nothing && y instanceof Nothing) {
                return Data_Ordering.EQ.value;
            };
            if (x instanceof Nothing) {
                return Data_Ordering.LT.value;
            };
            if (y instanceof Nothing) {
                return Data_Ordering.GT.value;
            };
            if (x instanceof Just && y instanceof Just) {
                return Data_Ord.compare(dictOrd)(x.value0)(y.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe (line 194, column 1 - line 194, column 51): " + [ x.constructor.name, y.constructor.name ]);
        };
    });
};
var eq1Maybe = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqMaybe(dictEq));
});
var ord1Maybe = new Data_Ord.Ord1(function () {
    return eq1Maybe;
}, function (dictOrd) {
    return Data_Ord.compare(ordMaybe(dictOrd));
});
var boundedMaybe = function (dictBounded) {
    return new Data_Bounded.Bounded(function () {
        return ordMaybe(dictBounded.Ord0());
    }, Nothing.value, new Just(Data_Bounded.top(dictBounded)));
};
var applyMaybe = new Control_Apply.Apply(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Just) {
            return Data_Functor.map(functorMaybe)(v.value0)(v1);
        };
        if (v instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 69, column 30): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var bindMaybe = new Control_Bind.Bind(function () {
    return applyMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Just) {
            return v1(v.value0);
        };
        if (v instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 127, column 28): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var applicativeMaybe = new Control_Applicative.Applicative(function () {
    return applyMaybe;
}, Just.create);
var monadMaybe = new Control_Monad.Monad(function () {
    return applicativeMaybe;
}, function () {
    return bindMaybe;
});
var altMaybe = new Control_Alt.Alt(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Nothing) {
            return v1;
        };
        return v;
    };
});
var plusMaybe = new Control_Plus.Plus(function () {
    return altMaybe;
}, Nothing.value);
var alternativeMaybe = new Control_Alternative.Alternative(function () {
    return applicativeMaybe;
}, function () {
    return plusMaybe;
});
var monadZeroMaybe = new Control_MonadZero.MonadZero(function () {
    return alternativeMaybe;
}, function () {
    return monadMaybe;
});
module.exports = {
    Nothing: Nothing,
    Just: Just,
    maybe: maybe,
    "maybe'": maybe$prime,
    fromMaybe: fromMaybe,
    "fromMaybe'": fromMaybe$prime,
    isJust: isJust,
    isNothing: isNothing,
    fromJust: fromJust,
    optional: optional,
    functorMaybe: functorMaybe,
    applyMaybe: applyMaybe,
    applicativeMaybe: applicativeMaybe,
    altMaybe: altMaybe,
    plusMaybe: plusMaybe,
    alternativeMaybe: alternativeMaybe,
    bindMaybe: bindMaybe,
    monadMaybe: monadMaybe,
    monadZeroMaybe: monadZeroMaybe,
    extendMaybe: extendMaybe,
    invariantMaybe: invariantMaybe,
    semigroupMaybe: semigroupMaybe,
    monoidMaybe: monoidMaybe,
    eqMaybe: eqMaybe,
    eq1Maybe: eq1Maybe,
    ordMaybe: ordMaybe,
    ord1Maybe: ord1Maybe,
    boundedMaybe: boundedMaybe,
    showMaybe: showMaybe
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Category/index.js":14,"../Control.Extend/index.js":17,"../Control.Monad/index.js":33,"../Control.MonadZero/index.js":35,"../Control.Plus/index.js":38,"../Data.Bounded/index.js":61,"../Data.Eq/index.js":67,"../Data.Function/index.js":75,"../Data.Functor.Invariant/index.js":78,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117,"../Data.Unit/index.js":132}],91:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Additive = function (x) {
    return x;
};
var showAdditive = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Additive " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupAdditive = function (dictSemiring) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semiring.add(dictSemiring)(v)(v1);
        };
    });
};
var ordAdditive = function (dictOrd) {
    return dictOrd;
};
var monoidAdditive = function (dictSemiring) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAdditive(dictSemiring);
    }, Data_Semiring.zero(dictSemiring));
};
var functorAdditive = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqAdditive = function (dictEq) {
    return dictEq;
};
var eq1Additive = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqAdditive(dictEq));
});
var ord1Additive = new Data_Ord.Ord1(function () {
    return eq1Additive;
}, function (dictOrd) {
    return Data_Ord.compare(ordAdditive(dictOrd));
});
var boundedAdditive = function (dictBounded) {
    return dictBounded;
};
var applyAdditive = new Control_Apply.Apply(function () {
    return functorAdditive;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindAdditive = new Control_Bind.Bind(function () {
    return applyAdditive;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeAdditive = new Control_Applicative.Applicative(function () {
    return applyAdditive;
}, Additive);
var monadAdditive = new Control_Monad.Monad(function () {
    return applicativeAdditive;
}, function () {
    return bindAdditive;
});
module.exports = {
    Additive: Additive,
    eqAdditive: eqAdditive,
    eq1Additive: eq1Additive,
    ordAdditive: ordAdditive,
    ord1Additive: ord1Additive,
    boundedAdditive: boundedAdditive,
    showAdditive: showAdditive,
    functorAdditive: functorAdditive,
    applyAdditive: applyAdditive,
    applicativeAdditive: applicativeAdditive,
    bindAdditive: bindAdditive,
    monadAdditive: monadAdditive,
    semigroupAdditive: semigroupAdditive,
    monoidAdditive: monoidAdditive
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117}],92:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Conj = function (x) {
    return x;
};
var showConj = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Conj " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringConj = function (dictHeytingAlgebra) {
    return new Data_Semiring.Semiring(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra), Data_HeytingAlgebra.tt(dictHeytingAlgebra));
};
var semigroupConj = function (dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    });
};
var ordConj = function (dictOrd) {
    return dictOrd;
};
var monoidConj = function (dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
        return semigroupConj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra));
};
var functorConj = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqConj = function (dictEq) {
    return dictEq;
};
var eq1Conj = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqConj(dictEq));
});
var ord1Conj = new Data_Ord.Ord1(function () {
    return eq1Conj;
}, function (dictOrd) {
    return Data_Ord.compare(ordConj(dictOrd));
});
var boundedConj = function (dictBounded) {
    return dictBounded;
};
var applyConj = new Control_Apply.Apply(function () {
    return functorConj;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindConj = new Control_Bind.Bind(function () {
    return applyConj;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeConj = new Control_Applicative.Applicative(function () {
    return applyConj;
}, Conj);
var monadConj = new Control_Monad.Monad(function () {
    return applicativeConj;
}, function () {
    return bindConj;
});
module.exports = {
    Conj: Conj,
    eqConj: eqConj,
    eq1Conj: eq1Conj,
    ordConj: ordConj,
    ord1Conj: ord1Conj,
    boundedConj: boundedConj,
    showConj: showConj,
    functorConj: functorConj,
    applyConj: applyConj,
    applicativeConj: applicativeConj,
    bindConj: bindConj,
    monadConj: monadConj,
    semigroupConj: semigroupConj,
    monoidConj: monoidConj,
    semiringConj: semiringConj
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117}],93:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Disj = function (x) {
    return x;
};
var showDisj = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Disj " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringDisj = function (dictHeytingAlgebra) {
    return new Data_Semiring.Semiring(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra), Data_HeytingAlgebra.ff(dictHeytingAlgebra));
};
var semigroupDisj = function (dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    });
};
var ordDisj = function (dictOrd) {
    return dictOrd;
};
var monoidDisj = function (dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDisj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra));
};
var functorDisj = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqDisj = function (dictEq) {
    return dictEq;
};
var eq1Disj = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqDisj(dictEq));
});
var ord1Disj = new Data_Ord.Ord1(function () {
    return eq1Disj;
}, function (dictOrd) {
    return Data_Ord.compare(ordDisj(dictOrd));
});
var boundedDisj = function (dictBounded) {
    return dictBounded;
};
var applyDisj = new Control_Apply.Apply(function () {
    return functorDisj;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindDisj = new Control_Bind.Bind(function () {
    return applyDisj;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeDisj = new Control_Applicative.Applicative(function () {
    return applyDisj;
}, Disj);
var monadDisj = new Control_Monad.Monad(function () {
    return applicativeDisj;
}, function () {
    return bindDisj;
});
module.exports = {
    Disj: Disj,
    eqDisj: eqDisj,
    eq1Disj: eq1Disj,
    ordDisj: ordDisj,
    ord1Disj: ord1Disj,
    boundedDisj: boundedDisj,
    showDisj: showDisj,
    functorDisj: functorDisj,
    applyDisj: applyDisj,
    applicativeDisj: applicativeDisj,
    bindDisj: bindDisj,
    monadDisj: monadDisj,
    semigroupDisj: semigroupDisj,
    monoidDisj: monoidDisj,
    semiringDisj: semiringDisj
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117}],94:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Dual = function (x) {
    return x;
};
var showDual = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Dual " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupDual = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semigroup.append(dictSemigroup)(v1)(v);
        };
    });
};
var ordDual = function (dictOrd) {
    return dictOrd;
};
var monoidDual = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDual(dictMonoid.Semigroup0());
    }, Data_Monoid.mempty(dictMonoid));
};
var functorDual = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqDual = function (dictEq) {
    return dictEq;
};
var eq1Dual = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqDual(dictEq));
});
var ord1Dual = new Data_Ord.Ord1(function () {
    return eq1Dual;
}, function (dictOrd) {
    return Data_Ord.compare(ordDual(dictOrd));
});
var boundedDual = function (dictBounded) {
    return dictBounded;
};
var applyDual = new Control_Apply.Apply(function () {
    return functorDual;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindDual = new Control_Bind.Bind(function () {
    return applyDual;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeDual = new Control_Applicative.Applicative(function () {
    return applyDual;
}, Dual);
var monadDual = new Control_Monad.Monad(function () {
    return applicativeDual;
}, function () {
    return bindDual;
});
module.exports = {
    Dual: Dual,
    eqDual: eqDual,
    eq1Dual: eq1Dual,
    ordDual: ordDual,
    ord1Dual: ord1Dual,
    boundedDual: boundedDual,
    showDual: showDual,
    functorDual: functorDual,
    applyDual: applyDual,
    applicativeDual: applicativeDual,
    bindDual: bindDual,
    monadDual: monadDual,
    semigroupDual: semigroupDual,
    monoidDual: monoidDual
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],95:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Endo = function (x) {
    return x;
};
var showEndo = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Endo " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupEndo = function (dictSemigroupoid) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Control_Semigroupoid.compose(dictSemigroupoid)(v)(v1);
        };
    });
};
var ordEndo = function (dictOrd) {
    return dictOrd;
};
var monoidEndo = function (dictCategory) {
    return new Data_Monoid.Monoid(function () {
        return semigroupEndo(dictCategory.Semigroupoid0());
    }, Control_Category.identity(dictCategory));
};
var eqEndo = function (dictEq) {
    return dictEq;
};
var boundedEndo = function (dictBounded) {
    return dictBounded;
};
module.exports = {
    Endo: Endo,
    eqEndo: eqEndo,
    ordEndo: ordEndo,
    boundedEndo: boundedEndo,
    showEndo: showEndo,
    semigroupEndo: semigroupEndo,
    monoidEndo: monoidEndo
};

},{"../Control.Category/index.js":14,"../Control.Semigroupoid/index.js":39,"../Data.Monoid/index.js":97,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],96:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Multiplicative = function (x) {
    return x;
};
var showMultiplicative = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Multiplicative " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupMultiplicative = function (dictSemiring) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semiring.mul(dictSemiring)(v)(v1);
        };
    });
};
var ordMultiplicative = function (dictOrd) {
    return dictOrd;
};
var monoidMultiplicative = function (dictSemiring) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMultiplicative(dictSemiring);
    }, Data_Semiring.one(dictSemiring));
};
var functorMultiplicative = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqMultiplicative = function (dictEq) {
    return dictEq;
};
var eq1Multiplicative = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqMultiplicative(dictEq));
});
var ord1Multiplicative = new Data_Ord.Ord1(function () {
    return eq1Multiplicative;
}, function (dictOrd) {
    return Data_Ord.compare(ordMultiplicative(dictOrd));
});
var boundedMultiplicative = function (dictBounded) {
    return dictBounded;
};
var applyMultiplicative = new Control_Apply.Apply(function () {
    return functorMultiplicative;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindMultiplicative = new Control_Bind.Bind(function () {
    return applyMultiplicative;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeMultiplicative = new Control_Applicative.Applicative(function () {
    return applyMultiplicative;
}, Multiplicative);
var monadMultiplicative = new Control_Monad.Monad(function () {
    return applicativeMultiplicative;
}, function () {
    return bindMultiplicative;
});
module.exports = {
    Multiplicative: Multiplicative,
    eqMultiplicative: eqMultiplicative,
    eq1Multiplicative: eq1Multiplicative,
    ordMultiplicative: ordMultiplicative,
    ord1Multiplicative: ord1Multiplicative,
    boundedMultiplicative: boundedMultiplicative,
    showMultiplicative: showMultiplicative,
    functorMultiplicative: functorMultiplicative,
    applyMultiplicative: applyMultiplicative,
    applicativeMultiplicative: applicativeMultiplicative,
    bindMultiplicative: bindMultiplicative,
    monadMultiplicative: monadMultiplicative,
    semigroupMultiplicative: semigroupMultiplicative,
    monoidMultiplicative: monoidMultiplicative
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117}],97:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Boolean = require("../Data.Boolean/index.js");
var Data_EuclideanRing = require("../Data.EuclideanRing/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var MonoidRecord = function (SemigroupRecord0, memptyRecord) {
    this.SemigroupRecord0 = SemigroupRecord0;
    this.memptyRecord = memptyRecord;
};
var Monoid = function (Semigroup0, mempty) {
    this.Semigroup0 = Semigroup0;
    this.mempty = mempty;
};
var monoidUnit = new Monoid(function () {
    return Data_Semigroup.semigroupUnit;
}, Data_Unit.unit);
var monoidString = new Monoid(function () {
    return Data_Semigroup.semigroupString;
}, "");
var monoidRecordNil = new MonoidRecord(function () {
    return Data_Semigroup.semigroupRecordNil;
}, function (v) {
    return {};
});
var monoidOrdering = new Monoid(function () {
    return Data_Ordering.semigroupOrdering;
}, Data_Ordering.EQ.value);
var monoidArray = new Monoid(function () {
    return Data_Semigroup.semigroupArray;
}, [  ]);
var memptyRecord = function (dict) {
    return dict.memptyRecord;
};
var monoidRecord = function (dictRowToList) {
    return function (dictMonoidRecord) {
        return new Monoid(function () {
            return Data_Semigroup.semigroupRecord(dictRowToList)(dictMonoidRecord.SemigroupRecord0());
        }, memptyRecord(dictMonoidRecord)(Type_Data_RowList.RLProxy.value));
    };
};
var mempty = function (dict) {
    return dict.mempty;
};
var monoidFn = function (dictMonoid) {
    return new Monoid(function () {
        return Data_Semigroup.semigroupFn(dictMonoid.Semigroup0());
    }, function (v) {
        return mempty(dictMonoid);
    });
};
var monoidRecordCons = function (dictIsSymbol) {
    return function (dictMonoid) {
        return function (dictCons) {
            return function (dictMonoidRecord) {
                return new MonoidRecord(function () {
                    return Data_Semigroup.semigroupRecordCons(dictIsSymbol)(dictCons)(dictMonoidRecord.SemigroupRecord0())(dictMonoid.Semigroup0());
                }, function (v) {
                    var tail = memptyRecord(dictMonoidRecord)(Type_Data_RowList.RLProxy.value);
                    var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                    var insert = Record_Unsafe.unsafeSet(key);
                    return insert(mempty(dictMonoid))(tail);
                });
            };
        };
    };
};
var power = function (dictMonoid) {
    return function (x) {
        var go = function (p) {
            if (p <= 0) {
                return mempty(dictMonoid);
            };
            if (p === 1) {
                return x;
            };
            if (Data_EuclideanRing.mod(Data_EuclideanRing.euclideanRingInt)(p)(2) === 0) {
                var x$prime = go(Data_EuclideanRing.div(Data_EuclideanRing.euclideanRingInt)(p)(2));
                return Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(x$prime);
            };
            if (Data_Boolean.otherwise) {
                var x$prime = go(Data_EuclideanRing.div(Data_EuclideanRing.euclideanRingInt)(p)(2));
                return Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(x));
            };
            throw new Error("Failed pattern match at Data.Monoid (line 65, column 3 - line 65, column 17): " + [ p.constructor.name ]);
        };
        return go;
    };
};
var guard = function (dictMonoid) {
    return function (v) {
        return function (v1) {
            if (v) {
                return v1;
            };
            if (!v) {
                return mempty(dictMonoid);
            };
            throw new Error("Failed pattern match at Data.Monoid (line 73, column 1 - line 73, column 49): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
module.exports = {
    Monoid: Monoid,
    mempty: mempty,
    power: power,
    guard: guard,
    MonoidRecord: MonoidRecord,
    memptyRecord: memptyRecord,
    monoidUnit: monoidUnit,
    monoidOrdering: monoidOrdering,
    monoidFn: monoidFn,
    monoidString: monoidString,
    monoidArray: monoidArray,
    monoidRecord: monoidRecord,
    monoidRecordNil: monoidRecordNil,
    monoidRecordCons: monoidRecordCons
};

},{"../Data.Boolean/index.js":58,"../Data.EuclideanRing/index.js":69,"../Data.Ordering/index.js":105,"../Data.Semigroup/index.js":113,"../Data.Symbol/index.js":119,"../Data.Unit/index.js":132,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168}],98:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid_Additive = require("../Data.Monoid.Additive/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Endo = require("../Data.Monoid.Endo/index.js");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative/index.js");
var Data_Semigroup_First = require("../Data.Semigroup.First/index.js");
var Data_Semigroup_Last = require("../Data.Semigroup.Last/index.js");
var Newtype = function (unwrap, wrap) {
    this.unwrap = unwrap;
    this.wrap = wrap;
};
var wrap = function (dict) {
    return dict.wrap;
};
var unwrap = function (dict) {
    return dict.unwrap;
};
var underF2 = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        var $66 = Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn)(Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1)));
                        var $67 = Data_Function.on(f)(Data_Functor.map(dictFunctor)(wrap(dictNewtype)));
                        return function ($68) {
                            return $66($67($68));
                        };
                    };
                };
            };
        };
    };
};
var underF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        var $69 = Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1));
                        var $70 = Data_Functor.map(dictFunctor)(wrap(dictNewtype));
                        return function ($71) {
                            return $69(f($70($71)));
                        };
                    };
                };
            };
        };
    };
};
var under2 = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                var $72 = Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn)(unwrap(dictNewtype1));
                var $73 = Data_Function.on(f)(wrap(dictNewtype));
                return function ($74) {
                    return $72($73($74));
                };
            };
        };
    };
};
var under = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                var $75 = unwrap(dictNewtype1);
                var $76 = wrap(dictNewtype);
                return function ($77) {
                    return $75(f($76($77)));
                };
            };
        };
    };
};
var un = function (dictNewtype) {
    return function (v) {
        return unwrap(dictNewtype);
    };
};
var traverse = function (dictFunctor) {
    return function (dictNewtype) {
        return function (v) {
            return function (f) {
                var $78 = Data_Functor.map(dictFunctor)(wrap(dictNewtype));
                var $79 = unwrap(dictNewtype);
                return function ($80) {
                    return $78(f($79($80)));
                };
            };
        };
    };
};
var overF2 = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        var $81 = Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn)(Data_Functor.map(dictFunctor1)(wrap(dictNewtype1)));
                        var $82 = Data_Function.on(f)(Data_Functor.map(dictFunctor)(unwrap(dictNewtype)));
                        return function ($83) {
                            return $81($82($83));
                        };
                    };
                };
            };
        };
    };
};
var overF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        var $84 = Data_Functor.map(dictFunctor1)(wrap(dictNewtype1));
                        var $85 = Data_Functor.map(dictFunctor)(unwrap(dictNewtype));
                        return function ($86) {
                            return $84(f($85($86)));
                        };
                    };
                };
            };
        };
    };
};
var over2 = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                var $87 = Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn)(wrap(dictNewtype1));
                var $88 = Data_Function.on(f)(unwrap(dictNewtype));
                return function ($89) {
                    return $87($88($89));
                };
            };
        };
    };
};
var over = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                var $90 = wrap(dictNewtype1);
                var $91 = unwrap(dictNewtype);
                return function ($92) {
                    return $90(f($91($92)));
                };
            };
        };
    };
};
var op = function (dictNewtype) {
    return un(dictNewtype);
};
var newtypeMultiplicative = new Newtype(function (v) {
    return v;
}, Data_Monoid_Multiplicative.Multiplicative);
var newtypeLast = new Newtype(function (v) {
    return v;
}, Data_Semigroup_Last.Last);
var newtypeFirst = new Newtype(function (v) {
    return v;
}, Data_Semigroup_First.First);
var newtypeEndo = new Newtype(function (v) {
    return v;
}, Data_Monoid_Endo.Endo);
var newtypeDual = new Newtype(function (v) {
    return v;
}, Data_Monoid_Dual.Dual);
var newtypeDisj = new Newtype(function (v) {
    return v;
}, Data_Monoid_Disj.Disj);
var newtypeConj = new Newtype(function (v) {
    return v;
}, Data_Monoid_Conj.Conj);
var newtypeAdditive = new Newtype(function (v) {
    return v;
}, Data_Monoid_Additive.Additive);
var collect = function (dictFunctor) {
    return function (dictNewtype) {
        return function (v) {
            return function (f) {
                var $93 = wrap(dictNewtype);
                var $94 = Data_Functor.map(dictFunctor)(unwrap(dictNewtype));
                return function ($95) {
                    return $93(f($94($95)));
                };
            };
        };
    };
};
var alaF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        var $96 = Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1));
                        var $97 = Data_Functor.map(dictFunctor)(wrap(dictNewtype));
                        return function ($98) {
                            return $96(f($97($98)));
                        };
                    };
                };
            };
        };
    };
};
var ala = function (dictFunctor) {
    return function (dictNewtype) {
        return function (dictNewtype1) {
            return function (v) {
                return function (f) {
                    return Data_Functor.map(dictFunctor)(unwrap(dictNewtype))(f(wrap(dictNewtype1)));
                };
            };
        };
    };
};
module.exports = {
    unwrap: unwrap,
    wrap: wrap,
    Newtype: Newtype,
    un: un,
    op: op,
    ala: ala,
    alaF: alaF,
    over: over,
    overF: overF,
    under: under,
    underF: underF,
    over2: over2,
    overF2: overF2,
    under2: under2,
    underF2: underF2,
    traverse: traverse,
    collect: collect,
    newtypeAdditive: newtypeAdditive,
    newtypeMultiplicative: newtypeMultiplicative,
    newtypeConj: newtypeConj,
    newtypeDisj: newtypeDisj,
    newtypeDual: newtypeDual,
    newtypeEndo: newtypeEndo,
    newtypeFirst: newtypeFirst,
    newtypeLast: newtypeLast
};

},{"../Control.Semigroupoid/index.js":39,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Monoid.Additive/index.js":91,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Endo/index.js":95,"../Data.Monoid.Multiplicative/index.js":96,"../Data.Semigroup.First/index.js":108,"../Data.Semigroup.Last/index.js":110}],99:[function(require,module,exports){
"use strict";

exports["null"] = null;

exports.nullable = function (a, r, f) {
  return a == null ? r : f(a);
};

exports.notNull = function (x) {
  return x;
};

},{}],100:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Show = require("../Data.Show/index.js");
var toNullable = Data_Maybe.maybe($foreign["null"])($foreign.notNull);
var toMaybe = function (n) {
    return $foreign.nullable(n, Data_Maybe.Nothing.value, Data_Maybe.Just.create);
};
var showNullable = function (dictShow) {
    return new Data_Show.Show((function () {
        var $5 = Data_Maybe.maybe("null")(Data_Show.show(dictShow));
        return function ($6) {
            return $5(toMaybe($6));
        };
    })());
};
var eqNullable = function (dictEq) {
    return new Data_Eq.Eq(Data_Function.on(Data_Eq.eq(Data_Maybe.eqMaybe(dictEq)))(toMaybe));
};
var ordNullable = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqNullable(dictOrd.Eq0());
    }, Data_Function.on(Data_Ord.compare(Data_Maybe.ordMaybe(dictOrd)))(toMaybe));
};
var eq1Nullable = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqNullable(dictEq));
});
var ord1Nullable = new Data_Ord.Ord1(function () {
    return eq1Nullable;
}, function (dictOrd) {
    return Data_Ord.compare(ordNullable(dictOrd));
});
module.exports = {
    toMaybe: toMaybe,
    toNullable: toNullable,
    showNullable: showNullable,
    eqNullable: eqNullable,
    eq1Nullable: eq1Nullable,
    ordNullable: ordNullable,
    ord1Nullable: ord1Nullable,
    "null": $foreign["null"],
    notNull: $foreign.notNull
};

},{"../Data.Eq/index.js":67,"../Data.Function/index.js":75,"../Data.Maybe/index.js":90,"../Data.Ord/index.js":104,"../Data.Show/index.js":117,"./foreign.js":99}],101:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Max = function (x) {
    return x;
};
var showMax = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Max " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupMax = function (dictOrd) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Ord.max(dictOrd)(v)(v1);
        };
    });
};
var newtypeMax = new Data_Newtype.Newtype(function (n) {
    return n;
}, Max);
var monoidMax = function (dictBounded) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMax(dictBounded.Ord0());
    }, Data_Bounded.bottom(dictBounded));
};
var eqMax = function (dictEq) {
    return dictEq;
};
var ordMax = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqMax(dictOrd.Eq0());
    }, function (v) {
        return function (v1) {
            return Data_Ord.compare(dictOrd)(v)(v1);
        };
    });
};
module.exports = {
    Max: Max,
    newtypeMax: newtypeMax,
    eqMax: eqMax,
    ordMax: ordMax,
    semigroupMax: semigroupMax,
    monoidMax: monoidMax,
    showMax: showMax
};

},{"../Data.Bounded/index.js":61,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],102:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Min = function (x) {
    return x;
};
var showMin = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Min " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupMin = function (dictOrd) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Ord.min(dictOrd)(v)(v1);
        };
    });
};
var newtypeMin = new Data_Newtype.Newtype(function (n) {
    return n;
}, Min);
var monoidMin = function (dictBounded) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMin(dictBounded.Ord0());
    }, Data_Bounded.top(dictBounded));
};
var eqMin = function (dictEq) {
    return dictEq;
};
var ordMin = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqMin(dictOrd.Eq0());
    }, function (v) {
        return function (v1) {
            return Data_Ord.compare(dictOrd)(v)(v1);
        };
    });
};
module.exports = {
    Min: Min,
    newtypeMin: newtypeMin,
    eqMin: eqMin,
    ordMin: ordMin,
    semigroupMin: semigroupMin,
    monoidMin: monoidMin,
    showMin: showMin
};

},{"../Data.Bounded/index.js":61,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],103:[function(require,module,exports){
"use strict";

var unsafeCompareImpl = function (lt) {
  return function (eq) {
    return function (gt) {
      return function (x) {
        return function (y) {
          return x < y ? lt : x === y ? eq : gt;
        };
      };
    };
  };
};

exports.ordBooleanImpl = unsafeCompareImpl;
exports.ordIntImpl = unsafeCompareImpl;
exports.ordNumberImpl = unsafeCompareImpl;
exports.ordStringImpl = unsafeCompareImpl;
exports.ordCharImpl = unsafeCompareImpl;

exports.ordArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      var i = 0;
      var xlen = xs.length;
      var ylen = ys.length;
      while (i < xlen && i < ylen) {
        var x = xs[i];
        var y = ys[i];
        var o = f(x)(y);
        if (o !== 0) {
          return o;
        }
        i++;
      }
      if (xlen === ylen) {
        return 0;
      } else if (xlen > ylen) {
        return -1;
      } else {
        return 1;
      }
    };
  };
};

},{}],104:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var OrdRecord = function (EqRecord0, compareRecord) {
    this.EqRecord0 = EqRecord0;
    this.compareRecord = compareRecord;
};
var Ord1 = function (Eq10, compare1) {
    this.Eq10 = Eq10;
    this.compare1 = compare1;
};
var Ord = function (Eq0, compare) {
    this.Eq0 = Eq0;
    this.compare = compare;
};
var ordVoid = new Ord(function () {
    return Data_Eq.eqVoid;
}, function (v) {
    return function (v1) {
        return Data_Ordering.EQ.value;
    };
});
var ordUnit = new Ord(function () {
    return Data_Eq.eqUnit;
}, function (v) {
    return function (v1) {
        return Data_Ordering.EQ.value;
    };
});
var ordString = new Ord(function () {
    return Data_Eq.eqString;
}, $foreign.ordStringImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
var ordRecordNil = new OrdRecord(function () {
    return Data_Eq.eqRowNil;
}, function (v) {
    return function (v1) {
        return function (v2) {
            return Data_Ordering.EQ.value;
        };
    };
});
var ordOrdering = new Ord(function () {
    return Data_Ordering.eqOrdering;
}, function (v) {
    return function (v1) {
        if (v instanceof Data_Ordering.LT && v1 instanceof Data_Ordering.LT) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.EQ) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.GT && v1 instanceof Data_Ordering.GT) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.LT) {
            return Data_Ordering.LT.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.LT) {
            return Data_Ordering.GT.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.GT) {
            return Data_Ordering.LT.value;
        };
        if (v instanceof Data_Ordering.GT) {
            return Data_Ordering.GT.value;
        };
        throw new Error("Failed pattern match at Data.Ord (line 112, column 1 - line 119, column 21): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var ordNumber = new Ord(function () {
    return Data_Eq.eqNumber;
}, $foreign.ordNumberImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
var ordInt = new Ord(function () {
    return Data_Eq.eqInt;
}, $foreign.ordIntImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
var ordChar = new Ord(function () {
    return Data_Eq.eqChar;
}, $foreign.ordCharImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
var ordBoolean = new Ord(function () {
    return Data_Eq.eqBoolean;
}, $foreign.ordBooleanImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
var compareRecord = function (dict) {
    return dict.compareRecord;
};
var ordRecord = function (dictRowToList) {
    return function (dictOrdRecord) {
        return new Ord(function () {
            return Data_Eq.eqRec(dictRowToList)(dictOrdRecord.EqRecord0());
        }, compareRecord(dictOrdRecord)(Type_Data_RowList.RLProxy.value));
    };
};
var compare1 = function (dict) {
    return dict.compare1;
};
var compare = function (dict) {
    return dict.compare;
};
var comparing = function (dictOrd) {
    return function (f) {
        return function (x) {
            return function (y) {
                return compare(dictOrd)(f(x))(f(y));
            };
        };
    };
};
var greaterThan = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.GT) {
                return true;
            };
            return false;
        };
    };
};
var greaterThanOrEq = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.LT) {
                return false;
            };
            return true;
        };
    };
};
var signum = function (dictOrd) {
    return function (dictRing) {
        return function (x) {
            var $43 = greaterThanOrEq(dictOrd)(x)(Data_Semiring.zero(dictRing.Semiring0()));
            if ($43) {
                return Data_Semiring.one(dictRing.Semiring0());
            };
            return Data_Ring.negate(dictRing)(Data_Semiring.one(dictRing.Semiring0()));
        };
    };
};
var lessThan = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.LT) {
                return true;
            };
            return false;
        };
    };
};
var lessThanOrEq = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.GT) {
                return false;
            };
            return true;
        };
    };
};
var max = function (dictOrd) {
    return function (x) {
        return function (y) {
            var v = compare(dictOrd)(x)(y);
            if (v instanceof Data_Ordering.LT) {
                return y;
            };
            if (v instanceof Data_Ordering.EQ) {
                return x;
            };
            if (v instanceof Data_Ordering.GT) {
                return x;
            };
            throw new Error("Failed pattern match at Data.Ord (line 167, column 3 - line 170, column 12): " + [ v.constructor.name ]);
        };
    };
};
var min = function (dictOrd) {
    return function (x) {
        return function (y) {
            var v = compare(dictOrd)(x)(y);
            if (v instanceof Data_Ordering.LT) {
                return x;
            };
            if (v instanceof Data_Ordering.EQ) {
                return x;
            };
            if (v instanceof Data_Ordering.GT) {
                return y;
            };
            throw new Error("Failed pattern match at Data.Ord (line 158, column 3 - line 161, column 12): " + [ v.constructor.name ]);
        };
    };
};
var ordArray = function (dictOrd) {
    return new Ord(function () {
        return Data_Eq.eqArray(dictOrd.Eq0());
    }, (function () {
        var toDelta = function (x) {
            return function (y) {
                var v = compare(dictOrd)(x)(y);
                if (v instanceof Data_Ordering.EQ) {
                    return 0;
                };
                if (v instanceof Data_Ordering.LT) {
                    return 1;
                };
                if (v instanceof Data_Ordering.GT) {
                    return -1 | 0;
                };
                throw new Error("Failed pattern match at Data.Ord (line 65, column 7 - line 68, column 17): " + [ v.constructor.name ]);
            };
        };
        return function (xs) {
            return function (ys) {
                return compare(ordInt)(0)($foreign.ordArrayImpl(toDelta)(xs)(ys));
            };
        };
    })());
};
var ord1Array = new Ord1(function () {
    return Data_Eq.eq1Array;
}, function (dictOrd) {
    return compare(ordArray(dictOrd));
});
var ordRecordCons = function (dictOrdRecord) {
    return function (dictCons) {
        return function (dictIsSymbol) {
            return function (dictOrd) {
                return new OrdRecord(function () {
                    return Data_Eq.eqRowCons(dictOrdRecord.EqRecord0())(dictCons)(dictIsSymbol)(dictOrd.Eq0());
                }, function (v) {
                    return function (ra) {
                        return function (rb) {
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var left = compare(dictOrd)(Record_Unsafe.unsafeGet(key)(ra))(Record_Unsafe.unsafeGet(key)(rb));
                            var $49 = Data_Eq.notEq(Data_Ordering.eqOrdering)(left)(Data_Ordering.EQ.value);
                            if ($49) {
                                return left;
                            };
                            return compareRecord(dictOrdRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                        };
                    };
                });
            };
        };
    };
};
var clamp = function (dictOrd) {
    return function (low) {
        return function (hi) {
            return function (x) {
                return min(dictOrd)(hi)(max(dictOrd)(low)(x));
            };
        };
    };
};
var between = function (dictOrd) {
    return function (low) {
        return function (hi) {
            return function (x) {
                if (lessThan(dictOrd)(x)(low)) {
                    return false;
                };
                if (greaterThan(dictOrd)(x)(hi)) {
                    return false;
                };
                return true;
            };
        };
    };
};
var abs = function (dictOrd) {
    return function (dictRing) {
        return function (x) {
            var $53 = greaterThanOrEq(dictOrd)(x)(Data_Semiring.zero(dictRing.Semiring0()));
            if ($53) {
                return x;
            };
            return Data_Ring.negate(dictRing)(x);
        };
    };
};
module.exports = {
    Ord: Ord,
    compare: compare,
    Ord1: Ord1,
    compare1: compare1,
    lessThan: lessThan,
    lessThanOrEq: lessThanOrEq,
    greaterThan: greaterThan,
    greaterThanOrEq: greaterThanOrEq,
    comparing: comparing,
    min: min,
    max: max,
    clamp: clamp,
    between: between,
    abs: abs,
    signum: signum,
    OrdRecord: OrdRecord,
    compareRecord: compareRecord,
    ordBoolean: ordBoolean,
    ordInt: ordInt,
    ordNumber: ordNumber,
    ordString: ordString,
    ordChar: ordChar,
    ordUnit: ordUnit,
    ordVoid: ordVoid,
    ordArray: ordArray,
    ordOrdering: ordOrdering,
    ord1Array: ord1Array,
    ordRecordNil: ordRecordNil,
    ordRecordCons: ordRecordCons,
    ordRecord: ordRecord
};

},{"../Data.Eq/index.js":67,"../Data.Ordering/index.js":105,"../Data.Ring/index.js":107,"../Data.Semiring/index.js":115,"../Data.Symbol/index.js":119,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168,"./foreign.js":103}],105:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Eq = require("../Data.Eq/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var LT = (function () {
    function LT() {

    };
    LT.value = new LT();
    return LT;
})();
var GT = (function () {
    function GT() {

    };
    GT.value = new GT();
    return GT;
})();
var EQ = (function () {
    function EQ() {

    };
    EQ.value = new EQ();
    return EQ;
})();
var showOrdering = new Data_Show.Show(function (v) {
    if (v instanceof LT) {
        return "LT";
    };
    if (v instanceof GT) {
        return "GT";
    };
    if (v instanceof EQ) {
        return "EQ";
    };
    throw new Error("Failed pattern match at Data.Ordering (line 26, column 1 - line 29, column 17): " + [ v.constructor.name ]);
});
var semigroupOrdering = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v instanceof LT) {
            return LT.value;
        };
        if (v instanceof GT) {
            return GT.value;
        };
        if (v instanceof EQ) {
            return v1;
        };
        throw new Error("Failed pattern match at Data.Ordering (line 21, column 1 - line 24, column 18): " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var invert = function (v) {
    if (v instanceof GT) {
        return LT.value;
    };
    if (v instanceof EQ) {
        return EQ.value;
    };
    if (v instanceof LT) {
        return GT.value;
    };
    throw new Error("Failed pattern match at Data.Ordering (line 33, column 1 - line 33, column 31): " + [ v.constructor.name ]);
};
var eqOrdering = new Data_Eq.Eq(function (v) {
    return function (v1) {
        if (v instanceof LT && v1 instanceof LT) {
            return true;
        };
        if (v instanceof GT && v1 instanceof GT) {
            return true;
        };
        if (v instanceof EQ && v1 instanceof EQ) {
            return true;
        };
        return false;
    };
});
module.exports = {
    LT: LT,
    GT: GT,
    EQ: EQ,
    invert: invert,
    eqOrdering: eqOrdering,
    semigroupOrdering: semigroupOrdering,
    showOrdering: showOrdering
};

},{"../Data.Eq/index.js":67,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],106:[function(require,module,exports){
"use strict";

exports.intSub = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x - y | 0;
  };
};

exports.numSub = function (n1) {
  return function (n2) {
    return n1 - n2;
  };
};

},{}],107:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var RingRecord = function (SemiringRecord0, subRecord) {
    this.SemiringRecord0 = SemiringRecord0;
    this.subRecord = subRecord;
};
var Ring = function (Semiring0, sub) {
    this.Semiring0 = Semiring0;
    this.sub = sub;
};
var subRecord = function (dict) {
    return dict.subRecord;
};
var sub = function (dict) {
    return dict.sub;
};
var ringUnit = new Ring(function () {
    return Data_Semiring.semiringUnit;
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
});
var ringRecordNil = new RingRecord(function () {
    return Data_Semiring.semiringRecordNil;
}, function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
});
var ringRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictRingRecord) {
            return function (dictRing) {
                return new RingRecord(function () {
                    return Data_Semiring.semiringRecordCons(dictIsSymbol)(dictCons)(dictRingRecord.SemiringRecord0())(dictRing.Semiring0());
                }, function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = subRecord(dictRingRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(sub(dictRing)(get(ra))(get(rb)))(tail);
                        };
                    };
                });
            };
        };
    };
};
var ringRecord = function (dictRowToList) {
    return function (dictRingRecord) {
        return new Ring(function () {
            return Data_Semiring.semiringRecord(dictRowToList)(dictRingRecord.SemiringRecord0());
        }, subRecord(dictRingRecord)(Type_Data_RowList.RLProxy.value));
    };
};
var ringNumber = new Ring(function () {
    return Data_Semiring.semiringNumber;
}, $foreign.numSub);
var ringInt = new Ring(function () {
    return Data_Semiring.semiringInt;
}, $foreign.intSub);
var ringFn = function (dictRing) {
    return new Ring(function () {
        return Data_Semiring.semiringFn(dictRing.Semiring0());
    }, function (f) {
        return function (g) {
            return function (x) {
                return sub(dictRing)(f(x))(g(x));
            };
        };
    });
};
var negate = function (dictRing) {
    return function (a) {
        return sub(dictRing)(Data_Semiring.zero(dictRing.Semiring0()))(a);
    };
};
module.exports = {
    Ring: Ring,
    sub: sub,
    negate: negate,
    RingRecord: RingRecord,
    subRecord: subRecord,
    ringInt: ringInt,
    ringNumber: ringNumber,
    ringUnit: ringUnit,
    ringFn: ringFn,
    ringRecord: ringRecord,
    ringRecordNil: ringRecordNil,
    ringRecordCons: ringRecordCons
};

},{"../Data.Semiring/index.js":115,"../Data.Symbol/index.js":119,"../Data.Unit/index.js":132,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168,"./foreign.js":106}],108:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var First = function (x) {
    return x;
};
var showFirst = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(First " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupFirst = new Data_Semigroup.Semigroup(function (x) {
    return function (v) {
        return x;
    };
});
var ordFirst = function (dictOrd) {
    return dictOrd;
};
var functorFirst = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqFirst = function (dictEq) {
    return dictEq;
};
var eq1First = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqFirst(dictEq));
});
var ord1First = new Data_Ord.Ord1(function () {
    return eq1First;
}, function (dictOrd) {
    return Data_Ord.compare(ordFirst(dictOrd));
});
var boundedFirst = function (dictBounded) {
    return dictBounded;
};
var applyFirst = new Control_Apply.Apply(function () {
    return functorFirst;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindFirst = new Control_Bind.Bind(function () {
    return applyFirst;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeFirst = new Control_Applicative.Applicative(function () {
    return applyFirst;
}, First);
var monadFirst = new Control_Monad.Monad(function () {
    return applicativeFirst;
}, function () {
    return bindFirst;
});
module.exports = {
    First: First,
    eqFirst: eqFirst,
    eq1First: eq1First,
    ordFirst: ordFirst,
    ord1First: ord1First,
    boundedFirst: boundedFirst,
    showFirst: showFirst,
    functorFirst: functorFirst,
    applyFirst: applyFirst,
    applicativeFirst: applicativeFirst,
    bindFirst: bindFirst,
    monadFirst: monadFirst,
    semigroupFirst: semigroupFirst
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],109:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord_Max = require("../Data.Ord.Max/index.js");
var Data_Ord_Min = require("../Data.Ord.Min/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var JoinWith = function (x) {
    return x;
};
var Act = function (x) {
    return x;
};
var Foldable1 = function (Foldable0, fold1, foldMap1) {
    this.Foldable0 = Foldable0;
    this.fold1 = fold1;
    this.foldMap1 = foldMap1;
};
var semigroupJoinWith = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return JoinWith(function (j) {
                return Data_Semigroup.append(dictSemigroup)(v(j))(Data_Semigroup.append(dictSemigroup)(j)(v1(j)));
            });
        };
    });
};
var semigroupAct = function (dictApply) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Control_Apply.applySecond(dictApply)(v)(v1);
        };
    });
};
var joinee = function (v) {
    return v;
};
var getAct = function (v) {
    return v;
};
var foldMap1 = function (dict) {
    return dict.foldMap1;
};
var intercalateMap = function (dictFoldable1) {
    return function (dictSemigroup) {
        return function (j) {
            return function (f) {
                return function (foldable) {
                    return joinee(foldMap1(dictFoldable1)(semigroupJoinWith(dictSemigroup))(function ($43) {
                        return JoinWith(Data_Function["const"](f($43)));
                    })(foldable))(j);
                };
            };
        };
    };
};
var intercalate = function (dictFoldable1) {
    return function (dictSemigroup) {
        return Data_Function.flip(intercalateMap(dictFoldable1)(dictSemigroup))(Control_Category.identity(Control_Category.categoryFn));
    };
};
var maximum = function (dictOrd) {
    return function (dictFoldable1) {
        return Data_Newtype.ala(Data_Functor.functorFn)(Data_Ord_Max.newtypeMax)(Data_Ord_Max.newtypeMax)(Data_Ord_Max.Max)(foldMap1(dictFoldable1)(Data_Ord_Max.semigroupMax(dictOrd)));
    };
};
var minimum = function (dictOrd) {
    return function (dictFoldable1) {
        return Data_Newtype.ala(Data_Functor.functorFn)(Data_Ord_Min.newtypeMin)(Data_Ord_Min.newtypeMin)(Data_Ord_Min.Min)(foldMap1(dictFoldable1)(Data_Ord_Min.semigroupMin(dictOrd)));
    };
};
var traverse1_ = function (dictFoldable1) {
    return function (dictApply) {
        return function (f) {
            return function (t) {
                return Data_Functor.voidRight(dictApply.Functor0())(Data_Unit.unit)(getAct(foldMap1(dictFoldable1)(semigroupAct(dictApply))(function ($44) {
                    return Act(f($44));
                })(t)));
            };
        };
    };
};
var for1_ = function (dictFoldable1) {
    return function (dictApply) {
        return Data_Function.flip(traverse1_(dictFoldable1)(dictApply));
    };
};
var sequence1_ = function (dictFoldable1) {
    return function (dictApply) {
        return traverse1_(dictFoldable1)(dictApply)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var fold1Default = function (dictFoldable1) {
    return function (dictSemigroup) {
        return foldMap1(dictFoldable1)(dictSemigroup)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var foldableDual = new Foldable1(function () {
    return Data_Foldable.foldableDual;
}, function (dictSemigroup) {
    return fold1Default(foldableDual)(dictSemigroup);
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
});
var foldableMultiplicative = new Foldable1(function () {
    return Data_Foldable.foldableMultiplicative;
}, function (dictSemigroup) {
    return fold1Default(foldableMultiplicative)(dictSemigroup);
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
});
var fold1 = function (dict) {
    return dict.fold1;
};
var foldMap1Default = function (dictFoldable1) {
    return function (dictFunctor) {
        return function (dictSemigroup) {
            return function (f) {
                var $45 = fold1(dictFoldable1)(dictSemigroup);
                var $46 = Data_Functor.map(dictFunctor)(f);
                return function ($47) {
                    return $45($46($47));
                };
            };
        };
    };
};
module.exports = {
    Foldable1: Foldable1,
    foldMap1: foldMap1,
    fold1: fold1,
    traverse1_: traverse1_,
    for1_: for1_,
    sequence1_: sequence1_,
    foldMap1Default: foldMap1Default,
    fold1Default: fold1Default,
    intercalate: intercalate,
    intercalateMap: intercalateMap,
    maximum: maximum,
    minimum: minimum,
    foldableDual: foldableDual,
    foldableMultiplicative: foldableMultiplicative
};

},{"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Data.Foldable/index.js":71,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Ord.Max/index.js":101,"../Data.Ord.Min/index.js":102,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132}],110:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Show = require("../Data.Show/index.js");
var Last = function (x) {
    return x;
};
var showLast = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Last " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupLast = new Data_Semigroup.Semigroup(function (v) {
    return function (x) {
        return x;
    };
});
var ordLast = function (dictOrd) {
    return dictOrd;
};
var functorLast = new Data_Functor.Functor(function (f) {
    return function (m) {
        return f(m);
    };
});
var eqLast = function (dictEq) {
    return dictEq;
};
var eq1Last = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqLast(dictEq));
});
var ord1Last = new Data_Ord.Ord1(function () {
    return eq1Last;
}, function (dictOrd) {
    return Data_Ord.compare(ordLast(dictOrd));
});
var boundedLast = function (dictBounded) {
    return dictBounded;
};
var applyLast = new Control_Apply.Apply(function () {
    return functorLast;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindLast = new Control_Bind.Bind(function () {
    return applyLast;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeLast = new Control_Applicative.Applicative(function () {
    return applyLast;
}, Last);
var monadLast = new Control_Monad.Monad(function () {
    return applicativeLast;
}, function () {
    return bindLast;
});
module.exports = {
    Last: Last,
    eqLast: eqLast,
    eq1Last: eq1Last,
    ordLast: ordLast,
    ord1Last: ord1Last,
    boundedLast: boundedLast,
    showLast: showLast,
    functorLast: functorLast,
    applyLast: applyLast,
    applicativeLast: applicativeLast,
    bindLast: bindLast,
    monadLast: monadLast,
    semigroupLast: semigroupLast
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Ord/index.js":104,"../Data.Semigroup/index.js":113,"../Data.Show/index.js":117}],111:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative/index.js");
var Data_Semigroup_Foldable = require("../Data.Semigroup.Foldable/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Traversable1 = function (Foldable10, Traversable1, sequence1, traverse1) {
    this.Foldable10 = Foldable10;
    this.Traversable1 = Traversable1;
    this.sequence1 = sequence1;
    this.traverse1 = traverse1;
};
var traverse1 = function (dict) {
    return dict.traverse1;
};
var sequence1Default = function (dictTraversable1) {
    return function (dictApply) {
        return traverse1(dictTraversable1)(dictApply)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var traversableDual = new Traversable1(function () {
    return Data_Semigroup_Foldable.foldableDual;
}, function () {
    return Data_Traversable.traversableDual;
}, function (dictApply) {
    return sequence1Default(traversableDual)(dictApply);
}, function (dictApply) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictApply.Functor0())(Data_Monoid_Dual.Dual)(f(v));
        };
    };
});
var traversableMultiplicative = new Traversable1(function () {
    return Data_Semigroup_Foldable.foldableMultiplicative;
}, function () {
    return Data_Traversable.traversableMultiplicative;
}, function (dictApply) {
    return sequence1Default(traversableMultiplicative)(dictApply);
}, function (dictApply) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictApply.Functor0())(Data_Monoid_Multiplicative.Multiplicative)(f(v));
        };
    };
});
var sequence1 = function (dict) {
    return dict.sequence1;
};
var traverse1Default = function (dictTraversable1) {
    return function (dictApply) {
        return function (f) {
            return function (ta) {
                return sequence1(dictTraversable1)(dictApply)(Data_Functor.map((dictTraversable1.Traversable1()).Functor0())(f)(ta));
            };
        };
    };
};
module.exports = {
    sequence1: sequence1,
    traverse1: traverse1,
    Traversable1: Traversable1,
    traverse1Default: traverse1Default,
    sequence1Default: sequence1Default,
    traversableDual: traversableDual,
    traversableMultiplicative: traversableMultiplicative
};

},{"../Control.Category/index.js":14,"../Data.Functor/index.js":80,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Multiplicative/index.js":96,"../Data.Semigroup.Foldable/index.js":109,"../Data.Traversable/index.js":122}],112:[function(require,module,exports){
"use strict";

exports.concatString = function (s1) {
  return function (s2) {
    return s1 + s2;
  };
};

exports.concatArray = function (xs) {
  return function (ys) {
    if (xs.length === 0) return ys;
    if (ys.length === 0) return xs;
    return xs.concat(ys);
  };
};

},{}],113:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Data_Void = require("../Data.Void/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var SemigroupRecord = function (appendRecord) {
    this.appendRecord = appendRecord;
};
var Semigroup = function (append) {
    this.append = append;
};
var semigroupVoid = new Semigroup(function (v) {
    return Data_Void.absurd;
});
var semigroupUnit = new Semigroup(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
});
var semigroupString = new Semigroup($foreign.concatString);
var semigroupRecordNil = new SemigroupRecord(function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
});
var semigroupArray = new Semigroup($foreign.concatArray);
var appendRecord = function (dict) {
    return dict.appendRecord;
};
var semigroupRecord = function (dictRowToList) {
    return function (dictSemigroupRecord) {
        return new Semigroup(appendRecord(dictSemigroupRecord)(Type_Data_RowList.RLProxy.value));
    };
};
var append = function (dict) {
    return dict.append;
};
var semigroupFn = function (dictSemigroup) {
    return new Semigroup(function (f) {
        return function (g) {
            return function (x) {
                return append(dictSemigroup)(f(x))(g(x));
            };
        };
    });
};
var semigroupRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictSemigroupRecord) {
            return function (dictSemigroup) {
                return new SemigroupRecord(function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = appendRecord(dictSemigroupRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(append(dictSemigroup)(get(ra))(get(rb)))(tail);
                        };
                    };
                });
            };
        };
    };
};
module.exports = {
    Semigroup: Semigroup,
    append: append,
    SemigroupRecord: SemigroupRecord,
    appendRecord: appendRecord,
    semigroupString: semigroupString,
    semigroupUnit: semigroupUnit,
    semigroupVoid: semigroupVoid,
    semigroupFn: semigroupFn,
    semigroupArray: semigroupArray,
    semigroupRecord: semigroupRecord,
    semigroupRecordNil: semigroupRecordNil,
    semigroupRecordCons: semigroupRecordCons
};

},{"../Data.Symbol/index.js":119,"../Data.Unit/index.js":132,"../Data.Void/index.js":133,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168,"./foreign.js":112}],114:[function(require,module,exports){
"use strict";

exports.intAdd = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x + y | 0;
  };
};

exports.intMul = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x * y | 0;
  };
};

exports.numAdd = function (n1) {
  return function (n2) {
    return n1 + n2;
  };
};

exports.numMul = function (n1) {
  return function (n2) {
    return n1 * n2;
  };
};

},{}],115:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_Row = require("../Type.Data.Row/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var SemiringRecord = function (addRecord, mulRecord, oneRecord, zeroRecord) {
    this.addRecord = addRecord;
    this.mulRecord = mulRecord;
    this.oneRecord = oneRecord;
    this.zeroRecord = zeroRecord;
};
var Semiring = function (add, mul, one, zero) {
    this.add = add;
    this.mul = mul;
    this.one = one;
    this.zero = zero;
};
var zeroRecord = function (dict) {
    return dict.zeroRecord;
};
var zero = function (dict) {
    return dict.zero;
};
var semiringUnit = new Semiring(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, Data_Unit.unit, Data_Unit.unit);
var semiringRecordNil = new SemiringRecord(function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
}, function (v) {
    return function (v1) {
        return function (v2) {
            return {};
        };
    };
}, function (v) {
    return function (v1) {
        return {};
    };
}, function (v) {
    return function (v1) {
        return {};
    };
});
var semiringNumber = new Semiring($foreign.numAdd, $foreign.numMul, 1.0, 0.0);
var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);
var oneRecord = function (dict) {
    return dict.oneRecord;
};
var one = function (dict) {
    return dict.one;
};
var mulRecord = function (dict) {
    return dict.mulRecord;
};
var mul = function (dict) {
    return dict.mul;
};
var addRecord = function (dict) {
    return dict.addRecord;
};
var semiringRecord = function (dictRowToList) {
    return function (dictSemiringRecord) {
        return new Semiring(addRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value), mulRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value), oneRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value), zeroRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value));
    };
};
var add = function (dict) {
    return dict.add;
};
var semiringFn = function (dictSemiring) {
    return new Semiring(function (f) {
        return function (g) {
            return function (x) {
                return add(dictSemiring)(f(x))(g(x));
            };
        };
    }, function (f) {
        return function (g) {
            return function (x) {
                return mul(dictSemiring)(f(x))(g(x));
            };
        };
    }, function (v) {
        return one(dictSemiring);
    }, function (v) {
        return zero(dictSemiring);
    });
};
var semiringRecordCons = function (dictIsSymbol) {
    return function (dictCons) {
        return function (dictSemiringRecord) {
            return function (dictSemiring) {
                return new SemiringRecord(function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = addRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(add(dictSemiring)(get(ra))(get(rb)))(tail);
                        };
                    };
                }, function (v) {
                    return function (ra) {
                        return function (rb) {
                            var tail = mulRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(ra)(rb);
                            var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                            var insert = Record_Unsafe.unsafeSet(key);
                            var get = Record_Unsafe.unsafeGet(key);
                            return insert(mul(dictSemiring)(get(ra))(get(rb)))(tail);
                        };
                    };
                }, function (v) {
                    return function (v1) {
                        var tail = oneRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value);
                        var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                        var insert = Record_Unsafe.unsafeSet(key);
                        return insert(one(dictSemiring))(tail);
                    };
                }, function (v) {
                    return function (v1) {
                        var tail = zeroRecord(dictSemiringRecord)(Type_Data_RowList.RLProxy.value)(Type_Data_Row.RProxy.value);
                        var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                        var insert = Record_Unsafe.unsafeSet(key);
                        return insert(zero(dictSemiring))(tail);
                    };
                });
            };
        };
    };
};
module.exports = {
    Semiring: Semiring,
    add: add,
    zero: zero,
    mul: mul,
    one: one,
    SemiringRecord: SemiringRecord,
    addRecord: addRecord,
    mulRecord: mulRecord,
    oneRecord: oneRecord,
    zeroRecord: zeroRecord,
    semiringInt: semiringInt,
    semiringNumber: semiringNumber,
    semiringFn: semiringFn,
    semiringUnit: semiringUnit,
    semiringRecord: semiringRecord,
    semiringRecordNil: semiringRecordNil,
    semiringRecordCons: semiringRecordCons
};

},{"../Data.Symbol/index.js":119,"../Data.Unit/index.js":132,"../Record.Unsafe/index.js":164,"../Type.Data.Row/index.js":167,"../Type.Data.RowList/index.js":168,"./foreign.js":114}],116:[function(require,module,exports){
"use strict";

exports.showIntImpl = function (n) {
  return n.toString();
};

exports.showNumberImpl = function (n) {
  var str = n.toString();
  return isNaN(str + ".0") ? str : str + ".0";
};

exports.showCharImpl = function (c) {
  var code = c.charCodeAt(0);
  if (code < 0x20 || code === 0x7F) {
    switch (c) {
      case "\x07": return "'\\a'";
      case "\b": return "'\\b'";
      case "\f": return "'\\f'";
      case "\n": return "'\\n'";
      case "\r": return "'\\r'";
      case "\t": return "'\\t'";
      case "\v": return "'\\v'";
    }
    return "'\\" + code.toString(10) + "'";
  }
  return c === "'" || c === "\\" ? "'\\" + c + "'" : "'" + c + "'";
};

exports.showStringImpl = function (s) {
  var l = s.length;
  return "\"" + s.replace(
    /[\0-\x1F\x7F"\\]/g, // eslint-disable-line no-control-regex
    function (c, i) {
      switch (c) {
        case "\"":
        case "\\":
          return "\\" + c;
        case "\x07": return "\\a";
        case "\b": return "\\b";
        case "\f": return "\\f";
        case "\n": return "\\n";
        case "\r": return "\\r";
        case "\t": return "\\t";
        case "\v": return "\\v";
      }
      var k = i + 1;
      var empty = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty;
    }
  ) + "\"";
};

exports.showArrayImpl = function (f) {
  return function (xs) {
    var ss = [];
    for (var i = 0, l = xs.length; i < l; i++) {
      ss[i] = f(xs[i]);
    }
    return "[" + ss.join(",") + "]";
  };
};

exports.cons = function (head) {
  return function (tail) {
    return [head].concat(tail);
  };
};

exports.join = function (separator) {
  return function (xs) {
    return xs.join(separator);
  };
};

},{}],117:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Symbol = require("../Data.Symbol/index.js");
var Record_Unsafe = require("../Record.Unsafe/index.js");
var Type_Data_RowList = require("../Type.Data.RowList/index.js");
var ShowRecordFields = function (showRecordFields) {
    this.showRecordFields = showRecordFields;
};
var Show = function (show) {
    this.show = show;
};
var showString = new Show($foreign.showStringImpl);
var showRecordFieldsNil = new ShowRecordFields(function (v) {
    return function (v1) {
        return [  ];
    };
});
var showRecordFields = function (dict) {
    return dict.showRecordFields;
};
var showRecord = function (dictRowToList) {
    return function (dictShowRecordFields) {
        return new Show(function (record) {
            var v = showRecordFields(dictShowRecordFields)(Type_Data_RowList.RLProxy.value)(record);
            if (v.length === 0) {
                return "{}";
            };
            return $foreign.join(" ")([ "{", $foreign.join(", ")(v), "}" ]);
        });
    };
};
var showNumber = new Show($foreign.showNumberImpl);
var showInt = new Show($foreign.showIntImpl);
var showChar = new Show($foreign.showCharImpl);
var showBoolean = new Show(function (v) {
    if (v) {
        return "true";
    };
    if (!v) {
        return "false";
    };
    throw new Error("Failed pattern match at Data.Show (line 20, column 1 - line 22, column 23): " + [ v.constructor.name ]);
});
var show = function (dict) {
    return dict.show;
};
var showArray = function (dictShow) {
    return new Show($foreign.showArrayImpl(show(dictShow)));
};
var showRecordFieldsCons = function (dictIsSymbol) {
    return function (dictShowRecordFields) {
        return function (dictShow) {
            return new ShowRecordFields(function (v) {
                return function (record) {
                    var tail = showRecordFields(dictShowRecordFields)(Type_Data_RowList.RLProxy.value)(record);
                    var key = Data_Symbol.reflectSymbol(dictIsSymbol)(Data_Symbol.SProxy.value);
                    var focus = Record_Unsafe.unsafeGet(key)(record);
                    return $foreign.cons($foreign.join(": ")([ key, show(dictShow)(focus) ]))(tail);
                };
            });
        };
    };
};
module.exports = {
    Show: Show,
    show: show,
    ShowRecordFields: ShowRecordFields,
    showRecordFields: showRecordFields,
    showBoolean: showBoolean,
    showInt: showInt,
    showNumber: showNumber,
    showChar: showChar,
    showString: showString,
    showArray: showArray,
    showRecord: showRecord,
    showRecordFieldsNil: showRecordFieldsNil,
    showRecordFieldsCons: showRecordFieldsCons
};

},{"../Data.Symbol/index.js":119,"../Record.Unsafe/index.js":164,"../Type.Data.RowList/index.js":168,"./foreign.js":116}],118:[function(require,module,exports){
"use strict";

// module Data.Symbol

exports.unsafeCoerce = function (arg) {
  return arg;
};


},{}],119:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var SProxy = (function () {
    function SProxy() {

    };
    SProxy.value = new SProxy();
    return SProxy;
})();
var IsSymbol = function (reflectSymbol) {
    this.reflectSymbol = reflectSymbol;
};
var reifySymbol = function (s) {
    return function (f) {
        return $foreign.unsafeCoerce(function (dictIsSymbol) {
            return f(dictIsSymbol);
        })({
            reflectSymbol: function (v) {
                return s;
            }
        })(SProxy.value);
    };
};
var reflectSymbol = function (dict) {
    return dict.reflectSymbol;
};
module.exports = {
    IsSymbol: IsSymbol,
    reflectSymbol: reflectSymbol,
    reifySymbol: reifySymbol,
    SProxy: SProxy
};

},{"./foreign.js":118}],120:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var StateR = function (x) {
    return x;
};
var StateL = function (x) {
    return x;
};
var stateR = function (v) {
    return v;
};
var stateL = function (v) {
    return v;
};
var functorStateR = new Data_Functor.Functor(function (f) {
    return function (k) {
        return function (s) {
            var v = stateR(k)(s);
            return {
                accum: v.accum,
                value: f(v.value)
            };
        };
    };
});
var functorStateL = new Data_Functor.Functor(function (f) {
    return function (k) {
        return function (s) {
            var v = stateL(k)(s);
            return {
                accum: v.accum,
                value: f(v.value)
            };
        };
    };
});
var applyStateR = new Control_Apply.Apply(function () {
    return functorStateR;
}, function (f) {
    return function (x) {
        return function (s) {
            var v = stateR(x)(s);
            var v1 = stateR(f)(v.accum);
            return {
                accum: v1.accum,
                value: v1.value(v.value)
            };
        };
    };
});
var applyStateL = new Control_Apply.Apply(function () {
    return functorStateL;
}, function (f) {
    return function (x) {
        return function (s) {
            var v = stateL(f)(s);
            var v1 = stateL(x)(v.accum);
            return {
                accum: v1.accum,
                value: v.value(v1.value)
            };
        };
    };
});
var applicativeStateR = new Control_Applicative.Applicative(function () {
    return applyStateR;
}, function (a) {
    return function (s) {
        return {
            accum: s,
            value: a
        };
    };
});
var applicativeStateL = new Control_Applicative.Applicative(function () {
    return applyStateL;
}, function (a) {
    return function (s) {
        return {
            accum: s,
            value: a
        };
    };
});
module.exports = {
    StateL: StateL,
    stateL: stateL,
    StateR: StateR,
    stateR: stateR,
    functorStateL: functorStateL,
    applyStateL: applyStateL,
    applicativeStateL: applicativeStateL,
    functorStateR: functorStateR,
    applyStateR: applyStateR,
    applicativeStateR: applicativeStateR
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Data.Functor/index.js":80}],121:[function(require,module,exports){
"use strict";

// jshint maxparams: 3

exports.traverseArrayImpl = function () {
  function array1(a) {
    return [a];
  }

  function array2(a) {
    return function (b) {
      return [a, b];
    };
  }

  function array3(a) {
    return function (b) {
      return function (c) {
        return [a, b, c];
      };
    };
  }

  function concat2(xs) {
    return function (ys) {
      return xs.concat(ys);
    };
  }

  return function (apply) {
    return function (map) {
      return function (pure) {
        return function (f) {
          return function (array) {
            function go(bot, top) {
              switch (top - bot) {
              case 0: return pure([]);
              case 1: return map(array1)(f(array[bot]));
              case 2: return apply(map(array2)(f(array[bot])))(f(array[bot + 1]));
              case 3: return apply(apply(map(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
              default:
                // This slightly tricky pivot selection aims to produce two
                // even-length partitions where possible.
                var pivot = bot + Math.floor((top - bot) / 4) * 2;
                return apply(map(concat2)(go(bot, pivot)))(go(pivot, top));
              }
            }
            return go(0, array.length);
          };
        };
      };
    };
  };
}();

},{}],122:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Category = require("../Control.Category/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Maybe_First = require("../Data.Maybe.First/index.js");
var Data_Maybe_Last = require("../Data.Maybe.Last/index.js");
var Data_Monoid_Additive = require("../Data.Monoid.Additive/index.js");
var Data_Monoid_Conj = require("../Data.Monoid.Conj/index.js");
var Data_Monoid_Disj = require("../Data.Monoid.Disj/index.js");
var Data_Monoid_Dual = require("../Data.Monoid.Dual/index.js");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative/index.js");
var Data_Traversable_Accum_Internal = require("../Data.Traversable.Accum.Internal/index.js");
var Traversable = function (Foldable1, Functor0, sequence, traverse) {
    this.Foldable1 = Foldable1;
    this.Functor0 = Functor0;
    this.sequence = sequence;
    this.traverse = traverse;
};
var traverse = function (dict) {
    return dict.traverse;
};
var traversableMultiplicative = new Traversable(function () {
    return Data_Foldable.foldableMultiplicative;
}, function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Multiplicative.Multiplicative)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Multiplicative.Multiplicative)(f(v));
        };
    };
});
var traversableMaybe = new Traversable(function () {
    return Data_Foldable.foldableMaybe;
}, function () {
    return Data_Maybe.functorMaybe;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Data_Maybe.Nothing) {
            return Control_Applicative.pure(dictApplicative)(Data_Maybe.Nothing.value);
        };
        if (v instanceof Data_Maybe.Just) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe.Just.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Traversable (line 86, column 1 - line 90, column 33): " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return Control_Applicative.pure(dictApplicative)(Data_Maybe.Nothing.value);
            };
            if (v1 instanceof Data_Maybe.Just) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe.Just.create)(v(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Traversable (line 86, column 1 - line 90, column 33): " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
});
var traversableDual = new Traversable(function () {
    return Data_Foldable.foldableDual;
}, function () {
    return Data_Monoid_Dual.functorDual;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Dual.Dual)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Dual.Dual)(f(v));
        };
    };
});
var traversableDisj = new Traversable(function () {
    return Data_Foldable.foldableDisj;
}, function () {
    return Data_Monoid_Disj.functorDisj;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Disj.Disj)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Disj.Disj)(f(v));
        };
    };
});
var traversableConj = new Traversable(function () {
    return Data_Foldable.foldableConj;
}, function () {
    return Data_Monoid_Conj.functorConj;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Conj.Conj)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Conj.Conj)(f(v));
        };
    };
});
var traversableAdditive = new Traversable(function () {
    return Data_Foldable.foldableAdditive;
}, function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Additive.Additive)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Additive.Additive)(f(v));
        };
    };
});
var sequenceDefault = function (dictTraversable) {
    return function (dictApplicative) {
        return traverse(dictTraversable)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
    };
};
var traversableArray = new Traversable(function () {
    return Data_Foldable.foldableArray;
}, function () {
    return Data_Functor.functorArray;
}, function (dictApplicative) {
    return sequenceDefault(traversableArray)(dictApplicative);
}, function (dictApplicative) {
    return $foreign.traverseArrayImpl(Control_Apply.apply(dictApplicative.Apply0()))(Data_Functor.map((dictApplicative.Apply0()).Functor0()))(Control_Applicative.pure(dictApplicative));
});
var sequence = function (dict) {
    return dict.sequence;
};
var traversableFirst = new Traversable(function () {
    return Data_Foldable.foldableFirst;
}, function () {
    return Data_Maybe_First.functorFirst;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_First.First)(sequence(traversableMaybe)(dictApplicative)(v));
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_First.First)(traverse(traversableMaybe)(dictApplicative)(f)(v));
        };
    };
});
var traversableLast = new Traversable(function () {
    return Data_Foldable.foldableLast;
}, function () {
    return Data_Maybe_Last.functorLast;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_Last.Last)(sequence(traversableMaybe)(dictApplicative)(v));
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_Last.Last)(traverse(traversableMaybe)(dictApplicative)(f)(v));
        };
    };
});
var traverseDefault = function (dictTraversable) {
    return function (dictApplicative) {
        return function (f) {
            return function (ta) {
                return sequence(dictTraversable)(dictApplicative)(Data_Functor.map(dictTraversable.Functor0())(f)(ta));
            };
        };
    };
};
var mapAccumR = function (dictTraversable) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateR(traverse(dictTraversable)(Data_Traversable_Accum_Internal.applicativeStateR)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanr = function (dictTraversable) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumR(dictTraversable)(function (b) {
                    return function (a) {
                        var b$prime = f(a)(b);
                        return {
                            accum: b$prime,
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var mapAccumL = function (dictTraversable) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateL(traverse(dictTraversable)(Data_Traversable_Accum_Internal.applicativeStateL)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanl = function (dictTraversable) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumL(dictTraversable)(function (b) {
                    return function (a) {
                        var b$prime = f(b)(a);
                        return {
                            accum: b$prime,
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var $$for = function (dictApplicative) {
    return function (dictTraversable) {
        return function (x) {
            return function (f) {
                return traverse(dictTraversable)(dictApplicative)(f)(x);
            };
        };
    };
};
module.exports = {
    Traversable: Traversable,
    traverse: traverse,
    sequence: sequence,
    traverseDefault: traverseDefault,
    sequenceDefault: sequenceDefault,
    "for": $$for,
    scanl: scanl,
    scanr: scanr,
    mapAccumL: mapAccumL,
    mapAccumR: mapAccumR,
    traversableArray: traversableArray,
    traversableMaybe: traversableMaybe,
    traversableFirst: traversableFirst,
    traversableLast: traversableLast,
    traversableAdditive: traversableAdditive,
    traversableDual: traversableDual,
    traversableConj: traversableConj,
    traversableDisj: traversableDisj,
    traversableMultiplicative: traversableMultiplicative
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Category/index.js":14,"../Data.Foldable/index.js":71,"../Data.Functor/index.js":80,"../Data.Maybe.First/index.js":88,"../Data.Maybe.Last/index.js":89,"../Data.Maybe/index.js":90,"../Data.Monoid.Additive/index.js":91,"../Data.Monoid.Conj/index.js":92,"../Data.Monoid.Disj/index.js":93,"../Data.Monoid.Dual/index.js":94,"../Data.Monoid.Multiplicative/index.js":96,"../Data.Traversable.Accum.Internal/index.js":120,"./foreign.js":121}],123:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_Traversable_Accum_Internal = require("../Data.Traversable.Accum.Internal/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var TraversableWithIndex = function (FoldableWithIndex1, FunctorWithIndex0, Traversable2, traverseWithIndex) {
    this.FoldableWithIndex1 = FoldableWithIndex1;
    this.FunctorWithIndex0 = FunctorWithIndex0;
    this.Traversable2 = Traversable2;
    this.traverseWithIndex = traverseWithIndex;
};
var traverseWithIndexDefault = function (dictTraversableWithIndex) {
    return function (dictApplicative) {
        return function (f) {
            var $19 = Data_Traversable.sequence(dictTraversableWithIndex.Traversable2())(dictApplicative);
            var $20 = Data_FunctorWithIndex.mapWithIndex(dictTraversableWithIndex.FunctorWithIndex0())(f);
            return function ($21) {
                return $19($20($21));
            };
        };
    };
};
var traverseWithIndex = function (dict) {
    return dict.traverseWithIndex;
};
var traverseDefault = function (dictTraversableWithIndex) {
    return function (dictApplicative) {
        return function (f) {
            return traverseWithIndex(dictTraversableWithIndex)(dictApplicative)(Data_Function["const"](f));
        };
    };
};
var traversableWithIndexMultiplicative = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexMultiplicative;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexMultiplicative;
}, function () {
    return Data_Traversable.traversableMultiplicative;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableMultiplicative)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexMaybe = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexMaybe;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexMaybe;
}, function () {
    return Data_Traversable.traversableMaybe;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableMaybe)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexLast = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexLast;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexLast;
}, function () {
    return Data_Traversable.traversableLast;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableLast)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexFirst = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexFirst;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexFirst;
}, function () {
    return Data_Traversable.traversableFirst;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableFirst)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexDual = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexDual;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexDual;
}, function () {
    return Data_Traversable.traversableDual;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableDual)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexDisj = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexDisj;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexDisj;
}, function () {
    return Data_Traversable.traversableDisj;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableDisj)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexConj = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexConj;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexConj;
}, function () {
    return Data_Traversable.traversableConj;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableConj)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexArray = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexArray;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexArray;
}, function () {
    return Data_Traversable.traversableArray;
}, function (dictApplicative) {
    return traverseWithIndexDefault(traversableWithIndexArray)(dictApplicative);
});
var traversableWithIndexAdditive = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexAdditive;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexAdditive;
}, function () {
    return Data_Traversable.traversableAdditive;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableAdditive)(dictApplicative)(f(Data_Unit.unit));
    };
});
var mapAccumRWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateR(traverseWithIndex(dictTraversableWithIndex)(Data_Traversable_Accum_Internal.applicativeStateR)(function (i) {
                    return function (a) {
                        return function (s) {
                            return f(i)(s)(a);
                        };
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanrWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumRWithIndex(dictTraversableWithIndex)(function (i) {
                    return function (b) {
                        return function (a) {
                            var b$prime = f(i)(a)(b);
                            return {
                                accum: b$prime,
                                value: b$prime
                            };
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var mapAccumLWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateL(traverseWithIndex(dictTraversableWithIndex)(Data_Traversable_Accum_Internal.applicativeStateL)(function (i) {
                    return function (a) {
                        return function (s) {
                            return f(i)(s)(a);
                        };
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanlWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumLWithIndex(dictTraversableWithIndex)(function (i) {
                    return function (b) {
                        return function (a) {
                            var b$prime = f(i)(b)(a);
                            return {
                                accum: b$prime,
                                value: b$prime
                            };
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var forWithIndex = function (dictApplicative) {
    return function (dictTraversableWithIndex) {
        return Data_Function.flip(traverseWithIndex(dictTraversableWithIndex)(dictApplicative));
    };
};
module.exports = {
    TraversableWithIndex: TraversableWithIndex,
    traverseWithIndex: traverseWithIndex,
    traverseWithIndexDefault: traverseWithIndexDefault,
    forWithIndex: forWithIndex,
    scanlWithIndex: scanlWithIndex,
    mapAccumLWithIndex: mapAccumLWithIndex,
    scanrWithIndex: scanrWithIndex,
    mapAccumRWithIndex: mapAccumRWithIndex,
    traverseDefault: traverseDefault,
    traversableWithIndexArray: traversableWithIndexArray,
    traversableWithIndexMaybe: traversableWithIndexMaybe,
    traversableWithIndexFirst: traversableWithIndexFirst,
    traversableWithIndexLast: traversableWithIndexLast,
    traversableWithIndexAdditive: traversableWithIndexAdditive,
    traversableWithIndexDual: traversableWithIndexDual,
    traversableWithIndexConj: traversableWithIndexConj,
    traversableWithIndexDisj: traversableWithIndexDisj,
    traversableWithIndexMultiplicative: traversableWithIndexMultiplicative
};

},{"../Data.FoldableWithIndex/index.js":72,"../Data.Function/index.js":75,"../Data.FunctorWithIndex/index.js":82,"../Data.Traversable.Accum.Internal/index.js":120,"../Data.Traversable/index.js":122,"../Data.Unit/index.js":132}],124:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Biapplicative = require("../Control.Biapplicative/index.js");
var Control_Biapply = require("../Control.Biapply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Comonad = require("../Control.Comonad/index.js");
var Control_Extend = require("../Control.Extend/index.js");
var Control_Lazy = require("../Control.Lazy/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Semigroupoid = require("../Control.Semigroupoid/index.js");
var Data_Bifoldable = require("../Data.Bifoldable/index.js");
var Data_Bifunctor = require("../Data.Bifunctor/index.js");
var Data_Bitraversable = require("../Data.Bitraversable/index.js");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra/index.js");
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_CommutativeRing = require("../Data.CommutativeRing/index.js");
var Data_Distributive = require("../Data.Distributive/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Functor_Invariant = require("../Data.Functor.Invariant/index.js");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Maybe_First = require("../Data.Maybe.First/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semigroup_Foldable = require("../Data.Semigroup.Foldable/index.js");
var Data_Semigroup_Traversable = require("../Data.Semigroup.Traversable/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_TraversableWithIndex = require("../Data.TraversableWithIndex/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Type_Equality = require("../Type.Equality/index.js");
var Tuple = (function () {
    function Tuple(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Tuple.create = function (value0) {
        return function (value1) {
            return new Tuple(value0, value1);
        };
    };
    return Tuple;
})();
var uncurry = function (f) {
    return function (v) {
        return f(v.value0)(v.value1);
    };
};
var swap = function (v) {
    return new Tuple(v.value1, v.value0);
};
var snd = function (v) {
    return v.value1;
};
var showTuple = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            return "(Tuple " + (Data_Show.show(dictShow)(v.value0) + (" " + (Data_Show.show(dictShow1)(v.value1) + ")")));
        });
    };
};
var semiringTuple = function (dictSemiring) {
    return function (dictSemiring1) {
        return new Data_Semiring.Semiring(function (v) {
            return function (v1) {
                return new Tuple(Data_Semiring.add(dictSemiring)(v.value0)(v1.value0), Data_Semiring.add(dictSemiring1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_Semiring.mul(dictSemiring)(v.value0)(v1.value0), Data_Semiring.mul(dictSemiring1)(v.value1)(v1.value1));
            };
        }, new Tuple(Data_Semiring.one(dictSemiring), Data_Semiring.one(dictSemiring1)), new Tuple(Data_Semiring.zero(dictSemiring), Data_Semiring.zero(dictSemiring1)));
    };
};
var semigroupoidTuple = new Control_Semigroupoid.Semigroupoid(function (v) {
    return function (v1) {
        return new Tuple(v1.value0, v.value1);
    };
});
var semigroupTuple = function (dictSemigroup) {
    return function (dictSemigroup1) {
        return new Data_Semigroup.Semigroup(function (v) {
            return function (v1) {
                return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), Data_Semigroup.append(dictSemigroup1)(v.value1)(v1.value1));
            };
        });
    };
};
var ringTuple = function (dictRing) {
    return function (dictRing1) {
        return new Data_Ring.Ring(function () {
            return semiringTuple(dictRing.Semiring0())(dictRing1.Semiring0());
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_Ring.sub(dictRing)(v.value0)(v1.value0), Data_Ring.sub(dictRing1)(v.value1)(v1.value1));
            };
        });
    };
};
var monoidTuple = function (dictMonoid) {
    return function (dictMonoid1) {
        return new Data_Monoid.Monoid(function () {
            return semigroupTuple(dictMonoid.Semigroup0())(dictMonoid1.Semigroup0());
        }, new Tuple(Data_Monoid.mempty(dictMonoid), Data_Monoid.mempty(dictMonoid1)));
    };
};
var lookup = function (dictFoldable) {
    return function (dictEq) {
        return function (a) {
            var $312 = Data_Newtype.unwrap(Data_Maybe_First.newtypeFirst);
            var $313 = Data_Foldable.foldMap(dictFoldable)(Data_Maybe_First.monoidFirst)(function (v) {
                var $163 = Data_Eq.eq(dictEq)(a)(v.value0);
                if ($163) {
                    return new Data_Maybe.Just(v.value1);
                };
                return Data_Maybe.Nothing.value;
            });
            return function ($314) {
                return $312($313($314));
            };
        };
    };
};
var heytingAlgebraTuple = function (dictHeytingAlgebra) {
    return function (dictHeytingAlgebra1) {
        return new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.conj(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.disj(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, new Tuple(Data_HeytingAlgebra.ff(dictHeytingAlgebra), Data_HeytingAlgebra.ff(dictHeytingAlgebra1)), function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.implies(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.implies(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return new Tuple(Data_HeytingAlgebra.not(dictHeytingAlgebra)(v.value0), Data_HeytingAlgebra.not(dictHeytingAlgebra1)(v.value1));
        }, new Tuple(Data_HeytingAlgebra.tt(dictHeytingAlgebra), Data_HeytingAlgebra.tt(dictHeytingAlgebra1)));
    };
};
var functorTuple = new Data_Functor.Functor(function (f) {
    return function (m) {
        return new Tuple(m.value0, f(m.value1));
    };
});
var functorWithIndexTuple = new Data_FunctorWithIndex.FunctorWithIndex(function () {
    return functorTuple;
}, function (f) {
    return Data_Functor.map(functorTuple)(f(Data_Unit.unit));
});
var invariantTuple = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorTuple));
var fst = function (v) {
    return v.value0;
};
var lazyTuple = function (dictLazy) {
    return function (dictLazy1) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer(dictLazy)(function (v) {
                return fst(f(Data_Unit.unit));
            }), Control_Lazy.defer(dictLazy1)(function (v) {
                return snd(f(Data_Unit.unit));
            }));
        });
    };
};
var foldableTuple = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v.value1)(z);
        };
    };
});
var foldableWithIndexTuple = new Data_FoldableWithIndex.FoldableWithIndex(function () {
    return foldableTuple;
}, function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(Data_Unit.unit)(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(Data_Unit.unit)(z)(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(Data_Unit.unit)(v.value1)(z);
        };
    };
});
var traversableTuple = new Data_Traversable.Traversable(function () {
    return foldableTuple;
}, function () {
    return functorTuple;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create(v.value0))(v.value1);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create(v.value0))(f(v.value1));
        };
    };
});
var traversableWithIndexTuple = new Data_TraversableWithIndex.TraversableWithIndex(function () {
    return foldableWithIndexTuple;
}, function () {
    return functorWithIndexTuple;
}, function () {
    return traversableTuple;
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create(v.value0))(f(Data_Unit.unit)(v.value1));
        };
    };
});
var foldable1Tuple = new Data_Semigroup_Foldable.Foldable1(function () {
    return foldableTuple;
}, function (dictSemigroup) {
    return function (v) {
        return v.value1;
    };
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v.value1);
        };
    };
});
var traversable1Tuple = new Data_Semigroup_Traversable.Traversable1(function () {
    return foldable1Tuple;
}, function () {
    return traversableTuple;
}, function (dictApply) {
    return function (v) {
        return Data_Functor.map(dictApply.Functor0())(Tuple.create(v.value0))(v.value1);
    };
}, function (dictApply) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictApply.Functor0())(Tuple.create(v.value0))(f(v.value1));
        };
    };
});
var extendTuple = new Control_Extend.Extend(function () {
    return functorTuple;
}, function (f) {
    return function (v) {
        return new Tuple(v.value0, f(v));
    };
});
var eqTuple = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0) && Data_Eq.eq(dictEq1)(x.value1)(y.value1);
            };
        });
    };
};
var ordTuple = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqTuple(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                var v = Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                if (v instanceof Data_Ordering.LT) {
                    return Data_Ordering.LT.value;
                };
                if (v instanceof Data_Ordering.GT) {
                    return Data_Ordering.GT.value;
                };
                return Data_Ord.compare(dictOrd1)(x.value1)(y.value1);
            };
        });
    };
};
var eq1Tuple = function (dictEq) {
    return new Data_Eq.Eq1(function (dictEq1) {
        return Data_Eq.eq(eqTuple(dictEq)(dictEq1));
    });
};
var ord1Tuple = function (dictOrd) {
    return new Data_Ord.Ord1(function () {
        return eq1Tuple(dictOrd.Eq0());
    }, function (dictOrd1) {
        return Data_Ord.compare(ordTuple(dictOrd)(dictOrd1));
    });
};
var distributiveTuple = function (dictTypeEquals) {
    return new Data_Distributive.Distributive(function () {
        return functorTuple;
    }, function (dictFunctor) {
        return Data_Distributive.collectDefault(distributiveTuple(dictTypeEquals))(dictFunctor);
    }, function (dictFunctor) {
        var $315 = Tuple.create(Type_Equality.from(dictTypeEquals)(Data_Unit.unit));
        var $316 = Data_Functor.map(dictFunctor)(snd);
        return function ($317) {
            return $315($316($317));
        };
    });
};
var curry = function (f) {
    return function (a) {
        return function (b) {
            return f(new Tuple(a, b));
        };
    };
};
var comonadTuple = new Control_Comonad.Comonad(function () {
    return extendTuple;
}, snd);
var commutativeRingTuple = function (dictCommutativeRing) {
    return function (dictCommutativeRing1) {
        return new Data_CommutativeRing.CommutativeRing(function () {
            return ringTuple(dictCommutativeRing.Ring0())(dictCommutativeRing1.Ring0());
        });
    };
};
var boundedTuple = function (dictBounded) {
    return function (dictBounded1) {
        return new Data_Bounded.Bounded(function () {
            return ordTuple(dictBounded.Ord0())(dictBounded1.Ord0());
        }, new Tuple(Data_Bounded.bottom(dictBounded), Data_Bounded.bottom(dictBounded1)), new Tuple(Data_Bounded.top(dictBounded), Data_Bounded.top(dictBounded1)));
    };
};
var booleanAlgebraTuple = function (dictBooleanAlgebra) {
    return function (dictBooleanAlgebra1) {
        return new Data_BooleanAlgebra.BooleanAlgebra(function () {
            return heytingAlgebraTuple(dictBooleanAlgebra.HeytingAlgebra0())(dictBooleanAlgebra1.HeytingAlgebra0());
        });
    };
};
var bifunctorTuple = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
        return function (v) {
            return new Tuple(f(v.value0), g(v.value1));
        };
    };
});
var bifoldableTuple = new Data_Bifoldable.Bifoldable(function (dictMonoid) {
    return function (f) {
        return function (g) {
            return function (v) {
                return Data_Semigroup.append(dictMonoid.Semigroup0())(f(v.value0))(g(v.value1));
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (v) {
                return g(f(z)(v.value0))(v.value1);
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (v) {
                return f(v.value0)(g(v.value1)(z));
            };
        };
    };
});
var bitraversableTuple = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableTuple;
}, function () {
    return bifunctorTuple;
}, function (dictApplicative) {
    return function (v) {
        return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create)(v.value0))(v.value1);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (g) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create)(f(v.value0)))(g(v.value1));
            };
        };
    };
});
var biapplyTuple = new Control_Biapply.Biapply(function () {
    return bifunctorTuple;
}, function (v) {
    return function (v1) {
        return new Tuple(v.value0(v1.value0), v.value1(v1.value1));
    };
});
var biapplicativeTuple = new Control_Biapplicative.Biapplicative(function () {
    return biapplyTuple;
}, Tuple.create);
var applyTuple = function (dictSemigroup) {
    return new Control_Apply.Apply(function () {
        return functorTuple;
    }, function (v) {
        return function (v1) {
            return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), v.value1(v1.value1));
        };
    });
};
var bindTuple = function (dictSemigroup) {
    return new Control_Bind.Bind(function () {
        return applyTuple(dictSemigroup);
    }, function (v) {
        return function (f) {
            var v1 = f(v.value1);
            return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), v1.value1);
        };
    });
};
var applicativeTuple = function (dictMonoid) {
    return new Control_Applicative.Applicative(function () {
        return applyTuple(dictMonoid.Semigroup0());
    }, Tuple.create(Data_Monoid.mempty(dictMonoid)));
};
var monadTuple = function (dictMonoid) {
    return new Control_Monad.Monad(function () {
        return applicativeTuple(dictMonoid);
    }, function () {
        return bindTuple(dictMonoid.Semigroup0());
    });
};
module.exports = {
    Tuple: Tuple,
    fst: fst,
    snd: snd,
    curry: curry,
    uncurry: uncurry,
    swap: swap,
    lookup: lookup,
    showTuple: showTuple,
    eqTuple: eqTuple,
    eq1Tuple: eq1Tuple,
    ordTuple: ordTuple,
    ord1Tuple: ord1Tuple,
    boundedTuple: boundedTuple,
    semigroupoidTuple: semigroupoidTuple,
    semigroupTuple: semigroupTuple,
    monoidTuple: monoidTuple,
    semiringTuple: semiringTuple,
    ringTuple: ringTuple,
    commutativeRingTuple: commutativeRingTuple,
    heytingAlgebraTuple: heytingAlgebraTuple,
    booleanAlgebraTuple: booleanAlgebraTuple,
    functorTuple: functorTuple,
    functorWithIndexTuple: functorWithIndexTuple,
    invariantTuple: invariantTuple,
    bifunctorTuple: bifunctorTuple,
    applyTuple: applyTuple,
    biapplyTuple: biapplyTuple,
    applicativeTuple: applicativeTuple,
    biapplicativeTuple: biapplicativeTuple,
    bindTuple: bindTuple,
    monadTuple: monadTuple,
    extendTuple: extendTuple,
    comonadTuple: comonadTuple,
    lazyTuple: lazyTuple,
    foldableTuple: foldableTuple,
    foldable1Tuple: foldable1Tuple,
    foldableWithIndexTuple: foldableWithIndexTuple,
    bifoldableTuple: bifoldableTuple,
    traversableTuple: traversableTuple,
    traversable1Tuple: traversable1Tuple,
    traversableWithIndexTuple: traversableWithIndexTuple,
    bitraversableTuple: bitraversableTuple,
    distributiveTuple: distributiveTuple
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Biapplicative/index.js":10,"../Control.Biapply/index.js":11,"../Control.Bind/index.js":13,"../Control.Comonad/index.js":15,"../Control.Extend/index.js":17,"../Control.Lazy/index.js":18,"../Control.Monad/index.js":33,"../Control.Semigroupoid/index.js":39,"../Data.Bifoldable/index.js":50,"../Data.Bifunctor/index.js":56,"../Data.Bitraversable/index.js":57,"../Data.BooleanAlgebra/index.js":59,"../Data.Bounded/index.js":61,"../Data.CommutativeRing/index.js":62,"../Data.Distributive/index.js":63,"../Data.Eq/index.js":67,"../Data.Foldable/index.js":71,"../Data.FoldableWithIndex/index.js":72,"../Data.Functor.Invariant/index.js":78,"../Data.Functor/index.js":80,"../Data.FunctorWithIndex/index.js":82,"../Data.HeytingAlgebra/index.js":84,"../Data.Maybe.First/index.js":88,"../Data.Maybe/index.js":90,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Ring/index.js":107,"../Data.Semigroup.Foldable/index.js":109,"../Data.Semigroup.Traversable/index.js":111,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117,"../Data.Traversable/index.js":122,"../Data.TraversableWithIndex/index.js":123,"../Data.Unit/index.js":132,"../Type.Equality/index.js":169}],125:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Boolean = require("../Data.Boolean/index.js");
var Data_EuclideanRing = require("../Data.EuclideanRing/index.js");
var Data_Typelevel_Undefined = require("../Data.Typelevel.Undefined/index.js");
var Partial_Unsafe = require("../Partial.Unsafe/index.js");
var Nat = function (toInt) {
    this.toInt = toInt;
};
var Pos = function (Nat0) {
    this.Nat0 = Nat0;
};
var toInt = function (dict) {
    return dict.toInt;
};
var toInt$prime = function (dictNat) {
    return function (v) {
        return toInt(dictNat)(Data_Typelevel_Undefined["undefined"]);
    };
};
var natD9 = new Nat(function (v) {
    return 9;
});
var posD9 = new Pos(function () {
    return natD9;
});
var natD8 = new Nat(function (v) {
    return 8;
});
var posD8 = new Pos(function () {
    return natD8;
});
var natD7 = new Nat(function (v) {
    return 7;
});
var posD7 = new Pos(function () {
    return natD7;
});
var natD6 = new Nat(function (v) {
    return 6;
});
var posD6 = new Pos(function () {
    return natD6;
});
var natD5 = new Nat(function (v) {
    return 5;
});
var posD5 = new Pos(function () {
    return natD5;
});
var natD4 = new Nat(function (v) {
    return 4;
});
var posD4 = new Pos(function () {
    return natD4;
});
var natD3 = new Nat(function (v) {
    return 3;
});
var posD3 = new Pos(function () {
    return natD3;
});
var natD2 = new Nat(function (v) {
    return 2;
});
var posD2 = new Pos(function () {
    return natD2;
});
var natD1 = new Nat(function (v) {
    return 1;
});
var posD1 = new Pos(function () {
    return natD1;
});
var natD0 = new Nat(function (v) {
    return 0;
});
var div10Dec = function (dictNat) {
    return function (v) {
        return Data_Typelevel_Undefined["undefined"];
    };
};
var subLastDec = function (dictNat) {
    return function (dictNat1) {
        var $77 = toInt(dictNat1);
        var $78 = div10Dec(dictNat);
        return function ($79) {
            return (function (v) {
                return 10 * v | 0;
            })($77($78($79)));
        };
    };
};
var posNatD0 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD0(dictPos))(dictPos.Nat0())(n);
    });
};
var posPosD0 = function (dictPos) {
    return new Pos(function () {
        return posNatD0(dictPos);
    });
};
var posNatD1 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD1(dictPos))(dictPos.Nat0())(n) + 1 | 0;
    });
};
var posPosD1 = function (dictPos) {
    return new Pos(function () {
        return posNatD1(dictPos);
    });
};
var posNatD2 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD2(dictPos))(dictPos.Nat0())(n) + 2 | 0;
    });
};
var posPosD2 = function (dictPos) {
    return new Pos(function () {
        return posNatD2(dictPos);
    });
};
var posNatD3 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD3(dictPos))(dictPos.Nat0())(n) + 3 | 0;
    });
};
var posPosD3 = function (dictPos) {
    return new Pos(function () {
        return posNatD3(dictPos);
    });
};
var posNatD4 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD4(dictPos))(dictPos.Nat0())(n) + 4 | 0;
    });
};
var posPosD4 = function (dictPos) {
    return new Pos(function () {
        return posNatD4(dictPos);
    });
};
var posNatD5 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD5(dictPos))(dictPos.Nat0())(n) + 5 | 0;
    });
};
var posPosD5 = function (dictPos) {
    return new Pos(function () {
        return posNatD5(dictPos);
    });
};
var posNatD6 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD6(dictPos))(dictPos.Nat0())(n) + 6 | 0;
    });
};
var posPosD6 = function (dictPos) {
    return new Pos(function () {
        return posNatD6(dictPos);
    });
};
var posNatD7 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD7(dictPos))(dictPos.Nat0())(n) + 7 | 0;
    });
};
var posPosD7 = function (dictPos) {
    return new Pos(function () {
        return posNatD7(dictPos);
    });
};
var posNatD8 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD8(dictPos))(dictPos.Nat0())(n) + 8 | 0;
    });
};
var posPosD8 = function (dictPos) {
    return new Pos(function () {
        return posNatD8(dictPos);
    });
};
var posNatD9 = function (dictPos) {
    return new Nat(function (n) {
        return subLastDec(posNatD9(dictPos))(dictPos.Nat0())(n) + 9 | 0;
    });
};
var posPosD9 = function (dictPos) {
    return new Pos(function () {
        return posNatD9(dictPos);
    });
};
var reifyIntP = function (i) {
    return function (f) {
        if (i < 1) {
            return Partial_Unsafe.unsafeCrashWith("reifyIntP: integral < 1");
        };
        if (i === 1) {
            return f(posD1)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 2) {
            return f(posD2)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 3) {
            return f(posD3)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 4) {
            return f(posD4)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 5) {
            return f(posD5)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 6) {
            return f(posD6)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 7) {
            return f(posD7)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 8) {
            return f(posD8)(Data_Typelevel_Undefined["undefined"]);
        };
        if (i === 9) {
            return f(posD9)(Data_Typelevel_Undefined["undefined"]);
        };
        if (Data_Boolean.otherwise) {
            var f9 = function (dictPos) {
                return function (v) {
                    return f(posPosD9(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f8 = function (dictPos) {
                return function (v) {
                    return f(posPosD8(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f7 = function (dictPos) {
                return function (v) {
                    return f(posPosD7(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f6 = function (dictPos) {
                return function (v) {
                    return f(posPosD6(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f5 = function (dictPos) {
                return function (v) {
                    return f(posPosD5(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f4 = function (dictPos) {
                return function (v) {
                    return f(posPosD4(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f3 = function (dictPos) {
                return function (v) {
                    return f(posPosD3(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f2 = function (dictPos) {
                return function (v) {
                    return f(posPosD2(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f11 = function (dictPos) {
                return function (v) {
                    return f(posPosD1(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var f0 = function (dictPos) {
                return function (v) {
                    return f(posPosD0(dictPos))(Data_Typelevel_Undefined["undefined"]);
                };
            };
            var m = Data_EuclideanRing.mod(Data_EuclideanRing.euclideanRingInt)(i)(10);
            var d = Data_EuclideanRing.div(Data_EuclideanRing.euclideanRingInt)(i)(10);
            return (function (dictPartial) {
                if (m === 0) {
                    return reifyIntP(d)(function (dictPos) {
                        return f0(dictPos);
                    });
                };
                if (m === 1) {
                    return reifyIntP(d)(function (dictPos) {
                        return f11(dictPos);
                    });
                };
                if (m === 2) {
                    return reifyIntP(d)(function (dictPos) {
                        return f2(dictPos);
                    });
                };
                if (m === 3) {
                    return reifyIntP(d)(function (dictPos) {
                        return f3(dictPos);
                    });
                };
                if (m === 4) {
                    return reifyIntP(d)(function (dictPos) {
                        return f4(dictPos);
                    });
                };
                if (m === 5) {
                    return reifyIntP(d)(function (dictPos) {
                        return f5(dictPos);
                    });
                };
                if (m === 6) {
                    return reifyIntP(d)(function (dictPos) {
                        return f6(dictPos);
                    });
                };
                if (m === 7) {
                    return reifyIntP(d)(function (dictPos) {
                        return f7(dictPos);
                    });
                };
                if (m === 8) {
                    return reifyIntP(d)(function (dictPos) {
                        return f8(dictPos);
                    });
                };
                if (m === 9) {
                    return reifyIntP(d)(function (dictPos) {
                        return f9(dictPos);
                    });
                };
                throw new Error("Failed pattern match at Data.Typelevel.Num.Sets (line 88, column 24 - line 98, column 26): " + [ m.constructor.name ]);
            })();
        };
        throw new Error("Failed pattern match at Data.Typelevel.Num.Sets (line 73, column 1 - line 73, column 63): " + [ i.constructor.name, f.constructor.name ]);
    };
};
var reifyInt = function (i) {
    return function (f) {
        if (i < 0) {
            return Partial_Unsafe.unsafeCrashWith("reifyInt: integral < 0");
        };
        if (i === 0) {
            return f(natD0)(Data_Typelevel_Undefined["undefined"]);
        };
        if (Data_Boolean.otherwise) {
            return reifyIntP(i)(function (dictPos) {
                return f(dictPos.Nat0());
            });
        };
        throw new Error("Failed pattern match at Data.Typelevel.Num.Sets (line 67, column 1 - line 67, column 62): " + [ i.constructor.name, f.constructor.name ]);
    };
};
module.exports = {
    toInt: toInt,
    Nat: Nat,
    "toInt'": toInt$prime,
    Pos: Pos,
    subLastDec: subLastDec,
    div10Dec: div10Dec,
    reifyInt: reifyInt,
    reifyIntP: reifyIntP,
    natD0: natD0,
    natD1: natD1,
    natD2: natD2,
    natD3: natD3,
    natD4: natD4,
    natD5: natD5,
    natD6: natD6,
    natD7: natD7,
    natD8: natD8,
    natD9: natD9,
    posNatD0: posNatD0,
    posNatD1: posNatD1,
    posNatD2: posNatD2,
    posNatD3: posNatD3,
    posNatD4: posNatD4,
    posNatD5: posNatD5,
    posNatD6: posNatD6,
    posNatD7: posNatD7,
    posNatD8: posNatD8,
    posNatD9: posNatD9,
    posD1: posD1,
    posD2: posD2,
    posD3: posD3,
    posD4: posD4,
    posD5: posD5,
    posD6: posD6,
    posD7: posD7,
    posD8: posD8,
    posD9: posD9,
    posPosD0: posPosD0,
    posPosD1: posPosD1,
    posPosD2: posPosD2,
    posPosD3: posPosD3,
    posPosD4: posPosD4,
    posPosD5: posPosD5,
    posPosD6: posPosD6,
    posPosD7: posPosD7,
    posPosD8: posPosD8,
    posPosD9: posPosD9
};

},{"../Data.Boolean/index.js":58,"../Data.EuclideanRing/index.js":69,"../Data.Typelevel.Undefined/index.js":126,"../Partial.Unsafe/index.js":160}],126:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Unit = require("../Data.Unit/index.js");
var $$undefined = Data_Unit.unit;
module.exports = {
    "undefined": $$undefined
};

},{"../Data.Unit/index.js":132}],127:[function(require,module,exports){
"use strict";

exports.unfoldrArrayImpl = function (isNothing) {
  return function (fromJust) {
    return function (fst) {
      return function (snd) {
        return function (f) {
          return function (b) {
            var result = [];
            var value = b;
            while (true) { // eslint-disable-line no-constant-condition
              var maybe = f(value);
              if (isNothing(maybe)) return result;
              var tuple = fromJust(maybe);
              result.push(fst(tuple));
              value = snd(tuple);
            }
          };
        };
      };
    };
  };
};

},{}],128:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Traversable = require("../Data.Traversable/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unfoldable1 = require("../Data.Unfoldable1/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Unfoldable = function (Unfoldable10, unfoldr) {
    this.Unfoldable10 = Unfoldable10;
    this.unfoldr = unfoldr;
};
var unfoldr = function (dict) {
    return dict.unfoldr;
};
var unfoldableMaybe = new Unfoldable(function () {
    return Data_Unfoldable1.unfoldable1Maybe;
}, function (f) {
    return function (b) {
        return Data_Functor.map(Data_Maybe.functorMaybe)(Data_Tuple.fst)(f(b));
    };
});
var unfoldableArray = new Unfoldable(function () {
    return Data_Unfoldable1.unfoldable1Array;
}, $foreign.unfoldrArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
var replicate = function (dictUnfoldable) {
    return function (n) {
        return function (v) {
            var step = function (i) {
                var $7 = i <= 0;
                if ($7) {
                    return Data_Maybe.Nothing.value;
                };
                return new Data_Maybe.Just(new Data_Tuple.Tuple(v, i - 1 | 0));
            };
            return unfoldr(dictUnfoldable)(step)(n);
        };
    };
};
var replicateA = function (dictApplicative) {
    return function (dictUnfoldable) {
        return function (dictTraversable) {
            return function (n) {
                return function (m) {
                    return Data_Traversable.sequence(dictTraversable)(dictApplicative)(replicate(dictUnfoldable)(n)(m));
                };
            };
        };
    };
};
var none = function (dictUnfoldable) {
    return unfoldr(dictUnfoldable)(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Unit.unit);
};
var fromMaybe = function (dictUnfoldable) {
    return unfoldr(dictUnfoldable)(function (b) {
        return Data_Functor.map(Data_Maybe.functorMaybe)(Data_Function.flip(Data_Tuple.Tuple.create)(Data_Maybe.Nothing.value))(b);
    });
};
module.exports = {
    Unfoldable: Unfoldable,
    unfoldr: unfoldr,
    replicate: replicate,
    replicateA: replicateA,
    none: none,
    fromMaybe: fromMaybe,
    unfoldableArray: unfoldableArray,
    unfoldableMaybe: unfoldableMaybe
};

},{"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Traversable/index.js":122,"../Data.Tuple/index.js":124,"../Data.Unfoldable1/index.js":130,"../Data.Unit/index.js":132,"./foreign.js":127}],129:[function(require,module,exports){
"use strict";

exports.unfoldr1ArrayImpl = function (isNothing) {
  return function (fromJust) {
    return function (fst) {
      return function (snd) {
        return function (f) {
          return function (b) {
            var result = [];
            var value = b;
            while (true) { // eslint-disable-line no-constant-condition
              var tuple = f(value);
              result.push(fst(tuple));
              var maybe = snd(tuple);
              if (isNothing(maybe)) return result;
              value = fromJust(maybe);
            }
          };
        };
      };
    };
  };
};

},{}],130:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Boolean = require("../Data.Boolean/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Semigroup_Traversable = require("../Data.Semigroup.Traversable/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Unfoldable1 = function (unfoldr1) {
    this.unfoldr1 = unfoldr1;
};
var unfoldr1 = function (dict) {
    return dict.unfoldr1;
};
var unfoldable1Maybe = new Unfoldable1(function (f) {
    return function (b) {
        return new Data_Maybe.Just(Data_Tuple.fst(f(b)));
    };
});
var unfoldable1Array = new Unfoldable1($foreign.unfoldr1ArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
var replicate1 = function (dictUnfoldable1) {
    return function (n) {
        return function (v) {
            var step = function (i) {
                if (i <= 0) {
                    return new Data_Tuple.Tuple(v, Data_Maybe.Nothing.value);
                };
                if (Data_Boolean.otherwise) {
                    return new Data_Tuple.Tuple(v, new Data_Maybe.Just(i - 1 | 0));
                };
                throw new Error("Failed pattern match at Data.Unfoldable1 (line 67, column 5 - line 67, column 39): " + [ i.constructor.name ]);
            };
            return unfoldr1(dictUnfoldable1)(step)(n - 1 | 0);
        };
    };
};
var replicate1A = function (dictApply) {
    return function (dictUnfoldable1) {
        return function (dictTraversable1) {
            return function (n) {
                return function (m) {
                    return Data_Semigroup_Traversable.sequence1(dictTraversable1)(dictApply)(replicate1(dictUnfoldable1)(n)(m));
                };
            };
        };
    };
};
var singleton = function (dictUnfoldable1) {
    return replicate1(dictUnfoldable1)(1);
};
var range = function (dictUnfoldable1) {
    return function (start) {
        return function (end) {
            var go = function (delta) {
                return function (i) {
                    var i$prime = i + delta | 0;
                    return new Data_Tuple.Tuple(i, (function () {
                        var $8 = i === end;
                        if ($8) {
                            return Data_Maybe.Nothing.value;
                        };
                        return new Data_Maybe.Just(i$prime);
                    })());
                };
            };
            var delta = (function () {
                var $9 = end >= start;
                if ($9) {
                    return 1;
                };
                return -1 | 0;
            })();
            return unfoldr1(dictUnfoldable1)(go(delta))(start);
        };
    };
};
module.exports = {
    Unfoldable1: Unfoldable1,
    unfoldr1: unfoldr1,
    replicate1: replicate1,
    replicate1A: replicate1A,
    singleton: singleton,
    range: range,
    unfoldable1Array: unfoldable1Array,
    unfoldable1Maybe: unfoldable1Maybe
};

},{"../Data.Boolean/index.js":58,"../Data.Maybe/index.js":90,"../Data.Semigroup.Traversable/index.js":111,"../Data.Tuple/index.js":124,"./foreign.js":129}],131:[function(require,module,exports){
"use strict";

exports.unit = {};

},{}],132:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Show = require("../Data.Show/index.js");
var showUnit = new Data_Show.Show(function (v) {
    return "unit";
});
module.exports = {
    showUnit: showUnit,
    unit: $foreign.unit
};

},{"../Data.Show/index.js":117,"./foreign.js":131}],133:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Show = require("../Data.Show/index.js");
var Void = function (x) {
    return x;
};
var absurd = function (a) {
    var spin = function ($copy_v) {
        var $tco_result;
        function $tco_loop(v) {
            $copy_v = v;
            return;
        };
        while (!false) {
            $tco_result = $tco_loop($copy_v);
        };
        return $tco_result;
    };
    return spin(a);
};
var showVoid = new Data_Show.Show(absurd);
module.exports = {
    absurd: absurd,
    showVoid: showVoid
};

},{"../Data.Show/index.js":117}],134:[function(require,module,exports){
(function (setImmediate,clearImmediate){
/* globals setImmediate, clearImmediate, setTimeout, clearTimeout */
/* jshint -W083, -W098, -W003 */
"use strict";

var Aff = function () {
  // A unique value for empty.
  var EMPTY = {};

  /*

  An awkward approximation. We elide evidence we would otherwise need in PS for
  efficiency sake.

  data Aff eff a
    = Pure a
    | Throw Error
    | Catch (Aff eff a) (Error -> Aff eff a)
    | Sync (Eff eff a)
    | Async ((Either Error a -> Eff eff Unit) -> Eff eff (Canceler eff))
    | forall b. Bind (Aff eff b) (b -> Aff eff a)
    | forall b. Bracket (Aff eff b) (BracketConditions eff b) (b -> Aff eff a)
    | forall b. Fork Boolean (Aff eff b) ?(Fiber eff b -> a)
    | Sequential (ParAff aff a)

  */
  var PURE    = "Pure";
  var THROW   = "Throw";
  var CATCH   = "Catch";
  var SYNC    = "Sync";
  var ASYNC   = "Async";
  var BIND    = "Bind";
  var BRACKET = "Bracket";
  var FORK    = "Fork";
  var SEQ     = "Sequential";

  /*

  data ParAff eff a
    = forall b. Map (b -> a) (ParAff eff b)
    | forall b. Apply (ParAff eff (b -> a)) (ParAff eff b)
    | Alt (ParAff eff a) (ParAff eff a)
    | ?Par (Aff eff a)

  */
  var MAP   = "Map";
  var APPLY = "Apply";
  var ALT   = "Alt";

  // Various constructors used in interpretation
  var CONS      = "Cons";      // Cons-list, for stacks
  var RESUME    = "Resume";    // Continue indiscriminately
  var RELEASE   = "Release";   // Continue with bracket finalizers
  var FINALIZER = "Finalizer"; // A non-interruptible effect
  var FINALIZED = "Finalized"; // Marker for finalization
  var FORKED    = "Forked";    // Reference to a forked fiber, with resumption stack
  var FIBER     = "Fiber";     // Actual fiber reference
  var THUNK     = "Thunk";     // Primed effect, ready to invoke

  function Aff(tag, _1, _2, _3) {
    this.tag = tag;
    this._1  = _1;
    this._2  = _2;
    this._3  = _3;
  }

  function AffCtr(tag) {
    var fn = function (_1, _2, _3) {
      return new Aff(tag, _1, _2, _3);
    };
    fn.tag = tag;
    return fn;
  }

  function nonCanceler(error) {
    return new Aff(PURE, void 0);
  }

  function runEff(eff) {
    try {
      eff();
    } catch (error) {
      setTimeout(function () {
        throw error;
      }, 0);
    }
  }

  function runSync(left, right, eff) {
    try {
      return right(eff());
    } catch (error) {
      return left(error);
    }
  }

  function runAsync(left, eff, k) {
    try {
      return eff(k)();
    } catch (error) {
      k(left(error))();
      return nonCanceler;
    }
  }

  var Scheduler = function () {
    var limit    = 1024;
    var size     = 0;
    var ix       = 0;
    var queue    = new Array(limit);
    var draining = false;

    function drain() {
      var thunk;
      draining = true;
      while (size !== 0) {
        size--;
        thunk     = queue[ix];
        queue[ix] = void 0;
        ix        = (ix + 1) % limit;
        thunk();
      }
      draining = false;
    }

    return {
      isDraining: function () {
        return draining;
      },
      enqueue: function (cb) {
        var i, tmp;
        if (size === limit) {
          tmp = draining;
          drain();
          draining = tmp;
        }

        queue[(ix + size) % limit] = cb;
        size++;

        if (!draining) {
          drain();
        }
      }
    };
  }();

  function Supervisor(util) {
    var fibers  = {};
    var fiberId = 0;
    var count   = 0;

    return {
      register: function (fiber) {
        var fid = fiberId++;
        fiber.onComplete({
          rethrow: true,
          handler: function (result) {
            return function () {
              count--;
              delete fibers[fid];
            };
          }
        })();
        fibers[fid] = fiber;
        count++;
      },
      isEmpty: function () {
        return count === 0;
      },
      killAll: function (killError, cb) {
        return function () {
          if (count === 0) {
            return cb();
          }

          var killCount = 0;
          var kills     = {};

          function kill(fid) {
            kills[fid] = fibers[fid].kill(killError, function (result) {
              return function () {
                delete kills[fid];
                killCount--;
                if (util.isLeft(result) && util.fromLeft(result)) {
                  setTimeout(function () {
                    throw util.fromLeft(result);
                  }, 0);
                }
                if (killCount === 0) {
                  cb();
                }
              };
            })();
          }

          for (var k in fibers) {
            if (fibers.hasOwnProperty(k)) {
              killCount++;
              kill(k);
            }
          }

          fibers  = {};
          fiberId = 0;
          count   = 0;

          return function (error) {
            return new Aff(SYNC, function () {
              for (var k in kills) {
                if (kills.hasOwnProperty(k)) {
                  kills[k]();
                }
              }
            });
          };
        };
      }
    };
  }

  // Fiber state machine
  var SUSPENDED   = 0; // Suspended, pending a join.
  var CONTINUE    = 1; // Interpret the next instruction.
  var STEP_BIND   = 2; // Apply the next bind.
  var STEP_RESULT = 3; // Handle potential failure from a result.
  var PENDING     = 4; // An async effect is running.
  var RETURN      = 5; // The current stack has returned.
  var COMPLETED   = 6; // The entire fiber has completed.

  function Fiber(util, supervisor, aff) {
    // Monotonically increasing tick, increased on each asynchronous turn.
    var runTick = 0;

    // The current branch of the state machine.
    var status = SUSPENDED;

    // The current point of interest for the state machine branch.
    var step      = aff;  // Successful step
    var fail      = null; // Failure step
    var interrupt = null; // Asynchronous interrupt

    // Stack of continuations for the current fiber.
    var bhead = null;
    var btail = null;

    // Stack of attempts and finalizers for error recovery. Every `Cons` is also
    // tagged with current `interrupt` state. We use this to track which items
    // should be ignored or evaluated as a result of a kill.
    var attempts = null;

    // A special state is needed for Bracket, because it cannot be killed. When
    // we enter a bracket acquisition or finalizer, we increment the counter,
    // and then decrement once complete.
    var bracketCount = 0;

    // Each join gets a new id so they can be revoked.
    var joinId  = 0;
    var joins   = null;
    var rethrow = true;

    // Each invocation of `run` requires a tick. When an asynchronous effect is
    // resolved, we must check that the local tick coincides with the fiber
    // tick before resuming. This prevents multiple async continuations from
    // accidentally resuming the same fiber. A common example may be invoking
    // the provided callback in `makeAff` more than once, but it may also be an
    // async effect resuming after the fiber was already cancelled.
    function run(localRunTick) {
      var tmp, result, attempt;
      while (true) {
        tmp       = null;
        result    = null;
        attempt   = null;

        switch (status) {
        case STEP_BIND:
          status = CONTINUE;
          try {
            step   = bhead(step);
            if (btail === null) {
              bhead = null;
            } else {
              bhead = btail._1;
              btail = btail._2;
            }
          } catch (e) {
            status = RETURN;
            fail   = util.left(e);
            step   = null;
          }
          break;

        case STEP_RESULT:
          if (util.isLeft(step)) {
            status = RETURN;
            fail   = step;
            step   = null;
          } else if (bhead === null) {
            status = RETURN;
          } else {
            status = STEP_BIND;
            step   = util.fromRight(step);
          }
          break;

        case CONTINUE:
          switch (step.tag) {
          case BIND:
            if (bhead) {
              btail = new Aff(CONS, bhead, btail);
            }
            bhead  = step._2;
            status = CONTINUE;
            step   = step._1;
            break;

          case PURE:
            if (bhead === null) {
              status = RETURN;
              step   = util.right(step._1);
            } else {
              status = STEP_BIND;
              step   = step._1;
            }
            break;

          case SYNC:
            status = STEP_RESULT;
            step   = runSync(util.left, util.right, step._1);
            break;

          case ASYNC:
            status = PENDING;
            step   = runAsync(util.left, step._1, function (result) {
              return function () {
                if (runTick !== localRunTick) {
                  return;
                }
                runTick++;
                Scheduler.enqueue(function () {
                  // It's possible to interrupt the fiber between enqueuing and
                  // resuming, so we need to check that the runTick is still
                  // valid.
                  if (runTick !== localRunTick + 1) {
                    return;
                  }
                  status = STEP_RESULT;
                  step   = result;
                  run(runTick);
                });
              };
            });
            return;

          case THROW:
            status = RETURN;
            fail   = util.left(step._1);
            step   = null;
            break;

          // Enqueue the Catch so that we can call the error handler later on
          // in case of an exception.
          case CATCH:
            if (bhead === null) {
              attempts = new Aff(CONS, step, attempts, interrupt);
            } else {
              attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
            }
            bhead    = null;
            btail    = null;
            status   = CONTINUE;
            step     = step._1;
            break;

          // Enqueue the Bracket so that we can call the appropriate handlers
          // after resource acquisition.
          case BRACKET:
            bracketCount++;
            if (bhead === null) {
              attempts = new Aff(CONS, step, attempts, interrupt);
            } else {
              attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
            }
            bhead  = null;
            btail  = null;
            status = CONTINUE;
            step   = step._1;
            break;

          case FORK:
            status = STEP_RESULT;
            tmp    = Fiber(util, supervisor, step._2);
            if (supervisor) {
              supervisor.register(tmp);
            }
            if (step._1) {
              tmp.run();
            }
            step = util.right(tmp);
            break;

          case SEQ:
            status = CONTINUE;
            step   = sequential(util, supervisor, step._1);
            break;
          }
          break;

        case RETURN:
          bhead = null;
          btail = null;
          // If the current stack has returned, and we have no other stacks to
          // resume or finalizers to run, the fiber has halted and we can
          // invoke all join callbacks. Otherwise we need to resume.
          if (attempts === null) {
            status = COMPLETED;
            step   = interrupt || fail || step;
          } else {
            // The interrupt status for the enqueued item.
            tmp      = attempts._3;
            attempt  = attempts._1;
            attempts = attempts._2;

            switch (attempt.tag) {
            // We cannot recover from an unmasked interrupt. Otherwise we should
            // continue stepping, or run the exception handler if an exception
            // was raised.
            case CATCH:
              // We should compare the interrupt status as well because we
              // only want it to apply if there has been an interrupt since
              // enqueuing the catch.
              if (interrupt && interrupt !== tmp && bracketCount === 0) {
                status = RETURN;
              } else if (fail) {
                status = CONTINUE;
                step   = attempt._2(util.fromLeft(fail));
                fail   = null;
              }
              break;

            // We cannot resume from an unmasked interrupt or exception.
            case RESUME:
              // As with Catch, we only want to ignore in the case of an
              // interrupt since enqueing the item.
              if (interrupt && interrupt !== tmp && bracketCount === 0 || fail) {
                status = RETURN;
              } else {
                bhead  = attempt._1;
                btail  = attempt._2;
                status = STEP_BIND;
                step   = util.fromRight(step);
              }
              break;

            // If we have a bracket, we should enqueue the handlers,
            // and continue with the success branch only if the fiber has
            // not been interrupted. If the bracket acquisition failed, we
            // should not run either.
            case BRACKET:
              bracketCount--;
              if (fail === null) {
                result   = util.fromRight(step);
                // We need to enqueue the Release with the same interrupt
                // status as the Bracket that is initiating it.
                attempts = new Aff(CONS, new Aff(RELEASE, attempt._2, result), attempts, tmp);
                // We should only coninue as long as the interrupt status has not changed or
                // we are currently within a non-interruptable finalizer.
                if (interrupt === tmp || bracketCount > 0) {
                  status = CONTINUE;
                  step   = attempt._3(result);
                }
              }
              break;

            // Enqueue the appropriate handler. We increase the bracket count
            // because it should not be cancelled.
            case RELEASE:
              attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
              status   = CONTINUE;
              // It has only been killed if the interrupt status has changed
              // since we enqueued the item, and the bracket count is 0. If the
              // bracket count is non-zero then we are in a masked state so it's
              // impossible to be killed.
              if (interrupt && interrupt !== tmp && bracketCount === 0) {
                step = attempt._1.killed(util.fromLeft(interrupt))(attempt._2);
              } else if (fail) {
                step = attempt._1.failed(util.fromLeft(fail))(attempt._2);
              } else {
                step = attempt._1.completed(util.fromRight(step))(attempt._2);
              }
              fail = null;
              bracketCount++;
              break;

            case FINALIZER:
              bracketCount++;
              attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
              status   = CONTINUE;
              step     = attempt._1;
              break;

            case FINALIZED:
              bracketCount--;
              status = RETURN;
              step   = attempt._1;
              fail   = attempt._2;
              break;
            }
          }
          break;

        case COMPLETED:
          for (var k in joins) {
            if (joins.hasOwnProperty(k)) {
              rethrow = rethrow && joins[k].rethrow;
              runEff(joins[k].handler(step));
            }
          }
          joins = null;
          // If we have an interrupt and a fail, then the thread threw while
          // running finalizers. This should always rethrow in a fresh stack.
          if (interrupt && fail) {
            setTimeout(function () {
              throw util.fromLeft(fail);
            }, 0);
          // If we have an unhandled exception, and no other fiber has joined
          // then we need to throw the exception in a fresh stack.
          } else if (util.isLeft(step) && rethrow) {
            setTimeout(function () {
              // Guard on reathrow because a completely synchronous fiber can
              // still have an observer which was added after-the-fact.
              if (rethrow) {
                throw util.fromLeft(step);
              }
            }, 0);
          }
          return;
        case SUSPENDED:
          status = CONTINUE;
          break;
        case PENDING: return;
        }
      }
    }

    function onComplete(join) {
      return function () {
        if (status === COMPLETED) {
          rethrow = rethrow && join.rethrow;
          join.handler(step)();
          return function () {};
        }

        var jid    = joinId++;
        joins      = joins || {};
        joins[jid] = join;

        return function() {
          if (joins !== null) {
            delete joins[jid];
          }
        };
      };
    }

    function kill(error, cb) {
      return function () {
        if (status === COMPLETED) {
          cb(util.right(void 0))();
          return function () {};
        }

        var canceler = onComplete({
          rethrow: false,
          handler: function (/* unused */) {
            return cb(util.right(void 0));
          }
        })();

        switch (status) {
        case SUSPENDED:
          interrupt = util.left(error);
          status    = COMPLETED;
          step      = interrupt;
          run(runTick);
          break;
        case PENDING:
          if (interrupt === null) {
            interrupt = util.left(error);
          }
          if (bracketCount === 0) {
            if (status === PENDING) {
              attempts = new Aff(CONS, new Aff(FINALIZER, step(error)), attempts, interrupt);
            }
            status   = RETURN;
            step     = null;
            fail     = null;
            run(++runTick);
          }
          break;
        default:
          if (interrupt === null) {
            interrupt = util.left(error);
          }
          if (bracketCount === 0) {
            status = RETURN;
            step   = null;
            fail   = null;
          }
        }

        return canceler;
      };
    }

    function join(cb) {
      return function () {
        var canceler = onComplete({
          rethrow: false,
          handler: cb
        })();
        if (status === SUSPENDED) {
          run(runTick);
        }
        return canceler;
      };
    }

    return {
      kill: kill,
      join: join,
      onComplete: onComplete,
      isSuspended: function () {
        return status === SUSPENDED;
      },
      run: function () {
        if (status === SUSPENDED) {
          if (!Scheduler.isDraining()) {
            Scheduler.enqueue(function () {
              run(runTick);
            });
          } else {
            run(runTick);
          }
        }
      }
    };
  }

  function runPar(util, supervisor, par, cb) {
    // Table of all forked fibers.
    var fiberId   = 0;
    var fibers    = {};

    // Table of currently running cancelers, as a product of `Alt` behavior.
    var killId    = 0;
    var kills     = {};

    // Error used for early cancelation on Alt branches.
    var early     = new Error("[ParAff] Early exit");

    // Error used to kill the entire tree.
    var interrupt = null;

    // The root pointer of the tree.
    var root      = EMPTY;

    // Walks a tree, invoking all the cancelers. Returns the table of pending
    // cancellation fibers.
    function kill(error, par, cb) {
      var step  = par;
      var head  = null;
      var tail  = null;
      var count = 0;
      var kills = {};
      var tmp, kid;

      loop: while (true) {
        tmp = null;

        switch (step.tag) {
        case FORKED:
          if (step._3 === EMPTY) {
            tmp = fibers[step._1];
            kills[count++] = tmp.kill(error, function (result) {
              return function () {
                count--;
                if (count === 0) {
                  cb(result)();
                }
              };
            });
          }
          // Terminal case.
          if (head === null) {
            break loop;
          }
          // Go down the right side of the tree.
          step = head._2;
          if (tail === null) {
            head = null;
          } else {
            head = tail._1;
            tail = tail._2;
          }
          break;
        case MAP:
          step = step._2;
          break;
        case APPLY:
        case ALT:
          if (head) {
            tail = new Aff(CONS, head, tail);
          }
          head = step;
          step = step._1;
          break;
        }
      }

      if (count === 0) {
        cb(util.right(void 0))();
      } else {
        // Run the cancelation effects. We alias `count` because it's mutable.
        kid = 0;
        tmp = count;
        for (; kid < tmp; kid++) {
          kills[kid] = kills[kid]();
        }
      }

      return kills;
    }

    // When a fiber resolves, we need to bubble back up the tree with the
    // result, computing the applicative nodes.
    function join(result, head, tail) {
      var fail, step, lhs, rhs, tmp, kid;

      if (util.isLeft(result)) {
        fail = result;
        step = null;
      } else {
        step = result;
        fail = null;
      }

      loop: while (true) {
        lhs = null;
        rhs = null;
        tmp = null;
        kid = null;

        // We should never continue if the entire tree has been interrupted.
        if (interrupt !== null) {
          return;
        }

        // We've made it all the way to the root of the tree, which means
        // the tree has fully evaluated.
        if (head === null) {
          cb(fail || step)();
          return;
        }

        // The tree has already been computed, so we shouldn't try to do it
        // again. This should never happen.
        // TODO: Remove this?
        if (head._3 !== EMPTY) {
          return;
        }

        switch (head.tag) {
        case MAP:
          if (fail === null) {
            head._3 = util.right(head._1(util.fromRight(step)));
            step    = head._3;
          } else {
            head._3 = fail;
          }
          break;
        case APPLY:
          lhs = head._1._3;
          rhs = head._2._3;
          // If we have a failure we should kill the other side because we
          // can't possible yield a result anymore.
          if (fail) {
            head._3 = fail;
            tmp     = true;
            kid     = killId++;

            kills[kid] = kill(early, fail === lhs ? head._2 : head._1, function (/* unused */) {
              return function () {
                delete kills[kid];
                if (tmp) {
                  tmp = false;
                } else if (tail === null) {
                  join(fail, null, null);
                } else {
                  join(fail, tail._1, tail._2);
                }
              };
            });

            if (tmp) {
              tmp = false;
              return;
            }
          } else if (lhs === EMPTY || rhs === EMPTY) {
            // We can only proceed if both sides have resolved.
            return;
          } else {
            step    = util.right(util.fromRight(lhs)(util.fromRight(rhs)));
            head._3 = step;
          }
          break;
        case ALT:
          lhs = head._1._3;
          rhs = head._2._3;
          // We can only proceed if both have resolved or we have a success
          if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) {
            return;
          }
          // If both sides resolve with an error, we should continue with the
          // first error
          if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
            fail    = step === lhs ? rhs : lhs;
            step    = null;
            head._3 = fail;
          } else {
            head._3 = step;
            tmp     = true;
            kid     = killId++;
            // Once a side has resolved, we need to cancel the side that is still
            // pending before we can continue.
            kills[kid] = kill(early, step === lhs ? head._2 : head._1, function (/* unused */) {
              return function () {
                delete kills[kid];
                if (tmp) {
                  tmp = false;
                } else if (tail === null) {
                  join(step, null, null);
                } else {
                  join(step, tail._1, tail._2);
                }
              };
            });

            if (tmp) {
              tmp = false;
              return;
            }
          }
          break;
        }

        if (tail === null) {
          head = null;
        } else {
          head = tail._1;
          tail = tail._2;
        }
      }
    }

    function resolve(fiber) {
      return function (result) {
        return function () {
          delete fibers[fiber._1];
          fiber._3 = result;
          join(result, fiber._2._1, fiber._2._2);
        };
      };
    }

    // Walks the applicative tree, substituting non-applicative nodes with
    // `FORKED` nodes. In this tree, all applicative nodes use the `_3` slot
    // as a mutable slot for memoization. In an unresolved state, the `_3`
    // slot is `EMPTY`. In the cases of `ALT` and `APPLY`, we always walk
    // the left side first, because both operations are left-associative. As
    // we `RETURN` from those branches, we then walk the right side.
    function run() {
      var status = CONTINUE;
      var step   = par;
      var head   = null;
      var tail   = null;
      var tmp, fid;

      loop: while (true) {
        tmp = null;
        fid = null;

        switch (status) {
        case CONTINUE:
          switch (step.tag) {
          case MAP:
            if (head) {
              tail = new Aff(CONS, head, tail);
            }
            head = new Aff(MAP, step._1, EMPTY, EMPTY);
            step = step._2;
            break;
          case APPLY:
            if (head) {
              tail = new Aff(CONS, head, tail);
            }
            head = new Aff(APPLY, EMPTY, step._2, EMPTY);
            step = step._1;
            break;
          case ALT:
            if (head) {
              tail = new Aff(CONS, head, tail);
            }
            head = new Aff(ALT, EMPTY, step._2, EMPTY);
            step = step._1;
            break;
          default:
            // When we hit a leaf value, we suspend the stack in the `FORKED`.
            // When the fiber resolves, it can bubble back up the tree.
            fid    = fiberId++;
            status = RETURN;
            tmp    = step;
            step   = new Aff(FORKED, fid, new Aff(CONS, head, tail), EMPTY);
            tmp    = Fiber(util, supervisor, tmp);
            tmp.onComplete({
              rethrow: false,
              handler: resolve(step)
            })();
            fibers[fid] = tmp;
            if (supervisor) {
              supervisor.register(tmp);
            }
          }
          break;
        case RETURN:
          // Terminal case, we are back at the root.
          if (head === null) {
            break loop;
          }
          // If we are done with the right side, we need to continue down the
          // left. Otherwise we should continue up the stack.
          if (head._1 === EMPTY) {
            head._1 = step;
            status  = CONTINUE;
            step    = head._2;
            head._2 = EMPTY;
          } else {
            head._2 = step;
            step    = head;
            if (tail === null) {
              head  = null;
            } else {
              head  = tail._1;
              tail  = tail._2;
            }
          }
        }
      }

      // Keep a reference to the tree root so it can be cancelled.
      root = step;

      for (fid = 0; fid < fiberId; fid++) {
        fibers[fid].run();
      }
    }

    // Cancels the entire tree. If there are already subtrees being canceled,
    // we need to first cancel those joins. We will then add fresh joins for
    // all pending branches including those that were in the process of being
    // canceled.
    function cancel(error, cb) {
      interrupt = util.left(error);
      var innerKills;
      for (var kid in kills) {
        if (kills.hasOwnProperty(kid)) {
          innerKills = kills[kid];
          for (kid in innerKills) {
            if (innerKills.hasOwnProperty(kid)) {
              innerKills[kid]();
            }
          }
        }
      }

      kills = null;
      var newKills = kill(error, root, cb);

      return function (killError) {
        return new Aff(ASYNC, function (killCb) {
          return function () {
            for (var kid in newKills) {
              if (newKills.hasOwnProperty(kid)) {
                newKills[kid]();
              }
            }
            return nonCanceler;
          };
        });
      };
    }

    run();

    return function (killError) {
      return new Aff(ASYNC, function (killCb) {
        return function () {
          return cancel(killError, killCb);
        };
      });
    };
  }

  function sequential(util, supervisor, par) {
    return new Aff(ASYNC, function (cb) {
      return function () {
        return runPar(util, supervisor, par, cb);
      };
    });
  }

  Aff.EMPTY       = EMPTY;
  Aff.Pure        = AffCtr(PURE);
  Aff.Throw       = AffCtr(THROW);
  Aff.Catch       = AffCtr(CATCH);
  Aff.Sync        = AffCtr(SYNC);
  Aff.Async       = AffCtr(ASYNC);
  Aff.Bind        = AffCtr(BIND);
  Aff.Bracket     = AffCtr(BRACKET);
  Aff.Fork        = AffCtr(FORK);
  Aff.Seq         = AffCtr(SEQ);
  Aff.ParMap      = AffCtr(MAP);
  Aff.ParApply    = AffCtr(APPLY);
  Aff.ParAlt      = AffCtr(ALT);
  Aff.Fiber       = Fiber;
  Aff.Supervisor  = Supervisor;
  Aff.Scheduler   = Scheduler;
  Aff.nonCanceler = nonCanceler;

  return Aff;
}();

exports._pure = Aff.Pure;

exports._throwError = Aff.Throw;

exports._catchError = function (aff) {
  return function (k) {
    return Aff.Catch(aff, k);
  };
};

exports._map = function (f) {
  return function (aff) {
    if (aff.tag === Aff.Pure.tag) {
      return Aff.Pure(f(aff._1));
    } else {
      return Aff.Bind(aff, function (value) {
        return Aff.Pure(f(value));
      });
    }
  };
};

exports._bind = function (aff) {
  return function (k) {
    return Aff.Bind(aff, k);
  };
};

exports._fork = function (immediate) {
  return function (aff) {
    return Aff.Fork(immediate, aff);
  };
};

exports._liftEffect = Aff.Sync;

exports._parAffMap = function (f) {
  return function (aff) {
    return Aff.ParMap(f, aff);
  };
};

exports._parAffApply = function (aff1) {
  return function (aff2) {
    return Aff.ParApply(aff1, aff2);
  };
};

exports._parAffAlt = function (aff1) {
  return function (aff2) {
    return Aff.ParAlt(aff1, aff2);
  };
};

exports.makeAff = Aff.Async;

exports.generalBracket = function (acquire) {
  return function (options) {
    return function (k) {
      return Aff.Bracket(acquire, options, k);
    };
  };
};

exports._makeFiber = function (util, aff) {
  return function () {
    return Aff.Fiber(util, null, aff);
  };
};

exports._makeSupervisedFiber = function (util, aff) {
  return function () {
    var supervisor = Aff.Supervisor(util);
    return {
      fiber: Aff.Fiber(util, supervisor, aff),
      supervisor: supervisor
    };
  };
};

exports._killAll = function (error, supervisor, cb) {
  return supervisor.killAll(error, cb);
};

exports._delay = function () {
  function setDelay(n, k) {
    if (n === 0 && typeof setImmediate !== "undefined") {
      return setImmediate(k);
    } else {
      return setTimeout(k, n);
    }
  }

  function clearDelay(n, t) {
    if (n === 0 && typeof clearImmediate !== "undefined") {
      return clearImmediate(t);
    } else {
      return clearTimeout(t);
    }
  }

  return function (right, ms) {
    return Aff.Async(function (cb) {
      return function () {
        var timer = setDelay(ms, cb(right()));
        return function () {
          return Aff.Sync(function () {
            return right(clearDelay(ms, timer));
          });
        };
      };
    });
  };
}();

exports._sequential = Aff.Seq;

}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"timers":3}],135:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Alt = require("../Control.Alt/index.js");
var Control_Alternative = require("../Control.Alternative/index.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Lazy = require("../Control.Lazy/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class/index.js");
var Control_Parallel = require("../Control.Parallel/index.js");
var Control_Parallel_Class = require("../Control.Parallel.Class/index.js");
var Control_Plus = require("../Control.Plus/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Foldable = require("../Data.Foldable/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect = require("../Effect/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var Effect_Exception = require("../Effect.Exception/index.js");
var Effect_Unsafe = require("../Effect.Unsafe/index.js");
var Partial_Unsafe = require("../Partial.Unsafe/index.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var Fiber = function (x) {
    return x;
};
var FFIUtil = function (x) {
    return x;
};
var Canceler = function (x) {
    return x;
};
var suspendAff = $foreign["_fork"](false);
var newtypeCanceler = new Data_Newtype.Newtype(function (n) {
    return n;
}, Canceler);
var functorParAff = new Data_Functor.Functor($foreign["_parAffMap"]);
var functorAff = new Data_Functor.Functor($foreign["_map"]);
var forkAff = $foreign["_fork"](true);
var ffiUtil = (function () {
    var unsafeFromRight = function (v) {
        if (v instanceof Data_Either.Right) {
            return v.value0;
        };
        if (v instanceof Data_Either.Left) {
            return Partial_Unsafe.unsafeCrashWith("unsafeFromRight: Left");
        };
        throw new Error("Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 54): " + [ v.constructor.name ]);
    };
    var unsafeFromLeft = function (v) {
        if (v instanceof Data_Either.Left) {
            return v.value0;
        };
        if (v instanceof Data_Either.Right) {
            return Partial_Unsafe.unsafeCrashWith("unsafeFromLeft: Right");
        };
        throw new Error("Failed pattern match at Effect.Aff (line 395, column 20 - line 397, column 54): " + [ v.constructor.name ]);
    };
    var isLeft = function (v) {
        if (v instanceof Data_Either.Left) {
            return true;
        };
        if (v instanceof Data_Either.Right) {
            return false;
        };
        throw new Error("Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [ v.constructor.name ]);
    };
    return {
        isLeft: isLeft,
        fromLeft: unsafeFromLeft,
        fromRight: unsafeFromRight,
        left: Data_Either.Left.create,
        right: Data_Either.Right.create
    };
})();
var makeFiber = function (aff) {
    return $foreign["_makeFiber"](ffiUtil, aff);
};
var launchAff = function (aff) {
    return function __do() {
        var v = makeFiber(aff)();
        v.run();
        return v;
    };
};
var launchAff_ = (function () {
    var $49 = Data_Functor["void"](Effect.functorEffect);
    return function ($50) {
        return $49(launchAff($50));
    };
})();
var launchSuspendedAff = makeFiber;
var delay = function (v) {
    return $foreign["_delay"](Data_Either.Right.create, v);
};
var bracket = function (acquire) {
    return function (completed) {
        return $foreign.generalBracket(acquire)({
            killed: Data_Function["const"](completed),
            failed: Data_Function["const"](completed),
            completed: Data_Function["const"](completed)
        });
    };
};
var applyParAff = new Control_Apply.Apply(function () {
    return functorParAff;
}, $foreign["_parAffApply"]);
var semigroupParAff = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyParAff)(Data_Semigroup.append(dictSemigroup)));
};
var monadAff = new Control_Monad.Monad(function () {
    return applicativeAff;
}, function () {
    return bindAff;
});
var bindAff = new Control_Bind.Bind(function () {
    return applyAff;
}, $foreign["_bind"]);
var applyAff = new Control_Apply.Apply(function () {
    return functorAff;
}, Control_Monad.ap(monadAff));
var applicativeAff = new Control_Applicative.Applicative(function () {
    return applyAff;
}, $foreign["_pure"]);
var cancelWith = function (aff) {
    return function (v) {
        return $foreign.generalBracket(Control_Applicative.pure(applicativeAff)(Data_Unit.unit))({
            killed: function (e) {
                return function (v1) {
                    return v(e);
                };
            },
            failed: Data_Function["const"](Control_Applicative.pure(applicativeAff)),
            completed: Data_Function["const"](Control_Applicative.pure(applicativeAff))
        })(Data_Function["const"](aff));
    };
};
var $$finally = function (fin) {
    return function (a) {
        return bracket(Control_Applicative.pure(applicativeAff)(Data_Unit.unit))(Data_Function["const"](fin))(Data_Function["const"](a));
    };
};
var invincible = function (a) {
    return bracket(a)(Data_Function["const"](Control_Applicative.pure(applicativeAff)(Data_Unit.unit)))(Control_Applicative.pure(applicativeAff));
};
var lazyAff = new Control_Lazy.Lazy(function (f) {
    return Control_Bind.bind(bindAff)(Control_Applicative.pure(applicativeAff)(Data_Unit.unit))(f);
});
var semigroupAff = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyAff)(Data_Semigroup.append(dictSemigroup)));
};
var monadEffectAff = new Effect_Class.MonadEffect(function () {
    return monadAff;
}, $foreign["_liftEffect"]);
var effectCanceler = (function () {
    var $51 = Effect_Class.liftEffect(monadEffectAff);
    return function ($52) {
        return Canceler(Data_Function["const"]($51($52)));
    };
})();
var joinFiber = function (v) {
    return $foreign.makeAff(function (k) {
        return Data_Functor.map(Effect.functorEffect)(effectCanceler)(v.join(k));
    });
};
var functorFiber = new Data_Functor.Functor(function (f) {
    return function (t) {
        return Effect_Unsafe.unsafePerformEffect(makeFiber(Data_Functor.map(functorAff)(f)(joinFiber(t))));
    };
});
var applyFiber = new Control_Apply.Apply(function () {
    return functorFiber;
}, function (t1) {
    return function (t2) {
        return Effect_Unsafe.unsafePerformEffect(makeFiber(Control_Apply.apply(applyAff)(joinFiber(t1))(joinFiber(t2))));
    };
});
var applicativeFiber = new Control_Applicative.Applicative(function () {
    return applyFiber;
}, function (a) {
    return Effect_Unsafe.unsafePerformEffect(makeFiber(Control_Applicative.pure(applicativeAff)(a)));
});
var killFiber = function (e) {
    return function (v) {
        return Control_Bind.bind(bindAff)(Effect_Class.liftEffect(monadEffectAff)(v.isSuspended))(function (v1) {
            if (v1) {
                return Effect_Class.liftEffect(monadEffectAff)(Data_Functor["void"](Effect.functorEffect)(v.kill(e, Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit)))));
            };
            return $foreign.makeAff(function (k) {
                return Data_Functor.map(Effect.functorEffect)(effectCanceler)(v.kill(e, k));
            });
        });
    };
};
var fiberCanceler = (function () {
    var $53 = Data_Function.flip(killFiber);
    return function ($54) {
        return Canceler($53($54));
    };
})();
var monadThrowAff = new Control_Monad_Error_Class.MonadThrow(function () {
    return monadAff;
}, $foreign["_throwError"]);
var monadErrorAff = new Control_Monad_Error_Class.MonadError(function () {
    return monadThrowAff;
}, $foreign["_catchError"]);
var attempt = Control_Monad_Error_Class["try"](monadErrorAff);
var runAff = function (k) {
    return function (aff) {
        return launchAff(Control_Bind.bindFlipped(bindAff)((function () {
            var $55 = Effect_Class.liftEffect(monadEffectAff);
            return function ($56) {
                return $55(k($56));
            };
        })())(Control_Monad_Error_Class["try"](monadErrorAff)(aff)));
    };
};
var runAff_ = function (k) {
    return function (aff) {
        return Data_Functor["void"](Effect.functorEffect)(runAff(k)(aff));
    };
};
var runSuspendedAff = function (k) {
    return function (aff) {
        return launchSuspendedAff(Control_Bind.bindFlipped(bindAff)((function () {
            var $57 = Effect_Class.liftEffect(monadEffectAff);
            return function ($58) {
                return $57(k($58));
            };
        })())(Control_Monad_Error_Class["try"](monadErrorAff)(aff)));
    };
};
var parallelAff = new Control_Parallel_Class.Parallel(function () {
    return applicativeParAff;
}, function () {
    return monadAff;
}, Unsafe_Coerce.unsafeCoerce, $foreign["_sequential"]);
var applicativeParAff = new Control_Applicative.Applicative(function () {
    return applyParAff;
}, (function () {
    var $59 = Control_Parallel_Class.parallel(parallelAff);
    var $60 = Control_Applicative.pure(applicativeAff);
    return function ($61) {
        return $59($60($61));
    };
})());
var monoidParAff = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupParAff(dictMonoid.Semigroup0());
    }, Control_Applicative.pure(applicativeParAff)(Data_Monoid.mempty(dictMonoid)));
};
var semigroupCanceler = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return function (err) {
            return Control_Parallel.parSequence_(parallelAff)(Data_Foldable.foldableArray)([ v(err), v1(err) ]);
        };
    };
});
var supervise = function (aff) {
    var killError = Effect_Exception.error("[Aff] Child fiber outlived parent");
    var killAll = function (err) {
        return function (sup) {
            return $foreign.makeAff(function (k) {
                return $foreign["_killAll"](err, sup.supervisor, k(Control_Applicative.pure(Data_Either.applicativeEither)(Data_Unit.unit)));
            });
        };
    };
    var acquire = function __do() {
        var v = $foreign["_makeSupervisedFiber"](ffiUtil, aff)();
        v.fiber.run();
        return v;
    };
    return $foreign.generalBracket(Effect_Class.liftEffect(monadEffectAff)(acquire))({
        killed: function (err) {
            return function (sup) {
                return Control_Parallel.parSequence_(parallelAff)(Data_Foldable.foldableArray)([ killFiber(err)(sup.fiber), killAll(err)(sup) ]);
            };
        },
        failed: Data_Function["const"](killAll(killError)),
        completed: Data_Function["const"](killAll(killError))
    })(function ($62) {
        return joinFiber((function (v) {
            return v.fiber;
        })($62));
    });
};
var monadRecAff = new Control_Monad_Rec_Class.MonadRec(function () {
    return monadAff;
}, function (k) {
    var go = function (a) {
        return Control_Bind.bind(bindAff)(k(a))(function (v) {
            if (v instanceof Control_Monad_Rec_Class.Done) {
                return Control_Applicative.pure(applicativeAff)(v.value0);
            };
            if (v instanceof Control_Monad_Rec_Class.Loop) {
                return go(v.value0);
            };
            throw new Error("Failed pattern match at Effect.Aff (line 100, column 7 - line 102, column 22): " + [ v.constructor.name ]);
        });
    };
    return go;
});
var monoidAff = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAff(dictMonoid.Semigroup0());
    }, Control_Applicative.pure(applicativeAff)(Data_Monoid.mempty(dictMonoid)));
};
var nonCanceler = Data_Function["const"](Control_Applicative.pure(applicativeAff)(Data_Unit.unit));
var monoidCanceler = new Data_Monoid.Monoid(function () {
    return semigroupCanceler;
}, nonCanceler);
var never = $foreign.makeAff(function (v) {
    return Control_Applicative.pure(Effect.applicativeEffect)(Data_Monoid.mempty(monoidCanceler));
});
var apathize = (function () {
    var $63 = Data_Functor.map(functorAff)(Data_Function["const"](Data_Unit.unit));
    return function ($64) {
        return $63(attempt($64));
    };
})();
var altParAff = new Control_Alt.Alt(function () {
    return functorParAff;
}, $foreign["_parAffAlt"]);
var altAff = new Control_Alt.Alt(function () {
    return functorAff;
}, function (a1) {
    return function (a2) {
        return Control_Monad_Error_Class.catchError(monadErrorAff)(a1)(Data_Function["const"](a2));
    };
});
var plusAff = new Control_Plus.Plus(function () {
    return altAff;
}, Control_Monad_Error_Class.throwError(monadThrowAff)(Effect_Exception.error("Always fails")));
var plusParAff = new Control_Plus.Plus(function () {
    return altParAff;
}, Control_Parallel_Class.parallel(parallelAff)(Control_Plus.empty(plusAff)));
var alternativeParAff = new Control_Alternative.Alternative(function () {
    return applicativeParAff;
}, function () {
    return plusParAff;
});
module.exports = {
    Canceler: Canceler,
    launchAff: launchAff,
    launchAff_: launchAff_,
    launchSuspendedAff: launchSuspendedAff,
    runAff: runAff,
    runAff_: runAff_,
    runSuspendedAff: runSuspendedAff,
    forkAff: forkAff,
    suspendAff: suspendAff,
    supervise: supervise,
    attempt: attempt,
    apathize: apathize,
    delay: delay,
    never: never,
    "finally": $$finally,
    invincible: invincible,
    killFiber: killFiber,
    joinFiber: joinFiber,
    cancelWith: cancelWith,
    bracket: bracket,
    nonCanceler: nonCanceler,
    effectCanceler: effectCanceler,
    fiberCanceler: fiberCanceler,
    functorAff: functorAff,
    applyAff: applyAff,
    applicativeAff: applicativeAff,
    bindAff: bindAff,
    monadAff: monadAff,
    semigroupAff: semigroupAff,
    monoidAff: monoidAff,
    altAff: altAff,
    plusAff: plusAff,
    monadRecAff: monadRecAff,
    monadThrowAff: monadThrowAff,
    monadErrorAff: monadErrorAff,
    monadEffectAff: monadEffectAff,
    lazyAff: lazyAff,
    functorParAff: functorParAff,
    applyParAff: applyParAff,
    applicativeParAff: applicativeParAff,
    semigroupParAff: semigroupParAff,
    monoidParAff: monoidParAff,
    altParAff: altParAff,
    plusParAff: plusParAff,
    alternativeParAff: alternativeParAff,
    parallelAff: parallelAff,
    functorFiber: functorFiber,
    applyFiber: applyFiber,
    applicativeFiber: applicativeFiber,
    newtypeCanceler: newtypeCanceler,
    semigroupCanceler: semigroupCanceler,
    monoidCanceler: monoidCanceler,
    makeAff: $foreign.makeAff,
    generalBracket: $foreign.generalBracket
};

},{"../Control.Alt/index.js":5,"../Control.Alternative/index.js":6,"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Lazy/index.js":18,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad.Rec.Class/index.js":26,"../Control.Monad/index.js":33,"../Control.Parallel.Class/index.js":36,"../Control.Parallel/index.js":37,"../Control.Plus/index.js":38,"../Data.Either/index.js":65,"../Data.Foldable/index.js":71,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Newtype/index.js":98,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132,"../Effect.Class/index.js":136,"../Effect.Exception/index.js":140,"../Effect.Unsafe/index.js":150,"../Effect/index.js":152,"../Partial.Unsafe/index.js":160,"../Unsafe.Coerce/index.js":172,"./foreign.js":134}],136:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Category = require("../Control.Category/index.js");
var Effect = require("../Effect/index.js");
var MonadEffect = function (Monad0, liftEffect) {
    this.Monad0 = Monad0;
    this.liftEffect = liftEffect;
};
var monadEffectEffect = new MonadEffect(function () {
    return Effect.monadEffect;
}, Control_Category.identity(Control_Category.categoryFn));
var liftEffect = function (dict) {
    return dict.liftEffect;
};
module.exports = {
    liftEffect: liftEffect,
    MonadEffect: MonadEffect,
    monadEffectEffect: monadEffectEffect
};

},{"../Control.Category/index.js":14,"../Effect/index.js":152}],137:[function(require,module,exports){
"use strict";

exports.log = function (s) {
  return function () {
    console.log(s);
    return {};
  };
};

exports.warn = function (s) {
  return function () {
    console.warn(s);
    return {};
  };
};

exports.error = function (s) {
  return function () {
    console.error(s);
    return {};
  };
};

exports.info = function (s) {
  return function () {
    console.info(s);
    return {};
  };
};

exports.time = function (s) {
  return function () {
    console.time(s);
    return {};
  };
};

exports.timeLog = function (s) {
  return function () {
    console.timeLog(s);
    return {};
  };
};

exports.timeEnd = function (s) {
  return function () {
    console.timeEnd(s);
    return {};
  };
};

exports.clear = function () {
  console.clear();
  return {};
};

},{}],138:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Show = require("../Data.Show/index.js");
var warnShow = function (dictShow) {
    return function (a) {
        return $foreign.warn(Data_Show.show(dictShow)(a));
    };
};
var logShow = function (dictShow) {
    return function (a) {
        return $foreign.log(Data_Show.show(dictShow)(a));
    };
};
var infoShow = function (dictShow) {
    return function (a) {
        return $foreign.info(Data_Show.show(dictShow)(a));
    };
};
var errorShow = function (dictShow) {
    return function (a) {
        return $foreign.error(Data_Show.show(dictShow)(a));
    };
};
module.exports = {
    logShow: logShow,
    warnShow: warnShow,
    errorShow: errorShow,
    infoShow: infoShow,
    log: $foreign.log,
    warn: $foreign.warn,
    error: $foreign.error,
    info: $foreign.info,
    time: $foreign.time,
    timeLog: $foreign.timeLog,
    timeEnd: $foreign.timeEnd,
    clear: $foreign.clear
};

},{"../Data.Show/index.js":117,"./foreign.js":137}],139:[function(require,module,exports){
"use strict";

exports.showErrorImpl = function (err) {
  return err.stack || err.toString();
};

exports.error = function (msg) {
  return new Error(msg);
};

exports.message = function (e) {
  return e.message;
};

exports.name = function (e) {
  return e.name || "Error";
};

exports.stackImpl = function (just) {
  return function (nothing) {
    return function (e) {
      return e.stack ? just(e.stack) : nothing;
    };
  };
};

exports.throwException = function (e) {
  return function () {
    throw e;
  };
};

exports.catchException = function (c) {
  return function (t) {
    return function () {
      try {
        return t();
      } catch (e) {
        if (e instanceof Error || Object.prototype.toString.call(e) === "[object Error]") {
          return c(e)();
        } else {
          return c(new Error(e.toString()))();
        }
      }
    };
  };
};

},{}],140:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Show = require("../Data.Show/index.js");
var Effect = require("../Effect/index.js");
var $$try = function (action) {
    return $foreign.catchException((function () {
        var $0 = Control_Applicative.pure(Effect.applicativeEffect);
        return function ($1) {
            return $0(Data_Either.Left.create($1));
        };
    })())(Data_Functor.map(Effect.functorEffect)(Data_Either.Right.create)(action));
};
var $$throw = function ($2) {
    return $foreign.throwException($foreign.error($2));
};
var stack = $foreign.stackImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var showError = new Data_Show.Show($foreign.showErrorImpl);
module.exports = {
    stack: stack,
    "throw": $$throw,
    "try": $$try,
    showError: showError,
    error: $foreign.error,
    message: $foreign.message,
    name: $foreign.name,
    throwException: $foreign.throwException,
    catchException: $foreign.catchException
};

},{"../Control.Applicative/index.js":7,"../Data.Either/index.js":65,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Show/index.js":117,"../Effect/index.js":152,"./foreign.js":139}],141:[function(require,module,exports){
exports.undefer = function (f) {
  return f();
};

},{}],142:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Deferred = {};
module.exports = {
    Deferred: Deferred,
    undefer: $foreign.undefer
};

},{"./foreign.js":141}],143:[function(require,module,exports){
exports.thenImpl = function (promise, onFulfilled, onRejected) {
  return promise.then(onFulfilled, onRejected);
};

exports.catchImpl = function (promise, f) {
  return promise.catch(f);
};

exports.resolveImpl = function (a) {
  return Promise.resolve(a);
};

exports.rejectImpl = function (a) {
  return Promise.reject(a);
};

exports.promiseToEffectImpl = function (promise, onFulfilled, onRejected) {
  return function () {
    return promise.then(function (a) {
      return onFulfilled(a)();
    }, function (err) {
      return onRejected(err)();
    });
  };
};

exports.allImpl = function (arr) {
  return Promise.all(arr);
};

exports.raceImpl = function (arr) {
  return Promise.race(arr);
};

exports.liftEffectImpl = function (eff) {
  return new Promise(function (onSucc, onErr) {
    try {
      result = eff();
    } catch (err) {
      return onErr(err);
    }
    return onSucc(result);
  });
};

exports.promiseImpl = function (callback) {
  return new Promise(function(resolve, reject) {
    callback(function (a) {
      return function () {
        resolve(a);
      };
    }, function (err) {
      return function () {
        reject(err);
      };
    })();
  });
};

exports.delayImpl = function (a, ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms, a);
  });
};

},{}],144:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Control_Monad_Error_Class = require("../Control.Monad.Error.Class/index.js");
var Data_Array = require("../Data.Array/index.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Function_Uncurried = require("../Data.Function.Uncurried/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Unit = require("../Data.Unit/index.js");
var Effect = require("../Effect/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var Effect_Exception = require("../Effect.Exception/index.js");
var Effect_Promise_Unsafe = require("../Effect.Promise.Unsafe/index.js");
var runPromise = function (onSucc) {
    return function (onErr) {
        return function (p) {
            return $foreign.promiseToEffectImpl(Effect_Promise_Unsafe.undefer(function (dictDeferred) {
                return p(dictDeferred);
            }), onSucc, onErr);
        };
    };
};
var yoloPromise = function (dp) {
    return runPromise(Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit)))(Effect_Exception.throwException)(function (dictDeferred) {
        return dp(dictDeferred);
    });
};
var resolve = $foreign.resolveImpl;
var reject = function (dictDeferred) {
    return $foreign.rejectImpl;
};
var race = function (dictDeferred) {
    return function (dictFoldable) {
        var $37 = Data_Array.fromFoldable(dictFoldable);
        return function ($38) {
            return $foreign.raceImpl($37($38));
        };
    };
};
var promise = function (dictDeferred) {
    return function (k) {
        return $foreign.promiseImpl(Data_Function_Uncurried.mkFn2(k));
    };
};
var generalThen = function (succ) {
    return function (err) {
        return function (p) {
            return $foreign.thenImpl(p, succ, err);
        };
    };
};
var then$prime = function (dictDeferred) {
    return Data_Function.flip(generalThen)(reject(dictDeferred));
};
var then_ = function (dictDeferred) {
    return generalThen;
};
var functorPromise = function (dictDeferred) {
    return new Data_Functor.Functor((function (dictDeferred1) {
        return function (f) {
            return function (p) {
                return then$prime(dictDeferred)(function (a) {
                    return resolve(f(a));
                })(p);
            };
        };
    })(dictDeferred));
};
var delay = function (dictDeferred) {
    return Data_Function.flip(Data_Function_Uncurried.runFn2($foreign.delayImpl));
};
var catchAnything = Data_Function_Uncurried.runFn2($foreign.catchImpl);
var $$catch = function (dictDeferred) {
    return catchAnything;
};
var attempt = function (dictDeferred) {
    return function (p) {
        return then_(dictDeferred)(function (a) {
            return resolve(new Data_Either.Right(a));
        })(function (err) {
            return resolve(new Data_Either.Left(err));
        })(p);
    };
};
var applyPromise = function (dictDeferred) {
    return new Control_Apply.Apply(function () {
        return functorPromise(dictDeferred);
    }, (function (dictDeferred1) {
        return function (pf) {
            return function (pa) {
                return then$prime(dictDeferred)(function (f) {
                    return then$prime(dictDeferred)(function (a) {
                        return resolve(f(a));
                    })(pa);
                })(pf);
            };
        };
    })(dictDeferred));
};
var bindPromise = function (dictDeferred) {
    return new Control_Bind.Bind(function () {
        return applyPromise(dictDeferred);
    }, (function (dictDeferred1) {
        return Data_Function.flip(then$prime(dictDeferred));
    })(dictDeferred));
};
var semigroupPromise = function (dictDeferred) {
    return function (dictSemigroup) {
        return new Data_Semigroup.Semigroup((function (dictDeferred1) {
            return function (dictSemigroup1) {
                return function (a) {
                    return function (b) {
                        return Control_Apply.apply(applyPromise(dictDeferred))(Data_Functor.map(functorPromise(dictDeferred))(Data_Semigroup.append(dictSemigroup1))(a))(b);
                    };
                };
            };
        })(dictDeferred)(dictSemigroup));
    };
};
var monoidPromise = function (dictDeferred) {
    return function (dictMonoid) {
        return new Data_Monoid.Monoid(function () {
            return semigroupPromise(dictDeferred)(dictMonoid.Semigroup0());
        }, (function (dictDeferred1) {
            return function (dictMonoid1) {
                return resolve(Data_Monoid.mempty(dictMonoid1));
            };
        })(dictDeferred)(dictMonoid));
    };
};
var applicativePromise = function (dictDeferred) {
    return new Control_Applicative.Applicative(function () {
        return applyPromise(dictDeferred);
    }, resolve);
};
var monadPromise = function (dictDeferred) {
    return new Control_Monad.Monad(function () {
        return applicativePromise(dictDeferred);
    }, function () {
        return bindPromise(dictDeferred);
    });
};
var monadEffectPromise = function (dictDeferred) {
    return new Effect_Class.MonadEffect(function () {
        return monadPromise(dictDeferred);
    }, (function (dictDeferred1) {
        return $foreign.liftEffectImpl;
    })(dictDeferred));
};
var monadThrowPromise = function (dictDeferred) {
    return new Control_Monad_Error_Class.MonadThrow(function () {
        return monadPromise(dictDeferred);
    }, (function (dictDeferred1) {
        return reject(dictDeferred);
    })(dictDeferred));
};
var monadErrorPromise = function (dictDeferred) {
    return new Control_Monad_Error_Class.MonadError(function () {
        return monadThrowPromise(dictDeferred);
    }, (function (dictDeferred1) {
        return $$catch(dictDeferred);
    })(dictDeferred));
};
var apathize = function (dictDeferred) {
    return function (p) {
        return Data_Functor.map(functorPromise(dictDeferred))(Data_Function["const"](Data_Unit.unit))(attempt(dictDeferred)(p));
    };
};
var all = function (dictDeferred) {
    return function (dictFoldable) {
        return function (dictUnfoldable) {
            var $39 = Data_Functor.map(functorPromise(dictDeferred))(Data_Array.toUnfoldable(dictUnfoldable));
            var $40 = Data_Array.fromFoldable(dictFoldable);
            return function ($41) {
                return $39($foreign.allImpl($40($41)));
            };
        };
    };
};
module.exports = {
    promise: promise,
    then_: then_,
    "then'": then$prime,
    resolve: resolve,
    "catch": $$catch,
    reject: reject,
    race: race,
    attempt: attempt,
    apathize: apathize,
    all: all,
    delay: delay,
    runPromise: runPromise,
    functorPromise: functorPromise,
    applyPromise: applyPromise,
    applicativePromise: applicativePromise,
    bindPromise: bindPromise,
    monadPromise: monadPromise,
    monadThrowPromise: monadThrowPromise,
    monadErrorPromise: monadErrorPromise,
    semigroupPromise: semigroupPromise,
    monoidPromise: monoidPromise,
    monadEffectPromise: monadEffectPromise
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad.Error.Class/index.js":21,"../Control.Monad/index.js":33,"../Data.Array/index.js":44,"../Data.Either/index.js":65,"../Data.Function.Uncurried/index.js":74,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Semigroup/index.js":113,"../Data.Unit/index.js":132,"../Effect.Class/index.js":136,"../Effect.Exception/index.js":140,"../Effect.Promise.Unsafe/index.js":142,"../Effect/index.js":152,"./foreign.js":143}],145:[function(require,module,exports){
"use strict";

exports.new = function (val) {
  return function () {
    return { value: val };
  };
};

exports.read = function (ref) {
  return function () {
    return ref.value;
  };
};

exports["modify'"] = function (f) {
  return function (ref) {
    return function () {
      var t = f(ref.value);
      ref.value = t.state;
      return t.value;
    };
  };
};

exports.write = function (val) {
  return function (ref) {
    return function () {
      ref.value = val;
      return {};
    };
  };
};

},{}],146:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Functor = require("../Data.Functor/index.js");
var Effect = require("../Effect/index.js");
var modify = function (f) {
    return $foreign["modify'"](function (s) {
        var s$prime = f(s);
        return {
            state: s$prime,
            value: s$prime
        };
    });
};
var modify_ = function (f) {
    return function (s) {
        return Data_Functor["void"](Effect.functorEffect)(modify(f)(s));
    };
};
module.exports = {
    modify: modify,
    modify_: modify_,
    "new": $foreign["new"],
    read: $foreign.read,
    "modify'": $foreign["modify'"],
    write: $foreign.write
};

},{"../Data.Functor/index.js":80,"../Effect/index.js":152,"./foreign.js":145}],147:[function(require,module,exports){
"use strict";

exports.mkEffectFn1 = function mkEffectFn1(fn) {
  return function(x) {
    return fn(x)();
  };
};

exports.mkEffectFn2 = function mkEffectFn2(fn) {
  return function(a, b) {
    return fn(a)(b)();
  };
};

exports.mkEffectFn3 = function mkEffectFn3(fn) {
  return function(a, b, c) {
    return fn(a)(b)(c)();
  };
};

exports.mkEffectFn4 = function mkEffectFn4(fn) {
  return function(a, b, c, d) {
    return fn(a)(b)(c)(d)();
  };
};

exports.mkEffectFn5 = function mkEffectFn5(fn) {
  return function(a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e)();
  };
};

exports.mkEffectFn6 = function mkEffectFn6(fn) {
  return function(a, b, c, d, e, f) {
    return fn(a)(b)(c)(d)(e)(f)();
  };
};

exports.mkEffectFn7 = function mkEffectFn7(fn) {
  return function(a, b, c, d, e, f, g) {
    return fn(a)(b)(c)(d)(e)(f)(g)();
  };
};

exports.mkEffectFn8 = function mkEffectFn8(fn) {
  return function(a, b, c, d, e, f, g, h) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)();
  };
};

exports.mkEffectFn9 = function mkEffectFn9(fn) {
  return function(a, b, c, d, e, f, g, h, i) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)();
  };
};

exports.mkEffectFn10 = function mkEffectFn10(fn) {
  return function(a, b, c, d, e, f, g, h, i, j) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)();
  };
};

exports.runEffectFn1 = function runEffectFn1(fn) {
  return function(a) {
    return function() {
      return fn(a);
    };
  };
};

exports.runEffectFn2 = function runEffectFn2(fn) {
  return function(a) {
    return function(b) {
      return function() {
        return fn(a, b);
      };
    };
  };
};

exports.runEffectFn3 = function runEffectFn3(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function() {
          return fn(a, b, c);
        };
      };
    };
  };
};

exports.runEffectFn4 = function runEffectFn4(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function() {
            return fn(a, b, c, d);
          };
        };
      };
    };
  };
};

exports.runEffectFn5 = function runEffectFn5(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function() {
              return fn(a, b, c, d, e);
            };
          };
        };
      };
    };
  };
};

exports.runEffectFn6 = function runEffectFn6(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function() {
                return fn(a, b, c, d, e, f);
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffectFn7 = function runEffectFn7(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function() {
                  return fn(a, b, c, d, e, f, g);
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffectFn8 = function runEffectFn8(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function() {
                    return fn(a, b, c, d, e, f, g, h);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffectFn9 = function runEffectFn9(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function(i) {
                    return function() {
                      return fn(a, b, c, d, e, f, g, h, i);
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffectFn10 = function runEffectFn10(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function(i) {
                    return function(j) {
                      return function() {
                        return fn(a, b, c, d, e, f, g, h, i, j);
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

},{}],148:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    mkEffectFn1: $foreign.mkEffectFn1,
    mkEffectFn2: $foreign.mkEffectFn2,
    mkEffectFn3: $foreign.mkEffectFn3,
    mkEffectFn4: $foreign.mkEffectFn4,
    mkEffectFn5: $foreign.mkEffectFn5,
    mkEffectFn6: $foreign.mkEffectFn6,
    mkEffectFn7: $foreign.mkEffectFn7,
    mkEffectFn8: $foreign.mkEffectFn8,
    mkEffectFn9: $foreign.mkEffectFn9,
    mkEffectFn10: $foreign.mkEffectFn10,
    runEffectFn1: $foreign.runEffectFn1,
    runEffectFn2: $foreign.runEffectFn2,
    runEffectFn3: $foreign.runEffectFn3,
    runEffectFn4: $foreign.runEffectFn4,
    runEffectFn5: $foreign.runEffectFn5,
    runEffectFn6: $foreign.runEffectFn6,
    runEffectFn7: $foreign.runEffectFn7,
    runEffectFn8: $foreign.runEffectFn8,
    runEffectFn9: $foreign.runEffectFn9,
    runEffectFn10: $foreign.runEffectFn10
};

},{"./foreign.js":147}],149:[function(require,module,exports){
"use strict";

exports.unsafePerformEffect = function (f) {
  return f();
};

},{}],150:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    unsafePerformEffect: $foreign.unsafePerformEffect
};

},{"./foreign.js":149}],151:[function(require,module,exports){
"use strict";

exports.pureE = function (a) {
  return function () {
    return a;
  };
};

exports.bindE = function (a) {
  return function (f) {
    return function () {
      return f(a())();
    };
  };
};

exports.untilE = function (f) {
  return function () {
    while (!f());
    return {};
  };
};

exports.whileE = function (f) {
  return function (a) {
    return function () {
      while (f()) {
        a();
      }
      return {};
    };
  };
};

exports.forE = function (lo) {
  return function (hi) {
    return function (f) {
      return function () {
        for (var i = lo; i < hi; i++) {
          f(i)();
        }
      };
    };
  };
};

exports.foreachE = function (as) {
  return function (f) {
    return function () {
      for (var i = 0, l = as.length; i < l; i++) {
        f(as[i])();
      }
    };
  };
};

},{}],152:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Monoid = require("../Data.Monoid/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var monadEffect = new Control_Monad.Monad(function () {
    return applicativeEffect;
}, function () {
    return bindEffect;
});
var bindEffect = new Control_Bind.Bind(function () {
    return applyEffect;
}, $foreign.bindE);
var applyEffect = new Control_Apply.Apply(function () {
    return functorEffect;
}, Control_Monad.ap(monadEffect));
var applicativeEffect = new Control_Applicative.Applicative(function () {
    return applyEffect;
}, $foreign.pureE);
var functorEffect = new Data_Functor.Functor(Control_Applicative.liftA1(applicativeEffect));
var semigroupEffect = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyEffect)(Data_Semigroup.append(dictSemigroup)));
};
var monoidEffect = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupEffect(dictMonoid.Semigroup0());
    }, $foreign.pureE(Data_Monoid.mempty(dictMonoid)));
};
module.exports = {
    functorEffect: functorEffect,
    applyEffect: applyEffect,
    applicativeEffect: applicativeEffect,
    bindEffect: bindEffect,
    monadEffect: monadEffect,
    semigroupEffect: semigroupEffect,
    monoidEffect: monoidEffect,
    untilE: $foreign.untilE,
    whileE: $foreign.whileE,
    forE: $foreign.forE,
    foreachE: $foreign.foreachE
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.Functor/index.js":80,"../Data.Monoid/index.js":97,"../Data.Semigroup/index.js":113,"./foreign.js":151}],153:[function(require,module,exports){
/* globals exports */
"use strict";

exports.nan = NaN;

exports.isNaN = isNaN;

exports.infinity = Infinity;

exports.isFinite = isFinite;

exports.readInt = function (radix) {
  return function (n) {
    return parseInt(n, radix);
  };
};

exports.readFloat = parseFloat;

var formatNumber = function (format) {
  return function (fail, succ, digits, n) {
    try {
      return succ(n[format](digits));
    }
    catch (e) {
      return fail(e.message);
    }
  };
};

exports._toFixed = formatNumber("toFixed");
exports._toExponential = formatNumber("toExponential");
exports._toPrecision = formatNumber("toPrecision");

var encdecURI = function (encdec) {
  return function (fail, succ, s) {
    try {
      return succ(encdec(s));
    }
    catch (e) {
      return fail(e.message);
    }
  };
};

exports._decodeURI = encdecURI(decodeURI);
exports._encodeURI = encdecURI(encodeURI);
exports._decodeURIComponent = encdecURI(decodeURIComponent);
exports._encodeURIComponent = encdecURI(encodeURIComponent);

},{}],154:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var toPrecision = function (digits) {
    return function (n) {
        return $foreign["_toPrecision"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, digits, n);
    };
};
var toFixed = function (digits) {
    return function (n) {
        return $foreign["_toFixed"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, digits, n);
    };
};
var toExponential = function (digits) {
    return function (n) {
        return $foreign["_toExponential"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, digits, n);
    };
};
var $$encodeURIComponent = function (s) {
    return $foreign["_encodeURIComponent"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, s);
};
var $$encodeURI = function (s) {
    return $foreign["_encodeURI"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, s);
};
var $$decodeURIComponent = function (s) {
    return $foreign["_decodeURIComponent"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, s);
};
var $$decodeURI = function (s) {
    return $foreign["_decodeURI"](Data_Function["const"](Data_Maybe.Nothing.value), Data_Maybe.Just.create, s);
};
module.exports = {
    toFixed: toFixed,
    toExponential: toExponential,
    toPrecision: toPrecision,
    "decodeURI": $$decodeURI,
    "encodeURI": $$encodeURI,
    "decodeURIComponent": $$decodeURIComponent,
    "encodeURIComponent": $$encodeURIComponent,
    nan: $foreign.nan,
    "isNaN": $foreign["isNaN"],
    infinity: $foreign.infinity,
    "isFinite": $foreign["isFinite"],
    readInt: $foreign.readInt,
    readFloat: $foreign.readFloat
};

},{"../Data.Function/index.js":75,"../Data.Maybe/index.js":90,"./foreign.js":153}],155:[function(require,module,exports){
"use strict";

exports.addToWindow = function addToWindow (params) {
    window.exportFileBase64 = params.exportFileBase64;
    window.exportFileURL = params.exportFileURL;
    window.importFile = params.importFile;
};

},{}],156:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Show = require("../Data.Show/index.js");
var Effect_Aff = require("../Effect.Aff/index.js");
var Effect_Console = require("../Effect.Console/index.js");
var Effect_Exception = require("../Effect.Exception/index.js");
var Effect_Promise = require("../Effect.Promise/index.js");
var Effect_Promise_Unsafe = require("../Effect.Promise.Unsafe/index.js");
var Effect_Uncurried = require("../Effect.Uncurried/index.js");
var Web_File_Store = require("../Web.File.Store/index.js");
var Web_File_Url = require("../Web.File.Url/index.js");
var importFile = function (id) {
    var go = function (dictDeferred) {
        return Effect_Promise.promise(dictDeferred)(function (ok) {
            return function (err) {
                return function __do() {
                    var v = Web_File_Store.getFile(id)();
                    if (v instanceof Data_Maybe.Nothing) {
                        return Effect_Exception["throw"]("Can't find element id " + Data_Show.show(Data_Show.showString)(id))();
                    };
                    if (v instanceof Data_Maybe.Just) {
                        var resolve = function (eErr) {
                            if (eErr instanceof Data_Either.Left) {
                                return err(eErr.value0);
                            };
                            if (eErr instanceof Data_Either.Right) {
                                return ok(eErr.value0);
                            };
                            throw new Error("Failed pattern match at Main (line 45, column 32 - line 47, column 34): " + [ eErr.constructor.name ]);
                        };
                        return Effect_Aff.runAff_(resolve)(Web_File_Store.fileToArrayBuffer(v.value0))();
                    };
                    throw new Error("Failed pattern match at Main (line 42, column 9 - line 48, column 57): " + [ v.constructor.name ]);
                };
            };
        });
    };
    return Effect_Promise_Unsafe.undefer(function (dictDeferred) {
        return go(dictDeferred);
    });
};
var exportFileURL = function ($9) {
    return Web_File_Url.createObjectURL(Web_File_Store.arrayBufferToBlob($9))();
};
var exportFileBase64 = Effect_Uncurried.mkEffectFn1(Web_File_Store.makeBase64Href);
var main = function __do() {
    Effect_Console.log("Hello sailor!")();
    return $foreign.addToWindow({
        exportFileBase64: exportFileBase64,
        exportFileURL: exportFileURL,
        importFile: importFile
    });
};
module.exports = {
    main: main,
    exportFileBase64: exportFileBase64,
    exportFileURL: exportFileURL,
    importFile: importFile
};

},{"../Data.Either/index.js":65,"../Data.Maybe/index.js":90,"../Data.Show/index.js":117,"../Effect.Aff/index.js":135,"../Effect.Console/index.js":138,"../Effect.Exception/index.js":140,"../Effect.Promise.Unsafe/index.js":142,"../Effect.Promise/index.js":144,"../Effect.Uncurried/index.js":148,"../Web.File.Store/index.js":183,"../Web.File.Url/index.js":185,"./foreign.js":155}],157:[function(require,module,exports){
"use strict";

// module Math

exports.abs = Math.abs;

exports.acos = Math.acos;

exports.asin = Math.asin;

exports.atan = Math.atan;

exports.atan2 = function (y) {
  return function (x) {
    return Math.atan2(y, x);
  };
};

exports.ceil = Math.ceil;

exports.cos = Math.cos;

exports.exp = Math.exp;

exports.floor = Math.floor;

exports.trunc = Math.trunc || function (n) {
  return n < 0 ? Math.ceil(n) : Math.floor(n);
};

exports.log = Math.log;

exports.max = function (n1) {
  return function (n2) {
    return Math.max(n1, n2);
  };
};

exports.min = function (n1) {
  return function (n2) {
    return Math.min(n1, n2);
  };
};

exports.pow = function (n) {
  return function (p) {
    return Math.pow(n, p);
  };
};

exports.remainder = function (n) {
  return function (m) {
    return n % m;
  };
};

exports.round = Math.round;

exports.sin = Math.sin;

exports.sqrt = Math.sqrt;

exports.tan = Math.tan;

exports.e = Math.E;

exports.ln2 = Math.LN2;

exports.ln10 = Math.LN10;

exports.log2e = Math.LOG2E;

exports.log10e = Math.LOG10E;

exports.pi = Math.PI;

exports.tau = 2 * Math.PI;

exports.sqrt1_2 = Math.SQRT1_2;

exports.sqrt2 = Math.SQRT2;

},{}],158:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    abs: $foreign.abs,
    acos: $foreign.acos,
    asin: $foreign.asin,
    atan: $foreign.atan,
    atan2: $foreign.atan2,
    ceil: $foreign.ceil,
    cos: $foreign.cos,
    exp: $foreign.exp,
    floor: $foreign.floor,
    log: $foreign.log,
    max: $foreign.max,
    min: $foreign.min,
    pow: $foreign.pow,
    round: $foreign.round,
    sin: $foreign.sin,
    sqrt: $foreign.sqrt,
    tan: $foreign.tan,
    trunc: $foreign.trunc,
    remainder: $foreign.remainder,
    e: $foreign.e,
    ln2: $foreign.ln2,
    ln10: $foreign.ln10,
    log2e: $foreign.log2e,
    log10e: $foreign.log10e,
    pi: $foreign.pi,
    tau: $foreign.tau,
    sqrt1_2: $foreign.sqrt1_2,
    sqrt2: $foreign.sqrt2
};

},{"./foreign.js":157}],159:[function(require,module,exports){
"use strict";

// module Partial.Unsafe

exports.unsafePartial = function (f) {
  return f();
};

},{}],160:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Partial = require("../Partial/index.js");
var unsafePartialBecause = function (v) {
    return function (x) {
        return $foreign.unsafePartial(function (dictPartial) {
            return x(dictPartial);
        });
    };
};
var unsafeCrashWith = function (msg) {
    return $foreign.unsafePartial(function (dictPartial) {
        return Partial.crashWith(dictPartial)(msg);
    });
};
module.exports = {
    unsafePartialBecause: unsafePartialBecause,
    unsafeCrashWith: unsafeCrashWith,
    unsafePartial: $foreign.unsafePartial
};

},{"../Partial/index.js":162,"./foreign.js":159}],161:[function(require,module,exports){
"use strict";

// module Partial

exports.crashWith = function () {
  return function (msg) {
    throw new Error(msg);
  };
};

},{}],162:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var crash = function (dictPartial) {
    return $foreign.crashWith(dictPartial)("Partial.crash: partial function");
};
module.exports = {
    crash: crash,
    crashWith: $foreign.crashWith
};

},{"./foreign.js":161}],163:[function(require,module,exports){
"use strict";

exports.unsafeHas = function (label) {
  return function (rec) {
    return {}.hasOwnProperty.call(rec, label);
  };
};

exports.unsafeGet = function (label) {
  return function (rec) {
    return rec[label];
  };
};

exports.unsafeSet = function (label) {
  return function (value) {
    return function (rec) {
      var copy = {};
      for (var key in rec) {
        if ({}.hasOwnProperty.call(rec, key)) {
          copy[key] = rec[key];
        }
      }
      copy[label] = value;
      return copy;
    };
  };
};

exports.unsafeDelete = function (label) {
  return function (rec) {
    var copy = {};
    for (var key in rec) {
      if (key !== label && {}.hasOwnProperty.call(rec, key)) {
        copy[key] = rec[key];
      }
    }
    return copy;
  };
};

},{}],164:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    unsafeHas: $foreign.unsafeHas,
    unsafeGet: $foreign.unsafeGet,
    unsafeSet: $foreign.unsafeSet,
    unsafeDelete: $foreign.unsafeDelete
};

},{"./foreign.js":163}],165:[function(require,module,exports){
"use strict";


exports.newResponseImpl = function newResponseImpl (b) {
    return new Response(b);
};

exports.getArrayBufferImpl = function getArrayBufferImpl (r) {
    return r.arrayBuffer();
};

},{}],166:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Either = require("../Data.Either/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Effect = require("../Effect/index.js");
var Effect_Aff = require("../Effect.Aff/index.js");
var Effect_Promise = require("../Effect.Promise/index.js");
var Effect_Uncurried = require("../Effect.Uncurried/index.js");
var newResponse = Effect_Uncurried.runEffectFn1($foreign.newResponseImpl);
var getArrayBuffer = function (r) {
    return Effect_Aff.makeAff(function (resolve) {
        return Data_Functor.voidRight(Effect.functorEffect)(Effect_Aff.nonCanceler)(Effect_Promise.runPromise(function ($1) {
            return resolve(Data_Either.Right.create($1));
        })(function ($2) {
            return resolve(Data_Either.Left.create($2));
        })(function (dictDeferred) {
            return $foreign.getArrayBufferImpl(r);
        }));
    });
};
module.exports = {
    newResponse: newResponse,
    getArrayBuffer: getArrayBuffer
};

},{"../Data.Either/index.js":65,"../Data.Functor/index.js":80,"../Effect.Aff/index.js":135,"../Effect.Promise/index.js":144,"../Effect.Uncurried/index.js":148,"../Effect/index.js":152,"./foreign.js":165}],167:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var RProxy = (function () {
    function RProxy() {

    };
    RProxy.value = new RProxy();
    return RProxy;
})();
module.exports = {
    RProxy: RProxy
};

},{}],168:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var RLProxy = (function () {
    function RLProxy() {

    };
    RLProxy.value = new RLProxy();
    return RLProxy;
})();
module.exports = {
    RLProxy: RLProxy
};

},{}],169:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var TypeEquals = function (from, to) {
    this.from = from;
    this.to = to;
};
var to = function (dict) {
    return dict.to;
};
var refl = new TypeEquals(function (a) {
    return a;
}, function (a) {
    return a;
});
var from = function (dict) {
    return dict.from;
};
module.exports = {
    TypeEquals: TypeEquals,
    to: to,
    from: from,
    refl: refl
};

},{}],170:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Applicative = require("../Control.Applicative/index.js");
var Control_Apply = require("../Control.Apply/index.js");
var Control_Bind = require("../Control.Bind/index.js");
var Control_Monad = require("../Control.Monad/index.js");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra/index.js");
var Data_Bounded = require("../Data.Bounded/index.js");
var Data_CommutativeRing = require("../Data.CommutativeRing/index.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Ring = require("../Data.Ring/index.js");
var Data_Semigroup = require("../Data.Semigroup/index.js");
var Data_Semiring = require("../Data.Semiring/index.js");
var Data_Show = require("../Data.Show/index.js");
var Proxy3 = (function () {
    function Proxy3() {

    };
    Proxy3.value = new Proxy3();
    return Proxy3;
})();
var Proxy2 = (function () {
    function Proxy2() {

    };
    Proxy2.value = new Proxy2();
    return Proxy2;
})();
var $$Proxy = (function () {
    function $$Proxy() {

    };
    $$Proxy.value = new $$Proxy();
    return $$Proxy;
})();
var showProxy3 = new Data_Show.Show(function (v) {
    return "Proxy3";
});
var showProxy2 = new Data_Show.Show(function (v) {
    return "Proxy2";
});
var showProxy = new Data_Show.Show(function (v) {
    return "Proxy";
});
var semiringProxy3 = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, Proxy3.value, Proxy3.value);
var semiringProxy2 = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, Proxy2.value, Proxy2.value);
var semiringProxy = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, $$Proxy.value, $$Proxy.value);
var semigroupProxy3 = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
});
var semigroupProxy2 = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
});
var semigroupProxy = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var ringProxy3 = new Data_Ring.Ring(function () {
    return semiringProxy3;
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
});
var ringProxy2 = new Data_Ring.Ring(function () {
    return semiringProxy2;
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
});
var ringProxy = new Data_Ring.Ring(function () {
    return semiringProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var heytingAlgebraProxy3 = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, Proxy3.value, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return Proxy3.value;
}, Proxy3.value);
var heytingAlgebraProxy2 = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, Proxy2.value, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return Proxy2.value;
}, Proxy2.value);
var heytingAlgebraProxy = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, $$Proxy.value, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return $$Proxy.value;
}, $$Proxy.value);
var functorProxy = new Data_Functor.Functor(function (f) {
    return function (m) {
        return $$Proxy.value;
    };
});
var eqProxy3 = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy3 = new Data_Ord.Ord(function () {
    return eqProxy3;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var eqProxy2 = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy2 = new Data_Ord.Ord(function () {
    return eqProxy2;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var eqProxy = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy = new Data_Ord.Ord(function () {
    return eqProxy;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var discardProxy3 = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var discardProxy2 = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var discardProxy = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var commutativeRingProxy3 = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy3;
});
var commutativeRingProxy2 = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy2;
});
var commutativeRingProxy = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy;
});
var boundedProxy3 = new Data_Bounded.Bounded(function () {
    return ordProxy3;
}, Proxy3.value, Proxy3.value);
var boundedProxy2 = new Data_Bounded.Bounded(function () {
    return ordProxy2;
}, Proxy2.value, Proxy2.value);
var boundedProxy = new Data_Bounded.Bounded(function () {
    return ordProxy;
}, $$Proxy.value, $$Proxy.value);
var booleanAlgebraProxy3 = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy3;
});
var booleanAlgebraProxy2 = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy2;
});
var booleanAlgebraProxy = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy;
});
var applyProxy = new Control_Apply.Apply(function () {
    return functorProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var bindProxy = new Control_Bind.Bind(function () {
    return applyProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var applicativeProxy = new Control_Applicative.Applicative(function () {
    return applyProxy;
}, function (v) {
    return $$Proxy.value;
});
var monadProxy = new Control_Monad.Monad(function () {
    return applicativeProxy;
}, function () {
    return bindProxy;
});
module.exports = {
    "Proxy": $$Proxy,
    Proxy2: Proxy2,
    Proxy3: Proxy3,
    eqProxy: eqProxy,
    functorProxy: functorProxy,
    ordProxy: ordProxy,
    applicativeProxy: applicativeProxy,
    applyProxy: applyProxy,
    bindProxy: bindProxy,
    booleanAlgebraProxy: booleanAlgebraProxy,
    boundedProxy: boundedProxy,
    commutativeRingProxy: commutativeRingProxy,
    discardProxy: discardProxy,
    heytingAlgebraProxy: heytingAlgebraProxy,
    monadProxy: monadProxy,
    ringProxy: ringProxy,
    semigroupProxy: semigroupProxy,
    semiringProxy: semiringProxy,
    showProxy: showProxy,
    eqProxy2: eqProxy2,
    ordProxy2: ordProxy2,
    booleanAlgebraProxy2: booleanAlgebraProxy2,
    boundedProxy2: boundedProxy2,
    commutativeRingProxy2: commutativeRingProxy2,
    discardProxy2: discardProxy2,
    heytingAlgebraProxy2: heytingAlgebraProxy2,
    ringProxy2: ringProxy2,
    semigroupProxy2: semigroupProxy2,
    semiringProxy2: semiringProxy2,
    showProxy2: showProxy2,
    eqProxy3: eqProxy3,
    ordProxy3: ordProxy3,
    booleanAlgebraProxy3: booleanAlgebraProxy3,
    boundedProxy3: boundedProxy3,
    commutativeRingProxy3: commutativeRingProxy3,
    discardProxy3: discardProxy3,
    heytingAlgebraProxy3: heytingAlgebraProxy3,
    ringProxy3: ringProxy3,
    semigroupProxy3: semigroupProxy3,
    semiringProxy3: semiringProxy3,
    showProxy3: showProxy3
};

},{"../Control.Applicative/index.js":7,"../Control.Apply/index.js":9,"../Control.Bind/index.js":13,"../Control.Monad/index.js":33,"../Data.BooleanAlgebra/index.js":59,"../Data.Bounded/index.js":61,"../Data.CommutativeRing/index.js":62,"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.HeytingAlgebra/index.js":84,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Ring/index.js":107,"../Data.Semigroup/index.js":113,"../Data.Semiring/index.js":115,"../Data.Show/index.js":117}],171:[function(require,module,exports){
"use strict";

// module Unsafe.Coerce

exports.unsafeCoerce = function (x) {
  return x;
};

},{}],172:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    unsafeCoerce: $foreign.unsafeCoerce
};

},{"./foreign.js":171}],173:[function(require,module,exports){
"use strict";

var getEffProp = function (name) {
  return function (doc) {
    return function () {
      return doc[name];
    };
  };
};

exports.url = getEffProp("URL");
exports.documentURI = getEffProp("documentURI");
exports.origin = getEffProp("origin");
exports.compatMode = getEffProp("compatMode");
exports.characterSet = getEffProp("characterSet");
exports.contentType = getEffProp("contentType");

exports._doctype = getEffProp("doctype");
exports._documentElement = getEffProp("documentElement");

exports.getElementsByTagName = function (localName) {
  return function (doc) {
    return function () {
      return doc.getElementsByTagName(localName);
    };
  };
};

exports._getElementsByTagNameNS = function (ns) {
  return function (localName) {
    return function (doc) {
      return function () {
        return doc.getElementsByTagNameNS(ns, localName);
      };
    };
  };
};

exports.getElementsByClassName = function (classNames) {
  return function (doc) {
    return function () {
      return doc.getElementsByClassName(classNames);
    };
  };
};

exports.createElement = function (localName) {
  return function (doc) {
    return function () {
      return doc.createElement(localName);
    };
  };
};

exports._createElementNS = function (ns) {
  return function (qualifiedName) {
    return function (doc) {
      return function () {
        return doc.createElementNS(ns, qualifiedName);
      };
    };
  };
};

exports.createDocumentFragment = function (doc) {
  return function () {
    return doc.createDocumentFragment();
  };
};

exports.createTextNode = function (data) {
  return function (doc) {
    return function () {
      return doc.createTextNode(data);
    };
  };
};

exports.createComment = function (data) {
  return function (doc) {
    return function () {
      return doc.createComment(data);
    };
  };
};

exports.createProcessingInstruction = function (target) {
  return function (data) {
    return function (doc) {
      return function () {
        return doc.createProcessingInstruction(target, data);
      };
    };
  };
};

exports.importNode = function (node) {
  return function (deep) {
    return function (doc) {
      return function () {
        return doc.importNode(node, deep);
      };
    };
  };
};

exports.adoptNode = function (node) {
  return function (doc) {
    return function () {
      return doc.adoptNode(node);
    };
  };
};

},{}],174:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Effect = require("../Effect/index.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var Web_Internal_FFI = require("../Web.Internal.FFI/index.js");
var toParentNode = Unsafe_Coerce.unsafeCoerce;
var toNonElementParentNode = Unsafe_Coerce.unsafeCoerce;
var toNode = Unsafe_Coerce.unsafeCoerce;
var toEventTarget = Unsafe_Coerce.unsafeCoerce;
var getElementsByTagNameNS = function ($0) {
    return $foreign["_getElementsByTagNameNS"](Data_Nullable.toNullable($0));
};
var fromParentNode = Web_Internal_FFI.unsafeReadProtoTagged("Document");
var fromNonElementParentNode = Web_Internal_FFI.unsafeReadProtoTagged("Document");
var fromNode = Web_Internal_FFI.unsafeReadProtoTagged("Document");
var fromEventTarget = Web_Internal_FFI.unsafeReadProtoTagged("Document");
var documentElement = (function () {
    var $1 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($2) {
        return $1($foreign["_documentElement"]($2));
    };
})();
var doctype = (function () {
    var $3 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($4) {
        return $3($foreign["_doctype"]($4));
    };
})();
var createElementNS = function ($5) {
    return $foreign["_createElementNS"](Data_Nullable.toNullable($5));
};
module.exports = {
    fromNode: fromNode,
    fromParentNode: fromParentNode,
    fromNonElementParentNode: fromNonElementParentNode,
    fromEventTarget: fromEventTarget,
    toNode: toNode,
    toParentNode: toParentNode,
    toNonElementParentNode: toNonElementParentNode,
    toEventTarget: toEventTarget,
    doctype: doctype,
    documentElement: documentElement,
    getElementsByTagNameNS: getElementsByTagNameNS,
    createElementNS: createElementNS,
    url: $foreign.url,
    documentURI: $foreign.documentURI,
    origin: $foreign.origin,
    compatMode: $foreign.compatMode,
    characterSet: $foreign.characterSet,
    contentType: $foreign.contentType,
    getElementsByTagName: $foreign.getElementsByTagName,
    getElementsByClassName: $foreign.getElementsByClassName,
    createElement: $foreign.createElement,
    createDocumentFragment: $foreign.createDocumentFragment,
    createTextNode: $foreign.createTextNode,
    createComment: $foreign.createComment,
    createProcessingInstruction: $foreign.createProcessingInstruction,
    importNode: $foreign.importNode,
    adoptNode: $foreign.adoptNode
};

},{"../Data.Functor/index.js":80,"../Data.Nullable/index.js":100,"../Effect/index.js":152,"../Unsafe.Coerce/index.js":172,"../Web.Internal.FFI/index.js":194,"./foreign.js":173}],175:[function(require,module,exports){
"use strict";

exports._getElementById = function (id) {
  return function (node) {
    return function () {
      return node.getElementById(id);
    };
  };
};

},{}],176:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Effect = require("../Effect/index.js");
var getElementById = function (eid) {
    var $0 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    var $1 = $foreign["_getElementById"](eid);
    return function ($2) {
        return $0($1($2));
    };
};
module.exports = {
    getElementById: getElementById
};

},{"../Data.Functor/index.js":80,"../Data.Nullable/index.js":100,"../Effect/index.js":152,"./foreign.js":175}],177:[function(require,module,exports){
"use strict";

exports.typeImpl = function (blob) { return blob.type; };

exports.blobImpl = function (args) {
  return function (mediaType) {
    return new Blob(args, {type: mediaType});
  };
};

exports.size = function (blob) { return blob.size; };

exports.slice = function (contentType) {
  return function (start) {
    return function (end) {
      return function (blob) {
        return blob.slice(start, end, contentType);
      };
    };
  };
};

},{}],178:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Int = require("../Data.Int/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var $$Math = require("../Math/index.js");
var StartByte = function (x) {
    return x;
};
var EndByte = function (x) {
    return x;
};
var type_ = function (blob) {
    var blobType = $foreign.typeImpl(blob);
    var $0 = blobType === "";
    if ($0) {
        return Data_Maybe.Nothing.value;
    };
    return new Data_Maybe.Just(blobType);
};
var slice$prime = $foreign.slice("");
var idxFromNumber = function ($1) {
    return $$Math.round($1);
};
var idxFromInt = function ($2) {
    return Data_Int.toNumber($2);
};
var fromString = function (str) {
    return function (ct) {
        return $foreign.blobImpl([ str ])(ct);
    };
};
var fromArray = function (args) {
    return function (opts) {
        return $foreign.blobImpl(args)(opts);
    };
};
module.exports = {
    fromString: fromString,
    fromArray: fromArray,
    type_: type_,
    StartByte: StartByte,
    EndByte: EndByte,
    idxFromInt: idxFromInt,
    idxFromNumber: idxFromNumber,
    "slice'": slice$prime,
    size: $foreign.size,
    slice: $foreign.slice
};

},{"../Data.Int/index.js":87,"../Data.Maybe/index.js":90,"../Math/index.js":158,"./foreign.js":177}],179:[function(require,module,exports){
"use strict";

exports.name = function (file) { return file.name; };

exports.lastModified = function (file) { return file.lastModified; };

},{}],180:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var Web_File_Blob = require("../Web.File.Blob/index.js");
var type_ = function ($0) {
    return Web_File_Blob.type_($0);
};
var toBlob = Unsafe_Coerce.unsafeCoerce;
var size = function ($1) {
    return Web_File_Blob.size($1);
};
module.exports = {
    toBlob: toBlob,
    type_: type_,
    size: size,
    name: $foreign.name,
    lastModified: $foreign.lastModified
};

},{"../Unsafe.Coerce/index.js":172,"../Web.File.Blob/index.js":178,"./foreign.js":179}],181:[function(require,module,exports){
"use strict";

exports.length = function (fileList) { return fileList.length; };

exports._item = function (index) {
  return function (fileList) {
    return fileList.item(index);
  };
};

},{}],182:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Data_Tuple = require("../Data.Tuple/index.js");
var Data_Unfoldable = require("../Data.Unfoldable/index.js");
var item = function (i) {
    var $1 = $foreign["_item"](i);
    return function ($2) {
        return Data_Nullable.toMaybe($1($2));
    };
};
var items = function (dictUnfoldable) {
    return function (fl) {
        return Data_Unfoldable.unfoldr(dictUnfoldable)(function (i) {
            return Data_Functor.map(Data_Maybe.functorMaybe)(Data_Function.flip(Data_Tuple.Tuple.create)(i + 1 | 0))(item(i)(fl));
        })(0);
    };
};
module.exports = {
    item: item,
    items: items,
    length: $foreign.length
};

},{"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Nullable/index.js":100,"../Data.Tuple/index.js":124,"../Data.Unfoldable/index.js":128,"./foreign.js":181}],183:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Control_Bind = require("../Control.Bind/index.js");
var Data_ArrayBuffer_Base64 = require("../Data.ArrayBuffer.Base64/index.js");
var Data_ArrayBuffer_Typed = require("../Data.ArrayBuffer.Typed/index.js");
var Data_Function = require("../Data.Function/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Effect = require("../Effect/index.js");
var Effect_Aff = require("../Effect.Aff/index.js");
var Effect_Class = require("../Effect.Class/index.js");
var Stream_Response = require("../Stream.Response/index.js");
var Web_DOM_Document = require("../Web.DOM.Document/index.js");
var Web_DOM_NonElementParentNode = require("../Web.DOM.NonElementParentNode/index.js");
var Web_File_Blob = require("../Web.File.Blob/index.js");
var Web_File_File = require("../Web.File.File/index.js");
var Web_File_FileList = require("../Web.File.FileList/index.js");
var Web_HTML = require("../Web.HTML/index.js");
var Web_HTML_HTMLDocument = require("../Web.HTML.HTMLDocument/index.js");
var Web_HTML_Window = require("../Web.HTML.Window/index.js");
var makeBase64Href = function (buffer) {
    return function __do() {
        var v = Data_Functor.map(Effect.functorEffect)(Data_ArrayBuffer_Base64.encodeBase64)(Data_ArrayBuffer_Typed.whole(Data_ArrayBuffer_Typed.typedArrayUint8)(buffer))();
        return "data:application/openchronology;base64," + v;
    };
};
var getFile = function (id) {
    return function __do() {
        var v = Data_Functor.map(Effect.functorEffect)(function ($6) {
            return Web_DOM_Document.toNonElementParentNode(Web_HTML_HTMLDocument.toDocument($6));
        })(Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(Web_HTML_Window.document))();
        var go = function (el) {
            return Web_File_FileList.item(0)(el.files);
        };
        return Data_Functor.map(Effect.functorEffect)(Data_Function.flip(Control_Bind.bind(Data_Maybe.bindMaybe))(go))(Web_DOM_NonElementParentNode.getElementById(id)(v))();
    };
};
var fileToArrayBuffer = function (file) {
    var blob = Web_File_File.toBlob(file);
    return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Stream_Response.newResponse(blob)))(function (v) {
        return Stream_Response.getArrayBuffer(v);
    });
};
var arrayBufferToBlob = function (buffer) {
    return Web_File_Blob.fromArray([ buffer ])("application/octet-binary");
};
module.exports = {
    getFile: getFile,
    fileToArrayBuffer: fileToArrayBuffer,
    arrayBufferToBlob: arrayBufferToBlob,
    makeBase64Href: makeBase64Href
};

},{"../Control.Bind/index.js":13,"../Data.ArrayBuffer.Base64/index.js":46,"../Data.ArrayBuffer.Typed/index.js":48,"../Data.Function/index.js":75,"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Effect.Aff/index.js":135,"../Effect.Class/index.js":136,"../Effect/index.js":152,"../Stream.Response/index.js":166,"../Web.DOM.Document/index.js":174,"../Web.DOM.NonElementParentNode/index.js":176,"../Web.File.Blob/index.js":178,"../Web.File.File/index.js":180,"../Web.File.FileList/index.js":182,"../Web.HTML.HTMLDocument/index.js":188,"../Web.HTML.Window/index.js":190,"../Web.HTML/index.js":192}],184:[function(require,module,exports){
"use strict";

exports.createObjectURL = function (blob) {
  return function () {
    return URL.createObjectURL(blob);
  };
};

exports.revokeObjectURL = function (url) {
  return function () {
    URL.revokeObjectURL(url);
  };
};

},{}],185:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    createObjectURL: $foreign.createObjectURL,
    revokeObjectURL: $foreign.revokeObjectURL
};

},{"./foreign.js":184}],186:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var Data_Eq = require("../Data.Eq/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Data_Ordering = require("../Data.Ordering/index.js");
var Data_Show = require("../Data.Show/index.js");
var Loading = (function () {
    function Loading() {

    };
    Loading.value = new Loading();
    return Loading;
})();
var Interactive = (function () {
    function Interactive() {

    };
    Interactive.value = new Interactive();
    return Interactive;
})();
var Complete = (function () {
    function Complete() {

    };
    Complete.value = new Complete();
    return Complete;
})();
var showReadyState = new Data_Show.Show(function (v) {
    if (v instanceof Loading) {
        return "Loading";
    };
    if (v instanceof Interactive) {
        return "Interactive";
    };
    if (v instanceof Complete) {
        return "Complete";
    };
    throw new Error("Failed pattern match at Web.HTML.HTMLDocument.ReadyState (line 15, column 10 - line 18, column 27): " + [ v.constructor.name ]);
});
var print = function (v) {
    if (v instanceof Loading) {
        return "loading";
    };
    if (v instanceof Interactive) {
        return "interactive";
    };
    if (v instanceof Complete) {
        return "complete";
    };
    throw new Error("Failed pattern match at Web.HTML.HTMLDocument.ReadyState (line 21, column 9 - line 24, column 25): " + [ v.constructor.name ]);
};
var parse = function (v) {
    if (v === "loading") {
        return new Data_Maybe.Just(Loading.value);
    };
    if (v === "interactive") {
        return new Data_Maybe.Just(Interactive.value);
    };
    if (v === "complete") {
        return new Data_Maybe.Just(Complete.value);
    };
    return Data_Maybe.Nothing.value;
};
var eqReadyState = new Data_Eq.Eq(function (x) {
    return function (y) {
        if (x instanceof Loading && y instanceof Loading) {
            return true;
        };
        if (x instanceof Interactive && y instanceof Interactive) {
            return true;
        };
        if (x instanceof Complete && y instanceof Complete) {
            return true;
        };
        return false;
    };
});
var ordReadyState = new Data_Ord.Ord(function () {
    return eqReadyState;
}, function (x) {
    return function (y) {
        if (x instanceof Loading && y instanceof Loading) {
            return Data_Ordering.EQ.value;
        };
        if (x instanceof Loading) {
            return Data_Ordering.LT.value;
        };
        if (y instanceof Loading) {
            return Data_Ordering.GT.value;
        };
        if (x instanceof Interactive && y instanceof Interactive) {
            return Data_Ordering.EQ.value;
        };
        if (x instanceof Interactive) {
            return Data_Ordering.LT.value;
        };
        if (y instanceof Interactive) {
            return Data_Ordering.GT.value;
        };
        if (x instanceof Complete && y instanceof Complete) {
            return Data_Ordering.EQ.value;
        };
        throw new Error("Failed pattern match at Web.HTML.HTMLDocument.ReadyState (line 12, column 1 - line 12, column 48): " + [ x.constructor.name, y.constructor.name ]);
    };
});
module.exports = {
    Loading: Loading,
    Interactive: Interactive,
    Complete: Complete,
    print: print,
    parse: parse,
    eqReadyState: eqReadyState,
    ordReadyState: ordReadyState,
    showReadyState: showReadyState
};

},{"../Data.Eq/index.js":67,"../Data.Maybe/index.js":90,"../Data.Ord/index.js":104,"../Data.Ordering/index.js":105,"../Data.Show/index.js":117}],187:[function(require,module,exports){
"use strict";

exports._head = function (doc) {
  return function () {
    return doc.head;
  };
};

exports._body = function (doc) {
  return function () {
    return doc.body;
  };
};

exports._readyState = function (doc) {
  return function () {
    return doc.readyState;
  };
};

exports._activeElement = function (doc) {
  return function () {
    return doc.activeElement;
  };
};

exports._currentScript = function (doc) {
  return function () {
    return doc.currentScript;
  };
};

exports.referrer = function (doc) {
  return function () {
    return doc.referrer;
  };
};

exports.title = function (doc) {
  return function () {
    return doc.title;
  };
};

exports.setTitle = function (title) {
  return function (doc) {
    return function () {
      doc.title = title;
      return {};
    };
  };
};

},{}],188:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Effect = require("../Effect/index.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var Web_HTML_HTMLDocument_ReadyState = require("../Web.HTML.HTMLDocument.ReadyState/index.js");
var Web_Internal_FFI = require("../Web.Internal.FFI/index.js");
var toParentNode = Unsafe_Coerce.unsafeCoerce;
var toNonElementParentNode = Unsafe_Coerce.unsafeCoerce;
var toNode = Unsafe_Coerce.unsafeCoerce;
var toEventTarget = Unsafe_Coerce.unsafeCoerce;
var toDocument = Unsafe_Coerce.unsafeCoerce;
var readyState = (function () {
    var $0 = Data_Functor.map(Effect.functorEffect)((function () {
        var $2 = Data_Maybe.fromMaybe(Web_HTML_HTMLDocument_ReadyState.Loading.value);
        return function ($3) {
            return $2(Web_HTML_HTMLDocument_ReadyState.parse($3));
        };
    })());
    return function ($1) {
        return $0($foreign["_readyState"]($1));
    };
})();
var head = (function () {
    var $4 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($5) {
        return $4($foreign["_head"]($5));
    };
})();
var fromParentNode = Web_Internal_FFI.unsafeReadProtoTagged("HTMLDocument");
var fromNonElementParentNode = Web_Internal_FFI.unsafeReadProtoTagged("HTMLDocument");
var fromNode = Web_Internal_FFI.unsafeReadProtoTagged("HTMLDocument");
var fromEventTarget = Web_Internal_FFI.unsafeReadProtoTagged("HTMLDocument");
var fromDocument = Web_Internal_FFI.unsafeReadProtoTagged("HTMLDocument");
var currentScript = (function () {
    var $6 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($7) {
        return $6($foreign["_currentScript"]($7));
    };
})();
var body = (function () {
    var $8 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($9) {
        return $8($foreign["_body"]($9));
    };
})();
var activeElement = (function () {
    var $10 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($11) {
        return $10($foreign["_activeElement"]($11));
    };
})();
module.exports = {
    fromDocument: fromDocument,
    fromNode: fromNode,
    fromParentNode: fromParentNode,
    fromNonElementParentNode: fromNonElementParentNode,
    fromEventTarget: fromEventTarget,
    toDocument: toDocument,
    toNode: toNode,
    toParentNode: toParentNode,
    toNonElementParentNode: toNonElementParentNode,
    toEventTarget: toEventTarget,
    head: head,
    body: body,
    readyState: readyState,
    activeElement: activeElement,
    currentScript: currentScript,
    referrer: $foreign.referrer,
    title: $foreign.title,
    setTitle: $foreign.setTitle
};

},{"../Data.Functor/index.js":80,"../Data.Maybe/index.js":90,"../Data.Nullable/index.js":100,"../Effect/index.js":152,"../Unsafe.Coerce/index.js":172,"../Web.HTML.HTMLDocument.ReadyState/index.js":186,"../Web.Internal.FFI/index.js":194,"./foreign.js":187}],189:[function(require,module,exports){
"use strict";

exports.document = function (window) {
  return function () {
    return window.document;
  };
};

exports.navigator = function (window) {
  return function () {
    return window.navigator;
  };
};

exports.location = function (window) {
  return function () {
    return window.location;
  };
};

exports.history = function(window) {
  return function() {
    return window.history;
  };
};

exports.innerWidth = function (window) {
  return function () {
    return window.innerWidth;
  };
};

exports.innerHeight = function (window) {
  return function () {
    return window.innerHeight;
  };
};

exports.alert = function (str) {
  return function (window) {
    return function () {
      window.alert(str);
      return {};
    };
  };
};

exports.confirm = function (str) {
  return function (window) {
    return function () {
      return window.confirm(str);
    };
  };
};

exports.moveBy = function (xDelta) {
  return function (yDelta) {
    return function (window) {
      return function () {
        window.moveBy(xDelta, yDelta);
        return {};
      };
    };
  };
};

exports.moveTo = function (width) {
  return function (height) {
    return function (window) {
      return function () {
        window.moveTo(width, height);
        return {};
      };
    };
  };
};

exports._open = function (url) {
  return function (name) {
    return function (features) {
      return function (window) {
        return function () {
          return window.open(url, name, features);
        };
      };
    };
  };
};

exports.outerHeight = function (window) {
  return function () {
    return window.outerHeight;
  };
};

exports.outerWidth = function (window) {
  return function () {
    return window.outerWidth;
  };
};

exports.print = function (window) {
  return function () {
    window.print();
    return {};
  };
};

exports._prompt = function (str) {
  return function (defaultText) {
    return function (window) {
      return function () {
        return window.prompt(str, defaultText);
      };
    };
  };
};

exports.resizeBy = function (xDelta) {
  return function (yDelta) {
    return function (window) {
      return function () {
        window.resizeBy(xDelta, yDelta);
        return {};
      };
    };
  };
};

exports.resizeTo = function (width) {
  return function (height) {
    return function (window) {
      return function () {
        window.resizeTo(width, height);
        return {};
      };
    };
  };
};

exports.screenX = function (window) {
  return function () {
    return window.screenX;
  };
};

exports.screenY = function (window) {
  return function () {
    return window.screenY;
  };
};

exports.scroll = function (xCoord) {
  return function (yCoord) {
    return function (window) {
      return function () {
        window.scroll(xCoord, yCoord);
        return {};
      };
    };
  };
};

exports.scrollBy = function (xCoord) {
  return function (yCoord) {
    return function (window) {
      return function () {
        window.scrollBy(xCoord, yCoord);
        return {};
      };
    };
  };
};

exports.scrollX = function (window) {
  return function () {
    return window.scrollX;
  };
};

exports.scrollY = function (window) {
  return function () {
    return window.scrollY;
  };
};

exports.localStorage = function (window) {
  return function () {
    return window.localStorage;
  };
};

exports.sessionStorage = function (window) {
  return function () {
    return window.sessionStorage;
  };
};

exports._requestAnimationFrame = function(fn) {
  return function(window) {
    return function() {
      return window.requestAnimationFrame(fn);
    };
  };
};

exports._cancelAnimationFrame = function(id) {
  return function(window) {
    return function() {
      return window.cancelAnimationFrame(id);
    };
  };
};

exports._requestIdleCallback = function(opts) {
  return function(fn) {
    return function(window) {
      return function() {
        return window.requestIdleCallback(fn, opts);
      };
    };
  };
};

exports._cancelIdleCallback = function(id) {
  return function(window) {
    return function() {
      return window.cancelIdleCallback(id);
    };
  };
};

exports.parent = function(window) {
  return function() {
    return window.parent;
  };
};

exports._opener = function(window) {
  return function() {
    return window.opener;
  };
};

},{}],190:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Eq = require("../Data.Eq/index.js");
var Data_Functor = require("../Data.Functor/index.js");
var Data_Newtype = require("../Data.Newtype/index.js");
var Data_Nullable = require("../Data.Nullable/index.js");
var Data_Ord = require("../Data.Ord/index.js");
var Effect = require("../Effect/index.js");
var Unsafe_Coerce = require("../Unsafe.Coerce/index.js");
var RequestIdleCallbackId = function (x) {
    return x;
};
var RequestAnimationFrameId = function (x) {
    return x;
};
var toEventTarget = Unsafe_Coerce.unsafeCoerce;
var requestIdleCallback = function (opts) {
    return function (fn) {
        var $30 = Data_Functor.map(Effect.functorEffect)(RequestIdleCallbackId);
        var $31 = $foreign["_requestIdleCallback"](opts)(fn);
        return function ($32) {
            return $30($31($32));
        };
    };
};
var requestAnimationFrame = function (fn) {
    var $33 = Data_Functor.map(Effect.functorEffect)(RequestAnimationFrameId);
    var $34 = $foreign["_requestAnimationFrame"](fn);
    return function ($35) {
        return $33($34($35));
    };
};
var promptDefault = function (msg) {
    return function (defaultText) {
        return function (window) {
            return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign["_prompt"](msg)(defaultText)(window));
        };
    };
};
var prompt = function (msg) {
    return function (window) {
        return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign["_prompt"](msg)("")(window));
    };
};
var opener = function (window) {
    return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign["_opener"](window));
};
var open = function (url$prime) {
    return function (name) {
        return function (features) {
            return function (window) {
                return Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe)($foreign["_open"](url$prime)(name)(features)(window));
            };
        };
    };
};
var newtypeRequestIdleCallbackId = new Data_Newtype.Newtype(function (n) {
    return n;
}, RequestIdleCallbackId);
var newtypeRequestAnimationFrameId = new Data_Newtype.Newtype(function (n) {
    return n;
}, RequestAnimationFrameId);
var eqRequestIdleCallbackId = new Data_Eq.Eq(function (x) {
    return function (y) {
        return x === y;
    };
});
var ordRequestIdleCallbackId = new Data_Ord.Ord(function () {
    return eqRequestIdleCallbackId;
}, function (x) {
    return function (y) {
        return Data_Ord.compare(Data_Ord.ordInt)(x)(y);
    };
});
var eqRequestAnimationFrameId = new Data_Eq.Eq(function (x) {
    return function (y) {
        return x === y;
    };
});
var ordRequestAnimationFrameId = new Data_Ord.Ord(function () {
    return eqRequestAnimationFrameId;
}, function (x) {
    return function (y) {
        return Data_Ord.compare(Data_Ord.ordInt)(x)(y);
    };
});
var cancelIdleCallback = function (idAF) {
    return $foreign["_cancelIdleCallback"](Data_Newtype.unwrap(newtypeRequestIdleCallbackId)(idAF));
};
var cancelAnimationFrame = function (idAF) {
    return $foreign["_cancelAnimationFrame"](Data_Newtype.unwrap(newtypeRequestAnimationFrameId)(idAF));
};
module.exports = {
    toEventTarget: toEventTarget,
    open: open,
    prompt: prompt,
    promptDefault: promptDefault,
    requestAnimationFrame: requestAnimationFrame,
    cancelAnimationFrame: cancelAnimationFrame,
    requestIdleCallback: requestIdleCallback,
    cancelIdleCallback: cancelIdleCallback,
    opener: opener,
    newtypeRequestAnimationFrameId: newtypeRequestAnimationFrameId,
    eqRequestAnimationFrameId: eqRequestAnimationFrameId,
    ordRequestAnimationFrameId: ordRequestAnimationFrameId,
    newtypeRequestIdleCallbackId: newtypeRequestIdleCallbackId,
    eqRequestIdleCallbackId: eqRequestIdleCallbackId,
    ordRequestIdleCallbackId: ordRequestIdleCallbackId,
    document: $foreign.document,
    navigator: $foreign.navigator,
    location: $foreign.location,
    history: $foreign.history,
    innerWidth: $foreign.innerWidth,
    innerHeight: $foreign.innerHeight,
    alert: $foreign.alert,
    confirm: $foreign.confirm,
    moveBy: $foreign.moveBy,
    moveTo: $foreign.moveTo,
    outerHeight: $foreign.outerHeight,
    outerWidth: $foreign.outerWidth,
    print: $foreign.print,
    resizeBy: $foreign.resizeBy,
    resizeTo: $foreign.resizeTo,
    screenX: $foreign.screenX,
    screenY: $foreign.screenY,
    scroll: $foreign.scroll,
    scrollBy: $foreign.scrollBy,
    scrollX: $foreign.scrollX,
    scrollY: $foreign.scrollY,
    localStorage: $foreign.localStorage,
    sessionStorage: $foreign.sessionStorage,
    parent: $foreign.parent
};

},{"../Data.Eq/index.js":67,"../Data.Functor/index.js":80,"../Data.Newtype/index.js":98,"../Data.Nullable/index.js":100,"../Data.Ord/index.js":104,"../Effect/index.js":152,"../Unsafe.Coerce/index.js":172,"./foreign.js":189}],191:[function(require,module,exports){
/* global window */
"use strict";

exports.window = function () {
  return window;
};

},{}],192:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
module.exports = {
    window: $foreign.window
};

},{"./foreign.js":191}],193:[function(require,module,exports){
"use strict";

exports._unsafeReadProtoTagged = function (nothing, just, name, value) {
  if (typeof window !== "undefined") {
    var ty = window[name];
    if (ty != null && value instanceof ty) {
      return just(value);
    }
    return nothing;
  } 
  var obj = value;
  while (obj != null) {
    var proto = Object.getPrototypeOf(obj);
    var constructorName = proto.constructor.name;
    if (constructorName === name) {
      return just(value);
    } else if (constructorName === "Object") {
      return nothing;
    }
    obj = proto;
  }
  return nothing;
};

},{}],194:[function(require,module,exports){
// Generated by purs version 0.13.2
"use strict";
var $foreign = require("./foreign.js");
var Data_Maybe = require("../Data.Maybe/index.js");
var unsafeReadProtoTagged = function (name) {
    return function (value) {
        return $foreign["_unsafeReadProtoTagged"](Data_Maybe.Nothing.value, Data_Maybe.Just.create, name, value);
    };
};
module.exports = {
    unsafeReadProtoTagged: unsafeReadProtoTagged
};

},{"../Data.Maybe/index.js":90,"./foreign.js":193}],195:[function(require,module,exports){
require('Main').main();

},{"Main":156}]},{},[195]);
