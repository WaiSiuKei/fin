// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../@fin/event

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
export class Context implements IContext {
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
export abstract class AbstractContextKeyService implements IContextKeyService {
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
export class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {
    constructor();
    dispose(): void;
    getContextValuesContainer(contextId: number): Context;
    createChildContext(parentContextId?: number): number;
    disposeContext(contextId: number): void;
}

export enum ContextKeyExprType {
    Defined = 1,
    Not = 2,
    Equals = 3,
    NotEquals = 4,
    And = 5,
    Regex = 6
}
export abstract class ContextKeyExpr {
    static has(key: string): ContextKeyExpr;
    static equals(key: string, value: any): ContextKeyExpr;
    static notEquals(key: string, value: any): ContextKeyExpr;
    static regex(key: string, value: RegExp): ContextKeyExpr;
    static not(key: string): ContextKeyExpr;
    static and(...expr: ContextKeyExpr[]): ContextKeyExpr;
    static deserialize(serialized: string): ContextKeyExpr;
    abstract getType(): ContextKeyExprType;
    abstract equals(other: ContextKeyExpr): boolean;
    abstract evaluate(context: IContext): boolean;
    abstract normalize(): ContextKeyExpr;
    abstract serialize(): string;
    abstract keys(): string[];
}
export class ContextKeyDefinedExpr implements ContextKeyExpr {
    protected key: string;
    constructor(key: string);
    getType(): ContextKeyExprType;
    cmp(other: ContextKeyDefinedExpr): number;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class ContextKeyEqualsExpr implements ContextKeyExpr {
    constructor(key: string, value: any);
    getType(): ContextKeyExprType;
    cmp(other: ContextKeyEqualsExpr): number;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class ContextKeyNotEqualsExpr implements ContextKeyExpr {
    constructor(key: string, value: any);
    getType(): ContextKeyExprType;
    cmp(other: ContextKeyNotEqualsExpr): number;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class ContextKeyNotExpr implements ContextKeyExpr {
    constructor(key: string);
    getType(): ContextKeyExprType;
    cmp(other: ContextKeyNotExpr): number;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class ContextKeyRegexExpr implements ContextKeyExpr {
    constructor(key: string, regexp: RegExp);
    getType(): ContextKeyExprType;
    cmp(other: ContextKeyRegexExpr): number;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class ContextKeyAndExpr implements ContextKeyExpr {
    readonly expr: ContextKeyExpr[];
    constructor(expr: ContextKeyExpr[]);
    getType(): ContextKeyExprType;
    equals(other: ContextKeyExpr): boolean;
    evaluate(context: IContext): boolean;
    normalize(): ContextKeyExpr;
    serialize(): string;
    keys(): string[];
}
export class RawContextKey<T> extends ContextKeyDefinedExpr {
    constructor(key: string, defaultValue: T);
    bindTo(target: IContextKeyService): IContextKey<T>;
    getValue(target: IContextKeyService): T;
    toNegated(): ContextKeyExpr;
    isEqualTo(value: string): ContextKeyExpr;
    notEqualsTo(value: string): ContextKeyExpr;
}

