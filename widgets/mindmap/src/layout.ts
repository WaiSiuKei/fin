import { ITopicNode } from './topic';

export interface ILayout {
  layout(rootNode: ITopicNode): void
  getDeepHeight(node: ITopicNode): void
  getDeepWidth(node: ITopicNode): void
}
