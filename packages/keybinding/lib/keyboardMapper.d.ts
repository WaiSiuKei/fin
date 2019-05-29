import { ScanCodeBinding } from '@fin/keyboard';
import { Keybinding, SimpleKeybinding } from '@fin/keyboard';
import { ResolvedKeybinding } from './resolvedKeybinding';
import { IKeyboardEventLite } from '@fin/keybinding/src/keybinding';
export interface IKeyboardMapper {
    dumpDebugInfo(): string;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding;
    resolveUserBinding(firstPart: SimpleKeybinding | ScanCodeBinding, chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[];
}
export declare class CachedKeyboardMapper implements IKeyboardMapper {
    private _actual;
    private _cache;
    constructor(actual: IKeyboardMapper);
    dumpDebugInfo(): string;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding;
    resolveUserBinding(firstPart: SimpleKeybinding | ScanCodeBinding, chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[];
}
export declare class KeyboardMapperFactory {
    static readonly INSTANCE: KeyboardMapperFactory;
    private _rawMapping;
    private _keyboardMapper;
    private _initialized;
    private constructor();
    getKeyboardMapper(): IKeyboardMapper;
    private static _createKeyboardMapper;
    private static _equals;
}
