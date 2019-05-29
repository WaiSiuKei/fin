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
export declare enum ContextKeyExprType {
	Defined = 1,
	Not = 2,
	Equals = 3,
	NotEquals = 4,
	And = 5,
	Regex = 6
}
export declare abstract class ContextKeyExpr {
	static has(key: string): ContextKeyExpr;
	static equals(key: string, value: any): ContextKeyExpr;
	static notEquals(key: string, value: any): ContextKeyExpr;
	static regex(key: string, value: RegExp): ContextKeyExpr;
	static not(key: string): ContextKeyExpr;
	static and(...expr: ContextKeyExpr[]): ContextKeyExpr;
	static deserialize(serialized: string): ContextKeyExpr;
	private static _deserializeOne;
	private static _deserializeValue;
	private static _deserializeRegexValue;
	abstract getType(): ContextKeyExprType;
	abstract equals(other: ContextKeyExpr): boolean;
	abstract evaluate(context: IContext): boolean;
	abstract normalize(): ContextKeyExpr;
	abstract serialize(): string;
	abstract keys(): string[];
}
export declare class ContextKeyDefinedExpr implements ContextKeyExpr {
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
export declare class ContextKeyEqualsExpr implements ContextKeyExpr {
	private key;
	private value;
	constructor(key: string, value: any);
	getType(): ContextKeyExprType;
	cmp(other: ContextKeyEqualsExpr): number;
	equals(other: ContextKeyExpr): boolean;
	evaluate(context: IContext): boolean;
	normalize(): ContextKeyExpr;
	serialize(): string;
	keys(): string[];
}
export declare class ContextKeyNotEqualsExpr implements ContextKeyExpr {
	private key;
	private value;
	constructor(key: string, value: any);
	getType(): ContextKeyExprType;
	cmp(other: ContextKeyNotEqualsExpr): number;
	equals(other: ContextKeyExpr): boolean;
	evaluate(context: IContext): boolean;
	normalize(): ContextKeyExpr;
	serialize(): string;
	keys(): string[];
}
export declare class ContextKeyNotExpr implements ContextKeyExpr {
	private key;
	constructor(key: string);
	getType(): ContextKeyExprType;
	cmp(other: ContextKeyNotExpr): number;
	equals(other: ContextKeyExpr): boolean;
	evaluate(context: IContext): boolean;
	normalize(): ContextKeyExpr;
	serialize(): string;
	keys(): string[];
}
export declare class ContextKeyRegexExpr implements ContextKeyExpr {
	private key;
	private regexp;
	constructor(key: string, regexp: RegExp);
	getType(): ContextKeyExprType;
	cmp(other: ContextKeyRegexExpr): number;
	equals(other: ContextKeyExpr): boolean;
	evaluate(context: IContext): boolean;
	normalize(): ContextKeyExpr;
	serialize(): string;
	keys(): string[];
}
export declare class ContextKeyAndExpr implements ContextKeyExpr {
	readonly expr: ContextKeyExpr[];
	constructor(expr: ContextKeyExpr[]);
	getType(): ContextKeyExprType;
	equals(other: ContextKeyExpr): boolean;
	evaluate(context: IContext): boolean;
	private static _normalizeArr;
	normalize(): ContextKeyExpr;
	serialize(): string;
	keys(): string[];
}
export declare class RawContextKey<T> extends ContextKeyDefinedExpr {
	private _defaultValue;
	constructor(key: string, defaultValue: T);
	bindTo(target: IContextKeyService): IContextKey<T>;
	getValue(target: IContextKeyService): T;
	toNegated(): ContextKeyExpr;
	isEqualTo(value: string): ContextKeyExpr;
	notEqualsTo(value: string): ContextKeyExpr;
}

export {};
