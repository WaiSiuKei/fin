import { IInlineItems } from '../common';

class InlineItalic implements IInlineItems {
  constructor(private text: string = '') {
  }

  get contentIfFocus(): string {
    return this.text;
  }

  update(input: string): void {
    this.text = input;
  }

  get contentIfBlur(): string {
    return `<em${this.text}</em>`;
  }
}
