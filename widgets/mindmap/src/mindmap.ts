import { IDimension } from './common';
import { Topic } from './core/topic';
import { createSVGNode, createNode } from '@fin/svg';
import { Connector } from './core/connector';
import { Slot } from './core/slot';
import { ILayout } from './layout';
import { MindmapLayout } from './layout/mindmap';

export interface IMindmapOption {
  layout: ILayout
}

export class Mindmap {
  private dimension: IDimension;
  private paper: SVGElement;
  private topicLayer: SVGGElement;
  private connectorLayer: SVGGElement;

  rootTopic: Topic;
  connectors: Connector[] = [];
  slots: Slot[] = [];

  layoutAlgo: ILayout;

  constructor(private container: HTMLElement, option?: IMindmapOption) {
    const { width, height } = this.container.getBoundingClientRect();
    this.dimension = { width, height };
    this.paper = createSVGNode();
    this.paper.appendChild(this.connectorLayer = (createNode('g')) as SVGGElement);
    this.paper.appendChild(this.topicLayer = (createNode('g')) as SVGGElement);
    this.paper.setAttribute('width', '100%');
    this.paper.setAttribute('height', '100%');
    container.appendChild(this.paper);

    if (!option) {
      this.layoutAlgo = new MindmapLayout();
    }
  }

  addTopic(topic: Topic, refTopic?: Topic): void {
    if (this.rootTopic && !refTopic) throw new Error('!rootTopic');
    topic.mountTo(this.topicLayer);

    if (!this.rootTopic && !refTopic) {
      this.rootTopic = topic;
    } else {
      refTopic.add(topic);

      let connector = new Connector(refTopic, topic);
      connector.mountTo(this.connectorLayer);
      this.connectors.push(connector);
      if (!refTopic.isRoot) {
        let slot = new Slot(refTopic);
        this.slots.push(slot);
        slot.mountTo(this.connectorLayer);
      }
    }
    this.layout();
  }

  layout() {
    this.layoutAlgo.layout(this.rootTopic);
    // this.rootTopic.translate(0, 0, { x: this.dimension.width / 2, y: this.dimension.height / 2 });
    // this.connectors.forEach(c => c.render());
    // this.slots.forEach(s => s.render());
  }
}
