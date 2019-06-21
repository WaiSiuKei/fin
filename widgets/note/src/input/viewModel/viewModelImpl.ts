import { ICoordinatesConverter, IViewModel } from './viewModel';
import { ITextModel } from '../model/model';
import { IConfiguration } from '../common';
import { Disposable, IDisposable } from '@fin/disposable';
import { ViewLayout } from '../viewLayout/viewLayout';

export class ViewModel extends Disposable implements IViewModel {

  private readonly editorId: number;
  private readonly configuration: IConfiguration;
  private readonly model: ITextModel;
  public readonly viewLayout: ViewLayout;

  constructor(editorId: number, configuration: IConfiguration, model: ITextModel, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this.editorId = editorId;
    this.configuration = configuration;
    this.model = model;

    this.viewLayout = this._register(new ViewLayout(this.configuration, 0, scheduleAtNextAnimationFrame));
  }

  public dispose(): void {
    // First remove listeners, as disposing the lines might end up sending
    // model decoration changed events ... and we no longer care about them ...
    super.dispose();
  }
}
