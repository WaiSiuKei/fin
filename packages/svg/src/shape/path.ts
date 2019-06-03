import { isString, isArray } from '@fin/types';
import { ClosePathCommand, LineToCommand, MoveToCommand, PathCommand, CubicBezierCurveCommand, EllipticalArcCurveCommand } from '../consts';
import { Shape } from './shape';

const slice = Array.prototype.slice;

interface PathSegment extends Array<PathCommand | number> {
  0: PathCommand
}

function pathToString(pathSegment: PathSegment | PathSegment[] | string): string {
  if (isString(pathSegment)) return pathSegment as string;
  if (!isArray(pathSegment)) {
    pathSegment = [pathSegment];
  }
  return (<PathSegment[]>pathSegment).join(',').replace(/,?([achlmqrstvxz]),?/gi, '$1');
}

export class Path extends Shape {
  pathdata: string; // 'M0,0'
  constructor(data: string = '') {
    super('path');
    if (data) {
      this.setPathData(data);
    }
  }

  setPathData(data: PathSegment | string = 'M0,0') {
    this.pathdata = pathToString(data);

    this.node.setAttribute('d', this.pathdata);

    // fixme
    // this.trigger('shapeupdate', {
    //   type: 'pathdata'
    // });

    return this;
  }

  getPathData() {
    return this.pathdata || '';
  }

  clear() {
    this.setPathData('M 0 0');
    return this;
  }

  push(command: PathCommand | string, ...args: number[]) {
    var segment = slice.call(arguments);
    var originData = this.getPathData();

    originData = originData || '';
    this.setPathData(originData + pathToString(segment));
    return this;
  }

  moveTo(x: number, y: number) {
    return this.push(MoveToCommand.M, ...arguments);
  }

  moveBy(dx: number, dy: number) {
    return this.push(MoveToCommand.m, ...arguments);
  }

  lineTo(x: number, y: number) {
    return this.push(LineToCommand.L, ...arguments);
  }

  lineBy(dx: number, dy: number) {
    return this.push(LineToCommand.l, ...arguments);
  }

  arcTo(rx: number, ry: number, xr: number, laf: number, sf: number, x: number, y: number) {
    return this.push(EllipticalArcCurveCommand.A, ...arguments);
  }

  arcBy(rx: number, ry: number, xr: number, laf: number, sf: number, dx: number, dy: number) {
    return this.push(EllipticalArcCurveCommand.a, ...arguments);
  }

  carcTo(r: number, laf: number, sf: number, x: number, y: number) {
    return this.push(EllipticalArcCurveCommand.A, r, r, 0, ...slice.call(arguments, 1));
  }

  carcBy(r: number, laf: number, sf: number, dx: number, dy: number) {
    return this.push(EllipticalArcCurveCommand.a, r, r, 0, ...slice.call(arguments, 1));
  }

  bezierTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    return this.push(CubicBezierCurveCommand.C, ...arguments);
  }

  bezierBy(dx1: number, dy1: number, dx2: number, dy2: number, dx: number, dy: number) {
    return this.push(CubicBezierCurveCommand.c, ...arguments);
  }

  close() {
    return this.push(ClosePathCommand.z);
  }

  done() {
    return this;
  }
}

