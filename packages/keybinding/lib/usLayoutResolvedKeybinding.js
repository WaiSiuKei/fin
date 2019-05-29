"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keyboard_1 = require("@fin/keyboard");
const resolvedKeybinding_1 = require("resolvedKeybinding");
const keybindingLabels_1 = require("keybindingLabels");
class USLayoutResolvedKeybinding extends resolvedKeybinding_1.ResolvedKeybinding {
    constructor(actual, OS) {
        super();
        this._os = OS;
        if (actual === null) {
            throw new Error(`Invalid USLayoutResolvedKeybinding`);
        }
        else if (actual.type === 2 /* Chord */) {
            actual = actual;
            this._firstPart = actual.firstPart;
            this._chordPart = actual.chordPart;
        }
        else {
            actual = actual;
            this._firstPart = actual;
            this._chordPart = null;
        }
    }
    _keyCodeToUILabel(keyCode) {
        if (this._os === 2 /* Macintosh */) {
            switch (keyCode) {
                case 15 /* LeftArrow */:
                    return '←';
                case 16 /* UpArrow */:
                    return '↑';
                case 17 /* RightArrow */:
                    return '→';
                case 18 /* DownArrow */:
                    return '↓';
            }
        }
        return keyboard_1.KeyCodeUtils.toString(keyCode);
    }
    _getUILabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return this._keyCodeToUILabel(keybinding.keyCode);
    }
    getLabel() {
        let firstPart = this._getUILabelForKeybinding(this._firstPart);
        let chordPart = this._getUILabelForKeybinding(this._chordPart);
        return keybindingLabels_1.UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
    }
    _getAriaLabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return keyboard_1.KeyCodeUtils.toString(keybinding.keyCode);
    }
    getAriaLabel() {
        let firstPart = this._getAriaLabelForKeybinding(this._firstPart);
        let chordPart = this._getAriaLabelForKeybinding(this._chordPart);
        return keybindingLabels_1.AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
    }
    _keyCodeToElectronAccelerator(keyCode) {
        if (keyCode >= 93 /* NUMPAD_0 */ && keyCode <= 108 /* NUMPAD_DIVIDE */) {
            // Electron cannot handle numpad keys
            return null;
        }
        switch (keyCode) {
            case 16 /* UpArrow */:
                return 'Up';
            case 18 /* DownArrow */:
                return 'Down';
            case 15 /* LeftArrow */:
                return 'Left';
            case 17 /* RightArrow */:
                return 'Right';
        }
        return keyboard_1.KeyCodeUtils.toString(keyCode);
    }
    _getUserSettingsLabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return keyboard_1.KeyCodeUtils.toUserSettingsUS(keybinding.keyCode);
    }
    getUserSettingsLabel() {
        let firstPart = this._getUserSettingsLabelForKeybinding(this._firstPart);
        let chordPart = this._getUserSettingsLabelForKeybinding(this._chordPart);
        let result = keybindingLabels_1.UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._os);
        return (result ? result.toLowerCase() : result);
    }
    isWYSIWYG() {
        return true;
    }
    isChord() {
        return (this._chordPart ? true : false);
    }
    getParts() {
        return [
            this._toResolvedKeybindingPart(this._firstPart),
            this._toResolvedKeybindingPart(this._chordPart)
        ];
    }
    _toResolvedKeybindingPart(keybinding) {
        if (!keybinding) {
            return null;
        }
        return new resolvedKeybinding_1.ResolvedKeybindingPart(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, this._getUILabelForKeybinding(keybinding), this._getAriaLabelForKeybinding(keybinding));
    }
    getDispatchParts() {
        let firstPart = this._firstPart ? USLayoutResolvedKeybinding.getDispatchStr(this._firstPart) : null;
        let chordPart = this._chordPart ? USLayoutResolvedKeybinding.getDispatchStr(this._chordPart) : null;
        return [firstPart, chordPart];
    }
    static getDispatchStr(keybinding) {
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
        result += keyboard_1.KeyCodeUtils.toString(keybinding.keyCode);
        return result;
    }
}
exports.USLayoutResolvedKeybinding = USLayoutResolvedKeybinding;
