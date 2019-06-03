import { isIE } from '@fin/platform';
import { CharCode } from '@fin/charcode';

interface IDomClassList {
  hasClass(node: HTMLElement, className: string): boolean;
  addClass(node: HTMLElement, className: string): void;
  addClasses(node: HTMLElement, ...classNames: string[]): void;
  removeClass(node: HTMLElement, className: string): void;
  removeClasses(node: HTMLElement, ...classNames: string[]): void;
  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void;
}

const _manualClassList = new class implements IDomClassList {

  private _lastStart: number;
  private _lastEnd: number;

  private _findClassName(node: HTMLElement, className: string): void {

    let classes = node.className;
    if (!classes) {
      this._lastStart = -1;
      return;
    }

    className = className.trim();

    let classesLen = classes.length,
      classLen = className.length;

    if (classLen === 0) {
      this._lastStart = -1;
      return;
    }

    if (classesLen < classLen) {
      this._lastStart = -1;
      return;
    }

    if (classes === className) {
      this._lastStart = 0;
      this._lastEnd = classesLen;
      return;
    }

    let idx = -1,
      idxEnd: number;

    while ((idx = classes.indexOf(className, idx + 1)) >= 0) {

      idxEnd = idx + classLen;

      // a class that is followed by another class
      if ((idx === 0 || classes.charCodeAt(idx - 1) === CharCode.Space) && classes.charCodeAt(idxEnd) === CharCode.Space) {
        this._lastStart = idx;
        this._lastEnd = idxEnd + 1;
        return;
      }

      // last class
      if (idx > 0 && classes.charCodeAt(idx - 1) === CharCode.Space && idxEnd === classesLen) {
        this._lastStart = idx - 1;
        this._lastEnd = idxEnd;
        return;
      }

      // equal - duplicate of cmp above
      if (idx === 0 && idxEnd === classesLen) {
        this._lastStart = 0;
        this._lastEnd = idxEnd;
        return;
      }
    }

    this._lastStart = -1;
  }

  hasClass(node: HTMLElement, className: string): boolean {
    this._findClassName(node, className);
    return this._lastStart !== -1;
  }

  addClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }

  addClass(node: HTMLElement, className: string): void {
    if (!node.className) { // doesn't have it for sure
      node.className = className;
    } else {
      this._findClassName(node, className); // see if it's already there
      if (this._lastStart === -1) {
        node.className = node.className + ' ' + className;
      }
    }
  }

  removeClass(node: HTMLElement, className: string): void {
    this._findClassName(node, className);
    if (this._lastStart === -1) {
      return; // Prevent styles invalidation if not necessary
    } else {
      node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd);
    }
  }

  removeClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }

  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void {
    this._findClassName(node, className);
    if (this._lastStart !== -1 && (shouldHaveIt === undefined || !shouldHaveIt)) {
      this.removeClass(node, className);
    }
    if (this._lastStart === -1 && (shouldHaveIt === undefined || shouldHaveIt)) {
      this.addClass(node, className);
    }
  }
};

const _nativeClassList = new class implements IDomClassList {
  hasClass(node: HTMLElement, className: string): boolean {
    return Boolean(className) && node.classList && node.classList.contains(className);
  }

  addClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }

  addClass(node: HTMLElement, className: string): void {
    if (className && node.classList) {
      node.classList.add(className);
    }
  }

  removeClass(node: HTMLElement, className: string): void {
    if (className && node.classList) {
      node.classList.remove(className);
    }
  }

  removeClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }

  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void {
    if (node.classList) {
      node.classList.toggle(className, shouldHaveIt);
    }
  }
};

// In IE11 there is only partial support for `classList` which makes us keep our
// custom implementation. Otherwise use the native implementation, see: http://caniuse.com/#search=classlist
const _classList: IDomClassList = isIE ? _manualClassList : _nativeClassList;
export const hasClass: (node: HTMLElement, className: string) => boolean = _classList.hasClass.bind(_classList);
export const addClass: (node: HTMLElement, className: string) => void = _classList.addClass.bind(_classList);
export const addClasses: (node: HTMLElement, ...classNames: string[]) => void = _classList.addClasses.bind(_classList);
export const removeClass: (node: HTMLElement, className: string) => void = _classList.removeClass.bind(_classList);
export const removeClasses: (node: HTMLElement, ...classNames: string[]) => void = _classList.removeClasses.bind(_classList);
export const toggleClass: (node: HTMLElement, className: string, shouldHaveIt?: boolean) => void = _classList.toggleClass.bind(_classList);
