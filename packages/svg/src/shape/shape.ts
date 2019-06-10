export class Shape {
  node: SVGElement;
  constructor(tagName: string) {
    this.node = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }

  translate(x: number, y: number) {
    this.node.setAttribute('transform', `translate(${x},${y})`);
  }
}
