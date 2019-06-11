import { IDimension } from './common';

export interface IMap {
  // getRootTopic(): ITopic
  addTopic(topic: ITopic, refTopic?: ITopic): void
  // removeTopic(topic: ITopic): void
}

export interface IConnector {

}

export interface ITopic {
  parent: ITopic
  getDimension(): IDimension
  translate(x: number, y: number): void
  // connectorToParent: IConnector
  // connectorsToChildren: IConnector[]
  //
  // addChild(topic: ITopic): void
  // removeChild(topic: ITopic): void
  //
  // getContent(): string
  // setContent(content: string): void
}
