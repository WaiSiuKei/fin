import { IContext, IContextKey, IContextKeyChangeEvent, IContextKeyService, IContextKeyServiceTarget, IReadableSet } from '@fin/contextkey/src/contextkey';
import { Emitter, Event } from '@fin/event/src';
import { dispose, IDisposable } from '@fin/disposable/src';

const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';

export class Context implements IContext {

  protected _parent: Context;
  protected _value: { [key: string]: any; };
  protected _id: number;

  constructor(id: number, parent: Context) {
    this._id = id;
    this._parent = parent;
    this._value = Object.create(null);
    this._value['_contextId'] = id;
  }

  public setValue(key: string, value: any): boolean {
    // console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
    if (this._value[key] !== value) {
      this._value[key] = value;
      return true;
    }
    return false;
  }

  public removeValue(key: string): boolean {
    // console.log('REMOVE ' + key + ' FROM ' + this._id);
    if (key in this._value) {
      delete this._value[key];
      return true;
    }
    return false;
  }

  public getValue<T>(key: string): T {
    const ret = this._value[key];
    if (typeof ret === 'undefined' && this._parent) {
      return this._parent.getValue<T>(key);
    }
    return ret;
  }
}

class ContextKey<T> implements IContextKey<T> {

  private _parent: AbstractContextKeyService;
  private _key: string;
  private _defaultValue: T;

  constructor(parent: AbstractContextKeyService, key: string, defaultValue: T) {
    this._parent = parent;
    this._key = key;
    this._defaultValue = defaultValue;
    this.reset();
  }

  public set(value: T): void {
    this._parent.setContext(this._key, value);
  }

  public reset(): void {
    if (typeof this._defaultValue === 'undefined') {
      this._parent.removeContext(this._key);
    } else {
      this._parent.setContext(this._key, this._defaultValue);
    }
  }

  public get(): T {
    return this._parent.getContextKeyValue<T>(this._key);
  }
}

export class ContextKeyChangeEvent implements IContextKeyChangeEvent {

  private _keys: string[] = [];

  collect(oneOrManyKeys: string | string[]): void {
    this._keys = this._keys.concat(oneOrManyKeys);
  }

  affectsSome(keys: IReadableSet<string>): boolean {
    for (const key of this._keys) {
      if (keys.has(key)) {
        return true;
      }
    }
    return false;
  }
}

export abstract class AbstractContextKeyService implements IContextKeyService {
  protected _onDidChangeContext: Event<IContextKeyChangeEvent>;
  protected _onDidChangeContextKey: Emitter<string | string[]>;
  protected _myContextId: number;

  constructor(myContextId: number) {
    this._myContextId = myContextId;
    this._onDidChangeContextKey = new Emitter<string>();
  }

  abstract dispose(): void;

  public createKey<T>(key: string, defaultValue: T): IContextKey<T> {
    return new ContextKey(this, key, defaultValue);
  }

  public get onDidChangeContext(): Event<IContextKeyChangeEvent> {
    if (!this._onDidChangeContext) {
      this._onDidChangeContext = Event.debounce<string | string[], ContextKeyChangeEvent>(this._onDidChangeContextKey.event, (prev, cur) => {
        if (!prev) {
          prev = new ContextKeyChangeEvent();
        }
        prev.collect(cur);
        return prev;
      }, 25);
    }
    return this._onDidChangeContext;
  }

  public createScoped(domNode: IContextKeyServiceTarget): IContextKeyService {
    return new ScopedContextKeyService(this, this._onDidChangeContextKey, domNode);
  }

  public getContextKeyValue<T>(key: string): T {
    return this.getContextValuesContainer(this._myContextId).getValue<T>(key);
  }

  public setContext(key: string, value: any): void {
    const myContext = this.getContextValuesContainer(this._myContextId);
    if (!myContext) {
      return;
    }
    if (myContext.setValue(key, value)) {
      this._onDidChangeContextKey.fire(key);
    }
  }

  public removeContext(key: string): void {
    if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
      this._onDidChangeContextKey.fire(key);
    }
  }

  public getContext(target: IContextKeyServiceTarget): IContext {
    return this.getContextValuesContainer(findContextAttr(target));
  }

  public abstract getContextValuesContainer(contextId: number): Context;
  public abstract createChildContext(parentContextId?: number): number;
  public abstract disposeContext(contextId: number): void;
}

export class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {

  private _lastContextId: number;
  private _contexts: {
    [contextId: string]: Context;
  };

  private _toDispose: IDisposable[] = [];

  constructor() {
    super(0);
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

  public dispose(): void {
    this._toDispose = dispose(this._toDispose);
  }

  public getContextValuesContainer(contextId: number): Context {
    return this._contexts[String(contextId)];
  }

  public createChildContext(parentContextId: number = this._myContextId): number {
    let id = (++this._lastContextId);
    this._contexts[String(id)] = new Context(id, this.getContextValuesContainer(parentContextId));
    return id;
  }

  public disposeContext(contextId: number): void {
    delete this._contexts[String(contextId)];
  }
}

class ScopedContextKeyService extends AbstractContextKeyService {

  private _parent: AbstractContextKeyService;
  private _domNode: IContextKeyServiceTarget;

  constructor(parent: AbstractContextKeyService, emitter: Emitter<string | string[]>, domNode?: IContextKeyServiceTarget) {
    super(parent.createChildContext());
    this._parent = parent;
    this._onDidChangeContextKey = emitter;

    if (domNode) {
      this._domNode = domNode;
      this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
    }
  }

  public dispose(): void {
    this._parent.disposeContext(this._myContextId);
    if (this._domNode) {
      this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
    }
  }

  public get onDidChangeContext(): Event<IContextKeyChangeEvent> {
    return this._parent.onDidChangeContext;
  }

  public getContextValuesContainer(contextId: number): Context {
    return this._parent.getContextValuesContainer(contextId);
  }

  public createChildContext(parentContextId: number = this._myContextId): number {
    return this._parent.createChildContext(parentContextId);
  }

  public disposeContext(contextId: number): void {
    this._parent.disposeContext(contextId);
  }
}

function findContextAttr(domNode: IContextKeyServiceTarget): number {
  while (domNode) {
    if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      return parseInt(domNode.getAttribute(KEYBINDING_CONTEXT_ATTR), 10);
    }
    domNode = domNode.parentElement;
  }
  return 0;
}
