import { getHorizionalSpacingToParent, IDimension } from './common';
import { Paper, Shape } from '@fin/svg';
import { Topic } from './topic';

export class Mindmap {
  private dimension: IDimension;
  private paper: Paper;

  rootTopic: Topic;

  constructor(private container: HTMLElement) {
    const { width, height } = this.container.getBoundingClientRect();
    this.dimension = { width, height };
    this.paper = new Paper(container);
    this.container.style.position = 'relative';
  }

  addTopic(topic: Topic, refTopic?: Topic): void {
    if (this.rootTopic && !refTopic) throw new Error('!rootTopic');
    if (!this.rootTopic && !refTopic) {
      this.rootTopic = topic;
      topic.mountTo(this.container);
    } else {
      refTopic.add(topic);
      refTopic.childrenContainer.mountTo(this.container);
      // add connector
    }
    this.layout(topic);

  }

  layout(topic: Topic) {
    if (topic.parent) {
      topic.parent.refresh();
    } else {
      topic.translate(0, 0, { x: this.dimension.width / 2, y: this.dimension.height / 2 });

    }
  }
}
