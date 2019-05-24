import { Event } from '@fin/event/src';

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
