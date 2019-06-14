import { createSVGNode, createNode } from '@fin/svg';
import { IConnector, ITopicNode, ITopicViewNode } from '../topic';
import { Connector } from './connector';
import { ILayout } from '../layout';
import { TopicViewNode } from './topicView';
import { Emitter } from '@fin/event';
import { Disposable } from '@fin/disposable';
import { findIndex } from '@fin/arrays';

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

export class LayoutView extends Disposable {
  public viewContainer: ViewContainer;

  public viewNodes: Map<ITopicNode, ITopicViewNode> = new Map<ITopicNode, ITopicViewNode>();
  connectors: Map<ITopicViewNode, IConnector[]> = new Map<ITopicViewNode, IConnector[]>();

  private _onTopicFocus = new Emitter<ITopicViewNode>();
  get onTopicFocus() {return this._onTopicFocus.event;}

  private _onTopicBlur = new Emitter<ITopicViewNode>();
  get onTopicBlur() { return this._onTopicBlur.event; }

  selection: ITopicViewNode;
  rootNode: ITopicViewNode;

  constructor(container: HTMLElement, public layoutAlgo: ILayout) {
    super();
    this.viewContainer = new ViewContainer(container);

    this._register(this._onTopicBlur);
    this._register(this._onTopicFocus);
  }

  handleNodeAdded(mutatedTopic: ITopicNode) {
    let viewNode = new TopicViewNode(mutatedTopic);
    this.viewNodes.set(mutatedTopic, viewNode);
    this.viewContainer.addNode(viewNode);

    viewNode.onResize.connect(this.handleNodeResize, this);
    viewNode.onFocus.connect(this.handleNodeFocus, this);
    viewNode.onBlur.connect(this.handleNodeBlur, this);

    if (mutatedTopic.parent) {
      let parent = this.viewNodes.get(mutatedTopic.parent);
      viewNode.parent = parent;
      parent.children.push(viewNode);

      let connector = new Connector(viewNode.parent, viewNode);
      let connectors = (this.connectors.get(viewNode.parent) || []);
      connectors.push(connector);
      this.connectors.set(viewNode.parent, connectors);
      this.viewContainer.addConnector(connector);
    } else {
      this.rootNode = viewNode;
    }

    this.refreshLayout(viewNode);
  }

  refreshLayout(viewNode: ITopicViewNode) {
    let positionMutated = this.layoutAlgo.layout(viewNode);
    let connectorsToLayout: IConnector[] = [];
    for (let n of positionMutated) {
      connectorsToLayout.push(...(this.connectors.get(n) || []));
    }
    this.layoutAlgo.layoutConnectors(Array.from(new Set(connectorsToLayout)));
  }

  handleNodeResize(viewNode: ITopicViewNode) {
    this.refreshLayout(viewNode);
  }

  handleNodeFocus(viewNode: ITopicViewNode) {
    this.selection = viewNode;
    this._onTopicFocus.fire();
  }

  handleNodeBlur(viewNode: ITopicViewNode) {
    this.selection = null;
    this._onTopicBlur.fire();
  }

  handleNodeRemoved(mutatedTopic: ITopicNode) {
    let mutated = [];
    let nodes = [mutatedTopic];
    let current;

    let viewNode = this.viewNodes.get(mutatedTopic);

    while (current = nodes.pop()) {
      let currentViewNode = this.viewNodes.get(current);
      let connectors = this.connectors.get(currentViewNode);
      currentViewNode.dispose();
      mutated.push(currentViewNode);
      if (connectors && connectors.length) {
        connectors.forEach(c => c.dispose());
        this.connectors.delete(currentViewNode);
      }
      this.viewNodes.delete(current);
      nodes.push(...current.children);
    }

    this.layoutAlgo.clear(viewNode);
    if (viewNode.parent) {
      let connectors = this.connectors.get(viewNode.parent);
      let idx = findIndex(connectors, c => c.to === viewNode);
      if (idx > -1) {
        connectors[idx].dispose();
        connectors.splice(idx, 1);
      }
      viewNode.parent.remove(viewNode);
      this.refreshLayout(viewNode.parent);
      this.focus(viewNode.parent.topicNode);
    }
    viewNode.dispose();
  }

  focus(node: ITopicNode) {
    if (this.selection) {
      this.selection.blur();
    }
    let viewNode = this.viewNodes.get(node);
    if (viewNode) {
      viewNode.focus();
    }
  }

  blur() {
    if (this.selection) {
      this.selection.blur();
    }
  }
}

