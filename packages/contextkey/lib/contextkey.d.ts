import { Emitter, Event } from '@fin/event';
export interface IContext {
    getValue<T>(key: string): T;
}
export interface IContextKey<T> {
    set(value: T): void;
    reset(): void;
    get(): T;
}
export interface IContextKeyServiceTarget {
    parentElement: IContextKeyServiceTarget;
    setAttribute(attr: string, value: string): void;
    removeAttribute(attr: string): void;
    hasAttribute(attr: string): boolean;
    getAttribute(attr: string): string;
}
export interface IReadableSet<T> {
    has(value: T): boolean;
}
export interface IContextKeyChangeEvent {
    affectsSome(keys: IReadableSet<string>): boolean;
}
export interface IContextKeyService {
    dispose(): void;
    onDidChangeContext: Event<IContextKeyChangeEvent>;
    createKey<T>(key: string, defaultValue: T): IContextKey<T>;
    getContextKeyValue<T>(key: string): T;
    createScoped(target?: IContextKeyServiceTarget): IContextKeyService;
    getContext(target: IContextKeyServiceTarget): IContext;
}
export declare class Context implements IContext {
    protected _parent: Context;
    protected _value: {
        [key: string]: any;
    };
    protected _id: number;
    constructor(id: number, parent: Context);
    setValue(key: string, value: any): boolean;
    removeValue(key: string): boolean;
    getValue<T>(key: string): T;
}
export declare class ContextKeyChangeEvent implements IContextKeyChangeEvent {
    private _keys;
    collect(oneOrManyKeys: string | string[]): void;
    affectsSome(keys: IReadableSet<string>): boolean;
}
export declare abstract class AbstractContextKeyService implements IContextKeyService {
    protected _onDidChangeContext: Event<IContextKeyChangeEvent>;
    protected _onDidChangeContextKey: Emitter<string | string[]>;
    protected _myContextId: number;
    constructor(myContextId: number);
    abstract dispose(): void;
    createKey<T>(key: string, defaultValue: T): IContextKey<T>;
    readonly onDidChangeContext: Event<IContextKeyChangeEvent>;
    createScoped(domNode: IContextKeyServiceTarget): IContextKeyService;
    getContextKeyValue<T>(key: string): T;
    setContext(key: string, value: any): void;
    removeContext(key: string): void;
    getContext(target: IContextKeyServiceTarget): IContext;
    abstract getContextValuesContainer(contextId: number): Context;
    abstract createChildContext(parentContextId?: number): number;
    abstract disposeContext(contextId: number): void;
}
export declare class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {
    private _lastContextId;
    private _contexts;
    private _toDispose;
    constructor();
    dispose(): void;
    getContextValuesContainer(contextId: number): Context;
    createChildContext(parentContextId?: number): number;
    disposeContext(contextId: number): void;
}
