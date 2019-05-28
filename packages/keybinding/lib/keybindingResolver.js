"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@fin/command");
const contextkey_1 = require("@fin/contextkey");
class KeybindingResolver {
    constructor(defaultKeybindings, overrides) {
        this._defaultKeybindings = defaultKeybindings;
        this._defaultBoundCommands = new Map();
        for (let i = 0, len = defaultKeybindings.length; i < len; i++) {
            const command = defaultKeybindings[i].command;
            this._defaultBoundCommands.set(command, true);
        }
        this._map = new Map();
        this._lookupMap = new Map();
        this._keybindings = KeybindingResolver.combine(defaultKeybindings, overrides);
        for (let i = 0, len = this._keybindings.length; i < len; i++) {
            let k = this._keybindings[i];
            if (k.keypressFirstPart === null) {
                // unbound
                continue;
            }
            this._addKeyPress(k.keypressFirstPart, k);
        }
    }
    static _isTargetedForRemoval(defaultKb, keypressFirstPart, keypressChordPart, command, when) {
        if (defaultKb.command !== command) {
            return false;
        }
        if (keypressFirstPart && defaultKb.keypressFirstPart !== keypressFirstPart) {
            return false;
        }
        if (keypressChordPart && defaultKb.keypressChordPart !== keypressChordPart) {
            return false;
        }
        if (when) {
            if (!defaultKb.when) {
                return false;
            }
            if (!when.equals(defaultKb.when)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Looks for rules containing -command in `overrides` and removes them directly from `defaults`.
     */
    static combine(defaults, rawOverrides) {
        defaults = defaults.slice(0);
        let overrides = [];
        for (let i = 0, len = rawOverrides.length; i < len; i++) {
            const override = rawOverrides[i];
            if (!override.command || override.command.length === 0 || override.command.charAt(0) !== '-') {
                overrides.push(override);
                continue;
            }
            const command = override.command.substr(1);
            const keypressFirstPart = override.keypressFirstPart;
            const keypressChordPart = override.keypressChordPart;
            const when = override.when;
            for (let j = defaults.length - 1; j >= 0; j--) {
                if (this._isTargetedForRemoval(defaults[j], keypressFirstPart, keypressChordPart, command, when)) {
                    defaults.splice(j, 1);
                }
            }
        }
        return defaults.concat(overrides);
    }
    _addKeyPress(keypress, item) {
        const conflicts = this._map.get(keypress);
        if (typeof conflicts === 'undefined') {
            // There is no conflict so far
            this._map.set(keypress, [item]);
            this._addToLookupMap(item);
            return;
        }
        for (let i = conflicts.length - 1; i >= 0; i--) {
            let conflict = conflicts[i];
            if (conflict.command === item.command) {
                continue;
            }
            const conflictIsChord = (conflict.keypressChordPart !== null);
            const itemIsChord = (item.keypressChordPart !== null);
            if (conflictIsChord && itemIsChord && conflict.keypressChordPart !== item.keypressChordPart) {
                // The conflict only shares the chord start with this command
                continue;
            }
            if (KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
                // `item` completely overwrites `conflict`
                // Remove conflict from the lookupMap
                this._removeFromLookupMap(conflict);
            }
        }
        conflicts.push(item);
        this._addToLookupMap(item);
    }
    _addToLookupMap(item) {
        if (!item.command) {
            return;
        }
        let arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            arr = [item];
            this._lookupMap.set(item.command, arr);
        }
        else {
            arr.push(item);
        }
    }
    _removeFromLookupMap(item) {
        let arr = this._lookupMap.get(item.command);
        if (typeof arr === 'undefined') {
            return;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                arr.splice(i, 1);
                return;
            }
        }
    }
    /**
     * Returns true if it is provable `a` implies `b`.
     * **Precondition**: Assumes `a` and `b` are normalized!
     */
    static whenIsEntirelyIncluded(a, b) {
        if (!b) {
            return true;
        }
        if (!a) {
            return false;
        }
        const aExpressions = ((a instanceof contextkey_1.ContextKeyAndExpr) ? a.expr : [a]);
        const bExpressions = ((b instanceof contextkey_1.ContextKeyAndExpr) ? b.expr : [b]);
        let aIndex = 0;
        for (let bIndex = 0; bIndex < bExpressions.length; bIndex++) {
            let bExpr = bExpressions[bIndex];
            let bExprMatched = false;
            while (!bExprMatched && aIndex < aExpressions.length) {
                let aExpr = aExpressions[aIndex];
                if (aExpr.equals(bExpr)) {
                    bExprMatched = true;
                }
                aIndex++;
            }
            if (!bExprMatched) {
                return false;
            }
        }
        return true;
    }
    getDefaultBoundCommands() {
        return this._defaultBoundCommands;
    }
    getDefaultKeybindings() {
        return this._defaultKeybindings;
    }
    getKeybindings() {
        return this._keybindings;
    }
    lookupKeybindings(commandId) {
        let items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return [];
        }
        // Reverse to get the most specific item first
        let result = [], resultLen = 0;
        for (let i = items.length - 1; i >= 0; i--) {
            result[resultLen++] = items[i];
        }
        return result;
    }
    lookupPrimaryKeybinding(commandId) {
        let items = this._lookupMap.get(commandId);
        if (typeof items === 'undefined' || items.length === 0) {
            return null;
        }
        return items[items.length - 1];
    }
    resolve(context, currentChord, keypress) {
        let lookupMap = null;
        if (currentChord !== null) {
            // Fetch all chord bindings for `currentChord`
            const candidates = this._map.get(currentChord);
            if (typeof candidates === 'undefined') {
                // No chords starting with `currentChord`
                return null;
            }
            lookupMap = [];
            for (let i = 0, len = candidates.length; i < len; i++) {
                let candidate = candidates[i];
                if (candidate.keypressChordPart === keypress) {
                    lookupMap.push(candidate);
                }
            }
        }
        else {
            const candidates = this._map.get(keypress);
            if (typeof candidates === 'undefined') {
                // No bindings with `keypress`
                return null;
            }
            lookupMap = candidates;
        }
        let result = this._findCommand(context, lookupMap);
        if (!result) {
            return null;
        }
        if (currentChord === null && result.keypressChordPart !== null) {
            return {
                enterChord: true,
                commandId: null,
                commandArgs: null,
                bubble: false
            };
        }
        return {
            enterChord: false,
            commandId: result.command,
            commandArgs: result.commandArgs,
            bubble: result.bubble
        };
    }
    _findCommand(context, matches) {
        for (let i = matches.length - 1; i >= 0; i--) {
            let k = matches[i];
            if (!KeybindingResolver.contextMatchesRules(context, k.when)) {
                continue;
            }
            return k;
        }
        return null;
    }
    static contextMatchesRules(context, rules) {
        if (!rules) {
            return true;
        }
        return rules.evaluate(context);
    }
    static getAllUnboundCommands(boundCommands) {
        const commands = command_1.CommandsRegistry.getCommands();
        const unboundCommands = [];
        for (let id in commands) {
            if (id[0] === '_' || id.indexOf('vscode.') === 0) { // private command
                continue;
            }
            if (boundCommands.get(id) === true) {
                continue;
            }
            unboundCommands.push(id);
        }
        return unboundCommands;
    }
}
exports.KeybindingResolver = KeybindingResolver;
