import { Path } from './path';
import { MoveToCommand } from '../consts';
import { Rectangle, Vector } from '@fin/geometry';

//根据传递进来的width、height和radius属性，
//获取最适合的radius值
function formatRadius(width: number, height: number, radius: number): number {

  var minValue = Math.floor(Math.min(width / 2, height / 2));

  return Math.min(minValue, radius);
}

export class Rect extends Path {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;

  constructor(width = 0, height = 0, x = 0, y = 0, radius = 0) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.radius = formatRadius(this.width, this.height, radius || 0);

    this.update();
  }

  update() {
    let { x, y, width: w, height: h, radius: r } = this;

    if (!r) {

      // 直角
      this.push(MoveToCommand.M, x, y);
      this.push('h', w);
      this.push('v', h);
      this.push('h', -w);
      this.push('z');

    } else {

      //圆角
      w -= 2 * r;
      h -= 2 * r;

      this.push('M', x + r, y);
      this.push('h', w);
      this.push('a', r, r, 0, 0, 1, r, r);
      this.push('v', h);
      this.push('a', r, r, 0, 0, 1, -r, r);
      this.push('h', -w);
      this.push('a', r, r, 0, 0, 1, -r, -r);
      this.push('v', -h);
      this.push('a', r, r, 0, 0, 1, r, -r);
      this.push('z');

    }

    this.done();

    return this;

  }

  setWidth(width) {
    this.width = width;

    return this.update();
  }


  setHeight(height) {
    this.height = height;

    return this.update();
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;

    return this.update();
  }

  setBox(box) {
    this.x = box.x;
    this.y = box.y;
    this.width = box.width;
    this.height = box.height;

    return this.update();
  }

  getBox(): Rectangle {
    return new Rectangle(this);
  }

  getRadius() {
    return this.radius;
  }

  setRadius(radius) {
    this.radius = formatRadius(this.width, this.height, radius || 0);
    return this.update();
  }

  getPosition() {
    return new Vector({ x: this.x, y: this.y });
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    return this.update();
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getPositionX() {
    return this.x;
  }

  getPositionY() {
    return this.y;
  }

  setPositionX(x) {
    this.x = x;
    return this.update();
  }

  setPositionY(y) {
    this.y = y;
    return this.update();
  }
}
