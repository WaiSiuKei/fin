"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModifierLabelProvider {
    constructor(mac, windows, linux = windows) {
        this.modifierLabels = [null];
        this.modifierLabels[2 /* Macintosh */] = mac;
        this.modifierLabels[1 /* Windows */] = windows;
        this.modifierLabels[3 /* Linux */] = linux;
    }
    toLabel(firstPartMod, firstPartKey, chordPartMod, chordPartKey, OS) {
        if (firstPartKey === null && chordPartKey === null) {
            return null;
        }
        return _asString(firstPartMod, firstPartKey, chordPartMod, chordPartKey, this.modifierLabels[OS]);
    }
}
exports.ModifierLabelProvider = ModifierLabelProvider;
/**
 * A label provider that prints modifiers in a suitable format for displaying in the UI.
 */
exports.UILabelProvider = new ModifierLabelProvider({
    ctrlKey: '⌃',
    shiftKey: '⇧',
    altKey: '⌥',
    metaKey: '⌘',
    separator: '',
}, {
    ctrlKey: 'Ctrl',
    shiftKey: 'Shift',
    altKey: 'Alt',
    metaKey: 'Windows',
    separator: '+',
});
/**
 * A label provider that prints modifiers in a suitable format for ARIA.
 */
exports.AriaLabelProvider = new ModifierLabelProvider({
    ctrlKey: 'Control',
    shiftKey: 'Shift',
    altKey: 'Alt',
    metaKey: 'Command',
    separator: '+',
}, {
    ctrlKey: 'Control',
    shiftKey: 'Shift',
    altKey: 'Alt',
    metaKey: 'Windows',
    separator: '+',
});
/**
 * A label provider that prints modifiers in a suitable format for user settings.
 */
exports.UserSettingsLabelProvider = new ModifierLabelProvider({
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'cmd',
    separator: '+',
}, {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'win',
    separator: '+',
}, {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'meta',
    separator: '+',
});
function _simpleAsString(modifiers, key, labels) {
    if (key === null) {
        return '';
    }
    let result = [];
    // translate modifier keys: Ctrl-Shift-Alt-Meta
    if (modifiers.ctrlKey) {
        result.push(labels.ctrlKey);
    }
    if (modifiers.shiftKey) {
        result.push(labels.shiftKey);
    }
    if (modifiers.altKey) {
        result.push(labels.altKey);
    }
    if (modifiers.metaKey) {
        result.push(labels.metaKey);
    }
    // the actual key
    result.push(key);
    return result.join(labels.separator);
}
function _asString(firstPartMod, firstPartKey, chordPartMod, chordPartKey, labels) {
    let result = _simpleAsString(firstPartMod, firstPartKey, labels);
    if (chordPartKey !== null) {
        result += ' ';
        result += _simpleAsString(chordPartMod, chordPartKey, labels);
    }
    return result;
}
