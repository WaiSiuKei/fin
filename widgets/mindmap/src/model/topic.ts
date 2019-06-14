import { ITopicNode } from '../topic';

export class Topic implements ITopicNode {
  static IdCounter = 1;

  id: number;
  parent: Topic;
  children: Topic[] = [];

  constructor() {
    this.id = Topic.IdCounter++;
  }

  get isRoot() {
    return !this.parent;
  }

  get tier(): number {
    let p = this.parent;
    let counter = 0;
    while (p) {
      counter++;
      p = p.parent;
    }
    return counter;
  }

  add(topic: Topic) {
    this.children.push(topic);
    topic.parent = this;
  }

  remove(topic: Topic) {
    let idx = this.children.indexOf(topic);
    if (idx > -1) {
      this.children.splice(idx, 1);
    }
  }
}
