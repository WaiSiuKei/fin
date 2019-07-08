import { ICoordinatesConverter, IViewModel, ViewLineRenderingData } from './viewModel';
import { ITextModel } from '../model/model';
import { IConfiguration } from '../common';
import { Disposable, IDisposable } from '@fin/disposable';
import { ViewLayout } from '../viewLayout/viewLayout';
import { IdentityLinesCollection, IViewModelLinesCollection } from './splitLinesCollection';
import { Range } from '../core/range';

export class ViewModel extends Disposable implements IViewModel {

  private readonly editorId: number;
  private readonly configuration: IConfiguration;
  private readonly model: ITextModel;
  public readonly coordinatesConverter: ICoordinatesConverter;
  private readonly lines: IViewModelLinesCollection;
  public readonly viewLayout: ViewLayout;

  constructor(editorId: number, configuration: IConfiguration, model: ITextModel, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this.editorId = editorId;
    this.configuration = configuration;
    this.model = model;

    this.lines = new IdentityLinesCollection(this.model);
    this.coordinatesConverter = this.lines.createCoordinatesConverter();

    this.viewLayout = this._register(new ViewLayout(this.configuration, 0, scheduleAtNextAnimationFrame));
  }

  public getLineCount(): number {
    return this.lines.getViewLineCount();
  }

  public getLineMinColumn(lineNumber: number): number {
    return this.lines.getViewLineMinColumn(lineNumber);
  }

  public getLineMaxColumn(lineNumber: number): number {
    return this.lines.getViewLineMaxColumn(lineNumber);
  }

  public getViewLineRenderingData(visibleRange: Range, lineNumber: number): ViewLineRenderingData {
    // let mightContainRTL = this.model.mightContainRTL();
    // let mightContainNonBasicASCII = this.model.mightContainNonBasicASCII();
    let mightContainRTL = false;
    let mightContainNonBasicASCII = false;
    let lineData = this.lines.getViewLineData(lineNumber);

    return new ViewLineRenderingData(
      lineData.minColumn,
      lineData.maxColumn,
      lineData.content,
      mightContainRTL,
      mightContainNonBasicASCII,
    );
  }

  public dispose(): void {
    // First remove listeners, as disposing the lines might end up sending
    // model decoration changed events ... and we no longer care about them ...
    super.dispose();
  }
}
