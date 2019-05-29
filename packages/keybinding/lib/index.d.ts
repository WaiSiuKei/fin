import { CommandsRegistry, ICommandHandler, ICommandService } from '@fin/command';
import { ContextKeyExpr, IContext, IContextKeyService } from '@fin/contextkey';
import { Disposable } from '@fin/disposable';
import { Emitter, Event } from '@fin/event';
import { KeyCode, Keybinding } from '@fin/keyboard';

export interface IKeybindingItem {
	keybinding: Keybinding;
	command: string;
	commandArgs?: any;
	when: ContextKeyExpr;
	weight1: number;
	weight2: number;
}
export interface IKeybindings {
	primary: number;
	secondary?: number[];
	win?: {
		primary: number;
		secondary?: number[];
	};
	linux?: {
		primary: number;
		secondary?: number[];
	};
	mac?: {
		primary: number;
		secondary?: number[];
	};
}
export interface IKeybindingRule extends IKeybindings {
	id: string;
	weight: number;
	when: ContextKeyExpr;
}
export interface IKeybindingsRegistry {
	registerKeybindingRule(rule: IKeybindingRule): void;
	getDefaultKeybindings(): IKeybindingItem[];
	registerCommandAndKeybindingRule(desc: ICommandAndKeybindingRule): void;
}
export interface ICommandAndKeybindingRule extends IKeybindingRule {
	handler: ICommandHandler;
}
export declare class KeybindingsRegistry implements IKeybindingsRegistry {
	private _commandsRegistry;
	private _keybindings;
	private _keybindingsSorted;
	constructor(_commandsRegistry: CommandsRegistry);
	/**
	 * Take current platform into account and reduce to primary & secondary.
	 */
	private static bindToCurrentPlatform;
	registerKeybindingRule(rule: IKeybindingRule): void;
	registerCommandAndKeybindingRule(desc: ICommandAndKeybindingRule): void;
	private static _mightProduceChar;
	private _assertNoCtrlAlt;
	private _registerDefaultKeybinding;
	getDefaultKeybindings(): IKeybindingItem[];
}
declare class ResolvedKeybindingPart {
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
	readonly metaKey: boolean;
	readonly keyLabel: string;
	readonly keyAriaLabel: string;
	constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, kbLabel: string, kbAriaLabel: string);
}
declare abstract class ResolvedKeybinding {
	/**
	 * This prints the binding in a format suitable for displaying in the UI.
	 */
	abstract getLabel(): string;
	/**
	 * This prints the binding in a format suitable for ARIA.
	 */
	abstract getAriaLabel(): string;
	/**
	 * This prints the binding in a format suitable for user settings.
	 */
	abstract getUserSettingsLabel(): string;
	/**
	 * Is the user settings label reflecting the label?
	 */
	abstract isWYSIWYG(): boolean;
	/**
	 * Is the binding a chord?
	 */
	abstract isChord(): boolean;
	/**
	 * Returns the firstPart, chordPart that should be used for dispatching.
	 */
	abstract getDispatchParts(): [string, string];
	/**
	 * Returns the firstPart, chordPart of the keybinding.
	 * For simple keybindings, the second element will be null.
	 */
	abstract getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
}
declare class ResolvedKeybindingItem {
	_resolvedKeybindingItemBrand: void;
	readonly resolvedKeybinding: ResolvedKeybinding;
	readonly keypressFirstPart: string;
	readonly keypressChordPart: string;
	readonly bubble: boolean;
	readonly command: string;
	readonly commandArgs: any;
	readonly when: ContextKeyExpr;
	readonly isDefault: boolean;
	constructor(resolvedKeybinding: ResolvedKeybinding, command: string, commandArgs: any, when: ContextKeyExpr, isDefault: boolean);
}
export interface IResolveResult {
	enterChord: boolean;
	commandId: string;
	commandArgs: any;
	bubble: boolean;
}
declare class KeybindingResolver {
	private readonly _defaultKeybindings;
	private readonly _keybindings;
	private readonly _defaultBoundCommands;
	private readonly _map;
	private readonly _lookupMap;
	constructor(defaultKeybindings: ResolvedKeybindingItem[], overrides: ResolvedKeybindingItem[]);
	private static _isTargetedForRemoval;
	/**
	 * Looks for rules containing -command in `overrides` and removes them directly from `defaults`.
	 */
	static combine(defaults: ResolvedKeybindingItem[], rawOverrides: ResolvedKeybindingItem[]): ResolvedKeybindingItem[];
	private _addKeyPress;
	private _addToLookupMap;
	private _removeFromLookupMap;
	/**
	 * Returns true if it is provable `a` implies `b`.
	 * **Precondition**: Assumes `a` and `b` are normalized!
	 */
	static whenIsEntirelyIncluded(a: ContextKeyExpr, b: ContextKeyExpr): boolean;
	getDefaultBoundCommands(): Map<string, boolean>;
	getDefaultKeybindings(): ResolvedKeybindingItem[];
	getKeybindings(): ResolvedKeybindingItem[];
	lookupKeybindings(commandId: string): ResolvedKeybindingItem[];
	lookupPrimaryKeybinding(commandId: string): ResolvedKeybindingItem;
	resolve(context: IContext, currentChord: string, keypress: string): IResolveResult;
	private _findCommand;
	static contextMatchesRules(context: IContext, rules: ContextKeyExpr): boolean;
}
export interface IUserFriendlyKeybinding {
	key: string;
	command: string;
	args?: any;
	when?: string;
}
declare enum KeybindingSource {
	Default = 1,
	User = 2
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
	customKeybindingsCount(): number;
}
export declare class KeybindingService extends Disposable implements IKeybindingService {
	private keybindingsRegistry;
	private _currentChord;
	private _currentChordChecker;
	private _currentChordStatusMessage;
	protected _onDidUpdateKeybindings: Emitter<IKeybindingEvent>;
	private _contextKeyService;
	protected _commandService: ICommandService;
	private _keyboardMapper;
	private _cachedResolver;
	private _firstTimeComputingResolver;
	constructor(windowElement: Window, contextKeyService: IContextKeyService, commandService: ICommandService, keybindingsRegistry: KeybindingsRegistry);
	dispose(): void;
	readonly onDidUpdateKeybindings: Event<IKeybindingEvent>;
	private _safeGetConfig;
	protected _getResolver(): KeybindingResolver;
	protected _documentHasFocus(): boolean;
	private _resolveKeybindingItems;
	private _resolveUserKeybindingItems;
	private _getExtraKeybindings;
	resolveKeybinding(kb: Keybinding): ResolvedKeybinding[];
	resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding;
	resolveUserBinding(userBinding: string): ResolvedKeybinding[];
	getDefaultKeybindingsContent(): string;
	getDefaultKeybindings(): ResolvedKeybindingItem[];
	getKeybindings(): ResolvedKeybindingItem[];
	customKeybindingsCount(): number;
	lookupKeybindings(commandId: string): ResolvedKeybinding[];
	lookupKeybinding(commandId: string): ResolvedKeybinding;
	softDispatch(e: IKeyboardEventLite, target: HTMLElement): IResolveResult;
	private _enterChordMode;
	private _leaveChordMode;
	protected _dispatch(e: IKeyboardEventLite, target: HTMLElement): boolean;
}

export {};
