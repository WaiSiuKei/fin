import { IConnector, ITopicViewNode } from './topic';

export interface ILayout {
  layout(node: ITopicViewNode): ITopicViewNode[]
  layoutConnectors(connector: IConnector[]): void
}
