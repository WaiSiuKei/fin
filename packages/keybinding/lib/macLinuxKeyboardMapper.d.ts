import { ScanCodeBinding } from '@fin/keyboard';
import { OperatingSystem } from '@fin/platform';
import { Keybinding, SimpleKeybinding } from '@fin/keyboard';
import { ResolvedKeybinding, ResolvedKeybindingPart } from './resolvedKeybinding';
import { IKeyboardMapper } from './keyboardMapper';
import { IKeyboardEventLite } from './keybinding';
export interface IMacLinuxKeyMapping {
    value: string;
}
export interface IMacLinuxKeyboardMapping {
    [scanCode: string]: IMacLinuxKeyMapping;
}
export declare function macLinuxKeyboardMappingEquals(a: IMacLinuxKeyboardMapping, b: IMacLinuxKeyboardMapping): boolean;
export declare class NativeResolvedKeybinding extends ResolvedKeybinding {
    private readonly _mapper;
    private readonly _OS;
    private readonly _firstPart;
    private readonly _chordPart;
    constructor(mapper: MacLinuxKeyboardMapper, OS: OperatingSystem, firstPart: ScanCodeBinding, chordPart: ScanCodeBinding);
    getLabel(): string;
    getAriaLabel(): string;
    getUserSettingsLabel(): string;
    private _isWYSIWYG;
    isWYSIWYG(): boolean;
    isChord(): boolean;
    getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
    private _toResolvedKeybindingPart;
    getDispatchParts(): [string, string];
}
export declare class MacLinuxKeyboardMapper implements IKeyboardMapper {
    /**
     * Is this the standard US keyboard layout?
     */
    private readonly _isUSStandard;
    /**
     * OS (can be Linux or Macintosh)
     */
    private readonly _OS;
    /**
     * used only for debug purposes.
     */
    private readonly _codeInfo;
    /**
     * Maps ScanCode combos <-> KeyCode combos.
     */
    private readonly _scanCodeKeyCodeMapper;
    /**
     * UI label for a ScanCode.
     */
    private readonly _scanCodeToLabel;
    /**
     * Dispatching string for a ScanCode.
     */
    private readonly _scanCodeToDispatch;
    constructor(isUSStandard: boolean, rawMappings: IMacLinuxKeyboardMapping, OS: OperatingSystem);
    dumpDebugInfo(): string;
    private _leftPad;
    simpleKeybindingToScanCodeBinding(keybinding: SimpleKeybinding): ScanCodeBinding[];
    getUILabelForScanCodeBinding(binding: ScanCodeBinding): string;
    getAriaLabelForScanCodeBinding(binding: ScanCodeBinding): string;
    getDispatchStrForScanCodeBinding(keypress: ScanCodeBinding): string;
    getUserSettingsLabelForScanCodeBinding(binding: ScanCodeBinding): string;
    resolveKeybinding(keybinding: Keybinding): NativeResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): NativeResolvedKeybinding;
    private _resolveSimpleUserBinding;
    resolveUserBinding(_firstPart: SimpleKeybinding | ScanCodeBinding, _chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[];
    private static _charCodeToKb;
    /**
     * Attempt to shellMap a combining character to a regular one that renders the same way.
     *
     * To the brave person following me: Good Luck!
     * https://www.compart.com/en/unicode/bidiclass/NSM
     */
    static getCharCode(char: string): number;
}
