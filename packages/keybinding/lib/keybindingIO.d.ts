import { ScanCodeBinding } from '@fin/keyboard';
import { OperatingSystem } from '@fin/platform';
import { ContextKeyExpr } from '@fin/contextkey';
import { Keybinding, SimpleKeybinding } from '@fin/keyboard';
import { ResolvedKeybindingItem } from './resolvedKeybindingItem';
import { IUserFriendlyKeybinding } from './keybinding';
export interface IUserKeybindingItem {
    firstPart: SimpleKeybinding | ScanCodeBinding;
    chordPart: SimpleKeybinding | ScanCodeBinding;
    command: string;
    commandArgs?: any;
    when: ContextKeyExpr;
}
export declare class KeybindingIO {
    static writeKeybindingItem(out: OutputBuilder, item: ResolvedKeybindingItem, OS: OperatingSystem): void;
    static readUserKeybindingItem(input: IUserFriendlyKeybinding, OS: OperatingSystem): IUserKeybindingItem;
    private static _readModifiers;
    private static _readSimpleKeybinding;
    static readKeybinding(input: string, OS: OperatingSystem): Keybinding;
    private static _readSimpleUserBinding;
    static _readUserBinding(input: string): [SimpleKeybinding | ScanCodeBinding, SimpleKeybinding | ScanCodeBinding];
}
export declare class OutputBuilder {
    private _lines;
    private _currentLine;
    write(str: string): void;
    writeLine(str?: string): void;
    toString(): string;
}
