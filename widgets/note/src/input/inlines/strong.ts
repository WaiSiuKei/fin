import { AbstractInlineItem } from './abstractInlineItem';

export class InlineStrong extends AbstractInlineItem {
  constructor(text: string) {
    super(text);
    this.node = document.createElement('strong');
    this.node.innerText = this.text;
  }

  get content(): string {
    let len = this.text.length;
    return this.text.substr(2, len - 4);
  }

  update() {
    this.text = this.node.innerText;
  }

  blur(): void {
    this.node.innerHTML = this.content;
  }
}
