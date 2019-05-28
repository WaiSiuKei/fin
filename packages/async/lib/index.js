import { Disposable } from '@fin/disposable';
export class IntervalTimer extends Disposable {
    constructor() {
        super();
        this._token = -1;
    }
    dispose() {
        this.cancel();
        super.dispose();
    }
    cancel() {
        if (this._token !== -1) {
            clearInterval(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, interval) {
        this.cancel();
        this._token = setInterval(() => {
            runner();
        }, interval);
    }
}
