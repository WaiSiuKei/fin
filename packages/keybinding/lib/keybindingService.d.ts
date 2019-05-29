import { Disposable } from '@fin/disposable';
import { Event, Emitter } from '@fin/event';
import { IContextKeyService } from '@fin/contextkey';
import { ICommandService } from '@fin/command';
import { IResolveResult, KeybindingResolver } from './keybindingResolver';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem';
import { IKeybindingEvent, IKeybindingService, IKeyboardEventLite } from './keybinding';
import { Keybinding } from '@fin/keyboard';
import { ResolvedKeybinding } from './resolvedKeybinding';
export declare class KeybindingService extends Disposable implements IKeybindingService {
    private _currentChord;
    private _currentChordChecker;
    private _currentChordStatusMessage;
    protected _onDidUpdateKeybindings: Emitter<IKeybindingEvent>;
    private _contextKeyService;
    protected _commandService: ICommandService;
    private _keyboardMapper;
    private _cachedResolver;
    private _firstTimeComputingResolver;
    constructor(windowElement: Window, contextKeyService: IContextKeyService, commandService: ICommandService);
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
