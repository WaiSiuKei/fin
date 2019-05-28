import { Disposable } from '@fin/disposable';
export declare class IntervalTimer extends Disposable {
    private _token;
    constructor();
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, interval: number): void;
}
