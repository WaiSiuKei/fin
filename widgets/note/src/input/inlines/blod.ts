import { IInlineItems } from '../common';

class InlineBlod implements IInlineItems {
  constructor(private text: string = '') {
  }

  get contentIfFocus(): string {
    return `<strong>${this.text}</strong>`;
  }

  update(input: string): void {
    this.text = input;
  }

  get contentIfBlur(): string {
    return `<strong>${this.text}</strong>`;
  }
}
