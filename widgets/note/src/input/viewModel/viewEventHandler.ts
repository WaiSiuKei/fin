import { Disposable } from '@fin/disposable';

export class ViewEventHandler extends Disposable {

  private _shouldRender: boolean;

  constructor() {
    super();
    this._shouldRender = true;
  }

  public shouldRender(): boolean {
    return this._shouldRender;
  }

  public forceShouldRender(): void {
    this._shouldRender = true;
  }

  protected setShouldRender(): void {
    this._shouldRender = true;
  }

  public onDidRender(): void {
    this._shouldRender = false;
  }
}
