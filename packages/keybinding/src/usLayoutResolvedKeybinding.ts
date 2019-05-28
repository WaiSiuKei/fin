/**
 * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
 */
import { OperatingSystem } from '@fin/platform';
import { ChordKeybinding, Keybinding, KeybindingType, SimpleKeybinding } from '@fin/keyboard';
import { KeyCode, KeyCodeUtils } from '@fin/keyboard';
import { ResolvedKeybinding, ResolvedKeybindingPart } from 'resolvedKeybinding';
import { AriaLabelProvider, UILabelProvider, UserSettingsLabelProvider } from 'keybindingLabels';

export class USLayoutResolvedKeybinding extends ResolvedKeybinding {

  private readonly _os: OperatingSystem;
  private readonly _firstPart: SimpleKeybinding;
  private readonly _chordPart: SimpleKeybinding;

  constructor(actual: Keybinding, OS: OperatingSystem) {
    super();
    this._os = OS;
    if (actual === null) {
      throw new Error(`Invalid USLayoutResolvedKeybinding`);
    } else if (actual.type === KeybindingType.Chord) {
      actual = actual as ChordKeybinding;
      this._firstPart = actual.firstPart;
      this._chordPart = actual.chordPart;
    } else {
      actual = actual as SimpleKeybinding;
      this._firstPart = actual;
      this._chordPart = null;
    }
  }

  private _keyCodeToUILabel(keyCode: KeyCode): string {
    if (this._os === OperatingSystem.Macintosh) {
      switch (keyCode) {
        case KeyCode.LeftArrow:
          return '←';
        case KeyCode.UpArrow:
          return '↑';
        case KeyCode.RightArrow:
          return '→';
        case KeyCode.DownArrow:
          return '↓';
      }
    }
    return KeyCodeUtils.toString(keyCode);
  }

  private _getUILabelForKeybinding(keybinding: SimpleKeybinding): string {
    if (!keybinding) {
      return null;
    }
    if (keybinding.isDuplicateModifierCase()) {
      return '';
    }
    return this._keyCodeToUILabel(keybinding.keyCode);
  }

  public getLabel(): string {
    let firstPart = this._getUILabelForKeybinding(this._firstPart);
    let chordPart = this._getUILabelForKeybinding(this._chordPart);
    return UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
  }

  private _getAriaLabelForKeybinding(keybinding: SimpleKeybinding): string {
    if (!keybinding) {
      return null;
    }
    if (keybinding.isDuplicateModifierCase()) {
      return '';
    }
    return KeyCodeUtils.toString(keybinding.keyCode);
  }

  public getAriaLabel(): string {
    let firstPart = this._getAriaLabelForKeybinding(this._firstPart);
    let chordPart = this._getAriaLabelForKeybinding(this._chordPart);
    return AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
  }

  private _keyCodeToElectronAccelerator(keyCode: KeyCode): string {
    if (keyCode >= KeyCode.NUMPAD_0 && keyCode <= KeyCode.NUMPAD_DIVIDE) {
      // Electron cannot handle numpad keys
      return null;
    }

    switch (keyCode) {
      case KeyCode.UpArrow:
        return 'Up';
      case KeyCode.DownArrow:
        return 'Down';
      case KeyCode.LeftArrow:
        return 'Left';
      case KeyCode.RightArrow:
        return 'Right';
    }

    return KeyCodeUtils.toString(keyCode);
  }

  private _getUserSettingsLabelForKeybinding(keybinding: SimpleKeybinding): string {
    if (!keybinding) {
      return null;
    }
    if (keybinding.isDuplicateModifierCase()) {
      return '';
    }
    return KeyCodeUtils.toUserSettingsUS(keybinding.keyCode);
  }

  public getUserSettingsLabel(): string {
    let firstPart = this._getUserSettingsLabelForKeybinding(this._firstPart);
    let chordPart = this._getUserSettingsLabelForKeybinding(this._chordPart);
    let result = UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
    return (result ? result.toLowerCase() : result);
  }

  public isWYSIWYG(): boolean {
    return true;
  }

  public isChord(): boolean {
    return (this._chordPart ? true : false);
  }

  public getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart] {
    return [
      this._toResolvedKeybindingPart(this._firstPart),
      this._toResolvedKeybindingPart(this._chordPart)
    ];
  }

  private _toResolvedKeybindingPart(keybinding: SimpleKeybinding): ResolvedKeybindingPart {
    if (!keybinding) {
      return null;
    }

    return new ResolvedKeybindingPart(
      keybinding.ctrlKey,
      keybinding.shiftKey,
      keybinding.altKey,
      keybinding.metaKey,
      this._getUILabelForKeybinding(keybinding),
      this._getAriaLabelForKeybinding(keybinding)
    );
  }

  public getDispatchParts(): [string, string] {
    let firstPart = this._firstPart ? USLayoutResolvedKeybinding.getDispatchStr(this._firstPart) : null;
    let chordPart = this._chordPart ? USLayoutResolvedKeybinding.getDispatchStr(this._chordPart) : null;
    return [firstPart, chordPart];
  }

  public static getDispatchStr(keybinding: SimpleKeybinding): string {
    if (keybinding.isModifierKey()) {
      return null;
    }
    let result = '';

    if (keybinding.ctrlKey) {
      result += 'ctrl+';
    }
    if (keybinding.shiftKey) {
      result += 'shift+';
    }
    if (keybinding.altKey) {
      result += 'alt+';
    }
    if (keybinding.metaKey) {
      result += 'meta+';
    }
    result += KeyCodeUtils.toString(keybinding.keyCode);

    return result;
  }
}
