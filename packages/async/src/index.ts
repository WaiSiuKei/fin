import { Disposable, IDisposable } from '@fin/disposable';

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

//#region -- run on idle tricks ------------

export interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

/**
 * Execute the callback the next time the browser is idle
 */
export let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;

declare function requestIdleCallback(callback: (args: IdleDeadline) => void, options?: { timeout: number }): number;
declare function cancelIdleCallback(handle: number): void;

(function () {
  if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
    const dummyIdle: IdleDeadline = Object.freeze({
      didTimeout: true,
      timeRemaining() { return 15; }
    });
    runWhenIdle = (runner) => {
      const handle = setTimeout(() => runner(dummyIdle));
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }
          disposed = true;
          clearTimeout(handle);
        }
      };
    };
  } else {
    runWhenIdle = (runner, timeout?) => {
      const handle: number = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }
          disposed = true;
          cancelIdleCallback(handle);
        }
      };
    };
  }
})();

/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export class IdleValue<T> {

  private readonly _executor: () => void;
  private readonly _handle: IDisposable;

  private _didRun: boolean = false;
  private _value?: T;
  private _error: any;

  constructor(executor: () => T) {
    this._executor = () => {
      try {
        this._value = executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    };
    this._handle = runWhenIdle(() => this._executor());
  }

  dispose(): void {
    this._handle.dispose();
  }

  getValue(): T {
    if (!this._didRun) {
      this._handle.dispose();
      this._executor();
    }
    if (this._error) {
      throw this._error;
    }
    return this._value!;
  }
}

//#endregion

export class RunOnceScheduler {

  protected runner: ((...args: any[]) => void) | null;

  private timeoutToken: any;
  private timeout: number;
  private timeoutHandler: () => void;

  constructor(runner: (...args: any[]) => void, timeout: number) {
    this.timeoutToken = -1;
    this.runner = runner;
    this.timeout = timeout;
    this.timeoutHandler = this.onTimeout.bind(this);
  }

  /**
   * Dispose RunOnceScheduler
   */
  dispose(): void {
    this.cancel();
    this.runner = null;
  }

  /**
   * Cancel current scheduled runner (if any).
   */
  cancel(): void {
    if (this.isScheduled()) {
      clearTimeout(this.timeoutToken);
      this.timeoutToken = -1;
    }
  }

  /**
   * Cancel previous runner (if any) & schedule a new runner.
   */
  schedule(delay = this.timeout): void {
    this.cancel();
    this.timeoutToken = setTimeout(this.timeoutHandler, delay);
  }

  /**
   * Returns true if scheduled.
   */
  isScheduled(): boolean {
    return this.timeoutToken !== -1;
  }

  private onTimeout() {
    this.timeoutToken = -1;
    if (this.runner) {
      this.doRun();
    }
  }

  protected doRun(): void {
    if (this.runner) {
      this.runner();
    }
  }
}
