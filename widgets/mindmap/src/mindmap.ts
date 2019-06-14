import { ILayout } from './layout';
import { Disposable } from '@fin/disposable';
import { LayoutModel } from './model/layoutModel';
import { LayoutView } from './view/layoutView';
import { MindmapLayout } from './layout/mindmap';
import { Topic } from './model/topic';
import { KeybindingService, KeybindingsRegistry } from '@fin/keybinding';
import { KeyCode, KeyMod } from '@fin/keyboard';
import { ContextKeyService, IContextKey } from '@fin/contextkey';
import { CommandService, CommandsRegistry } from '@fin/command';
import { MapContextKeys } from './contextKeys';
import { ITopicNode } from './topic';

export interface IMindmapOption {
  layout: ILayout
}

export class Mindmap extends Disposable {
  layoutModel: LayoutModel;
  layoutView: LayoutView;
  context: MapContext;

  constructor(private container: HTMLElement, option?: IMindmapOption) {
    super();
    this.layoutModel = new LayoutModel();
    this.layoutView = new LayoutView(container, new MindmapLayout(container.getBoundingClientRect()));
    this._register(this.layoutView);
    this._register(this.layoutModel);
    this._register(this.layoutModel.onTopicAdded((topic) => this.layoutView.handleNodeAdded(topic)));
    this._register(this.layoutModel.onTopicRemoved((topic) => this.layoutView.handleNodeRemoved(topic)));
    this._registerKeybingingHandler();
  }

  addTopic(topic: ITopicNode, refTopic?: ITopicNode): void {
    this.layoutModel.addTopic(topic, refTopic);
  }

  _registerKeybingingHandler() {
    const commandsRegistry = new CommandsRegistry();
    const keybindingsRegistry = new KeybindingsRegistry(commandsRegistry);
    const contextKeyService = new ContextKeyService();

    this.context = new MapContext(this.layoutView, contextKeyService);
    this._register(this.context);

    keybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'addChildTopic',
      weight: 100,
      when: MapContextKeys.hadTopicFocus,
      primary: KeyCode.Tab,
      handler: () => {
        let viewNode = this.layoutView.selection;
        let newTopic = new Topic();
        this.addTopic(newTopic, viewNode.topicNode);
        this.layoutView.focus(newTopic);
      }
    });

    keybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'addSiblingTopic',
      weight: 100,
      when: MapContextKeys.hadTopicFocus,
      primary: KeyCode.Enter,
      handler: () => {
        let viewNode = this.layoutView.selection;
        if (!viewNode.topicNode.isRoot) {
          let newTopic = new Topic();
          this.addTopic(newTopic, viewNode.topicNode.parent);
          this.layoutView.focus(newTopic);
        }
      }
    });

    keybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'removeTopic',
      weight: 100,
      when: MapContextKeys.hadTopicFocus,
      primary: KeyCode.Delete | KeyMod.Shift,
      secondary: [KeyCode.Backspace],
      handler: () => {
        let viewNode = this.layoutView.selection;
        if (!viewNode.topicNode.isRoot) {
          this.layoutModel.removeTopic(viewNode.topicNode);
        }
      }
    });

    keybindingsRegistry.registerCommandAndKeybindingRule({
      id: 'blurTopic',
      weight: 100,
      when: MapContextKeys.hadTopicFocus,
      primary: KeyCode.Escape,
      handler: () => {
        this.layoutView.blur();
      }
    });

    const keyBindingService = new KeybindingService(window, contextKeyService, new CommandService(commandsRegistry), keybindingsRegistry);
  }
}

export class MapContext extends Disposable {
  private readonly _hasTopicFocus: IContextKey<boolean>;
  constructor(private view: LayoutView, private contextKeyService: ContextKeyService) {
    super();

    this._hasTopicFocus = MapContextKeys.hadTopicFocus.bindTo(this.contextKeyService);

    this._register(this.view.onTopicFocus(this.updateFromSelection, this));
    this._register(this.view.onTopicBlur(this.updateFromSelection, this));
  }

  updateFromSelection() {
    if (this.view.selection) {
      this._hasTopicFocus.set(true);
    } else {
      this._hasTopicFocus.set(false);
    }
  }
}
