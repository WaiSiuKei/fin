import { Event } from '@fin/event';
import { KeyCode, Keybinding } from '@fin/keyboard';
import { ResolvedKeybinding } from './resolvedKeybinding';
import { IResolveResult } from './keybindingResolver';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem';

export interface IUserFriendlyKeybinding {
  key: string;
  command: string;
  args?: any;
  when?: string;
}

export enum KeybindingSource {
  Default = 1,
  User
}

export interface IKeybindingEvent {
  source: KeybindingSource;
  keybindings?: IUserFriendlyKeybinding[];
}

export interface IKeyboardEventLite {
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
  readonly keyCode: KeyCode;
  readonly code: string;
}

export interface IKeybindingService {
  onDidUpdateKeybindings: Event<IKeybindingEvent>;

  /**
   * Returns none, one or many (depending on keyboard layout)!
   */
  resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];

  resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding;

  resolveUserBinding(userBinding: string): ResolvedKeybinding[];

  /**
   * Resolve and dispatch `keyboardEvent`, but do not invoke the command or change inner state.
   */
  softDispatch(keyboardEvent: IKeyboardEventLite, target: HTMLElement): IResolveResult;

  /**
   * Look up keybindings for a command.
   * Use `lookupKeybinding` if you are interested in the preferred keybinding.
   */
  lookupKeybindings(commandId: string): ResolvedKeybinding[];

  /**
   * Look up the preferred (last defined) keybinding for a command.
   * @returns The preferred keybinding or null if the command is not bound.
   */
  lookupKeybinding(commandId: string): ResolvedKeybinding;

  getDefaultKeybindingsContent(): string;

  getDefaultKeybindings(): ResolvedKeybindingItem[];

  getKeybindings(): ResolvedKeybindingItem[];
}
