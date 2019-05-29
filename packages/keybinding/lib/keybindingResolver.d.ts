import { ContextKeyExpr } from '@fin/contextkey';
import { IContext } from '@fin/contextkey';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem';
export interface IResolveResult {
    enterChord: boolean;
    commandId: string;
    commandArgs: any;
    bubble: boolean;
}
export declare class KeybindingResolver {
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
