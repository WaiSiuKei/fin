import { ViewEventHandler } from '../viewModel/viewEventHandler';
import { ViewContext } from './viewContext';

export abstract class ViewPart extends ViewEventHandler {

  _context: ViewContext;

  constructor(context: ViewContext) {
    super();
    this._context = context;
  }

  public dispose(): void {
    super.dispose();
  }

  public abstract prepareRender(ctx: RenderingContext): void;
  public abstract render(ctx: any): void;
}
