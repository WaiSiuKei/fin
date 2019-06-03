import { isNumber } from '@fin/types';

export class Container<T> {
  items: T[] = [];

  getItems(): T[] {
    return this.items;
  }

  getItem(index: number): T {
    return this.getItems()[index];
  }

  getFirstItem(): T {
    return this.getItem(0);
  }

  getLastItem(): T {
    return this.getItem(this.getItems().length - 1);
  }

  indexOf(item: T): number {
    return this.getItems().indexOf(item);
  }

  addItem(item: T, pos: number = 0) {
    let items = this.getItems(),
      length = items.length;

    if (~items.indexOf(item)) {
      return this;
    }
    if (!(pos >= 0 && pos < length)) {
      pos = length;
    }
    items.splice(pos, 0, item);

    return this;
  }

  addItems(items: T[]) {
    for (let i = 0, l = items.length; i < l; i++) {
      this.addItem(items[i], -1);
    }
    return this;
  }

  setItems(items: T[]) {
    return this.clear().addItems(items);
  }

  appendItem(item: T) {
    return this.addItem(item);
  }

  prependItem(item: T) {
    return this.addItem(item, 0);
  }

  removeItem(pos: T)
  removeItem(pos: number)
  removeItem(pos: any) {
    if (!isNumber(pos)) {
      return this.removeItem(this.indexOf(pos));
    }

    let items = this.getItems(),
      length = items.length,
      item = items[pos];

    if (item === undefined) {
      return this;
    }
    items.splice(pos, 1);

    return this;
  }

  clear() {
    let removed = [];
    let item;
    while ((item = this.getFirstItem())) {
      removed.push(item);
      this.removeItem(0);
    }
    return this;
  }
}
