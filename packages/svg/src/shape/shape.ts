export class Shape {
  node: SVGElement;
  constructor(tagName) {
    this.node = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
