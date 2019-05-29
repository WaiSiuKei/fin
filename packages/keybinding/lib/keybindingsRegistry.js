"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("@fin/platform");
const keyboard_1 = require("@fin/keyboard");
const command_1 = require("@fin/command");
class KeybindingsRegistryImpl {
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
    static bindToCurrentPlatform(kb) {
        if (platform_1.OS === platform_1.OperatingSystem.Windows) {
            if (kb && kb.win) {
                return kb.win;
            }
        }
        else if (platform_1.OS === platform_1.OperatingSystem.Macintosh) {
            if (kb && kb.mac) {
                return kb.mac;
            }
        }
        else {
            if (kb && kb.linux) {
                return kb.linux;
            }
        }
        return kb;
    }
    registerKeybindingRule(rule) {
        let actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
        if (actualKb && actualKb.primary) {
            this._registerDefaultKeybinding(keyboard_1.createKeybinding(actualKb.primary, platform_1.OS), rule.id, rule.weight, 0, rule.when);
        }
        if (actualKb && Array.isArray(actualKb.secondary)) {
            for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                const k = actualKb.secondary[i];
                this._registerDefaultKeybinding(keyboard_1.createKeybinding(k, platform_1.OS), rule.id, rule.weight, -i - 1, rule.when);
            }
        }
    }
    registerCommandAndKeybindingRule(desc) {
        this.registerKeybindingRule(desc);
        command_1.CommandsRegistry.registerCommand(desc);
    }
    static _mightProduceChar(keyCode) {
        if (keyCode >= 21 /* KEY_0 */ && keyCode <= 30 /* KEY_9 */) {
            return true;
        }
        if (keyCode >= 31 /* KEY_A */ && keyCode <= 56 /* KEY_Z */) {
            return true;
        }
        return (keyCode === 80 /* US_SEMICOLON */
            || keyCode === 81 /* US_EQUAL */
            || keyCode === 82 /* US_COMMA */
            || keyCode === 83 /* US_MINUS */
            || keyCode === 84 /* US_DOT */
            || keyCode === 85 /* US_SLASH */
            || keyCode === 86 /* US_BACKTICK */
            || keyCode === 110 /* ABNT_C1 */
            || keyCode === 111 /* ABNT_C2 */
            || keyCode === 87 /* US_OPEN_SQUARE_BRACKET */
            || keyCode === 88 /* US_BACKSLASH */
            || keyCode === 89 /* US_CLOSE_SQUARE_BRACKET */
            || keyCode === 90 /* US_QUOTE */
            || keyCode === 91 /* OEM_8 */
            || keyCode === 92 /* OEM_102 */);
    }
    _assertNoCtrlAlt(keybinding, commandId) {
        if (keybinding.ctrlKey && keybinding.altKey && !keybinding.metaKey) {
            if (KeybindingsRegistryImpl._mightProduceChar(keybinding.keyCode)) {
                console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
            }
        }
    }
    _registerDefaultKeybinding(keybinding, commandId, weight1, weight2, when) {
        if (platform_1.OS === platform_1.OperatingSystem.Windows) {
            if (keybinding.type === 2 /* Chord */) {
                this._assertNoCtrlAlt(keybinding.firstPart, commandId);
            }
            else {
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
    getDefaultKeybindings() {
        if (!this._keybindingsSorted) {
            this._keybindings.sort(sorter);
            this._keybindingsSorted = true;
        }
        return this._keybindings.slice(0);
    }
}
function sorter(a, b) {
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
exports.KeybindingsRegistry = new KeybindingsRegistryImpl();
