"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const disposable_1 = require("@fin/disposable");
const event_1 = require("@fin/event");
const async_1 = require("@fin/async");
const keybindingResolver_1 = require("./keybindingResolver");
const resolvedKeybindingItem_1 = require("./resolvedKeybindingItem");
const dom_1 = require("@fin/dom");
const keyboard_1 = require("@fin/keyboard");
const platform_1 = require("@fin/platform");
const keyboardMapper_1 = require("./keyboardMapper");
const keybindingsRegistry_1 = require("./keybindingsRegistry");
const keybindingIO_1 = require("./keybindingIO");
class KeybindingService extends disposable_1.Disposable {
    constructor(windowElement, contextKeyService, commandService) {
        super();
        this._contextKeyService = contextKeyService;
        this._commandService = commandService;
        this._currentChord = null;
        this._currentChordChecker = new async_1.IntervalTimer();
        this._currentChordStatusMessage = null;
        this._onDidUpdateKeybindings = this._register(new event_1.Emitter());
        this._keyboardMapper = keyboardMapper_1.KeyboardMapperFactory.INSTANCE.getKeyboardMapper();
        this._cachedResolver = null;
        this._firstTimeComputingResolver = true;
        this._register(dom_1.addDisposableListener(windowElement, dom_1.EventType.KEY_DOWN, (e) => {
            let keyEvent = new keyboard_1.StandardKeyboardEvent(e);
            let shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
        }));
    }
    dispose() {
        super.dispose();
    }
    get onDidUpdateKeybindings() {
        return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : event_1.Event.None; // Sinon stubbing walks properties on prototype
    }
    _safeGetConfig() {
        return [];
    }
    _getResolver() {
        if (!this._cachedResolver) {
            const defaults = this._resolveKeybindingItems(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), true);
            const overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
            this._cachedResolver = new keybindingResolver_1.KeybindingResolver(defaults, overrides);
            this._firstTimeComputingResolver = false;
        }
        return this._cachedResolver;
    }
    _documentHasFocus() {
        return document.hasFocus();
    }
    _resolveKeybindingItems(items, isDefault) {
        let result = [], resultLen = 0;
        for (let i = 0, len = items.length; i < len; i++) {
            const item = items[i];
            const when = (item.when ? item.when.normalize() : null);
            const keybinding = item.keybinding;
            if (!keybinding) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
            }
            else {
                const resolvedKeybindings = this.resolveKeybinding(keybinding);
                for (let j = 0; j < resolvedKeybindings.length; j++) {
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                }
            }
        }
        return result;
    }
    _resolveUserKeybindingItems(items, isDefault) {
        let result = [], resultLen = 0;
        for (let i = 0, len = items.length; i < len; i++) {
            const item = items[i];
            const when = (item.when ? item.when.normalize() : null);
            const firstPart = item.firstPart;
            const chordPart = item.chordPart;
            if (!firstPart) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
            }
            else {
                const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
                for (let j = 0; j < resolvedKeybindings.length; j++) {
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                }
            }
        }
        return result;
    }
    _getExtraKeybindings(isFirstTime) {
        let extraUserKeybindings = this._safeGetConfig();
        return extraUserKeybindings.map((k) => keybindingIO_1.KeybindingIO.readUserKeybindingItem(k, platform_1.OS));
    }
    resolveKeybinding(kb) {
        return this._keyboardMapper.resolveKeybinding(kb);
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(userBinding) {
        const [firstPart, chordPart] = keybindingIO_1.KeybindingIO._readUserBinding(userBinding);
        return this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
    }
    getDefaultKeybindingsContent() {
        return '';
    }
    getDefaultKeybindings() {
        return this._getResolver().getDefaultKeybindings();
    }
    getKeybindings() {
        return this._getResolver().getKeybindings();
    }
    customKeybindingsCount() {
        return 0;
    }
    lookupKeybindings(commandId) {
        return this._getResolver().lookupKeybindings(commandId).map(item => item.resolvedKeybinding);
    }
    lookupKeybinding(commandId) {
        let result = this._getResolver().lookupPrimaryKeybinding(commandId);
        if (!result) {
            return null;
        }
        return result.resolvedKeybinding;
    }
    softDispatch(e, target) {
        const keybinding = this.resolveKeyboardEvent(e);
        if (keybinding.isChord()) {
            console.warn('Unexpected keyboard event mapped to a chord');
            return null;
        }
        const [firstPart,] = keybinding.getDispatchParts();
        if (firstPart === null) {
            // cannot be dispatched, probably only modifier keys
            return null;
        }
        const contextValue = this._contextKeyService.getContext(target);
        const currentChord = this._currentChord ? this._currentChord.keypress : null;
        return this._getResolver().resolve(contextValue, currentChord, firstPart);
    }
    _enterChordMode(firstPart, keypressLabel) {
        this._currentChord = {
            keypress: firstPart,
            label: keypressLabel
        };
        console.log('(%s) was pressed. Waiting for second key of chord...', keypressLabel);
        const chordEnterTime = Date.now();
        this._currentChordChecker.cancelAndSet(() => {
            if (!this._documentHasFocus()) {
                // Focus has been lost => leave chord mode
                this._leaveChordMode();
                return;
            }
            if (Date.now() - chordEnterTime > 5000) {
                // 5 seconds elapsed => leave chord mode
                this._leaveChordMode();
            }
        }, 500);
    }
    _leaveChordMode() {
        if (this._currentChordStatusMessage) {
            this._currentChordStatusMessage.dispose();
            this._currentChordStatusMessage = null;
        }
        this._currentChordChecker.cancel();
        this._currentChord = null;
    }
    _dispatch(e, target) {
        let shouldPreventDefault = false;
        const keybinding = this.resolveKeyboardEvent(e);
        if (keybinding.isChord()) {
            console.warn('Unexpected keyboard event mapped to a chord');
            return null;
        }
        const [firstPart,] = keybinding.getDispatchParts();
        if (firstPart === null) {
            // cannot be dispatched, probably only modifier keys
            return shouldPreventDefault;
        }
        const contextValue = this._contextKeyService.getContext(target);
        const currentChord = this._currentChord ? this._currentChord.keypress : null;
        const keypressLabel = keybinding.getLabel();
        const resolveResult = this._getResolver().resolve(contextValue, currentChord, firstPart);
        if (resolveResult && resolveResult.enterChord) {
            shouldPreventDefault = true;
            this._enterChordMode(firstPart, keypressLabel);
            return shouldPreventDefault;
        }
        if (this._currentChord) {
            if (!resolveResult || !resolveResult.commandId) {
                console.warn('The key combination (%s, %s) is not a command.', this._currentChord.label, keypressLabel);
                shouldPreventDefault = true;
            }
        }
        this._leaveChordMode();
        if (resolveResult && resolveResult.commandId) {
            if (!resolveResult.bubble) {
                shouldPreventDefault = true;
            }
            this._commandService.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(undefined, err => {
                console.error(err);
            });
        }
        return shouldPreventDefault;
    }
}
exports.KeybindingService = KeybindingService;
