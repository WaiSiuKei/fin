import { BinaryKeybindingsMask, KeyCode } from './keyCodes';
import { OperatingSystem } from '@fin/platform';

export function createKeybinding(keybinding: number, OS: OperatingSystem): Keybinding {
  if (keybinding === 0) {
    return null;
  }
  const firstPart = (keybinding & 0x0000ffff) >>> 0;
  const chordPart = (keybinding & 0xffff0000) >>> 16;
  if (chordPart !== 0) {
    return new ChordKeybinding(
      createSimpleKeybinding(firstPart, OS),
      createSimpleKeybinding(chordPart, OS),
    );
  }
  return createSimpleKeybinding(firstPart, OS);
}

export function createSimpleKeybinding(keybinding: number, OS: OperatingSystem): SimpleKeybinding {

  const ctrlCmd = (keybinding & BinaryKeybindingsMask.CtrlCmd ? true : false);
  const winCtrl = (keybinding & BinaryKeybindingsMask.WinCtrl ? true : false);

  const ctrlKey = (OS === OperatingSystem.Macintosh ? winCtrl : ctrlCmd);
  const shiftKey = (keybinding & BinaryKeybindingsMask.Shift ? true : false);
  const altKey = (keybinding & BinaryKeybindingsMask.Alt ? true : false);
  const metaKey = (OS === OperatingSystem.Macintosh ? ctrlCmd : winCtrl);
  const keyCode = (keybinding & BinaryKeybindingsMask.KeyCode);

  return new SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}

export const enum KeybindingType {
  Simple = 1,
  Chord = 2
}

export class SimpleKeybinding {
  public readonly type: KeybindingType = KeybindingType.Simple;

  public readonly ctrlKey: boolean;
  public readonly shiftKey: boolean;
  public readonly altKey: boolean;
  public readonly metaKey: boolean;
  public readonly keyCode: KeyCode;

  constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyCode: KeyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }

  public equals(other: Keybinding): boolean {
    if (other.type !== KeybindingType.Simple) {
      return false;
    }
    other = other as SimpleKeybinding;
    return (
      this.ctrlKey === other.ctrlKey
      && this.shiftKey === other.shiftKey
      && this.altKey === other.altKey
      && this.metaKey === other.metaKey
      && this.keyCode === other.keyCode
    );
  }

  public getHashCode(): string {
    let ctrl = this.ctrlKey ? '1' : '0';
    let shift = this.shiftKey ? '1' : '0';
    let alt = this.altKey ? '1' : '0';
    let meta = this.metaKey ? '1' : '0';
    return `${ctrl}${shift}${alt}${meta}${this.keyCode}`;
  }

  public isModifierKey(): boolean {
    return (
      this.keyCode === KeyCode.Unknown
      || this.keyCode === KeyCode.Ctrl
      || this.keyCode === KeyCode.Meta
      || this.keyCode === KeyCode.Alt
      || this.keyCode === KeyCode.Shift
    );
  }

  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  public isDuplicateModifierCase(): boolean {
    return (
      (this.ctrlKey && this.keyCode === KeyCode.Ctrl)
      || (this.shiftKey && this.keyCode === KeyCode.Shift)
      || (this.altKey && this.keyCode === KeyCode.Alt)
      || (this.metaKey && this.keyCode === KeyCode.Meta)
    );
  }
}

export class ChordKeybinding {
  public readonly type: KeybindingType = KeybindingType.Chord;

  public readonly firstPart: SimpleKeybinding;
  public readonly chordPart: SimpleKeybinding;

  constructor(firstPart: SimpleKeybinding, chordPart: SimpleKeybinding) {
    this.firstPart = firstPart;
    this.chordPart = chordPart;
  }

  public getHashCode(): string {
    return `${this.firstPart.getHashCode()};${this.chordPart.getHashCode()}`;
  }
}

export type Keybinding = SimpleKeybinding | ChordKeybinding;
