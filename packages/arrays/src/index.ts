import { Iterator, IteratorResult } from '@fin/iterator';

export function find<T>(arr: ArrayLike<T>, predicate: (value: T, index: number, arr: ArrayLike<T>) => any): T | undefined {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (predicate(element, i, arr)) {
      return element;
    }
  }

  return undefined;
}

export function findIndex<T>(arr: ArrayLike<T>, predicate: (value: T, index: number, arr: ArrayLike<T>) => any): number {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (predicate(element, i, arr)) {
      return i;
    }
  }

  return -1;
}

export function forEach<T>(object: Array<T>, fn: (value: T, index: number) => boolean | void): void {
  let index = 0;
  let it = Iterator.fromArray(object);
  let result: IteratorResult<T>;
  while (!(result = it.next()).done) {
    if (fn(result.value, index++) === false) {
      return;
    }
  }
}

/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
export function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[] {
  const before = target.slice(0, insertIndex);
  const after = target.slice(insertIndex);
  return before.concat(insertArr, after);
}
