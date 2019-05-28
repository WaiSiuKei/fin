(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fin/platform'), require('@fin/keyboard'), require('@fin/command'), require('@fin/disposable'), require('@fin/event'), require('@fin/async'), require('@fin/contextkey'), require('@fin/dom')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fin/platform', '@fin/keyboard', '@fin/command', '@fin/disposable', '@fin/event', '@fin/async', '@fin/contextkey', '@fin/dom'], factory) :
  (global = global || self, factory(global['@fin/keybinding'] = {}, global.platform, global.keyboard, global.command, global.disposable, global.event, global.async, global.contextkey, global.dom));
}(this, function (exports, platform, keyboard, command, disposable, event, async, contextkey, dom) { 'use strict';

  class KeybindingsRegistryImpl {
      // public WEIGHT = {
      //   chartCore: (importance: number = 0): number => {
      //     return 0 + importance;
      //   },
      //   chartContrib: (importance: number = 0): number => {
      //     return 100 + importance;
      //   },
      //   workbenchContrib: (importance: number = 0): number => {
      //     return 200 + importance;
      //   },
      //   builtinExtension: (importance: number = 0): number => {
      //     return 300 + importance;
      //   },
      //   externalExtension: (importance: number = 0): number => {
      //     return 400 + importance;
      //   }
      // };
      constructor() {
          this._keybindings = [];
          this._keybindingsSorted = true;
      }
      /**
       * Take current platform into account and reduce to primary & secondary.
       */
      static bindToCurrentPlatform(kb) {
          if (platform.OS === 1 /* Windows */) {
              if (kb && kb.win) {
                  return kb.win;
              }
          }
          else if (platform.OS === 2 /* Macintosh */) {
              if (kb && kb.mac) {
                  return kb.mac;
              }
          }
          else {
              if (kb && kb.linux) {
                  return kb.linux;
              }
          }
          return kb;
      }
      registerKeybindingRule(rule) {
          let actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
          if (actualKb && actualKb.primary) {
              this._registerDefaultKeybinding(keyboard.createKeybinding(actualKb.primary, platform.OS), rule.id, rule.weight, 0, rule.when);
          }
          if (actualKb && Array.isArray(actualKb.secondary)) {
              for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
                  const k = actualKb.secondary[i];
                  this._registerDefaultKeybinding(keyboard.createKeybinding(k, platform.OS), rule.id, rule.weight, -i - 1, rule.when);
              }
          }
      }
      registerCommandAndKeybindingRule(desc) {
          this.registerKeybindingRule(desc);
          command.CommandsRegistry.registerCommand(desc);
      }
      static _mightProduceChar(keyCode) {
          if (keyCode >= 21 /* KEY_0 */ && keyCode <= 30 /* KEY_9 */) {
              return true;
          }
          if (keyCode >= 31 /* KEY_A */ && keyCode <= 56 /* KEY_Z */) {
              return true;
          }
          return (keyCode === 80 /* US_SEMICOLON */
              || keyCode === 81 /* US_EQUAL */
              || keyCode === 82 /* US_COMMA */
              || keyCode === 83 /* US_MINUS */
              || keyCode === 84 /* US_DOT */
              || keyCode === 85 /* US_SLASH */
              || keyCode === 86 /* US_BACKTICK */
              || keyCode === 110 /* ABNT_C1 */
              || keyCode === 111 /* ABNT_C2 */
              || keyCode === 87 /* US_OPEN_SQUARE_BRACKET */
              || keyCode === 88 /* US_BACKSLASH */
              || keyCode === 89 /* US_CLOSE_SQUARE_BRACKET */
              || keyCode === 90 /* US_QUOTE */
              || keyCode === 91 /* OEM_8 */
              || keyCode === 92 /* OEM_102 */);
      }
      _assertNoCtrlAlt(keybinding, commandId) {
          if (keybinding.ctrlKey && keybinding.altKey && !keybinding.metaKey) {
              if (KeybindingsRegistryImpl._mightProduceChar(keybinding.keyCode)) {
                  console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
              }
          }
      }
      _registerDefaultKeybinding(keybinding, commandId, weight1, weight2, when) {
          if (platform.OS === 1 /* Windows */) {
              if (keybinding.type === 2 /* Chord */) {
                  this._assertNoCtrlAlt(keybinding.firstPart, commandId);
              }
              else {
                  this._assertNoCtrlAlt(keybinding, commandId);
              }
          }
          this._keybindings.push({
              keybinding: keybinding,
              command: commandId,
              commandArgs: undefined,
              when: when,
              weight1: weight1,
              weight2: weight2
          });
          this._keybindingsSorted = false;
      }
      getDefaultKeybindings() {
          if (!this._keybindingsSorted) {
              this._keybindings.sort(sorter);
              this._keybindingsSorted = true;
          }
          return this._keybindings.slice(0);
      }
  }
  function sorter(a, b) {
      if (a.weight1 !== b.weight1) {
          return a.weight1 - b.weight1;
      }
      if (a.command < b.command) {
          return -1;
      }
      if (a.command > b.command) {
          return 1;
      }
      return a.weight2 - b.weight2;
  }
  const KeybindingsRegistry = new KeybindingsRegistryImpl();

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
          const aExpressions = ((a instanceof contextkey.ContextKeyAndExpr) ? a.expr : [a]);
          const bExpressions = ((b instanceof contextkey.ContextKeyAndExpr) ? b.expr : [b]);
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
          const commands = command.CommandsRegistry.getCommands();
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

  function getKeyMap() {
      return {
          'KeyA': { 'value': 'a' },
          'KeyB': { 'value': 'b' },
          'KeyC': { 'value': 'c' },
          'KeyD': { 'value': 'd' },
          'KeyE': { 'value': 'e' },
          'KeyF': { 'value': 'f' },
          'KeyG': { 'value': 'g' },
          'KeyH': { 'value': 'h' },
          'KeyI': { 'value': 'i' },
          'KeyJ': { 'value': 'j' },
          'KeyK': { 'value': 'k' },
          'KeyL': { 'value': 'l' },
          'KeyM': { 'value': 'm' },
          'KeyN': { 'value': 'n' },
          'KeyO': { 'value': 'o' },
          'KeyP': { 'value': 'p' },
          'KeyQ': { 'value': 'q' },
          'KeyR': { 'value': 'r' },
          'KeyS': { 'value': 's' },
          'KeyT': { 'value': 't' },
          'KeyU': { 'value': 'u' },
          'KeyV': { 'value': 'v' },
          'KeyW': { 'value': 'w' },
          'KeyX': { 'value': 'x' },
          'KeyY': { 'value': 'y' },
          'KeyZ': { 'value': 'z' },
          'Digit1': { 'value': '1' },
          'Digit2': { 'value': '2' },
          'Digit3': { 'value': '3' },
          'Digit4': { 'value': '4' },
          'Digit5': { 'value': '5' },
          'Digit6': { 'value': '6' },
          'Digit7': { 'value': '7' },
          'Digit8': { 'value': '8' },
          'Digit9': { 'value': '9' },
          'Digit0': { 'value': '0' },
          'Enter': { 'value': '' },
          'Escape': { 'value': '' },
          'Backspace': { 'value': '' },
          'Tab': { 'value': '' },
          'Space': { 'value': ' ' },
          'Minus': { 'value': '-' },
          'Equal': { 'value': '=' },
          'BracketLeft': { 'value': '[' },
          'BracketRight': { 'value': ']' },
          'Backslash': { 'value': '\\' },
          'Semicolon': { 'value': ';' },
          'Quote': { 'value': '\'' },
          'Backquote': { 'value': '`' },
          'Comma': { 'value': ',' },
          'Period': { 'value': '.' },
          'Slash': { 'value': '/' },
          'CapsLock': { 'value': '' },
          'F1': { 'value': '' },
          'F2': { 'value': '' },
          'F3': { 'value': '' },
          'F4': { 'value': '' },
          'F5': { 'value': '' },
          'F6': { 'value': '' },
          'F7': { 'value': '' },
          'F8': { 'value': '' },
          'F9': { 'value': '' },
          'F10': { 'value': '' },
          'F11': { 'value': '' },
          'F12': { 'value': '' },
          'Insert': { 'value': '' },
          'Home': { 'value': '' },
          'PageUp': { 'value': '' },
          'Delete': { 'value': '' },
          'End': { 'value': '' },
          'PageDown': { 'value': '' },
          'ArrowRight': { 'value': '' },
          'ArrowLeft': { 'value': '' },
          'ArrowDown': { 'value': '' },
          'ArrowUp': { 'value': '' },
          'NumLock': { 'value': '' },
          'NumpadDivide': { 'value': '/' },
          'NumpadMultiply': { 'value': '*' },
          'NumpadSubtract': { 'value': '-' },
          'NumpadAdd': { 'value': '+' },
          'NumpadEnter': { 'value': '' },
          'Numpad1': { 'value': '1' },
          'Numpad2': { 'value': '2' },
          'Numpad3': { 'value': '3' },
          'Numpad4': { 'value': '4' },
          'Numpad5': { 'value': '5' },
          'Numpad6': { 'value': '6' },
          'Numpad7': { 'value': '7' },
          'Numpad8': { 'value': '8' },
          'Numpad9': { 'value': '9' },
          'Numpad0': { 'value': '0' },
          'NumpadDecimal': { 'value': '.' },
          'IntlBackslash': { 'value': '§', },
          'ContextMenu': { 'value': '', },
          'NumpadEqual': { 'value': '=', },
          'F13': { 'value': '', },
          'F14': { 'value': '', },
          'F15': { 'value': '', },
          'F16': { 'value': '', },
          'F17': { 'value': '', },
          'F18': { 'value': '', },
          'F19': { 'value': '', },
          'F20': { 'value': '', },
          'AudioVolumeMute': { 'value': '', },
          'AudioVolumeUp': { 'value': '' },
          'AudioVolumeDown': { 'value': '', },
          'NumpadComma': { 'value': '', },
          'IntlRo': { 'value': '', },
          'KanaMode': { 'value': '', },
          'IntlYen': { 'value': '', },
          'ControlLeft': { 'value': '', },
          'ShiftLeft': { 'value': '', },
          'AltLeft': { 'value': '', },
          'MetaLeft': { 'value': '', },
          'ControlRight': { 'value': '', },
          'ShiftRight': { 'value': '', },
          'AltRight': { 'value': '', },
          'MetaRight': { 'value': '', }
      };
  }

  class ResolvedKeybindingPart {
      constructor(ctrlKey, shiftKey, altKey, metaKey, kbLabel, kbAriaLabel) {
          this.ctrlKey = ctrlKey;
          this.shiftKey = shiftKey;
          this.altKey = altKey;
          this.metaKey = metaKey;
          this.keyLabel = kbLabel;
          this.keyAriaLabel = kbAriaLabel;
      }
  }
  /**
   * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
   */
  class ResolvedKeybinding {
  }

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
  /**
   * A label provider that prints modifiers in a suitable format for displaying in the UI.
   */
  const UILabelProvider = new ModifierLabelProvider({
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
  const AriaLabelProvider = new ModifierLabelProvider({
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
  const UserSettingsLabelProvider = new ModifierLabelProvider({
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
          const strScanCode = keyboard.ScanCodeUtils.toString(scanCode);
          const aEntry = a[strScanCode];
          const bEntry = b[strScanCode];
          if (!windowsKeyMappingEquals(aEntry, bEntry)) {
              return false;
          }
      }
      return true;
  }
  const NATIVE_KEY_CODE_TO_KEY_CODE = _getNativeMap();
  class WindowsNativeResolvedKeybinding extends ResolvedKeybinding {
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
          return UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
      }
      _getUSLabelForKeybinding(keybinding) {
          if (!keybinding) {
              return null;
          }
          if (keybinding.isDuplicateModifierCase()) {
              return '';
          }
          return keyboard.KeyCodeUtils.toString(keybinding.keyCode);
      }
      getUSLabel() {
          let firstPart = this._getUSLabelForKeybinding(this._firstPart);
          let chordPart = this._getUSLabelForKeybinding(this._chordPart);
          return UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
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
          return AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
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
          let result = UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, 1 /* Windows */);
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
          return new ResolvedKeybindingPart(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, this._getUILabelForKeybinding(keybinding), this._getAriaLabelForKeybinding(keybinding));
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
          result += keyboard.KeyCodeUtils.toString(keybinding.keyCode);
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
  class WindowsKeyboardMapper {
      constructor(isUSStandard, rawMappings) {
          this._keyCodeToLabel = [];
          this.isUSStandard = isUSStandard;
          this._scanCodeToKeyCode = [];
          this._keyCodeToLabel = [];
          this._keyCodeExists = [];
          this._keyCodeToLabel[0 /* Unknown */] = keyboard.KeyCodeUtils.toString(0 /* Unknown */);
          for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
              const immutableKeyCode = keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
              if (immutableKeyCode !== -1) {
                  this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
                  this._keyCodeToLabel[immutableKeyCode] = keyboard.KeyCodeUtils.toString(immutableKeyCode);
                  this._keyCodeExists[immutableKeyCode] = true;
              }
          }
          let producesLetter = [];
          this._codeInfo = [];
          for (let strCode in rawMappings) {
              if (rawMappings.hasOwnProperty(strCode)) {
                  const scanCode = keyboard.ScanCodeUtils.toEnum(strCode);
                  if (scanCode === 0 /* None */) {
                      // log(`Unknown scanCode ${strCode} in mapping.`);
                      continue;
                  }
                  const rawMapping = rawMappings[strCode];
                  const immutableKeyCode = keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
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
              if (keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
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
              const strCode = keyboard.ScanCodeUtils.toString(scanCode);
              let mods = [0b000, 0b010, 0b101, 0b111];
              for (let modIndex = 0; modIndex < mods.length; modIndex++) {
                  const mod = mods[modIndex];
                  const ctrlKey = (mod & 0b001) ? true : false;
                  const shiftKey = (mod & 0b010) ? true : false;
                  const altKey = (mod & 0b100) ? true : false;
                  const scanCodeBinding = new keyboard.ScanCodeBinding(ctrlKey, shiftKey, altKey, false, scanCode);
                  const kb = this._resolveSimpleUserBinding(scanCodeBinding);
                  const strKeyCode = (kb ? keyboard.KeyCodeUtils.toString(kb.keyCode) : null);
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
              return keyboard.KeyCodeUtils.toUserSettingsUS(keyCode);
          }
          return keyboard.KeyCodeUtils.toUserSettingsGeneral(keyCode);
      }
      _getLabelForKeyCode(keyCode) {
          return this._keyCodeToLabel[keyCode] || keyboard.KeyCodeUtils.toString(0 /* Unknown */);
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
          const keybinding = new keyboard.SimpleKeybinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
          return new WindowsNativeResolvedKeybinding(this, keybinding, null);
      }
      _resolveSimpleUserBinding(binding) {
          if (!binding) {
              return null;
          }
          if (binding instanceof keyboard.SimpleKeybinding) {
              if (!this._keyCodeExists[binding.keyCode]) {
                  return null;
              }
              return binding;
          }
          const keyCode = this._scanCodeToKeyCode[binding.scanCode] || 0 /* Unknown */;
          if (keyCode === 0 /* Unknown */ || !this._keyCodeExists[keyCode]) {
              return null;
          }
          return new keyboard.SimpleKeybinding(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, keyCode);
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
          const strScanCode = keyboard.ScanCodeUtils.toString(scanCode);
          const aEntry = a[strScanCode];
          const bEntry = b[strScanCode];
          if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
              return false;
          }
      }
      return true;
  }
  /**
   * A shellMap from character to key codes.
   * e.g. Contains entries such as:
   *  - '/' => { keyCode: KeyCode.US_SLASH, shiftKey: false }
   *  - '?' => { keyCode: KeyCode.US_SLASH, shiftKey: true }
   */
  const CHAR_CODE_TO_KEY_CODE = [];
  class NativeResolvedKeybinding extends ResolvedKeybinding {
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
          return UILabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
      }
      getAriaLabel() {
          let firstPart = this._mapper.getAriaLabelForScanCodeBinding(this._firstPart);
          let chordPart = this._mapper.getAriaLabelForScanCodeBinding(this._chordPart);
          return AriaLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
      }
      getUserSettingsLabel() {
          let firstPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._firstPart);
          let chordPart = this._mapper.getUserSettingsLabelForScanCodeBinding(this._chordPart);
          return UserSettingsLabelProvider.toLabel(this._firstPart, firstPart, this._chordPart, chordPart, this._OS);
      }
      _isWYSIWYG(binding) {
          if (!binding) {
              return true;
          }
          if (keyboard.IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1) {
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
          return new ResolvedKeybindingPart(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, this._mapper.getUILabelForScanCodeBinding(binding), this._mapper.getAriaLabelForScanCodeBinding(binding));
      }
      getDispatchParts() {
          let firstPart = this._firstPart ? this._mapper.getDispatchStrForScanCodeBinding(this._firstPart) : null;
          let chordPart = this._chordPart ? this._mapper.getDispatchStrForScanCodeBinding(this._chordPart) : null;
          return [firstPart, chordPart];
      }
  }
  class ScanCodeCombo {
      constructor(ctrlKey, shiftKey, altKey, scanCode) {
          this.ctrlKey = ctrlKey;
          this.shiftKey = shiftKey;
          this.altKey = altKey;
          this.scanCode = scanCode;
      }
      toString() {
          return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyboard.ScanCodeUtils.toString(this.scanCode)}`;
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
          return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyboard.KeyCodeUtils.toString(this.keyCode)}`;
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
              const keyCode = keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
              if (keyCode !== -1) {
                  _registerAllCombos(0, 0, 0, scanCode, keyCode);
                  this._scanCodeToLabel[scanCode] = keyboard.KeyCodeUtils.toString(keyCode);
                  if (keyCode === 0 /* Unknown */ || keyCode === 5 /* Ctrl */ || keyCode === 57 /* Meta */ || keyCode === 6 /* Alt */ || keyCode === 4 /* Shift */) {
                      this._scanCodeToDispatch[scanCode] = null; // cannot dispatch on this ScanCode
                  }
                  else {
                      this._scanCodeToDispatch[scanCode] = `[${keyboard.ScanCodeUtils.toString(scanCode)}]`;
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
                      const scanCode = keyboard.ScanCodeUtils.toEnum(strScanCode);
                      if (scanCode === 0 /* None */) {
                          continue;
                      }
                      if (keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
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
                      missingLatinLettersOverride[keyboard.ScanCodeUtils.toString(scanCode)] = {
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
                  const scanCode = keyboard.ScanCodeUtils.toEnum(strScanCode);
                  if (scanCode === 0 /* None */) {
                      continue;
                  }
                  if (keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
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
                  this._scanCodeToDispatch[scanCode] = `[${keyboard.ScanCodeUtils.toString(scanCode)}]`;
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
              if (keyboard.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
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
                      code: keyboard.ScanCodeUtils.toString(scanCode)
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
              return [new keyboard.ScanCodeBinding(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, 46 /* Enter */)];
          }
          const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(new KeyCodeCombo(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.keyCode));
          let result = [];
          for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
              const scanCodeCombo = scanCodeCombos[i];
              result[i] = new keyboard.ScanCodeBinding(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, keybinding.metaKey, scanCodeCombo.scanCode);
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
          const immutableKeyCode = keyboard.IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode];
          if (immutableKeyCode !== -1) {
              return keyboard.KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
          }
          // Check if this scanCode always maps to the same keyCode and back
          let constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(binding.scanCode);
          if (constantKeyCode !== -1) {
              // Verify that this is a good key code that can be mapped back to the same scan code
              let reverseBindings = this.simpleKeybindingToScanCodeBinding(new keyboard.SimpleKeybinding(binding.ctrlKey, binding.shiftKey, binding.altKey, binding.metaKey, constantKeyCode));
              for (let i = 0, len = reverseBindings.length; i < len; i++) {
                  const reverseBinding = reverseBindings[i];
                  if (reverseBinding.scanCode === binding.scanCode) {
                      return keyboard.KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
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
          let code = keyboard.ScanCodeUtils.toEnum(keyboardEvent.code);
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
              const immutableScanCode = keyboard.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
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
                      const immutableScanCode = keyboard.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
                      if (immutableScanCode !== -1) {
                          code = immutableScanCode;
                      }
                  }
              }
          }
          const keypress = new keyboard.ScanCodeBinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, code);
          return new NativeResolvedKeybinding(this, this._OS, keypress, null);
      }
      _resolveSimpleUserBinding(binding) {
          if (!binding) {
              return [];
          }
          if (binding instanceof keyboard.ScanCodeBinding) {
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
  class KeyboardMapperFactory {
      constructor() {
          this._rawMapping = getKeyMap();
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
          if (platform.OS === 1 /* Windows */) {
              return new WindowsKeyboardMapper(isUSStandard, rawMapping);
          }
          return new MacLinuxKeyboardMapper(isUSStandard, rawMapping, platform.OS);
      }
      static _equals(a, b) {
          if (platform.OS === 1 /* Windows */) {
              return windowsKeyboardMappingEquals(a, b);
          }
          return macLinuxKeyboardMappingEquals(a, b);
      }
  }
  KeyboardMapperFactory.INSTANCE = new KeyboardMapperFactory();

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
          const when = (typeof input.when === 'string' ? contextkey.ContextKeyExpr.deserialize(input.when) : null);
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
          const keyCode = keyboard.KeyCodeUtils.fromUserSettings(mods.key);
          return [new keyboard.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
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
              return new keyboard.ChordKeybinding(firstPart, chordPart);
          }
          return firstPart;
      }
      static _readSimpleUserBinding(input) {
          const mods = this._readModifiers(input);
          const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
          if (scanCodeMatch) {
              const strScanCode = scanCodeMatch[1];
              const scanCode = keyboard.ScanCodeUtils.lowerCaseToEnum(strScanCode);
              return [new keyboard.ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
          }
          const keyCode = keyboard.KeyCodeUtils.fromUserSettings(mods.key);
          return [new keyboard.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
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
  function rightPaddedString(str, minChars) {
      if (str.length < minChars) {
          return str + (new Array(minChars - str.length).join(' '));
      }
      return str;
  }

  class KeybindingService extends disposable.Disposable {
      constructor(windowElement, contextKeyService, commandService) {
          super();
          this._contextKeyService = contextKeyService;
          this._commandService = commandService;
          this._currentChord = null;
          this._currentChordChecker = new async.IntervalTimer();
          this._currentChordStatusMessage = null;
          this._onDidUpdateKeybindings = this._register(new event.Emitter());
          this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper();
          this._cachedResolver = null;
          this._firstTimeComputingResolver = true;
          this._register(dom.addDisposableListener(windowElement, dom.EventType.KEY_DOWN, (e) => {
              let keyEvent = new keyboard.StandardKeyboardEvent(e);
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
          return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : event.Event.None; // Sinon stubbing walks properties on prototype
      }
      _safeGetConfig() {
          return [];
      }
      _getResolver() {
          if (!this._cachedResolver) {
              const defaults = this._resolveKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
              const overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
              this._cachedResolver = new KeybindingResolver(defaults, overrides);
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
                  result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
              }
              else {
                  const resolvedKeybindings = this.resolveKeybinding(keybinding);
                  for (let j = 0; j < resolvedKeybindings.length; j++) {
                      result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
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
                  result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
              }
              else {
                  const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
                  for (let j = 0; j < resolvedKeybindings.length; j++) {
                      result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                  }
              }
          }
          return result;
      }
      _getExtraKeybindings(isFirstTime) {
          let extraUserKeybindings = this._safeGetConfig();
          return extraUserKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k, platform.OS));
      }
      resolveKeybinding(kb) {
          return this._keyboardMapper.resolveKeybinding(kb);
      }
      resolveKeyboardEvent(keyboardEvent) {
          return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
      }
      resolveUserBinding(userBinding) {
          const [firstPart, chordPart] = KeybindingIO._readUserBinding(userBinding);
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
  exports.KeybindingsRegistry = KeybindingsRegistry;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
