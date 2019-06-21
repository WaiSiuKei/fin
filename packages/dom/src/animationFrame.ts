import { IDisposable } from '@fin/disposable';

interface IRequestAnimationFrame {
  (callback: (time: number) => void): number;
}

let _animationFrame: IRequestAnimationFrame | null = null;
function doRequestAnimationFrame(callback: (time: number) => void): number {
  if (!_animationFrame) {
    const emulatedRequestAnimationFrame = (callback: (time: number) => void): any => {
      return setTimeout(() => callback(new Date().getTime()), 0);
    };
    _animationFrame = (
      self.requestAnimationFrame
      || (<any>self).msRequestAnimationFrame
      || (<any>self).webkitRequestAnimationFrame
      || (<any>self).mozRequestAnimationFrame
      || (<any>self).oRequestAnimationFrame
      || emulatedRequestAnimationFrame
    );
  }
  return _animationFrame.call(self, callback);
}

/**
 * Schedule a callback to be run at the next animation frame.
 * This allows multiple parties to register callbacks that should run at the next animation frame.
 * If currently in an animation frame, `runner` will be executed immediately.
 * @return token that can be used to cancel the scheduled runner (only if `runner` was not executed immediately).
 */
export let runAtThisOrScheduleAtNextAnimationFrame: (runner: () => void, priority?: number) => IDisposable;
/**
 * Schedule a callback to be run at the next animation frame.
 * This allows multiple parties to register callbacks that should run at the next animation frame.
 * If currently in an animation frame, `runner` will be executed at the next animation frame.
 * @return token that can be used to cancel the scheduled runner.
 */
export let scheduleAtNextAnimationFrame: (runner: () => void, priority?: number) => IDisposable;

class AnimationFrameQueueItem implements IDisposable {

  private _runner: () => void;
  public priority: number;
  private _canceled: boolean;

  constructor(runner: () => void, priority: number = 0) {
    this._runner = runner;
    this.priority = priority;
    this._canceled = false;
  }

  public dispose(): void {
    this._canceled = true;
  }

  public execute(): void {
    if (this._canceled) {
      return;
    }

    this._runner();
  }

  // Sort by priority (largest to lowest)
  public static sort(a: AnimationFrameQueueItem, b: AnimationFrameQueueItem): number {
    return b.priority - a.priority;
  }
}

(function () {
  /**
   * The runners scheduled at the next animation frame
   */
  let NEXT_QUEUE: AnimationFrameQueueItem[] = [];
  /**
   * The runners scheduled at the current animation frame
   */
  let CURRENT_QUEUE: AnimationFrameQueueItem[] | null = null;
  /**
   * A flag to keep track if the native requestAnimationFrame was already called
   */
  let animFrameRequested = false;
  /**
   * A flag to indicate if currently handling a native requestAnimationFrame callback
   */
  let inAnimationFrameRunner = false;

  let animationFrameRunner = () => {
    animFrameRequested = false;

    CURRENT_QUEUE = NEXT_QUEUE;
    NEXT_QUEUE = [];

    inAnimationFrameRunner = true;
    while (CURRENT_QUEUE.length > 0) {
      CURRENT_QUEUE.sort(AnimationFrameQueueItem.sort);
      let top = CURRENT_QUEUE.shift()!;
      top.execute();
    }
    inAnimationFrameRunner = false;
  };

  scheduleAtNextAnimationFrame = (runner: () => void, priority: number = 0) => {
    let item = new AnimationFrameQueueItem(runner, priority);
    NEXT_QUEUE.push(item);

    if (!animFrameRequested) {
      animFrameRequested = true;
      doRequestAnimationFrame(animationFrameRunner);
    }

    return item;
  };

  runAtThisOrScheduleAtNextAnimationFrame = (runner: () => void, priority?: number) => {
    if (inAnimationFrameRunner) {
      let item = new AnimationFrameQueueItem(runner, priority);
      CURRENT_QUEUE!.push(item);
      return item;
    } else {
      return scheduleAtNextAnimationFrame(runner, priority);
    }
  };
})();

export function measure(callback: () => void): IDisposable {
  return scheduleAtNextAnimationFrame(callback, 10000 /* must be early */);
}

export function modify(callback: () => void): IDisposable {
  return scheduleAtNextAnimationFrame(callback, -10000 /* must be late */);
}
