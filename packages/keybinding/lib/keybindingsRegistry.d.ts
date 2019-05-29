import { ContextKeyExpr } from '@fin/contextkey';
import { Keybinding } from '@fin/keyboard';
import { CommandsRegistry, ICommandHandler } from '@fin/command';
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
