import { HorizontalRange } from '../core/range';

export interface IViewLines {
  // linesVisibleRangesForRange(range: Range, includeNewLines: boolean): LineVisibleRanges[];
  // visibleRangesForRange2(range: Range): HorizontalRange[];
}

export class LineVisibleRanges {
  _lineVisibleRangesBrand: void;

  public lineNumber: number;
  public ranges: HorizontalRange[];

  constructor(lineNumber: number, ranges: HorizontalRange[]) {
    this.lineNumber = lineNumber;
    this.ranges = ranges;
  }
}
