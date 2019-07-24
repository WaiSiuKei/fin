import { Disposable, IDisposable } from '@fin/disposable';
import { IViewLayout, Viewport } from '../viewModel/viewModel';
import { IConfiguration } from '../common';
import { Scrollable } from '@fin/scrollbar';
import { IPartialViewLinesViewportData } from './viewLinesViewportData';
import { LinesLayout } from './linesLayout';

export class ViewLayout extends Disposable implements IViewLayout {

  private readonly _configuration: IConfiguration;
  private readonly _linesLayout: LinesLayout;

  public readonly scrollable: Scrollable;

  constructor(configuration: IConfiguration, lineCount: number, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this._configuration = configuration;
    this._linesLayout = new LinesLayout(lineCount, this._configuration.editor.lineHeight);

    this.scrollable = this._register(new Scrollable(0, scheduleAtNextAnimationFrame));
    this._configureSmoothScrollDuration();

    this.scrollable.setScrollDimensions({
      width: configuration.editor.layoutInfo.contentWidth,
      height: configuration.editor.layoutInfo.contentHeight
    });

    this._updateHeight();
  }

  private _configureSmoothScrollDuration(): void {
    this.scrollable.setSmoothScrollDuration(0);
  }

  private _updateHeight(): void {
    this.scrollable.setScrollDimensions({
      scrollHeight: this._getTotalHeight()
    });
  }

  private _getTotalHeight(): number {
    const scrollDimensions = this.scrollable.getScrollDimensions();

    // let result = this._linesLayout.getLinesTotalHeight();
    // if (this._configuration.editor.viewInfo.scrollBeyondLastLine) {
    //   result += scrollDimensions.height - this._configuration.editor.lineHeight;
    // } else {
    //   result += this._getHorizontalScrollbarHeight(scrollDimensions);
    // }
    //
    // return Math.max(scrollDimensions.height, result);
    return scrollDimensions.height;
  }

  public getLinesViewportData(): IPartialViewLinesViewportData {
    const visibleBox = this.getCurrentViewport();
    return this._linesLayout.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
  }

  public getCurrentViewport(): Viewport {
    const scrollDimensions = this.scrollable.getScrollDimensions();
    const currentScrollPosition = this.scrollable.getCurrentScrollPosition();
    return new Viewport(
      currentScrollPosition.scrollTop,
      currentScrollPosition.scrollLeft,
      scrollDimensions.width,
      scrollDimensions.height
    );
  }
}
