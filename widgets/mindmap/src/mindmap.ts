import { Topic, TopicViewNode } from './core/topic';
import { createSVGNode, createNode } from '@fin/svg';
import { Connector } from './core/connector';
import { ILayout } from './layout';
import { MindmapLayout } from './layout/mindmap';
import { IConnector, ITopicNode, ITopicViewNode } from './topic';
import { Emitter } from '@fin/event';
import { Disposable } from '@fin/disposable';
import { pseudoRandomBytes } from 'crypto';

export interface IMindmapOption {
  layout: ILayout
}

export class ViewContainer {
  public paper: SVGElement;
  public nodeLayer: SVGGElement;
  public connectorLayer: SVGGElement;

  constructor(private container: HTMLElement) {
    this.paper = createSVGNode();
    this.paper.appendChild(this.connectorLayer = (createNode('g')) as SVGGElement);
    this.paper.appendChild(this.nodeLayer = (createNode('g')) as SVGGElement);
    this.paper.setAttribute('width', '100%');
    this.paper.setAttribute('height', '100%');
    container.appendChild(this.paper);
  }

  addNode(node: ITopicViewNode) {
    node.mountTo(this.nodeLayer);
  }

  addConnector(connector: Connector) {
    connector.mountTo(this.connectorLayer);
  }
}

export class LayoutView {
  public viewContainer: ViewContainer;

  public viewNodes: Map<ITopicNode, ITopicViewNode> = new Map<ITopicNode, ITopicViewNode>();
  connectors: Map<ITopicViewNode, IConnector[]> = new Map<ITopicViewNode, IConnector[]>();

  constructor(container: HTMLElement, public layoutAlgo: ILayout) {
    this.viewContainer = new ViewContainer(container);
  }

  handleNodeAdded(mutatedTopic: ITopicNode) {
    let viewNode = new TopicViewNode(mutatedTopic);
    this.viewNodes.set(mutatedTopic, viewNode);

    this.viewContainer.addNode(viewNode);

    if (mutatedTopic.parent) {
      let parent = this.viewNodes.get(mutatedTopic.parent);
      viewNode.parent = parent;
      parent.children.push(viewNode);

      let connector = new Connector(viewNode.parent, viewNode);
      let connectors = (this.connectors.get(viewNode.parent) || []);
      connectors.push(connector);
      this.connectors.set(viewNode.parent, connectors);
      this.viewContainer.addConnector(connector);
    }

    let sizeMutated = this.layoutAlgo.measure(viewNode);
    let positionMutated = this.layoutAlgo.layout(viewNode); // fixme: layout(mutated)
    let connectorsToLayout: IConnector[] = [];
    for (let n of positionMutated) {
      connectorsToLayout.push(...(this.connectors.get(n) || []));
    }
    this.layoutAlgo.layoutConnectors(Array.from(new Set(connectorsToLayout)));
  }

  handleNodeRemoved(mutatedTopic: ITopicNode) {

  }
}

export class LayoutModel extends Disposable {
  private _onTopicAdded: Emitter<ITopicNode> = new Emitter<ITopicNode>();
  get onTopicAdded() { return this._onTopicAdded.event; }

  constructor(public rootTopic?: ITopicNode) {
    super();
    this._register(this._onTopicAdded);
  }

  addTopic(topic: Topic, refTopic?: Topic) {
    if (!refTopic) {
      this.rootTopic = topic;
    } else {
      refTopic.add(topic);
    }
    this._onTopicAdded.fire(topic);
  }
}

export class Mindmap extends Disposable {
  layoutModel: LayoutModel;
  layoutView: LayoutView;

  constructor(private container: HTMLElement, option?: IMindmapOption) {
    super();
    this.layoutModel = new LayoutModel();
    this.layoutView = new LayoutView(container, new MindmapLayout(container.getBoundingClientRect()));
    this._register(this.layoutModel);
    this._register(this.layoutModel.onTopicAdded((topic) => this.layoutView.handleNodeAdded(topic)));
  }

  addTopic(topic: Topic, refTopic?: Topic): void {
    this.layoutModel.addTopic(topic, refTopic);
  }
}
