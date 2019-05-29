import { Emitter } from '@fin/event';
export interface IContext {
    getValue<T>(key: string): T;
}
export interface IContextKey<T> {
    set(value: T): void;
    reset(): void;
    get(): T;
}
export interface IContextKeyService {
    dispose(): void;
    createKey<T>(key: string, defaultValue: T): IContextKey<T>;
    getContextKeyValue<T>(key: string): T;
    createScoped(target?: HTMLElement): IContextKeyService;
    getContext(target: HTMLElement): IContext;
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
export declare abstract class AbstractContextKeyService implements IContextKeyService {
    protected _onDidChangeContextKey: Emitter<string | string[]>;
    protected _myContextId: number;
    constructor(myContextId: number);
    abstract dispose(): void;
    createKey<T>(key: string, defaultValue: T): IContextKey<T>;
    createScoped(domNode: HTMLElement): IContextKeyService;
    getContextKeyValue<T>(key: string): T;
    setContext(key: string, value: any): void;
    removeContext(key: string): void;
    getContext(target: HTMLElement): IContext;
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
