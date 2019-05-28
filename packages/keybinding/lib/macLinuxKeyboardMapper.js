"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keyboard_1 = require("@fin/keyboard");
const keyboard_2 = require("@fin/keyboard");
const keyboard_3 = require("@fin/keyboard");
const resolvedKeybinding_1 = require("./resolvedKeybinding");
const keybindingLabels_1 = require("./keybindingLabels");
function macLinuxKeyMappingEquals(a, b) {
    if (!a && !b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return (a.value === b.value);
}
function macLinuxKeyboardMappingEquals(a, b) {
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
        if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
            return false;
        }
    }
    return true;
}
exports.macLinuxKeyboardMappingEquals = macLinuxKeyboardMappingEquals;
/**
 * A shellMap from character to key codes.
 * e.g. Contains entries such as:
 *  - '/' => { keyCode: KeyCode.US_SLASH, shiftKey: false }
 *  - '?' => { keyCode: KeyCode.US_SLASH, shiftKey: true }
 */
const CHAR_CODE_TO_KEY_CODE = [];
class NativeResolvedKeybinding extends resolvedKeybinding_1.ResolvedKeybinding {
    constructor(mapper, OS, firstPart, chordPart) {
        super();
        if (!firstPart) {
            throw new Error(`Invalid USLayoutResolvedKeybinding`);
        }
        this._mapper = mapper;
        this._OS = OS;
        this._firstPart = firstPart;
        this._chordPart = chordPart;
    }
    getLabel() {
        let firstPart = this._mapper.getUILabelForScanCodeBinding(this._firstPart);
        let chordPart = this._mapper.getUILabelForScanCodeBinding(this._chordPart);
        return keybindingLabels_1.UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
    }
    getAriaLabel() {
        let firstPart = this._mapper.getAriaLabelForScanCodeBinding(this._firstPart);
        let chordPart = this._mapper.getAriaLabelForScanCodeBinding(this._chordPart);
        return keybindingLabels_1.AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
    }
    getUserSettingsLabel() {
        let firstPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._firstPart);
        let chordPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._chordPart);
        return keybindingLabels_1.UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
    }
    _isWYSIWYG(binding) {
        if (!binding) {
            return true;
        }
        if (keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1) {
            return true;
        }
        let a = this._mapper.getAriaLabelForScanCodeBinding(binding);
        let b = this._mapper.getUserSettingsLabelForScanCodeBinding(binding);
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.toLowerCase() === b.toLowerCase());
    }
    isWYSIWYG() {
        return (this._isWYSIWYG(this._firstPart) && this._isWYSIWYG(this._chordPart));
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
    _toResolvedKeybindingPart(binding) {
        if (!binding) {
            return null;
        }
        return new resolvedKeybinding_1.ResolvedKeybindingPart(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, this._mapper.getUILabelForScanCodeBinding(binding), this._mapper.getAriaLabelForScanCodeBinding(binding));
    }
    getDispatchParts() {
        let firstPart = this._firstPart ? this._mapper.getDispatchStrForScanCodeBinding(this._firstPart) : null;
        let chordPart = this._chordPart ? this._mapper.getDispatchStrForScanCodeBinding(this._chordPart) : null;
        return [firstPart, chordPart];
    }
}
exports.NativeResolvedKeybinding = NativeResolvedKeybinding;
class ScanCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.scanCode = scanCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyboard_1.ScanCodeUtils.toString(this.scanCode)}`;
    }
    equals(other) {
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.scanCode === other.scanCode);
    }
    getProducedCharCode(mapping) {
        if (!mapping) {
            return '';
        }
        return mapping.value;
    }
    getProducedChar(mapping) {
        const charCode = MacLinuxKeyboardMapper.getCharCode(this.getProducedCharCode(mapping));
        if (charCode === 0) {
            return ' --- ';
        }
        if (charCode >= 768 /* U_Combining_Grave_Accent */ && charCode <= 879 /* U_Combining_Latin_Small_Letter_X */) {
            // combining
            return 'U+' + charCode.toString(16);
        }
        return '  ' + String.fromCharCode(charCode) + '  ';
    }
}
class KeyCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.keyCode = keyCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyboard_2.KeyCodeUtils.toString(this.keyCode)}`;
    }
}
class ScanCodeKeyCodeMapper {
    constructor() {
        /**
         * ScanCode combination => KeyCode combination.
         * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
         */
        this._scanCodeToKeyCode = [];
        /**
         * inverse of `_scanCodeToKeyCode`.
         * KeyCode combination => ScanCode combination.
         * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
         */
        this._keyCodeToScanCode = [];
        this._scanCodeToKeyCode = [];
        this._keyCodeToScanCode = [];
    }
    registrationComplete() {
        // IntlHash and IntlBackslash are rare keys, so ensure they don't end up being the preferred...
        this._moveToEnd(56 /* IntlHash */);
        this._moveToEnd(106 /* IntlBackslash */);
    }
    _moveToEnd(scanCode) {
        for (let mod = 0; mod < 8; mod++) {
            const encodedKeyCodeCombos = this._scanCodeToKeyCode[(scanCode << 3) + mod];
            if (!encodedKeyCodeCombos) {
                continue;
            }
            for (let i = 0, len = encodedKeyCodeCombos.length; i < len; i++) {
                const encodedScanCodeCombos = this._keyCodeToScanCode[encodedKeyCodeCombos[i]];
                if (encodedScanCodeCombos.length === 1) {
                    continue;
                }
                for (let j = 0, len = encodedScanCodeCombos.length; j < len; j++) {
                    const entry = encodedScanCodeCombos[j];
                    const entryScanCode = (entry >>> 3);
                    if (entryScanCode === scanCode) {
                        // Move this entry to the end
                        for (let k = j + 1; k < len; k++) {
                            encodedScanCodeCombos[k - 1] = encodedScanCodeCombos[k];
                        }
                        encodedScanCodeCombos[len - 1] = entry;
                    }
                }
            }
        }
    }
    registerIfUnknown(scanCodeCombo, keyCodeCombo) {
        if (keyCodeCombo.keyCode === 0 /* Unknown */) {
            return;
        }
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const keyCodeIsDigit = (keyCodeCombo.keyCode >= 21 /* KEY_0 */ && keyCodeCombo.keyCode <= 30 /* KEY_9 */);
        const keyCodeIsLetter = (keyCodeCombo.keyCode >= 31 /* KEY_A */ && keyCodeCombo.keyCode <= 56 /* KEY_Z */);
        const existingKeyCodeCombos = this._scanCodeToKeyCode[scanCodeComboEncoded];
        // Allow a scan code to shellMap to multiple key codes if it is a digit or a letter key code
        if (keyCodeIsDigit || keyCodeIsLetter) {
            // Only check that we don't insert the same entry twice
            if (existingKeyCodeCombos) {
                for (let i = 0, len = existingKeyCodeCombos.length; i < len; i++) {
                    if (existingKeyCodeCombos[i] === keyCodeComboEncoded) {
                        // avoid duplicates
                        return;
                    }
                }
            }
        }
        else {
            // Don't allow multiples
            if (existingKeyCodeCombos && existingKeyCodeCombos.length !== 0) {
                return;
            }
        }
        this._scanCodeToKeyCode[scanCodeComboEncoded] = this._scanCodeToKeyCode[scanCodeComboEncoded] || [];
        this._scanCodeToKeyCode[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
        this._keyCodeToScanCode[keyCodeComboEncoded] = this._keyCodeToScanCode[keyCodeComboEncoded] || [];
        this._keyCodeToScanCode[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
    }
    lookupKeyCodeCombo(keyCodeCombo) {
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const scanCodeCombosEncoded = this._keyCodeToScanCode[keyCodeComboEncoded];
        if (!scanCodeCombosEncoded || scanCodeCombosEncoded.length === 0) {
            return [];
        }
        let result = [];
        for (let i = 0, len = scanCodeCombosEncoded.length; i < len; i++) {
            const scanCodeComboEncoded = scanCodeCombosEncoded[i];
            const ctrlKey = (scanCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (scanCodeComboEncoded & 0b010) ? true : false;
            const altKey = (scanCodeComboEncoded & 0b100) ? true : false;
            const scanCode = (scanCodeComboEncoded >>> 3);
            result[i] = new ScanCodeCombo(ctrlKey, shiftKey, altKey, scanCode);
        }
        return result;
    }
    lookupScanCodeCombo(scanCodeCombo) {
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeCombosEncoded = this._scanCodeToKeyCode[scanCodeComboEncoded];
        if (!keyCodeCombosEncoded || keyCodeCombosEncoded.length === 0) {
            return [];
        }
        let result = [];
        for (let i = 0, len = keyCodeCombosEncoded.length; i < len; i++) {
            const keyCodeComboEncoded = keyCodeCombosEncoded[i];
            const ctrlKey = (keyCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (keyCodeComboEncoded & 0b010) ? true : false;
            const altKey = (keyCodeComboEncoded & 0b100) ? true : false;
            const keyCode = (keyCodeComboEncoded >>> 3);
            result[i] = new KeyCodeCombo(ctrlKey, shiftKey, altKey, keyCode);
        }
        return result;
    }
    guessStableKeyCode(scanCode) {
        if (scanCode >= 36 /* Digit1 */ && scanCode <= 45 /* Digit0 */) {
            // digits are ok
            switch (scanCode) {
                case 36 /* Digit1 */:
                    return 22 /* KEY_1 */;
                case 37 /* Digit2 */:
                    return 23 /* KEY_2 */;
                case 38 /* Digit3 */:
                    return 24 /* KEY_3 */;
                case 39 /* Digit4 */:
                    return 25 /* KEY_4 */;
                case 40 /* Digit5 */:
                    return 26 /* KEY_5 */;
                case 41 /* Digit6 */:
                    return 27 /* KEY_6 */;
                case 42 /* Digit7 */:
                    return 28 /* KEY_7 */;
                case 43 /* Digit8 */:
                    return 29 /* KEY_8 */;
                case 44 /* Digit9 */:
                    return 30 /* KEY_9 */;
                case 45 /* Digit0 */:
                    return 21 /* KEY_0 */;
            }
        }
        // Lookup the scanCode with and without shift and see if the keyCode is stable
        const keyCodeCombos1 = this.lookupScanCodeCombo(new ScanCodeCombo(false, false, false, scanCode));
        const keyCodeCombos2 = this.lookupScanCodeCombo(new ScanCodeCombo(false, true, false, scanCode));
        if (keyCodeCombos1.length === 1 && keyCodeCombos2.length === 1) {
            const shiftKey1 = keyCodeCombos1[0].shiftKey;
            const keyCode1 = keyCodeCombos1[0].keyCode;
            const shiftKey2 = keyCodeCombos2[0].shiftKey;
            const keyCode2 = keyCodeCombos2[0].keyCode;
            if (keyCode1 === keyCode2 && shiftKey1 !== shiftKey2) {
                // This looks like a stable mapping
                return keyCode1;
            }
        }
        return -1;
    }
    _encodeScanCodeCombo(scanCodeCombo) {
        return this._encode(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
    }
    _encodeKeyCodeCombo(keyCodeCombo) {
        return this._encode(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
    }
    _encode(ctrlKey, shiftKey, altKey, principal) {
        return (((ctrlKey ? 1 : 0) << 0)
            | ((shiftKey ? 1 : 0) << 1)
            | ((altKey ? 1 : 0) << 2)
            | principal << 3) >>> 0;
    }
}
class MacLinuxKeyboardMapper {
    constructor(isUSStandard, rawMappings, OS) {
        /**
         * UI label for a ScanCode.
         */
        this._scanCodeToLabel = [];
        /**
         * Dispatching string for a ScanCode.
         */
        this._scanCodeToDispatch = [];
        this._isUSStandard = isUSStandard;
        this._OS = OS;
        this._codeInfo = [];
        this._scanCodeKeyCodeMapper = new ScanCodeKeyCodeMapper();
        this._scanCodeToLabel = [];
        this._scanCodeToDispatch = [];
        const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
            this._scanCodeKeyCodeMapper.registerIfUnknown(new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode), new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode));
        };
        const _registerAllCombos = (_ctrlKey, _shiftKey, _altKey, scanCode, keyCode) => {
            for (let ctrlKey = _ctrlKey; ctrlKey <= 1; ctrlKey++) {
                for (let shiftKey = _shiftKey; shiftKey <= 1; shiftKey++) {
                    for (let altKey = _altKey; altKey <= 1; altKey++) {
                        _registerIfUnknown(ctrlKey, shiftKey, altKey, scanCode, ctrlKey, shiftKey, altKey, keyCode);
                    }
                }
            }
        };
        // Initialize `_scanCodeToLabel`
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            this._scanCodeToLabel[scanCode] = null;
        }
        // Initialize `_scanCodeToDispatch`
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            this._scanCodeToDispatch[scanCode] = null;
        }
        // Handle immutable mappings
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            const keyCode = keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (keyCode !== -1) {
                _registerAllCombos(0, 0, 0, scanCode, keyCode);
                this._scanCodeToLabel[scanCode] = keyboard_2.KeyCodeUtils.toString(keyCode);
                if (keyCode === 0 /* Unknown */ || keyCode === 5 /* Ctrl */ || keyCode === 57 /* Meta */ || keyCode === 6 /* Alt */ || keyCode === 4 /* Shift */) {
                    this._scanCodeToDispatch[scanCode] = null; // cannot dispatch on this ScanCode
                }
                else {
                    this._scanCodeToDispatch[scanCode] = `[${keyboard_1.ScanCodeUtils.toString(scanCode)}]`;
                }
            }
        }
        // Try to identify keyboard layouts where characters A-Z are missing
        // and forcefully shellMap them to their corresponding scan codes if that is the case
        const missingLatinLettersOverride = {};
        {
            let producesLatinLetter = [];
            for (let strScanCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strScanCode)) {
                    const scanCode = keyboard_1.ScanCodeUtils.toEnum(strScanCode);
                    if (scanCode === 0 /* None */) {
                        continue;
                    }
                    if (keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                        continue;
                    }
                    const rawMapping = rawMappings[strScanCode];
                    const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                    if (value >= 97 /* a */ && value <= 122 /* z */) {
                        const upperCaseValue = 65 /* A */ + (value - 97 /* a */);
                        producesLatinLetter[upperCaseValue] = true;
                    }
                }
            }
            const _registerLetterIfMissing = (charCode, scanCode, value, withShift) => {
                if (!producesLatinLetter[charCode]) {
                    missingLatinLettersOverride[keyboard_1.ScanCodeUtils.toString(scanCode)] = {
                        value: value,
                    };
                }
            };
            // Ensure letters are mapped
            _registerLetterIfMissing(65 /* A */, 10 /* KeyA */, 'a', 'A');
            _registerLetterIfMissing(66 /* B */, 11 /* KeyB */, 'b', 'B');
            _registerLetterIfMissing(67 /* C */, 12 /* KeyC */, 'c', 'C');
            _registerLetterIfMissing(68 /* D */, 13 /* KeyD */, 'd', 'D');
            _registerLetterIfMissing(69 /* E */, 14 /* KeyE */, 'e', 'E');
            _registerLetterIfMissing(70 /* F */, 15 /* KeyF */, 'f', 'F');
            _registerLetterIfMissing(71 /* G */, 16 /* KeyG */, 'g', 'G');
            _registerLetterIfMissing(72 /* H */, 17 /* KeyH */, 'h', 'H');
            _registerLetterIfMissing(73 /* I */, 18 /* KeyI */, 'i', 'I');
            _registerLetterIfMissing(74 /* J */, 19 /* KeyJ */, 'j', 'J');
            _registerLetterIfMissing(75 /* K */, 20 /* KeyK */, 'k', 'K');
            _registerLetterIfMissing(76 /* L */, 21 /* KeyL */, 'l', 'L');
            _registerLetterIfMissing(77 /* M */, 22 /* KeyM */, 'm', 'M');
            _registerLetterIfMissing(78 /* N */, 23 /* KeyN */, 'n', 'N');
            _registerLetterIfMissing(79 /* O */, 24 /* KeyO */, 'o', 'O');
            _registerLetterIfMissing(80 /* P */, 25 /* KeyP */, 'p', 'P');
            _registerLetterIfMissing(81 /* Q */, 26 /* KeyQ */, 'q', 'Q');
            _registerLetterIfMissing(82 /* R */, 27 /* KeyR */, 'r', 'R');
            _registerLetterIfMissing(83 /* S */, 28 /* KeyS */, 's', 'S');
            _registerLetterIfMissing(84 /* T */, 29 /* KeyT */, 't', 'T');
            _registerLetterIfMissing(85 /* U */, 30 /* KeyU */, 'u', 'U');
            _registerLetterIfMissing(86 /* V */, 31 /* KeyV */, 'v', 'V');
            _registerLetterIfMissing(87 /* W */, 32 /* KeyW */, 'w', 'W');
            _registerLetterIfMissing(88 /* X */, 33 /* KeyX */, 'x', 'X');
            _registerLetterIfMissing(89 /* Y */, 34 /* KeyY */, 'y', 'Y');
            _registerLetterIfMissing(90 /* Z */, 35 /* KeyZ */, 'z', 'Z');
        }
        let mappings = [], mappingsLen = 0;
        for (let strScanCode in rawMappings) {
            if (rawMappings.hasOwnProperty(strScanCode)) {
                const scanCode = keyboard_1.ScanCodeUtils.toEnum(strScanCode);
                if (scanCode === 0 /* None */) {
                    continue;
                }
                if (keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                    continue;
                }
                this._codeInfo[scanCode] = rawMappings[strScanCode];
                const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
                const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                const mapping = {
                    scanCode: scanCode,
                    value: value,
                };
                mappings[mappingsLen++] = mapping;
                this._scanCodeToDispatch[scanCode] = `[${keyboard_1.ScanCodeUtils.toString(scanCode)}]`;
                if (value >= 97 /* a */ && value <= 122 /* z */) {
                    const upperCaseValue = 65 /* A */ + (value - 97 /* a */);
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(upperCaseValue);
                }
                else if (value >= 65 /* A */ && value <= 90 /* Z */) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else if (value) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else {
                    this._scanCodeToLabel[scanCode] = null;
                }
            }
        }
        // Handle all `value` entries
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const kb = MacLinuxKeyboardMapper._charCodeToKb(mapping.value);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                // ScanCode => Shift+KeyCode
                _registerIfUnknown(0, 0, 0, scanCode, 0, 1, 0, keyCode); //                ScanCode =>          Shift+KeyCode
                _registerIfUnknown(0, 0, 1, scanCode, 0, 1, 1, keyCode); //            Alt+ScanCode =>      Shift+Alt+KeyCode
                _registerIfUnknown(1, 0, 0, scanCode, 1, 1, 0, keyCode); //           Ctrl+ScanCode =>     Ctrl+Shift+KeyCode
                _registerIfUnknown(1, 0, 1, scanCode, 1, 1, 1, keyCode); //       Ctrl+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
            }
            else {
                // ScanCode => KeyCode
                _registerIfUnknown(0, 0, 0, scanCode, 0, 0, 0, keyCode); //                ScanCode =>                KeyCode
                _registerIfUnknown(0, 0, 1, scanCode, 0, 0, 1, keyCode); //            Alt+ScanCode =>            Alt+KeyCode
                _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode); //          Shift+ScanCode =>          Shift+KeyCode
                _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode); //      Shift+Alt+ScanCode =>      Shift+Alt+KeyCode
                _registerIfUnknown(1, 0, 0, scanCode, 1, 0, 0, keyCode); //           Ctrl+ScanCode =>           Ctrl+KeyCode
                _registerIfUnknown(1, 0, 1, scanCode, 1, 0, 1, keyCode); //       Ctrl+Alt+ScanCode =>       Ctrl+Alt+KeyCode
                _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode); //     Ctrl+Shift+ScanCode =>     Ctrl+Shift+KeyCode
                _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode); // Ctrl+Shift+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
            }
        }
        // Handle all left-over available digits
        _registerAllCombos(0, 0, 0, 36 /* Digit1 */, 22 /* KEY_1 */);
        _registerAllCombos(0, 0, 0, 37 /* Digit2 */, 23 /* KEY_2 */);
        _registerAllCombos(0, 0, 0, 38 /* Digit3 */, 24 /* KEY_3 */);
        _registerAllCombos(0, 0, 0, 39 /* Digit4 */, 25 /* KEY_4 */);
        _registerAllCombos(0, 0, 0, 40 /* Digit5 */, 26 /* KEY_5 */);
        _registerAllCombos(0, 0, 0, 41 /* Digit6 */, 27 /* KEY_6 */);
        _registerAllCombos(0, 0, 0, 42 /* Digit7 */, 28 /* KEY_7 */);
        _registerAllCombos(0, 0, 0, 43 /* Digit8 */, 29 /* KEY_8 */);
        _registerAllCombos(0, 0, 0, 44 /* Digit9 */, 30 /* KEY_9 */);
        _registerAllCombos(0, 0, 0, 45 /* Digit0 */, 21 /* KEY_0 */);
        this._scanCodeKeyCodeMapper.registrationComplete();
    }
    dumpDebugInfo() {
        let result = [];
        let immutableSamples = [
            88 /* ArrowUp */,
            104 /* Numpad0 */
        ];
        let cnt = 0;
        result.push(`isUSStandard: ${this._isUSStandard}`);
        result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
        for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
            if (keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                if (immutableSamples.indexOf(scanCode) === -1) {
                    continue;
                }
            }
            if (cnt % 4 === 0) {
                result.push(`|       HW Code combination      |  Key  |    KeyCode combination    | Pri |          UI label         |         User settings          |    Electron accelerator   |       Dispatching string       | WYSIWYG |`);
                result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            }
            cnt++;
            const mapping = this._codeInfo[scanCode];
            for (let mod = 0; mod < 8; mod++) {
                const hwCtrlKey = (mod & 0b001) ? true : false;
                const hwShiftKey = (mod & 0b010) ? true : false;
                const hwAltKey = (mod & 0b100) ? true : false;
                const scanCodeCombo = new ScanCodeCombo(hwCtrlKey, hwShiftKey, hwAltKey, scanCode);
                const resolvedKb = this.resolveKeyboardEvent({
                    ctrlKey: scanCodeCombo.ctrlKey,
                    shiftKey: scanCodeCombo.shiftKey,
                    altKey: scanCodeCombo.altKey,
                    metaKey: false,
                    keyCode: -1,
                    code: keyboard_1.ScanCodeUtils.toString(scanCode)
                });
                const outScanCodeCombo = scanCodeCombo.toString();
                const outKey = scanCodeCombo.getProducedChar(mapping);
                const ariaLabel = resolvedKb.getAriaLabel();
                const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                const outUserSettings = resolvedKb.getUserSettingsLabel();
                const outDispatchStr = resolvedKb.getDispatchParts()[0];
                const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                const kbCombos = this._scanCodeKeyCodeMapper.lookupScanCodeCombo(scanCodeCombo);
                if (kbCombos.length === 0) {
                    result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad('', 25)} | ${this._leftPad('', 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)}  | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                }
                else {
                    for (let i = 0, len = kbCombos.length; i < len; i++) {
                        const kbCombo = kbCombos[i];
                        // find out the priority of this scan code for this key code
                        let colPriority = '-';
                        const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(kbCombo);
                        if (scanCodeCombos.length === 1) {
                            // no need for priority, this key code combo maps to precisely this scan code combo
                            colPriority = '';
                        }
                        else {
                            let priority = -1;
                            for (let j = 0; j < scanCodeCombos.length; j++) {
                                if (scanCodeCombos[j].equals(scanCodeCombo)) {
                                    priority = j + 1;
                                    break;
                                }
                            }
                            colPriority = String(priority);
                        }
                        const outKeybinding = kbCombo.toString();
                        if (i === 0) {
                            result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                        }
                        else {
                            // secondary keybindings
                            result.push(`| ${this._leftPad('', 30)} |       | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} |         |`);
                        }
                    }
                }
            }
            result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
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
    simpleKeybindingToScanCodeBinding(keybinding) {
        // Avoid double Enter bindings (both ScanCode.NumpadEnter and ScanCode.Enter point to KeyCode.Enter)
        if (keybinding.keyCode === 3 /* Enter */) {
            return [new keyboard_1.ScanCodeBinding(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, 46 /* Enter */)];
        }
        const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(new KeyCodeCombo(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.keyCode));
        let result = [];
        for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
            const scanCodeCombo = scanCodeCombos[i];
            result[i] = new keyboard_1.ScanCodeBinding(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, keybinding.metaKey, scanCodeCombo.scanCode);
        }
        return result;
    }
    getUILabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        if (this._OS === 2 /* Macintosh */) {
            switch (binding.scanCode) {
                case 86 /* ArrowLeft */:
                    return '←';
                case 88 /* ArrowUp */:
                    return '↑';
                case 85 /* ArrowRight */:
                    return '→';
                case 87 /* ArrowDown */:
                    return '↓';
            }
        }
        return this._scanCodeToLabel[binding.scanCode];
    }
    getAriaLabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        return this._scanCodeToLabel[binding.scanCode];
    }
    getDispatchStrForScanCodeBinding(keypress) {
        const codeDispatch = this._scanCodeToDispatch[keypress.scanCode];
        if (!codeDispatch) {
            return null;
        }
        let result = '';
        if (keypress.ctrlKey) {
            result += 'ctrl+';
        }
        if (keypress.shiftKey) {
            result += 'shift+';
        }
        if (keypress.altKey) {
            result += 'alt+';
        }
        if (keypress.metaKey) {
            result += 'meta+';
        }
        result += codeDispatch;
        return result;
    }
    getUserSettingsLabelForScanCodeBinding(binding) {
        if (!binding) {
            return null;
        }
        if (binding.isDuplicateModifierCase()) {
            return '';
        }
        const immutableKeyCode = keyboard_1.IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode];
        if (immutableKeyCode !== -1) {
            return keyboard_2.KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
        }
        // Check if this scanCode always maps to the same keyCode and back
        let constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(binding.scanCode);
        if (constantKeyCode !== -1) {
            // Verify that this is a good key code that can be mapped back to the same scan code
            let reverseBindings = this.simpleKeybindingToScanCodeBinding(new keyboard_3.SimpleKeybinding(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, constantKeyCode));
            for (let i = 0, len = reverseBindings.length; i < len; i++) {
                const reverseBinding = reverseBindings[i];
                if (reverseBinding.scanCode === binding.scanCode) {
                    return keyboard_2.KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
                }
            }
        }
        return this._scanCodeToDispatch[binding.scanCode];
    }
    resolveKeybinding(keybinding) {
        let result = [], resultLen = 0;
        if (keybinding.type === 2 /* Chord */) {
            keybinding = keybinding;
            const firstParts = this.simpleKeybindingToScanCodeBinding(keybinding.firstPart);
            const chordParts = this.simpleKeybindingToScanCodeBinding(keybinding.chordPart);
            for (let i = 0, len = firstParts.length; i < len; i++) {
                const firstPart = firstParts[i];
                for (let j = 0, lenJ = chordParts.length; j < lenJ; j++) {
                    const chordPart = chordParts[j];
                    result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, chordPart);
                }
            }
        }
        else {
            const firstParts = this.simpleKeybindingToScanCodeBinding(keybinding);
            for (let i = 0, len = firstParts.length; i < len; i++) {
                const firstPart = firstParts[i];
                result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, null);
            }
        }
        return result;
    }
    resolveKeyboardEvent(keyboardEvent) {
        let code = keyboard_1.ScanCodeUtils.toEnum(keyboardEvent.code);
        // Treat NumpadEnter as Enter
        if (code === 94 /* NumpadEnter */) {
            code = 46 /* Enter */;
        }
        const keyCode = keyboardEvent.keyCode;
        if ((keyCode === 15 /* LeftArrow */)
            || (keyCode === 16 /* UpArrow */)
            || (keyCode === 17 /* RightArrow */)
            || (keyCode === 18 /* DownArrow */)
            || (keyCode === 20 /* Delete */)
            || (keyCode === 19 /* Insert */)
            || (keyCode === 14 /* Home */)
            || (keyCode === 13 /* End */)
            || (keyCode === 12 /* PageDown */)
            || (keyCode === 11 /* PageUp */)) {
            // "Dispatch" on keyCode for these key codes to workaround issues with remote desktoping software
            // where the scan codes appear to be incorrect (see https://github.com/Microsoft/vscode/issues/24107)
            const immutableScanCode = keyboard_1.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
            if (immutableScanCode !== -1) {
                code = immutableScanCode;
            }
        }
        else {
            if ((code === 95 /* Numpad1 */)
                || (code === 96 /* Numpad2 */)
                || (code === 97 /* Numpad3 */)
                || (code === 98 /* Numpad4 */)
                || (code === 99 /* Numpad5 */)
                || (code === 100 /* Numpad6 */)
                || (code === 101 /* Numpad7 */)
                || (code === 102 /* Numpad8 */)
                || (code === 103 /* Numpad9 */)
                || (code === 104 /* Numpad0 */)
                || (code === 105 /* NumpadDecimal */)) {
                // "Dispatch" on keyCode for all numpad keys in order for NumLock to work correctly
                if (keyCode >= 0) {
                    const immutableScanCode = keyboard_1.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
                    if (immutableScanCode !== -1) {
                        code = immutableScanCode;
                    }
                }
            }
        }
        const keypress = new keyboard_1.ScanCodeBinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, code);
        return new NativeResolvedKeybinding(this, this._OS, keypress, null);
    }
    _resolveSimpleUserBinding(binding) {
        if (!binding) {
            return [];
        }
        if (binding instanceof keyboard_1.ScanCodeBinding) {
            return [binding];
        }
        return this.simpleKeybindingToScanCodeBinding(binding);
    }
    resolveUserBinding(_firstPart, _chordPart) {
        const firstParts = this._resolveSimpleUserBinding(_firstPart);
        const chordParts = this._resolveSimpleUserBinding(_chordPart);
        let result = [], resultLen = 0;
        for (let i = 0, len = firstParts.length; i < len; i++) {
            const firstPart = firstParts[i];
            if (_chordPart) {
                for (let j = 0, lenJ = chordParts.length; j < lenJ; j++) {
                    const chordPart = chordParts[j];
                    result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, chordPart);
                }
            }
            else {
                result[resultLen++] = new NativeResolvedKeybinding(this, this._OS, firstPart, null);
            }
        }
        return result;
    }
    static _charCodeToKb(charCode) {
        if (charCode < CHAR_CODE_TO_KEY_CODE.length) {
            return CHAR_CODE_TO_KEY_CODE[charCode];
        }
        return null;
    }
    /**
     * Attempt to shellMap a combining character to a regular one that renders the same way.
     *
     * To the brave person following me: Good Luck!
     * https://www.compart.com/en/unicode/bidiclass/NSM
     */
    static getCharCode(char) {
        if (char.length === 0) {
            return 0;
        }
        const charCode = char.charCodeAt(0);
        switch (charCode) {
            case 768 /* U_Combining_Grave_Accent */:
                return 96 /* U_GRAVE_ACCENT */;
            case 769 /* U_Combining_Acute_Accent */:
                return 180 /* U_ACUTE_ACCENT */;
            case 770 /* U_Combining_Circumflex_Accent */:
                return 94 /* U_CIRCUMFLEX */;
            case 771 /* U_Combining_Tilde */:
                return 732 /* U_SMALL_TILDE */;
            case 772 /* U_Combining_Macron */:
                return 175 /* U_MACRON */;
            case 773 /* U_Combining_Overline */:
                return 8254 /* U_OVERLINE */;
            case 774 /* U_Combining_Breve */:
                return 728 /* U_BREVE */;
            case 775 /* U_Combining_Dot_Above */:
                return 729 /* U_DOT_ABOVE */;
            case 776 /* U_Combining_Diaeresis */:
                return 168 /* U_DIAERESIS */;
            case 778 /* U_Combining_Ring_Above */:
                return 730 /* U_RING_ABOVE */;
            case 779 /* U_Combining_Double_Acute_Accent */:
                return 733 /* U_DOUBLE_ACUTE_ACCENT */;
        }
        return charCode;
    }
}
exports.MacLinuxKeyboardMapper = MacLinuxKeyboardMapper;
(function () {
    function define(charCode, keyCode, shiftKey) {
        for (let i = CHAR_CODE_TO_KEY_CODE.length; i < charCode; i++) {
            CHAR_CODE_TO_KEY_CODE[i] = null;
        }
        CHAR_CODE_TO_KEY_CODE[charCode] = { keyCode: keyCode, shiftKey: shiftKey };
    }
    for (let chCode = 65 /* A */; chCode <= 90 /* Z */; chCode++) {
        define(chCode, 31 /* KEY_A */ + (chCode - 65 /* A */), true);
    }
    for (let chCode = 97 /* a */; chCode <= 122 /* z */; chCode++) {
        define(chCode, 31 /* KEY_A */ + (chCode - 97 /* a */), false);
    }
    define(59 /* Semicolon */, 80 /* US_SEMICOLON */, false);
    define(58 /* Colon */, 80 /* US_SEMICOLON */, true);
    define(61 /* Equals */, 81 /* US_EQUAL */, false);
    define(43 /* Plus */, 81 /* US_EQUAL */, true);
    define(44 /* Comma */, 82 /* US_COMMA */, false);
    define(60 /* LessThan */, 82 /* US_COMMA */, true);
    define(45 /* Dash */, 83 /* US_MINUS */, false);
    define(95 /* Underline */, 83 /* US_MINUS */, true);
    define(46 /* Period */, 84 /* US_DOT */, false);
    define(62 /* GreaterThan */, 84 /* US_DOT */, true);
    define(47 /* Slash */, 85 /* US_SLASH */, false);
    define(63 /* QuestionMark */, 85 /* US_SLASH */, true);
    define(96 /* BackTick */, 86 /* US_BACKTICK */, false);
    define(126 /* Tilde */, 86 /* US_BACKTICK */, true);
    define(91 /* OpenSquareBracket */, 87 /* US_OPEN_SQUARE_BRACKET */, false);
    define(123 /* OpenCurlyBrace */, 87 /* US_OPEN_SQUARE_BRACKET */, true);
    define(92 /* Backslash */, 88 /* US_BACKSLASH */, false);
    define(124 /* Pipe */, 88 /* US_BACKSLASH */, true);
    define(93 /* CloseSquareBracket */, 89 /* US_CLOSE_SQUARE_BRACKET */, false);
    define(125 /* CloseCurlyBrace */, 89 /* US_CLOSE_SQUARE_BRACKET */, true);
    define(39 /* SingleQuote */, 90 /* US_QUOTE */, false);
    define(34 /* DoubleQuote */, 90 /* US_QUOTE */, true);
})();
