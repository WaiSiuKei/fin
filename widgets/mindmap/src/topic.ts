import { IVector } from '@fin/geometry';
import { Align, Justify } from './common';
import { PathCommand } from '@fin/svg';

export interface ITopicNode {
  isRoot: boolean
  tier: number
  parent: ITopicNode;
  children: ITopicNode[]
}

export interface ITopicViewNode {
  tier: number
  parent: ITopicViewNode
  children: ITopicViewNode[]

  origin: IVector
  transform: IVector;
  align: Align;
  justify: Justify
  getWidth(): number
  getHeight(): number
  translate(x: number, y: number, origin?: IVector): void
  mountTo(node: SVGGElement): void
}

export interface IConnector {
  from: ITopicViewNode
  to: ITopicViewNode

  clear(): this;
  push(command: PathCommand | string, ...args: number[]): this;
  moveTo(x: number, y: number): this;
  moveBy(dx: number, dy: number): this;
  lineTo(x: number, y: number): this;
  lineBy(dx: number, dy: number): this;
  arcTo(rx: number, ry: number, xr: number, laf: number, sf: number, x: number, y: number): this;
  arcBy(rx: number, ry: number, xr: number, laf: number, sf: number, dx: number, dy: number): this;
  carcTo(r: number, laf: number, sf: number, x: number, y: number): this;
  carcBy(r: number, laf: number, sf: number, dx: number, dy: number): this;
  bezierTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this;
  bezierBy(dx1: number, dy1: number, dx2: number, dy2: number, dx: number, dy: number): this;
  close(): this;
  done(): this;
}
