/**
 * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
 */
import { OperatingSystem } from '@fin/platform';
import { Keybinding, SimpleKeybinding } from '@fin/keyboard';
import { ResolvedKeybinding, ResolvedKeybindingPart } from 'resolvedKeybinding';
export declare class USLayoutResolvedKeybinding extends ResolvedKeybinding {
    private readonly _os;
    private readonly _firstPart;
    private readonly _chordPart;
    constructor(actual: Keybinding, OS: OperatingSystem);
    private _keyCodeToUILabel;
    private _getUILabelForKeybinding;
    getLabel(): string;
    private _getAriaLabelForKeybinding;
    getAriaLabel(): string;
    private _keyCodeToElectronAccelerator;
    private _getUserSettingsLabelForKeybinding;
    getUserSettingsLabel(): string;
    isWYSIWYG(): boolean;
    isChord(): boolean;
    getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
    private _toResolvedKeybindingPart;
    getDispatchParts(): [string, string];
    static getDispatchStr(keybinding: SimpleKeybinding): string;
}
