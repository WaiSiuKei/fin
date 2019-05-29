"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("@fin/event");
const disposable_1 = require("@fin/disposable");
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
exports.Context = Context;
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
        this._onDidChangeContextKey = new event_1.Emitter();
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
exports.AbstractContextKeyService = AbstractContextKeyService;
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
        this._toDispose = disposable_1.dispose(this._toDispose);
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
exports.ContextKeyService = ContextKeyService;
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
