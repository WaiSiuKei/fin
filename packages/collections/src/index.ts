export interface IStringDictionary<V> {
  [name: string]: V;
}

export interface INumberDictionary<V> {
  [idx: number]: V;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function forEach<T>(from: IStringDictionary<T> | INumberDictionary<T>, callback: (entry: { key: any; value: T; }, remove: () => void) => any): void {
  for (let key in from) {
    if (hasOwnProperty.call(from, key)) {
      const result = callback({ key: key, value: (from as any)[key] }, function () {
        delete (from as any)[key];
      });
      if (result === false) {
        return;
      }
    }
  }
}

export * from './linkedlist';

