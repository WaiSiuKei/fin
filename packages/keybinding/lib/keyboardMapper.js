"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("@fin/platform");
const nativeKeymap_1 = require("./nativeKeymap");
const windowsKeyboardMapper_1 = require("./windowsKeyboardMapper");
const macLinuxKeyboardMapper_1 = require("./macLinuxKeyboardMapper");
class CachedKeyboardMapper {
    constructor(actual) {
        this._actual = actual;
        this._cache = new Map();
    }
    dumpDebugInfo() {
        return this._actual.dumpDebugInfo();
    }
    resolveKeybinding(keybinding) {
        let hashCode = keybinding.getHashCode();
        if (!this._cache.has(hashCode)) {
            let r = this._actual.resolveKeybinding(keybinding);
            this._cache.set(hashCode, r);
            return r;
        }
        return this._cache.get(hashCode);
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this._actual.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(firstPart, chordPart) {
        return this._actual.resolveUserBinding(firstPart, chordPart);
    }
}
exports.CachedKeyboardMapper = CachedKeyboardMapper;
class KeyboardMapperFactory {
    constructor() {
        this._rawMapping = nativeKeymap_1.getKeyMap();
        this._keyboardMapper = null;
        this._initialized = false;
    }
    getKeyboardMapper() {
        if (!this._initialized) {
            this._initialized = true;
            this._keyboardMapper = new CachedKeyboardMapper(KeyboardMapperFactory._createKeyboardMapper(this._rawMapping));
        }
        return this._keyboardMapper;
    }
    static _createKeyboardMapper(rawMapping) {
        const isUSStandard = true;
        if (platform_1.OS === platform_1.OperatingSystem.Windows) {
            return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMapping);
        }
        return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMapping, platform_1.OS);
    }
    static _equals(a, b) {
        if (platform_1.OS === platform_1.OperatingSystem.Windows) {
            return windowsKeyboardMapper_1.windowsKeyboardMappingEquals(a, b);
        }
        return macLinuxKeyboardMapper_1.macLinuxKeyboardMappingEquals(a, b);
    }
}
KeyboardMapperFactory.INSTANCE = new KeyboardMapperFactory();
exports.KeyboardMapperFactory = KeyboardMapperFactory;
