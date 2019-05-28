"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResolvedKeybindingItem {
    constructor(resolvedKeybinding, command, commandArgs, when, isDefault) {
        this.resolvedKeybinding = resolvedKeybinding;
        if (resolvedKeybinding) {
            let [keypressFirstPart, keypressChordPart] = resolvedKeybinding.getDispatchParts();
            this.keypressFirstPart = keypressFirstPart;
            this.keypressChordPart = keypressChordPart;
        }
        else {
            this.keypressFirstPart = null;
            this.keypressChordPart = null;
        }
        this.bubble = (command ? command.charCodeAt(0) === 94 /* Caret */ : false);
        this.command = this.bubble ? command.substr(1) : command;
        this.commandArgs = commandArgs;
        this.when = when;
        this.isDefault = isDefault;
    }
}
exports.ResolvedKeybindingItem = ResolvedKeybindingItem;
