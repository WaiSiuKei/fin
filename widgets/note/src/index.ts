import { Disposable } from '@fin/disposable';

export class Note extends Disposable {
  constructor(public container: HTMLElement) {
    super();
  }
}
