export enum MoveToCommand {
  M = 'M',
  m = 'm'
}

export enum LineToCommand {
  L = 'L',
  l = 'l'
}

export enum CubicBezierCurveCommand {
  C = 'C',
  c = 'c',
  S = 'S',
  s = 's'
}

export enum QuadraticBezierCurveCommand {
  Q = 'Q',
  q = 'q',
  T = 'T',
  t = 't'
}

export enum EllipticalArcCurveCommand {
  A = 'A',
  a = 'a'
}

export enum ClosePathCommand {
  Z = 'Z',
  z = 'z'
}

export type PathCommand = MoveToCommand | LineToCommand | CubicBezierCurveCommand | QuadraticBezierCurveCommand | EllipticalArcCurveCommand | ClosePathCommand
