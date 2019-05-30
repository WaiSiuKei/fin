import { Disposable, IDisposable } from '@fin/disposable';
import { Event, Emitter } from '@fin/event';
import { IntervalTimer } from '@fin/async';
import { IContextKeyService } from '@fin/contextkey';
import { ICommandService } from '@fin/command';
import { IResolveResult, KeybindingResolver } from './keybindingResolver';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem';
import { IKeybindingEvent, IKeybindingService, IKeyboardEventLite, IUserFriendlyKeybinding } from './keybinding';
import { Keybinding } from '@fin/keyboard';
import { addDisposableListener, EventType } from '@fin/dom';
import { StandardKeyboardEvent } from '@fin/keyboard';
import { OS } from '@fin/platform';
import { IKeyboardMapper, KeyboardMapperFactory } from './keyboardMapper';
import { IKeybindingItem, KeybindingsRegistry } from './keybindingsRegistry';
import { IUserKeybindingItem, KeybindingIO } from './keybindingIO';
import { ResolvedKeybinding } from './resolvedKeybinding';

interface CurrentChord {
  keypress: string;
  label: string;
}

export class KeybindingService extends Disposable implements IKeybindingService {
  private _currentChord: CurrentChord;
  private _currentChordChecker: IntervalTimer;
  private _currentChordStatusMessage: IDisposable;
  protected _onDidUpdateKeybindings: Emitter<IKeybindingEvent>;

  private _contextKeyService: IContextKeyService;
  protected _commandService: ICommandService;

  private _keyboardMapper: IKeyboardMapper;
  private _cachedResolver: KeybindingResolver;
  private _firstTimeComputingResolver: boolean;

  constructor(
    windowElement: Window,
    contextKeyService: IContextKeyService,
    commandService: ICommandService,
    private keybindingsRegistry: KeybindingsRegistry,
  ) {
    super();
    this._contextKeyService = contextKeyService;
    this._commandService = commandService;

    this._currentChord = null;
    this._currentChordChecker = new IntervalTimer();
    this._currentChordStatusMessage = null;
    this._onDidUpdateKeybindings = this._register(new Emitter<IKeybindingEvent>());

    this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper();
    this._cachedResolver = null;
    this._firstTimeComputingResolver = true;

    this._register(addDisposableListener(windowElement, EventType.KEY_DOWN, (e: KeyboardEvent) => {
      let keyEvent = new StandardKeyboardEvent(e);
      let shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
      if (shouldPreventDefault) {
        keyEvent.preventDefault();
      }
    }));
  }

  public dispose(): void {
    super.dispose();
  }

  get onDidUpdateKeybindings(): Event<IKeybindingEvent> {
    return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : Event.None; // Sinon stubbing walks properties on prototype
  }

  private _safeGetConfig(): IUserFriendlyKeybinding[] {
    return [];
  }

  protected _getResolver(): KeybindingResolver {
    if (!this._cachedResolver) {
      const defaults = this._resolveKeybindingItems(this.keybindingsRegistry.getDefaultKeybindings(), true);
      const overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
      this._cachedResolver = new KeybindingResolver(defaults, overrides);
      this._firstTimeComputingResolver = false;
    }
    return this._cachedResolver;
  }

  protected _documentHasFocus(): boolean {
    return document.hasFocus();
  }

  private _resolveKeybindingItems(items: IKeybindingItem[], isDefault: boolean): ResolvedKeybindingItem[] {
    let result: ResolvedKeybindingItem[] = [], resultLen = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const when = (item.when ? item.when.normalize() : null);
      const keybinding = item.keybinding;
      if (!keybinding) {
        // This might be a removal keybinding item in user settings => accept it
        result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
      } else {
        const resolvedKeybindings = this.resolveKeybinding(keybinding);
        for (let j = 0; j < resolvedKeybindings.length; j++) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
        }
      }
    }

    return result;
  }

  private _resolveUserKeybindingItems(items: IUserKeybindingItem[], isDefault: boolean): ResolvedKeybindingItem[] {
    let result: ResolvedKeybindingItem[] = [], resultLen = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const when = (item.when ? item.when.normalize() : null);
      const firstPart = item.firstPart;
      const chordPart = item.chordPart;
      if (!firstPart) {
        // This might be a removal keybinding item in user settings => accept it
        result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
      } else {
        const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
        for (let j = 0; j < resolvedKeybindings.length; j++) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
        }
      }
    }

    return result;
  }

  private _getExtraKeybindings(isFirstTime: boolean): IUserKeybindingItem[] {
    let extraUserKeybindings: IUserFriendlyKeybinding[] = this._safeGetConfig();
    return extraUserKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k));
  }

  public resolveKeybinding(kb: Keybinding): ResolvedKeybinding[] {
    return this._keyboardMapper.resolveKeybinding(kb);
  }

  public resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding {
    return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
  }

  public resolveUserBinding(userBinding: string): ResolvedKeybinding[] {
    const [firstPart, chordPart] = KeybindingIO._readUserBinding(userBinding);
    return this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
  }

  public getDefaultKeybindingsContent(): string {
    return '';
  }

  public getDefaultKeybindings(): ResolvedKeybindingItem[] {
    return this._getResolver().getDefaultKeybindings();
  }

  public getKeybindings(): ResolvedKeybindingItem[] {
    return this._getResolver().getKeybindings();
  }

  public customKeybindingsCount(): number {
    return 0;
  }

  public lookupKeybindings(commandId: string): ResolvedKeybinding[] {
    return this._getResolver().lookupKeybindings(commandId).map(item => item.resolvedKeybinding);
  }

  public lookupKeybinding(commandId: string): ResolvedKeybinding {
    let result = this._getResolver().lookupPrimaryKeybinding(commandId);
    if (!result) {
      return null;
    }
    return result.resolvedKeybinding;
  }

  public softDispatch(e: IKeyboardEventLite, target: HTMLElement): IResolveResult {
    const keybinding = this.resolveKeyboardEvent(e);
    if (keybinding.isChord()) {
      console.warn('Unexpected keyboard event mapped to a chord');
      return null;
    }
    const [firstPart,] = keybinding.getDispatchParts();
    if (firstPart === null) {
      // cannot be dispatched, probably only modifier keys
      return null;
    }

    const contextValue = this._contextKeyService.getContext(target);
    const currentChord = this._currentChord ? this._currentChord.keypress : null;
    return this._getResolver().resolve(contextValue, currentChord, firstPart);
  }

  private _enterChordMode(firstPart: string, keypressLabel: string): void {
    this._currentChord = {
      keypress: firstPart,
      label: keypressLabel
    };

    console.log('(%s) was pressed. Waiting for second key of chord...', keypressLabel);

    const chordEnterTime = Date.now();
    this._currentChordChecker.cancelAndSet(() => {

      if (!this._documentHasFocus()) {
        // Focus has been lost => leave chord mode
        this._leaveChordMode();
        return;
      }

      if (Date.now() - chordEnterTime > 5000) {
        // 5 seconds elapsed => leave chord mode
        this._leaveChordMode();
      }

    }, 500);
  }

  private _leaveChordMode(): void {
    if (this._currentChordStatusMessage) {
      this._currentChordStatusMessage.dispose();
      this._currentChordStatusMessage = null;
    }
    this._currentChordChecker.cancel();
    this._currentChord = null;
  }

  protected _dispatch(e: IKeyboardEventLite, target: HTMLElement): boolean {
    let shouldPreventDefault = false;

    const keybinding = this.resolveKeyboardEvent(e);
    if (keybinding.isChord()) {
      console.warn('Unexpected keyboard event mapped to a chord');
      return null;
    }
    const [firstPart,] = keybinding.getDispatchParts();
    if (firstPart === null) {
      // cannot be dispatched, probably only modifier keys
      return shouldPreventDefault;
    }

    const contextValue = this._contextKeyService.getContext(target);
    const currentChord = this._currentChord ? this._currentChord.keypress : null;
    const keypressLabel = keybinding.getLabel();
    const resolveResult = this._getResolver().resolve(contextValue, currentChord, firstPart);

    if (resolveResult && resolveResult.enterChord) {
      shouldPreventDefault = true;
      this._enterChordMode(firstPart, keypressLabel);
      return shouldPreventDefault;
    }

    if (this._currentChord) {
      if (!resolveResult || !resolveResult.commandId) {
        console.warn('The key combination (%s, %s) is not a command.', this._currentChord.label, keypressLabel);
        shouldPreventDefault = true;
      }
    }

    this._leaveChordMode();

    if (resolveResult && resolveResult.commandId) {
      if (!resolveResult.bubble) {
        shouldPreventDefault = true;
      }
      this._commandService.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(undefined, err => {
        console.error(err);
      });
    }

    return shouldPreventDefault;
  }
}
