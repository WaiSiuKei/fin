"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keyboard_1 = require("@fin/keyboard");
const keyboard_2 = require("@fin/keyboard");
const contextkey_1 = require("@fin/contextkey");
const keyboard_3 = require("@fin/keyboard");
class KeybindingIO {
    static writeKeybindingItem(out, item, OS) {
        let quotedSerializedKeybinding = JSON.stringify(item.resolvedKeybinding.getUserSettingsLabel());
        out.write(`{ "key": ${rightPaddedString(quotedSerializedKeybinding + ',', 25)} "command": `);
        let serializedWhen = item.when ? item.when.serialize() : '';
        let quotedSerializeCommand = JSON.stringify(item.command);
        if (serializedWhen.length > 0) {
            out.write(`${quotedSerializeCommand},`);
            out.writeLine();
            out.write(`                                     "when": "${serializedWhen}" `);
        }
        else {
            out.write(`${quotedSerializeCommand} `);
        }
        // out.write(String(item.weight1 + '-' + item.weight2));
        out.write('}');
    }
    static readUserKeybindingItem(input, OS) {
        const [firstPart, chordPart] = (typeof input.key === 'string' ? this._readUserBinding(input.key) : [null, null]);
        const when = (typeof input.when === 'string' ? contextkey_1.ContextKeyExpr.deserialize(input.when) : null);
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
    static _readModifiers(input) {
        input = input.toLowerCase().trim();
        let ctrl = false;
        let shift = false;
        let alt = false;
        let meta = false;
        let matchedModifier;
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
        let key;
        const firstSpaceIdx = input.indexOf(' ');
        if (firstSpaceIdx > 0) {
            key = input.substring(0, firstSpaceIdx);
            input = input.substring(firstSpaceIdx);
        }
        else {
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
    static _readSimpleKeybinding(input) {
        const mods = this._readModifiers(input);
        const keyCode = keyboard_1.KeyCodeUtils.fromUserSettings(mods.key);
        return [new keyboard_3.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
    }
    static readKeybinding(input, OS) {
        if (!input) {
            return null;
        }
        let [firstPart, remains] = this._readSimpleKeybinding(input);
        let chordPart = null;
        if (remains.length > 0) {
            [chordPart] = this._readSimpleKeybinding(remains);
        }
        if (chordPart) {
            return new keyboard_3.ChordKeybinding(firstPart, chordPart);
        }
        return firstPart;
    }
    static _readSimpleUserBinding(input) {
        const mods = this._readModifiers(input);
        const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
        if (scanCodeMatch) {
            const strScanCode = scanCodeMatch[1];
            const scanCode = keyboard_2.ScanCodeUtils.lowerCaseToEnum(strScanCode);
            return [new keyboard_2.ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
        }
        const keyCode = keyboard_1.KeyCodeUtils.fromUserSettings(mods.key);
        return [new keyboard_3.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
    }
    static _readUserBinding(input) {
        if (!input) {
            return [null, null];
        }
        let [firstPart, remains] = this._readSimpleUserBinding(input);
        let chordPart = null;
        if (remains.length > 0) {
            [chordPart] = this._readSimpleUserBinding(remains);
        }
        return [firstPart, chordPart];
    }
}
exports.KeybindingIO = KeybindingIO;
function rightPaddedString(str, minChars) {
    if (str.length < minChars) {
        return str + (new Array(minChars - str.length).join(' '));
    }
    return str;
}
class OutputBuilder {
    constructor() {
        this._lines = [];
        this._currentLine = '';
    }
    write(str) {
        this._currentLine += str;
    }
    writeLine(str = '') {
        this._lines.push(this._currentLine + str);
        this._currentLine = '';
    }
    toString() {
        this.writeLine();
        return this._lines.join('\n');
    }
}
exports.OutputBuilder = OutputBuilder;
