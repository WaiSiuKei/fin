import { IMatrix, IVector } from './def';
import { TRIGONOMETRIC_EPSILON, isZero } from '@fin/numerical';

export class Vector {
  private _x: number;
  private _y: number;
  private _angle: number;

  constructor(vt = { x: 0, y: 0 }) {
    this._x = vt.x || 0;
    this._y = vt.y || 0;
  }

  get x() {return this._x;}
  get y() {return this._y;}
  set x(val) {this._x = val;}
  set y(val) {this._y = val;}
  get length() {return Vector.euclideanMetric(this);}
  get angle() { return this.radian * 180 / Math.PI;}
  set angle(angle) {this.radian = angle * Math.PI / 180;}
  get radian() {return Vector.radian(this);}
  set radian(angle) {
    this._angle = angle;
    if (!this.isZero()) {
      let length = this.length;
      // Use #set() instead of direct assignment of x/y, so LinkedPoint
      // does not report changes twice.
      this._x = Math.cos(angle) * length;
      this._y = Math.sin(angle) * length;
    }
  }
  get quadrant() {return Vector.quadrant(this);}

  equals(point: Vector) {return Vector.equals(this, point);}
  clone() {return new Vector({ x: this._x, y: this._y });}
  directedAngleTo(point: Vector) {return Vector.directedAngleBetween(this, point);}
  directedRadianTo(point: Vector) {return Vector.directedRadianBetween(this, point);}
  distanceTo(point: Vector, squared = false) {return Vector.distanceBetween(this, point, squared);}

  normalize(length = 1) {return Vector.normalize(this, length);}
  rotate(radian: number, center: Vector) {return Vector.rotate(this, radian, center);}
  transform(mx: IMatrix) {return Vector.transform(this, mx);}

  add(point: Vector) {return new Vector(Vector.add(this, point));}
  subtract(point: Vector) {return new Vector(Vector.subtract(this, point));}
  multiply(point: Vector) {return new Vector(Vector.multiply(this, point));}
  divide(point: Vector) {return new Vector(Vector.divide(this, point));}
  modulo(point: Vector) {return new Vector(Vector.modulo(this, point));}
  negate() {return new Vector(Vector.negate(this));}

  isClose(point: Vector, tolerance: number) {return Vector.isClose(this, point, tolerance);}
  isCollinear(point: Vector) {return Vector.isCollinear(this, point);}
  isOrthogonal(point: Vector) {return Vector.isOrthogonal(this, point);}
  isZero() {return Vector.isZero(this);}
  isNaN() {return Vector.isNaN(this);}
  isInQuadrant(q: number) {return Vector.isInQuadrant(this, q);}

  dot(point: IVector) {return Vector.dot(this, point);}
  cross(point: Vector) {return Vector.cross(this, point);}
  project(point: Vector) {return new Vector(Vector.project(this, point));}

  round() {return new Vector(Vector.round(this));}
  ceil() {return new Vector(Vector.ceil(this));}
  floor() {return new Vector(Vector.floor(this));}
  abs() {return new Vector(Vector.abs(this));}

  static min(...args: IVector[]): IVector {
    return {
      x: Math.min.apply(Math, args.map(v => v.x)),
      y: Math.min.apply(Math, args.map(v => v.y))
    };

  }

  static max(...args: IVector[]): IVector {
    return {
      x: Math.max.apply(Math, args.map(v => v.x)),
      y: Math.max.apply(Math, args.map(v => v.y)),
    };
  }

  static midPoint(p1: IVector, p2: IVector): IVector {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }

  static random(): IVector {
    return { x: Math.random(), y: Math.random() };
  }

  static euclideanMetric(v: IVector) {
    return Math.sqrt(Vector.taxicabMetric(v));
  }

  static taxicabMetric(v: IVector) {
    return v.x * v.x + v.y * v.y;
  }

  static radian(v: IVector): number {
    return Math.atan2(v.y, v.x);
  }

  static angle(v: IVector): number {
    return Vector.radian(v) * 180 / Math.PI;
  }

  static quadrant(v: IVector): number {
    return v.x >= 0 ? v.y >= 0 ? 1 : 4 : v.y >= 0 ? 2 : 3;
  }

  static equals(v1: IVector, v2: IVector): boolean {
    return v1 === v2 || (v1.x === v2.x && v1.y === v2.y);
  }

  static directedAngleBetween(v1: IVector, v2: IVector): number {
    return Vector.directedRadianBetween(v1, v2) * 180 / Math.PI;
  }

  static directedRadianBetween(v1: IVector, v2: IVector): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }

  static distanceBetween(v1: IVector, v2: IVector, squared = false): number {
    let x = v1.x - v2.x;
    let y = v1.y - v2.y;
    let d = x * x + y * y;
    return squared ? d : Math.sqrt(d);
  }

  static normalize(v: IVector, length = 1): IVector {
    let current = Vector.euclideanMetric(v),
      scale = current !== 0 ? length / current : 0;
    return { x: v.x * scale, y: v.y * scale };
  }

  static rotate(v: IVector, radian: number, center?: IVector): IVector {
    if (radian === 0) return { ...v };
    let point = center ? Vector.subtract(v, center) : v,
      sin = Math.sin(radian),
      cos = Math.cos(radian);
    point = { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
    return center ? Vector.add(point, center) : point;
  }

  static transform(v: IVector, mx: IMatrix): IVector {
    return {
      x: v.x * mx.a + v.y * mx.c + mx.tx,
      y: v.x * mx.b + v.y * mx.d + mx.ty,
    };
  }

  static add(...vs: IVector[]): IVector {
    return vs.reduce((acc, v) => {
      return { x: acc.x + v.x, y: acc.y + v.y };
    }, { x: 0, y: 0 });
  }

  static subtract(v1: IVector, v2: IVector): IVector {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  static multiply(v: IVector, point: IVector): IVector
  static multiply(v: IVector, num: number): IVector
  static multiply(v: IVector, arg: any): IVector {
    if (typeof arg === 'number') return { x: v.x * arg, y: v.y * arg };
    return { x: v.x * arg.x, y: v.y * arg.y };
  }

  static divide(v: IVector, point: IVector): IVector {
    return { x: v.x / point.x, y: v.y / point.y };
  }

  static modulo(v: IVector, point: IVector): IVector {
    return { x: v.x % point.x, y: v.y % point.y };
  }

  static negate(v: IVector): IVector {
    return { x: -v.x, y: -v.y };
  }

  static isClose(v: IVector, point: IVector, tolerance: number): boolean {
    return Vector.distanceBetween(v, point) <= tolerance;
  }
  static isCollinear(v1: IVector, v2: IVector): boolean {
    // NOTE: We use normalized vectors so that the epsilon comparison is
    // reliable. We could instead scale the epsilon based on the vector
    // length. But instead of normalizing the vectors before calculating
    // the cross product, we can scale the epsilon accordingly.
    const { x: x1, y: y1 } = v1;
    const { x: x2, y: y2 } = v2;
    return Math.abs(x1 * y2 - y1 * x2) <= Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)) * TRIGONOMETRIC_EPSILON;
  }

  static isOrthogonal(v1: IVector, v2: IVector): boolean {
    // See Point.isCollinear()
    const { x: x1, y: y1 } = v1;
    const { x: x2, y: y2 } = v2;
    return Math.abs(x1 * x2 + y1 * y2) <= Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)) * TRIGONOMETRIC_EPSILON;
  }

  static isZero(v: IVector): boolean {
    return isZero(v.x) && isZero(v.y);
  }

  static isNaN(v: IVector): boolean {
    return isNaN(v.x) || isNaN(v.y);
  }

  static isInQuadrant(v: IVector, q: number): boolean {
    // Map quadrant to x & y coordinate pairs and multiply with coordinates,
    // then check sign:
    // 1: [ 1,  1]
    // 2: [-1,  1]
    // 3: [-1, -1]
    // 4: [ 1, -1]
    return v.x * (q > 1 && q < 4 ? -1 : 1) >= 0
      && v.y * (q > 2 ? -1 : 1) >= 0;
  }

  static dot(v: IVector, point: IVector): number {
    return v.x * point.x + v.y * point.y;
  }

  static cross(v: IVector, point: IVector): number {
    return v.x * point.y - v.y * point.x;
  }

  static project(v: IVector, point: IVector): IVector {
    let scale = Vector.isZero(point) ? 0 : Vector.dot(v, point) / Vector.dot(point, point);
    return { x: point.x * scale, y: point.y * scale };
  }

  static round(v: IVector): IVector {
    return { x: Math.round(v.x), y: Math.round(v.y) };
  }

  static ceil(v: IVector): IVector {
    return { x: Math.ceil(v.x), y: Math.ceil(v.y) };
  }

  static floor(v: IVector): IVector {
    return { x: Math.floor(v.x), y: Math.floor(v.y) };
  }

  static abs(v: IVector): IVector {
    return { x: Math.abs(v.x), y: Math.abs(v.y) };
  }
}
