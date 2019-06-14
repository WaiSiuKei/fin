import { Emitter } from '@fin/event';
import { ITopicNode } from '../topic';
import { Disposable } from '@fin/disposable';

export class LayoutModel extends Disposable {
  private _onTopicAdded: Emitter<ITopicNode> = new Emitter<ITopicNode>();
  get onTopicAdded() { return this._onTopicAdded.event; }
  private _onTopicRemoved: Emitter<ITopicNode> = new Emitter<ITopicNode>();
  get onTopicRemoved() { return this._onTopicRemoved.event; }

  private topics = new Set<ITopicNode>();

  constructor(public rootTopic?: ITopicNode) {
    super();
    this._register(this._onTopicAdded);
    this._register(this._onTopicRemoved);
    this._register({
      dispose: () => {
        this.topics.clear();
      }
    });
  }

  addTopic(topic: ITopicNode, refTopic?: ITopicNode) {
    if (this.topics.has(topic)) throw new Error('duplicate topic');
    this.topics.add(topic);
    if (!refTopic) {
      this.rootTopic = topic;
    } else {
      refTopic.add(topic);
    }
    this._onTopicAdded.fire(topic);
  }

  removeTopic(topic: ITopicNode) {
    if (!this.topics.has(topic)) throw new Error('unknown topic');
    if (!topic.isRoot) {
      topic.parent.remove(topic);
    }
    this._onTopicRemoved.fire(topic);
  }
}
