import { IInlineItems } from '../common';

export abstract class AbstractInlineItem implements IInlineItems {
  node: HTMLElement;

  constructor(protected text: string = '') {
  }

  abstract update(): void

  focus(): void {
    this.node.innerText = this.text;
  }

  abstract blur(): void

  abstract get content(): string

  setCaretToStart() {
    if (!this.text) {
      // 不能选择内容为空的元素，先放个BOM
      this.node.innerText = String.fromCharCode(0xFEFF);
    }

    const range = document.createRange();
    let selection = document.getSelection();

    // this.node.focus();

    range.setStart(this.node, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    range.detach(); // optimization
  }

  setCaretToEnd() {
    if (!this.text) {
      // 不能选择内容为空的元素，先放个BOM
      this.node.innerText = String.fromCharCode(0xFEFF);
    }

    let selection = window.getSelection();
    selection.collapse(this.node);

    const range = document.createRange();

    range.setStart(this.node, this.text.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    range.detach(); // optimization
  }
}
