export interface IStandardWindow {
  scrollX: number;
  scrollY: number;
}

export const StandardWindow: IStandardWindow = new class {
  get scrollX(): number {
    if (typeof window.scrollX === 'number') {
      // modern browsers
      return window.scrollX;
    } else {
      return document.body.scrollLeft + document.documentElement.scrollLeft;
    }
  }

  get scrollY(): number {
    if (typeof window.scrollY === 'number') {
      // modern browsers
      return window.scrollY;
    } else {
      return document.body.scrollTop + document.documentElement.scrollTop;
    }
  }
};

export interface IDomNodePagePosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getDomNodePagePosition(domNode: HTMLElement): IDomNodePagePosition {
  let bb = domNode.getBoundingClientRect();
  return {
    left: bb.left + StandardWindow.scrollX,
    top: bb.top + StandardWindow.scrollY,
    width: bb.width,
    height: bb.height
  };
}
