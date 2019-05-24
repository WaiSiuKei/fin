import { createKeybinding, Keybinding, KeybindingType, KeyCode, SimpleKeybinding } from '@fin/keyboard/src/keyCodes';
import { ContextKeyExpr } from '@fin/contextkey/src/contextKeyExpr';
import { OperatingSystem, OS } from '@fin/platform/src';

export interface IKeybindingItem {
  keybinding: Keybinding;
  command: string;
  commandArgs?: any;
  when: ContextKeyExpr;
  weight1: number;
  weight2: number;
}

export interface IKeybindings {
  primary: number;
  secondary?: number[];
  win?: {
    primary: number;
    secondary?: number[];
  };
  linux?: {
    primary: number;
    secondary?: number[];
  };
  mac?: {
    primary: number;
    secondary?: number[];
  };
}

export interface IKeybindingRule extends IKeybindings {
  id: string;
  weight: number;
  when: ContextKeyExpr;
}

export interface IKeybindingsRegistry {
  registerKeybindingRule(rule: IKeybindingRule): void;
  getDefaultKeybindings(): IKeybindingItem[];

  // WEIGHT: {
  //   chartCore(importance?: number): number;
  //   chartContrib(importance?: number): number;
  //   workbenchContrib(importance?: number): number;
  //   builtinExtension(importance?: number): number;
  //   externalExtension(importance?: number): number;
  // };
}

class KeybindingsRegistryImpl implements IKeybindingsRegistry {

  private _keybindings: IKeybindingItem[];
  private _keybindingsSorted: boolean;

  // public WEIGHT = {
  //   chartCore: (importance: number = 0): number => {
  //     return 0 + importance;
  //   },
  //   chartContrib: (importance: number = 0): number => {
  //     return 100 + importance;
  //   },
  //   workbenchContrib: (importance: number = 0): number => {
  //     return 200 + importance;
  //   },
  //   builtinExtension: (importance: number = 0): number => {
  //     return 300 + importance;
  //   },
  //   externalExtension: (importance: number = 0): number => {
  //     return 400 + importance;
  //   }
  // };

  constructor() {
    this._keybindings = [];
    this._keybindingsSorted = true;
  }

  /**
   * Take current platform into account and reduce to primary & secondary.
   */
  private static bindToCurrentPlatform(kb: IKeybindings): { primary?: number; secondary?: number[]; } {
    if (OS === OperatingSystem.Windows) {
      if (kb && kb.win) {
        return kb.win;
      }
    } else if (OS === OperatingSystem.Macintosh) {
      if (kb && kb.mac) {
        return kb.mac;
      }
    } else {
      if (kb && kb.linux) {
        return kb.linux;
      }
    }

    return kb;
  }

  public registerKeybindingRule(rule: IKeybindingRule): void {
    let actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);

    if (actualKb && actualKb.primary) {
      this._registerDefaultKeybinding(createKeybinding(actualKb.primary, OS), rule.id, rule.weight, 0, rule.when);
    }

    if (actualKb && Array.isArray(actualKb.secondary)) {
      for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
        const k = actualKb.secondary[i];
        this._registerDefaultKeybinding(createKeybinding(k, OS), rule.id, rule.weight, -i - 1, rule.when);
      }
    }
  }

  private static _mightProduceChar(keyCode: KeyCode): boolean {
    if (keyCode >= KeyCode.KEY_0 && keyCode <= KeyCode.KEY_9) {
      return true;
    }
    if (keyCode >= KeyCode.KEY_A && keyCode <= KeyCode.KEY_Z) {
      return true;
    }
    return (
      keyCode === KeyCode.US_SEMICOLON
      || keyCode === KeyCode.US_EQUAL
      || keyCode === KeyCode.US_COMMA
      || keyCode === KeyCode.US_MINUS
      || keyCode === KeyCode.US_DOT
      || keyCode === KeyCode.US_SLASH
      || keyCode === KeyCode.US_BACKTICK
      || keyCode === KeyCode.ABNT_C1
      || keyCode === KeyCode.ABNT_C2
      || keyCode === KeyCode.US_OPEN_SQUARE_BRACKET
      || keyCode === KeyCode.US_BACKSLASH
      || keyCode === KeyCode.US_CLOSE_SQUARE_BRACKET
      || keyCode === KeyCode.US_QUOTE
      || keyCode === KeyCode.OEM_8
      || keyCode === KeyCode.OEM_102
    );
  }

  private _assertNoCtrlAlt(keybinding: SimpleKeybinding, commandId: string): void {
    if (keybinding.ctrlKey && keybinding.altKey && !keybinding.metaKey) {
      if (KeybindingsRegistryImpl._mightProduceChar(keybinding.keyCode)) {
        console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
      }
    }
  }

  private _registerDefaultKeybinding(keybinding: Keybinding, commandId: string, weight1: number, weight2: number, when: ContextKeyExpr): void {
    if (OS === OperatingSystem.Windows) {
      if (keybinding.type === KeybindingType.Chord) {
        this._assertNoCtrlAlt(keybinding.firstPart, commandId);
      } else {
        this._assertNoCtrlAlt(keybinding, commandId);
      }
    }
    this._keybindings.push({
      keybinding: keybinding,
      command: commandId,
      commandArgs: undefined,
      when: when,
      weight1: weight1,
      weight2: weight2
    });
    this._keybindingsSorted = false;
  }

  public getDefaultKeybindings(): IKeybindingItem[] {
    if (!this._keybindingsSorted) {
      this._keybindings.sort(sorter);
      this._keybindingsSorted = true;
    }
    return this._keybindings.slice(0);
  }
}

function sorter(a: IKeybindingItem, b: IKeybindingItem): number {
  if (a.weight1 !== b.weight1) {
    return a.weight1 - b.weight1;
  }
  if (a.command < b.command) {
    return -1;
  }
  if (a.command > b.command) {
    return 1;
  }
  return a.weight2 - b.weight2;
}

export const KeybindingsRegistry = new KeybindingsRegistryImpl();
