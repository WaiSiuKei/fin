import { ContextKeyExpr } from '@fin/contextkey';
import { ResolvedKeybinding } from './resolvedKeybinding';
export declare class ResolvedKeybindingItem {
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
