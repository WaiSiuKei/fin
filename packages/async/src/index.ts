import { Disposable } from '@fin/disposable';

export class IntervalTimer extends Disposable {

  private _token: any;

  constructor() {
    super();
    this._token = -1;
  }

  dispose(): void {
    this.cancel();
    super.dispose();
  }

  cancel(): void {
    if (this._token !== -1) {
      clearInterval(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner: () => void, interval: number): void {
    this.cancel();
    this._token = setInterval(() => {
      runner();
    }, interval);
  }
}
