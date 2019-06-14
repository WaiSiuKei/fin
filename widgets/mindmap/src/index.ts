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
function combinedDisposable(disposables) {
    return { dispose: () => dispose$1(disposables) };
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

class LayoutModel extends Disposable {
    constructor(rootTopic) {
        super();
        this.rootTopic = rootTopic;
        this._onTopicAdded = new Emitter();
        this._onTopicRemoved = new Emitter();
        this.topics = new Set();
        this._register(this._onTopicAdded);
        this._register(this._onTopicRemoved);
        this._register({
            dispose: () => {
                this.topics.clear();
            }
        });
    }
    get onTopicAdded() { return this._onTopicAdded.event; }
    get onTopicRemoved() { return this._onTopicRemoved.event; }
    addTopic(topic, refTopic) {
        if (this.topics.has(topic))
            throw new Error('duplicate topic');
        this.topics.add(topic);
        if (!refTopic) {
            this.rootTopic = topic;
        }
        else {
            refTopic.add(topic);
        }
        this._onTopicAdded.fire(topic);
    }
    removeTopic(topic) {
        if (!this.topics.has(topic))
            throw new Error('unknown topic');
        if (!topic.isRoot) {
            topic.parent.remove(topic);
        }
        this._onTopicRemoved.fire(topic);
    }
}

var MoveToCommand;
(function (MoveToCommand) {
    MoveToCommand["M"] = "M";
    MoveToCommand["m"] = "m";
})(MoveToCommand || (MoveToCommand = {}));
var LineToCommand;
(function (LineToCommand) {
    LineToCommand["L"] = "L";
    LineToCommand["l"] = "l";
})(LineToCommand || (LineToCommand = {}));
var CubicBezierCurveCommand;
(function (CubicBezierCurveCommand) {
    CubicBezierCurveCommand["C"] = "C";
    CubicBezierCurveCommand["c"] = "c";
    CubicBezierCurveCommand["S"] = "S";
    CubicBezierCurveCommand["s"] = "s";
})(CubicBezierCurveCommand || (CubicBezierCurveCommand = {}));
var QuadraticBezierCurveCommand;
(function (QuadraticBezierCurveCommand) {
    QuadraticBezierCurveCommand["Q"] = "Q";
    QuadraticBezierCurveCommand["q"] = "q";
    QuadraticBezierCurveCommand["T"] = "T";
    QuadraticBezierCurveCommand["t"] = "t";
})(QuadraticBezierCurveCommand || (QuadraticBezierCurveCommand = {}));
var EllipticalArcCurveCommand;
(function (EllipticalArcCurveCommand) {
    EllipticalArcCurveCommand["A"] = "A";
    EllipticalArcCurveCommand["a"] = "a";
})(EllipticalArcCurveCommand || (EllipticalArcCurveCommand = {}));
var ClosePathCommand;
(function (ClosePathCommand) {
    ClosePathCommand["Z"] = "Z";
    ClosePathCommand["z"] = "z";
})(ClosePathCommand || (ClosePathCommand = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const _typeof = {
    number: 'number',
    string: 'string',
    undefined: 'undefined',
    object: 'object',
    function: 'function'
};
/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
function isArray(array) {
    if (Array.isArray) {
        return Array.isArray(array);
    }
    if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
        return true;
    }
    return false;
}
/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
function isString(str) {
    if (typeof (str) === _typeof.string || str instanceof String) {
        return true;
    }
    return false;
}
const PI2 = Math.PI * 2;

function createNode(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
function createSVGNode() {
    let node = createNode('svg');
    node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    node.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    node.setAttribute('version', '1.1');
    return node;
}

class Shape {
    constructor(tagName) {
        this.node = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }
}

const slice = Array.prototype.slice;
function pathToString(pathSegment) {
    if (isString(pathSegment))
        return pathSegment;
    if (!isArray(pathSegment)) {
        pathSegment = [pathSegment];
    }
    return pathSegment.join(',').replace(/,?([achlmqrstvxz]),?/gi, '$1');
}
class Path extends Shape {
    constructor(data = '') {
        super('path');
        if (data) {
            this.setPathData(data);
        }
        this.node.setAttribute('stroke', 'black');
        this.node.setAttribute('fill', 'transparent');
    }
    setPathData(data = 'M0,0') {
        this.pathdata = pathToString(data);
        return this;
    }
    getPathData() {
        return this.pathdata || '';
    }
    clear() {
        this.pathdata = '';
        return this;
    }
    push(command, ...args) {
        var segment = slice.call(arguments);
        var originData = this.getPathData();
        originData = originData || '';
        this.setPathData(originData + pathToString(segment));
        return this;
    }
    moveTo(x, y) {
        return this.push(MoveToCommand.M, ...arguments);
    }
    moveBy(dx, dy) {
        return this.push(MoveToCommand.m, ...arguments);
    }
    lineTo(x, y) {
        return this.push(LineToCommand.L, ...arguments);
    }
    lineBy(dx, dy) {
        return this.push(LineToCommand.l, ...arguments);
    }
    arcTo(rx, ry, xr, laf, sf, x, y) {
        return this.push(EllipticalArcCurveCommand.A, ...arguments);
    }
    arcBy(rx, ry, xr, laf, sf, dx, dy) {
        return this.push(EllipticalArcCurveCommand.a, ...arguments);
    }
    carcTo(r, laf, sf, x, y) {
        return this.push(EllipticalArcCurveCommand.A, r, r, 0, ...slice.call(arguments, 1));
    }
    carcBy(r, laf, sf, dx, dy) {
        return this.push(EllipticalArcCurveCommand.a, r, r, 0, ...slice.call(arguments, 1));
    }
    bezierTo(x1, y1, x2, y2, x, y) {
        return this.push(CubicBezierCurveCommand.C, ...arguments);
    }
    bezierBy(dx1, dy1, dx2, dy2, dx, dy) {
        return this.push(CubicBezierCurveCommand.c, ...arguments);
    }
    close() {
        return this.push(ClosePathCommand.z);
    }
    done() {
        this.node.setAttribute('d', this.pathdata);
        return this;
    }
}

class Connector extends Path {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }
    mountTo(g) {
        g.appendChild(this.node);
    }
    dispose() {
        this.node.remove();
    }
}

/**
 * A very small absolute value used to check if a value is very close to
 * zero. The value should be large enough to offset any floating point
 * noise, but small enough to be meaningful in computation in a nominal
 * range (see MACHINE_EPSILON).
 *
 * http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
 * http://www.cs.berkeley.edu/~wkahan/Math128/Cubic.pdf
 */
const EPSILON = 1e-12;
/**
 * The epsilon to be used when performing "trigonometric" checks, such
 * as examining cross products to check for collinearity.
 */
const TRIGONOMETRIC_EPSILON = 1e-8;
/**
 * Checks if the value is 0, within a tolerance defined by
 * Numerical.EPSILON.
 */
function isZero(val) {
    return val >= -EPSILON && val <= EPSILON;
}
const PI2$1 = Math.PI * 2;

class Vector {
    constructor(vt = { x: 0, y: 0 }) {
        this._x = vt.x || 0;
        this._y = vt.y || 0;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    set x(val) { this._x = val; }
    set y(val) { this._y = val; }
    get length() { return Vector.euclideanMetric(this); }
    get angle() { return this.radian * 180 / Math.PI; }
    set angle(angle) { this.radian = angle * Math.PI / 180; }
    get radian() { return Vector.radian(this); }
    set radian(angle) {
        this._angle = angle;
        if (!this.isZero()) {
            let length = this.length;
            // Use #set() instead of direct assignment of x/y, so LinkedPoint
            // does not report changes twice.
            this._x = Math.cos(angle) * length;
            this._y = Math.sin(angle) * length;
        }
    }
    get quadrant() { return Vector.quadrant(this); }
    equals(point) { return Vector.equals(this, point); }
    clone() { return new Vector({ x: this._x, y: this._y }); }
    directedAngleTo(point) { return Vector.directedAngleBetween(this, point); }
    directedRadianTo(point) { return Vector.directedRadianBetween(this, point); }
    distanceTo(point, squared = false) { return Vector.distanceBetween(this, point, squared); }
    normalize(length = 1) { return Vector.normalize(this, length); }
    rotate(radian, center) { return Vector.rotate(this, radian, center); }
    transform(mx) { return Vector.transform(this, mx); }
    add(point) { return new Vector(Vector.add(this, point)); }
    subtract(point) { return new Vector(Vector.subtract(this, point)); }
    multiply(point) { return new Vector(Vector.multiply(this, point)); }
    divide(point) { return new Vector(Vector.divide(this, point)); }
    modulo(point) { return new Vector(Vector.modulo(this, point)); }
    negate() { return new Vector(Vector.negate(this)); }
    isClose(point, tolerance) { return Vector.isClose(this, point, tolerance); }
    isCollinear(point) { return Vector.isCollinear(this, point); }
    isOrthogonal(point) { return Vector.isOrthogonal(this, point); }
    isZero() { return Vector.isZero(this); }
    isNaN() { return Vector.isNaN(this); }
    isInQuadrant(q) { return Vector.isInQuadrant(this, q); }
    dot(point) { return Vector.dot(this, point); }
    cross(point) { return Vector.cross(this, point); }
    project(point) { return new Vector(Vector.project(this, point)); }
    round() { return new Vector(Vector.round(this)); }
    ceil() { return new Vector(Vector.ceil(this)); }
    floor() { return new Vector(Vector.floor(this)); }
    abs() { return new Vector(Vector.abs(this)); }
    static min(...args) {
        return {
            x: Math.min.apply(Math, args.map(v => v.x)),
            y: Math.min.apply(Math, args.map(v => v.y))
        };
    }
    static max(...args) {
        return {
            x: Math.max.apply(Math, args.map(v => v.x)),
            y: Math.max.apply(Math, args.map(v => v.y)),
        };
    }
    static midPoint(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }
    static random() {
        return { x: Math.random(), y: Math.random() };
    }
    static euclideanMetric(v) {
        return Math.sqrt(Vector.taxicabMetric(v));
    }
    static taxicabMetric(v) {
        return v.x * v.x + v.y * v.y;
    }
    static radian(v) {
        return Math.atan2(v.y, v.x);
    }
    static angle(v) {
        return Vector.radian(v) * 180 / Math.PI;
    }
    static quadrant(v) {
        return v.x >= 0 ? v.y >= 0 ? 1 : 4 : v.y >= 0 ? 2 : 3;
    }
    static equals(v1, v2) {
        return v1 === v2 || (v1.x === v2.x && v1.y === v2.y);
    }
    static directedAngleBetween(v1, v2) {
        return Vector.directedRadianBetween(v1, v2) * 180 / Math.PI;
    }
    static directedRadianBetween(v1, v2) {
        return Math.atan2(v2.y - v1.y, v2.x - v1.x);
    }
    static distanceBetween(v1, v2, squared = false) {
        let x = v1.x - v2.x;
        let y = v1.y - v2.y;
        let d = x * x + y * y;
        return squared ? d : Math.sqrt(d);
    }
    static normalize(v, length = 1) {
        let current = Vector.euclideanMetric(v), scale = current !== 0 ? length / current : 0;
        return { x: v.x * scale, y: v.y * scale };
    }
    static rotate(v, radian, center) {
        if (radian === 0)
            return Object.assign({}, v);
        let point = center ? Vector.subtract(v, center) : v, sin = Math.sin(radian), cos = Math.cos(radian);
        point = { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
        return center ? Vector.add(point, center) : point;
    }
    static transform(v, mx) {
        return {
            x: v.x * mx.a + v.y * mx.c + mx.tx,
            y: v.x * mx.b + v.y * mx.d + mx.ty,
        };
    }
    static add(...vs) {
        return vs.reduce((acc, v) => {
            return { x: acc.x + v.x, y: acc.y + v.y };
        }, { x: 0, y: 0 });
    }
    static subtract(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }
    static multiply(v, arg) {
        if (typeof arg === 'number')
            return { x: v.x * arg, y: v.y * arg };
        return { x: v.x * arg.x, y: v.y * arg.y };
    }
    static divide(v, point) {
        return { x: v.x / point.x, y: v.y / point.y };
    }
    static modulo(v, point) {
        return { x: v.x % point.x, y: v.y % point.y };
    }
    static negate(v) {
        return { x: -v.x, y: -v.y };
    }
    static isClose(v, point, tolerance) {
        return Vector.distanceBetween(v, point) <= tolerance;
    }
    static isCollinear(v1, v2) {
        // NOTE: We use normalized vectors so that the epsilon comparison is
        // reliable. We could instead scale the epsilon based on the vector
        // length. But instead of normalizing the vectors before calculating
        // the cross product, we can scale the epsilon accordingly.
        const { x: x1, y: y1 } = v1;
        const { x: x2, y: y2 } = v2;
        return Math.abs(x1 * y2 - y1 * x2) <= Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)) * TRIGONOMETRIC_EPSILON;
    }
    static isOrthogonal(v1, v2) {
        // See Point.isCollinear()
        const { x: x1, y: y1 } = v1;
        const { x: x2, y: y2 } = v2;
        return Math.abs(x1 * x2 + y1 * y2) <= Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)) * TRIGONOMETRIC_EPSILON;
    }
    static isZero(v) {
        return isZero(v.x) && isZero(v.y);
    }
    static isNaN(v) {
        return isNaN(v.x) || isNaN(v.y);
    }
    static isInQuadrant(v, q) {
        // Map quadrant to x & y coordinate pairs and multiply with coordinates,
        // then check sign:
        // 1: [ 1,  1]
        // 2: [-1,  1]
        // 3: [-1, -1]
        // 4: [ 1, -1]
        return v.x * (q > 1 && q < 4 ? -1 : 1) >= 0
            && v.y * (q > 2 ? -1 : 1) >= 0;
    }
    static dot(v, point) {
        return v.x * point.x + v.y * point.y;
    }
    static cross(v, point) {
        return v.x * point.y - v.y * point.x;
    }
    static project(v, point) {
        let scale = Vector.isZero(point) ? 0 : Vector.dot(v, point) / Vector.dot(point, point);
        return { x: point.x * scale, y: point.y * scale };
    }
    static round(v) {
        return { x: Math.round(v.x), y: Math.round(v.y) };
    }
    static ceil(v) {
        return { x: Math.ceil(v.x), y: Math.ceil(v.y) };
    }
    static floor(v) {
        return { x: Math.floor(v.x), y: Math.floor(v.y) };
    }
    static abs(v) {
        return { x: Math.abs(v.x), y: Math.abs(v.y) };
    }
}

var Align;
(function (Align) {
    Align[Align["Top"] = 0] = "Top";
    Align[Align["Center"] = 1] = "Center";
    Align[Align["Bottom"] = 2] = "Bottom";
})(Align || (Align = {}));
var Justify;
(function (Justify) {
    Justify[Justify["Left"] = 0] = "Left";
    Justify[Justify["Middle"] = 1] = "Middle";
    Justify[Justify["Right"] = 2] = "Right";
})(Justify || (Justify = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$1 = { done: true, value: undefined };
var Iterator$1;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$1;
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
                    return FIN$1;
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
                    return FIN$1;
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
                        return FIN$1;
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
})(Iterator$1 || (Iterator$1 = {}));

function find(arr, predicate) {
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (predicate(element, i, arr)) {
            return element;
        }
    }
    return undefined;
}
function findIndex(arr, predicate) {
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (predicate(element, i, arr)) {
            return i;
        }
    }
    return -1;
}
function forEach(object, fn) {
    let index = 0;
    let it = Iterator$1.fromArray(object);
    let result;
    while (!(result = it.next()).done) {
        if (fn(result.value, index++) === false) {
            return;
        }
    }
}

class Signal {
    constructor(sender) {
        this.sender = sender;
    }
    connect(slot, thisArg) {
        return Private.connect(this, slot, thisArg);
    }
    disconnect(slot, thisArg) {
        return Private.disconnect(this, slot, thisArg);
    }
    emit(args) {
        Private.emit(this, args);
    }
}
(function (Signal) {
    function disconnectBetween(sender, receiver) {
        Private.disconnectBetween(sender, receiver);
    }
    Signal.disconnectBetween = disconnectBetween;
    function disconnectSender(sender) {
        Private.disconnectSender(sender);
    }
    Signal.disconnectSender = disconnectSender;
    function disconnectReceiver(receiver) {
        Private.disconnectReceiver(receiver);
    }
    Signal.disconnectReceiver = disconnectReceiver;
    function disconnectAll(object) {
        Private.disconnectAll(object);
    }
    Signal.disconnectAll = disconnectAll;
    function clearData(object) {
        Private.disconnectAll(object);
    }
    Signal.clearData = clearData;
    function getExceptionHandler() {
        return Private.exceptionHandler;
    }
    Signal.getExceptionHandler = getExceptionHandler;
    function setExceptionHandler(handler) {
        let old = Private.exceptionHandler;
        Private.exceptionHandler = handler;
        return old;
    }
    Signal.setExceptionHandler = setExceptionHandler;
})(Signal || (Signal = {}));
var Private;
(function (Private) {
    Private.exceptionHandler = (err) => {
        console.error(err);
    };
    function connect(signal, slot, thisArg) {
        // Coerce a `null` `thisArg` to `undefined`.
        thisArg = thisArg || undefined;
        // Ensure the sender's array of receivers is created.
        let receivers = receiversForSender.get(signal.sender);
        if (!receivers) {
            receivers = [];
            receiversForSender.set(signal.sender, receivers);
        }
        // Bail if a matching connection already exists.
        if (findConnection(receivers, signal, slot, thisArg)) {
            return false;
        }
        // Choose the best object for the receiver.
        let receiver = thisArg || slot;
        // Ensure the receiver's array of senders is created.
        let senders = sendersForReceiver.get(receiver);
        if (!senders) {
            senders = [];
            sendersForReceiver.set(receiver, senders);
        }
        // Create a new connection and add it to the end of each array.
        let connection = { signal, slot, thisArg };
        receivers.push(connection);
        senders.push(connection);
        // Indicate a successful connection.
        return true;
    }
    Private.connect = connect;
    /**
     * Disconnect a slot from a signal.
     *
     * @param signal - The signal of interest.
     *
     * @param slot - The slot to disconnect from the signal.
     *
     * @param thisArg - The `this` context for the slot. If provided,
     *   this must be a non-primitive object.
     *
     * @returns `true` if the connection is removed, `false` otherwise.
     */
    function disconnect(signal, slot, thisArg) {
        // Coerce a `null` `thisArg` to `undefined`.
        thisArg = thisArg || undefined;
        // Lookup the list of receivers, and bail if none exist.
        let receivers = receiversForSender.get(signal.sender);
        if (!receivers || receivers.length === 0) {
            return false;
        }
        // Bail if no matching connection exits.
        let connection = findConnection(receivers, signal, slot, thisArg);
        if (!connection) {
            return false;
        }
        // Choose the best object for the receiver.
        let receiver = thisArg || slot;
        // Lookup the array of senders, which is now known to exist.
        let senders = sendersForReceiver.get(receiver);
        // Clear the connection and schedule cleanup of the arrays.
        connection.signal = null;
        doCleanup(receivers);
        doCleanup(senders);
        // Indicate a successful disconnection.
        return true;
    }
    Private.disconnect = disconnect;
    /**
     * Remove all connections between a sender and receiver.
     *
     * @param sender - The sender object of interest.
     *
     * @param receiver - The receiver object of interest.
     */
    function disconnectBetween(sender, receiver) {
        // If there are no receivers, there is nothing to do.
        let receivers = receiversForSender.get(sender);
        if (!receivers || receivers.length === 0) {
            return;
        }
        // If there are no senders, there is nothing to do.
        let senders = sendersForReceiver.get(receiver);
        if (!senders || senders.length === 0) {
            return;
        }
        // Clear each connection between the sender and receiver.
        forEach(senders, connection => {
            // Skip connections which have already been cleared.
            if (!connection.signal) {
                return;
            }
            // Clear the connection if it matches the sender.
            if (connection.signal.sender === sender) {
                connection.signal = null;
            }
        });
        // Schedule a cleanup of the senders and receivers.
        doCleanup(receivers);
        doCleanup(senders);
    }
    Private.disconnectBetween = disconnectBetween;
    /**
     * Remove all connections where the given object is the sender.
     *
     * @param sender - The sender object of interest.
     */
    function disconnectSender(sender) {
        // If there are no receivers, there is nothing to do.
        let receivers = receiversForSender.get(sender);
        if (!receivers || receivers.length === 0) {
            return;
        }
        // Clear each receiver connection.
        forEach(receivers, connection => {
            // Skip connections which have already been cleared.
            if (!connection.signal) {
                return;
            }
            // Choose the best object for the receiver.
            let receiver = connection.thisArg || connection.slot;
            // Clear the connection.
            connection.signal = null;
            // Cleanup the array of senders, which is now known to exist.
            doCleanup(sendersForReceiver.get(receiver));
        });
        // Schedule a cleanup of the receivers.
        doCleanup(receivers);
    }
    Private.disconnectSender = disconnectSender;
    /**
     * Remove all connections where the given object is the receiver.
     *
     * @param receiver - The receiver object of interest.
     */
    function disconnectReceiver(receiver) {
        // If there are no senders, there is nothing to do.
        let senders = sendersForReceiver.get(receiver);
        if (!senders || senders.length === 0) {
            return;
        }
        // Clear each sender connection.
        forEach(senders, connection => {
            // Skip connections which have already been cleared.
            if (!connection.signal) {
                return;
            }
            // Lookup the sender for the connection.
            let sender = connection.signal.sender;
            // Clear the connection.
            connection.signal = null;
            // Cleanup the array of receivers, which is now known to exist.
            doCleanup(receiversForSender.get(sender));
        });
        // Schedule a cleanup of the list of senders.
        doCleanup(senders);
    }
    Private.disconnectReceiver = disconnectReceiver;
    /**
     * Remove all connections where an object is the sender or receiver.
     *
     * @param object - The object of interest.
     */
    function disconnectAll(object) {
        // Clear and cleanup any receiver connections.
        let receivers = receiversForSender.get(object);
        if (receivers && receivers.length > 0) {
            forEach(receivers, connection => { connection.signal = null; });
            doCleanup(receivers);
        }
        // Clear and cleanup any sender connections.
        let senders = sendersForReceiver.get(object);
        if (senders && senders.length > 0) {
            forEach(senders, connection => { connection.signal = null; });
            doCleanup(senders);
        }
    }
    Private.disconnectAll = disconnectAll;
    function emit(signal, args) {
        // If there are no receivers, there is nothing to do.
        let receivers = receiversForSender.get(signal.sender);
        if (!receivers || receivers.length === 0) {
            return;
        }
        // Invoke the slots for connections with a matching signal.
        // Any connections added during emission are not invoked.
        for (let i = 0, n = receivers.length; i < n; ++i) {
            let connection = receivers[i];
            if (connection.signal === signal) {
                invokeSlot(connection, args);
            }
        }
    }
    Private.emit = emit;
    const receiversForSender = new WeakMap();
    const sendersForReceiver = new WeakMap();
    function findConnection(connections, signal, slot, thisArg) {
        return find(connections, connection => (connection.signal === signal &&
            connection.slot === slot &&
            connection.thisArg === thisArg));
    }
    function invokeSlot(connection, args) {
        let { signal, slot, thisArg } = connection;
        try {
            slot.call(thisArg, signal.sender, args);
        }
        catch (err) {
            Private.exceptionHandler(err);
        }
    }
    function doCleanup(array) {
        // isDeadConnection: connection.signal === null
        array = array.filter(connection => !!connection.signal);
    }
})(Private || (Private = {}));

let { userAgent } = navigator;
var Platform;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform || (Platform = {}));
let _platform = Platform.Web;
const isWindows = userAgent.indexOf('Windows') >= 0;
const isMacintosh = userAgent.indexOf('Macintosh') >= 0;
const isLinux = userAgent.indexOf('Linux') >= 0;
const isIE = (userAgent.indexOf('Trident') >= 0);
const isEdge = (userAgent.indexOf('Edge/') >= 0);
const isOpera = (userAgent.indexOf('Opera') >= 0);
const isFirefox = (userAgent.indexOf('Firefox') >= 0);
const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
const isChrome = (userAgent.indexOf('Chrome') >= 0);
const isSafari = (!isChrome && (userAgent.indexOf('Safari') >= 0));
const isIPad = (userAgent.indexOf('iPad') >= 0);
const isEdgeWebView = isEdge && (userAgent.indexOf('WebView/') >= 0);

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Names from https://blog.codinghorror.com/ascii-pronunciation-rules-for-programmers/
/**
 * An inlined enum containing useful character codes (to be used with String.charCodeAt).
 * Please leave the const keyword such that it gets inlined when compiled to JavaScript!
 */
var CharCode;
(function (CharCode) {
    CharCode[CharCode["Null"] = 0] = "Null";
    /**
     * The `\t` character.
     */
    CharCode[CharCode["Tab"] = 9] = "Tab";
    /**
     * The `\n` character.
     */
    CharCode[CharCode["LineFeed"] = 10] = "LineFeed";
    /**
     * The `\r` character.
     */
    CharCode[CharCode["CarriageReturn"] = 13] = "CarriageReturn";
    CharCode[CharCode["Space"] = 32] = "Space";
    /**
     * The `!` character.
     */
    CharCode[CharCode["ExclamationMark"] = 33] = "ExclamationMark";
    /**
     * The `"` character.
     */
    CharCode[CharCode["DoubleQuote"] = 34] = "DoubleQuote";
    /**
     * The `#` character.
     */
    CharCode[CharCode["Hash"] = 35] = "Hash";
    /**
     * The `$` character.
     */
    CharCode[CharCode["DollarSign"] = 36] = "DollarSign";
    /**
     * The `%` character.
     */
    CharCode[CharCode["PercentSign"] = 37] = "PercentSign";
    /**
     * The `&` character.
     */
    CharCode[CharCode["Ampersand"] = 38] = "Ampersand";
    /**
     * The `'` character.
     */
    CharCode[CharCode["SingleQuote"] = 39] = "SingleQuote";
    /**
     * The `(` character.
     */
    CharCode[CharCode["OpenParen"] = 40] = "OpenParen";
    /**
     * The `)` character.
     */
    CharCode[CharCode["CloseParen"] = 41] = "CloseParen";
    /**
     * The `*` character.
     */
    CharCode[CharCode["Asterisk"] = 42] = "Asterisk";
    /**
     * The `+` character.
     */
    CharCode[CharCode["Plus"] = 43] = "Plus";
    /**
     * The `,` character.
     */
    CharCode[CharCode["Comma"] = 44] = "Comma";
    /**
     * The `-` character.
     */
    CharCode[CharCode["Dash"] = 45] = "Dash";
    /**
     * The `.` character.
     */
    CharCode[CharCode["Period"] = 46] = "Period";
    /**
     * The `/` character.
     */
    CharCode[CharCode["Slash"] = 47] = "Slash";
    CharCode[CharCode["Digit0"] = 48] = "Digit0";
    CharCode[CharCode["Digit1"] = 49] = "Digit1";
    CharCode[CharCode["Digit2"] = 50] = "Digit2";
    CharCode[CharCode["Digit3"] = 51] = "Digit3";
    CharCode[CharCode["Digit4"] = 52] = "Digit4";
    CharCode[CharCode["Digit5"] = 53] = "Digit5";
    CharCode[CharCode["Digit6"] = 54] = "Digit6";
    CharCode[CharCode["Digit7"] = 55] = "Digit7";
    CharCode[CharCode["Digit8"] = 56] = "Digit8";
    CharCode[CharCode["Digit9"] = 57] = "Digit9";
    /**
     * The `:` character.
     */
    CharCode[CharCode["Colon"] = 58] = "Colon";
    /**
     * The `;` character.
     */
    CharCode[CharCode["Semicolon"] = 59] = "Semicolon";
    /**
     * The `<` character.
     */
    CharCode[CharCode["LessThan"] = 60] = "LessThan";
    /**
     * The `=` character.
     */
    CharCode[CharCode["Equals"] = 61] = "Equals";
    /**
     * The `>` character.
     */
    CharCode[CharCode["GreaterThan"] = 62] = "GreaterThan";
    /**
     * The `?` character.
     */
    CharCode[CharCode["QuestionMark"] = 63] = "QuestionMark";
    /**
     * The `@` character.
     */
    CharCode[CharCode["AtSign"] = 64] = "AtSign";
    CharCode[CharCode["A"] = 65] = "A";
    CharCode[CharCode["B"] = 66] = "B";
    CharCode[CharCode["C"] = 67] = "C";
    CharCode[CharCode["D"] = 68] = "D";
    CharCode[CharCode["E"] = 69] = "E";
    CharCode[CharCode["F"] = 70] = "F";
    CharCode[CharCode["G"] = 71] = "G";
    CharCode[CharCode["H"] = 72] = "H";
    CharCode[CharCode["I"] = 73] = "I";
    CharCode[CharCode["J"] = 74] = "J";
    CharCode[CharCode["K"] = 75] = "K";
    CharCode[CharCode["L"] = 76] = "L";
    CharCode[CharCode["M"] = 77] = "M";
    CharCode[CharCode["N"] = 78] = "N";
    CharCode[CharCode["O"] = 79] = "O";
    CharCode[CharCode["P"] = 80] = "P";
    CharCode[CharCode["Q"] = 81] = "Q";
    CharCode[CharCode["R"] = 82] = "R";
    CharCode[CharCode["S"] = 83] = "S";
    CharCode[CharCode["T"] = 84] = "T";
    CharCode[CharCode["U"] = 85] = "U";
    CharCode[CharCode["V"] = 86] = "V";
    CharCode[CharCode["W"] = 87] = "W";
    CharCode[CharCode["X"] = 88] = "X";
    CharCode[CharCode["Y"] = 89] = "Y";
    CharCode[CharCode["Z"] = 90] = "Z";
    /**
     * The `[` character.
     */
    CharCode[CharCode["OpenSquareBracket"] = 91] = "OpenSquareBracket";
    /**
     * The `\` character.
     */
    CharCode[CharCode["Backslash"] = 92] = "Backslash";
    /**
     * The `]` character.
     */
    CharCode[CharCode["CloseSquareBracket"] = 93] = "CloseSquareBracket";
    /**
     * The `^` character.
     */
    CharCode[CharCode["Caret"] = 94] = "Caret";
    /**
     * The `_` character.
     */
    CharCode[CharCode["Underline"] = 95] = "Underline";
    /**
     * The ``(`)`` character.
     */
    CharCode[CharCode["BackTick"] = 96] = "BackTick";
    CharCode[CharCode["a"] = 97] = "a";
    CharCode[CharCode["b"] = 98] = "b";
    CharCode[CharCode["c"] = 99] = "c";
    CharCode[CharCode["d"] = 100] = "d";
    CharCode[CharCode["e"] = 101] = "e";
    CharCode[CharCode["f"] = 102] = "f";
    CharCode[CharCode["g"] = 103] = "g";
    CharCode[CharCode["h"] = 104] = "h";
    CharCode[CharCode["i"] = 105] = "i";
    CharCode[CharCode["j"] = 106] = "j";
    CharCode[CharCode["k"] = 107] = "k";
    CharCode[CharCode["l"] = 108] = "l";
    CharCode[CharCode["m"] = 109] = "m";
    CharCode[CharCode["n"] = 110] = "n";
    CharCode[CharCode["o"] = 111] = "o";
    CharCode[CharCode["p"] = 112] = "p";
    CharCode[CharCode["q"] = 113] = "q";
    CharCode[CharCode["r"] = 114] = "r";
    CharCode[CharCode["s"] = 115] = "s";
    CharCode[CharCode["t"] = 116] = "t";
    CharCode[CharCode["u"] = 117] = "u";
    CharCode[CharCode["v"] = 118] = "v";
    CharCode[CharCode["w"] = 119] = "w";
    CharCode[CharCode["x"] = 120] = "x";
    CharCode[CharCode["y"] = 121] = "y";
    CharCode[CharCode["z"] = 122] = "z";
    /**
     * The `{` character.
       */
    CharCode[CharCode["OpenCurlyBrace"] = 123] = "OpenCurlyBrace";
    /**
     * The `|` character.
     */
    CharCode[CharCode["Pipe"] = 124] = "Pipe";
    /**
     * The `}` character.
     */
    CharCode[CharCode["CloseCurlyBrace"] = 125] = "CloseCurlyBrace";
    /**
     * The `~` character.
     */
    CharCode[CharCode["Tilde"] = 126] = "Tilde";
    CharCode[CharCode["U_Combining_Grave_Accent"] = 768] = "U_Combining_Grave_Accent";
    CharCode[CharCode["U_Combining_Acute_Accent"] = 769] = "U_Combining_Acute_Accent";
    CharCode[CharCode["U_Combining_Circumflex_Accent"] = 770] = "U_Combining_Circumflex_Accent";
    CharCode[CharCode["U_Combining_Tilde"] = 771] = "U_Combining_Tilde";
    CharCode[CharCode["U_Combining_Macron"] = 772] = "U_Combining_Macron";
    CharCode[CharCode["U_Combining_Overline"] = 773] = "U_Combining_Overline";
    CharCode[CharCode["U_Combining_Breve"] = 774] = "U_Combining_Breve";
    CharCode[CharCode["U_Combining_Dot_Above"] = 775] = "U_Combining_Dot_Above";
    CharCode[CharCode["U_Combining_Diaeresis"] = 776] = "U_Combining_Diaeresis";
    CharCode[CharCode["U_Combining_Hook_Above"] = 777] = "U_Combining_Hook_Above";
    CharCode[CharCode["U_Combining_Ring_Above"] = 778] = "U_Combining_Ring_Above";
    CharCode[CharCode["U_Combining_Double_Acute_Accent"] = 779] = "U_Combining_Double_Acute_Accent";
    CharCode[CharCode["U_Combining_Caron"] = 780] = "U_Combining_Caron";
    CharCode[CharCode["U_Combining_Vertical_Line_Above"] = 781] = "U_Combining_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Above"] = 782] = "U_Combining_Double_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Grave_Accent"] = 783] = "U_Combining_Double_Grave_Accent";
    CharCode[CharCode["U_Combining_Candrabindu"] = 784] = "U_Combining_Candrabindu";
    CharCode[CharCode["U_Combining_Inverted_Breve"] = 785] = "U_Combining_Inverted_Breve";
    CharCode[CharCode["U_Combining_Turned_Comma_Above"] = 786] = "U_Combining_Turned_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above"] = 787] = "U_Combining_Comma_Above";
    CharCode[CharCode["U_Combining_Reversed_Comma_Above"] = 788] = "U_Combining_Reversed_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above_Right"] = 789] = "U_Combining_Comma_Above_Right";
    CharCode[CharCode["U_Combining_Grave_Accent_Below"] = 790] = "U_Combining_Grave_Accent_Below";
    CharCode[CharCode["U_Combining_Acute_Accent_Below"] = 791] = "U_Combining_Acute_Accent_Below";
    CharCode[CharCode["U_Combining_Left_Tack_Below"] = 792] = "U_Combining_Left_Tack_Below";
    CharCode[CharCode["U_Combining_Right_Tack_Below"] = 793] = "U_Combining_Right_Tack_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Above"] = 794] = "U_Combining_Left_Angle_Above";
    CharCode[CharCode["U_Combining_Horn"] = 795] = "U_Combining_Horn";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Below"] = 796] = "U_Combining_Left_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Up_Tack_Below"] = 797] = "U_Combining_Up_Tack_Below";
    CharCode[CharCode["U_Combining_Down_Tack_Below"] = 798] = "U_Combining_Down_Tack_Below";
    CharCode[CharCode["U_Combining_Plus_Sign_Below"] = 799] = "U_Combining_Plus_Sign_Below";
    CharCode[CharCode["U_Combining_Minus_Sign_Below"] = 800] = "U_Combining_Minus_Sign_Below";
    CharCode[CharCode["U_Combining_Palatalized_Hook_Below"] = 801] = "U_Combining_Palatalized_Hook_Below";
    CharCode[CharCode["U_Combining_Retroflex_Hook_Below"] = 802] = "U_Combining_Retroflex_Hook_Below";
    CharCode[CharCode["U_Combining_Dot_Below"] = 803] = "U_Combining_Dot_Below";
    CharCode[CharCode["U_Combining_Diaeresis_Below"] = 804] = "U_Combining_Diaeresis_Below";
    CharCode[CharCode["U_Combining_Ring_Below"] = 805] = "U_Combining_Ring_Below";
    CharCode[CharCode["U_Combining_Comma_Below"] = 806] = "U_Combining_Comma_Below";
    CharCode[CharCode["U_Combining_Cedilla"] = 807] = "U_Combining_Cedilla";
    CharCode[CharCode["U_Combining_Ogonek"] = 808] = "U_Combining_Ogonek";
    CharCode[CharCode["U_Combining_Vertical_Line_Below"] = 809] = "U_Combining_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Bridge_Below"] = 810] = "U_Combining_Bridge_Below";
    CharCode[CharCode["U_Combining_Inverted_Double_Arch_Below"] = 811] = "U_Combining_Inverted_Double_Arch_Below";
    CharCode[CharCode["U_Combining_Caron_Below"] = 812] = "U_Combining_Caron_Below";
    CharCode[CharCode["U_Combining_Circumflex_Accent_Below"] = 813] = "U_Combining_Circumflex_Accent_Below";
    CharCode[CharCode["U_Combining_Breve_Below"] = 814] = "U_Combining_Breve_Below";
    CharCode[CharCode["U_Combining_Inverted_Breve_Below"] = 815] = "U_Combining_Inverted_Breve_Below";
    CharCode[CharCode["U_Combining_Tilde_Below"] = 816] = "U_Combining_Tilde_Below";
    CharCode[CharCode["U_Combining_Macron_Below"] = 817] = "U_Combining_Macron_Below";
    CharCode[CharCode["U_Combining_Low_Line"] = 818] = "U_Combining_Low_Line";
    CharCode[CharCode["U_Combining_Double_Low_Line"] = 819] = "U_Combining_Double_Low_Line";
    CharCode[CharCode["U_Combining_Tilde_Overlay"] = 820] = "U_Combining_Tilde_Overlay";
    CharCode[CharCode["U_Combining_Short_Stroke_Overlay"] = 821] = "U_Combining_Short_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Long_Stroke_Overlay"] = 822] = "U_Combining_Long_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Short_Solidus_Overlay"] = 823] = "U_Combining_Short_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Long_Solidus_Overlay"] = 824] = "U_Combining_Long_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Below"] = 825] = "U_Combining_Right_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Inverted_Bridge_Below"] = 826] = "U_Combining_Inverted_Bridge_Below";
    CharCode[CharCode["U_Combining_Square_Below"] = 827] = "U_Combining_Square_Below";
    CharCode[CharCode["U_Combining_Seagull_Below"] = 828] = "U_Combining_Seagull_Below";
    CharCode[CharCode["U_Combining_X_Above"] = 829] = "U_Combining_X_Above";
    CharCode[CharCode["U_Combining_Vertical_Tilde"] = 830] = "U_Combining_Vertical_Tilde";
    CharCode[CharCode["U_Combining_Double_Overline"] = 831] = "U_Combining_Double_Overline";
    CharCode[CharCode["U_Combining_Grave_Tone_Mark"] = 832] = "U_Combining_Grave_Tone_Mark";
    CharCode[CharCode["U_Combining_Acute_Tone_Mark"] = 833] = "U_Combining_Acute_Tone_Mark";
    CharCode[CharCode["U_Combining_Greek_Perispomeni"] = 834] = "U_Combining_Greek_Perispomeni";
    CharCode[CharCode["U_Combining_Greek_Koronis"] = 835] = "U_Combining_Greek_Koronis";
    CharCode[CharCode["U_Combining_Greek_Dialytika_Tonos"] = 836] = "U_Combining_Greek_Dialytika_Tonos";
    CharCode[CharCode["U_Combining_Greek_Ypogegrammeni"] = 837] = "U_Combining_Greek_Ypogegrammeni";
    CharCode[CharCode["U_Combining_Bridge_Above"] = 838] = "U_Combining_Bridge_Above";
    CharCode[CharCode["U_Combining_Equals_Sign_Below"] = 839] = "U_Combining_Equals_Sign_Below";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Below"] = 840] = "U_Combining_Double_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Below"] = 841] = "U_Combining_Left_Angle_Below";
    CharCode[CharCode["U_Combining_Not_Tilde_Above"] = 842] = "U_Combining_Not_Tilde_Above";
    CharCode[CharCode["U_Combining_Homothetic_Above"] = 843] = "U_Combining_Homothetic_Above";
    CharCode[CharCode["U_Combining_Almost_Equal_To_Above"] = 844] = "U_Combining_Almost_Equal_To_Above";
    CharCode[CharCode["U_Combining_Left_Right_Arrow_Below"] = 845] = "U_Combining_Left_Right_Arrow_Below";
    CharCode[CharCode["U_Combining_Upwards_Arrow_Below"] = 846] = "U_Combining_Upwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Grapheme_Joiner"] = 847] = "U_Combining_Grapheme_Joiner";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Above"] = 848] = "U_Combining_Right_Arrowhead_Above";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Above"] = 849] = "U_Combining_Left_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Fermata"] = 850] = "U_Combining_Fermata";
    CharCode[CharCode["U_Combining_X_Below"] = 851] = "U_Combining_X_Below";
    CharCode[CharCode["U_Combining_Left_Arrowhead_Below"] = 852] = "U_Combining_Left_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Below"] = 853] = "U_Combining_Right_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below"] = 854] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Above"] = 855] = "U_Combining_Right_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Dot_Above_Right"] = 856] = "U_Combining_Dot_Above_Right";
    CharCode[CharCode["U_Combining_Asterisk_Below"] = 857] = "U_Combining_Asterisk_Below";
    CharCode[CharCode["U_Combining_Double_Ring_Below"] = 858] = "U_Combining_Double_Ring_Below";
    CharCode[CharCode["U_Combining_Zigzag_Above"] = 859] = "U_Combining_Zigzag_Above";
    CharCode[CharCode["U_Combining_Double_Breve_Below"] = 860] = "U_Combining_Double_Breve_Below";
    CharCode[CharCode["U_Combining_Double_Breve"] = 861] = "U_Combining_Double_Breve";
    CharCode[CharCode["U_Combining_Double_Macron"] = 862] = "U_Combining_Double_Macron";
    CharCode[CharCode["U_Combining_Double_Macron_Below"] = 863] = "U_Combining_Double_Macron_Below";
    CharCode[CharCode["U_Combining_Double_Tilde"] = 864] = "U_Combining_Double_Tilde";
    CharCode[CharCode["U_Combining_Double_Inverted_Breve"] = 865] = "U_Combining_Double_Inverted_Breve";
    CharCode[CharCode["U_Combining_Double_Rightwards_Arrow_Below"] = 866] = "U_Combining_Double_Rightwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_A"] = 867] = "U_Combining_Latin_Small_Letter_A";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_E"] = 868] = "U_Combining_Latin_Small_Letter_E";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_I"] = 869] = "U_Combining_Latin_Small_Letter_I";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_O"] = 870] = "U_Combining_Latin_Small_Letter_O";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_U"] = 871] = "U_Combining_Latin_Small_Letter_U";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_C"] = 872] = "U_Combining_Latin_Small_Letter_C";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_D"] = 873] = "U_Combining_Latin_Small_Letter_D";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_H"] = 874] = "U_Combining_Latin_Small_Letter_H";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_M"] = 875] = "U_Combining_Latin_Small_Letter_M";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_R"] = 876] = "U_Combining_Latin_Small_Letter_R";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_T"] = 877] = "U_Combining_Latin_Small_Letter_T";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_V"] = 878] = "U_Combining_Latin_Small_Letter_V";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_X"] = 879] = "U_Combining_Latin_Small_Letter_X";
    /**
     * Unicode Character 'LINE SEPARATOR' (U+2028)
     * http://www.fileformat.info/info/unicode/char/2028/index.htm
     */
    CharCode[CharCode["LINE_SEPARATOR_2028"] = 8232] = "LINE_SEPARATOR_2028";
    // http://www.fileformat.info/info/unicode/category/Sk/list.htm
    CharCode[CharCode["U_CIRCUMFLEX"] = 94] = "U_CIRCUMFLEX";
    CharCode[CharCode["U_GRAVE_ACCENT"] = 96] = "U_GRAVE_ACCENT";
    CharCode[CharCode["U_DIAERESIS"] = 168] = "U_DIAERESIS";
    CharCode[CharCode["U_MACRON"] = 175] = "U_MACRON";
    CharCode[CharCode["U_ACUTE_ACCENT"] = 180] = "U_ACUTE_ACCENT";
    CharCode[CharCode["U_CEDILLA"] = 184] = "U_CEDILLA";
    CharCode[CharCode["U_MODIFIER_LETTER_LEFT_ARROWHEAD"] = 706] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_RIGHT_ARROWHEAD"] = 707] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_ARROWHEAD"] = 708] = "U_MODIFIER_LETTER_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_ARROWHEAD"] = 709] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING"] = 722] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING"] = 723] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_TACK"] = 724] = "U_MODIFIER_LETTER_UP_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_TACK"] = 725] = "U_MODIFIER_LETTER_DOWN_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_PLUS_SIGN"] = 726] = "U_MODIFIER_LETTER_PLUS_SIGN";
    CharCode[CharCode["U_MODIFIER_LETTER_MINUS_SIGN"] = 727] = "U_MODIFIER_LETTER_MINUS_SIGN";
    CharCode[CharCode["U_BREVE"] = 728] = "U_BREVE";
    CharCode[CharCode["U_DOT_ABOVE"] = 729] = "U_DOT_ABOVE";
    CharCode[CharCode["U_RING_ABOVE"] = 730] = "U_RING_ABOVE";
    CharCode[CharCode["U_OGONEK"] = 731] = "U_OGONEK";
    CharCode[CharCode["U_SMALL_TILDE"] = 732] = "U_SMALL_TILDE";
    CharCode[CharCode["U_DOUBLE_ACUTE_ACCENT"] = 733] = "U_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_RHOTIC_HOOK"] = 734] = "U_MODIFIER_LETTER_RHOTIC_HOOK";
    CharCode[CharCode["U_MODIFIER_LETTER_CROSS_ACCENT"] = 735] = "U_MODIFIER_LETTER_CROSS_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR"] = 741] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_HIGH_TONE_BAR"] = 742] = "U_MODIFIER_LETTER_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_MID_TONE_BAR"] = 743] = "U_MODIFIER_LETTER_MID_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TONE_BAR"] = 744] = "U_MODIFIER_LETTER_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR"] = 745] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK"] = 746] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK"] = 747] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_UNASPIRATED"] = 749] = "U_MODIFIER_LETTER_UNASPIRATED";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD"] = 751] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_UP_ARROWHEAD"] = 752] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD"] = 753] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD"] = 754] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RING"] = 755] = "U_MODIFIER_LETTER_LOW_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT"] = 756] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT"] = 757] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT"] = 758] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TILDE"] = 759] = "U_MODIFIER_LETTER_LOW_TILDE";
    CharCode[CharCode["U_MODIFIER_LETTER_RAISED_COLON"] = 760] = "U_MODIFIER_LETTER_RAISED_COLON";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_HIGH_TONE"] = 761] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_HIGH_TONE"] = 762] = "U_MODIFIER_LETTER_END_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_LOW_TONE"] = 763] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_LOW_TONE"] = 764] = "U_MODIFIER_LETTER_END_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_SHELF"] = 765] = "U_MODIFIER_LETTER_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_OPEN_SHELF"] = 766] = "U_MODIFIER_LETTER_OPEN_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROW"] = 767] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW";
    CharCode[CharCode["U_GREEK_LOWER_NUMERAL_SIGN"] = 885] = "U_GREEK_LOWER_NUMERAL_SIGN";
    CharCode[CharCode["U_GREEK_TONOS"] = 900] = "U_GREEK_TONOS";
    CharCode[CharCode["U_GREEK_DIALYTIKA_TONOS"] = 901] = "U_GREEK_DIALYTIKA_TONOS";
    CharCode[CharCode["U_GREEK_KORONIS"] = 8125] = "U_GREEK_KORONIS";
    CharCode[CharCode["U_GREEK_PSILI"] = 8127] = "U_GREEK_PSILI";
    CharCode[CharCode["U_GREEK_PERISPOMENI"] = 8128] = "U_GREEK_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_PERISPOMENI"] = 8129] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_PSILI_AND_VARIA"] = 8141] = "U_GREEK_PSILI_AND_VARIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_OXIA"] = 8142] = "U_GREEK_PSILI_AND_OXIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_PERISPOMENI"] = 8143] = "U_GREEK_PSILI_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DASIA_AND_VARIA"] = 8157] = "U_GREEK_DASIA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_OXIA"] = 8158] = "U_GREEK_DASIA_AND_OXIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_PERISPOMENI"] = 8159] = "U_GREEK_DASIA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_VARIA"] = 8173] = "U_GREEK_DIALYTIKA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_OXIA"] = 8174] = "U_GREEK_DIALYTIKA_AND_OXIA";
    CharCode[CharCode["U_GREEK_VARIA"] = 8175] = "U_GREEK_VARIA";
    CharCode[CharCode["U_GREEK_OXIA"] = 8189] = "U_GREEK_OXIA";
    CharCode[CharCode["U_GREEK_DASIA"] = 8190] = "U_GREEK_DASIA";
    CharCode[CharCode["U_OVERLINE"] = 8254] = "U_OVERLINE";
    /**
     * UTF-8 BOM
     * Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
     * http://www.fileformat.info/info/unicode/char/feff/index.htm
     */
    CharCode[CharCode["UTF8_BOM"] = 65279] = "UTF8_BOM";
})(CharCode || (CharCode = {}));

const _manualClassList = new class {
    _findClassName(node, className) {
        let classes = node.className;
        if (!classes) {
            this._lastStart = -1;
            return;
        }
        className = className.trim();
        let classesLen = classes.length, classLen = className.length;
        if (classLen === 0) {
            this._lastStart = -1;
            return;
        }
        if (classesLen < classLen) {
            this._lastStart = -1;
            return;
        }
        if (classes === className) {
            this._lastStart = 0;
            this._lastEnd = classesLen;
            return;
        }
        let idx = -1, idxEnd;
        while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
            idxEnd = idx + classLen;
            // a class that is followed by another class
            if ((idx === 0 || classes.charCodeAt(idx - 1) === CharCode.Space) && classes.charCodeAt(idxEnd) === CharCode.Space) {
                this._lastStart = idx;
                this._lastEnd = idxEnd + 1;
                return;
            }
            // last class
            if (idx > 0 && classes.charCodeAt(idx - 1) === CharCode.Space && idxEnd === classesLen) {
                this._lastStart = idx - 1;
                this._lastEnd = idxEnd;
                return;
            }
            // equal - duplicate of cmp above
            if (idx === 0 && idxEnd === classesLen) {
                this._lastStart = 0;
                this._lastEnd = idxEnd;
                return;
            }
        }
        this._lastStart = -1;
    }
    hasClass(node, className) {
        this._findClassName(node, className);
        return this._lastStart !== -1;
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (!node.className) { // doesn't have it for sure
            node.className = className;
        }
        else {
            this._findClassName(node, className); // see if it's already there
            if (this._lastStart === -1) {
                node.className = node.className + ' ' + className;
            }
        }
    }
    removeClass(node, className) {
        this._findClassName(node, className);
        if (this._lastStart === -1) {
            return; // Prevent styles invalidation if not necessary
        }
        else {
            node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        this._findClassName(node, className);
        if (this._lastStart !== -1 && (shouldHaveIt === undefined || !shouldHaveIt)) {
            this.removeClass(node, className);
        }
        if (this._lastStart === -1 && (shouldHaveIt === undefined || shouldHaveIt)) {
            this.addClass(node, className);
        }
    }
};
const _nativeClassList = new class {
    hasClass(node, className) {
        return Boolean(className) && node.classList && node.classList.contains(className);
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (className && node.classList) {
            node.classList.add(className);
        }
    }
    removeClass(node, className) {
        if (className && node.classList) {
            node.classList.remove(className);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        if (node.classList) {
            node.classList.toggle(className, shouldHaveIt);
        }
    }
};
// In IE11 there is only partial support for `classList` which makes us keep our
// custom implementation. Otherwise use the native implementation, see: http://caniuse.com/#search=classlist
const _classList = isIE ? _manualClassList : _nativeClassList;
const hasClass = _classList.hasClass.bind(_classList);
const addClass = _classList.addClass.bind(_classList);
const addClasses = _classList.addClasses.bind(_classList);
const removeClass = _classList.removeClass.bind(_classList);
const removeClasses = _classList.removeClasses.bind(_classList);
const toggleClass = _classList.toggleClass.bind(_classList);

class DomListener {
    constructor(node, type, handler, useCapture) {
        this._node = node;
        this._type = type;
        this._handler = handler;
        this._useCapture = (useCapture || false);
        this._node.addEventListener(this._type, this._handler, this._useCapture);
    }
    dispose() {
        if (!this._handler) {
            // Already disposed
            return;
        }
        this._node.removeEventListener(this._type, this._handler, this._useCapture);
        // Prevent leakers from holding on to the dom or handler func
        this._node = null;
        this._handler = null;
    }
}
function addDisposableListener(node, type, handler, useCapture) {
    return new DomListener(node, type, handler, useCapture);
}
const EventType = {
    // Mouse
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    MOUSE_UP: 'mouseup',
    MOUSE_DOWN: 'mousedown',
    MOUSE_OVER: 'mouseover',
    MOUSE_MOVE: 'mousemove',
    MOUSE_OUT: 'mouseout',
    MOUSE_ENTER: 'mouseenter',
    MOUSE_LEAVE: 'mouseleave',
    CONTEXT_MENU: 'contextmenu',
    WHEEL: 'wheel',
    // Keyboard
    KEY_DOWN: 'keydown',
    KEY_PRESS: 'keypress',
    KEY_UP: 'keyup',
    // HTML Document
    LOAD: 'load',
    UNLOAD: 'unload',
    ABORT: 'abort',
    ERROR: 'error',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    // Form
    SELECT: 'select',
    CHANGE: 'change',
    SUBMIT: 'submit',
    RESET: 'reset',
    FOCUS: 'focus',
    FOCUS_IN: 'focusin',
    FOCUS_OUT: 'focusout',
    BLUR: 'blur',
    INPUT: 'input',
    // Local Storage
    STORAGE: 'storage',
    // Drag
    DRAG_START: 'dragstart',
    DRAG: 'drag',
    DRAG_ENTER: 'dragenter',
    DRAG_LEAVE: 'dragleave',
    DRAG_OVER: 'dragover',
    DROP: 'drop',
    DRAG_END: 'dragend',
};

class Slot extends Path {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    mountTo(group) {
        group.appendChild(this.node);
    }
    render() {
        let { x, y } = this.parent.origin;
        if (this.parent.justify === Justify.Left) {
            x += this.parent.getWidth();
            this.clear();
            this.moveTo(x, y);
            this.lineTo(x + 25, y);
            this.done();
        }
        else {
            x -= this.parent.getWidth();
            this.clear();
            this.moveTo(x, y);
            this.lineTo(x - 25, y);
            this.done();
        }
    }
    hide() {
        this.clear();
        this.done();
    }
    dispose() {
        this.node.remove();
    }
}
class TopicViewNode extends Disposable {
    constructor(topicNode) {
        super();
        this.topicNode = topicNode;
        this.children = [];
        this.onResize = new Signal(this);
        this.onFocus = new Signal(this);
        this.onBlur = new Signal(this);
        this.id = TopicViewNode.counter++;
        this.align = Align.Center;
        this.transform = { x: 0, y: 0 };
        this.slot = new Slot(this);
        this.createElement();
        this._register({
            dispose() {
                Signal.disconnectAll(this);
            }
        });
    }
    createElement() {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this.container.setAttribute('width', '100px');
        this.container.setAttribute('height', '32px');
        this.container.setAttribute('x', '0');
        this.container.setAttribute('y', '0');
        this.container.dataset.id = this.id.toString();
        Object.defineProperty(this.container, '__ref__', { value: this });
        this.textarea = document.createElement('textarea');
        this.container.appendChild(this.textarea);
        this.textarea.innerText = 'test test test';
        this.textarea.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        this.textarea.style.width = '100px';
        this.textarea.style.height = '32px';
        this._register(addDisposableListener(this.textarea, EventType.MOUSE_DOWN, this._handleMouseDown.bind(this)));
        this._register(addDisposableListener(this.textarea, EventType.MOUSE_UP, this._handleMouseUp.bind(this)));
        this._register(addDisposableListener(this.textarea, EventType.INPUT, this._handleInput.bind(this)));
        this._register(addDisposableListener(this.textarea, EventType.FOCUS, this._handleFocus.bind(this)));
        this._register(addDisposableListener(this.textarea, EventType.BLUR, this._handleBlur.bind(this)));
    }
    _handleMouseDown() {
        let { width, height } = this.textarea.getBoundingClientRect();
        this.prevWidth = width;
        this.prevHeight = height;
        this.container.style.zIndex = '999';
        this.container.setAttribute('width', '100%');
        this.container.setAttribute('height', '100%');
    }
    _handleMouseUp() {
        let { width, height } = this.textarea.getBoundingClientRect();
        this.container.style.zIndex = '0';
        this.container.setAttribute('width', width + 'px');
        this.container.setAttribute('height', height + 'px');
        if (this.prevWidth !== width || this.prevHeight !== height) {
            this.onResize.emit();
        }
    }
    _handleFocus() {
        this.onFocus.emit();
    }
    _handleBlur() {
        this.onBlur.emit();
    }
    _handleInput(e) {
        // todo update content
    }
    //#endregion
    get tier() {
        return this.topicNode.tier;
    }
    mountTo(g) {
        g.appendChild(this.container);
        if (!this.topicNode.isRoot) {
            this.slot.mountTo(g);
        }
    }
    add(topic) {
        this.children.push(topic);
        topic.parent = this;
    }
    remove(topic) {
        let idx = this.children.indexOf(topic);
        if (idx > -1) {
            this.children.splice(idx, 1);
        }
        if (!this.children.length) {
            this.slot.hide();
        }
    }
    getWidth() {
        return this.container.clientWidth;
    }
    getHeight() {
        return this.container.clientHeight;
    }
    translate(x, y, origin) {
        this.transform = { x, y };
        if (origin) {
            this.origin = origin;
        }
        else {
            this.origin = { x: 0, y: 0 };
        }
        if (isNaN(this.origin.y))
            debugger;
        let tr = Vector.add(this.origin, this.transform, { x: 0, y: 0 });
        this.container.setAttribute('transform', `translate(${tr.x}, ${tr.y})`);
        if (this.children.length && this.slot)
            this.slot.render();
    }
    focus() {
        this.textarea.focus();
        this.onFocus.emit();
    }
    blur() {
        this.textarea.blur();
        this.onBlur.emit();
    }
    dispose() {
        super.dispose();
        this.container.remove();
        if (this.slot)
            this.slot.dispose();
    }
}
TopicViewNode.counter = 1;

class ViewContainer {
    constructor(container) {
        this.container = container;
        this.paper = createSVGNode();
        this.paper.appendChild(this.connectorLayer = (createNode('g')));
        this.paper.appendChild(this.nodeLayer = (createNode('g')));
        this.paper.setAttribute('width', '100%');
        this.paper.setAttribute('height', '100%');
        container.appendChild(this.paper);
    }
    addNode(node) {
        node.mountTo(this.nodeLayer);
    }
    addConnector(connector) {
        connector.mountTo(this.connectorLayer);
    }
}
class LayoutView extends Disposable {
    constructor(container, layoutAlgo) {
        super();
        this.layoutAlgo = layoutAlgo;
        this.viewNodes = new Map();
        this.connectors = new Map();
        this._onTopicFocus = new Emitter();
        this._onTopicBlur = new Emitter();
        this.viewContainer = new ViewContainer(container);
        this._register(this._onTopicBlur);
        this._register(this._onTopicFocus);
    }
    get onTopicFocus() { return this._onTopicFocus.event; }
    get onTopicBlur() { return this._onTopicBlur.event; }
    handleNodeAdded(mutatedTopic) {
        let viewNode = new TopicViewNode(mutatedTopic);
        this.viewNodes.set(mutatedTopic, viewNode);
        this.viewContainer.addNode(viewNode);
        viewNode.onResize.connect(this.handleNodeResize, this);
        viewNode.onFocus.connect(this.handleNodeFocus, this);
        viewNode.onBlur.connect(this.handleNodeBlur, this);
        if (mutatedTopic.parent) {
            let parent = this.viewNodes.get(mutatedTopic.parent);
            viewNode.parent = parent;
            parent.children.push(viewNode);
            let connector = new Connector(viewNode.parent, viewNode);
            let connectors = (this.connectors.get(viewNode.parent) || []);
            connectors.push(connector);
            this.connectors.set(viewNode.parent, connectors);
            this.viewContainer.addConnector(connector);
        }
        else {
            this.rootNode = viewNode;
        }
        this.refreshLayout(viewNode);
    }
    refreshLayout(viewNode) {
        let positionMutated = this.layoutAlgo.layout(viewNode);
        let connectorsToLayout = [];
        for (let n of positionMutated) {
            connectorsToLayout.push(...(this.connectors.get(n) || []));
        }
        this.layoutAlgo.layoutConnectors(Array.from(new Set(connectorsToLayout)));
    }
    handleNodeResize(viewNode) {
        this.refreshLayout(viewNode);
    }
    handleNodeFocus(viewNode) {
        this.selection = viewNode;
        this._onTopicFocus.fire();
    }
    handleNodeBlur(viewNode) {
        this.selection = null;
        this._onTopicBlur.fire();
    }
    handleNodeRemoved(mutatedTopic) {
        let nodes = [mutatedTopic];
        let current;
        let viewNode = this.viewNodes.get(mutatedTopic);
        while (current = nodes.pop()) {
            let currentViewNode = this.viewNodes.get(current);
            let connectors = this.connectors.get(currentViewNode);
            currentViewNode.dispose();
            if (connectors && connectors.length) {
                connectors.forEach(c => c.dispose());
                this.connectors.delete(currentViewNode);
            }
            this.viewNodes.delete(current);
            nodes.push(...current.children);
        }
        this.layoutAlgo.clear(viewNode);
        if (viewNode.parent) {
            let connectors = this.connectors.get(viewNode.parent);
            let idx = findIndex(connectors, c => c.to === viewNode);
            if (idx > -1) {
                connectors[idx].dispose();
                connectors.splice(idx, 1);
            }
            viewNode.parent.remove(viewNode);
            this.refreshLayout(viewNode.parent);
            this.focus(viewNode.parent.topicNode);
        }
        viewNode.dispose();
    }
    focus(node) {
        if (this.selection) {
            this.selection.blur();
        }
        let viewNode = this.viewNodes.get(node);
        if (viewNode) {
            viewNode.focus();
        }
    }
    blur() {
        if (this.selection) {
            this.selection.blur();
        }
    }
}

function getHorizionalSpacingOfChildren(tier) {
    if (tier === 0) {
        return 40;
    }
    return 40;
}
function getVerticalSpacingOfChildren(tier) {
    if (tier === 0) {
        return 20;
    }
    if (tier === 1) {
        return 10;
    }
    return 5;
}
class MindmapLayout {
    constructor(dimension) {
        this.dimension = dimension;
        this.widths = new Map();
        this.heightOfSubtree = new Map();
        this.heightOfBlock = new Map();
        this.leftTree = [];
        this.rightTree = [];
    }
    _layout(node, children, justify, specifiedHeight) {
        let len = children.length;
        if (!len)
            return;
        let spaceLeft = getHorizionalSpacingOfChildren(node.tier);
        let nextOrigin = node.origin;
        if (justify === Justify.Left) {
            nextOrigin = Vector.add(node.origin, { x: node.getWidth() + spaceLeft, y: 0 });
        }
        else {
            nextOrigin = Vector.subtract(node.origin, { x: node.getWidth() + spaceLeft, y: 0 });
        }
        if (children.length === 1) {
            let topic = children[0];
            topic.translate(justify === Justify.Right ? -topic.getWidth() : 0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: 0, y: 0 }));
        }
        else {
            let spaceV = getVerticalSpacingOfChildren(node.tier);
            let top = -(specifiedHeight || this.heightOfSubtree.get(node)) / 2;
            for (let i = 0; i < len; i++) {
                let topic = children[i];
                let h = this.heightOfBlock.get(topic);
                top += h / 2;
                topic.translate(justify === Justify.Right ? -topic.getWidth() : 0, -topic.getHeight() / 2, Vector.add(nextOrigin, { x: 0, y: top }));
                top += h / 2;
                top += spaceV;
            }
        }
    }
    isBelongToTree(node, nodes) {
        if (!node.parent)
            return false;
        if (!nodes.length)
            return false;
        let p = node;
        let prevP = node;
        while (p.parent) {
            prevP = p;
            p = p.parent;
        }
        return nodes.indexOf(prevP) > -1;
    }
    layoutSubTree(rootNode, tree, justify) {
        if (!tree.length)
            return [];
        this._layout(rootNode, tree, justify, justify === Justify.Right ? this.heightOfLeftTree : this.heightOfRightTree);
        let nodes = tree.slice();
        let current;
        let mutated = tree.slice();
        while (current = nodes.shift()) {
            this._layout(current, current.children, justify);
            mutated.push(current);
            current.justify = justify;
            nodes = nodes.concat(current.children);
        }
        return mutated;
    }
    layout(node) {
        this._measure(node);
        // find root
        let p = node;
        while (p.parent) {
            p = p.parent;
        }
        let len = p.children.length;
        if (len < 4) {
            this.leftTree.length = 0;
            this.rightTree = p.children.slice();
        }
        else {
            let mid = Math.floor(len / 2);
            this.rightTree = p.children.slice(0, mid);
            this.leftTree = p.children.slice(mid);
        }
        this.heightOfLeftTree = this.leftTree.length ? this.leftTree.reduce((acc, t) => {
            return acc + this.heightOfBlock.get(t);
        }, (this.leftTree.length - 1) * getVerticalSpacingOfChildren(0)) : 0;
        this.heightOfRightTree = this.rightTree.length ? this.rightTree.reduce((acc, t) => {
            return acc + this.heightOfBlock.get(t);
        }, (this.rightTree.length - 1) * getVerticalSpacingOfChildren(0)) : 0;
        p.translate(-p.getWidth() / 2, -p.getHeight() / 2, { x: this.dimension.width / 2, y: this.dimension.height / 2 });
        return this.layoutSubTree(p, this.leftTree, Justify.Right).concat(this.layoutSubTree(p, this.rightTree, Justify.Left)).concat(p);
    }
    layoutConnectors(connectors) {
        for (let c of connectors) {
            let { x: x1, y: y1 } = c.from.origin;
            let { x: x2, y: y2 } = c.to.origin;
            if (c.from.parent) {
                if (this.isBelongToTree(c.from, this.rightTree)) {
                    x1 += c.from.getWidth() + 25;
                }
                else {
                    x1 -= c.from.getWidth() + 25;
                }
            }
            let cpx2;
            let dx = Math.abs(x1 - x2) * 0.3;
            if (x1 < x2) {
                cpx2 = x1 + dx;
            }
            else if (x1 > x2) {
                cpx2 = x1 - dx;
            }
            else {
                cpx2 = x1;
            }
            let cpy1;
            let dy = Math.abs(y1 - y2) * 0.3;
            if (y1 < y2) {
                cpy1 = y1 + dy;
            }
            else if (y1 > y2) {
                cpy1 = y1 - dy;
            }
            else {
                cpy1 = y1;
            }
            c.clear();
            c.moveTo(x1, y1);
            c.bezierTo(x1, cpy1, cpx2, y2, x2, y2);
            c.done();
        }
    }
    _measure(node) {
        let p = node;
        while (p) {
            this._getHeight(p);
            p = p.parent;
        }
    }
    _getHeight(node) {
        let h = 0;
        if (node.children.length) {
            let tier = node.tier;
            h = node.children.reduce((acc, t) => {
                return acc + this.heightOfBlock.get(t);
            }, (node.children.length - 1) * getVerticalSpacingOfChildren(tier));
        }
        this.heightOfSubtree.set(node, h);
        this.heightOfBlock.set(node, Math.max(h, node.getHeight()));
    }
    clear(mutated) {
        if (!mutated.parent) {
            this.widths.clear();
            this.heightOfBlock.clear();
            this.heightOfSubtree.clear();
        }
        else {
            let nodes = [mutated];
            let current;
            while (current = nodes.pop()) {
                this.widths.delete(current);
                this.heightOfBlock.delete(current);
                this.heightOfSubtree.delete(current);
                nodes.push(...current.children);
            }
        }
    }
}

class Topic {
    constructor() {
        this.children = [];
        this.id = Topic.IdCounter++;
    }
    get isRoot() {
        return !this.parent;
    }
    get tier() {
        let p = this.parent;
        let counter = 0;
        while (p) {
            counter++;
            p = p.parent;
        }
        return counter;
    }
    add(topic) {
        this.children.push(topic);
        topic.parent = this;
    }
    remove(topic) {
        let idx = this.children.indexOf(topic);
        if (idx > -1) {
            this.children.splice(idx, 1);
        }
    }
}
Topic.IdCounter = 1;

let { userAgent: userAgent$1 } = navigator;
var Platform$1;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform$1 || (Platform$1 = {}));
let _platform$1 = Platform$1.Web;
const isWindows$1 = userAgent$1.indexOf('Windows') >= 0;
const isMacintosh$1 = userAgent$1.indexOf('Macintosh') >= 0;
const isLinux$1 = userAgent$1.indexOf('Linux') >= 0;
const OS = (isMacintosh$1 ? 2 /* Macintosh */ : (isWindows$1 ? 1 /* Windows */ : 3 /* Linux */));
const isIE$1 = (userAgent$1.indexOf('Trident') >= 0);
const isEdge$1 = (userAgent$1.indexOf('Edge/') >= 0);
const isOpera$1 = (userAgent$1.indexOf('Opera') >= 0);
const isFirefox$1 = (userAgent$1.indexOf('Firefox') >= 0);
const isWebKit$1 = (userAgent$1.indexOf('AppleWebKit') >= 0);
const isChrome$1 = (userAgent$1.indexOf('Chrome') >= 0);
const isSafari$1 = (!isChrome$1 && (userAgent$1.indexOf('Safari') >= 0));
const isIPad$1 = (userAgent$1.indexOf('iPad') >= 0);
const isEdgeWebView$1 = isEdge$1 && (userAgent$1.indexOf('WebView/') >= 0);

function createKeybinding(keybinding, OS) {
    if (keybinding === 0) {
        return null;
    }
    const firstPart = (keybinding & 0x0000ffff) >>> 0;
    const chordPart = (keybinding & 0xffff0000) >>> 16;
    if (chordPart !== 0) {
        return new ChordKeybinding(createSimpleKeybinding(firstPart, OS), createSimpleKeybinding(chordPart, OS));
    }
    return createSimpleKeybinding(firstPart, OS);
}
function createSimpleKeybinding(keybinding, OS) {
    const ctrlCmd = (keybinding & 2048 /* CtrlCmd */ ? true : false);
    const winCtrl = (keybinding & 256 /* WinCtrl */ ? true : false);
    const ctrlKey = (OS === 2 /* Macintosh */ ? winCtrl : ctrlCmd);
    const shiftKey = (keybinding & 1024 /* Shift */ ? true : false);
    const altKey = (keybinding & 512 /* Alt */ ? true : false);
    const metaKey = (OS === 2 /* Macintosh */ ? ctrlCmd : winCtrl);
    const keyCode = (keybinding & 255 /* KeyCode */);
    return new SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
class SimpleKeybinding {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.type = 1 /* Simple */;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    equals(other) {
        if (other.type !== 1 /* Simple */) {
            return false;
        }
        other = other;
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.keyCode === other.keyCode);
    }
    getHashCode() {
        let ctrl = this.ctrlKey ? '1' : '0';
        let shift = this.shiftKey ? '1' : '0';
        let alt = this.altKey ? '1' : '0';
        let meta = this.metaKey ? '1' : '0';
        return `${ctrl}${shift}${alt}${meta}${this.keyCode}`;
    }
    isModifierKey() {
        return (this.keyCode === 0 /* Unknown */
            || this.keyCode === 5 /* Ctrl */
            || this.keyCode === 57 /* Meta */
            || this.keyCode === 6 /* Alt */
            || this.keyCode === 4 /* Shift */);
    }
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase() {
        return ((this.ctrlKey && this.keyCode === 5 /* Ctrl */)
            || (this.shiftKey && this.keyCode === 4 /* Shift */)
            || (this.altKey && this.keyCode === 6 /* Alt */)
            || (this.metaKey && this.keyCode === 57 /* Meta */));
    }
}
class ChordKeybinding {
    constructor(firstPart, chordPart) {
        this.type = 2 /* Chord */;
        this.firstPart = firstPart;
        this.chordPart = chordPart;
    }
    getHashCode() {
        return `${this.firstPart.getHashCode()};${this.chordPart.getHashCode()}`;
    }
}

/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
class KeyCodeStrMap {
    constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
    }
    define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    }
    keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
    }
    strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || 0 /* Unknown */;
    }
}
const uiMap = new KeyCodeStrMap();
const userSettingsUSMap = new KeyCodeStrMap();
const userSettingsGeneralMap = new KeyCodeStrMap();
(function () {
    function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
        uiMap.define(keyCode, uiLabel);
        userSettingsUSMap.define(keyCode, usUserSettingsLabel);
        userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
    }
    define(0 /* Unknown */, 'unknown');
    define(1 /* Backspace */, 'Backspace');
    define(2 /* Tab */, 'Tab');
    define(3 /* Enter */, 'Enter');
    define(4 /* Shift */, 'Shift');
    define(5 /* Ctrl */, 'Ctrl');
    define(6 /* Alt */, 'Alt');
    define(7 /* PauseBreak */, 'PauseBreak');
    define(8 /* CapsLock */, 'CapsLock');
    define(9 /* Escape */, 'Escape');
    define(10 /* Space */, 'Space');
    define(11 /* PageUp */, 'PageUp');
    define(12 /* PageDown */, 'PageDown');
    define(13 /* End */, 'End');
    define(14 /* Home */, 'Home');
    define(15 /* LeftArrow */, 'LeftArrow', 'Left');
    define(16 /* UpArrow */, 'UpArrow', 'Up');
    define(17 /* RightArrow */, 'RightArrow', 'Right');
    define(18 /* DownArrow */, 'DownArrow', 'Down');
    define(19 /* Insert */, 'Insert');
    define(20 /* Delete */, 'Delete');
    define(21 /* KEY_0 */, '0');
    define(22 /* KEY_1 */, '1');
    define(23 /* KEY_2 */, '2');
    define(24 /* KEY_3 */, '3');
    define(25 /* KEY_4 */, '4');
    define(26 /* KEY_5 */, '5');
    define(27 /* KEY_6 */, '6');
    define(28 /* KEY_7 */, '7');
    define(29 /* KEY_8 */, '8');
    define(30 /* KEY_9 */, '9');
    define(31 /* KEY_A */, 'A');
    define(32 /* KEY_B */, 'B');
    define(33 /* KEY_C */, 'C');
    define(34 /* KEY_D */, 'D');
    define(35 /* KEY_E */, 'E');
    define(36 /* KEY_F */, 'F');
    define(37 /* KEY_G */, 'G');
    define(38 /* KEY_H */, 'H');
    define(39 /* KEY_I */, 'I');
    define(40 /* KEY_J */, 'J');
    define(41 /* KEY_K */, 'K');
    define(42 /* KEY_L */, 'L');
    define(43 /* KEY_M */, 'M');
    define(44 /* KEY_N */, 'N');
    define(45 /* KEY_O */, 'O');
    define(46 /* KEY_P */, 'P');
    define(47 /* KEY_Q */, 'Q');
    define(48 /* KEY_R */, 'R');
    define(49 /* KEY_S */, 'S');
    define(50 /* KEY_T */, 'T');
    define(51 /* KEY_U */, 'U');
    define(52 /* KEY_V */, 'V');
    define(53 /* KEY_W */, 'W');
    define(54 /* KEY_X */, 'X');
    define(55 /* KEY_Y */, 'Y');
    define(56 /* KEY_Z */, 'Z');
    define(57 /* Meta */, 'Meta');
    define(58 /* ContextMenu */, 'ContextMenu');
    define(59 /* F1 */, 'F1');
    define(60 /* F2 */, 'F2');
    define(61 /* F3 */, 'F3');
    define(62 /* F4 */, 'F4');
    define(63 /* F5 */, 'F5');
    define(64 /* F6 */, 'F6');
    define(65 /* F7 */, 'F7');
    define(66 /* F8 */, 'F8');
    define(67 /* F9 */, 'F9');
    define(68 /* F10 */, 'F10');
    define(69 /* F11 */, 'F11');
    define(70 /* F12 */, 'F12');
    define(71 /* F13 */, 'F13');
    define(72 /* F14 */, 'F14');
    define(73 /* F15 */, 'F15');
    define(74 /* F16 */, 'F16');
    define(75 /* F17 */, 'F17');
    define(76 /* F18 */, 'F18');
    define(77 /* F19 */, 'F19');
    define(78 /* NumLock */, 'NumLock');
    define(79 /* ScrollLock */, 'ScrollLock');
    define(80 /* US_SEMICOLON */, ';', ';', 'OEM_1');
    define(81 /* US_EQUAL */, '=', '=', 'OEM_PLUS');
    define(82 /* US_COMMA */, ',', ',', 'OEM_COMMA');
    define(83 /* US_MINUS */, '-', '-', 'OEM_MINUS');
    define(84 /* US_DOT */, '.', '.', 'OEM_PERIOD');
    define(85 /* US_SLASH */, '/', '/', 'OEM_2');
    define(86 /* US_BACKTICK */, '`', '`', 'OEM_3');
    define(110 /* ABNT_C1 */, 'ABNT_C1');
    define(111 /* ABNT_C2 */, 'ABNT_C2');
    define(87 /* US_OPEN_SQUARE_BRACKET */, '[', '[', 'OEM_4');
    define(88 /* US_BACKSLASH */, '\\', '\\', 'OEM_5');
    define(89 /* US_CLOSE_SQUARE_BRACKET */, ']', ']', 'OEM_6');
    define(90 /* US_QUOTE */, '\'', '\'', 'OEM_7');
    define(91 /* OEM_8 */, 'OEM_8');
    define(92 /* OEM_102 */, 'OEM_102');
    define(93 /* NUMPAD_0 */, 'NumPad0');
    define(94 /* NUMPAD_1 */, 'NumPad1');
    define(95 /* NUMPAD_2 */, 'NumPad2');
    define(96 /* NUMPAD_3 */, 'NumPad3');
    define(97 /* NUMPAD_4 */, 'NumPad4');
    define(98 /* NUMPAD_5 */, 'NumPad5');
    define(99 /* NUMPAD_6 */, 'NumPad6');
    define(100 /* NUMPAD_7 */, 'NumPad7');
    define(101 /* NUMPAD_8 */, 'NumPad8');
    define(102 /* NUMPAD_9 */, 'NumPad9');
    define(103 /* NUMPAD_MULTIPLY */, 'NumPad_Multiply');
    define(104 /* NUMPAD_ADD */, 'NumPad_Add');
    define(105 /* NUMPAD_SEPARATOR */, 'NumPad_Separator');
    define(106 /* NUMPAD_SUBTRACT */, 'NumPad_Subtract');
    define(107 /* NUMPAD_DECIMAL */, 'NumPad_Decimal');
    define(108 /* NUMPAD_DIVIDE */, 'NumPad_Divide');
})();
var KeyCodeUtils;
(function (KeyCodeUtils) {
    function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toString = toString;
    function fromString(key) {
        return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromString = fromString;
    function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromUserSettings = fromUserSettings;
})(KeyCodeUtils || (KeyCodeUtils = {}));

let { userAgent: userAgent$1$1 } = navigator;
var Platform$1$1;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform$1$1 || (Platform$1$1 = {}));
let _platform$1$1 = Platform$1$1.Web;
const isWindows$1$1 = userAgent$1$1.indexOf('Windows') >= 0;
const isMacintosh$1$1 = userAgent$1$1.indexOf('Macintosh') >= 0;
const isLinux$1$1 = userAgent$1$1.indexOf('Linux') >= 0;
const isIE$1$1 = (userAgent$1$1.indexOf('Trident') >= 0);
const isEdge$1$1 = (userAgent$1$1.indexOf('Edge/') >= 0);
const isOpera$1$1 = (userAgent$1$1.indexOf('Opera') >= 0);
const isFirefox$1$1 = (userAgent$1$1.indexOf('Firefox') >= 0);
const isWebKit$1$1 = (userAgent$1$1.indexOf('AppleWebKit') >= 0);
const isChrome$1$1 = (userAgent$1$1.indexOf('Chrome') >= 0);
const isSafari$1$1 = (!isChrome$1$1 && (userAgent$1$1.indexOf('Safari') >= 0));
const isIPad$1$1 = (userAgent$1$1.indexOf('iPad') >= 0);
const isEdgeWebView$1$1 = isEdge$1$1 && (userAgent$1$1.indexOf('WebView/') >= 0);

let KEY_CODE_MAP = new Array(230);
let INVERSE_KEY_CODE_MAP = new Array(112 /* MAX_VALUE */);
(function () {
    for (let i = 0; i < INVERSE_KEY_CODE_MAP.length; i++) {
        INVERSE_KEY_CODE_MAP[i] = -1;
    }
    function define(code, keyCode) {
        KEY_CODE_MAP[code] = keyCode;
        INVERSE_KEY_CODE_MAP[keyCode] = code;
    }
    define(3, 7 /* PauseBreak */); // VK_CANCEL 0x03 Control-break processing
    define(8, 1 /* Backspace */);
    define(9, 2 /* Tab */);
    define(13, 3 /* Enter */);
    define(16, 4 /* Shift */);
    define(17, 5 /* Ctrl */);
    define(18, 6 /* Alt */);
    define(19, 7 /* PauseBreak */);
    define(20, 8 /* CapsLock */);
    define(27, 9 /* Escape */);
    define(32, 10 /* Space */);
    define(33, 11 /* PageUp */);
    define(34, 12 /* PageDown */);
    define(35, 13 /* End */);
    define(36, 14 /* Home */);
    define(37, 15 /* LeftArrow */);
    define(38, 16 /* UpArrow */);
    define(39, 17 /* RightArrow */);
    define(40, 18 /* DownArrow */);
    define(45, 19 /* Insert */);
    define(46, 20 /* Delete */);
    define(48, 21 /* KEY_0 */);
    define(49, 22 /* KEY_1 */);
    define(50, 23 /* KEY_2 */);
    define(51, 24 /* KEY_3 */);
    define(52, 25 /* KEY_4 */);
    define(53, 26 /* KEY_5 */);
    define(54, 27 /* KEY_6 */);
    define(55, 28 /* KEY_7 */);
    define(56, 29 /* KEY_8 */);
    define(57, 30 /* KEY_9 */);
    define(65, 31 /* KEY_A */);
    define(66, 32 /* KEY_B */);
    define(67, 33 /* KEY_C */);
    define(68, 34 /* KEY_D */);
    define(69, 35 /* KEY_E */);
    define(70, 36 /* KEY_F */);
    define(71, 37 /* KEY_G */);
    define(72, 38 /* KEY_H */);
    define(73, 39 /* KEY_I */);
    define(74, 40 /* KEY_J */);
    define(75, 41 /* KEY_K */);
    define(76, 42 /* KEY_L */);
    define(77, 43 /* KEY_M */);
    define(78, 44 /* KEY_N */);
    define(79, 45 /* KEY_O */);
    define(80, 46 /* KEY_P */);
    define(81, 47 /* KEY_Q */);
    define(82, 48 /* KEY_R */);
    define(83, 49 /* KEY_S */);
    define(84, 50 /* KEY_T */);
    define(85, 51 /* KEY_U */);
    define(86, 52 /* KEY_V */);
    define(87, 53 /* KEY_W */);
    define(88, 54 /* KEY_X */);
    define(89, 55 /* KEY_Y */);
    define(90, 56 /* KEY_Z */);
    define(93, 58 /* ContextMenu */);
    define(96, 93 /* NUMPAD_0 */);
    define(97, 94 /* NUMPAD_1 */);
    define(98, 95 /* NUMPAD_2 */);
    define(99, 96 /* NUMPAD_3 */);
    define(100, 97 /* NUMPAD_4 */);
    define(101, 98 /* NUMPAD_5 */);
    define(102, 99 /* NUMPAD_6 */);
    define(103, 100 /* NUMPAD_7 */);
    define(104, 101 /* NUMPAD_8 */);
    define(105, 102 /* NUMPAD_9 */);
    define(106, 103 /* NUMPAD_MULTIPLY */);
    define(107, 104 /* NUMPAD_ADD */);
    define(108, 105 /* NUMPAD_SEPARATOR */);
    define(109, 106 /* NUMPAD_SUBTRACT */);
    define(110, 107 /* NUMPAD_DECIMAL */);
    define(111, 108 /* NUMPAD_DIVIDE */);
    define(112, 59 /* F1 */);
    define(113, 60 /* F2 */);
    define(114, 61 /* F3 */);
    define(115, 62 /* F4 */);
    define(116, 63 /* F5 */);
    define(117, 64 /* F6 */);
    define(118, 65 /* F7 */);
    define(119, 66 /* F8 */);
    define(120, 67 /* F9 */);
    define(121, 68 /* F10 */);
    define(122, 69 /* F11 */);
    define(123, 70 /* F12 */);
    define(124, 71 /* F13 */);
    define(125, 72 /* F14 */);
    define(126, 73 /* F15 */);
    define(127, 74 /* F16 */);
    define(128, 75 /* F17 */);
    define(129, 76 /* F18 */);
    define(130, 77 /* F19 */);
    define(144, 78 /* NumLock */);
    define(145, 79 /* ScrollLock */);
    define(186, 80 /* US_SEMICOLON */);
    define(187, 81 /* US_EQUAL */);
    define(188, 82 /* US_COMMA */);
    define(189, 83 /* US_MINUS */);
    define(190, 84 /* US_DOT */);
    define(191, 85 /* US_SLASH */);
    define(192, 86 /* US_BACKTICK */);
    define(193, 110 /* ABNT_C1 */);
    define(194, 111 /* ABNT_C2 */);
    define(219, 87 /* US_OPEN_SQUARE_BRACKET */);
    define(220, 88 /* US_BACKSLASH */);
    define(221, 89 /* US_CLOSE_SQUARE_BRACKET */);
    define(222, 90 /* US_QUOTE */);
    define(223, 91 /* OEM_8 */);
    define(226, 92 /* OEM_102 */);
    /**
     * https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
     * If an Input Method Editor is processing key input and the event is keydown, return 229.
     */
    define(229, 109 /* KEY_IN_COMPOSITION */);
    if (isIE$1$1) {
        define(91, 57 /* Meta */);
    }
    else if (isFirefox$1$1) {
        define(59, 80 /* US_SEMICOLON */);
        define(107, 81 /* US_EQUAL */);
        define(109, 83 /* US_MINUS */);
        if (isMacintosh$1$1) {
            define(224, 57 /* Meta */);
        }
    }
    else if (isWebKit$1$1) {
        define(91, 57 /* Meta */);
        if (isMacintosh$1$1) {
            // the two meta keys in the Mac have different key codes (91 and 93)
            define(93, 57 /* Meta */);
        }
        else {
            define(92, 57 /* Meta */);
        }
    }
})();
function extractKeyCode(e) {
    if (e.charCode) {
        // "keypress" events mostly
        let char = String.fromCharCode(e.charCode).toUpperCase();
        return KeyCodeUtils.fromString(char);
    }
    return KEY_CODE_MAP[e.keyCode] || 0 /* Unknown */;
}
const ctrlKeyMod = (isMacintosh$1$1 ? 256 /* WinCtrl */ : 2048 /* CtrlCmd */);
const altKeyMod = 512 /* Alt */;
const shiftKeyMod = 1024 /* Shift */;
const metaKeyMod = (isMacintosh$1$1 ? 2048 /* CtrlCmd */ : 256 /* WinCtrl */);
class StandardKeyboardEvent {
    constructor(source) {
        let e = source;
        this.browserEvent = e;
        this.target = e.target;
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        this.keyCode = extractKeyCode(e);
        this.code = e.code;
        // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
        this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* Ctrl */;
        this.altKey = this.altKey || this.keyCode === 6 /* Alt */;
        this.shiftKey = this.shiftKey || this.keyCode === 4 /* Shift */;
        this.metaKey = this.metaKey || this.keyCode === 57 /* Meta */;
        this._asKeybinding = this._computeKeybinding();
        this._asRuntimeKeybinding = this._computeRuntimeKeybinding();
        // console.log(`code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`);
    }
    preventDefault() {
        if (this.browserEvent && this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent && this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
    toKeybinding() {
        return this._asRuntimeKeybinding;
    }
    equals(other) {
        return this._asKeybinding === other;
    }
    _computeKeybinding() {
        let key = 0 /* Unknown */;
        if (this.keyCode !== 5 /* Ctrl */ && this.keyCode !== 4 /* Shift */ && this.keyCode !== 6 /* Alt */ && this.keyCode !== 57 /* Meta */) {
            key = this.keyCode;
        }
        let result = 0;
        if (this.ctrlKey) {
            result |= ctrlKeyMod;
        }
        if (this.altKey) {
            result |= altKeyMod;
        }
        if (this.shiftKey) {
            result |= shiftKeyMod;
        }
        if (this.metaKey) {
            result |= metaKeyMod;
        }
        result |= key;
        return result;
    }
    _computeRuntimeKeybinding() {
        let key = 0 /* Unknown */;
        if (this.keyCode !== 5 /* Ctrl */ && this.keyCode !== 4 /* Shift */ && this.keyCode !== 6 /* Alt */ && this.keyCode !== 57 /* Meta */) {
            key = this.keyCode;
        }
        return new SimpleKeybinding(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
    }
}

/**
 * keyboardEvent.code
 * 这里Enum的值没有意义
 * 这个文件是为了改进代码风格，用Enum代替DOMString
 */
const scanCodeIntToStr = [];
const scanCodeStrToInt = Object.create(null);
const scanCodeLowerCaseStrToInt = Object.create(null);
const ScanCodeUtils = {
    lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* None */,
    toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* None */,
    toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
};
/**
 * -1 if a ScanCode => KeyCode mapping depends on kb layout.
 */
const IMMUTABLE_CODE_TO_KEY_CODE = [];
/**
 * -1 if a KeyCode => ScanCode mapping depends on kb layout.
 */
const IMMUTABLE_KEY_CODE_TO_CODE = [];
class ScanCodeBinding {
    constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.scanCode = scanCode;
    }
    equals(other) {
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.scanCode === other.scanCode);
    }
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase() {
        return ((this.ctrlKey && (this.scanCode === 157 /* ControlLeft */ || this.scanCode === 161 /* ControlRight */))
            || (this.shiftKey && (this.scanCode === 158 /* ShiftLeft */ || this.scanCode === 162 /* ShiftRight */))
            || (this.altKey && (this.scanCode === 159 /* AltLeft */ || this.scanCode === 163 /* AltRight */))
            || (this.metaKey && (this.scanCode === 160 /* MetaLeft */ || this.scanCode === 164 /* MetaRight */)));
    }
}
(function () {
    function d(intScanCode, strScanCode) {
        scanCodeIntToStr[intScanCode] = strScanCode;
        scanCodeStrToInt[strScanCode] = intScanCode;
        scanCodeLowerCaseStrToInt[strScanCode.toLowerCase()] = intScanCode;
    }
    d(0 /* None */, 'None');
    d(1 /* Hyper */, 'Hyper');
    d(2 /* Super */, 'Super');
    d(3 /* Fn */, 'Fn');
    d(4 /* FnLock */, 'FnLock');
    d(5 /* Suspend */, 'Suspend');
    d(6 /* Resume */, 'Resume');
    d(7 /* Turbo */, 'Turbo');
    d(8 /* Sleep */, 'Sleep');
    d(9 /* WakeUp */, 'WakeUp');
    d(10 /* KeyA */, 'KeyA');
    d(11 /* KeyB */, 'KeyB');
    d(12 /* KeyC */, 'KeyC');
    d(13 /* KeyD */, 'KeyD');
    d(14 /* KeyE */, 'KeyE');
    d(15 /* KeyF */, 'KeyF');
    d(16 /* KeyG */, 'KeyG');
    d(17 /* KeyH */, 'KeyH');
    d(18 /* KeyI */, 'KeyI');
    d(19 /* KeyJ */, 'KeyJ');
    d(20 /* KeyK */, 'KeyK');
    d(21 /* KeyL */, 'KeyL');
    d(22 /* KeyM */, 'KeyM');
    d(23 /* KeyN */, 'KeyN');
    d(24 /* KeyO */, 'KeyO');
    d(25 /* KeyP */, 'KeyP');
    d(26 /* KeyQ */, 'KeyQ');
    d(27 /* KeyR */, 'KeyR');
    d(28 /* KeyS */, 'KeyS');
    d(29 /* KeyT */, 'KeyT');
    d(30 /* KeyU */, 'KeyU');
    d(31 /* KeyV */, 'KeyV');
    d(32 /* KeyW */, 'KeyW');
    d(33 /* KeyX */, 'KeyX');
    d(34 /* KeyY */, 'KeyY');
    d(35 /* KeyZ */, 'KeyZ');
    d(36 /* Digit1 */, 'Digit1');
    d(37 /* Digit2 */, 'Digit2');
    d(38 /* Digit3 */, 'Digit3');
    d(39 /* Digit4 */, 'Digit4');
    d(40 /* Digit5 */, 'Digit5');
    d(41 /* Digit6 */, 'Digit6');
    d(42 /* Digit7 */, 'Digit7');
    d(43 /* Digit8 */, 'Digit8');
    d(44 /* Digit9 */, 'Digit9');
    d(45 /* Digit0 */, 'Digit0');
    d(46 /* Enter */, 'Enter');
    d(47 /* Escape */, 'Escape');
    d(48 /* Backspace */, 'Backspace');
    d(49 /* Tab */, 'Tab');
    d(50 /* Space */, 'Space');
    d(51 /* Minus */, 'Minus');
    d(52 /* Equal */, 'Equal');
    d(53 /* BracketLeft */, 'BracketLeft');
    d(54 /* BracketRight */, 'BracketRight');
    d(55 /* Backslash */, 'Backslash');
    d(56 /* IntlHash */, 'IntlHash');
    d(57 /* Semicolon */, 'Semicolon');
    d(58 /* Quote */, 'Quote');
    d(59 /* Backquote */, 'Backquote');
    d(60 /* Comma */, 'Comma');
    d(61 /* Period */, 'Period');
    d(62 /* Slash */, 'Slash');
    d(63 /* CapsLock */, 'CapsLock');
    d(64 /* F1 */, 'F1');
    d(65 /* F2 */, 'F2');
    d(66 /* F3 */, 'F3');
    d(67 /* F4 */, 'F4');
    d(68 /* F5 */, 'F5');
    d(69 /* F6 */, 'F6');
    d(70 /* F7 */, 'F7');
    d(71 /* F8 */, 'F8');
    d(72 /* F9 */, 'F9');
    d(73 /* F10 */, 'F10');
    d(74 /* F11 */, 'F11');
    d(75 /* F12 */, 'F12');
    d(76 /* PrintScreen */, 'PrintScreen');
    d(77 /* ScrollLock */, 'ScrollLock');
    d(78 /* Pause */, 'Pause');
    d(79 /* Insert */, 'Insert');
    d(80 /* Home */, 'Home');
    d(81 /* PageUp */, 'PageUp');
    d(82 /* Delete */, 'Delete');
    d(83 /* End */, 'End');
    d(84 /* PageDown */, 'PageDown');
    d(85 /* ArrowRight */, 'ArrowRight');
    d(86 /* ArrowLeft */, 'ArrowLeft');
    d(87 /* ArrowDown */, 'ArrowDown');
    d(88 /* ArrowUp */, 'ArrowUp');
    d(89 /* NumLock */, 'NumLock');
    d(90 /* NumpadDivide */, 'NumpadDivide');
    d(91 /* NumpadMultiply */, 'NumpadMultiply');
    d(92 /* NumpadSubtract */, 'NumpadSubtract');
    d(93 /* NumpadAdd */, 'NumpadAdd');
    d(94 /* NumpadEnter */, 'NumpadEnter');
    d(95 /* Numpad1 */, 'Numpad1');
    d(96 /* Numpad2 */, 'Numpad2');
    d(97 /* Numpad3 */, 'Numpad3');
    d(98 /* Numpad4 */, 'Numpad4');
    d(99 /* Numpad5 */, 'Numpad5');
    d(100 /* Numpad6 */, 'Numpad6');
    d(101 /* Numpad7 */, 'Numpad7');
    d(102 /* Numpad8 */, 'Numpad8');
    d(103 /* Numpad9 */, 'Numpad9');
    d(104 /* Numpad0 */, 'Numpad0');
    d(105 /* NumpadDecimal */, 'NumpadDecimal');
    d(106 /* IntlBackslash */, 'IntlBackslash');
    d(107 /* ContextMenu */, 'ContextMenu');
    d(108 /* Power */, 'Power');
    d(109 /* NumpadEqual */, 'NumpadEqual');
    d(110 /* F13 */, 'F13');
    d(111 /* F14 */, 'F14');
    d(112 /* F15 */, 'F15');
    d(113 /* F16 */, 'F16');
    d(114 /* F17 */, 'F17');
    d(115 /* F18 */, 'F18');
    d(116 /* F19 */, 'F19');
    d(117 /* F20 */, 'F20');
    d(118 /* F21 */, 'F21');
    d(119 /* F22 */, 'F22');
    d(120 /* F23 */, 'F23');
    d(121 /* F24 */, 'F24');
    d(122 /* Open */, 'Open');
    d(123 /* Help */, 'Help');
    d(124 /* Select */, 'Select');
    d(125 /* Again */, 'Again');
    d(126 /* Undo */, 'Undo');
    d(127 /* Cut */, 'Cut');
    d(128 /* Copy */, 'Copy');
    d(129 /* Paste */, 'Paste');
    d(130 /* Find */, 'Find');
    d(131 /* AudioVolumeMute */, 'AudioVolumeMute');
    d(132 /* AudioVolumeUp */, 'AudioVolumeUp');
    d(133 /* AudioVolumeDown */, 'AudioVolumeDown');
    d(134 /* NumpadComma */, 'NumpadComma');
    d(135 /* IntlRo */, 'IntlRo');
    d(136 /* KanaMode */, 'KanaMode');
    d(137 /* IntlYen */, 'IntlYen');
    d(138 /* Convert */, 'Convert');
    d(139 /* NonConvert */, 'NonConvert');
    d(140 /* Lang1 */, 'Lang1');
    d(141 /* Lang2 */, 'Lang2');
    d(142 /* Lang3 */, 'Lang3');
    d(143 /* Lang4 */, 'Lang4');
    d(144 /* Lang5 */, 'Lang5');
    d(145 /* Abort */, 'Abort');
    d(146 /* Props */, 'Props');
    d(147 /* NumpadParenLeft */, 'NumpadParenLeft');
    d(148 /* NumpadParenRight */, 'NumpadParenRight');
    d(149 /* NumpadBackspace */, 'NumpadBackspace');
    d(150 /* NumpadMemoryStore */, 'NumpadMemoryStore');
    d(151 /* NumpadMemoryRecall */, 'NumpadMemoryRecall');
    d(152 /* NumpadMemoryClear */, 'NumpadMemoryClear');
    d(153 /* NumpadMemoryAdd */, 'NumpadMemoryAdd');
    d(154 /* NumpadMemorySubtract */, 'NumpadMemorySubtract');
    d(155 /* NumpadClear */, 'NumpadClear');
    d(156 /* NumpadClearEntry */, 'NumpadClearEntry');
    d(157 /* ControlLeft */, 'ControlLeft');
    d(158 /* ShiftLeft */, 'ShiftLeft');
    d(159 /* AltLeft */, 'AltLeft');
    d(160 /* MetaLeft */, 'MetaLeft');
    d(161 /* ControlRight */, 'ControlRight');
    d(162 /* ShiftRight */, 'ShiftRight');
    d(163 /* AltRight */, 'AltRight');
    d(164 /* MetaRight */, 'MetaRight');
    d(165 /* BrightnessUp */, 'BrightnessUp');
    d(166 /* BrightnessDown */, 'BrightnessDown');
    d(167 /* MediaPlay */, 'MediaPlay');
    d(168 /* MediaRecord */, 'MediaRecord');
    d(169 /* MediaFastForward */, 'MediaFastForward');
    d(170 /* MediaRewind */, 'MediaRewind');
    d(171 /* MediaTrackNext */, 'MediaTrackNext');
    d(172 /* MediaTrackPrevious */, 'MediaTrackPrevious');
    d(173 /* MediaStop */, 'MediaStop');
    d(174 /* Eject */, 'Eject');
    d(175 /* MediaPlayPause */, 'MediaPlayPause');
    d(176 /* MediaSelect */, 'MediaSelect');
    d(177 /* LaunchMail */, 'LaunchMail');
    d(178 /* LaunchApp2 */, 'LaunchApp2');
    d(179 /* LaunchApp1 */, 'LaunchApp1');
    d(180 /* SelectTask */, 'SelectTask');
    d(181 /* LaunchScreenSaver */, 'LaunchScreenSaver');
    d(182 /* BrowserSearch */, 'BrowserSearch');
    d(183 /* BrowserHome */, 'BrowserHome');
    d(184 /* BrowserBack */, 'BrowserBack');
    d(185 /* BrowserForward */, 'BrowserForward');
    d(186 /* BrowserStop */, 'BrowserStop');
    d(187 /* BrowserRefresh */, 'BrowserRefresh');
    d(188 /* BrowserFavorites */, 'BrowserFavorites');
    d(189 /* ZoomToggle */, 'ZoomToggle');
    d(190 /* MailReply */, 'MailReply');
    d(191 /* MailForward */, 'MailForward');
    d(192 /* MailSend */, 'MailSend');
})();
(function () {
    for (let i = 0; i <= 193 /* MAX_VALUE */; i++) {
        IMMUTABLE_CODE_TO_KEY_CODE[i] = -1;
    }
    for (let i = 0; i <= 112 /* MAX_VALUE */; i++) {
        IMMUTABLE_KEY_CODE_TO_CODE[i] = -1;
    }
    function define(code, keyCode) {
        IMMUTABLE_CODE_TO_KEY_CODE[code] = keyCode;
        if ((keyCode !== 0 /* Unknown */)
            && (keyCode !== 3 /* Enter */)
            && (keyCode !== 5 /* Ctrl */)
            && (keyCode !== 4 /* Shift */)
            && (keyCode !== 6 /* Alt */)
            && (keyCode !== 57 /* Meta */)) {
            IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = code;
        }
    }
    // Manually added due to the exclusion above (due to duplication with NumpadEnter)
    IMMUTABLE_KEY_CODE_TO_CODE[3 /* Enter */] = 46 /* Enter */;
    define(0 /* None */, 0 /* Unknown */);
    define(1 /* Hyper */, 0 /* Unknown */);
    define(2 /* Super */, 0 /* Unknown */);
    define(3 /* Fn */, 0 /* Unknown */);
    define(4 /* FnLock */, 0 /* Unknown */);
    define(5 /* Suspend */, 0 /* Unknown */);
    define(6 /* Resume */, 0 /* Unknown */);
    define(7 /* Turbo */, 0 /* Unknown */);
    define(8 /* Sleep */, 0 /* Unknown */);
    define(9 /* WakeUp */, 0 /* Unknown */);
    // define(ScanCode.KeyA, KeyCode.Unknown);
    // define(ScanCode.KeyB, KeyCode.Unknown);
    // define(ScanCode.KeyC, KeyCode.Unknown);
    // define(ScanCode.KeyD, KeyCode.Unknown);
    // define(ScanCode.KeyE, KeyCode.Unknown);
    // define(ScanCode.KeyF, KeyCode.Unknown);
    // define(ScanCode.KeyG, KeyCode.Unknown);
    // define(ScanCode.KeyH, KeyCode.Unknown);
    // define(ScanCode.KeyI, KeyCode.Unknown);
    // define(ScanCode.KeyJ, KeyCode.Unknown);
    // define(ScanCode.KeyK, KeyCode.Unknown);
    // define(ScanCode.KeyL, KeyCode.Unknown);
    // define(ScanCode.KeyM, KeyCode.Unknown);
    // define(ScanCode.KeyN, KeyCode.Unknown);
    // define(ScanCode.KeyO, KeyCode.Unknown);
    // define(ScanCode.KeyP, KeyCode.Unknown);
    // define(ScanCode.KeyQ, KeyCode.Unknown);
    // define(ScanCode.KeyR, KeyCode.Unknown);
    // define(ScanCode.KeyS, KeyCode.Unknown);
    // define(ScanCode.KeyT, KeyCode.Unknown);
    // define(ScanCode.KeyU, KeyCode.Unknown);
    // define(ScanCode.KeyV, KeyCode.Unknown);
    // define(ScanCode.KeyW, KeyCode.Unknown);
    // define(ScanCode.KeyX, KeyCode.Unknown);
    // define(ScanCode.KeyY, KeyCode.Unknown);
    // define(ScanCode.KeyZ, KeyCode.Unknown);
    // define(ScanCode.Digit1, KeyCode.Unknown);
    // define(ScanCode.Digit2, KeyCode.Unknown);
    // define(ScanCode.Digit3, KeyCode.Unknown);
    // define(ScanCode.Digit4, KeyCode.Unknown);
    // define(ScanCode.Digit5, KeyCode.Unknown);
    // define(ScanCode.Digit6, KeyCode.Unknown);
    // define(ScanCode.Digit7, KeyCode.Unknown);
    // define(ScanCode.Digit8, KeyCode.Unknown);
    // define(ScanCode.Digit9, KeyCode.Unknown);
    // define(ScanCode.Digit0, KeyCode.Unknown);
    define(46 /* Enter */, 3 /* Enter */);
    define(47 /* Escape */, 9 /* Escape */);
    define(48 /* Backspace */, 1 /* Backspace */);
    define(49 /* Tab */, 2 /* Tab */);
    define(50 /* Space */, 10 /* Space */);
    // define(ScanCode.Minus, KeyCode.Unknown);
    // define(ScanCode.Equal, KeyCode.Unknown);
    // define(ScanCode.BracketLeft, KeyCode.Unknown);
    // define(ScanCode.BracketRight, KeyCode.Unknown);
    // define(ScanCode.Backslash, KeyCode.Unknown);
    // define(ScanCode.IntlHash, KeyCode.Unknown);
    // define(ScanCode.Semicolon, KeyCode.Unknown);
    // define(ScanCode.Quote, KeyCode.Unknown);
    // define(ScanCode.Backquote, KeyCode.Unknown);
    // define(ScanCode.Comma, KeyCode.Unknown);
    // define(ScanCode.Period, KeyCode.Unknown);
    // define(ScanCode.Slash, KeyCode.Unknown);
    define(63 /* CapsLock */, 8 /* CapsLock */);
    define(64 /* F1 */, 59 /* F1 */);
    define(65 /* F2 */, 60 /* F2 */);
    define(66 /* F3 */, 61 /* F3 */);
    define(67 /* F4 */, 62 /* F4 */);
    define(68 /* F5 */, 63 /* F5 */);
    define(69 /* F6 */, 64 /* F6 */);
    define(70 /* F7 */, 65 /* F7 */);
    define(71 /* F8 */, 66 /* F8 */);
    define(72 /* F9 */, 67 /* F9 */);
    define(73 /* F10 */, 68 /* F10 */);
    define(74 /* F11 */, 69 /* F11 */);
    define(75 /* F12 */, 70 /* F12 */);
    define(76 /* PrintScreen */, 0 /* Unknown */);
    define(77 /* ScrollLock */, 79 /* ScrollLock */);
    define(78 /* Pause */, 7 /* PauseBreak */);
    define(79 /* Insert */, 19 /* Insert */);
    define(80 /* Home */, 14 /* Home */);
    define(81 /* PageUp */, 11 /* PageUp */);
    define(82 /* Delete */, 20 /* Delete */);
    define(83 /* End */, 13 /* End */);
    define(84 /* PageDown */, 12 /* PageDown */);
    define(85 /* ArrowRight */, 17 /* RightArrow */);
    define(86 /* ArrowLeft */, 15 /* LeftArrow */);
    define(87 /* ArrowDown */, 18 /* DownArrow */);
    define(88 /* ArrowUp */, 16 /* UpArrow */);
    define(89 /* NumLock */, 78 /* NumLock */);
    define(90 /* NumpadDivide */, 108 /* NUMPAD_DIVIDE */);
    define(91 /* NumpadMultiply */, 103 /* NUMPAD_MULTIPLY */);
    define(92 /* NumpadSubtract */, 106 /* NUMPAD_SUBTRACT */);
    define(93 /* NumpadAdd */, 104 /* NUMPAD_ADD */);
    define(94 /* NumpadEnter */, 3 /* Enter */); // Duplicate
    define(95 /* Numpad1 */, 94 /* NUMPAD_1 */);
    define(96 /* Numpad2 */, 95 /* NUMPAD_2 */);
    define(97 /* Numpad3 */, 96 /* NUMPAD_3 */);
    define(98 /* Numpad4 */, 97 /* NUMPAD_4 */);
    define(99 /* Numpad5 */, 98 /* NUMPAD_5 */);
    define(100 /* Numpad6 */, 99 /* NUMPAD_6 */);
    define(101 /* Numpad7 */, 100 /* NUMPAD_7 */);
    define(102 /* Numpad8 */, 101 /* NUMPAD_8 */);
    define(103 /* Numpad9 */, 102 /* NUMPAD_9 */);
    define(104 /* Numpad0 */, 93 /* NUMPAD_0 */);
    define(105 /* NumpadDecimal */, 107 /* NUMPAD_DECIMAL */);
    // define(ScanCode.IntlBackslash, KeyCode.Unknown);
    define(107 /* ContextMenu */, 58 /* ContextMenu */);
    define(108 /* Power */, 0 /* Unknown */);
    define(109 /* NumpadEqual */, 0 /* Unknown */);
    define(110 /* F13 */, 71 /* F13 */);
    define(111 /* F14 */, 72 /* F14 */);
    define(112 /* F15 */, 73 /* F15 */);
    define(113 /* F16 */, 74 /* F16 */);
    define(114 /* F17 */, 75 /* F17 */);
    define(115 /* F18 */, 76 /* F18 */);
    define(116 /* F19 */, 77 /* F19 */);
    define(117 /* F20 */, 0 /* Unknown */);
    define(118 /* F21 */, 0 /* Unknown */);
    define(119 /* F22 */, 0 /* Unknown */);
    define(120 /* F23 */, 0 /* Unknown */);
    define(121 /* F24 */, 0 /* Unknown */);
    define(122 /* Open */, 0 /* Unknown */);
    define(123 /* Help */, 0 /* Unknown */);
    define(124 /* Select */, 0 /* Unknown */);
    define(125 /* Again */, 0 /* Unknown */);
    define(126 /* Undo */, 0 /* Unknown */);
    define(127 /* Cut */, 0 /* Unknown */);
    define(128 /* Copy */, 0 /* Unknown */);
    define(129 /* Paste */, 0 /* Unknown */);
    define(130 /* Find */, 0 /* Unknown */);
    define(131 /* AudioVolumeMute */, 0 /* Unknown */);
    define(132 /* AudioVolumeUp */, 0 /* Unknown */);
    define(133 /* AudioVolumeDown */, 0 /* Unknown */);
    define(134 /* NumpadComma */, 105 /* NUMPAD_SEPARATOR */);
    // define(ScanCode.IntlRo, KeyCode.Unknown);
    define(136 /* KanaMode */, 0 /* Unknown */);
    // define(ScanCode.IntlYen, KeyCode.Unknown);
    define(138 /* Convert */, 0 /* Unknown */);
    define(139 /* NonConvert */, 0 /* Unknown */);
    define(140 /* Lang1 */, 0 /* Unknown */);
    define(141 /* Lang2 */, 0 /* Unknown */);
    define(142 /* Lang3 */, 0 /* Unknown */);
    define(143 /* Lang4 */, 0 /* Unknown */);
    define(144 /* Lang5 */, 0 /* Unknown */);
    define(145 /* Abort */, 0 /* Unknown */);
    define(146 /* Props */, 0 /* Unknown */);
    define(147 /* NumpadParenLeft */, 0 /* Unknown */);
    define(148 /* NumpadParenRight */, 0 /* Unknown */);
    define(149 /* NumpadBackspace */, 0 /* Unknown */);
    define(150 /* NumpadMemoryStore */, 0 /* Unknown */);
    define(151 /* NumpadMemoryRecall */, 0 /* Unknown */);
    define(152 /* NumpadMemoryClear */, 0 /* Unknown */);
    define(153 /* NumpadMemoryAdd */, 0 /* Unknown */);
    define(154 /* NumpadMemorySubtract */, 0 /* Unknown */);
    define(155 /* NumpadClear */, 0 /* Unknown */);
    define(156 /* NumpadClearEntry */, 0 /* Unknown */);
    define(157 /* ControlLeft */, 5 /* Ctrl */); // Duplicate
    define(158 /* ShiftLeft */, 4 /* Shift */); // Duplicate
    define(159 /* AltLeft */, 6 /* Alt */); // Duplicate
    define(160 /* MetaLeft */, 57 /* Meta */); // Duplicate
    define(161 /* ControlRight */, 5 /* Ctrl */); // Duplicate
    define(162 /* ShiftRight */, 4 /* Shift */); // Duplicate
    define(163 /* AltRight */, 6 /* Alt */); // Duplicate
    define(164 /* MetaRight */, 57 /* Meta */); // Duplicate
    define(165 /* BrightnessUp */, 0 /* Unknown */);
    define(166 /* BrightnessDown */, 0 /* Unknown */);
    define(167 /* MediaPlay */, 0 /* Unknown */);
    define(168 /* MediaRecord */, 0 /* Unknown */);
    define(169 /* MediaFastForward */, 0 /* Unknown */);
    define(170 /* MediaRewind */, 0 /* Unknown */);
    define(171 /* MediaTrackNext */, 0 /* Unknown */);
    define(172 /* MediaTrackPrevious */, 0 /* Unknown */);
    define(173 /* MediaStop */, 0 /* Unknown */);
    define(174 /* Eject */, 0 /* Unknown */);
    define(175 /* MediaPlayPause */, 0 /* Unknown */);
    define(176 /* MediaSelect */, 0 /* Unknown */);
    define(177 /* LaunchMail */, 0 /* Unknown */);
    define(178 /* LaunchApp2 */, 0 /* Unknown */);
    define(179 /* LaunchApp1 */, 0 /* Unknown */);
    define(180 /* SelectTask */, 0 /* Unknown */);
    define(181 /* LaunchScreenSaver */, 0 /* Unknown */);
    define(182 /* BrowserSearch */, 0 /* Unknown */);
    define(183 /* BrowserHome */, 0 /* Unknown */);
    define(184 /* BrowserBack */, 0 /* Unknown */);
    define(185 /* BrowserForward */, 0 /* Unknown */);
    define(186 /* BrowserStop */, 0 /* Unknown */);
    define(187 /* BrowserRefresh */, 0 /* Unknown */);
    define(188 /* BrowserFavorites */, 0 /* Unknown */);
    define(189 /* ZoomToggle */, 0 /* Unknown */);
    define(190 /* MailReply */, 0 /* Unknown */);
    define(191 /* MailForward */, 0 /* Unknown */);
    define(192 /* MailSend */, 0 /* Unknown */);
})();

class KeybindingsRegistry {
    // public WEIGHT = {
    //   chartCore: (importance: number = 0): number => {
    //     return 0 + importance;
    //   },
    //   chartContrib: (importance: number = 0): number => {
    //     return 100 + importance;
    //   },
    //   workbenchContrib: (importance: number = 0): number => {
    //     return 200 + importance;
    //   },
    //   builtinExtension: (importance: number = 0): number => {
    //     return 300 + importance;
    //   },
    //   externalExtension: (importance: number = 0): number => {
    //     return 400 + importance;
    //   }
    // };
    constructor(_commandsRegistry) {
        this._commandsRegistry = _commandsRegistry;
        this._keybindings = [];
        this._keybindingsSorted = true;
    }
    /**
     * Take current platform into account and reduce to primary & secondary.
     */
    static bindToCurrentPlatform(kb) {
        if (OS === 1 /* Windows */) {
            if (kb && kb.win) {
                return kb.win;
            }
        }
        else if (OS === 2 /* Macintosh */) {
            if (kb && kb.mac) {
                return kb.mac;
            }
        }
        else {
            if (kb && kb.linux) {
                return kb.linux;
            }
        }
        return kb;
    }
    registerKeybindingRule(rule) {
        let actualKb = KeybindingsRegistry.bindToCurrentPlatform(rule);
        if (actualKb && actualKb.primary) {
            this._registerDefaultKeybinding(createKeybinding(actualKb.primary, OS), rule.id, rule.weight, 0, rule.when);
        }
        if (actualKb && Array.isArray(actualKb.secondary)) {
            for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                const k = actualKb.secondary[i];
                this._registerDefaultKeybinding(createKeybinding(k, OS), rule.id, rule.weight, -i - 1, rule.when);
            }
        }
    }
    registerCommandAndKeybindingRule(desc) {
        this.registerKeybindingRule(desc);
        this._commandsRegistry.registerCommand(desc);
    }
    static _mightProduceChar(keyCode) {
        if (keyCode >= 21 /* KEY_0 */ && keyCode <= 30 /* KEY_9 */) {
            return true;
        }
        if (keyCode >= 31 /* KEY_A */ && keyCode <= 56 /* KEY_Z */) {
            return true;
        }
        return (keyCode === 80 /* US_SEMICOLON */
            || keyCode === 81 /* US_EQUAL */
            || keyCode === 82 /* US_COMMA */
            || keyCode === 83 /* US_MINUS */
            || keyCode === 84 /* US_DOT */
            || keyCode === 85 /* US_SLASH */
            || keyCode === 86 /* US_BACKTICK */
            || keyCode === 110 /* ABNT_C1 */
            || keyCode === 111 /* ABNT_C2 */
            || keyCode === 87 /* US_OPEN_SQUARE_BRACKET */
            || keyCode === 88 /* US_BACKSLASH */
            || keyCode === 89 /* US_CLOSE_SQUARE_BRACKET */
            || keyCode === 90 /* US_QUOTE */
            || keyCode === 91 /* OEM_8 */
            || keyCode === 92 /* OEM_102 */);
    }
    _assertNoCtrlAlt(keybinding, commandId) {
        if (keybinding.ctrlKey && keybinding.altKey && !keybinding.metaKey) {
            if (KeybindingsRegistry._mightProduceChar(keybinding.keyCode)) {
                console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
            }
        }
    }
    _registerDefaultKeybinding(keybinding, commandId, weight1, weight2, when) {
        if (OS === 1 /* Windows */) {
            if (keybinding.type === 2 /* Chord */) {
                this._assertNoCtrlAlt(keybinding.firstPart, commandId);
            }
            else {
                this._assertNoCtrlAlt(keybinding, commandId);
            }
        }
        this._keybindings.push({
            keybinding: keybinding,
            command: commandId,
            commandArgs: undefined,
            when: when,
            weight1: weight1,
            weight2: weight2
        });
        this._keybindingsSorted = false;
    }
    getDefaultKeybindings() {
        if (!this._keybindingsSorted) {
            this._keybindings.sort(sorter);
            this._keybindingsSorted = true;
        }
        return this._keybindings.slice(0);
    }
}
function sorter(a, b) {
    if (a.weight1 !== b.weight1) {
        return a.weight1 - b.weight1;
    }
    if (a.command < b.command) {
        return -1;
    }
    if (a.command > b.command) {
        return 1;
    }
    return a.weight2 - b.weight2;
}

function dispose$2(first, ...rest) {
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
        dispose$2(first);
        dispose$2(rest);
        return [];
    }
}
class Disposable$2 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$2(this._toDispose);
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
Disposable$2.None = Object.freeze({ dispose() { } });

function dispose$1$1(first, ...rest) {
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
        dispose$1$1(first);
        dispose$1$1(rest);
        return [];
    }
}
function combinedDisposable$1(disposables) {
    return { dispose: () => dispose$1$1(disposables) };
}
class Disposable$1$1 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$1$1(this._toDispose);
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
Disposable$1$1.None = Object.freeze({ dispose() { } });

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$2 = { done: true, value: undefined };
var Iterator$2;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$2;
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
                    return FIN$2;
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
                    return FIN$2;
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
                        return FIN$2;
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
})(Iterator$2 || (Iterator$2 = {}));

class Node$1 {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList$1 {
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
        const newNode = new Node$1(element);
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
        while (candidate instanceof Node$1) {
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
                    return FIN$2;
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
        for (let node = this._first; node instanceof Node$1; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

var Event$1;
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
        return (listener, thisArgs = null, disposables) => combinedDisposable$1(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
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
        const emitter = new Emitter$1({
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
        const emitter = new Emitter$1({
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
        const emitter = new Emitter$1({
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
        const result = new Emitter$1({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter$1();
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
})(Event$1 || (Event$1 = {}));
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
class Emitter$1 {
    constructor(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList$1();
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
                        result.dispose = Emitter$1._noop;
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
Emitter$1._noop = function () { };

class IntervalTimer extends Disposable$2 {
    constructor() {
        super();
        this._token = -1;
    }
    dispose() {
        this.cancel();
        super.dispose();
    }
    cancel() {
        if (this._token !== -1) {
            clearInterval(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, interval) {
        this.cancel();
        this._token = setInterval(() => {
            runner();
        }, interval);
    }
}

function dispose$2$1(first, ...rest) {
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
        dispose$2$1(first);
        dispose$2$1(rest);
        return [];
    }
}
function combinedDisposable$1$1(disposables) {
    return { dispose: () => dispose$2$1(disposables) };
}
class Disposable$2$1 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$2$1(this._toDispose);
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
Disposable$2$1.None = Object.freeze({ dispose() { } });

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$1$1 = { done: true, value: undefined };
var Iterator$1$1;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$1$1;
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
                    return FIN$1$1;
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
                    return FIN$1$1;
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
                        return FIN$1$1;
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
})(Iterator$1$1 || (Iterator$1$1 = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Node$1$1 {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList$1$1 {
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
        const newNode = new Node$1$1(element);
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
        while (candidate instanceof Node$1$1) {
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
                    return FIN$1$1;
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
        for (let node = this._first; node instanceof Node$1$1; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

var Event$1$1;
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
        return (listener, thisArgs = null, disposables) => combinedDisposable$1$1(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
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
        const emitter = new Emitter$1$1({
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
        const emitter = new Emitter$1$1({
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
        const emitter = new Emitter$1$1({
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
        const result = new Emitter$1$1({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter$1$1();
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
})(Event$1$1 || (Event$1$1 = {}));
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
class Emitter$1$1 {
    constructor(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList$1$1();
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
                        result.dispose = Emitter$1$1._noop;
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
Emitter$1$1._noop = function () { };

function dispose$1$1$1(first, ...rest) {
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
        dispose$1$1$1(first);
        dispose$1$1$1(rest);
        return [];
    }
}
class Disposable$1$1$1 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$1$1$1(this._toDispose);
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
Disposable$1$1$1.None = Object.freeze({ dispose() { } });

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

class KeybindingResolver {
    constructor(defaultKeybindings, overrides) {
        this._defaultKeybindings = defaultKeybindings;
        this._defaultBoundCommands = new Map();
        for (let i = 0, len = defaultKeybindings.length; i < len; i++) {
            const command = defaultKeybindings[i].command;
            this._defaultBoundCommands.set(command, true);
        }
        this._map = new Map();
        this._lookupMap = new Map();
        this._keybindings = KeybindingResolver.combine(defaultKeybindings, overrides);
        for (let i = 0, len = this._keybindings.length; i < len; i++) {
            let k = this._keybindings[i];
            if (k.keypressFirstPart === null) {
                // unbound
                continue;
            }
            this._addKeyPress(k.keypressFirstPart, k);
        }
    }
    static _isTargetedForRemoval(defaultKb, keypressFirstPart, keypressChordPart, command, when) {
        if (defaultKb.command !== command) {
            return false;
        }
        if (keypressFirstPart && defaultKb.keypressFirstPart !== keypressFirstPart) {
            return false;
        }
        if (keypressChordPart && defaultKb.keypressChordPart !== keypressChordPart) {
            return false;
        }
        if (when) {
            if (!defaultKb.when) {
                return false;
            }
            if (!when.equals(defaultKb.when)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Looks for rules containing -command in `overrides` and removes them directly from `defaults`.
     */
    static combine(defaults, rawOverrides) {
        defaults = defaults.slice(0);
        let overrides = [];
        for (let i = 0, len = rawOverrides.length; i < len; i++) {
            const override = rawOverrides[i];
            if (!override.command || override.command.length === 0 || override.command.charAt(0) !== '-') {
                overrides.push(override);
                continue;
            }
            const command = override.command.substr(1);
            const keypressFirstPart = override.keypressFirstPart;
            const keypressChordPart = override.keypressChordPart;
            const when = override.when;
            for (let j = defaults.length - 1; j >= 0; j--) {
                if (this._isTargetedForRemoval(defaults[j], keypressFirstPart, keypressChordPart, command, when)) {
                    defaults.splice(j, 1);
                }
            }
        }
        return defaults.concat(overrides);
    }
    _addKeyPress(keypress, item) {
        const conflicts = this._map.get(keypress);
        if (typeof conflicts === 'undefined') {
            // There is no conflict so far
            this._map.set(keypress, [item]);
            this._addToLookupMap(item);
            return;
        }
        for (let i = conflicts.length - 1; i >= 0; i--) {
            let conflict = conflicts[i];
            if (conflict.command === item.command) {
                continue;
            }
            const conflictIsChord = (conflict.keypressChordPart !== null);
            const itemIsChord = (item.keypressChordPart !== null);
            if (conflictIsChord && itemIsChord && conflict.keypressChordPart !== item.keypressChordPart) {
                // The conflict only shares the chord start with this command
                continue;
            }
            if (KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
                // `item` completely overwrites `conflict`
                // Remove conflict from the lookupMap
                this._removeFromLookupMap(conflict);
            }
        }
        conflicts.push(item);
        this._addToLookupMap(item);
    }
    _addToLookupMap(item) {
        if (!item.command) {
            return;
        }
        let arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            arr = [item];
            this._lookupMap.set(item.command, arr);
        }
        else {
            arr.push(item);
        }
    }
    _removeFromLookupMap(item) {
        let arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            return;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                arr.splice(i, 1);
                return;
            }
        }
    }
    /**
     * Returns true if it is provable `a` implies `b`.
     * **Precondition**: Assumes `a` and `b` are normalized!
     */
    static whenIsEntirelyIncluded(a, b) {
        if (!b) {
            return true;
        }
        if (!a) {
            return false;
        }
        const aExpressions = ((a instanceof ContextKeyAndExpr) ? a.expr : [a]);
        const bExpressions = ((b instanceof ContextKeyAndExpr) ? b.expr : [b]);
        let aIndex = 0;
        for (let bIndex = 0; bIndex < bExpressions.length; bIndex++) {
            let bExpr = bExpressions[bIndex];
            let bExprMatched = false;
            while (!bExprMatched && aIndex < aExpressions.length) {
                let aExpr = aExpressions[aIndex];
                if (aExpr.equals(bExpr)) {
                    bExprMatched = true;
                }
                aIndex++;
            }
            if (!bExprMatched) {
                return false;
            }
        }
        return true;
    }
    getDefaultKeybindings() {
        return this._defaultKeybindings;
    }
    getKeybindings() {
        return this._keybindings;
    }
    lookupKeybindings(commandId) {
        let items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return [];
        }
        // Reverse to get the most specific item first
        let result = [], resultLen = 0;
        for (let i = items.length - 1; i >= 0; i--) {
            result[resultLen++] = items[i];
        }
        return result;
    }
    lookupPrimaryKeybinding(commandId) {
        let items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return null;
        }
        return items[items.length - 1];
    }
    resolve(context, currentChord, keypress) {
        let lookupMap = null;
        if (currentChord !== null) {
            // Fetch all chord bindings for `currentChord`
            const candidates = this._map.get(currentChord);
            if (typeof candidates === 'undefined') {
                // No chords starting with `currentChord`
                return null;
            }
            lookupMap = [];
            for (let i = 0, len = candidates.length; i < len; i++) {
                let candidate = candidates[i];
                if (candidate.keypressChordPart === keypress) {
                    lookupMap.push(candidate);
                }
            }
        }
        else {
            const candidates = this._map.get(keypress);
            if (typeof candidates === 'undefined') {
                // No bindings with `keypress`
                return null;
            }
            lookupMap = candidates;
        }
        let result = this._findCommand(context, lookupMap);
        if (!result) {
            return null;
        }
        if (currentChord === null && result.keypressChordPart !== null) {
            return {
                enterChord: true,
                commandId: null,
                commandArgs: null,
                bubble: false
            };
        }
        return {
            enterChord: false,
            commandId: result.command,
            commandArgs: result.commandArgs,
            bubble: result.bubble
        };
    }
    _findCommand(context, matches) {
        for (let i = matches.length - 1; i >= 0; i--) {
            let k = matches[i];
            if (!KeybindingResolver.contextMatchesRules(context, k.when)) {
                continue;
            }
            return k;
        }
        return null;
    }
    static contextMatchesRules(context, rules) {
        if (!rules) {
            return true;
        }
        return rules.evaluate(context);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Names from https://blog.codinghorror.com/ascii-pronunciation-rules-for-programmers/
/**
 * An inlined enum containing useful character codes (to be used with String.charCodeAt).
 * Please leave the const keyword such that it gets inlined when compiled to JavaScript!
 */
var CharCode$1;
(function (CharCode) {
    CharCode[CharCode["Null"] = 0] = "Null";
    /**
     * The `\t` character.
     */
    CharCode[CharCode["Tab"] = 9] = "Tab";
    /**
     * The `\n` character.
     */
    CharCode[CharCode["LineFeed"] = 10] = "LineFeed";
    /**
     * The `\r` character.
     */
    CharCode[CharCode["CarriageReturn"] = 13] = "CarriageReturn";
    CharCode[CharCode["Space"] = 32] = "Space";
    /**
     * The `!` character.
     */
    CharCode[CharCode["ExclamationMark"] = 33] = "ExclamationMark";
    /**
     * The `"` character.
     */
    CharCode[CharCode["DoubleQuote"] = 34] = "DoubleQuote";
    /**
     * The `#` character.
     */
    CharCode[CharCode["Hash"] = 35] = "Hash";
    /**
     * The `$` character.
     */
    CharCode[CharCode["DollarSign"] = 36] = "DollarSign";
    /**
     * The `%` character.
     */
    CharCode[CharCode["PercentSign"] = 37] = "PercentSign";
    /**
     * The `&` character.
     */
    CharCode[CharCode["Ampersand"] = 38] = "Ampersand";
    /**
     * The `'` character.
     */
    CharCode[CharCode["SingleQuote"] = 39] = "SingleQuote";
    /**
     * The `(` character.
     */
    CharCode[CharCode["OpenParen"] = 40] = "OpenParen";
    /**
     * The `)` character.
     */
    CharCode[CharCode["CloseParen"] = 41] = "CloseParen";
    /**
     * The `*` character.
     */
    CharCode[CharCode["Asterisk"] = 42] = "Asterisk";
    /**
     * The `+` character.
     */
    CharCode[CharCode["Plus"] = 43] = "Plus";
    /**
     * The `,` character.
     */
    CharCode[CharCode["Comma"] = 44] = "Comma";
    /**
     * The `-` character.
     */
    CharCode[CharCode["Dash"] = 45] = "Dash";
    /**
     * The `.` character.
     */
    CharCode[CharCode["Period"] = 46] = "Period";
    /**
     * The `/` character.
     */
    CharCode[CharCode["Slash"] = 47] = "Slash";
    CharCode[CharCode["Digit0"] = 48] = "Digit0";
    CharCode[CharCode["Digit1"] = 49] = "Digit1";
    CharCode[CharCode["Digit2"] = 50] = "Digit2";
    CharCode[CharCode["Digit3"] = 51] = "Digit3";
    CharCode[CharCode["Digit4"] = 52] = "Digit4";
    CharCode[CharCode["Digit5"] = 53] = "Digit5";
    CharCode[CharCode["Digit6"] = 54] = "Digit6";
    CharCode[CharCode["Digit7"] = 55] = "Digit7";
    CharCode[CharCode["Digit8"] = 56] = "Digit8";
    CharCode[CharCode["Digit9"] = 57] = "Digit9";
    /**
     * The `:` character.
     */
    CharCode[CharCode["Colon"] = 58] = "Colon";
    /**
     * The `;` character.
     */
    CharCode[CharCode["Semicolon"] = 59] = "Semicolon";
    /**
     * The `<` character.
     */
    CharCode[CharCode["LessThan"] = 60] = "LessThan";
    /**
     * The `=` character.
     */
    CharCode[CharCode["Equals"] = 61] = "Equals";
    /**
     * The `>` character.
     */
    CharCode[CharCode["GreaterThan"] = 62] = "GreaterThan";
    /**
     * The `?` character.
     */
    CharCode[CharCode["QuestionMark"] = 63] = "QuestionMark";
    /**
     * The `@` character.
     */
    CharCode[CharCode["AtSign"] = 64] = "AtSign";
    CharCode[CharCode["A"] = 65] = "A";
    CharCode[CharCode["B"] = 66] = "B";
    CharCode[CharCode["C"] = 67] = "C";
    CharCode[CharCode["D"] = 68] = "D";
    CharCode[CharCode["E"] = 69] = "E";
    CharCode[CharCode["F"] = 70] = "F";
    CharCode[CharCode["G"] = 71] = "G";
    CharCode[CharCode["H"] = 72] = "H";
    CharCode[CharCode["I"] = 73] = "I";
    CharCode[CharCode["J"] = 74] = "J";
    CharCode[CharCode["K"] = 75] = "K";
    CharCode[CharCode["L"] = 76] = "L";
    CharCode[CharCode["M"] = 77] = "M";
    CharCode[CharCode["N"] = 78] = "N";
    CharCode[CharCode["O"] = 79] = "O";
    CharCode[CharCode["P"] = 80] = "P";
    CharCode[CharCode["Q"] = 81] = "Q";
    CharCode[CharCode["R"] = 82] = "R";
    CharCode[CharCode["S"] = 83] = "S";
    CharCode[CharCode["T"] = 84] = "T";
    CharCode[CharCode["U"] = 85] = "U";
    CharCode[CharCode["V"] = 86] = "V";
    CharCode[CharCode["W"] = 87] = "W";
    CharCode[CharCode["X"] = 88] = "X";
    CharCode[CharCode["Y"] = 89] = "Y";
    CharCode[CharCode["Z"] = 90] = "Z";
    /**
     * The `[` character.
     */
    CharCode[CharCode["OpenSquareBracket"] = 91] = "OpenSquareBracket";
    /**
     * The `\` character.
     */
    CharCode[CharCode["Backslash"] = 92] = "Backslash";
    /**
     * The `]` character.
     */
    CharCode[CharCode["CloseSquareBracket"] = 93] = "CloseSquareBracket";
    /**
     * The `^` character.
     */
    CharCode[CharCode["Caret"] = 94] = "Caret";
    /**
     * The `_` character.
     */
    CharCode[CharCode["Underline"] = 95] = "Underline";
    /**
     * The ``(`)`` character.
     */
    CharCode[CharCode["BackTick"] = 96] = "BackTick";
    CharCode[CharCode["a"] = 97] = "a";
    CharCode[CharCode["b"] = 98] = "b";
    CharCode[CharCode["c"] = 99] = "c";
    CharCode[CharCode["d"] = 100] = "d";
    CharCode[CharCode["e"] = 101] = "e";
    CharCode[CharCode["f"] = 102] = "f";
    CharCode[CharCode["g"] = 103] = "g";
    CharCode[CharCode["h"] = 104] = "h";
    CharCode[CharCode["i"] = 105] = "i";
    CharCode[CharCode["j"] = 106] = "j";
    CharCode[CharCode["k"] = 107] = "k";
    CharCode[CharCode["l"] = 108] = "l";
    CharCode[CharCode["m"] = 109] = "m";
    CharCode[CharCode["n"] = 110] = "n";
    CharCode[CharCode["o"] = 111] = "o";
    CharCode[CharCode["p"] = 112] = "p";
    CharCode[CharCode["q"] = 113] = "q";
    CharCode[CharCode["r"] = 114] = "r";
    CharCode[CharCode["s"] = 115] = "s";
    CharCode[CharCode["t"] = 116] = "t";
    CharCode[CharCode["u"] = 117] = "u";
    CharCode[CharCode["v"] = 118] = "v";
    CharCode[CharCode["w"] = 119] = "w";
    CharCode[CharCode["x"] = 120] = "x";
    CharCode[CharCode["y"] = 121] = "y";
    CharCode[CharCode["z"] = 122] = "z";
    /**
     * The `{` character.
       */
    CharCode[CharCode["OpenCurlyBrace"] = 123] = "OpenCurlyBrace";
    /**
     * The `|` character.
     */
    CharCode[CharCode["Pipe"] = 124] = "Pipe";
    /**
     * The `}` character.
     */
    CharCode[CharCode["CloseCurlyBrace"] = 125] = "CloseCurlyBrace";
    /**
     * The `~` character.
     */
    CharCode[CharCode["Tilde"] = 126] = "Tilde";
    CharCode[CharCode["U_Combining_Grave_Accent"] = 768] = "U_Combining_Grave_Accent";
    CharCode[CharCode["U_Combining_Acute_Accent"] = 769] = "U_Combining_Acute_Accent";
    CharCode[CharCode["U_Combining_Circumflex_Accent"] = 770] = "U_Combining_Circumflex_Accent";
    CharCode[CharCode["U_Combining_Tilde"] = 771] = "U_Combining_Tilde";
    CharCode[CharCode["U_Combining_Macron"] = 772] = "U_Combining_Macron";
    CharCode[CharCode["U_Combining_Overline"] = 773] = "U_Combining_Overline";
    CharCode[CharCode["U_Combining_Breve"] = 774] = "U_Combining_Breve";
    CharCode[CharCode["U_Combining_Dot_Above"] = 775] = "U_Combining_Dot_Above";
    CharCode[CharCode["U_Combining_Diaeresis"] = 776] = "U_Combining_Diaeresis";
    CharCode[CharCode["U_Combining_Hook_Above"] = 777] = "U_Combining_Hook_Above";
    CharCode[CharCode["U_Combining_Ring_Above"] = 778] = "U_Combining_Ring_Above";
    CharCode[CharCode["U_Combining_Double_Acute_Accent"] = 779] = "U_Combining_Double_Acute_Accent";
    CharCode[CharCode["U_Combining_Caron"] = 780] = "U_Combining_Caron";
    CharCode[CharCode["U_Combining_Vertical_Line_Above"] = 781] = "U_Combining_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Above"] = 782] = "U_Combining_Double_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Grave_Accent"] = 783] = "U_Combining_Double_Grave_Accent";
    CharCode[CharCode["U_Combining_Candrabindu"] = 784] = "U_Combining_Candrabindu";
    CharCode[CharCode["U_Combining_Inverted_Breve"] = 785] = "U_Combining_Inverted_Breve";
    CharCode[CharCode["U_Combining_Turned_Comma_Above"] = 786] = "U_Combining_Turned_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above"] = 787] = "U_Combining_Comma_Above";
    CharCode[CharCode["U_Combining_Reversed_Comma_Above"] = 788] = "U_Combining_Reversed_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above_Right"] = 789] = "U_Combining_Comma_Above_Right";
    CharCode[CharCode["U_Combining_Grave_Accent_Below"] = 790] = "U_Combining_Grave_Accent_Below";
    CharCode[CharCode["U_Combining_Acute_Accent_Below"] = 791] = "U_Combining_Acute_Accent_Below";
    CharCode[CharCode["U_Combining_Left_Tack_Below"] = 792] = "U_Combining_Left_Tack_Below";
    CharCode[CharCode["U_Combining_Right_Tack_Below"] = 793] = "U_Combining_Right_Tack_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Above"] = 794] = "U_Combining_Left_Angle_Above";
    CharCode[CharCode["U_Combining_Horn"] = 795] = "U_Combining_Horn";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Below"] = 796] = "U_Combining_Left_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Up_Tack_Below"] = 797] = "U_Combining_Up_Tack_Below";
    CharCode[CharCode["U_Combining_Down_Tack_Below"] = 798] = "U_Combining_Down_Tack_Below";
    CharCode[CharCode["U_Combining_Plus_Sign_Below"] = 799] = "U_Combining_Plus_Sign_Below";
    CharCode[CharCode["U_Combining_Minus_Sign_Below"] = 800] = "U_Combining_Minus_Sign_Below";
    CharCode[CharCode["U_Combining_Palatalized_Hook_Below"] = 801] = "U_Combining_Palatalized_Hook_Below";
    CharCode[CharCode["U_Combining_Retroflex_Hook_Below"] = 802] = "U_Combining_Retroflex_Hook_Below";
    CharCode[CharCode["U_Combining_Dot_Below"] = 803] = "U_Combining_Dot_Below";
    CharCode[CharCode["U_Combining_Diaeresis_Below"] = 804] = "U_Combining_Diaeresis_Below";
    CharCode[CharCode["U_Combining_Ring_Below"] = 805] = "U_Combining_Ring_Below";
    CharCode[CharCode["U_Combining_Comma_Below"] = 806] = "U_Combining_Comma_Below";
    CharCode[CharCode["U_Combining_Cedilla"] = 807] = "U_Combining_Cedilla";
    CharCode[CharCode["U_Combining_Ogonek"] = 808] = "U_Combining_Ogonek";
    CharCode[CharCode["U_Combining_Vertical_Line_Below"] = 809] = "U_Combining_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Bridge_Below"] = 810] = "U_Combining_Bridge_Below";
    CharCode[CharCode["U_Combining_Inverted_Double_Arch_Below"] = 811] = "U_Combining_Inverted_Double_Arch_Below";
    CharCode[CharCode["U_Combining_Caron_Below"] = 812] = "U_Combining_Caron_Below";
    CharCode[CharCode["U_Combining_Circumflex_Accent_Below"] = 813] = "U_Combining_Circumflex_Accent_Below";
    CharCode[CharCode["U_Combining_Breve_Below"] = 814] = "U_Combining_Breve_Below";
    CharCode[CharCode["U_Combining_Inverted_Breve_Below"] = 815] = "U_Combining_Inverted_Breve_Below";
    CharCode[CharCode["U_Combining_Tilde_Below"] = 816] = "U_Combining_Tilde_Below";
    CharCode[CharCode["U_Combining_Macron_Below"] = 817] = "U_Combining_Macron_Below";
    CharCode[CharCode["U_Combining_Low_Line"] = 818] = "U_Combining_Low_Line";
    CharCode[CharCode["U_Combining_Double_Low_Line"] = 819] = "U_Combining_Double_Low_Line";
    CharCode[CharCode["U_Combining_Tilde_Overlay"] = 820] = "U_Combining_Tilde_Overlay";
    CharCode[CharCode["U_Combining_Short_Stroke_Overlay"] = 821] = "U_Combining_Short_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Long_Stroke_Overlay"] = 822] = "U_Combining_Long_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Short_Solidus_Overlay"] = 823] = "U_Combining_Short_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Long_Solidus_Overlay"] = 824] = "U_Combining_Long_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Below"] = 825] = "U_Combining_Right_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Inverted_Bridge_Below"] = 826] = "U_Combining_Inverted_Bridge_Below";
    CharCode[CharCode["U_Combining_Square_Below"] = 827] = "U_Combining_Square_Below";
    CharCode[CharCode["U_Combining_Seagull_Below"] = 828] = "U_Combining_Seagull_Below";
    CharCode[CharCode["U_Combining_X_Above"] = 829] = "U_Combining_X_Above";
    CharCode[CharCode["U_Combining_Vertical_Tilde"] = 830] = "U_Combining_Vertical_Tilde";
    CharCode[CharCode["U_Combining_Double_Overline"] = 831] = "U_Combining_Double_Overline";
    CharCode[CharCode["U_Combining_Grave_Tone_Mark"] = 832] = "U_Combining_Grave_Tone_Mark";
    CharCode[CharCode["U_Combining_Acute_Tone_Mark"] = 833] = "U_Combining_Acute_Tone_Mark";
    CharCode[CharCode["U_Combining_Greek_Perispomeni"] = 834] = "U_Combining_Greek_Perispomeni";
    CharCode[CharCode["U_Combining_Greek_Koronis"] = 835] = "U_Combining_Greek_Koronis";
    CharCode[CharCode["U_Combining_Greek_Dialytika_Tonos"] = 836] = "U_Combining_Greek_Dialytika_Tonos";
    CharCode[CharCode["U_Combining_Greek_Ypogegrammeni"] = 837] = "U_Combining_Greek_Ypogegrammeni";
    CharCode[CharCode["U_Combining_Bridge_Above"] = 838] = "U_Combining_Bridge_Above";
    CharCode[CharCode["U_Combining_Equals_Sign_Below"] = 839] = "U_Combining_Equals_Sign_Below";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Below"] = 840] = "U_Combining_Double_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Below"] = 841] = "U_Combining_Left_Angle_Below";
    CharCode[CharCode["U_Combining_Not_Tilde_Above"] = 842] = "U_Combining_Not_Tilde_Above";
    CharCode[CharCode["U_Combining_Homothetic_Above"] = 843] = "U_Combining_Homothetic_Above";
    CharCode[CharCode["U_Combining_Almost_Equal_To_Above"] = 844] = "U_Combining_Almost_Equal_To_Above";
    CharCode[CharCode["U_Combining_Left_Right_Arrow_Below"] = 845] = "U_Combining_Left_Right_Arrow_Below";
    CharCode[CharCode["U_Combining_Upwards_Arrow_Below"] = 846] = "U_Combining_Upwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Grapheme_Joiner"] = 847] = "U_Combining_Grapheme_Joiner";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Above"] = 848] = "U_Combining_Right_Arrowhead_Above";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Above"] = 849] = "U_Combining_Left_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Fermata"] = 850] = "U_Combining_Fermata";
    CharCode[CharCode["U_Combining_X_Below"] = 851] = "U_Combining_X_Below";
    CharCode[CharCode["U_Combining_Left_Arrowhead_Below"] = 852] = "U_Combining_Left_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Below"] = 853] = "U_Combining_Right_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below"] = 854] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Above"] = 855] = "U_Combining_Right_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Dot_Above_Right"] = 856] = "U_Combining_Dot_Above_Right";
    CharCode[CharCode["U_Combining_Asterisk_Below"] = 857] = "U_Combining_Asterisk_Below";
    CharCode[CharCode["U_Combining_Double_Ring_Below"] = 858] = "U_Combining_Double_Ring_Below";
    CharCode[CharCode["U_Combining_Zigzag_Above"] = 859] = "U_Combining_Zigzag_Above";
    CharCode[CharCode["U_Combining_Double_Breve_Below"] = 860] = "U_Combining_Double_Breve_Below";
    CharCode[CharCode["U_Combining_Double_Breve"] = 861] = "U_Combining_Double_Breve";
    CharCode[CharCode["U_Combining_Double_Macron"] = 862] = "U_Combining_Double_Macron";
    CharCode[CharCode["U_Combining_Double_Macron_Below"] = 863] = "U_Combining_Double_Macron_Below";
    CharCode[CharCode["U_Combining_Double_Tilde"] = 864] = "U_Combining_Double_Tilde";
    CharCode[CharCode["U_Combining_Double_Inverted_Breve"] = 865] = "U_Combining_Double_Inverted_Breve";
    CharCode[CharCode["U_Combining_Double_Rightwards_Arrow_Below"] = 866] = "U_Combining_Double_Rightwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_A"] = 867] = "U_Combining_Latin_Small_Letter_A";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_E"] = 868] = "U_Combining_Latin_Small_Letter_E";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_I"] = 869] = "U_Combining_Latin_Small_Letter_I";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_O"] = 870] = "U_Combining_Latin_Small_Letter_O";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_U"] = 871] = "U_Combining_Latin_Small_Letter_U";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_C"] = 872] = "U_Combining_Latin_Small_Letter_C";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_D"] = 873] = "U_Combining_Latin_Small_Letter_D";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_H"] = 874] = "U_Combining_Latin_Small_Letter_H";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_M"] = 875] = "U_Combining_Latin_Small_Letter_M";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_R"] = 876] = "U_Combining_Latin_Small_Letter_R";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_T"] = 877] = "U_Combining_Latin_Small_Letter_T";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_V"] = 878] = "U_Combining_Latin_Small_Letter_V";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_X"] = 879] = "U_Combining_Latin_Small_Letter_X";
    /**
     * Unicode Character 'LINE SEPARATOR' (U+2028)
     * http://www.fileformat.info/info/unicode/char/2028/index.htm
     */
    CharCode[CharCode["LINE_SEPARATOR_2028"] = 8232] = "LINE_SEPARATOR_2028";
    // http://www.fileformat.info/info/unicode/category/Sk/list.htm
    CharCode[CharCode["U_CIRCUMFLEX"] = 94] = "U_CIRCUMFLEX";
    CharCode[CharCode["U_GRAVE_ACCENT"] = 96] = "U_GRAVE_ACCENT";
    CharCode[CharCode["U_DIAERESIS"] = 168] = "U_DIAERESIS";
    CharCode[CharCode["U_MACRON"] = 175] = "U_MACRON";
    CharCode[CharCode["U_ACUTE_ACCENT"] = 180] = "U_ACUTE_ACCENT";
    CharCode[CharCode["U_CEDILLA"] = 184] = "U_CEDILLA";
    CharCode[CharCode["U_MODIFIER_LETTER_LEFT_ARROWHEAD"] = 706] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_RIGHT_ARROWHEAD"] = 707] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_ARROWHEAD"] = 708] = "U_MODIFIER_LETTER_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_ARROWHEAD"] = 709] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING"] = 722] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING"] = 723] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_TACK"] = 724] = "U_MODIFIER_LETTER_UP_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_TACK"] = 725] = "U_MODIFIER_LETTER_DOWN_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_PLUS_SIGN"] = 726] = "U_MODIFIER_LETTER_PLUS_SIGN";
    CharCode[CharCode["U_MODIFIER_LETTER_MINUS_SIGN"] = 727] = "U_MODIFIER_LETTER_MINUS_SIGN";
    CharCode[CharCode["U_BREVE"] = 728] = "U_BREVE";
    CharCode[CharCode["U_DOT_ABOVE"] = 729] = "U_DOT_ABOVE";
    CharCode[CharCode["U_RING_ABOVE"] = 730] = "U_RING_ABOVE";
    CharCode[CharCode["U_OGONEK"] = 731] = "U_OGONEK";
    CharCode[CharCode["U_SMALL_TILDE"] = 732] = "U_SMALL_TILDE";
    CharCode[CharCode["U_DOUBLE_ACUTE_ACCENT"] = 733] = "U_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_RHOTIC_HOOK"] = 734] = "U_MODIFIER_LETTER_RHOTIC_HOOK";
    CharCode[CharCode["U_MODIFIER_LETTER_CROSS_ACCENT"] = 735] = "U_MODIFIER_LETTER_CROSS_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR"] = 741] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_HIGH_TONE_BAR"] = 742] = "U_MODIFIER_LETTER_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_MID_TONE_BAR"] = 743] = "U_MODIFIER_LETTER_MID_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TONE_BAR"] = 744] = "U_MODIFIER_LETTER_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR"] = 745] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK"] = 746] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK"] = 747] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_UNASPIRATED"] = 749] = "U_MODIFIER_LETTER_UNASPIRATED";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD"] = 751] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_UP_ARROWHEAD"] = 752] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD"] = 753] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD"] = 754] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RING"] = 755] = "U_MODIFIER_LETTER_LOW_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT"] = 756] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT"] = 757] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT"] = 758] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TILDE"] = 759] = "U_MODIFIER_LETTER_LOW_TILDE";
    CharCode[CharCode["U_MODIFIER_LETTER_RAISED_COLON"] = 760] = "U_MODIFIER_LETTER_RAISED_COLON";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_HIGH_TONE"] = 761] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_HIGH_TONE"] = 762] = "U_MODIFIER_LETTER_END_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_LOW_TONE"] = 763] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_LOW_TONE"] = 764] = "U_MODIFIER_LETTER_END_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_SHELF"] = 765] = "U_MODIFIER_LETTER_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_OPEN_SHELF"] = 766] = "U_MODIFIER_LETTER_OPEN_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROW"] = 767] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW";
    CharCode[CharCode["U_GREEK_LOWER_NUMERAL_SIGN"] = 885] = "U_GREEK_LOWER_NUMERAL_SIGN";
    CharCode[CharCode["U_GREEK_TONOS"] = 900] = "U_GREEK_TONOS";
    CharCode[CharCode["U_GREEK_DIALYTIKA_TONOS"] = 901] = "U_GREEK_DIALYTIKA_TONOS";
    CharCode[CharCode["U_GREEK_KORONIS"] = 8125] = "U_GREEK_KORONIS";
    CharCode[CharCode["U_GREEK_PSILI"] = 8127] = "U_GREEK_PSILI";
    CharCode[CharCode["U_GREEK_PERISPOMENI"] = 8128] = "U_GREEK_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_PERISPOMENI"] = 8129] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_PSILI_AND_VARIA"] = 8141] = "U_GREEK_PSILI_AND_VARIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_OXIA"] = 8142] = "U_GREEK_PSILI_AND_OXIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_PERISPOMENI"] = 8143] = "U_GREEK_PSILI_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DASIA_AND_VARIA"] = 8157] = "U_GREEK_DASIA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_OXIA"] = 8158] = "U_GREEK_DASIA_AND_OXIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_PERISPOMENI"] = 8159] = "U_GREEK_DASIA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_VARIA"] = 8173] = "U_GREEK_DIALYTIKA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_OXIA"] = 8174] = "U_GREEK_DIALYTIKA_AND_OXIA";
    CharCode[CharCode["U_GREEK_VARIA"] = 8175] = "U_GREEK_VARIA";
    CharCode[CharCode["U_GREEK_OXIA"] = 8189] = "U_GREEK_OXIA";
    CharCode[CharCode["U_GREEK_DASIA"] = 8190] = "U_GREEK_DASIA";
    CharCode[CharCode["U_OVERLINE"] = 8254] = "U_OVERLINE";
    /**
     * UTF-8 BOM
     * Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
     * http://www.fileformat.info/info/unicode/char/feff/index.htm
     */
    CharCode[CharCode["UTF8_BOM"] = 65279] = "UTF8_BOM";
})(CharCode$1 || (CharCode$1 = {}));

class ResolvedKeybindingItem {
    constructor(resolvedKeybinding, command, commandArgs, when, isDefault) {
        this.resolvedKeybinding = resolvedKeybinding;
        if (resolvedKeybinding) {
            let [keypressFirstPart, keypressChordPart] = resolvedKeybinding.getDispatchParts();
            this.keypressFirstPart = keypressFirstPart;
            this.keypressChordPart = keypressChordPart;
        }
        else {
            this.keypressFirstPart = null;
            this.keypressChordPart = null;
        }
        this.bubble = (command ? command.charCodeAt(0) === CharCode$1.Caret : false);
        this.command = this.bubble ? command.substr(1) : command;
        this.commandArgs = commandArgs;
        this.when = when;
        this.isDefault = isDefault;
    }
}

let { userAgent: userAgent$2 } = navigator;
var Platform$2;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform$2 || (Platform$2 = {}));
let _platform$2 = Platform$2.Web;
const isWindows$2 = userAgent$2.indexOf('Windows') >= 0;
const isMacintosh$2 = userAgent$2.indexOf('Macintosh') >= 0;
const isLinux$2 = userAgent$2.indexOf('Linux') >= 0;
const isIE$2 = (userAgent$2.indexOf('Trident') >= 0);
const isEdge$2 = (userAgent$2.indexOf('Edge/') >= 0);
const isOpera$2 = (userAgent$2.indexOf('Opera') >= 0);
const isFirefox$2 = (userAgent$2.indexOf('Firefox') >= 0);
const isWebKit$2 = (userAgent$2.indexOf('AppleWebKit') >= 0);
const isChrome$2 = (userAgent$2.indexOf('Chrome') >= 0);
const isSafari$2 = (!isChrome$2 && (userAgent$2.indexOf('Safari') >= 0));
const isIPad$2 = (userAgent$2.indexOf('iPad') >= 0);
const isEdgeWebView$2 = isEdge$2 && (userAgent$2.indexOf('WebView/') >= 0);

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Names from https://blog.codinghorror.com/ascii-pronunciation-rules-for-programmers/
/**
 * An inlined enum containing useful character codes (to be used with String.charCodeAt).
 * Please leave the const keyword such that it gets inlined when compiled to JavaScript!
 */
var CharCode$1$1;
(function (CharCode) {
    CharCode[CharCode["Null"] = 0] = "Null";
    /**
     * The `\t` character.
     */
    CharCode[CharCode["Tab"] = 9] = "Tab";
    /**
     * The `\n` character.
     */
    CharCode[CharCode["LineFeed"] = 10] = "LineFeed";
    /**
     * The `\r` character.
     */
    CharCode[CharCode["CarriageReturn"] = 13] = "CarriageReturn";
    CharCode[CharCode["Space"] = 32] = "Space";
    /**
     * The `!` character.
     */
    CharCode[CharCode["ExclamationMark"] = 33] = "ExclamationMark";
    /**
     * The `"` character.
     */
    CharCode[CharCode["DoubleQuote"] = 34] = "DoubleQuote";
    /**
     * The `#` character.
     */
    CharCode[CharCode["Hash"] = 35] = "Hash";
    /**
     * The `$` character.
     */
    CharCode[CharCode["DollarSign"] = 36] = "DollarSign";
    /**
     * The `%` character.
     */
    CharCode[CharCode["PercentSign"] = 37] = "PercentSign";
    /**
     * The `&` character.
     */
    CharCode[CharCode["Ampersand"] = 38] = "Ampersand";
    /**
     * The `'` character.
     */
    CharCode[CharCode["SingleQuote"] = 39] = "SingleQuote";
    /**
     * The `(` character.
     */
    CharCode[CharCode["OpenParen"] = 40] = "OpenParen";
    /**
     * The `)` character.
     */
    CharCode[CharCode["CloseParen"] = 41] = "CloseParen";
    /**
     * The `*` character.
     */
    CharCode[CharCode["Asterisk"] = 42] = "Asterisk";
    /**
     * The `+` character.
     */
    CharCode[CharCode["Plus"] = 43] = "Plus";
    /**
     * The `,` character.
     */
    CharCode[CharCode["Comma"] = 44] = "Comma";
    /**
     * The `-` character.
     */
    CharCode[CharCode["Dash"] = 45] = "Dash";
    /**
     * The `.` character.
     */
    CharCode[CharCode["Period"] = 46] = "Period";
    /**
     * The `/` character.
     */
    CharCode[CharCode["Slash"] = 47] = "Slash";
    CharCode[CharCode["Digit0"] = 48] = "Digit0";
    CharCode[CharCode["Digit1"] = 49] = "Digit1";
    CharCode[CharCode["Digit2"] = 50] = "Digit2";
    CharCode[CharCode["Digit3"] = 51] = "Digit3";
    CharCode[CharCode["Digit4"] = 52] = "Digit4";
    CharCode[CharCode["Digit5"] = 53] = "Digit5";
    CharCode[CharCode["Digit6"] = 54] = "Digit6";
    CharCode[CharCode["Digit7"] = 55] = "Digit7";
    CharCode[CharCode["Digit8"] = 56] = "Digit8";
    CharCode[CharCode["Digit9"] = 57] = "Digit9";
    /**
     * The `:` character.
     */
    CharCode[CharCode["Colon"] = 58] = "Colon";
    /**
     * The `;` character.
     */
    CharCode[CharCode["Semicolon"] = 59] = "Semicolon";
    /**
     * The `<` character.
     */
    CharCode[CharCode["LessThan"] = 60] = "LessThan";
    /**
     * The `=` character.
     */
    CharCode[CharCode["Equals"] = 61] = "Equals";
    /**
     * The `>` character.
     */
    CharCode[CharCode["GreaterThan"] = 62] = "GreaterThan";
    /**
     * The `?` character.
     */
    CharCode[CharCode["QuestionMark"] = 63] = "QuestionMark";
    /**
     * The `@` character.
     */
    CharCode[CharCode["AtSign"] = 64] = "AtSign";
    CharCode[CharCode["A"] = 65] = "A";
    CharCode[CharCode["B"] = 66] = "B";
    CharCode[CharCode["C"] = 67] = "C";
    CharCode[CharCode["D"] = 68] = "D";
    CharCode[CharCode["E"] = 69] = "E";
    CharCode[CharCode["F"] = 70] = "F";
    CharCode[CharCode["G"] = 71] = "G";
    CharCode[CharCode["H"] = 72] = "H";
    CharCode[CharCode["I"] = 73] = "I";
    CharCode[CharCode["J"] = 74] = "J";
    CharCode[CharCode["K"] = 75] = "K";
    CharCode[CharCode["L"] = 76] = "L";
    CharCode[CharCode["M"] = 77] = "M";
    CharCode[CharCode["N"] = 78] = "N";
    CharCode[CharCode["O"] = 79] = "O";
    CharCode[CharCode["P"] = 80] = "P";
    CharCode[CharCode["Q"] = 81] = "Q";
    CharCode[CharCode["R"] = 82] = "R";
    CharCode[CharCode["S"] = 83] = "S";
    CharCode[CharCode["T"] = 84] = "T";
    CharCode[CharCode["U"] = 85] = "U";
    CharCode[CharCode["V"] = 86] = "V";
    CharCode[CharCode["W"] = 87] = "W";
    CharCode[CharCode["X"] = 88] = "X";
    CharCode[CharCode["Y"] = 89] = "Y";
    CharCode[CharCode["Z"] = 90] = "Z";
    /**
     * The `[` character.
     */
    CharCode[CharCode["OpenSquareBracket"] = 91] = "OpenSquareBracket";
    /**
     * The `\` character.
     */
    CharCode[CharCode["Backslash"] = 92] = "Backslash";
    /**
     * The `]` character.
     */
    CharCode[CharCode["CloseSquareBracket"] = 93] = "CloseSquareBracket";
    /**
     * The `^` character.
     */
    CharCode[CharCode["Caret"] = 94] = "Caret";
    /**
     * The `_` character.
     */
    CharCode[CharCode["Underline"] = 95] = "Underline";
    /**
     * The ``(`)`` character.
     */
    CharCode[CharCode["BackTick"] = 96] = "BackTick";
    CharCode[CharCode["a"] = 97] = "a";
    CharCode[CharCode["b"] = 98] = "b";
    CharCode[CharCode["c"] = 99] = "c";
    CharCode[CharCode["d"] = 100] = "d";
    CharCode[CharCode["e"] = 101] = "e";
    CharCode[CharCode["f"] = 102] = "f";
    CharCode[CharCode["g"] = 103] = "g";
    CharCode[CharCode["h"] = 104] = "h";
    CharCode[CharCode["i"] = 105] = "i";
    CharCode[CharCode["j"] = 106] = "j";
    CharCode[CharCode["k"] = 107] = "k";
    CharCode[CharCode["l"] = 108] = "l";
    CharCode[CharCode["m"] = 109] = "m";
    CharCode[CharCode["n"] = 110] = "n";
    CharCode[CharCode["o"] = 111] = "o";
    CharCode[CharCode["p"] = 112] = "p";
    CharCode[CharCode["q"] = 113] = "q";
    CharCode[CharCode["r"] = 114] = "r";
    CharCode[CharCode["s"] = 115] = "s";
    CharCode[CharCode["t"] = 116] = "t";
    CharCode[CharCode["u"] = 117] = "u";
    CharCode[CharCode["v"] = 118] = "v";
    CharCode[CharCode["w"] = 119] = "w";
    CharCode[CharCode["x"] = 120] = "x";
    CharCode[CharCode["y"] = 121] = "y";
    CharCode[CharCode["z"] = 122] = "z";
    /**
     * The `{` character.
       */
    CharCode[CharCode["OpenCurlyBrace"] = 123] = "OpenCurlyBrace";
    /**
     * The `|` character.
     */
    CharCode[CharCode["Pipe"] = 124] = "Pipe";
    /**
     * The `}` character.
     */
    CharCode[CharCode["CloseCurlyBrace"] = 125] = "CloseCurlyBrace";
    /**
     * The `~` character.
     */
    CharCode[CharCode["Tilde"] = 126] = "Tilde";
    CharCode[CharCode["U_Combining_Grave_Accent"] = 768] = "U_Combining_Grave_Accent";
    CharCode[CharCode["U_Combining_Acute_Accent"] = 769] = "U_Combining_Acute_Accent";
    CharCode[CharCode["U_Combining_Circumflex_Accent"] = 770] = "U_Combining_Circumflex_Accent";
    CharCode[CharCode["U_Combining_Tilde"] = 771] = "U_Combining_Tilde";
    CharCode[CharCode["U_Combining_Macron"] = 772] = "U_Combining_Macron";
    CharCode[CharCode["U_Combining_Overline"] = 773] = "U_Combining_Overline";
    CharCode[CharCode["U_Combining_Breve"] = 774] = "U_Combining_Breve";
    CharCode[CharCode["U_Combining_Dot_Above"] = 775] = "U_Combining_Dot_Above";
    CharCode[CharCode["U_Combining_Diaeresis"] = 776] = "U_Combining_Diaeresis";
    CharCode[CharCode["U_Combining_Hook_Above"] = 777] = "U_Combining_Hook_Above";
    CharCode[CharCode["U_Combining_Ring_Above"] = 778] = "U_Combining_Ring_Above";
    CharCode[CharCode["U_Combining_Double_Acute_Accent"] = 779] = "U_Combining_Double_Acute_Accent";
    CharCode[CharCode["U_Combining_Caron"] = 780] = "U_Combining_Caron";
    CharCode[CharCode["U_Combining_Vertical_Line_Above"] = 781] = "U_Combining_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Above"] = 782] = "U_Combining_Double_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Grave_Accent"] = 783] = "U_Combining_Double_Grave_Accent";
    CharCode[CharCode["U_Combining_Candrabindu"] = 784] = "U_Combining_Candrabindu";
    CharCode[CharCode["U_Combining_Inverted_Breve"] = 785] = "U_Combining_Inverted_Breve";
    CharCode[CharCode["U_Combining_Turned_Comma_Above"] = 786] = "U_Combining_Turned_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above"] = 787] = "U_Combining_Comma_Above";
    CharCode[CharCode["U_Combining_Reversed_Comma_Above"] = 788] = "U_Combining_Reversed_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above_Right"] = 789] = "U_Combining_Comma_Above_Right";
    CharCode[CharCode["U_Combining_Grave_Accent_Below"] = 790] = "U_Combining_Grave_Accent_Below";
    CharCode[CharCode["U_Combining_Acute_Accent_Below"] = 791] = "U_Combining_Acute_Accent_Below";
    CharCode[CharCode["U_Combining_Left_Tack_Below"] = 792] = "U_Combining_Left_Tack_Below";
    CharCode[CharCode["U_Combining_Right_Tack_Below"] = 793] = "U_Combining_Right_Tack_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Above"] = 794] = "U_Combining_Left_Angle_Above";
    CharCode[CharCode["U_Combining_Horn"] = 795] = "U_Combining_Horn";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Below"] = 796] = "U_Combining_Left_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Up_Tack_Below"] = 797] = "U_Combining_Up_Tack_Below";
    CharCode[CharCode["U_Combining_Down_Tack_Below"] = 798] = "U_Combining_Down_Tack_Below";
    CharCode[CharCode["U_Combining_Plus_Sign_Below"] = 799] = "U_Combining_Plus_Sign_Below";
    CharCode[CharCode["U_Combining_Minus_Sign_Below"] = 800] = "U_Combining_Minus_Sign_Below";
    CharCode[CharCode["U_Combining_Palatalized_Hook_Below"] = 801] = "U_Combining_Palatalized_Hook_Below";
    CharCode[CharCode["U_Combining_Retroflex_Hook_Below"] = 802] = "U_Combining_Retroflex_Hook_Below";
    CharCode[CharCode["U_Combining_Dot_Below"] = 803] = "U_Combining_Dot_Below";
    CharCode[CharCode["U_Combining_Diaeresis_Below"] = 804] = "U_Combining_Diaeresis_Below";
    CharCode[CharCode["U_Combining_Ring_Below"] = 805] = "U_Combining_Ring_Below";
    CharCode[CharCode["U_Combining_Comma_Below"] = 806] = "U_Combining_Comma_Below";
    CharCode[CharCode["U_Combining_Cedilla"] = 807] = "U_Combining_Cedilla";
    CharCode[CharCode["U_Combining_Ogonek"] = 808] = "U_Combining_Ogonek";
    CharCode[CharCode["U_Combining_Vertical_Line_Below"] = 809] = "U_Combining_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Bridge_Below"] = 810] = "U_Combining_Bridge_Below";
    CharCode[CharCode["U_Combining_Inverted_Double_Arch_Below"] = 811] = "U_Combining_Inverted_Double_Arch_Below";
    CharCode[CharCode["U_Combining_Caron_Below"] = 812] = "U_Combining_Caron_Below";
    CharCode[CharCode["U_Combining_Circumflex_Accent_Below"] = 813] = "U_Combining_Circumflex_Accent_Below";
    CharCode[CharCode["U_Combining_Breve_Below"] = 814] = "U_Combining_Breve_Below";
    CharCode[CharCode["U_Combining_Inverted_Breve_Below"] = 815] = "U_Combining_Inverted_Breve_Below";
    CharCode[CharCode["U_Combining_Tilde_Below"] = 816] = "U_Combining_Tilde_Below";
    CharCode[CharCode["U_Combining_Macron_Below"] = 817] = "U_Combining_Macron_Below";
    CharCode[CharCode["U_Combining_Low_Line"] = 818] = "U_Combining_Low_Line";
    CharCode[CharCode["U_Combining_Double_Low_Line"] = 819] = "U_Combining_Double_Low_Line";
    CharCode[CharCode["U_Combining_Tilde_Overlay"] = 820] = "U_Combining_Tilde_Overlay";
    CharCode[CharCode["U_Combining_Short_Stroke_Overlay"] = 821] = "U_Combining_Short_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Long_Stroke_Overlay"] = 822] = "U_Combining_Long_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Short_Solidus_Overlay"] = 823] = "U_Combining_Short_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Long_Solidus_Overlay"] = 824] = "U_Combining_Long_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Below"] = 825] = "U_Combining_Right_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Inverted_Bridge_Below"] = 826] = "U_Combining_Inverted_Bridge_Below";
    CharCode[CharCode["U_Combining_Square_Below"] = 827] = "U_Combining_Square_Below";
    CharCode[CharCode["U_Combining_Seagull_Below"] = 828] = "U_Combining_Seagull_Below";
    CharCode[CharCode["U_Combining_X_Above"] = 829] = "U_Combining_X_Above";
    CharCode[CharCode["U_Combining_Vertical_Tilde"] = 830] = "U_Combining_Vertical_Tilde";
    CharCode[CharCode["U_Combining_Double_Overline"] = 831] = "U_Combining_Double_Overline";
    CharCode[CharCode["U_Combining_Grave_Tone_Mark"] = 832] = "U_Combining_Grave_Tone_Mark";
    CharCode[CharCode["U_Combining_Acute_Tone_Mark"] = 833] = "U_Combining_Acute_Tone_Mark";
    CharCode[CharCode["U_Combining_Greek_Perispomeni"] = 834] = "U_Combining_Greek_Perispomeni";
    CharCode[CharCode["U_Combining_Greek_Koronis"] = 835] = "U_Combining_Greek_Koronis";
    CharCode[CharCode["U_Combining_Greek_Dialytika_Tonos"] = 836] = "U_Combining_Greek_Dialytika_Tonos";
    CharCode[CharCode["U_Combining_Greek_Ypogegrammeni"] = 837] = "U_Combining_Greek_Ypogegrammeni";
    CharCode[CharCode["U_Combining_Bridge_Above"] = 838] = "U_Combining_Bridge_Above";
    CharCode[CharCode["U_Combining_Equals_Sign_Below"] = 839] = "U_Combining_Equals_Sign_Below";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Below"] = 840] = "U_Combining_Double_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Below"] = 841] = "U_Combining_Left_Angle_Below";
    CharCode[CharCode["U_Combining_Not_Tilde_Above"] = 842] = "U_Combining_Not_Tilde_Above";
    CharCode[CharCode["U_Combining_Homothetic_Above"] = 843] = "U_Combining_Homothetic_Above";
    CharCode[CharCode["U_Combining_Almost_Equal_To_Above"] = 844] = "U_Combining_Almost_Equal_To_Above";
    CharCode[CharCode["U_Combining_Left_Right_Arrow_Below"] = 845] = "U_Combining_Left_Right_Arrow_Below";
    CharCode[CharCode["U_Combining_Upwards_Arrow_Below"] = 846] = "U_Combining_Upwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Grapheme_Joiner"] = 847] = "U_Combining_Grapheme_Joiner";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Above"] = 848] = "U_Combining_Right_Arrowhead_Above";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Above"] = 849] = "U_Combining_Left_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Fermata"] = 850] = "U_Combining_Fermata";
    CharCode[CharCode["U_Combining_X_Below"] = 851] = "U_Combining_X_Below";
    CharCode[CharCode["U_Combining_Left_Arrowhead_Below"] = 852] = "U_Combining_Left_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Below"] = 853] = "U_Combining_Right_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below"] = 854] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Above"] = 855] = "U_Combining_Right_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Dot_Above_Right"] = 856] = "U_Combining_Dot_Above_Right";
    CharCode[CharCode["U_Combining_Asterisk_Below"] = 857] = "U_Combining_Asterisk_Below";
    CharCode[CharCode["U_Combining_Double_Ring_Below"] = 858] = "U_Combining_Double_Ring_Below";
    CharCode[CharCode["U_Combining_Zigzag_Above"] = 859] = "U_Combining_Zigzag_Above";
    CharCode[CharCode["U_Combining_Double_Breve_Below"] = 860] = "U_Combining_Double_Breve_Below";
    CharCode[CharCode["U_Combining_Double_Breve"] = 861] = "U_Combining_Double_Breve";
    CharCode[CharCode["U_Combining_Double_Macron"] = 862] = "U_Combining_Double_Macron";
    CharCode[CharCode["U_Combining_Double_Macron_Below"] = 863] = "U_Combining_Double_Macron_Below";
    CharCode[CharCode["U_Combining_Double_Tilde"] = 864] = "U_Combining_Double_Tilde";
    CharCode[CharCode["U_Combining_Double_Inverted_Breve"] = 865] = "U_Combining_Double_Inverted_Breve";
    CharCode[CharCode["U_Combining_Double_Rightwards_Arrow_Below"] = 866] = "U_Combining_Double_Rightwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_A"] = 867] = "U_Combining_Latin_Small_Letter_A";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_E"] = 868] = "U_Combining_Latin_Small_Letter_E";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_I"] = 869] = "U_Combining_Latin_Small_Letter_I";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_O"] = 870] = "U_Combining_Latin_Small_Letter_O";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_U"] = 871] = "U_Combining_Latin_Small_Letter_U";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_C"] = 872] = "U_Combining_Latin_Small_Letter_C";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_D"] = 873] = "U_Combining_Latin_Small_Letter_D";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_H"] = 874] = "U_Combining_Latin_Small_Letter_H";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_M"] = 875] = "U_Combining_Latin_Small_Letter_M";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_R"] = 876] = "U_Combining_Latin_Small_Letter_R";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_T"] = 877] = "U_Combining_Latin_Small_Letter_T";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_V"] = 878] = "U_Combining_Latin_Small_Letter_V";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_X"] = 879] = "U_Combining_Latin_Small_Letter_X";
    /**
     * Unicode Character 'LINE SEPARATOR' (U+2028)
     * http://www.fileformat.info/info/unicode/char/2028/index.htm
     */
    CharCode[CharCode["LINE_SEPARATOR_2028"] = 8232] = "LINE_SEPARATOR_2028";
    // http://www.fileformat.info/info/unicode/category/Sk/list.htm
    CharCode[CharCode["U_CIRCUMFLEX"] = 94] = "U_CIRCUMFLEX";
    CharCode[CharCode["U_GRAVE_ACCENT"] = 96] = "U_GRAVE_ACCENT";
    CharCode[CharCode["U_DIAERESIS"] = 168] = "U_DIAERESIS";
    CharCode[CharCode["U_MACRON"] = 175] = "U_MACRON";
    CharCode[CharCode["U_ACUTE_ACCENT"] = 180] = "U_ACUTE_ACCENT";
    CharCode[CharCode["U_CEDILLA"] = 184] = "U_CEDILLA";
    CharCode[CharCode["U_MODIFIER_LETTER_LEFT_ARROWHEAD"] = 706] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_RIGHT_ARROWHEAD"] = 707] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_ARROWHEAD"] = 708] = "U_MODIFIER_LETTER_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_ARROWHEAD"] = 709] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING"] = 722] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING"] = 723] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_TACK"] = 724] = "U_MODIFIER_LETTER_UP_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_TACK"] = 725] = "U_MODIFIER_LETTER_DOWN_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_PLUS_SIGN"] = 726] = "U_MODIFIER_LETTER_PLUS_SIGN";
    CharCode[CharCode["U_MODIFIER_LETTER_MINUS_SIGN"] = 727] = "U_MODIFIER_LETTER_MINUS_SIGN";
    CharCode[CharCode["U_BREVE"] = 728] = "U_BREVE";
    CharCode[CharCode["U_DOT_ABOVE"] = 729] = "U_DOT_ABOVE";
    CharCode[CharCode["U_RING_ABOVE"] = 730] = "U_RING_ABOVE";
    CharCode[CharCode["U_OGONEK"] = 731] = "U_OGONEK";
    CharCode[CharCode["U_SMALL_TILDE"] = 732] = "U_SMALL_TILDE";
    CharCode[CharCode["U_DOUBLE_ACUTE_ACCENT"] = 733] = "U_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_RHOTIC_HOOK"] = 734] = "U_MODIFIER_LETTER_RHOTIC_HOOK";
    CharCode[CharCode["U_MODIFIER_LETTER_CROSS_ACCENT"] = 735] = "U_MODIFIER_LETTER_CROSS_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR"] = 741] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_HIGH_TONE_BAR"] = 742] = "U_MODIFIER_LETTER_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_MID_TONE_BAR"] = 743] = "U_MODIFIER_LETTER_MID_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TONE_BAR"] = 744] = "U_MODIFIER_LETTER_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR"] = 745] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK"] = 746] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK"] = 747] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_UNASPIRATED"] = 749] = "U_MODIFIER_LETTER_UNASPIRATED";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD"] = 751] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_UP_ARROWHEAD"] = 752] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD"] = 753] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD"] = 754] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RING"] = 755] = "U_MODIFIER_LETTER_LOW_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT"] = 756] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT"] = 757] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT"] = 758] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TILDE"] = 759] = "U_MODIFIER_LETTER_LOW_TILDE";
    CharCode[CharCode["U_MODIFIER_LETTER_RAISED_COLON"] = 760] = "U_MODIFIER_LETTER_RAISED_COLON";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_HIGH_TONE"] = 761] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_HIGH_TONE"] = 762] = "U_MODIFIER_LETTER_END_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_LOW_TONE"] = 763] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_LOW_TONE"] = 764] = "U_MODIFIER_LETTER_END_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_SHELF"] = 765] = "U_MODIFIER_LETTER_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_OPEN_SHELF"] = 766] = "U_MODIFIER_LETTER_OPEN_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROW"] = 767] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW";
    CharCode[CharCode["U_GREEK_LOWER_NUMERAL_SIGN"] = 885] = "U_GREEK_LOWER_NUMERAL_SIGN";
    CharCode[CharCode["U_GREEK_TONOS"] = 900] = "U_GREEK_TONOS";
    CharCode[CharCode["U_GREEK_DIALYTIKA_TONOS"] = 901] = "U_GREEK_DIALYTIKA_TONOS";
    CharCode[CharCode["U_GREEK_KORONIS"] = 8125] = "U_GREEK_KORONIS";
    CharCode[CharCode["U_GREEK_PSILI"] = 8127] = "U_GREEK_PSILI";
    CharCode[CharCode["U_GREEK_PERISPOMENI"] = 8128] = "U_GREEK_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_PERISPOMENI"] = 8129] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_PSILI_AND_VARIA"] = 8141] = "U_GREEK_PSILI_AND_VARIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_OXIA"] = 8142] = "U_GREEK_PSILI_AND_OXIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_PERISPOMENI"] = 8143] = "U_GREEK_PSILI_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DASIA_AND_VARIA"] = 8157] = "U_GREEK_DASIA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_OXIA"] = 8158] = "U_GREEK_DASIA_AND_OXIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_PERISPOMENI"] = 8159] = "U_GREEK_DASIA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_VARIA"] = 8173] = "U_GREEK_DIALYTIKA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_OXIA"] = 8174] = "U_GREEK_DIALYTIKA_AND_OXIA";
    CharCode[CharCode["U_GREEK_VARIA"] = 8175] = "U_GREEK_VARIA";
    CharCode[CharCode["U_GREEK_OXIA"] = 8189] = "U_GREEK_OXIA";
    CharCode[CharCode["U_GREEK_DASIA"] = 8190] = "U_GREEK_DASIA";
    CharCode[CharCode["U_OVERLINE"] = 8254] = "U_OVERLINE";
    /**
     * UTF-8 BOM
     * Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
     * http://www.fileformat.info/info/unicode/char/feff/index.htm
     */
    CharCode[CharCode["UTF8_BOM"] = 65279] = "UTF8_BOM";
})(CharCode$1$1 || (CharCode$1$1 = {}));

const _manualClassList$1 = new class {
    _findClassName(node, className) {
        let classes = node.className;
        if (!classes) {
            this._lastStart = -1;
            return;
        }
        className = className.trim();
        let classesLen = classes.length, classLen = className.length;
        if (classLen === 0) {
            this._lastStart = -1;
            return;
        }
        if (classesLen < classLen) {
            this._lastStart = -1;
            return;
        }
        if (classes === className) {
            this._lastStart = 0;
            this._lastEnd = classesLen;
            return;
        }
        let idx = -1, idxEnd;
        while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
            idxEnd = idx + classLen;
            // a class that is followed by another class
            if ((idx === 0 || classes.charCodeAt(idx - 1) === CharCode$1$1.Space) && classes.charCodeAt(idxEnd) === CharCode$1$1.Space) {
                this._lastStart = idx;
                this._lastEnd = idxEnd + 1;
                return;
            }
            // last class
            if (idx > 0 && classes.charCodeAt(idx - 1) === CharCode$1$1.Space && idxEnd === classesLen) {
                this._lastStart = idx - 1;
                this._lastEnd = idxEnd;
                return;
            }
            // equal - duplicate of cmp above
            if (idx === 0 && idxEnd === classesLen) {
                this._lastStart = 0;
                this._lastEnd = idxEnd;
                return;
            }
        }
        this._lastStart = -1;
    }
    hasClass(node, className) {
        this._findClassName(node, className);
        return this._lastStart !== -1;
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (!node.className) { // doesn't have it for sure
            node.className = className;
        }
        else {
            this._findClassName(node, className); // see if it's already there
            if (this._lastStart === -1) {
                node.className = node.className + ' ' + className;
            }
        }
    }
    removeClass(node, className) {
        this._findClassName(node, className);
        if (this._lastStart === -1) {
            return; // Prevent styles invalidation if not necessary
        }
        else {
            node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        this._findClassName(node, className);
        if (this._lastStart !== -1 && (shouldHaveIt === undefined || !shouldHaveIt)) {
            this.removeClass(node, className);
        }
        if (this._lastStart === -1 && (shouldHaveIt === undefined || shouldHaveIt)) {
            this.addClass(node, className);
        }
    }
};
const _nativeClassList$1 = new class {
    hasClass(node, className) {
        return Boolean(className) && node.classList && node.classList.contains(className);
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (className && node.classList) {
            node.classList.add(className);
        }
    }
    removeClass(node, className) {
        if (className && node.classList) {
            node.classList.remove(className);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        if (node.classList) {
            node.classList.toggle(className, shouldHaveIt);
        }
    }
};
// In IE11 there is only partial support for `classList` which makes us keep our
// custom implementation. Otherwise use the native implementation, see: http://caniuse.com/#search=classlist
const _classList$1 = isIE$2 ? _manualClassList$1 : _nativeClassList$1;
const hasClass$1 = _classList$1.hasClass.bind(_classList$1);
const addClass$1 = _classList$1.addClass.bind(_classList$1);
const addClasses$1 = _classList$1.addClasses.bind(_classList$1);
const removeClass$1 = _classList$1.removeClass.bind(_classList$1);
const removeClasses$1 = _classList$1.removeClasses.bind(_classList$1);
const toggleClass$1 = _classList$1.toggleClass.bind(_classList$1);

class DomListener$1 {
    constructor(node, type, handler, useCapture) {
        this._node = node;
        this._type = type;
        this._handler = handler;
        this._useCapture = (useCapture || false);
        this._node.addEventListener(this._type, this._handler, this._useCapture);
    }
    dispose() {
        if (!this._handler) {
            // Already disposed
            return;
        }
        this._node.removeEventListener(this._type, this._handler, this._useCapture);
        // Prevent leakers from holding on to the dom or handler func
        this._node = null;
        this._handler = null;
    }
}
function addDisposableListener$1(node, type, handler, useCapture) {
    return new DomListener$1(node, type, handler, useCapture);
}
const EventType$1 = {
    // Mouse
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    MOUSE_UP: 'mouseup',
    MOUSE_DOWN: 'mousedown',
    MOUSE_OVER: 'mouseover',
    MOUSE_MOVE: 'mousemove',
    MOUSE_OUT: 'mouseout',
    MOUSE_ENTER: 'mouseenter',
    MOUSE_LEAVE: 'mouseleave',
    CONTEXT_MENU: 'contextmenu',
    WHEEL: 'wheel',
    // Keyboard
    KEY_DOWN: 'keydown',
    KEY_PRESS: 'keypress',
    KEY_UP: 'keyup',
    // HTML Document
    LOAD: 'load',
    UNLOAD: 'unload',
    ABORT: 'abort',
    ERROR: 'error',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    // Form
    SELECT: 'select',
    CHANGE: 'change',
    SUBMIT: 'submit',
    RESET: 'reset',
    FOCUS: 'focus',
    FOCUS_IN: 'focusin',
    FOCUS_OUT: 'focusout',
    BLUR: 'blur',
    INPUT: 'input',
    // Local Storage
    STORAGE: 'storage',
    // Drag
    DRAG_START: 'dragstart',
    DRAG: 'drag',
    DRAG_ENTER: 'dragenter',
    DRAG_LEAVE: 'dragleave',
    DRAG_OVER: 'dragover',
    DROP: 'drop',
    DRAG_END: 'dragend',
};

function getKeyMap() {
    return {
        'KeyA': { 'value': 'a' },
        'KeyB': { 'value': 'b' },
        'KeyC': { 'value': 'c' },
        'KeyD': { 'value': 'd' },
        'KeyE': { 'value': 'e' },
        'KeyF': { 'value': 'f' },
        'KeyG': { 'value': 'g' },
        'KeyH': { 'value': 'h' },
        'KeyI': { 'value': 'i' },
        'KeyJ': { 'value': 'j' },
        'KeyK': { 'value': 'k' },
        'KeyL': { 'value': 'l' },
        'KeyM': { 'value': 'm' },
        'KeyN': { 'value': 'n' },
        'KeyO': { 'value': 'o' },
        'KeyP': { 'value': 'p' },
        'KeyQ': { 'value': 'q' },
        'KeyR': { 'value': 'r' },
        'KeyS': { 'value': 's' },
        'KeyT': { 'value': 't' },
        'KeyU': { 'value': 'u' },
        'KeyV': { 'value': 'v' },
        'KeyW': { 'value': 'w' },
        'KeyX': { 'value': 'x' },
        'KeyY': { 'value': 'y' },
        'KeyZ': { 'value': 'z' },
        'Digit1': { 'value': '1' },
        'Digit2': { 'value': '2' },
        'Digit3': { 'value': '3' },
        'Digit4': { 'value': '4' },
        'Digit5': { 'value': '5' },
        'Digit6': { 'value': '6' },
        'Digit7': { 'value': '7' },
        'Digit8': { 'value': '8' },
        'Digit9': { 'value': '9' },
        'Digit0': { 'value': '0' },
        'Enter': { 'value': '' },
        'Escape': { 'value': '' },
        'Backspace': { 'value': '' },
        'Tab': { 'value': '' },
        'Space': { 'value': ' ' },
        'Minus': { 'value': '-' },
        'Equal': { 'value': '=' },
        'BracketLeft': { 'value': '[' },
        'BracketRight': { 'value': ']' },
        'Backslash': { 'value': '\\' },
        'Semicolon': { 'value': ';' },
        'Quote': { 'value': '\'' },
        'Backquote': { 'value': '`' },
        'Comma': { 'value': ',' },
        'Period': { 'value': '.' },
        'Slash': { 'value': '/' },
        'CapsLock': { 'value': '' },
        'F1': { 'value': '' },
        'F2': { 'value': '' },
        'F3': { 'value': '' },
        'F4': { 'value': '' },
        'F5': { 'value': '' },
        'F6': { 'value': '' },
        'F7': { 'value': '' },
        'F8': { 'value': '' },
        'F9': { 'value': '' },
        'F10': { 'value': '' },
        'F11': { 'value': '' },
        'F12': { 'value': '' },
        'Insert': { 'value': '' },
        'Home': { 'value': '' },
        'PageUp': { 'value': '' },
        'Delete': { 'value': '' },
        'End': { 'value': '' },
        'PageDown': { 'value': '' },
        'ArrowRight': { 'value': '' },
        'ArrowLeft': { 'value': '' },
        'ArrowDown': { 'value': '' },
        'ArrowUp': { 'value': '' },
        'NumLock': { 'value': '' },
        'NumpadDivide': { 'value': '/' },
        'NumpadMultiply': { 'value': '*' },
        'NumpadSubtract': { 'value': '-' },
        'NumpadAdd': { 'value': '+' },
        'NumpadEnter': { 'value': '' },
        'Numpad1': { 'value': '1' },
        'Numpad2': { 'value': '2' },
        'Numpad3': { 'value': '3' },
        'Numpad4': { 'value': '4' },
        'Numpad5': { 'value': '5' },
        'Numpad6': { 'value': '6' },
        'Numpad7': { 'value': '7' },
        'Numpad8': { 'value': '8' },
        'Numpad9': { 'value': '9' },
        'Numpad0': { 'value': '0' },
        'NumpadDecimal': { 'value': '.' },
        'IntlBackslash': { 'value': '§', },
        'ContextMenu': { 'value': '', },
        'NumpadEqual': { 'value': '=', },
        'F13': { 'value': '', },
        'F14': { 'value': '', },
        'F15': { 'value': '', },
        'F16': { 'value': '', },
        'F17': { 'value': '', },
        'F18': { 'value': '', },
        'F19': { 'value': '', },
        'F20': { 'value': '', },
        'AudioVolumeMute': { 'value': '', },
        'AudioVolumeUp': { 'value': '' },
        'AudioVolumeDown': { 'value': '', },
        'NumpadComma': { 'value': '', },
        'IntlRo': { 'value': '', },
        'KanaMode': { 'value': '', },
        'IntlYen': { 'value': '', },
        'ControlLeft': { 'value': '', },
        'ShiftLeft': { 'value': '', },
        'AltLeft': { 'value': '', },
        'MetaLeft': { 'value': '', },
        'ControlRight': { 'value': '', },
        'ShiftRight': { 'value': '', },
        'AltRight': { 'value': '', },
        'MetaRight': { 'value': '', }
    };
}

class ResolvedKeybindingPart {
    constructor(ctrlKey, shiftKey, altKey, metaKey, kbLabel, kbAriaLabel) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyLabel = kbLabel;
        this.keyAriaLabel = kbAriaLabel;
    }
}
/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */
class ResolvedKeybinding {
}

class ModifierLabelProvider {
    constructor(mac, windows, linux = windows) {
        this.modifierLabels = [null];
        this.modifierLabels[2 /* Macintosh */] = mac;
        this.modifierLabels[1 /* Windows */] = windows;
        this.modifierLabels[3 /* Linux */] = linux;
    }
    toLabel(firstPartMod, firstPartKey, chordPartMod, chordPartKey, OS) {
        if (firstPartKey === null && chordPartKey === null) {
            return null;
        }
        return _asString(firstPartMod, firstPartKey, chordPartMod, chordPartKey, this.modifierLabels[OS]);
    }
}
/**
 * A label provider that prints modifiers in a suitable format for displaying in the UI.
 */
const UILabelProvider = new ModifierLabelProvider({
    ctrlKey: '⌃',
    shiftKey: '⇧',
    altKey: '⌥',
    metaKey: '⌘',
    separator: '',
}, {
    ctrlKey: 'Ctrl',
    shiftKey: 'Shift',
    altKey: 'Alt',
    metaKey: 'Windows',
    separator: '+',
});
/**
 * A label provider that prints modifiers in a suitable format for user settings.
 */
const UserSettingsLabelProvider = new ModifierLabelProvider({
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'cmd',
    separator: '+',
}, {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'win',
    separator: '+',
}, {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'meta',
    separator: '+',
});
function _simpleAsString(modifiers, key, labels) {
    if (key === null) {
        return '';
    }
    let result = [];
    // translate modifier keys: Ctrl-Shift-Alt-Meta
    if (modifiers.ctrlKey) {
        result.push(labels.ctrlKey);
    }
    if (modifiers.shiftKey) {
        result.push(labels.shiftKey);
    }
    if (modifiers.altKey) {
        result.push(labels.altKey);
    }
    if (modifiers.metaKey) {
        result.push(labels.metaKey);
    }
    // the actual key
    result.push(key);
    return result.join(labels.separator);
}
function _asString(firstPartMod, firstPartKey, chordPartMod, chordPartKey, labels) {
    let result = _simpleAsString(firstPartMod, firstPartKey, labels);
    if (chordPartKey !== null) {
        result += ' ';
        result += _simpleAsString(chordPartMod, chordPartKey, labels);
    }
    return result;
}

/**
 * A shellMap from character to key codes.
 * e.g. Contains entries such as:
 *  - '/' => { keyCode: KeyCode.US_SLASH, shiftKey: false }
 *  - '?' => { keyCode: KeyCode.US_SLASH, shiftKey: true }
 */
const CHAR_CODE_TO_KEY_CODE = [];
class NativeResolvedKeybinding extends ResolvedKeybinding {
    constructor(mapper, OS, firstPart, chordPart) {
        super();
        if (!firstPart) {
            throw new Error(`Invalid USLayoutResolvedKeybinding`);
        }
        this._mapper = mapper;
        this._OS = OS;
        this._firstPart = firstPart;
        this._chordPart = chordPart;
    }
    getLabel() {
        let firstPart = this._mapper.getUILabelForScanCodeBinding(this._firstPart);
        let chordPart = this._mapper.getUILabelForScanCodeBinding(this._chordPart);
        return UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
    }
    getUserSettingsLabel() {
        let firstPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._firstPart);
        let chordPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._chordPart);
        return UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
    }
    _isWYSIWYG(binding) {
        if (!binding) {
            return true;
        }
        if (IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1) {
            return true;
        }
        let a = this._mapper.getAriaLabelForScanCodeBinding(binding);
        let b = this._mapper.getUserSettingsLabelForScanCodeBinding(binding);
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.toLowerCase() === b.toLowerCase());
    }
    isWYSIWYG() {
        return (this._isWYSIWYG(this._firstPart) && this._isWYSIWYG(this._chordPart));
    }
    isChord() {
        return (this._chordPart ? true : false);
    }
    getParts() {
        return [
            this._toResolvedKeybindingPart(this._firstPart),
            this._toResolvedKeybindingPart(this._chordPart)
        ];
    }
    _toResolvedKeybindingPart(binding) {
        if (!binding) {
            return null;
        }
        return new ResolvedKeybindingPart(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, this._mapper.getUILabelForScanCodeBinding(binding), this._mapper.getAriaLabelForScanCodeBinding(binding));
    }
    getDispatchParts() {
        let firstPart = this._firstPart ? this._mapper.getDispatchStrForScanCodeBinding(this._firstPart) : null;
        let chordPart = this._chordPart ? this._mapper.getDispatchStrForScanCodeBinding(this._chordPart) : null;
        return [firstPart, chordPart];
    }
}
class ScanCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.scanCode = scanCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${ScanCodeUtils.toString(this.scanCode)}`;
    }
    equals(other) {
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.scanCode === other.scanCode);
    }
    getProducedCharCode(mapping) {
        if (!mapping) {
            return '';
        }
        return mapping.value;
    }
    getProducedChar(mapping) {
        const charCode = MacLinuxKeyboardMapper.getCharCode(this.getProducedCharCode(mapping));
        if (charCode === 0) {
            return ' --- ';
        }
        if (charCode >= CharCode$1.U_Combining_Grave_Accent && charCode <= CharCode$1.U_Combining_Latin_Small_Letter_X) {
            // combining
            return 'U+' + charCode.toString(16);
        }
        return '  ' + String.fromCharCode(charCode) + '  ';
    }
}
class KeyCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.keyCode = keyCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${KeyCodeUtils.toString(this.keyCode)}`;
    }
}
class ScanCodeKeyCodeMapper {
    constructor() {
        /**
         * ScanCode combination => KeyCode combination.
         * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
         */
        this._scanCodeToKeyCode = [];
        /**
         * inverse of `_scanCodeToKeyCode`.
         * KeyCode combination => ScanCode combination.
         * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
         */
        this._keyCodeToScanCode = [];
        this._scanCodeToKeyCode = [];
        this._keyCodeToScanCode = [];
    }
    registrationComplete() {
        // IntlHash and IntlBackslash are rare keys, so ensure they don't end up being the preferred...
        this._moveToEnd(56 /* IntlHash */);
        this._moveToEnd(106 /* IntlBackslash */);
    }
    _moveToEnd(scanCode) {
        for (let mod = 0; mod < 8; mod++) {
            const encodedKeyCodeCombos = this._scanCodeToKeyCode[(scanCode << 3) + mod];
            if (!encodedKeyCodeCombos) {
                continue;
            }
            for (let i = 0, len = encodedKeyCodeCombos.length; i < len; i++) {
                const encodedScanCodeCombos = this._keyCodeToScanCode[encodedKeyCodeCombos[i]];
                if (encodedScanCodeCombos.length === 1) {
                    continue;
                }
                for (let j = 0, len = encodedScanCodeCombos.length; j < len; j++) {
                    const entry = encodedScanCodeCombos[j];
                    const entryScanCode = (entry >>> 3);
                    if (entryScanCode === scanCode) {
                        // Move this entry to the end
                        for (let k = j + 1; k < len; k++) {
                            encodedScanCodeCombos[k - 1] = encodedScanCodeCombos[k];
                        }
                        encodedScanCodeCombos[len - 1] = entry;
                    }
                }
            }
        }
    }
    registerIfUnknown(scanCodeCombo, keyCodeCombo) {
        if (keyCodeCombo.keyCode === 0 /* Unknown */) {
            return;
        }
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const keyCodeIsDigit = (keyCodeCombo.keyCode >= 21 /* KEY_0 */ && keyCodeCombo.keyCode <= 30 /* KEY_9 */);
        const keyCodeIsLetter = (keyCodeCombo.keyCode >= 31 /* KEY_A */ && keyCodeCombo.keyCode <= 56 /* KEY_Z */);
        const existingKeyCodeCombos = this._scanCodeToKeyCode[scanCodeComboEncoded];
        // Allow a scan code to shellMap to multiple key codes if it is a digit or a letter key code
        if (keyCodeIsDigit || keyCodeIsLetter) {
            // Only check that we don't insert the same entry twice
            if (existingKeyCodeCombos) {
                for (let i = 0, len = existingKeyCodeCombos.length; i < len; i++) {
                    if (existingKeyCodeCombos[i] === keyCodeComboEncoded) {
                        // avoid duplicates
                        return;
                    }
                }
            }
        }
        else {
            // Don't allow multiples
            if (existingKeyCodeCombos && existingKeyCodeCombos.length !== 0) {
                return;
            }
        }
        this._scanCodeToKeyCode[scanCodeComboEncoded] = this._scanCodeToKeyCode[scanCodeComboEncoded] || [];
        this._scanCodeToKeyCode[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
        this._keyCodeToScanCode[keyCodeComboEncoded] = this._keyCodeToScanCode[keyCodeComboEncoded] || [];
        this._keyCodeToScanCode[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
    }
    lookupKeyCodeCombo(keyCodeCombo) {
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const scanCodeCombosEncoded = this._keyCodeToScanCode[keyCodeComboEncoded];
        if (!scanCodeCombosEncoded || scanCodeCombosEncoded.length === 0) {
            return [];
        }
        let result = [];
        for (let i = 0, len = scanCodeCombosEncoded.length; i < len; i++) {
            const scanCodeComboEncoded = scanCodeCombosEncoded[i];
            const ctrlKey = (scanCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (scanCodeComboEncoded & 0b010) ? true : false;
            const altKey = (scanCodeComboEncoded & 0b100) ? true : false;
            const scanCode = (scanCodeComboEncoded >>> 3);
            result[i] = new ScanCodeCombo(ctrlKey, shiftKey, altKey, scanCode);
        }
        return result;
    }
    lookupScanCodeCombo(scanCodeCombo) {
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeCombosEncoded = this._scanCodeToKeyCode[scanCodeComboEncoded];
        if (!keyCodeCombosEncoded || keyCodeCombosEncoded.length === 0) {
            return [];
        }
        let result = [];
        for (let i = 0, len = keyCodeCombosEncoded.length; i < len; i++) {
            const keyCodeComboEncoded = keyCodeCombosEncoded[i];
            const ctrlKey = (keyCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (keyCodeComboEncoded & 0b010) ? true : false;
            const altKey = (keyCodeComboEncoded & 0b100) ? true : false;
            const keyCode = (keyCodeComboEncoded >>> 3);
            result[i] = new KeyCodeCombo(ctrlKey, shiftKey, altKey, keyCode);
        }
        return result;
    }
    guessStableKeyCode(scanCode) {
        if (scanCode >= 36 /* Digit1 */ && scanCode <= 45 /* Digit0 */) {
            // digits are ok
            switch (scanCode) {
                case 36 /* Digit1 */:
                    return 22 /* KEY_1 */;
                case 37 /* Digit2 */:
                    return 23 /* KEY_2 */;
                case 38 /* Digit3 */:
                    return 24 /* KEY_3 */;
                case 39 /* Digit4 */:
                    return 25 /* KEY_4 */;
                case 40 /* Digit5 */:
                    return 26 /* KEY_5 */;
                case 41 /* Digit6 */:
                    return 27 /* KEY_6 */;
                case 42 /* Digit7 */:
                    return 28 /* KEY_7 */;
                case 43 /* Digit8 */:
                    return 29 /* KEY_8 */;
                case 44 /* Digit9 */:
                    return 30 /* KEY_9 */;
                case 45 /* Digit0 */:
                    return 21 /* KEY_0 */;
            }
        }
        // Lookup the scanCode with and without shift and see if the keyCode is stable
        const keyCodeCombos1 = this.lookupScanCodeCombo(new ScanCodeCombo(false, false, false, scanCode));
        const keyCodeCombos2 = this.lookupScanCodeCombo(new ScanCodeCombo(false, true, false, scanCode));
        if (keyCodeCombos1.length === 1 && keyCodeCombos2.length === 1) {
            const shiftKey1 = keyCodeCombos1[0].shiftKey;
            const keyCode1 = keyCodeCombos1[0].keyCode;
            const shiftKey2 = keyCodeCombos2[0].shiftKey;
            const keyCode2 = keyCodeCombos2[0].keyCode;
            if (keyCode1 === keyCode2 && shiftKey1 !== shiftKey2) {
                // This looks like a stable mapping
                return keyCode1;
            }
        }
        return -1;
    }
    _encodeScanCodeCombo(scanCodeCombo) {
        return this._encode(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
    }
    _encodeKeyCodeCombo(keyCodeCombo) {
        return this._encode(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
    }
    _encode(ctrlKey, shiftKey, altKey, principal) {
        return (((ctrlKey ? 1 : 0) << 0)
            | ((shiftKey ? 1 : 0) << 1)
            | ((altKey ? 1 : 0) << 2)
            | principal << 3) >>> 0;
    }
}
class MacLinuxKeyboardMapper {
    constructor(isUSStandard, rawMappings, OS) {
        /**
         * UI label for a ScanCode.
         */
        this._scanCodeToLabel = [];
        /**
         * Dispatching string for a ScanCode.
         */
        this._scanCodeToDispatch = [];
        this._isUSStandard = isUSStandard;
        this._OS = OS;
        this._codeInfo = [];
        this._scanCodeKeyCodeMapper = new ScanCodeKeyCodeMapper();
        this._scanCodeToLabel = [];
        this._scanCodeToDispatch = [];
        const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
            this._scanCodeKeyCodeMapper.registerIfUnknown(new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode), new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode));
        };
        const _registerAllCombos = (_ctrlKey, _shiftKey, _altKey, scanCode, keyCode) => {
            for (let ctrlKey = _ctrlKey; ctrlKey <= 1; ctrlKey++) {
                for (let shiftKey = _shiftKey; shiftKey <= 1; shiftKey++) {
                    for (let altKey = _altKey; altKey <= 1; altKey++) {
                        _registerIfUnknown(ctrlKey, shiftKey, altKey, scanCode, ctrlKey, shiftKey, altKey, keyCode);
                    }
                }
            }
        };
        // Initialize `_scanCodeToLabel`
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            this._scanCodeToLabel[scanCode] = null;
        }
        // Initialize `_scanCodeToDispatch`
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            this._scanCodeToDispatch[scanCode] = null;
        }
        // Handle immutable mappings
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            const keyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (keyCode !== -1) {
                _registerAllCombos(0, 0, 0, scanCode, keyCode);
                this._scanCodeToLabel[scanCode] = KeyCodeUtils.toString(keyCode);
                if (keyCode === 0 /* Unknown */ || keyCode === 5 /* Ctrl */ || keyCode === 57 /* Meta */ || keyCode === 6 /* Alt */ || keyCode === 4 /* Shift */) {
                    this._scanCodeToDispatch[scanCode] = null; // cannot dispatch on this ScanCode
                }
                else {
                    this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
                }
            }
        }
        // Try to identify keyboard layouts where characters A-Z are missing
        // and forcefully shellMap them to their corresponding scan codes if that is the case
        const missingLatinLettersOverride = {};
        {
            let producesLatinLetter = [];
            for (let strScanCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strScanCode)) {
                    const scanCode = ScanCodeUtils.toEnum(strScanCode);
                    if (scanCode === 0 /* None */) {
                        continue;
                    }
                    if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                        continue;
                    }
                    const rawMapping = rawMappings[strScanCode];
                    const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                    if (value >= CharCode$1.a && value <= CharCode$1.z) {
                        const upperCaseValue = CharCode$1.A + (value - CharCode$1.a);
                        producesLatinLetter[upperCaseValue] = true;
                    }
                }
            }
            const _registerLetterIfMissing = (charCode, scanCode, value, withShift) => {
                if (!producesLatinLetter[charCode]) {
                    missingLatinLettersOverride[ScanCodeUtils.toString(scanCode)] = {
                        value: value,
                    };
                }
            };
            // Ensure letters are mapped
            _registerLetterIfMissing(CharCode$1.A, 10 /* KeyA */, 'a', 'A');
            _registerLetterIfMissing(CharCode$1.B, 11 /* KeyB */, 'b', 'B');
            _registerLetterIfMissing(CharCode$1.C, 12 /* KeyC */, 'c', 'C');
            _registerLetterIfMissing(CharCode$1.D, 13 /* KeyD */, 'd', 'D');
            _registerLetterIfMissing(CharCode$1.E, 14 /* KeyE */, 'e', 'E');
            _registerLetterIfMissing(CharCode$1.F, 15 /* KeyF */, 'f', 'F');
            _registerLetterIfMissing(CharCode$1.G, 16 /* KeyG */, 'g', 'G');
            _registerLetterIfMissing(CharCode$1.H, 17 /* KeyH */, 'h', 'H');
            _registerLetterIfMissing(CharCode$1.I, 18 /* KeyI */, 'i', 'I');
            _registerLetterIfMissing(CharCode$1.J, 19 /* KeyJ */, 'j', 'J');
            _registerLetterIfMissing(CharCode$1.K, 20 /* KeyK */, 'k', 'K');
            _registerLetterIfMissing(CharCode$1.L, 21 /* KeyL */, 'l', 'L');
            _registerLetterIfMissing(CharCode$1.M, 22 /* KeyM */, 'm', 'M');
            _registerLetterIfMissing(CharCode$1.N, 23 /* KeyN */, 'n', 'N');
            _registerLetterIfMissing(CharCode$1.O, 24 /* KeyO */, 'o', 'O');
            _registerLetterIfMissing(CharCode$1.P, 25 /* KeyP */, 'p', 'P');
            _registerLetterIfMissing(CharCode$1.Q, 26 /* KeyQ */, 'q', 'Q');
            _registerLetterIfMissing(CharCode$1.R, 27 /* KeyR */, 'r', 'R');
            _registerLetterIfMissing(CharCode$1.S, 28 /* KeyS */, 's', 'S');
            _registerLetterIfMissing(CharCode$1.T, 29 /* KeyT */, 't', 'T');
            _registerLetterIfMissing(CharCode$1.U, 30 /* KeyU */, 'u', 'U');
            _registerLetterIfMissing(CharCode$1.V, 31 /* KeyV */, 'v', 'V');
            _registerLetterIfMissing(CharCode$1.W, 32 /* KeyW */, 'w', 'W');
            _registerLetterIfMissing(CharCode$1.X, 33 /* KeyX */, 'x', 'X');
            _registerLetterIfMissing(CharCode$1.Y, 34 /* KeyY */, 'y', 'Y');
            _registerLetterIfMissing(CharCode$1.Z, 35 /* KeyZ */, 'z', 'Z');
        }
        let mappings = [], mappingsLen = 0;
        for (let strScanCode in rawMappings) {
            if (rawMappings.hasOwnProperty(strScanCode)) {
                const scanCode = ScanCodeUtils.toEnum(strScanCode);
                if (scanCode === 0 /* None */) {
                    continue;
                }
                if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                    continue;
                }
                this._codeInfo[scanCode] = rawMappings[strScanCode];
                const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
                const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                const mapping = {
                    scanCode: scanCode,
                    value: value,
                };
                mappings[mappingsLen++] = mapping;
                this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
                if (value >= CharCode$1.a && value <= CharCode$1.z) {
                    const upperCaseValue = CharCode$1.A + (value - CharCode$1.a);
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(upperCaseValue);
                }
                else if (value >= CharCode$1.A && value <= CharCode$1.Z) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else if (value) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else {
                    this._scanCodeToLabel[scanCode] = null;
                }
            }
        }
        // Handle all `value` entries
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const kb = MacLinuxKeyboardMapper._charCodeToKb(mapping.value);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                // ScanCode => Shift+KeyCode
                _registerIfUnknown(0, 0, 0, scanCode, 0, 1, 0, keyCode); //                ScanCode =>          Shift+KeyCode
                _registerIfUnknown(0, 0, 1, scanCode, 0, 1, 1, keyCode); //            Alt+ScanCode =>      Shift+Alt+KeyCode
                _registerIfUnknown(1, 0, 0, scanCode, 1, 1, 0, keyCode); //           Ctrl+ScanCode =>     Ctrl+Shift+KeyCode
                _registerIfUnknown(1, 0, 1, scanCode, 1, 1, 1, keyCode); //       Ctrl+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
            }
            else {
                // ScanCode => KeyCode
                _registerIfUnknown(0, 0, 0, scanCode, 0, 0, 0, keyCode); //                ScanCode =>                KeyCode
                _registerIfUnknown(0, 0, 1, scanCode, 0, 0, 1, keyCode); //            Alt+ScanCode =>            Alt+KeyCode
                _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode); //          Shift+ScanCode =>          Shift+KeyCode
                _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode); //      Shift+Alt+ScanCode =>      Shift+Alt+KeyCode
                _registerIfUnknown(1, 0, 0, scanCode, 1, 0, 0, keyCode); //           Ctrl+ScanCode =>           Ctrl+KeyCode
                _registerIfUnknown(1, 0, 1, scanCode, 1, 0, 1, keyCode); //       Ctrl+Alt+ScanCode =>       Ctrl+Alt+KeyCode
                _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode); //     Ctrl+Shift+ScanCode =>     Ctrl+Shift+KeyCode
                _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode); // Ctrl+Shift+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
            }
        }
        // Handle all left-over available digits
        _registerAllCombos(0, 0, 0, 36 /* Digit1 */, 22 /* KEY_1 */);
        _registerAllCombos(0, 0, 0, 37 /* Digit2 */, 23 /* KEY_2 */);
        _registerAllCombos(0, 0, 0, 38 /* Digit3 */, 24 /* KEY_3 */);
        _registerAllCombos(0, 0, 0, 39 /* Digit4 */, 25 /* KEY_4 */);
        _registerAllCombos(0, 0, 0, 40 /* Digit5 */, 26 /* KEY_5 */);
        _registerAllCombos(0, 0, 0, 41 /* Digit6 */, 27 /* KEY_6 */);
        _registerAllCombos(0, 0, 0, 42 /* Digit7 */, 28 /* KEY_7 */);
        _registerAllCombos(0, 0, 0, 43 /* Digit8 */, 29 /* KEY_8 */);
        _registerAllCombos(0, 0, 0, 44 /* Digit9 */, 30 /* KEY_9 */);
        _registerAllCombos(0, 0, 0, 45 /* Digit0 */, 21 /* KEY_0 */);
        this._scanCodeKeyCodeMapper.registrationComplete();
    }
    simpleKeybindingToScanCodeBinding(keybinding) {
        // Avoid double Enter bindings (both ScanCode.NumpadEnter and ScanCode.Enter point to KeyCode.Enter)
        if (keybinding.keyCode === 3 /* Enter */) {
            return [new ScanCodeBinding(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, 46 /* Enter */)];
        }
        const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(new KeyCodeCombo(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.keyCode));
        let result = [];
        for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
            const scanCodeCombo = scanCodeCombos[i];
            result[i] = new ScanCodeBinding(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, keybinding.metaKey, scanCodeCombo.scanCode);
        }
        return result;
    }
    getUILabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        if (this._OS === 2 /* Macintosh */) {
            switch (binding.scanCode) {
                case 86 /* ArrowLeft */:
                    return '←';
                case 88 /* ArrowUp */:
                    return '↑';
                case 85 /* ArrowRight */:
                    return '→';
                case 87 /* ArrowDown */:
                    return '↓';
            }
        }
        return this._scanCodeToLabel[binding.scanCode];
    }
    getAriaLabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        return this._scanCodeToLabel[binding.scanCode];
    }
    getDispatchStrForScanCodeBinding(keypress) {
        const codeDispatch = this._scanCodeToDispatch[keypress.scanCode];
        if (!codeDispatch) {
            return null;
        }
        let result = '';
        if (keypress.ctrlKey) {
            result += 'ctrl+';
        }
        if (keypress.shiftKey) {
            result += 'shift+';
        }
        if (keypress.altKey) {
            result += 'alt+';
        }
        if (keypress.metaKey) {
            result += 'meta+';
        }
        result += codeDispatch;
        return result;
    }
    getUserSettingsLabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode];
        if (immutableKeyCode !== -1) {
            return KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
        }
        // Check if this scanCode always maps to the same keyCode and back
        let constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(binding.scanCode);
        if (constantKeyCode !== -1) {
            // Verify that this is a good key code that can be mapped back to the same scan code
            let reverseBindings = this.simpleKeybindingToScanCodeBinding(new SimpleKeybinding(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, constantKeyCode));
            for (let i = 0, len = reverseBindings.length; i < len; i++) {
                const reverseBinding = reverseBindings[i];
                if (reverseBinding.scanCode === binding.scanCode) {
                    return KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
                }
            }
        }
        return this._scanCodeToDispatch[binding.scanCode];
    }
    resolveKeybinding(keybinding) {
        let result = [], resultLen = 0;
        if (keybinding.type === 2 /* Chord */) {
            keybinding = keybinding;
            const firstParts = this.simpleKeybindingToScanCodeBinding(keybinding.firstPart);
            const chordParts = this.simpleKeybindingToScanCodeBinding(keybinding.chordPart);
            for (let i = 0, len = firstParts.length; i < len; i++) {
                const firstPart = firstParts[i];
                for (let j = 0, lenJ = chordParts.length; j < lenJ; j++) {
                    const chordPart = chordParts[j];
                    result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, chordPart);
                }
            }
        }
        else {
            const firstParts = this.simpleKeybindingToScanCodeBinding(keybinding);
            for (let i = 0, len = firstParts.length; i < len; i++) {
                const firstPart = firstParts[i];
                result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, null);
            }
        }
        return result;
    }
    resolveKeyboardEvent(keyboardEvent) {
        let code = ScanCodeUtils.toEnum(keyboardEvent.code);
        // Treat NumpadEnter as Enter
        if (code === 94 /* NumpadEnter */) {
            code = 46 /* Enter */;
        }
        const keyCode = keyboardEvent.keyCode;
        if ((keyCode === 15 /* LeftArrow */)
            || (keyCode === 16 /* UpArrow */)
            || (keyCode === 17 /* RightArrow */)
            || (keyCode === 18 /* DownArrow */)
            || (keyCode === 20 /* Delete */)
            || (keyCode === 19 /* Insert */)
            || (keyCode === 14 /* Home */)
            || (keyCode === 13 /* End */)
            || (keyCode === 12 /* PageDown */)
            || (keyCode === 11 /* PageUp */)) {
            // "Dispatch" on keyCode for these key codes to workaround issues with remote desktoping software
            // where the scan codes appear to be incorrect (see https://github.com/Microsoft/vscode/issues/24107)
            const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
            if (immutableScanCode !== -1) {
                code = immutableScanCode;
            }
        }
        else {
            if ((code === 95 /* Numpad1 */)
                || (code === 96 /* Numpad2 */)
                || (code === 97 /* Numpad3 */)
                || (code === 98 /* Numpad4 */)
                || (code === 99 /* Numpad5 */)
                || (code === 100 /* Numpad6 */)
                || (code === 101 /* Numpad7 */)
                || (code === 102 /* Numpad8 */)
                || (code === 103 /* Numpad9 */)
                || (code === 104 /* Numpad0 */)
                || (code === 105 /* NumpadDecimal */)) {
                // "Dispatch" on keyCode for all numpad keys in order for NumLock to work correctly
                if (keyCode >= 0) {
                    const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
                    if (immutableScanCode !== -1) {
                        code = immutableScanCode;
                    }
                }
            }
        }
        const keypress = new ScanCodeBinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, code);
        return new NativeResolvedKeybinding(this, this._OS, keypress, null);
    }
    _resolveSimpleUserBinding(binding) {
        if (!binding) {
            return [];
        }
        if (binding instanceof ScanCodeBinding) {
            return [binding];
        }
        return this.simpleKeybindingToScanCodeBinding(binding);
    }
    resolveUserBinding(_firstPart, _chordPart) {
        const firstParts = this._resolveSimpleUserBinding(_firstPart);
        const chordParts = this._resolveSimpleUserBinding(_chordPart);
        let result = [], resultLen = 0;
        for (let i = 0, len = firstParts.length; i < len; i++) {
            const firstPart = firstParts[i];
            if (_chordPart) {
                for (let j = 0, lenJ = chordParts.length; j < lenJ; j++) {
                    const chordPart = chordParts[j];
                    result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, chordPart);
                }
            }
            else {
                result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, null);
            }
        }
        return result;
    }
    static _charCodeToKb(charCode) {
        if (charCode < CHAR_CODE_TO_KEY_CODE.length) {
            return CHAR_CODE_TO_KEY_CODE[charCode];
        }
        return null;
    }
    /**
     * Attempt to shellMap a combining character to a regular one that renders the same way.
     *
     * To the brave person following me: Good Luck!
     * https://www.compart.com/en/unicode/bidiclass/NSM
     */
    static getCharCode(char) {
        if (char.length === 0) {
            return 0;
        }
        const charCode = char.charCodeAt(0);
        switch (charCode) {
            case CharCode$1.U_Combining_Grave_Accent:
                return CharCode$1.U_GRAVE_ACCENT;
            case CharCode$1.U_Combining_Acute_Accent:
                return CharCode$1.U_ACUTE_ACCENT;
            case CharCode$1.U_Combining_Circumflex_Accent:
                return CharCode$1.U_CIRCUMFLEX;
            case CharCode$1.U_Combining_Tilde:
                return CharCode$1.U_SMALL_TILDE;
            case CharCode$1.U_Combining_Macron:
                return CharCode$1.U_MACRON;
            case CharCode$1.U_Combining_Overline:
                return CharCode$1.U_OVERLINE;
            case CharCode$1.U_Combining_Breve:
                return CharCode$1.U_BREVE;
            case CharCode$1.U_Combining_Dot_Above:
                return CharCode$1.U_DOT_ABOVE;
            case CharCode$1.U_Combining_Diaeresis:
                return CharCode$1.U_DIAERESIS;
            case CharCode$1.U_Combining_Ring_Above:
                return CharCode$1.U_RING_ABOVE;
            case CharCode$1.U_Combining_Double_Acute_Accent:
                return CharCode$1.U_DOUBLE_ACUTE_ACCENT;
        }
        return charCode;
    }
}
(function () {
    function define(charCode, keyCode, shiftKey) {
        for (let i = CHAR_CODE_TO_KEY_CODE.length; i < charCode; i++) {
            CHAR_CODE_TO_KEY_CODE[i] = null;
        }
        CHAR_CODE_TO_KEY_CODE[charCode] = { keyCode: keyCode, shiftKey: shiftKey };
    }
    for (let chCode = CharCode$1.A; chCode <= CharCode$1.Z; chCode++) {
        define(chCode, 31 /* KEY_A */ + (chCode - CharCode$1.A), true);
    }
    for (let chCode = CharCode$1.a; chCode <= CharCode$1.z; chCode++) {
        define(chCode, 31 /* KEY_A */ + (chCode - CharCode$1.a), false);
    }
    define(CharCode$1.Semicolon, 80 /* US_SEMICOLON */, false);
    define(CharCode$1.Colon, 80 /* US_SEMICOLON */, true);
    define(CharCode$1.Equals, 81 /* US_EQUAL */, false);
    define(CharCode$1.Plus, 81 /* US_EQUAL */, true);
    define(CharCode$1.Comma, 82 /* US_COMMA */, false);
    define(CharCode$1.LessThan, 82 /* US_COMMA */, true);
    define(CharCode$1.Dash, 83 /* US_MINUS */, false);
    define(CharCode$1.Underline, 83 /* US_MINUS */, true);
    define(CharCode$1.Period, 84 /* US_DOT */, false);
    define(CharCode$1.GreaterThan, 84 /* US_DOT */, true);
    define(CharCode$1.Slash, 85 /* US_SLASH */, false);
    define(CharCode$1.QuestionMark, 85 /* US_SLASH */, true);
    define(CharCode$1.BackTick, 86 /* US_BACKTICK */, false);
    define(CharCode$1.Tilde, 86 /* US_BACKTICK */, true);
    define(CharCode$1.OpenSquareBracket, 87 /* US_OPEN_SQUARE_BRACKET */, false);
    define(CharCode$1.OpenCurlyBrace, 87 /* US_OPEN_SQUARE_BRACKET */, true);
    define(CharCode$1.Backslash, 88 /* US_BACKSLASH */, false);
    define(CharCode$1.Pipe, 88 /* US_BACKSLASH */, true);
    define(CharCode$1.CloseSquareBracket, 89 /* US_CLOSE_SQUARE_BRACKET */, false);
    define(CharCode$1.CloseCurlyBrace, 89 /* US_CLOSE_SQUARE_BRACKET */, true);
    define(CharCode$1.SingleQuote, 90 /* US_QUOTE */, false);
    define(CharCode$1.DoubleQuote, 90 /* US_QUOTE */, true);
})();

class CachedKeyboardMapper {
    constructor(actual) {
        this._actual = actual;
        this._cache = new Map();
    }
    resolveKeybinding(keybinding) {
        let hashCode = keybinding.getHashCode();
        if (!this._cache.has(hashCode)) {
            let r = this._actual.resolveKeybinding(keybinding);
            this._cache.set(hashCode, r);
            return r;
        }
        return this._cache.get(hashCode);
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this._actual.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(firstPart, chordPart) {
        return this._actual.resolveUserBinding(firstPart, chordPart);
    }
}
class KeyboardMapperFactory {
    constructor() {
        this._rawMapping = getKeyMap();
        this._keyboardMapper = null;
        this._initialized = false;
    }
    getKeyboardMapper() {
        if (!this._initialized) {
            this._initialized = true;
            this._keyboardMapper = new CachedKeyboardMapper(KeyboardMapperFactory._createKeyboardMapper(this._rawMapping));
        }
        return this._keyboardMapper;
    }
    static _createKeyboardMapper(rawMapping) {
        const isUSStandard = true;
        return new MacLinuxKeyboardMapper(isUSStandard, rawMapping, OS);
    }
}
KeyboardMapperFactory.INSTANCE = new KeyboardMapperFactory();

class KeybindingIO {
    static readUserKeybindingItem(input) {
        const [firstPart, chordPart] = (typeof input.key === 'string' ? this._readUserBinding(input.key) : [null, null]);
        const when = (typeof input.when === 'string' ? ContextKeyExpr.deserialize(input.when) : null);
        const command = (typeof input.command === 'string' ? input.command : null);
        const commandArgs = (typeof input.args !== 'undefined' ? input.args : undefined);
        return {
            firstPart: firstPart,
            chordPart: chordPart,
            command: command,
            commandArgs: commandArgs,
            when: when
        };
    }
    static _readModifiers(input) {
        input = input.toLowerCase().trim();
        let ctrl = false;
        let shift = false;
        let alt = false;
        let meta = false;
        let matchedModifier;
        do {
            matchedModifier = false;
            if (/^ctrl(\+|\-)/.test(input)) {
                ctrl = true;
                input = input.substr('ctrl-'.length);
                matchedModifier = true;
            }
            if (/^shift(\+|\-)/.test(input)) {
                shift = true;
                input = input.substr('shift-'.length);
                matchedModifier = true;
            }
            if (/^alt(\+|\-)/.test(input)) {
                alt = true;
                input = input.substr('alt-'.length);
                matchedModifier = true;
            }
            if (/^meta(\+|\-)/.test(input)) {
                meta = true;
                input = input.substr('meta-'.length);
                matchedModifier = true;
            }
            if (/^win(\+|\-)/.test(input)) {
                meta = true;
                input = input.substr('win-'.length);
                matchedModifier = true;
            }
            if (/^cmd(\+|\-)/.test(input)) {
                meta = true;
                input = input.substr('cmd-'.length);
                matchedModifier = true;
            }
        } while (matchedModifier);
        let key;
        const firstSpaceIdx = input.indexOf(' ');
        if (firstSpaceIdx > 0) {
            key = input.substring(0, firstSpaceIdx);
            input = input.substring(firstSpaceIdx);
        }
        else {
            key = input;
            input = '';
        }
        return {
            remains: input,
            ctrl,
            shift,
            alt,
            meta,
            key
        };
    }
    static _readSimpleUserBinding(input) {
        const mods = this._readModifiers(input);
        const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
        if (scanCodeMatch) {
            const strScanCode = scanCodeMatch[1];
            const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode);
            return [new ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
        }
        const keyCode = KeyCodeUtils.fromUserSettings(mods.key);
        return [new SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
    }
    static _readUserBinding(input) {
        if (!input) {
            return [null, null];
        }
        let [firstPart, remains] = this._readSimpleUserBinding(input);
        let chordPart = null;
        if (remains.length > 0) {
            [chordPart] = this._readSimpleUserBinding(remains);
        }
        return [firstPart, chordPart];
    }
}

class KeybindingService extends Disposable$2 {
    constructor(windowElement, contextKeyService, commandService, keybindingsRegistry) {
        super();
        this.keybindingsRegistry = keybindingsRegistry;
        this._contextKeyService = contextKeyService;
        this._commandService = commandService;
        this._currentChord = null;
        this._currentChordChecker = new IntervalTimer();
        this._currentChordStatusMessage = null;
        this._onDidUpdateKeybindings = this._register(new Emitter$1());
        this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper();
        this._cachedResolver = null;
        this._firstTimeComputingResolver = true;
        this._register(addDisposableListener$1(windowElement, EventType$1.KEY_DOWN, (e) => {
            let keyEvent = new StandardKeyboardEvent(e);
            let shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
        }));
    }
    dispose() {
        super.dispose();
    }
    get onDidUpdateKeybindings() {
        return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : Event$1.None; // Sinon stubbing walks properties on prototype
    }
    _safeGetConfig() {
        return [];
    }
    _getResolver() {
        if (!this._cachedResolver) {
            const defaults = this._resolveKeybindingItems(this.keybindingsRegistry.getDefaultKeybindings(), true);
            const overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
            this._cachedResolver = new KeybindingResolver(defaults, overrides);
            this._firstTimeComputingResolver = false;
        }
        return this._cachedResolver;
    }
    _documentHasFocus() {
        return document.hasFocus();
    }
    _resolveKeybindingItems(items, isDefault) {
        let result = [], resultLen = 0;
        for (let i = 0, len = items.length; i < len; i++) {
            const item = items[i];
            const when = (item.when ? item.when.normalize() : null);
            const keybinding = item.keybinding;
            if (!keybinding) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
            }
            else {
                const resolvedKeybindings = this.resolveKeybinding(keybinding);
                for (let j = 0; j < resolvedKeybindings.length; j++) {
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                }
            }
        }
        return result;
    }
    _resolveUserKeybindingItems(items, isDefault) {
        let result = [], resultLen = 0;
        for (let i = 0, len = items.length; i < len; i++) {
            const item = items[i];
            const when = (item.when ? item.when.normalize() : null);
            const firstPart = item.firstPart;
            const chordPart = item.chordPart;
            if (!firstPart) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
            }
            else {
                const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
                for (let j = 0; j < resolvedKeybindings.length; j++) {
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                }
            }
        }
        return result;
    }
    _getExtraKeybindings(isFirstTime) {
        let extraUserKeybindings = this._safeGetConfig();
        return extraUserKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k));
    }
    resolveKeybinding(kb) {
        return this._keyboardMapper.resolveKeybinding(kb);
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(userBinding) {
        const [firstPart, chordPart] = KeybindingIO._readUserBinding(userBinding);
        return this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
    }
    getDefaultKeybindingsContent() {
        return '';
    }
    getDefaultKeybindings() {
        return this._getResolver().getDefaultKeybindings();
    }
    getKeybindings() {
        return this._getResolver().getKeybindings();
    }
    lookupKeybindings(commandId) {
        return this._getResolver().lookupKeybindings(commandId).map(item => item.resolvedKeybinding);
    }
    lookupKeybinding(commandId) {
        let result = this._getResolver().lookupPrimaryKeybinding(commandId);
        if (!result) {
            return null;
        }
        return result.resolvedKeybinding;
    }
    softDispatch(e, target) {
        const keybinding = this.resolveKeyboardEvent(e);
        if (keybinding.isChord()) {
            console.warn('Unexpected keyboard event mapped to a chord');
            return null;
        }
        const [firstPart,] = keybinding.getDispatchParts();
        if (firstPart === null) {
            // cannot be dispatched, probably only modifier keys
            return null;
        }
        const contextValue = this._contextKeyService.getContext(target);
        const currentChord = this._currentChord ? this._currentChord.keypress : null;
        return this._getResolver().resolve(contextValue, currentChord, firstPart);
    }
    _enterChordMode(firstPart, keypressLabel) {
        this._currentChord = {
            keypress: firstPart,
            label: keypressLabel
        };
        console.log('(%s) was pressed. Waiting for second key of chord...', keypressLabel);
        const chordEnterTime = Date.now();
        this._currentChordChecker.cancelAndSet(() => {
            if (!this._documentHasFocus()) {
                // Focus has been lost => leave chord mode
                this._leaveChordMode();
                return;
            }
            if (Date.now() - chordEnterTime > 5000) {
                // 5 seconds elapsed => leave chord mode
                this._leaveChordMode();
            }
        }, 500);
    }
    _leaveChordMode() {
        if (this._currentChordStatusMessage) {
            this._currentChordStatusMessage.dispose();
            this._currentChordStatusMessage = null;
        }
        this._currentChordChecker.cancel();
        this._currentChord = null;
    }
    _dispatch(e, target) {
        let shouldPreventDefault = false;
        const keybinding = this.resolveKeyboardEvent(e);
        if (keybinding.isChord()) {
            console.warn('Unexpected keyboard event mapped to a chord');
            return null;
        }
        const [firstPart,] = keybinding.getDispatchParts();
        if (firstPart === null) {
            // cannot be dispatched, probably only modifier keys
            return shouldPreventDefault;
        }
        const contextValue = this._contextKeyService.getContext(target);
        const currentChord = this._currentChord ? this._currentChord.keypress : null;
        const keypressLabel = keybinding.getLabel();
        const resolveResult = this._getResolver().resolve(contextValue, currentChord, firstPart);
        if (resolveResult && resolveResult.enterChord) {
            shouldPreventDefault = true;
            this._enterChordMode(firstPart, keypressLabel);
            return shouldPreventDefault;
        }
        if (this._currentChord) {
            if (!resolveResult || !resolveResult.commandId) {
                console.warn('The key combination (%s, %s) is not a command.', this._currentChord.label, keypressLabel);
                shouldPreventDefault = true;
            }
        }
        this._leaveChordMode();
        if (resolveResult && resolveResult.commandId) {
            if (!resolveResult.bubble) {
                shouldPreventDefault = true;
            }
            this._commandService.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(undefined, err => {
                console.error(err);
            });
        }
        return shouldPreventDefault;
    }
}

function dispose$3(first, ...rest) {
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
        dispose$3(first);
        dispose$3(rest);
        return [];
    }
}
function combinedDisposable$2(disposables) {
    return { dispose: () => dispose$3(disposables) };
}
class Disposable$3 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$3(this._toDispose);
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
Disposable$3.None = Object.freeze({ dispose() { } });

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$3 = { done: true, value: undefined };
var Iterator$3;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$3;
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
                    return FIN$3;
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
                    return FIN$3;
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
                        return FIN$3;
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
})(Iterator$3 || (Iterator$3 = {}));

class Node$2 {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList$2 {
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
        const newNode = new Node$2(element);
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
        while (candidate instanceof Node$2) {
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
                    return FIN$3;
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
        for (let node = this._first; node instanceof Node$2; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

var Event$2;
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
        return (listener, thisArgs = null, disposables) => combinedDisposable$2(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
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
        const emitter = new Emitter$2({
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
        const emitter = new Emitter$2({
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
        const emitter = new Emitter$2({
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
        const result = new Emitter$2({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter$2();
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
})(Event$2 || (Event$2 = {}));
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
class Emitter$2 {
    constructor(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList$2();
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
                        result.dispose = Emitter$2._noop;
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
Emitter$2._noop = function () { };

function dispose$1$2(first, ...rest) {
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
        dispose$1$2(first);
        dispose$1$2(rest);
        return [];
    }
}
class Disposable$1$2 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$1$2(this._toDispose);
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
Disposable$1$2.None = Object.freeze({ dispose() { } });

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
        this._onDidChangeContextKey = new Emitter$2();
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
        this._toDispose = dispose$1$2(this._toDispose);
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

function isFalsyOrWhitespace$1(str) {
    if (!str || typeof str !== 'string') {
        return true;
    }
    return str.trim().length === 0;
}

var ContextKeyExprType$1;
(function (ContextKeyExprType) {
    ContextKeyExprType[ContextKeyExprType["Defined"] = 1] = "Defined";
    ContextKeyExprType[ContextKeyExprType["Not"] = 2] = "Not";
    ContextKeyExprType[ContextKeyExprType["Equals"] = 3] = "Equals";
    ContextKeyExprType[ContextKeyExprType["NotEquals"] = 4] = "NotEquals";
    ContextKeyExprType[ContextKeyExprType["And"] = 5] = "And";
    ContextKeyExprType[ContextKeyExprType["Regex"] = 6] = "Regex";
})(ContextKeyExprType$1 || (ContextKeyExprType$1 = {}));
class ContextKeyExpr$1 {
    static has(key) {
        return new ContextKeyDefinedExpr$1(key);
    }
    static equals(key, value) {
        return new ContextKeyEqualsExpr$1(key, value);
    }
    static notEquals(key, value) {
        return new ContextKeyNotEqualsExpr$1(key, value);
    }
    static regex(key, value) {
        return new ContextKeyRegexExpr$1(key, value);
    }
    static not(key) {
        return new ContextKeyNotExpr$1(key);
    }
    static and(...expr) {
        return new ContextKeyAndExpr$1(expr);
    }
    static deserialize(serialized) {
        if (!serialized) {
            return null;
        }
        let pieces = serialized.split('&&');
        let result = new ContextKeyAndExpr$1(pieces.map(p => this._deserializeOne(p)));
        return result.normalize();
    }
    static _deserializeOne(serializedOne) {
        serializedOne = serializedOne.trim();
        if (serializedOne.indexOf('!=') >= 0) {
            let pieces = serializedOne.split('!=');
            return new ContextKeyNotEqualsExpr$1(pieces[0].trim(), this._deserializeValue(pieces[1]));
        }
        if (serializedOne.indexOf('==') >= 0) {
            let pieces = serializedOne.split('==');
            return new ContextKeyEqualsExpr$1(pieces[0].trim(), this._deserializeValue(pieces[1]));
        }
        if (serializedOne.indexOf('=~') >= 0) {
            let pieces = serializedOne.split('=~');
            return new ContextKeyRegexExpr$1(pieces[0].trim(), this._deserializeRegexValue(pieces[1]));
        }
        if (/^\!\s*/.test(serializedOne)) {
            return new ContextKeyNotExpr$1(serializedOne.substr(1).trim());
        }
        return new ContextKeyDefinedExpr$1(serializedOne);
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
        if (isFalsyOrWhitespace$1(serializedValue)) {
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
function cmp$1(a, b) {
    let aType = a.getType();
    let bType = b.getType();
    if (aType !== bType) {
        return aType - bType;
    }
    switch (aType) {
        case ContextKeyExprType$1.Defined:
            return a.cmp(b);
        case ContextKeyExprType$1.Not:
            return a.cmp(b);
        case ContextKeyExprType$1.Equals:
            return a.cmp(b);
        case ContextKeyExprType$1.NotEquals:
            return a.cmp(b);
        case ContextKeyExprType$1.Regex:
            return a.cmp(b);
        default:
            throw new Error('Unknown ContextKeyExpr!');
    }
}
class ContextKeyDefinedExpr$1 {
    constructor(key) {
        this.key = key;
    }
    getType() {
        return ContextKeyExprType$1.Defined;
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
        if (other instanceof ContextKeyDefinedExpr$1) {
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
class ContextKeyEqualsExpr$1 {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    getType() {
        return ContextKeyExprType$1.Equals;
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
        if (other instanceof ContextKeyEqualsExpr$1) {
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
                return new ContextKeyDefinedExpr$1(this.key);
            }
            return new ContextKeyNotExpr$1(this.key);
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
class ContextKeyNotEqualsExpr$1 {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    getType() {
        return ContextKeyExprType$1.NotEquals;
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
        if (other instanceof ContextKeyNotEqualsExpr$1) {
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
                return new ContextKeyNotExpr$1(this.key);
            }
            return new ContextKeyDefinedExpr$1(this.key);
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
class ContextKeyNotExpr$1 {
    constructor(key) {
        this.key = key;
    }
    getType() {
        return ContextKeyExprType$1.Not;
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
        if (other instanceof ContextKeyNotExpr$1) {
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
class ContextKeyRegexExpr$1 {
    constructor(key, regexp) {
        this.key = key;
        this.regexp = regexp;
        //
    }
    getType() {
        return ContextKeyExprType$1.Regex;
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
        if (other instanceof ContextKeyRegexExpr$1) {
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
class ContextKeyAndExpr$1 {
    constructor(expr) {
        this.expr = ContextKeyAndExpr$1._normalizeArr(expr);
    }
    getType() {
        return ContextKeyExprType$1.And;
    }
    equals(other) {
        if (other instanceof ContextKeyAndExpr$1) {
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
                if (e instanceof ContextKeyAndExpr$1) {
                    expr = expr.concat(e.expr);
                    continue;
                }
                expr.push(e);
            }
            expr.sort(cmp$1);
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
class RawContextKey extends ContextKeyDefinedExpr$1 {
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
        return ContextKeyExpr$1.not(this.key);
    }
    isEqualTo(value) {
        return ContextKeyExpr$1.equals(this.key, value);
    }
    notEqualsTo(value) {
        return ContextKeyExpr$1.notEquals(this.key, value);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$4 = { done: true, value: undefined };
var Iterator$4;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$4;
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
                    return FIN$4;
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
                    return FIN$4;
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
                        return FIN$4;
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
})(Iterator$4 || (Iterator$4 = {}));

class Node$3 {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList$3 {
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
        const newNode = new Node$3(element);
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
        while (candidate instanceof Node$3) {
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
                    return FIN$4;
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
        for (let node = this._first; node instanceof Node$3; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class CommandsRegistry {
    constructor() {
        this._commands = new Map();
    }
    registerCommand(idOrCommand, handler) {
        if (!idOrCommand) {
            throw new Error(`invalid command`);
        }
        if (typeof idOrCommand === 'string') {
            if (!handler) {
                throw new Error(`invalid command`);
            }
            return this.registerCommand({ id: idOrCommand, handler });
        }
        // find a place to store the command
        const { id } = idOrCommand;
        let commands = this._commands.get(id);
        if (!commands) {
            commands = new LinkedList$3();
            this._commands.set(id, commands);
        }
        let removeFn = commands.unshift(idOrCommand);
        return {
            dispose: () => {
                removeFn();
                if (this._commands.get(id).isEmpty()) {
                    this._commands.delete(id);
                }
            }
        };
    }
    getCommand(id) {
        const list = this._commands.get(id);
        if (!list || list.isEmpty()) {
            return undefined;
        }
        return list.iterator().next().value;
    }
    getCommands() {
        const result = Object.create(null);
        this._commands.forEach((value, key) => {
            result[key] = this.getCommand(key);
        });
        return result;
    }
}

function dispose$4(first, ...rest) {
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
        dispose$4(first);
        dispose$4(rest);
        return [];
    }
}
function combinedDisposable$3(disposables) {
    return { dispose: () => dispose$4(disposables) };
}
class Disposable$4 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$4(this._toDispose);
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
Disposable$4.None = Object.freeze({ dispose() { } });

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const FIN$1$2 = { done: true, value: undefined };
var Iterator$1$2;
(function (Iterator) {
    const _empty = {
        next() {
            return FIN$1$2;
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
                    return FIN$1$2;
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
                    return FIN$1$2;
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
                        return FIN$1$2;
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
})(Iterator$1$2 || (Iterator$1$2 = {}));

class Node$1$2 {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList$1$2 {
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
        const newNode = new Node$1$2(element);
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
        while (candidate instanceof Node$1$2) {
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
                    return FIN$1$2;
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
        for (let node = this._first; node instanceof Node$1$2; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

var Event$3;
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
        return (listener, thisArgs = null, disposables) => combinedDisposable$3(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
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
        const emitter = new Emitter$3({
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
        const emitter = new Emitter$3({
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
        const emitter = new Emitter$3({
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
        const result = new Emitter$3({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter$3();
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
})(Event$3 || (Event$3 = {}));
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
class Emitter$3 {
    constructor(options) {
        this._disposed = false;
        this._options = options;
        this._leakageMon = undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList$1$2();
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
                        result.dispose = Emitter$3._noop;
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
Emitter$3._noop = function () { };

function dispose$1$3(first, ...rest) {
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
        dispose$1$3(first);
        dispose$1$3(rest);
        return [];
    }
}
class Disposable$1$3 {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose$1$3(this._toDispose);
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
Disposable$1$3.None = Object.freeze({ dispose() { } });
class CommandService extends Disposable$1$3 {
    constructor(_commandsRegistry) {
        super();
        this._commandsRegistry = _commandsRegistry;
        this._onWillExecuteCommand = this._register(new Emitter$3());
        this.onWillExecuteCommand = this._onWillExecuteCommand.event;
    }
    executeCommand(id, ...args) {
        return this._tryExecuteCommand(id, args);
    }
    _tryExecuteCommand(id, args) {
        const command = this._getCommand(id);
        if (!command) {
            return Promise.reject(new Error(`command '${id}' not found`));
        }
        try {
            this._onWillExecuteCommand.fire({ commandId: id });
            const result = command.handler.apply(null, args);
            return Promise.resolve(result);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    _getCommand(id) {
        return this._commandsRegistry.getCommand(id);
    }
}

var MapContextKeys;
(function (MapContextKeys) {
    MapContextKeys.hadTopicFocus = new RawContextKey('mapHasTopicFocus', false);
})(MapContextKeys || (MapContextKeys = {}));

class Mindmap extends Disposable {
    constructor(container, option) {
        super();
        this.container = container;
        this.layoutModel = new LayoutModel();
        this.layoutView = new LayoutView(container, new MindmapLayout(container.getBoundingClientRect()));
        this._register(this.layoutView);
        this._register(this.layoutModel);
        this._register(this.layoutModel.onTopicAdded((topic) => this.layoutView.handleNodeAdded(topic)));
        this._register(this.layoutModel.onTopicRemoved((topic) => this.layoutView.handleNodeRemoved(topic)));
        this._registerKeybingingHandler();
    }
    addTopic(topic, refTopic) {
        this.layoutModel.addTopic(topic, refTopic);
    }
    _registerKeybingingHandler() {
        const commandsRegistry = new CommandsRegistry();
        const keybindingsRegistry = new KeybindingsRegistry(commandsRegistry);
        const contextKeyService = new ContextKeyService();
        this.context = new MapContext(this.layoutView, contextKeyService);
        this._register(this.context);
        keybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'addChildTopic',
            weight: 100,
            when: MapContextKeys.hadTopicFocus,
            primary: 2 /* Tab */,
            handler: () => {
                let viewNode = this.layoutView.selection;
                let newTopic = new Topic();
                this.addTopic(newTopic, viewNode.topicNode);
                this.layoutView.focus(newTopic);
            }
        });
        keybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'addSiblingTopic',
            weight: 100,
            when: MapContextKeys.hadTopicFocus,
            primary: 3 /* Enter */,
            handler: () => {
                let viewNode = this.layoutView.selection;
                if (!viewNode.topicNode.isRoot) {
                    let newTopic = new Topic();
                    this.addTopic(newTopic, viewNode.topicNode.parent);
                    this.layoutView.focus(newTopic);
                }
            }
        });
        keybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'removeTopic',
            weight: 100,
            when: MapContextKeys.hadTopicFocus,
            primary: 20 /* Delete */ | 1024 /* Shift */,
            secondary: [1 /* Backspace */],
            handler: () => {
                let viewNode = this.layoutView.selection;
                if (!viewNode.topicNode.isRoot) {
                    this.layoutModel.removeTopic(viewNode.topicNode);
                }
            }
        });
        keybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'blurTopic',
            weight: 100,
            when: MapContextKeys.hadTopicFocus,
            primary: 9 /* Escape */,
            handler: () => {
                this.layoutView.blur();
            }
        });
        const keyBindingService = new KeybindingService(window, contextKeyService, new CommandService(commandsRegistry), keybindingsRegistry);
    }
}
class MapContext extends Disposable {
    constructor(view, contextKeyService) {
        super();
        this.view = view;
        this.contextKeyService = contextKeyService;
        this._hasTopicFocus = MapContextKeys.hadTopicFocus.bindTo(this.contextKeyService);
        this._register(this.view.onTopicFocus(this.updateFromSelection, this));
        this._register(this.view.onTopicBlur(this.updateFromSelection, this));
    }
    updateFromSelection() {
        if (this.view.selection) {
            this._hasTopicFocus.set(true);
        }
        else {
            this._hasTopicFocus.set(false);
        }
    }
}

export { MapContext, Mindmap, Topic };
