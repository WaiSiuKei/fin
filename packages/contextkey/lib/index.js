(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fin/event'), require('@fin/disposable'), require('@fin/strings')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fin/event', '@fin/disposable', '@fin/strings'], factory) :
  (global = global || self, factory(global['@fin/contextkey'] = {}, global.event, global.disposable, global.strings));
}(this, function (exports, event, disposable, strings) { 'use strict';

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
          this._onDidChangeContextKey = new event.Emitter();
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
          this._toDispose = disposable.dispose(this._toDispose);
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

  (function (ContextKeyExprType) {
      ContextKeyExprType[ContextKeyExprType["Defined"] = 1] = "Defined";
      ContextKeyExprType[ContextKeyExprType["Not"] = 2] = "Not";
      ContextKeyExprType[ContextKeyExprType["Equals"] = 3] = "Equals";
      ContextKeyExprType[ContextKeyExprType["NotEquals"] = 4] = "NotEquals";
      ContextKeyExprType[ContextKeyExprType["And"] = 5] = "And";
      ContextKeyExprType[ContextKeyExprType["Regex"] = 6] = "Regex";
  })(exports.ContextKeyExprType || (exports.ContextKeyExprType = {}));
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
          if (strings.isFalsyOrWhitespace(serializedValue)) {
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
          case exports.ContextKeyExprType.Defined:
              return a.cmp(b);
          case exports.ContextKeyExprType.Not:
              return a.cmp(b);
          case exports.ContextKeyExprType.Equals:
              return a.cmp(b);
          case exports.ContextKeyExprType.NotEquals:
              return a.cmp(b);
          case exports.ContextKeyExprType.Regex:
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
          return exports.ContextKeyExprType.Defined;
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
          return exports.ContextKeyExprType.Equals;
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
          return exports.ContextKeyExprType.NotEquals;
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
          return exports.ContextKeyExprType.Not;
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
          return exports.ContextKeyExprType.Regex;
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
          return exports.ContextKeyExprType.And;
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

  exports.AbstractContextKeyService = AbstractContextKeyService;
  exports.Context = Context;
  exports.ContextKeyAndExpr = ContextKeyAndExpr;
  exports.ContextKeyDefinedExpr = ContextKeyDefinedExpr;
  exports.ContextKeyEqualsExpr = ContextKeyEqualsExpr;
  exports.ContextKeyExpr = ContextKeyExpr;
  exports.ContextKeyNotEqualsExpr = ContextKeyNotEqualsExpr;
  exports.ContextKeyNotExpr = ContextKeyNotExpr;
  exports.ContextKeyRegexExpr = ContextKeyRegexExpr;
  exports.ContextKeyService = ContextKeyService;
  exports.RawContextKey = RawContextKey;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
