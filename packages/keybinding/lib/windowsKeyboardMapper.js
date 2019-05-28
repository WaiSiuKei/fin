"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keyboard_1 = require("@fin/keyboard");
const resolvedKeybinding_1 = require("./resolvedKeybinding");
const keybindingLabels_1 = require("./keybindingLabels");
function windowsKeyMappingEquals(a, b) {
    if (!a && !b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return (a.vkey === b.vkey
        && a.value === b.value);
}
function windowsKeyboardMappingEquals(a, b) {
    if (!a && !b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    for (let scanCode = 0; scanCode < 193 /* MAX_VALUE */; scanCode++) {
        const strScanCode = keyboard_1.ScanCodeUtils.toString(scanCode);
        const aEntry = a[strScanCode];
        const bEntry = b[strScanCode];
        if (!windowsKeyMappingEquals(aEntry, bEntry)) {
            return false;
        }
    }
    return true;
}
exports.windowsKeyboardMappingEquals = windowsKeyboardMappingEquals;
const NATIVE_KEY_CODE_TO_KEY_CODE = _getNativeMap();
class WindowsNativeResolvedKeybinding extends resolvedKeybinding_1.ResolvedKeybinding {
    constructor(mapper, firstPart, chordPart) {
        super();
        if (!firstPart) {
            throw new Error(`Invalid WindowsNativeResolvedKeybinding firstPart`);
        }
        this._mapper = mapper;
        this._firstPart = firstPart;
        this._chordPart = chordPart;
    }
    _getUILabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return this._mapper.getUILabelForKeyCode(keybinding.keyCode);
    }
    getLabel() {
        let firstPart = this._getUILabelForKeybinding(this._firstPart);
        let chordPart = this._getUILabelForKeybinding(this._chordPart);
        return keybindingLabels_1.UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
    }
    _getUSLabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return keyboard_1.KeyCodeUtils.toString(keybinding.keyCode);
    }
    getUSLabel() {
        let firstPart = this._getUSLabelForKeybinding(this._firstPart);
        let chordPart = this._getUSLabelForKeybinding(this._chordPart);
        return keybindingLabels_1.UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
    }
    _getAriaLabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return this._mapper.getAriaLabelForKeyCode(keybinding.keyCode);
    }
    getAriaLabel() {
        let firstPart = this._getAriaLabelForKeybinding(this._firstPart);
        let chordPart = this._getAriaLabelForKeybinding(this._chordPart);
        return keybindingLabels_1.AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
    }
    _getUserSettingsLabelForKeybinding(keybinding) {
        if (!keybinding) {
            return null;
        }
        if (keybinding.isDuplicateModifierCase()) {
            return '';
        }
        return this._mapper.getUserSettingsLabelForKeyCode(keybinding.keyCode);
    }
    getUserSettingsLabel() {
        let firstPart = this._getUserSettingsLabelForKeybinding(this._firstPart);
        let chordPart = this._getUserSettingsLabelForKeybinding(this._chordPart);
        let result = keybindingLabels_1.UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
        return (result ? result.toLowerCase() : result);
    }
    isWYSIWYG() {
        if (this._firstPart && !this._isWYSIWYG(this._firstPart.keyCode)) {
            return false;
        }
        if (this._chordPart && !this._isWYSIWYG(this._chordPart.keyCode)) {
            return false;
        }
        return true;
    }
    _isWYSIWYG(keyCode) {
        if (keyCode === 15 /* LeftArrow */
            || keyCode === 16 /* UpArrow */
            || keyCode === 17 /* RightArrow */
            || keyCode === 18 /* DownArrow */) {
            return true;
        }
        const ariaLabel = this._mapper.getAriaLabelForKeyCode(keyCode);
        const userSettingsLabel = this._mapper.getUserSettingsLabelForKeyCode(keyCode);
        return (ariaLabel === userSettingsLabel);
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
        let firstPart = this._firstPart ? this._getDispatchStr(this._firstPart) : null;
        let chordPart = this._chordPart ? this._getDispatchStr(this._chordPart) : null;
        return [firstPart, chordPart];
    }
    _getDispatchStr(keybinding) {
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
    static getProducedCharCode(kb, mapping) {
        if (!mapping) {
            return null;
        }
        return mapping.value;
    }
    static getProducedChar(kb, mapping) {
        const char = this.getProducedCharCode(kb, mapping);
        if (char === null || char.length === 0) {
            return ' --- ';
        }
        return '  ' + char + '  ';
    }
}
exports.WindowsNativeResolvedKeybinding = WindowsNativeResolvedKeybinding;
class WindowsKeyboardMapper {
    constructor(isUSStandard, rawMappings) {
        this._keyCodeToLabel = [];
        this.isUSStandard = isUSStandard;
        this._scanCodeToKeyCode = [];
        this._keyCodeToLabel = [];
        this._keyCodeExists = [];
        this._keyCodeToLabel[0 /* Unknown */] = keyboard_1.KeyCodeUtils.toString(0 /* Unknown */);
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            const immutableKeyCode = keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (immutableKeyCode !== -1) {
                this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
                this._keyCodeToLabel[immutableKeyCode] = keyboard_1.KeyCodeUtils.toString(immutableKeyCode);
                this._keyCodeExists[immutableKeyCode] = true;
            }
        }
        let producesLetter = [];
        this._codeInfo = [];
        for (let strCode in rawMappings) {
            if (rawMappings.hasOwnProperty(strCode)) {
                const scanCode = keyboard_1.ScanCodeUtils.toEnum(strCode);
                if (scanCode === 0 /* None */) {
                    // log(`Unknown scanCode ${strCode} in mapping.`);
                    continue;
                }
                const rawMapping = rawMappings[strCode];
                const immutableKeyCode = keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                if (immutableKeyCode !== -1) {
                    const keyCode = NATIVE_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* Unknown */;
                    if (keyCode === 0 /* Unknown */ || immutableKeyCode === keyCode) {
                        continue;
                    }
                    if (scanCode !== 134 /* NumpadComma */) {
                        // Looks like ScanCode.NumpadComma doesn't always shellMap to KeyCode.NUMPAD_SEPARATOR
                        // e.g. on POR - PTB
                        continue;
                    }
                }
                const value = rawMapping.value;
                const keyCode = NATIVE_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* Unknown */;
                const mapping = {
                    scanCode: scanCode,
                    keyCode: keyCode,
                    value: value,
                };
                this._codeInfo[scanCode] = mapping;
                this._scanCodeToKeyCode[scanCode] = keyCode;
                if (keyCode === 0 /* Unknown */) {
                    continue;
                }
                this._keyCodeExists[keyCode] = true;
                if (value.length === 0) {
                    // This key does not produce strings
                    this._keyCodeToLabel[keyCode] = null;
                }
                else if (value.length > 1) {
                    // This key produces a letter representable with multiple UTF-16 code units.
                    this._keyCodeToLabel[keyCode] = value;
                }
                else {
                    const charCode = value.charCodeAt(0);
                    if (charCode >= 97 /* a */ && charCode <= 122 /* z */) {
                        const upperCaseValue = 65 /* A */ + (charCode - 97 /* a */);
                        producesLetter[upperCaseValue] = true;
                        this._keyCodeToLabel[keyCode] = String.fromCharCode(65 /* A */ + (charCode - 97 /* a */));
                    }
                    else if (charCode >= 65 /* A */ && charCode <= 90 /* Z */) {
                        producesLetter[charCode] = true;
                        this._keyCodeToLabel[keyCode] = value;
                    }
                    else {
                        this._keyCodeToLabel[keyCode] = value;
                    }
                }
            }
        }
        // Handle keyboard layouts where latin characters are not produced e.g. Cyrillic
        const _registerLetterIfMissing = (charCode, keyCode) => {
            if (!producesLetter[charCode]) {
                this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
            }
        };
        _registerLetterIfMissing(65 /* A */, 31 /* KEY_A */);
        _registerLetterIfMissing(66 /* B */, 32 /* KEY_B */);
        _registerLetterIfMissing(67 /* C */, 33 /* KEY_C */);
        _registerLetterIfMissing(68 /* D */, 34 /* KEY_D */);
        _registerLetterIfMissing(69 /* E */, 35 /* KEY_E */);
        _registerLetterIfMissing(70 /* F */, 36 /* KEY_F */);
        _registerLetterIfMissing(71 /* G */, 37 /* KEY_G */);
        _registerLetterIfMissing(72 /* H */, 38 /* KEY_H */);
        _registerLetterIfMissing(73 /* I */, 39 /* KEY_I */);
        _registerLetterIfMissing(74 /* J */, 40 /* KEY_J */);
        _registerLetterIfMissing(75 /* K */, 41 /* KEY_K */);
        _registerLetterIfMissing(76 /* L */, 42 /* KEY_L */);
        _registerLetterIfMissing(77 /* M */, 43 /* KEY_M */);
        _registerLetterIfMissing(78 /* N */, 44 /* KEY_N */);
        _registerLetterIfMissing(79 /* O */, 45 /* KEY_O */);
        _registerLetterIfMissing(80 /* P */, 46 /* KEY_P */);
        _registerLetterIfMissing(81 /* Q */, 47 /* KEY_Q */);
        _registerLetterIfMissing(82 /* R */, 48 /* KEY_R */);
        _registerLetterIfMissing(83 /* S */, 49 /* KEY_S */);
        _registerLetterIfMissing(84 /* T */, 50 /* KEY_T */);
        _registerLetterIfMissing(85 /* U */, 51 /* KEY_U */);
        _registerLetterIfMissing(86 /* V */, 52 /* KEY_V */);
        _registerLetterIfMissing(87 /* W */, 53 /* KEY_W */);
        _registerLetterIfMissing(88 /* X */, 54 /* KEY_X */);
        _registerLetterIfMissing(89 /* Y */, 55 /* KEY_Y */);
        _registerLetterIfMissing(90 /* Z */, 56 /* KEY_Z */);
    }
    dumpDebugInfo() {
        let result = [];
        let immutableSamples = [
            88 /* ArrowUp */,
            104 /* Numpad0 */
        ];
        let cnt = 0;
        result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            if (keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                if (immutableSamples.indexOf(scanCode) === -1) {
                    continue;
                }
            }
            if (cnt % 6 === 0) {
                result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
                result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
            }
            cnt++;
            const mapping = this._codeInfo[scanCode];
            const strCode = keyboard_1.ScanCodeUtils.toString(scanCode);
            let mods = [0b000, 0b010, 0b101, 0b111];
            for (let modIndex = 0; modIndex < mods.length; modIndex++) {
                const mod = mods[modIndex];
                const ctrlKey = (mod & 0b001) ? true : false;
                const shiftKey = (mod & 0b010) ? true : false;
                const altKey = (mod & 0b100) ? true : false;
                const scanCodeBinding = new keyboard_1.ScanCodeBinding(ctrlKey, shiftKey, altKey, false, scanCode);
                const kb = this._resolveSimpleUserBinding(scanCodeBinding);
                const strKeyCode = (kb ? keyboard_1.KeyCodeUtils.toString(kb.keyCode) : null);
                const resolvedKb = (kb ? new WindowsNativeResolvedKeybinding(this, kb, null) : null);
                const outScanCode = `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strCode}`;
                const ariaLabel = (resolvedKb ? resolvedKb.getAriaLabel() : null);
                const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                const outUserSettings = (resolvedKb ? resolvedKb.getUserSettingsLabel() : null);
                const outKey = WindowsNativeResolvedKeybinding.getProducedChar(scanCodeBinding, mapping);
                const outKb = (strKeyCode ? `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strKeyCode}` : null);
                const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                result.push(`| ${this._leftPad(outScanCode, 30)} | ${outKey} | ${this._leftPad(outKb, 25)} | ${this._leftPad(outUILabel, 25)} |  ${this._leftPad(outUserSettings, 25)} | ${outWYSIWYG} |`);
            }
            result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
        }
        return result.join('\n');
    }
    _leftPad(str, cnt) {
        if (str === null) {
            str = 'null';
        }
        while (str.length < cnt) {
            str = ' ' + str;
        }
        return str;
    }
    getUILabelForKeyCode(keyCode) {
        return this._getLabelForKeyCode(keyCode);
    }
    getAriaLabelForKeyCode(keyCode) {
        return this._getLabelForKeyCode(keyCode);
    }
    getUserSettingsLabelForKeyCode(keyCode) {
        if (this.isUSStandard) {
            return keyboard_1.KeyCodeUtils.toUserSettingsUS(keyCode);
        }
        return keyboard_1.KeyCodeUtils.toUserSettingsGeneral(keyCode);
    }
    _getLabelForKeyCode(keyCode) {
        return this._keyCodeToLabel[keyCode] || keyboard_1.KeyCodeUtils.toString(0 /* Unknown */);
    }
    resolveKeybinding(keybinding) {
        if (keybinding.type === 2 /* Chord */) {
            keybinding = keybinding;
            const firstPartKeyCode = keybinding.firstPart.keyCode;
            const chordPartKeyCode = keybinding.chordPart.keyCode;
            if (!this._keyCodeExists[firstPartKeyCode] || !this._keyCodeExists[chordPartKeyCode]) {
                return [];
            }
            return [new WindowsNativeResolvedKeybinding(this, keybinding.firstPart, keybinding.chordPart)];
        }
        else {
            keybinding = keybinding;
            if (!this._keyCodeExists[keybinding.keyCode]) {
                return [];
            }
            return [new WindowsNativeResolvedKeybinding(this, keybinding, null)];
        }
    }
    resolveKeyboardEvent(keyboardEvent) {
        const keybinding = new keyboard_1.SimpleKeybinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
        return new WindowsNativeResolvedKeybinding(this, keybinding, null);
    }
    _resolveSimpleUserBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding instanceof keyboard_1.SimpleKeybinding) {
            if (!this._keyCodeExists[binding.keyCode]) {
                return null;
            }
            return binding;
        }
        const keyCode = this._scanCodeToKeyCode[binding.scanCode] || 0 /* Unknown */;
        if (keyCode === 0 /* Unknown */ || !this._keyCodeExists[keyCode]) {
            return null;
        }
        return new keyboard_1.SimpleKeybinding(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, keyCode);
    }
    resolveUserBinding(firstPart, chordPart) {
        const _firstPart = this._resolveSimpleUserBinding(firstPart);
        const _chordPart = this._resolveSimpleUserBinding(chordPart);
        if (_firstPart && _chordPart) {
            return [new WindowsNativeResolvedKeybinding(this, _firstPart, _chordPart)];
        }
        if (_firstPart) {
            return [new WindowsNativeResolvedKeybinding(this, _firstPart, null)];
        }
        return [];
    }
}
exports.WindowsKeyboardMapper = WindowsKeyboardMapper;
// See https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
// See https://github.com/Microsoft/node-native-keymap/blob/master/deps/chromium/keyboard_codes_win.h
function _getNativeMap() {
    return {
        VK_BACK: 1 /* Backspace */,
        VK_TAB: 2 /* Tab */,
        VK_CLEAR: 0 /* Unknown */,
        VK_RETURN: 3 /* Enter */,
        VK_SHIFT: 4 /* Shift */,
        VK_CONTROL: 5 /* Ctrl */,
        VK_MENU: 6 /* Alt */,
        VK_PAUSE: 7 /* PauseBreak */,
        VK_CAPITAL: 8 /* CapsLock */,
        VK_KANA: 0 /* Unknown */,
        VK_HANGUL: 0 /* Unknown */,
        VK_JUNJA: 0 /* Unknown */,
        VK_FINAL: 0 /* Unknown */,
        VK_HANJA: 0 /* Unknown */,
        VK_KANJI: 0 /* Unknown */,
        VK_ESCAPE: 9 /* Escape */,
        VK_CONVERT: 0 /* Unknown */,
        VK_NONCONVERT: 0 /* Unknown */,
        VK_ACCEPT: 0 /* Unknown */,
        VK_MODECHANGE: 0 /* Unknown */,
        VK_SPACE: 10 /* Space */,
        VK_PRIOR: 11 /* PageUp */,
        VK_NEXT: 12 /* PageDown */,
        VK_END: 13 /* End */,
        VK_HOME: 14 /* Home */,
        VK_LEFT: 15 /* LeftArrow */,
        VK_UP: 16 /* UpArrow */,
        VK_RIGHT: 17 /* RightArrow */,
        VK_DOWN: 18 /* DownArrow */,
        VK_SELECT: 0 /* Unknown */,
        VK_PRINT: 0 /* Unknown */,
        VK_EXECUTE: 0 /* Unknown */,
        VK_SNAPSHOT: 0 /* Unknown */,
        VK_INSERT: 19 /* Insert */,
        VK_DELETE: 20 /* Delete */,
        VK_HELP: 0 /* Unknown */,
        VK_0: 21 /* KEY_0 */,
        VK_1: 22 /* KEY_1 */,
        VK_2: 23 /* KEY_2 */,
        VK_3: 24 /* KEY_3 */,
        VK_4: 25 /* KEY_4 */,
        VK_5: 26 /* KEY_5 */,
        VK_6: 27 /* KEY_6 */,
        VK_7: 28 /* KEY_7 */,
        VK_8: 29 /* KEY_8 */,
        VK_9: 30 /* KEY_9 */,
        VK_A: 31 /* KEY_A */,
        VK_B: 32 /* KEY_B */,
        VK_C: 33 /* KEY_C */,
        VK_D: 34 /* KEY_D */,
        VK_E: 35 /* KEY_E */,
        VK_F: 36 /* KEY_F */,
        VK_G: 37 /* KEY_G */,
        VK_H: 38 /* KEY_H */,
        VK_I: 39 /* KEY_I */,
        VK_J: 40 /* KEY_J */,
        VK_K: 41 /* KEY_K */,
        VK_L: 42 /* KEY_L */,
        VK_M: 43 /* KEY_M */,
        VK_N: 44 /* KEY_N */,
        VK_O: 45 /* KEY_O */,
        VK_P: 46 /* KEY_P */,
        VK_Q: 47 /* KEY_Q */,
        VK_R: 48 /* KEY_R */,
        VK_S: 49 /* KEY_S */,
        VK_T: 50 /* KEY_T */,
        VK_U: 51 /* KEY_U */,
        VK_V: 52 /* KEY_V */,
        VK_W: 53 /* KEY_W */,
        VK_X: 54 /* KEY_X */,
        VK_Y: 55 /* KEY_Y */,
        VK_Z: 56 /* KEY_Z */,
        VK_LWIN: 57 /* Meta */,
        VK_COMMAND: 57 /* Meta */,
        VK_RWIN: 57 /* Meta */,
        VK_APPS: 0 /* Unknown */,
        VK_SLEEP: 0 /* Unknown */,
        VK_NUMPAD0: 93 /* NUMPAD_0 */,
        VK_NUMPAD1: 94 /* NUMPAD_1 */,
        VK_NUMPAD2: 95 /* NUMPAD_2 */,
        VK_NUMPAD3: 96 /* NUMPAD_3 */,
        VK_NUMPAD4: 97 /* NUMPAD_4 */,
        VK_NUMPAD5: 98 /* NUMPAD_5 */,
        VK_NUMPAD6: 99 /* NUMPAD_6 */,
        VK_NUMPAD7: 100 /* NUMPAD_7 */,
        VK_NUMPAD8: 101 /* NUMPAD_8 */,
        VK_NUMPAD9: 102 /* NUMPAD_9 */,
        VK_MULTIPLY: 103 /* NUMPAD_MULTIPLY */,
        VK_ADD: 104 /* NUMPAD_ADD */,
        VK_SEPARATOR: 105 /* NUMPAD_SEPARATOR */,
        VK_SUBTRACT: 106 /* NUMPAD_SUBTRACT */,
        VK_DECIMAL: 107 /* NUMPAD_DECIMAL */,
        VK_DIVIDE: 108 /* NUMPAD_DIVIDE */,
        VK_F1: 59 /* F1 */,
        VK_F2: 60 /* F2 */,
        VK_F3: 61 /* F3 */,
        VK_F4: 62 /* F4 */,
        VK_F5: 63 /* F5 */,
        VK_F6: 64 /* F6 */,
        VK_F7: 65 /* F7 */,
        VK_F8: 66 /* F8 */,
        VK_F9: 67 /* F9 */,
        VK_F10: 68 /* F10 */,
        VK_F11: 69 /* F11 */,
        VK_F12: 70 /* F12 */,
        VK_F13: 71 /* F13 */,
        VK_F14: 72 /* F14 */,
        VK_F15: 73 /* F15 */,
        VK_F16: 74 /* F16 */,
        VK_F17: 75 /* F17 */,
        VK_F18: 76 /* F18 */,
        VK_F19: 77 /* F19 */,
        VK_F20: 0 /* Unknown */,
        VK_F21: 0 /* Unknown */,
        VK_F22: 0 /* Unknown */,
        VK_F23: 0 /* Unknown */,
        VK_F24: 0 /* Unknown */,
        VK_NUMLOCK: 78 /* NumLock */,
        VK_SCROLL: 79 /* ScrollLock */,
        VK_LSHIFT: 4 /* Shift */,
        VK_RSHIFT: 4 /* Shift */,
        VK_LCONTROL: 5 /* Ctrl */,
        VK_RCONTROL: 5 /* Ctrl */,
        VK_LMENU: 0 /* Unknown */,
        VK_RMENU: 0 /* Unknown */,
        VK_BROWSER_BACK: 0 /* Unknown */,
        VK_BROWSER_FORWARD: 0 /* Unknown */,
        VK_BROWSER_REFRESH: 0 /* Unknown */,
        VK_BROWSER_STOP: 0 /* Unknown */,
        VK_BROWSER_SEARCH: 0 /* Unknown */,
        VK_BROWSER_FAVORITES: 0 /* Unknown */,
        VK_BROWSER_HOME: 0 /* Unknown */,
        VK_VOLUME_MUTE: 0 /* Unknown */,
        VK_VOLUME_DOWN: 0 /* Unknown */,
        VK_VOLUME_UP: 0 /* Unknown */,
        VK_MEDIA_NEXT_TRACK: 0 /* Unknown */,
        VK_MEDIA_PREV_TRACK: 0 /* Unknown */,
        VK_MEDIA_STOP: 0 /* Unknown */,
        VK_MEDIA_PLAY_PAUSE: 0 /* Unknown */,
        VK_MEDIA_LAUNCH_MAIL: 0 /* Unknown */,
        VK_MEDIA_LAUNCH_MEDIA_SELECT: 0 /* Unknown */,
        VK_MEDIA_LAUNCH_APP1: 0 /* Unknown */,
        VK_MEDIA_LAUNCH_APP2: 0 /* Unknown */,
        VK_OEM_1: 80 /* US_SEMICOLON */,
        VK_OEM_PLUS: 81 /* US_EQUAL */,
        VK_OEM_COMMA: 82 /* US_COMMA */,
        VK_OEM_MINUS: 83 /* US_MINUS */,
        VK_OEM_PERIOD: 84 /* US_DOT */,
        VK_OEM_2: 85 /* US_SLASH */,
        VK_OEM_3: 86 /* US_BACKTICK */,
        VK_ABNT_C1: 110 /* ABNT_C1 */,
        VK_ABNT_C2: 111 /* ABNT_C2 */,
        VK_OEM_4: 87 /* US_OPEN_SQUARE_BRACKET */,
        VK_OEM_5: 88 /* US_BACKSLASH */,
        VK_OEM_6: 89 /* US_CLOSE_SQUARE_BRACKET */,
        VK_OEM_7: 90 /* US_QUOTE */,
        VK_OEM_8: 91 /* OEM_8 */,
        VK_OEM_102: 92 /* OEM_102 */,
        VK_PROCESSKEY: 0 /* Unknown */,
        VK_PACKET: 0 /* Unknown */,
        VK_DBE_SBCSCHAR: 0 /* Unknown */,
        VK_DBE_DBCSCHAR: 0 /* Unknown */,
        VK_ATTN: 0 /* Unknown */,
        VK_CRSEL: 0 /* Unknown */,
        VK_EXSEL: 0 /* Unknown */,
        VK_EREOF: 0 /* Unknown */,
        VK_PLAY: 0 /* Unknown */,
        VK_ZOOM: 0 /* Unknown */,
        VK_NONAME: 0 /* Unknown */,
        VK_PA1: 0 /* Unknown */,
        VK_OEM_CLEAR: 0 /* Unknown */,
        VK_UNKNOWN: 0 /* Unknown */,
    };
}
