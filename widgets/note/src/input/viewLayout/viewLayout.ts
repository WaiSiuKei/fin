import { Disposable, IDisposable } from '@fin/disposable';
import { IViewLayout } from '../viewModel/viewModel';
import { IConfiguration } from '../common';

export class ViewLayout extends Disposable implements IViewLayout {

  private readonly _configuration: IConfiguration;
  // private readonly _linesLayout: LinesLayout;

  constructor(configuration: IConfiguration, lineCount: number, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this._configuration = configuration;
    // this._linesLayout = new LinesLayout(lineCount, this._configuration.editor.lineHeight);
  }
}
