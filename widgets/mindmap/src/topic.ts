export interface ITopicNode {
  isRoot: boolean
  tier: number
  parent: ITopicNode;
  children: ITopicNode[]
}
