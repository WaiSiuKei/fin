"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDisposable(thing) {
    return typeof thing.dispose === 'function'
        && thing.dispose.length === 0;
}
exports.isDisposable = isDisposable;
function dispose(first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    if (Array.isArray(first)) {
        first.forEach(function (d) { return d && d.dispose(); });
        return [];
    }
    else if (rest.length === 0) {
        if (first) {
            first.dispose();
            return first;
        }
        return undefined;
    }
    else {
        dispose(first);
        dispose(rest);
        return [];
    }
}
exports.dispose = dispose;
var Disposable = /** @class */ (function () {
    function Disposable() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    Object.defineProperty(Disposable.prototype, "toDispose", {
        get: function () { return this._toDispose; },
        enumerable: true,
        configurable: true
    });
    Disposable.prototype.dispose = function () {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose(this._toDispose);
    };
    Disposable.prototype._register = function (t) {
        if (this._lifecycle_disposable_isDisposed) {
            console.warn('Registering disposable on object that has already been disposed.');
            t.dispose();
        }
        else {
            this._toDispose.push(t);
        }
        return t;
    };
    Disposable.None = Object.freeze({ dispose: function () { } });
    return Disposable;
}());
exports.Disposable = Disposable;
