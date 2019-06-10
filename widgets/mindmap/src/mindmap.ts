import { IMap, ITopic } from './model';
import { IDimension } from './common';
import { Paper, Shape } from '@fin/svg';
import { Topic } from './topic';

export class Mindmap implements IMap {
  private dimension: IDimension;
  private paper: Paper;

  rootTopic: Topic;

  constructor(private container: HTMLElement) {
    const { width, height } = this.container.getBoundingClientRect();
    this.dimension = { width, height };
    this.paper = new Paper(container);
  }

  addTopic(topic: Topic, refTopic?: Topic): void {
    if (this.rootTopic && !refTopic) throw new Error('!rootTopic');
    if (!this.rootTopic && !refTopic) {
      this.rootTopic = topic;
    }
    this.paper.addShape(topic);
    this.layout(topic);
  }

  layout(topic: ITopic) {
    if (!topic.parent) { // rootTopic
      topic.translate(this.dimension.width / 2 - topic.getWidth() / 2, this.dimension.height / 2 - topic.getHeight() / 2);
    } else {

    }
  }
}
