import { KeyCode, IKeyboardEvent, Keybinding, SimpleKeybinding, ScanCode, ScanCodeBinding } from '@fin/keyboard';
import { ResolvedKeybinding, ResolvedKeybindingPart } from './resolvedKeybinding';
import { IKeyboardMapper } from './keyboardMapper';
export interface IWindowsKeyMapping {
    vkey: string;
    value: string;
}
export interface IWindowsKeyboardMapping {
    [scanCode: string]: IWindowsKeyMapping;
}
export declare function windowsKeyboardMappingEquals(a: IWindowsKeyboardMapping, b: IWindowsKeyboardMapping): boolean;
export interface IScanCodeMapping {
    scanCode: ScanCode;
    keyCode: KeyCode;
    value: string;
}
export declare class WindowsNativeResolvedKeybinding extends ResolvedKeybinding {
    private readonly _mapper;
    private readonly _firstPart;
    private readonly _chordPart;
    constructor(mapper: WindowsKeyboardMapper, firstPart: SimpleKeybinding, chordPart: SimpleKeybinding);
    private _getUILabelForKeybinding;
    getLabel(): string;
    private _getUSLabelForKeybinding;
    getUSLabel(): string;
    private _getAriaLabelForKeybinding;
    getAriaLabel(): string;
    private _getUserSettingsLabelForKeybinding;
    getUserSettingsLabel(): string;
    isWYSIWYG(): boolean;
    private _isWYSIWYG;
    isChord(): boolean;
    getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
    private _toResolvedKeybindingPart;
    getDispatchParts(): [string, string];
    private _getDispatchStr;
    private static getProducedCharCode;
    static getProducedChar(kb: ScanCodeBinding, mapping: IScanCodeMapping): string;
}
export declare class WindowsKeyboardMapper implements IKeyboardMapper {
    readonly isUSStandard: boolean;
    private readonly _codeInfo;
    private readonly _scanCodeToKeyCode;
    private readonly _keyCodeToLabel;
    private readonly _keyCodeExists;
    constructor(isUSStandard: boolean, rawMappings: IWindowsKeyboardMapping);
    dumpDebugInfo(): string;
    private _leftPad;
    getUILabelForKeyCode(keyCode: KeyCode): string;
    getAriaLabelForKeyCode(keyCode: KeyCode): string;
    getUserSettingsLabelForKeyCode(keyCode: KeyCode): string;
    private _getLabelForKeyCode;
    resolveKeybinding(keybinding: Keybinding): WindowsNativeResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): WindowsNativeResolvedKeybinding;
    private _resolveSimpleUserBinding;
    resolveUserBinding(firstPart: SimpleKeybinding | ScanCodeBinding, chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[];
}
