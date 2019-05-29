import { KeyCode } from './keyCodes';
import { OperatingSystem } from '@fin/platform';
export declare function createKeybinding(keybinding: number, OS: OperatingSystem): Keybinding;
export declare function createSimpleKeybinding(keybinding: number, OS: OperatingSystem): SimpleKeybinding;
export declare const enum KeybindingType {
    Simple = 1,
    Chord = 2
}
export declare class SimpleKeybinding {
    readonly type: KeybindingType;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyCode: KeyCode);
    equals(other: Keybinding): boolean;
    getHashCode(): string;
    isModifierKey(): boolean;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
export declare class ChordKeybinding {
    readonly type: KeybindingType;
    readonly firstPart: SimpleKeybinding;
    readonly chordPart: SimpleKeybinding;
    constructor(firstPart: SimpleKeybinding, chordPart: SimpleKeybinding);
    getHashCode(): string;
}
export declare type Keybinding = SimpleKeybinding | ChordKeybinding;
