export interface ISheetOption {
  rootTopicId: string,
  rootTopicName: string
}

export interface ISheet {
  getRootTopic(): ITopic
  addRelationship(): void
}

export interface ITopicOption {
  sheet: ISheet
  parent: ITopic
}

export interface ITopic {
  sheet: ISheet
  parent: ITopic

  addChild(opt: ITopicOption): void
  removeChild(topic: ITopic): void
  isAncestorOf(targetTopic: ITopic): boolean
  moveTo(targetTopic: ITopic): void

  getContent(): string
  setContent(content: string): void
}
