import { KeyCodeUtils } from '@fin/keyboard';
import { ScanCodeBinding, ScanCodeUtils } from '@fin/keyboard';
import { OperatingSystem } from '@fin/platform';
import { ContextKeyExpr } from '@fin/contextkey';
import { SimpleKeybinding } from '@fin/keyboard';
import { IUserFriendlyKeybinding } from './keybinding';

export interface IUserKeybindingItem {
  firstPart: SimpleKeybinding | ScanCodeBinding;
  chordPart: SimpleKeybinding | ScanCodeBinding;
  command: string;
  commandArgs?: any;
  when: ContextKeyExpr;
}

export class KeybindingIO {

  public static readUserKeybindingItem(input: IUserFriendlyKeybinding): IUserKeybindingItem {
    const [firstPart, chordPart] = (typeof input.key === 'string' ? this._readUserBinding(input.key) : [null, null]);
    const when = (typeof input.when === 'string' ? ContextKeyExpr.deserialize(input.when) : null);
    const command = (typeof input.command === 'string' ? input.command : null);
    const commandArgs = (typeof input.args !== 'undefined' ? input.args : undefined);
    return {
      firstPart: firstPart,
      chordPart: chordPart,
      command: command,
      commandArgs: commandArgs,
      when: when
    };
  }

  private static _readModifiers(input: string) {
    input = input.toLowerCase().trim();

    let ctrl = false;
    let shift = false;
    let alt = false;
    let meta = false;

    let matchedModifier: boolean;

    do {
      matchedModifier = false;
      if (/^ctrl(\+|\-)/.test(input)) {
        ctrl = true;
        input = input.substr('ctrl-'.length);
        matchedModifier = true;
      }
      if (/^shift(\+|\-)/.test(input)) {
        shift = true;
        input = input.substr('shift-'.length);
        matchedModifier = true;
      }
      if (/^alt(\+|\-)/.test(input)) {
        alt = true;
        input = input.substr('alt-'.length);
        matchedModifier = true;
      }
      if (/^meta(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('meta-'.length);
        matchedModifier = true;
      }
      if (/^win(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('win-'.length);
        matchedModifier = true;
      }
      if (/^cmd(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('cmd-'.length);
        matchedModifier = true;
      }
    } while (matchedModifier);

    let key: string;

    const firstSpaceIdx = input.indexOf(' ');
    if (firstSpaceIdx > 0) {
      key = input.substring(0, firstSpaceIdx);
      input = input.substring(firstSpaceIdx);
    } else {
      key = input;
      input = '';
    }

    return {
      remains: input,
      ctrl,
      shift,
      alt,
      meta,
      key
    };
  }

  private static _readSimpleUserBinding(input: string): [SimpleKeybinding | ScanCodeBinding, string] {
    const mods = this._readModifiers(input);
    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1];
      const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode);
      return [new ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
    }
    const keyCode = KeyCodeUtils.fromUserSettings(mods.key);
    return [new SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
  }

  static _readUserBinding(input: string): [SimpleKeybinding | ScanCodeBinding, SimpleKeybinding | ScanCodeBinding] {
    if (!input) {
      return [null, null];
    }

    let [firstPart, remains] = this._readSimpleUserBinding(input);
    let chordPart: SimpleKeybinding | ScanCodeBinding = null;
    if (remains.length > 0) {
      [chordPart] = this._readSimpleUserBinding(remains);
    }
    return [firstPart, chordPart];
  }
}

