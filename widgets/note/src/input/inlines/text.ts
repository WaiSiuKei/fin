import { IInlineItems } from '../common';

class InlinePlainText implements IInlineItems {
  constructor(private text: string = '') {
  }

  get contentIfFocus(): string {
    return this.text;
  }

  update(input: string): void {
    this.text = input;
  }

  get contentIfBlur(): string {
    return this.text;
  }
}
