"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createKeybinding(keybinding, OS) {
    if (keybinding === 0) {
        return null;
    }
    const firstPart = (keybinding & 0x0000ffff) >>> 0;
    const chordPart = (keybinding & 0xffff0000) >>> 16;
    if (chordPart !== 0) {
        return new ChordKeybinding(createSimpleKeybinding(firstPart, OS), createSimpleKeybinding(chordPart, OS));
    }
    return createSimpleKeybinding(firstPart, OS);
}
exports.createKeybinding = createKeybinding;
function createSimpleKeybinding(keybinding, OS) {
    const ctrlCmd = (keybinding & 2048 /* CtrlCmd */ ? true : false);
    const winCtrl = (keybinding & 256 /* WinCtrl */ ? true : false);
    const ctrlKey = (OS === 2 /* Macintosh */ ? winCtrl : ctrlCmd);
    const shiftKey = (keybinding & 1024 /* Shift */ ? true : false);
    const altKey = (keybinding & 512 /* Alt */ ? true : false);
    const metaKey = (OS === 2 /* Macintosh */ ? ctrlCmd : winCtrl);
    const keyCode = (keybinding & 255 /* KeyCode */);
    return new SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
exports.createSimpleKeybinding = createSimpleKeybinding;
class SimpleKeybinding {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.type = 1 /* Simple */;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    equals(other) {
        if (other.type !== 1 /* Simple */) {
            return false;
        }
        other = other;
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.keyCode === other.keyCode);
    }
    getHashCode() {
        let ctrl = this.ctrlKey ? '1' : '0';
        let shift = this.shiftKey ? '1' : '0';
        let alt = this.altKey ? '1' : '0';
        let meta = this.metaKey ? '1' : '0';
        return `${ctrl}${shift}${alt}${meta}${this.keyCode}`;
    }
    isModifierKey() {
        return (this.keyCode === 0 /* Unknown */
            || this.keyCode === 5 /* Ctrl */
            || this.keyCode === 57 /* Meta */
            || this.keyCode === 6 /* Alt */
            || this.keyCode === 4 /* Shift */);
    }
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase() {
        return ((this.ctrlKey && this.keyCode === 5 /* Ctrl */)
            || (this.shiftKey && this.keyCode === 4 /* Shift */)
            || (this.altKey && this.keyCode === 6 /* Alt */)
            || (this.metaKey && this.keyCode === 57 /* Meta */));
    }
}
exports.SimpleKeybinding = SimpleKeybinding;
class ChordKeybinding {
    constructor(firstPart, chordPart) {
        this.type = 2 /* Chord */;
        this.firstPart = firstPart;
        this.chordPart = chordPart;
    }
    getHashCode() {
        return `${this.firstPart.getHashCode()};${this.chordPart.getHashCode()}`;
    }
}
exports.ChordKeybinding = ChordKeybinding;
