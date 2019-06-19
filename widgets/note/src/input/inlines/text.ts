import { AbstractInlineItem } from './abstractInlineItem';

export class InlinePlainText extends AbstractInlineItem {
  constructor(text: string) {
    super(text);
    this.node = document.createElement('span');
    this.node.innerText = this.text;
  }

  get content(): string {
    return this.text;
  }

  update() {
    if (this.node.innerText.startsWith(String.fromCharCode(0xFEFF))) {
      this.text = this.node.innerText.substr(1);
      this.node.innerText = this.text;
      this.setCaretToEnd();
    } else {
      this.text = this.node.innerText;
    }
    console.log(this.text);
  }

  blur(): void {
    this.node.innerText = this.text;
  }
}
