import { Path } from '@fin/svg';
import { IConnector, ITopicViewNode } from '../topic';

export class Connector extends Path implements IConnector {
  constructor(public from: ITopicViewNode, public to: ITopicViewNode) {
    super();
  }

  mountTo(g: SVGGElement) {
    g.appendChild(this.node);
  }
}
