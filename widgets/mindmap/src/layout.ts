import { IConnector, ITopicViewNode } from './topic';

export interface ILayout {
  // getDeepHeight(node: ITopicViewNode): void
  // getDeepWidth(node: ITopicViewNode): void
  layout(node: ITopicViewNode): ITopicViewNode[] // size mutated
  measure(of: ITopicViewNode): ITopicViewNode[] // position mutated
  layoutConnectors(connector: IConnector[]): void
}
