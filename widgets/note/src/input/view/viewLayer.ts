import { FastDomNode, createFastDomNode } from '@fin/dom';
import { ViewportData } from '../viewLayout/viewLinesViewportData';

export interface ILine {
  // onContentChanged(): void;
}

export interface IVisibleLine extends ILine {
  getDomNode(): HTMLElement;
  setDomNode(domNode: HTMLElement): void;

  /**
   * Return null if the HTML should not be touched.
   * Return the new HTML otherwise.
   */
  renderLine(lineNumber: number, deltaTop: number, viewportData: ViewportData, sb: IStringBuilder): boolean;

  /**
   * Layout the line.
   */
  layoutLine(lineNumber: number, deltaTop: number): void;
}

export class RenderedLinesCollection<T extends ILine> {
  private readonly _createLine: () => T;
  private _lines: T[];
  private _rendLineNumberStart: number;

  constructor(createLine: () => T) {
    this._createLine = createLine;
    this._set(1, []);
  }

  public flush(): void {
    this._set(1, []);
  }

  _set(rendLineNumberStart: number, lines: T[]): void {
    this._lines = lines;
    this._rendLineNumberStart = rendLineNumberStart;
  }

  _get(): { rendLineNumberStart: number; lines: T[]; } {
    return {
      rendLineNumberStart: this._rendLineNumberStart,
      lines: this._lines
    };
  }

  /**
   * @returns Inclusive line number that is inside this collection
   */
  public getStartLineNumber(): number {
    return this._rendLineNumberStart;
  }

  /**
   * @returns Inclusive line number that is inside this collection
   */
  public getEndLineNumber(): number {
    return this._rendLineNumberStart + this._lines.length - 1;
  }

  public getCount(): number {
    return this._lines.length;
  }

  public getLine(lineNumber: number): T {
    let lineIndex = lineNumber - this._rendLineNumberStart;
    if (lineIndex < 0 || lineIndex >= this._lines.length) {
      throw new Error('Illegal value for lineNumber: ' + lineNumber);
    }
    return this._lines[lineIndex];
  }

  /**
   * @returns Lines that were removed from this collection
   */
  public onLinesDeleted(deleteFromLineNumber: number, deleteToLineNumber: number): T[] {
    if (this.getCount() === 0) {
      // no lines
      return null;
    }

    let startLineNumber = this.getStartLineNumber();
    let endLineNumber = this.getEndLineNumber();

    if (deleteToLineNumber < startLineNumber) {
      // deleting above the viewport
      let deleteCnt = deleteToLineNumber - deleteFromLineNumber + 1;
      this._rendLineNumberStart -= deleteCnt;
      return null;
    }

    if (deleteFromLineNumber > endLineNumber) {
      // deleted below the viewport
      return null;
    }

    // Record what needs to be deleted
    let deleteStartIndex = 0;
    let deleteCount = 0;
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      let lineIndex = lineNumber - this._rendLineNumberStart;

      if (deleteFromLineNumber <= lineNumber && lineNumber <= deleteToLineNumber) {
        // this is a line to be deleted
        if (deleteCount === 0) {
          // this is the first line to be deleted
          deleteStartIndex = lineIndex;
          deleteCount = 1;
        } else {
          deleteCount++;
        }
      }
    }

    // Adjust this._rendLineNumberStart for lines deleted above
    if (deleteFromLineNumber < startLineNumber) {
      // Something was deleted above
      let deleteAboveCount = 0;

      if (deleteToLineNumber < startLineNumber) {
        // the entire deleted lines are above
        deleteAboveCount = deleteToLineNumber - deleteFromLineNumber + 1;
      } else {
        deleteAboveCount = startLineNumber - deleteFromLineNumber;
      }

      this._rendLineNumberStart -= deleteAboveCount;
    }

    let deleted = this._lines.splice(deleteStartIndex, deleteCount);
    return deleted;
  }

  public onLinesChanged(changeFromLineNumber: number, changeToLineNumber: number): boolean {
    if (this.getCount() === 0) {
      // no lines
      return false;
    }

    let startLineNumber = this.getStartLineNumber();
    let endLineNumber = this.getEndLineNumber();

    let someoneNotified = false;

    for (let changedLineNumber = changeFromLineNumber; changedLineNumber <= changeToLineNumber; changedLineNumber++) {
      if (changedLineNumber >= startLineNumber && changedLineNumber <= endLineNumber) {
        // Notify the line
        this._lines[changedLineNumber - this._rendLineNumberStart].onContentChanged();
        someoneNotified = true;
      }
    }

    return someoneNotified;
  }

  public onLinesInserted(insertFromLineNumber: number, insertToLineNumber: number): T[] {
    if (this.getCount() === 0) {
      // no lines
      return null;
    }

    let insertCnt = insertToLineNumber - insertFromLineNumber + 1;
    let startLineNumber = this.getStartLineNumber();
    let endLineNumber = this.getEndLineNumber();

    if (insertFromLineNumber <= startLineNumber) {
      // inserting above the viewport
      this._rendLineNumberStart += insertCnt;
      return null;
    }

    if (insertFromLineNumber > endLineNumber) {
      // inserting below the viewport
      return null;
    }

    if (insertCnt + insertFromLineNumber > endLineNumber) {
      // insert inside the viewport in such a way that all remaining lines are pushed outside
      let deleted = this._lines.splice(insertFromLineNumber - this._rendLineNumberStart, endLineNumber - insertFromLineNumber + 1);
      return deleted;
    }

    // insert inside the viewport, push out some lines, but not all remaining lines
    let newLines: T[] = [];
    for (let i = 0; i < insertCnt; i++) {
      newLines[i] = this._createLine();
    }
    let insertIndex = insertFromLineNumber - this._rendLineNumberStart;
    let beforeLines = this._lines.slice(0, insertIndex);
    let afterLines = this._lines.slice(insertIndex, this._lines.length - insertCnt);
    let deletedLines = this._lines.slice(this._lines.length - insertCnt, this._lines.length);

    this._lines = beforeLines.concat(newLines).concat(afterLines);

    return deletedLines;
  }
}

export interface IVisibleLinesHost<T extends IVisibleLine> {
  createVisibleLine(): T;
}

export class VisibleLinesCollection<T extends IVisibleLine> {

  private readonly _host: IVisibleLinesHost<T>;
  public readonly domNode: FastDomNode<HTMLElement>;
  private readonly _linesCollection: RenderedLinesCollection<T>;

  constructor(host: IVisibleLinesHost<T>) {
    this._host = host;
    this.domNode = this._createDomNode();
    this._linesCollection = new RenderedLinesCollection<T>(() => this._host.createVisibleLine());
  }

  private _createDomNode(): FastDomNode<HTMLElement> {
    let domNode = createFastDomNode(document.createElement('div'));
    domNode.setClassName('view-layer');
    domNode.setPosition('absolute');
    domNode.domNode.setAttribute('role', 'presentation');
    domNode.domNode.setAttribute('aria-hidden', 'true');
    return domNode;
  }

  // ---- begin view event handlers

  public onFlushed(e: viewEvents.ViewFlushedEvent): boolean {
    this._linesCollection.flush();
    // No need to clear the dom node because a full .innerHTML will occur in ViewLayerRenderer._render
    return true;
  }

  public onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean {
    return this._linesCollection.onLinesChanged(e.fromLineNumber, e.toLineNumber);
  }

  public onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean {
    let deleted = this._linesCollection.onLinesDeleted(e.fromLineNumber, e.toLineNumber);
    if (deleted) {
      // Remove from DOM
      for (let i = 0, len = deleted.length; i < len; i++) {
        let lineDomNode = deleted[i].getDomNode();
        if (lineDomNode) {
          this.domNode.domNode.removeChild(lineDomNode);
        }
      }
    }

    return true;
  }

  public onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean {
    let deleted = this._linesCollection.onLinesInserted(e.fromLineNumber, e.toLineNumber);
    if (deleted) {
      // Remove from DOM
      for (let i = 0, len = deleted.length; i < len; i++) {
        let lineDomNode = deleted[i].getDomNode();
        if (lineDomNode) {
          this.domNode.domNode.removeChild(lineDomNode);
        }
      }
    }

    return true;
  }

  // ---- end view event handlers

  public getStartLineNumber(): number {
    return this._linesCollection.getStartLineNumber();
  }

  public getEndLineNumber(): number {
    return this._linesCollection.getEndLineNumber();
  }

  public getVisibleLine(lineNumber: number): T {
    return this._linesCollection.getLine(lineNumber);
  }

  public renderLines(viewportData: ViewportData): void {

    let inp = this._linesCollection._get();

    let renderer = new ViewLayerRenderer<T>(this.domNode.domNode, this._host, viewportData);

    let ctx: IRendererContext<T> = {
      rendLineNumberStart: inp.rendLineNumberStart,
      lines: inp.lines,
      linesLength: inp.lines.length
    };

    // Decide if this render will do a single update (single large .innerHTML) or many updates (inserting/removing dom nodes)
    let resCtx = renderer.render(ctx, viewportData.startLineNumber, viewportData.endLineNumber, viewportData.relativeVerticalOffset);

    this._linesCollection._set(resCtx.rendLineNumberStart, resCtx.lines);
  }
}
