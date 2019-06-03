import { ISize } from './def';
import { isZero } from '@fin/numerical';

export class Size {
  private _width: number;
  private _height: number;

  constructor(size: ISize) {
    this._width = size.width;
    this._height = size.height;
  }

  get width() {return this._width;}
  get height() {return this._height;}

  equals(size: ISize): boolean {return Size.equals(this, size);}
  clone() {return new Size({ width: this._width, height: this._height });}

  isZero() {return Size.isZero(this);}
  isNaN() {return Size.isNaN(this);}

  round() {return new Size(Size.round(this));}
  ceil() { return new Size(Size.ceil(this));}
  floor() { return new Size(Size.floor(this));}
  abs() { return new Size(Size.abs(this));}

  static equals(s1: ISize, size: ISize): boolean {
    return s1 === size || (s1.width === size.width && s1.height === size.height);
  }

  static isZero(size: ISize): boolean {
    return isZero(size.width) && isZero(size.height);
  }

  static isNaN(size: ISize): boolean {
    return isNaN(size.width) || isNaN(size.height);
  }

  static round(size: ISize): ISize {
    return { width: Math.round(size.width), height: Math.round(size.height) };
  }
  static ceil(size: ISize): ISize {
    return { width: Math.ceil(size.width), height: Math.ceil(size.height) };
  }
  static floor(size: ISize): ISize {
    return { width: Math.floor(size.width), height: Math.floor(size.height) };
  }
  static abs(size: ISize): ISize {
    return { width: Math.abs(size.width), height: Math.abs(size.height) };
  }
}
