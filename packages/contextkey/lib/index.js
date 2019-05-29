function dispose(first, ...rest) {
    if (Array.isArray(first)) {
        first.forEach(d => d && d.dispose());
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
function combinedDisposable(disposables) {
    return { dispose: () => dispose(disposables) };
}
class Disposable {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose(this._toDispose);
    }
    _register(t) {
        if (this._lifecycle_disposable_isDisposed) {
            console.warn('Registering disposable on object that has already been disposed.');
            t.dispose();
        }
        else {
            this._toDispose.push(t);
        }
        return t;
    }
}
Disposable.None = Object.freeze({ dispose() { } });

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN = { done: true, value: undefined };
var Iterator;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN;
        }
    };
    function empty() {
        return _empty;
    }
    Iterator.empty = empty;
    function fromArray(array, index = 0, length = array.length) {
        return {
            next() {
                if (index >= length) {
                    return FIN;
                }
                return { done: false, value: array[index++] };
            }
        };
    }
    Iterator.fromArray = fromArray;
    function from(elements) {
        if (!elements) {
            return Iterator.empty();
        }
        else if (Array.isArray(elements)) {
            return Iterator.fromArray(elements);
        }
        else {
            return elements;
        }
    }
    Iterator.from = from;
    function map(iterator, fn) {
        return {
            next() {
                const element = iterator.next();
                if (element.done) {
                    return FIN;
                }
                else {
                    return { done: false, value: fn(element.value) };
                }
            }
        };
    }
    Iterator.map = map;
    function filter(iterator, fn) {
        return {
            next() {
                while (true) {
                    const element = iterator.next();
                    if (element.done) {
                        return FIN;
                    }
                    if (fn(element.value)) {
                        return { done: false, value: element.value };
                    }
                }
            }
        };
    }
    Iterator.filter = filter;
    function forEach(iterator, fn) {
        for (let next = iterator.next(); !next.done; next = iterator.next()) {
            fn(next.value);
        }
    }
    Iterator.forEach = forEach;
    function collect(iterator) {
        const result = [];
        forEach(iterator, value => result.push(value));
        return result;
    }
    Iterator.collect = collect;
})(Iterator || (Iterator = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Node {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList {
    constructor() {
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    isEmpty() {
        return !this._first;
    }
    clear() {
        this._first = undefined;
        this._last = undefined;
        this._size = 0;
    }
    unshift(element) {
        return this._insert(element, false);
    }
    push(element) {
        return this._insert(element, true);
    }
    _insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (!this._first) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            // push
            const oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            // unshift
            const oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        this._size += 1;
        return this._remove.bind(this, newNode);
    }
    shift() {
        if (!this._first) {
            return undefined;
        }
        else {
            const res = this._first.element;
            this._remove(this._first);
            return res;
        }
    }
    pop() {
        if (!this._last) {
            return undefined;
        }
        else {
            const res = this._last.element;
            this._remove(this._last);
            return res;
        }
    }
    _remove(node) {
        let candidate = this._first;
        while (candidate instanceof Node) {
            if (candidate !== node) {
                candidate = candidate.next;
                continue;
            }
            if (candidate.prev && candidate.next) {
                // middle
                let anchor = candidate.prev;
                anchor.next = candidate.next;
                candidate.next.prev = anchor;
            }
            else if (!candidate.prev && !candidate.next) {
                // only node
                this._first = undefined;
                this._last = undefined;
            }
            else if (!candidate.next) {
                // last
                this._last = this._last.prev;
                this._last.next = undefined;
            }
            else if (!candidate.prev) {
                // first
                this._first = this._first.next;
                this._first.prev = undefined;
            }
            // done
            this._size -= 1;
            break;
        }
    }
    iterator() {
        let element;
        let node = this._first;
        return {
            next() {
                if (!node) {
                    return FIN;
                }
                if (!element) {
                    element = { done: false, value: node.element };
                }
                else {
                    element.value = node.element;
                }
                node = node.next;
                return element;
            }
        };
    }
    toArray() {
        let result = [];
        for (let node = this._first; node instanceof Node; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

var Event;
(function (Event) {
    const _disposable = { dispose() { } };
    Event.None = function () { return _disposable; };
    /**
     * Given an event, returns another event which only fires once.
     */
    function once(event) {
        return (listener, thisArgs = null, disposables) => {
            // we need this, in case the event fires during the listener call
            let didFire = false;
            let result;
            result = event(e => {
                if (didFire) {
                    return;
                }
                else if (result) {
                    result.dispose();
                }
                else {
                    didFire = true;
                }
                return listener.call(thisArgs, e);
            }, null, disposables);
            if (didFire) {
                result.dispose();
            }
            return result;
        };
    }
    Event.once = once;
    /**
     * Given an event and a `map` function, returns another event which maps each element
     * throught the mapping function.
     */
    function map(event, map) {
        return (listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables);
    }
    Event.map = map;
    /**
     * Given an event and an `each` function, returns another identical event and calls
     * the `each` function per each element.
     */
    function forEach(event, each) {
        return (listener, thisArgs = null, disposables) => event(i => {
            each(i);
            listener.call(thisArgs, i);
        }, null, disposables);
    }
    Event.forEach = forEach;
    function filter(event, filter) {
        return (listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables);
    }
    Event.filter = filter;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal(event) {
        return event;
    }
    Event.signal = signal;
    /**
     * Given a collection of events, returns a single event which emits
     * whenever any of the provided events emit.
     */
    function any(...events) {
        return (listener, thisArgs = null, disposables) => combinedDisposable(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
    }
    Event.any = any;
    /**
     * Given an event and a `merge` function, returns another event which maps each element
     * and the cummulative result throught the `merge` function. Similar to `map`, but with memory.
     */
    function reduce(event, merge, initial) {
        let output = initial;
        return map(event, e => {
            output = merge(output, e);
            return output;
        });
    }
    Event.reduce = reduce;
    function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
        let subscription;
        let output = undefined;
        let handle = undefined;
        let numDebouncedCalls = 0;
        const emitter = new Emitter({
            leakWarningThreshold,
            onFirstListenerAdd() {
                subscription = event(cur => {
                    numDebouncedCalls++;
                    output = merge(output, cur);
                    if (leading && !handle) {
                        emitter.fire(output);
                    }
                    clearTimeout(handle);
                    handle = setTimeout(() => {
                        let _output = output;
                        output = undefined;
                        handle = undefined;
                        if (!leading || numDebouncedCalls > 1) {
                            emitter.fire(_output);
                        }
                        numDebouncedCalls = 0;
                    }, delay);
                });
            },
            onLastListenerRemove() {
                subscription.dispose();
            }
        });
        return emitter.event;
    }
    Event.debounce = debounce;
    /**
     * Given an event, it returns another event which fires only once and as soon as
     * the input event emits. The event data is the number of millis it took for the
     * event to fire.
     */
    function stopwatch(event) {
        const start = new Date().getTime();
        return map(once(event), _ => new Date().getTime() - start);
    }
    Event.stopwatch = stopwatch;
    /**
     * Given an event, it returns another event which fires only when the event
     * element changes.
     */
    function latch(event) {
        let firstCall = true;
        let cache;
        return filter(event, value => {
            let shouldEmit = firstCall || value !== cache;
            firstCall = false;
            cache = value;
            return shouldEmit;
        });
    }
    Event.latch = latch;
    /**
     * Buffers the provided event until a first listener comes
     * along, at which point fire all the events at once and
     * pipe the event from then on.
     *
     * ```typescript
     * const emitter = new Emitter<number>();
     * const event = emitter.event;
     * const bufferedEvent = buffer(event);
     *
     * emitter.fire(1);
     * emitter.fire(2);
     * emitter.fire(3);
     * // nothing...
     *
     * const listener = bufferedEvent(num => console.log(num));
     * // 1, 2, 3
     *
     * emitter.fire(4);
     * // 4
     * ```
     */
    function buffer(event, nextTick = false, _buffer = []) {
        let buffer = _buffer.slice();
        let listener = event(e => {
            if (buffer) {
                buffer.push(e);
            }
            else {
                emitter.fire(e);
            }
        });
        const flush = () => {
            if (buffer) {
                buffer.forEach(e => emitter.fire(e));
            }
            buffer = null;
        };
        const emitter = new Emitter({
            onFirstListenerAdd() {
                if (!listener) {
                    listener = event(e => emitter.fire(e));
                }
            },
            onFirstListenerDidAdd() {
                if (buffer) {
                    if (nextTick) {
                        setTimeout(flush);
                    }
                    else {
                        flush();
                    }
                }
            },
            onLastListenerRemove() {
                if (listener) {
                    listener.dispose();
                }
                listener = null;
            }
        });
        return emitter.event;
    }
    Event.buffer = buffer;
    /**
     * Similar to `buffer` but it buffers indefinitely and repeats
     * the buffered events to every new listener.
     */
    function echo(event, nextTick = false, buffer = []) {
        buffer = buffer.slice();
        event(e => {
            buffer.push(e);
            emitter.fire(e);
        });
        const flush = (listener, thisArgs) => buffer.forEach(e => listener.call(thisArgs, e));
        const emitter = new Emitter({
            onListenerDidAdd(emitter, listener, thisArgs) {
                if (nextTick) {
                    setTimeout(() => flush(listener, thisArgs));
                }
                else {
                    flush(listener, thisArgs);
                }
            }
        });
        return emitter.event;
    }
    Event.echo = echo;
    class ChainableEvent {
        constructor(_event) {
            this._event = _event;
        }
        get event() { return this._event; }
        map(fn) {
            return new ChainableEvent(map(this._event, fn));
        }
        forEach(fn) {
            return new ChainableEvent(forEach(this._event, fn));
        }
        filter(fn) {
            return new ChainableEvent(filter(this._event, fn));
        }
        reduce(merge, initial) {
            return new ChainableEvent(reduce(this._event, merge, initial));
        }
        latch() {
            return new ChainableEvent(latch(this._event));
        }
        on(listener, thisArgs, disposables) {
            return this._event(listener, thisArgs, disposables);
        }
        once(listener, thisArgs, disposables) {
            return once(this._event)(listener, thisArgs, disposables);
        }
    }
    function chain(event) {
        return new ChainableEvent(event);
    }
    Event.chain = chain;
    function fromNodeEventEmitter(emitter, eventName, map = id => id) {
        const fn = (...args) => result.fire(map(...args));
        const onFirstListenerAdd = () => emitter.on(eventName, fn);
        const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
        const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter();
        let shouldEmit = false;
        promise
            .then(undefined, () => null)
            .then(() => {
            if (!shouldEmit) {
                setTimeout(() => emitter.fire(undefined), 0);
            }
            else {
                emitter.fire(undefined);
            }
        });
        shouldEmit = true;
        return emitter.event;
    }
    Event.fromPromise = fromPromise;
    function toPromise(event) {
        return new Promise(c => once(event)(c));
    }
    Event.toPromise = toPromise;
})(Event || (Event = {}));
let _globalLeakWarningThreshold = -1;
class LeakageMonitor {
    constructor(customThreshold, name = Math.random().toString(18).slice(2, 5)) {
        this.customThreshold = customThreshold;
        this.name = name;
        this._warnCountdown = 0;
    }
    dispose() {
        if (this._stacks) {
            this._stacks.clear();
        }
    }
    check(listenerCount) {
        let threshold = _globalLeakWarningThreshold;
        if (typeof this.customThreshold === 'number') {
            threshold = this.customThreshold;
        }
        if (threshold <= 0 || listenerCount < threshold) {
            return undefined;
        }
        if (!this._stacks) {
            this._stacks = new Map();
        }
        let stack = new Error().stack.split('\n').slice(3).join('\n');
        let count = (this._stacks.get(stack) || 0);
        this._stacks.set(stack, count + 1);
        this._warnCountdown -= 1;
        if (this._warnCountdown <= 0) {
            // only warn on first exceed and then every time the limit
            // is exceeded by 50% again
            this._warnCountdown = threshold * 0.5;
            // find most frequent listener and print warning
            let topStack;
            let topCount = 0;
            this._stacks.forEach((count, stack) => {
                if (!topStack || topCount < count) {
                    topStack = stack;
                    topCount = count;
                }
            });
            console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
            console.warn(topStack);
        }
        return () => {
            let count = (this._stacks.get(stack) || 0);
            this._stacks.set(stack, count - 1);
        };
    }
}
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
 class Document {

        private _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
class Emitter {
    constructor(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = _globalLeakWarningThreshold > 0
            ? new LeakageMonitor(this._options && this._options.leakWarningThreshold)
            : undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList();
                }
                const firstListener = this._listeners.isEmpty();
                if (firstListener && this._options && this._options.onFirstListenerAdd) {
                    this._options.onFirstListenerAdd(this);
                }
                const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
                if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
                    this._options.onFirstListenerDidAdd(this);
                }
                if (this._options && this._options.onListenerDidAdd) {
                    this._options.onListenerDidAdd(this, listener, thisArgs);
                }
                // check and record this emitter for potential leakage
                let removeMonitor;
                if (this._leakageMon) {
                    removeMonitor = this._leakageMon.check(this._listeners.size);
                }
                let result;
                result = {
                    dispose: () => {
                        if (removeMonitor) {
                            removeMonitor();
                        }
                        result.dispose = Emitter._noop;
                        if (!this._disposed) {
                            remove();
                            if (this._options && this._options.onLastListenerRemove) {
                                const hasListeners = (this._listeners && !this._listeners.isEmpty());
                                if (!hasListeners) {
                                    this._options.onLastListenerRemove(this);
                                }
                            }
                        }
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        return this._event;
    }
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event) {
        if (this._listeners) {
            // put all [listener,event]-pairs into delivery queue
            // then emit all event. an inner/nested event might be
            // the driver of this
            if (!this._deliveryQueue) {
                this._deliveryQueue = [];
            }
            for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
                this._deliveryQueue.push([e.value, event]);
            }
            while (this._deliveryQueue.length > 0) {
                const [listener, event] = this._deliveryQueue.shift();
                try {
                    if (typeof listener === 'function') {
                        listener.call(undefined, event);
                    }
                    else {
                        listener[0].call(listener[1], event);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    dispose() {
        if (this._listeners) {
            this._listeners = undefined;
        }
        if (this._deliveryQueue) {
            this._deliveryQueue.length = 0;
        }
        if (this._leakageMon) {
            this._leakageMon.dispose();
        }
        this._disposed = true;
    }
}
Emitter._noop = function () { };

function dispose$1(first, ...rest) {
    if (Array.isArray(first)) {
        first.forEach(d => d && d.dispose());
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
        dispose$1(first);
        dispose$1(rest);
        return [];
    }
}
class Disposable$1 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$1(this._toDispose);
    }
    _register(t) {
        if (this._lifecycle_disposable_isDisposed) {
            console.warn('Registering disposable on object that has already been disposed.');
            t.dispose();
        }
        else {
            this._toDispose.push(t);
        }
        return t;
    }
}
Disposable$1.None = Object.freeze({ dispose() { } });

const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';
class Context {
    constructor(id, parent) {
        this._id = id;
        this._parent = parent;
        this._value = Object.create(null);
        this._value['_contextId'] = id;
    }
    setValue(key, value) {
        // console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
        if (this._value[key] !== value) {
            this._value[key] = value;
            return true;
        }
        return false;
    }
    removeValue(key) {
        // console.log('REMOVE ' + key + ' FROM ' + this._id);
        if (key in this._value) {
            delete this._value[key];
            return true;
        }
        return false;
    }
    getValue(key) {
        const ret = this._value[key];
        if (typeof ret === 'undefined' && this._parent) {
            return this._parent.getValue(key);
        }
        return ret;
    }
}
class ContextKey {
    constructor(parent, key, defaultValue) {
        this._parent = parent;
        this._key = key;
        this._defaultValue = defaultValue;
        this.reset();
    }
    set(value) {
        this._parent.setContext(this._key, value);
    }
    reset() {
        if (typeof this._defaultValue === 'undefined') {
            this._parent.removeContext(this._key);
        }
        else {
            this._parent.setContext(this._key, this._defaultValue);
        }
    }
    get() {
        return this._parent.getContextKeyValue(this._key);
    }
}
class AbstractContextKeyService {
    constructor(myContextId) {
        this._myContextId = myContextId;
        this._onDidChangeContextKey = new Emitter();
    }
    createKey(key, defaultValue) {
        return new ContextKey(this, key, defaultValue);
    }
    createScoped(domNode) {
        return new ScopedContextKeyService(this, this._onDidChangeContextKey, domNode);
    }
    getContextKeyValue(key) {
        return this.getContextValuesContainer(this._myContextId).getValue(key);
    }
    setContext(key, value) {
        const myContext = this.getContextValuesContainer(this._myContextId);
        if (!myContext) {
            return;
        }
        if (myContext.setValue(key, value)) {
            this._onDidChangeContextKey.fire(key);
        }
    }
    removeContext(key) {
        if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
            this._onDidChangeContextKey.fire(key);
        }
    }
    getContext(target) {
        return this.getContextValuesContainer(findContextAttr(target));
    }
}
class ContextKeyService extends AbstractContextKeyService {
    constructor() {
        super(0);
        this._toDispose = [];
        this._lastContextId = 0;
        this._contexts = Object.create(null);
        this._contexts[String(this._myContextId)] = new Context(this._myContextId, null);
        // Uncomment this to see the contexts continuously logged
        // let lastLoggedValue: string = null;
        // setInterval(() => {
        // 	let values = Object.keys(this._contexts).map((key) => this._contexts[key]);
        // 	let logValue = values.map(v => JSON.stringify(v._value, null, '\t')).join('\n');
        // 	if (lastLoggedValue !== logValue) {
        // 		lastLoggedValue = logValue;
        // 		console.log(lastLoggedValue);
        // 	}
        // }, 2000);
    }
    dispose() {
        this._toDispose = dispose$1(this._toDispose);
    }
    getContextValuesContainer(contextId) {
        return this._contexts[String(contextId)];
    }
    createChildContext(parentContextId = this._myContextId) {
        let id = (++this._lastContextId);
        this._contexts[String(id)] = new Context(id, this.getContextValuesContainer(parentContextId));
        return id;
    }
    disposeContext(contextId) {
        delete this._contexts[String(contextId)];
    }
}
class ScopedContextKeyService extends AbstractContextKeyService {
    constructor(parent, emitter, domNode) {
        super(parent.createChildContext());
        this._parent = parent;
        this._onDidChangeContextKey = emitter;
        if (domNode) {
            this._domNode = domNode;
            this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
        }
    }
    dispose() {
        this._parent.disposeContext(this._myContextId);
        if (this._domNode) {
            this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
        }
    }
    getContextValuesContainer(contextId) {
        return this._parent.getContextValuesContainer(contextId);
    }
    createChildContext(parentContextId = this._myContextId) {
        return this._parent.createChildContext(parentContextId);
    }
    disposeContext(contextId) {
        this._parent.disposeContext(contextId);
    }
}
function findContextAttr(domNode) {
    while (domNode) {
        if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
            return parseInt(domNode.getAttribute(KEYBINDING_CONTEXT_ATTR), 10);
        }
        domNode = domNode.parentElement;
    }
    return 0;
}

function isFalsyOrWhitespace(str) {
    if (!str || typeof str !== 'string') {
        return true;
    }
    return str.trim().length === 0;
}

var ContextKeyExprType;
(function (ContextKeyExprType) {
    ContextKeyExprType[ContextKeyExprType["Defined"] = 1] = "Defined";
    ContextKeyExprType[ContextKeyExprType["Not"] = 2] = "Not";
    ContextKeyExprType[ContextKeyExprType["Equals"] = 3] = "Equals";
    ContextKeyExprType[ContextKeyExprType["NotEquals"] = 4] = "NotEquals";
    ContextKeyExprType[ContextKeyExprType["And"] = 5] = "And";
    ContextKeyExprType[ContextKeyExprType["Regex"] = 6] = "Regex";
})(ContextKeyExprType || (ContextKeyExprType = {}));
class ContextKeyExpr {
    static has(key) {
        return new ContextKeyDefinedExpr(key);
    }
    static equals(key, value) {
        return new ContextKeyEqualsExpr(key, value);
    }
    static notEquals(key, value) {
        return new ContextKeyNotEqualsExpr(key, value);
    }
    static regex(key, value) {
        return new ContextKeyRegexExpr(key, value);
    }
    static not(key) {
        return new ContextKeyNotExpr(key);
    }
    static and(...expr) {
        return new ContextKeyAndExpr(expr);
    }
    static deserialize(serialized) {
        if (!serialized) {
            return null;
        }
        let pieces = serialized.split('&&');
        let result = new ContextKeyAndExpr(pieces.map(p => this._deserializeOne(p)));
        return result.normalize();
    }
    static _deserializeOne(serializedOne) {
        serializedOne = serializedOne.trim();
        if (serializedOne.indexOf('!=') >= 0) {
            let pieces = serializedOne.split('!=');
            return new ContextKeyNotEqualsExpr(pieces[0].trim(), this._deserializeValue(pieces[1]));
        }
        if (serializedOne.indexOf('==') >= 0) {
            let pieces = serializedOne.split('==');
            return new ContextKeyEqualsExpr(pieces[0].trim(), this._deserializeValue(pieces[1]));
        }
        if (serializedOne.indexOf('=~') >= 0) {
            let pieces = serializedOne.split('=~');
            return new ContextKeyRegexExpr(pieces[0].trim(), this._deserializeRegexValue(pieces[1]));
        }
        if (/^\!\s*/.test(serializedOne)) {
            return new ContextKeyNotExpr(serializedOne.substr(1).trim());
        }
        return new ContextKeyDefinedExpr(serializedOne);
    }
    static _deserializeValue(serializedValue) {
        serializedValue = serializedValue.trim();
        if (serializedValue === 'true') {
            return true;
        }
        if (serializedValue === 'false') {
            return false;
        }
        let m = /^'([^']*)'$/.exec(serializedValue);
        if (m) {
            return m[1].trim();
        }
        return serializedValue;
    }
    static _deserializeRegexValue(serializedValue) {
        if (isFalsyOrWhitespace(serializedValue)) {
            console.warn('missing regexp-value for =~-expression');
            return null;
        }
        let start = serializedValue.indexOf('/');
        let end = serializedValue.lastIndexOf('/');
        if (start === end || start < 0 /* || to < 0 */) {
            console.warn(`bad regexp-value '${serializedValue}', missing /-enclosure`);
            return null;
        }
        let value = serializedValue.slice(start + 1, end);
        let caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
        try {
            return new RegExp(value, caseIgnoreFlag);
        }
        catch (e) {
            console.warn(`bad regexp-value '${serializedValue}', parse error: ${e}`);
            return null;
        }
    }
}
function cmp(a, b) {
    let aType = a.getType();
    let bType = b.getType();
    if (aType !== bType) {
        return aType - bType;
    }
    switch (aType) {
        case ContextKeyExprType.Defined:
            return a.cmp(b);
        case ContextKeyExprType.Not:
            return a.cmp(b);
        case ContextKeyExprType.Equals:
            return a.cmp(b);
        case ContextKeyExprType.NotEquals:
            return a.cmp(b);
        case ContextKeyExprType.Regex:
            return a.cmp(b);
        default:
            throw new Error('Unknown ContextKeyExpr!');
    }
}
class ContextKeyDefinedExpr {
    constructor(key) {
        this.key = key;
    }
    getType() {
        return ContextKeyExprType.Defined;
    }
    cmp(other) {
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other instanceof ContextKeyDefinedExpr) {
            return (this.key === other.key);
        }
        return false;
    }
    evaluate(context) {
        return (!!context.getValue(this.key));
    }
    normalize() {
        return this;
    }
    serialize() {
        return this.key;
    }
    keys() {
        return [this.key];
    }
}
class ContextKeyEqualsExpr {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    getType() {
        return ContextKeyExprType.Equals;
    }
    cmp(other) {
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        if (this.value < other.value) {
            return -1;
        }
        if (this.value > other.value) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other instanceof ContextKeyEqualsExpr) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    evaluate(context) {
        /* tslint:disable:triple-equals */
        // Intentional ==
        return (context.getValue(this.key) == this.value);
        /* tslint:enable:triple-equals */
    }
    normalize() {
        if (typeof this.value === 'boolean') {
            if (this.value) {
                return new ContextKeyDefinedExpr(this.key);
            }
            return new ContextKeyNotExpr(this.key);
        }
        return this;
    }
    serialize() {
        if (typeof this.value === 'boolean') {
            return this.normalize().serialize();
        }
        return this.key + ' == \'' + this.value + '\'';
    }
    keys() {
        return [this.key];
    }
}
class ContextKeyNotEqualsExpr {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    getType() {
        return ContextKeyExprType.NotEquals;
    }
    cmp(other) {
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        if (this.value < other.value) {
            return -1;
        }
        if (this.value > other.value) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other instanceof ContextKeyNotEqualsExpr) {
            return (this.key === other.key && this.value === other.value);
        }
        return false;
    }
    evaluate(context) {
        /* tslint:disable:triple-equals */
        // Intentional !=
        return (context.getValue(this.key) != this.value);
        /* tslint:enable:triple-equals */
    }
    normalize() {
        if (typeof this.value === 'boolean') {
            if (this.value) {
                return new ContextKeyNotExpr(this.key);
            }
            return new ContextKeyDefinedExpr(this.key);
        }
        return this;
    }
    serialize() {
        if (typeof this.value === 'boolean') {
            return this.normalize().serialize();
        }
        return this.key + ' != \'' + this.value + '\'';
    }
    keys() {
        return [this.key];
    }
}
class ContextKeyNotExpr {
    constructor(key) {
        this.key = key;
    }
    getType() {
        return ContextKeyExprType.Not;
    }
    cmp(other) {
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other instanceof ContextKeyNotExpr) {
            return (this.key === other.key);
        }
        return false;
    }
    evaluate(context) {
        return (!context.getValue(this.key));
    }
    normalize() {
        return this;
    }
    serialize() {
        return '!' + this.key;
    }
    keys() {
        return [this.key];
    }
}
class ContextKeyRegexExpr {
    constructor(key, regexp) {
        this.key = key;
        this.regexp = regexp;
        //
    }
    getType() {
        return ContextKeyExprType.Regex;
    }
    cmp(other) {
        if (this.key < other.key) {
            return -1;
        }
        if (this.key > other.key) {
            return 1;
        }
        const source = this.regexp ? this.regexp.source : undefined;
        if (source < other.regexp.source) {
            return -1;
        }
        if (source > other.regexp.source) {
            return 1;
        }
        return 0;
    }
    equals(other) {
        if (other instanceof ContextKeyRegexExpr) {
            const source = this.regexp ? this.regexp.source : undefined;
            return (this.key === other.key && source === other.regexp.source);
        }
        return false;
    }
    evaluate(context) {
        return this.regexp ? this.regexp.test(context.getValue(this.key)) : false;
    }
    normalize() {
        return this;
    }
    serialize() {
        return `${this.key} =~ /${this.regexp ? this.regexp.source : '<invalid>'}/${this.regexp.ignoreCase ? 'i' : ''}`;
    }
    keys() {
        return [this.key];
    }
}
class ContextKeyAndExpr {
    constructor(expr) {
        this.expr = ContextKeyAndExpr._normalizeArr(expr);
    }
    getType() {
        return ContextKeyExprType.And;
    }
    equals(other) {
        if (other instanceof ContextKeyAndExpr) {
            if (this.expr.length !== other.expr.length) {
                return false;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].equals(other.expr[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    evaluate(context) {
        for (let i = 0, len = this.expr.length; i < len; i++) {
            if (!this.expr[i].evaluate(context)) {
                return false;
            }
        }
        return true;
    }
    static _normalizeArr(arr) {
        let expr = [];
        if (arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                let e = arr[i];
                if (!e) {
                    continue;
                }
                e = e.normalize();
                if (!e) {
                    continue;
                }
                if (e instanceof ContextKeyAndExpr) {
                    expr = expr.concat(e.expr);
                    continue;
                }
                expr.push(e);
            }
            expr.sort(cmp);
        }
        return expr;
    }
    normalize() {
        if (this.expr.length === 0) {
            return null;
        }
        if (this.expr.length === 1) {
            return this.expr[0];
        }
        return this;
    }
    serialize() {
        if (this.expr.length === 0) {
            return '';
        }
        if (this.expr.length === 1) {
            return this.normalize().serialize();
        }
        return this.expr.map(e => e.serialize()).join(' && ');
    }
    keys() {
        const result = [];
        for (let expr of this.expr) {
            result.push(...expr.keys());
        }
        return result;
    }
}
class RawContextKey extends ContextKeyDefinedExpr {
    constructor(key, defaultValue) {
        super(key);
        this._defaultValue = defaultValue;
    }
    bindTo(target) {
        return target.createKey(this.key, this._defaultValue);
    }
    getValue(target) {
        return target.getContextKeyValue(this.key);
    }
    toNegated() {
        return ContextKeyExpr.not(this.key);
    }
    isEqualTo(value) {
        return ContextKeyExpr.equals(this.key, value);
    }
    notEqualsTo(value) {
        return ContextKeyExpr.notEquals(this.key, value);
    }
}

export { AbstractContextKeyService, Context, ContextKeyAndExpr, ContextKeyDefinedExpr, ContextKeyEqualsExpr, ContextKeyExpr, ContextKeyExprType, ContextKeyNotEqualsExpr, ContextKeyNotExpr, ContextKeyRegexExpr, ContextKeyService, RawContextKey };
