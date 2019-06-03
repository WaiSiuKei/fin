export interface IMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

export interface IMatrixDecomposition {
  translation: IVector;
  rotation: number;
  scaling: IVector;
  skewing: IVector;
}

export interface IVector {
  x: number;
  y: number;
}

export interface ILine {
  px: number;
  py: number;
  vx: number;
  vy: number;
}

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ISize {
  width: number;
  height: number;
}
