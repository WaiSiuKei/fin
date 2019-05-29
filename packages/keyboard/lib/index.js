(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fin/platform')) :
  typeof define === 'function' && define.amd ? define(['exports', '@fin/platform'], factory) :
  (global = global || self, factory(global['@fin/keyboard-event'] = {}, global.platform));
}(this, function (exports, platform) { 'use strict';

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

  /**
   * Virtual Key Codes, the value does not hold any inherent meaning.
   * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
   * But these are "more general", as they should work across browsers & OS`s.
   */
  class KeyCodeStrMap {
      constructor() {
          this._keyCodeToStr = [];
          this._strToKeyCode = Object.create(null);
      }
      define(keyCode, str) {
          this._keyCodeToStr[keyCode] = str;
          this._strToKeyCode[str.toLowerCase()] = keyCode;
      }
      keyCodeToStr(keyCode) {
          return this._keyCodeToStr[keyCode];
      }
      strToKeyCode(str) {
          return this._strToKeyCode[str.toLowerCase()] || 0 /* Unknown */;
      }
  }
  const uiMap = new KeyCodeStrMap();
  const userSettingsUSMap = new KeyCodeStrMap();
  const userSettingsGeneralMap = new KeyCodeStrMap();
  (function () {
      function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
          uiMap.define(keyCode, uiLabel);
          userSettingsUSMap.define(keyCode, usUserSettingsLabel);
          userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
      }
      define(0 /* Unknown */, 'unknown');
      define(1 /* Backspace */, 'Backspace');
      define(2 /* Tab */, 'Tab');
      define(3 /* Enter */, 'Enter');
      define(4 /* Shift */, 'Shift');
      define(5 /* Ctrl */, 'Ctrl');
      define(6 /* Alt */, 'Alt');
      define(7 /* PauseBreak */, 'PauseBreak');
      define(8 /* CapsLock */, 'CapsLock');
      define(9 /* Escape */, 'Escape');
      define(10 /* Space */, 'Space');
      define(11 /* PageUp */, 'PageUp');
      define(12 /* PageDown */, 'PageDown');
      define(13 /* End */, 'End');
      define(14 /* Home */, 'Home');
      define(15 /* LeftArrow */, 'LeftArrow', 'Left');
      define(16 /* UpArrow */, 'UpArrow', 'Up');
      define(17 /* RightArrow */, 'RightArrow', 'Right');
      define(18 /* DownArrow */, 'DownArrow', 'Down');
      define(19 /* Insert */, 'Insert');
      define(20 /* Delete */, 'Delete');
      define(21 /* KEY_0 */, '0');
      define(22 /* KEY_1 */, '1');
      define(23 /* KEY_2 */, '2');
      define(24 /* KEY_3 */, '3');
      define(25 /* KEY_4 */, '4');
      define(26 /* KEY_5 */, '5');
      define(27 /* KEY_6 */, '6');
      define(28 /* KEY_7 */, '7');
      define(29 /* KEY_8 */, '8');
      define(30 /* KEY_9 */, '9');
      define(31 /* KEY_A */, 'A');
      define(32 /* KEY_B */, 'B');
      define(33 /* KEY_C */, 'C');
      define(34 /* KEY_D */, 'D');
      define(35 /* KEY_E */, 'E');
      define(36 /* KEY_F */, 'F');
      define(37 /* KEY_G */, 'G');
      define(38 /* KEY_H */, 'H');
      define(39 /* KEY_I */, 'I');
      define(40 /* KEY_J */, 'J');
      define(41 /* KEY_K */, 'K');
      define(42 /* KEY_L */, 'L');
      define(43 /* KEY_M */, 'M');
      define(44 /* KEY_N */, 'N');
      define(45 /* KEY_O */, 'O');
      define(46 /* KEY_P */, 'P');
      define(47 /* KEY_Q */, 'Q');
      define(48 /* KEY_R */, 'R');
      define(49 /* KEY_S */, 'S');
      define(50 /* KEY_T */, 'T');
      define(51 /* KEY_U */, 'U');
      define(52 /* KEY_V */, 'V');
      define(53 /* KEY_W */, 'W');
      define(54 /* KEY_X */, 'X');
      define(55 /* KEY_Y */, 'Y');
      define(56 /* KEY_Z */, 'Z');
      define(57 /* Meta */, 'Meta');
      define(58 /* ContextMenu */, 'ContextMenu');
      define(59 /* F1 */, 'F1');
      define(60 /* F2 */, 'F2');
      define(61 /* F3 */, 'F3');
      define(62 /* F4 */, 'F4');
      define(63 /* F5 */, 'F5');
      define(64 /* F6 */, 'F6');
      define(65 /* F7 */, 'F7');
      define(66 /* F8 */, 'F8');
      define(67 /* F9 */, 'F9');
      define(68 /* F10 */, 'F10');
      define(69 /* F11 */, 'F11');
      define(70 /* F12 */, 'F12');
      define(71 /* F13 */, 'F13');
      define(72 /* F14 */, 'F14');
      define(73 /* F15 */, 'F15');
      define(74 /* F16 */, 'F16');
      define(75 /* F17 */, 'F17');
      define(76 /* F18 */, 'F18');
      define(77 /* F19 */, 'F19');
      define(78 /* NumLock */, 'NumLock');
      define(79 /* ScrollLock */, 'ScrollLock');
      define(80 /* US_SEMICOLON */, ';', ';', 'OEM_1');
      define(81 /* US_EQUAL */, '=', '=', 'OEM_PLUS');
      define(82 /* US_COMMA */, ',', ',', 'OEM_COMMA');
      define(83 /* US_MINUS */, '-', '-', 'OEM_MINUS');
      define(84 /* US_DOT */, '.', '.', 'OEM_PERIOD');
      define(85 /* US_SLASH */, '/', '/', 'OEM_2');
      define(86 /* US_BACKTICK */, '`', '`', 'OEM_3');
      define(110 /* ABNT_C1 */, 'ABNT_C1');
      define(111 /* ABNT_C2 */, 'ABNT_C2');
      define(87 /* US_OPEN_SQUARE_BRACKET */, '[', '[', 'OEM_4');
      define(88 /* US_BACKSLASH */, '\\', '\\', 'OEM_5');
      define(89 /* US_CLOSE_SQUARE_BRACKET */, ']', ']', 'OEM_6');
      define(90 /* US_QUOTE */, '\'', '\'', 'OEM_7');
      define(91 /* OEM_8 */, 'OEM_8');
      define(92 /* OEM_102 */, 'OEM_102');
      define(93 /* NUMPAD_0 */, 'NumPad0');
      define(94 /* NUMPAD_1 */, 'NumPad1');
      define(95 /* NUMPAD_2 */, 'NumPad2');
      define(96 /* NUMPAD_3 */, 'NumPad3');
      define(97 /* NUMPAD_4 */, 'NumPad4');
      define(98 /* NUMPAD_5 */, 'NumPad5');
      define(99 /* NUMPAD_6 */, 'NumPad6');
      define(100 /* NUMPAD_7 */, 'NumPad7');
      define(101 /* NUMPAD_8 */, 'NumPad8');
      define(102 /* NUMPAD_9 */, 'NumPad9');
      define(103 /* NUMPAD_MULTIPLY */, 'NumPad_Multiply');
      define(104 /* NUMPAD_ADD */, 'NumPad_Add');
      define(105 /* NUMPAD_SEPARATOR */, 'NumPad_Separator');
      define(106 /* NUMPAD_SUBTRACT */, 'NumPad_Subtract');
      define(107 /* NUMPAD_DECIMAL */, 'NumPad_Decimal');
      define(108 /* NUMPAD_DIVIDE */, 'NumPad_Divide');
  })();
  (function (KeyCodeUtils) {
      function toString(keyCode) {
          return uiMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils.toString = toString;
      function fromString(key) {
          return uiMap.strToKeyCode(key);
      }
      KeyCodeUtils.fromString = fromString;
      function toUserSettingsUS(keyCode) {
          return userSettingsUSMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
      function toUserSettingsGeneral(keyCode) {
          return userSettingsGeneralMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
      function fromUserSettings(key) {
          return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
      }
      KeyCodeUtils.fromUserSettings = fromUserSettings;
  })(exports.KeyCodeUtils || (exports.KeyCodeUtils = {}));

  let KEY_CODE_MAP = new Array(230);
  let INVERSE_KEY_CODE_MAP = new Array(112 /* MAX_VALUE */);
  (function () {
      for (let i = 0; i < INVERSE_KEY_CODE_MAP.length; i++) {
          INVERSE_KEY_CODE_MAP[i] = -1;
      }
      function define(code, keyCode) {
          KEY_CODE_MAP[code] = keyCode;
          INVERSE_KEY_CODE_MAP[keyCode] = code;
      }
      define(3, 7 /* PauseBreak */); // VK_CANCEL 0x03 Control-break processing
      define(8, 1 /* Backspace */);
      define(9, 2 /* Tab */);
      define(13, 3 /* Enter */);
      define(16, 4 /* Shift */);
      define(17, 5 /* Ctrl */);
      define(18, 6 /* Alt */);
      define(19, 7 /* PauseBreak */);
      define(20, 8 /* CapsLock */);
      define(27, 9 /* Escape */);
      define(32, 10 /* Space */);
      define(33, 11 /* PageUp */);
      define(34, 12 /* PageDown */);
      define(35, 13 /* End */);
      define(36, 14 /* Home */);
      define(37, 15 /* LeftArrow */);
      define(38, 16 /* UpArrow */);
      define(39, 17 /* RightArrow */);
      define(40, 18 /* DownArrow */);
      define(45, 19 /* Insert */);
      define(46, 20 /* Delete */);
      define(48, 21 /* KEY_0 */);
      define(49, 22 /* KEY_1 */);
      define(50, 23 /* KEY_2 */);
      define(51, 24 /* KEY_3 */);
      define(52, 25 /* KEY_4 */);
      define(53, 26 /* KEY_5 */);
      define(54, 27 /* KEY_6 */);
      define(55, 28 /* KEY_7 */);
      define(56, 29 /* KEY_8 */);
      define(57, 30 /* KEY_9 */);
      define(65, 31 /* KEY_A */);
      define(66, 32 /* KEY_B */);
      define(67, 33 /* KEY_C */);
      define(68, 34 /* KEY_D */);
      define(69, 35 /* KEY_E */);
      define(70, 36 /* KEY_F */);
      define(71, 37 /* KEY_G */);
      define(72, 38 /* KEY_H */);
      define(73, 39 /* KEY_I */);
      define(74, 40 /* KEY_J */);
      define(75, 41 /* KEY_K */);
      define(76, 42 /* KEY_L */);
      define(77, 43 /* KEY_M */);
      define(78, 44 /* KEY_N */);
      define(79, 45 /* KEY_O */);
      define(80, 46 /* KEY_P */);
      define(81, 47 /* KEY_Q */);
      define(82, 48 /* KEY_R */);
      define(83, 49 /* KEY_S */);
      define(84, 50 /* KEY_T */);
      define(85, 51 /* KEY_U */);
      define(86, 52 /* KEY_V */);
      define(87, 53 /* KEY_W */);
      define(88, 54 /* KEY_X */);
      define(89, 55 /* KEY_Y */);
      define(90, 56 /* KEY_Z */);
      define(93, 58 /* ContextMenu */);
      define(96, 93 /* NUMPAD_0 */);
      define(97, 94 /* NUMPAD_1 */);
      define(98, 95 /* NUMPAD_2 */);
      define(99, 96 /* NUMPAD_3 */);
      define(100, 97 /* NUMPAD_4 */);
      define(101, 98 /* NUMPAD_5 */);
      define(102, 99 /* NUMPAD_6 */);
      define(103, 100 /* NUMPAD_7 */);
      define(104, 101 /* NUMPAD_8 */);
      define(105, 102 /* NUMPAD_9 */);
      define(106, 103 /* NUMPAD_MULTIPLY */);
      define(107, 104 /* NUMPAD_ADD */);
      define(108, 105 /* NUMPAD_SEPARATOR */);
      define(109, 106 /* NUMPAD_SUBTRACT */);
      define(110, 107 /* NUMPAD_DECIMAL */);
      define(111, 108 /* NUMPAD_DIVIDE */);
      define(112, 59 /* F1 */);
      define(113, 60 /* F2 */);
      define(114, 61 /* F3 */);
      define(115, 62 /* F4 */);
      define(116, 63 /* F5 */);
      define(117, 64 /* F6 */);
      define(118, 65 /* F7 */);
      define(119, 66 /* F8 */);
      define(120, 67 /* F9 */);
      define(121, 68 /* F10 */);
      define(122, 69 /* F11 */);
      define(123, 70 /* F12 */);
      define(124, 71 /* F13 */);
      define(125, 72 /* F14 */);
      define(126, 73 /* F15 */);
      define(127, 74 /* F16 */);
      define(128, 75 /* F17 */);
      define(129, 76 /* F18 */);
      define(130, 77 /* F19 */);
      define(144, 78 /* NumLock */);
      define(145, 79 /* ScrollLock */);
      define(186, 80 /* US_SEMICOLON */);
      define(187, 81 /* US_EQUAL */);
      define(188, 82 /* US_COMMA */);
      define(189, 83 /* US_MINUS */);
      define(190, 84 /* US_DOT */);
      define(191, 85 /* US_SLASH */);
      define(192, 86 /* US_BACKTICK */);
      define(193, 110 /* ABNT_C1 */);
      define(194, 111 /* ABNT_C2 */);
      define(219, 87 /* US_OPEN_SQUARE_BRACKET */);
      define(220, 88 /* US_BACKSLASH */);
      define(221, 89 /* US_CLOSE_SQUARE_BRACKET */);
      define(222, 90 /* US_QUOTE */);
      define(223, 91 /* OEM_8 */);
      define(226, 92 /* OEM_102 */);
      /**
       * https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
       * If an Input Method Editor is processing key input and the event is keydown, return 229.
       */
      define(229, 109 /* KEY_IN_COMPOSITION */);
      if (platform.isIE) {
          define(91, 57 /* Meta */);
      }
      else if (platform.isFirefox) {
          define(59, 80 /* US_SEMICOLON */);
          define(107, 81 /* US_EQUAL */);
          define(109, 83 /* US_MINUS */);
          if (platform.isMacintosh) {
              define(224, 57 /* Meta */);
          }
      }
      else if (platform.isWebKit) {
          define(91, 57 /* Meta */);
          if (platform.isMacintosh) {
              // the two meta keys in the Mac have different key codes (91 and 93)
              define(93, 57 /* Meta */);
          }
          else {
              define(92, 57 /* Meta */);
          }
      }
  })();
  function extractKeyCode(e) {
      if (e.charCode) {
          // "keypress" events mostly
          let char = String.fromCharCode(e.charCode).toUpperCase();
          return exports.KeyCodeUtils.fromString(char);
      }
      return KEY_CODE_MAP[e.keyCode] || 0 /* Unknown */;
  }
  function getCodeForKeyCode(keyCode) {
      return INVERSE_KEY_CODE_MAP[keyCode];
  }
  const ctrlKeyMod = (platform.isMacintosh ? 256 /* WinCtrl */ : 2048 /* CtrlCmd */);
  const altKeyMod = 512 /* Alt */;
  const shiftKeyMod = 1024 /* Shift */;
  const metaKeyMod = (platform.isMacintosh ? 2048 /* CtrlCmd */ : 256 /* WinCtrl */);
  class StandardKeyboardEvent {
      constructor(source) {
          let e = source;
          this.browserEvent = e;
          this.target = e.target;
          this.ctrlKey = e.ctrlKey;
          this.shiftKey = e.shiftKey;
          this.altKey = e.altKey;
          this.metaKey = e.metaKey;
          this.keyCode = extractKeyCode(e);
          this.code = e.code;
          // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
          this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* Ctrl */;
          this.altKey = this.altKey || this.keyCode === 6 /* Alt */;
          this.shiftKey = this.shiftKey || this.keyCode === 4 /* Shift */;
          this.metaKey = this.metaKey || this.keyCode === 57 /* Meta */;
          this._asKeybinding = this._computeKeybinding();
          this._asRuntimeKeybinding = this._computeRuntimeKeybinding();
          // console.log(`code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`);
      }
      preventDefault() {
          if (this.browserEvent && this.browserEvent.preventDefault) {
              this.browserEvent.preventDefault();
          }
      }
      stopPropagation() {
          if (this.browserEvent && this.browserEvent.stopPropagation) {
              this.browserEvent.stopPropagation();
          }
      }
      toKeybinding() {
          return this._asRuntimeKeybinding;
      }
      equals(other) {
          return this._asKeybinding === other;
      }
      _computeKeybinding() {
          let key = 0 /* Unknown */;
          if (this.keyCode !== 5 /* Ctrl */ && this.keyCode !== 4 /* Shift */ && this.keyCode !== 6 /* Alt */ && this.keyCode !== 57 /* Meta */) {
              key = this.keyCode;
          }
          let result = 0;
          if (this.ctrlKey) {
              result |= ctrlKeyMod;
          }
          if (this.altKey) {
              result |= altKeyMod;
          }
          if (this.shiftKey) {
              result |= shiftKeyMod;
          }
          if (this.metaKey) {
              result |= metaKeyMod;
          }
          result |= key;
          return result;
      }
      _computeRuntimeKeybinding() {
          let key = 0 /* Unknown */;
          if (this.keyCode !== 5 /* Ctrl */ && this.keyCode !== 4 /* Shift */ && this.keyCode !== 6 /* Alt */ && this.keyCode !== 57 /* Meta */) {
              key = this.keyCode;
          }
          return new SimpleKeybinding(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
      }
  }

  /**
   * keyboardEvent.code
   * 这里Enum的值没有意义
   * 这个文件是为了改进代码风格，用Enum代替DOMString
   */
  const scanCodeIntToStr = [];
  const scanCodeStrToInt = Object.create(null);
  const scanCodeLowerCaseStrToInt = Object.create(null);
  const ScanCodeUtils = {
      lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* None */,
      toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* None */,
      toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
  };
  /**
   * -1 if a ScanCode => KeyCode mapping depends on kb layout.
   */
  const IMMUTABLE_CODE_TO_KEY_CODE = [];
  /**
   * -1 if a KeyCode => ScanCode mapping depends on kb layout.
   */
  const IMMUTABLE_KEY_CODE_TO_CODE = [];
  class ScanCodeBinding {
      constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
          this.ctrlKey = ctrlKey;
          this.shiftKey = shiftKey;
          this.altKey = altKey;
          this.metaKey = metaKey;
          this.scanCode = scanCode;
      }
      equals(other) {
          return (this.ctrlKey === other.ctrlKey
              && this.shiftKey === other.shiftKey
              && this.altKey === other.altKey
              && this.metaKey === other.metaKey
              && this.scanCode === other.scanCode);
      }
      /**
       * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
       */
      isDuplicateModifierCase() {
          return ((this.ctrlKey && (this.scanCode === 157 /* ControlLeft */ || this.scanCode === 161 /* ControlRight */))
              || (this.shiftKey && (this.scanCode === 158 /* ShiftLeft */ || this.scanCode === 162 /* ShiftRight */))
              || (this.altKey && (this.scanCode === 159 /* AltLeft */ || this.scanCode === 163 /* AltRight */))
              || (this.metaKey && (this.scanCode === 160 /* MetaLeft */ || this.scanCode === 164 /* MetaRight */)));
      }
  }
  (function () {
      function d(intScanCode, strScanCode) {
          scanCodeIntToStr[intScanCode] = strScanCode;
          scanCodeStrToInt[strScanCode] = intScanCode;
          scanCodeLowerCaseStrToInt[strScanCode.toLowerCase()] = intScanCode;
      }
      d(0 /* None */, 'None');
      d(1 /* Hyper */, 'Hyper');
      d(2 /* Super */, 'Super');
      d(3 /* Fn */, 'Fn');
      d(4 /* FnLock */, 'FnLock');
      d(5 /* Suspend */, 'Suspend');
      d(6 /* Resume */, 'Resume');
      d(7 /* Turbo */, 'Turbo');
      d(8 /* Sleep */, 'Sleep');
      d(9 /* WakeUp */, 'WakeUp');
      d(10 /* KeyA */, 'KeyA');
      d(11 /* KeyB */, 'KeyB');
      d(12 /* KeyC */, 'KeyC');
      d(13 /* KeyD */, 'KeyD');
      d(14 /* KeyE */, 'KeyE');
      d(15 /* KeyF */, 'KeyF');
      d(16 /* KeyG */, 'KeyG');
      d(17 /* KeyH */, 'KeyH');
      d(18 /* KeyI */, 'KeyI');
      d(19 /* KeyJ */, 'KeyJ');
      d(20 /* KeyK */, 'KeyK');
      d(21 /* KeyL */, 'KeyL');
      d(22 /* KeyM */, 'KeyM');
      d(23 /* KeyN */, 'KeyN');
      d(24 /* KeyO */, 'KeyO');
      d(25 /* KeyP */, 'KeyP');
      d(26 /* KeyQ */, 'KeyQ');
      d(27 /* KeyR */, 'KeyR');
      d(28 /* KeyS */, 'KeyS');
      d(29 /* KeyT */, 'KeyT');
      d(30 /* KeyU */, 'KeyU');
      d(31 /* KeyV */, 'KeyV');
      d(32 /* KeyW */, 'KeyW');
      d(33 /* KeyX */, 'KeyX');
      d(34 /* KeyY */, 'KeyY');
      d(35 /* KeyZ */, 'KeyZ');
      d(36 /* Digit1 */, 'Digit1');
      d(37 /* Digit2 */, 'Digit2');
      d(38 /* Digit3 */, 'Digit3');
      d(39 /* Digit4 */, 'Digit4');
      d(40 /* Digit5 */, 'Digit5');
      d(41 /* Digit6 */, 'Digit6');
      d(42 /* Digit7 */, 'Digit7');
      d(43 /* Digit8 */, 'Digit8');
      d(44 /* Digit9 */, 'Digit9');
      d(45 /* Digit0 */, 'Digit0');
      d(46 /* Enter */, 'Enter');
      d(47 /* Escape */, 'Escape');
      d(48 /* Backspace */, 'Backspace');
      d(49 /* Tab */, 'Tab');
      d(50 /* Space */, 'Space');
      d(51 /* Minus */, 'Minus');
      d(52 /* Equal */, 'Equal');
      d(53 /* BracketLeft */, 'BracketLeft');
      d(54 /* BracketRight */, 'BracketRight');
      d(55 /* Backslash */, 'Backslash');
      d(56 /* IntlHash */, 'IntlHash');
      d(57 /* Semicolon */, 'Semicolon');
      d(58 /* Quote */, 'Quote');
      d(59 /* Backquote */, 'Backquote');
      d(60 /* Comma */, 'Comma');
      d(61 /* Period */, 'Period');
      d(62 /* Slash */, 'Slash');
      d(63 /* CapsLock */, 'CapsLock');
      d(64 /* F1 */, 'F1');
      d(65 /* F2 */, 'F2');
      d(66 /* F3 */, 'F3');
      d(67 /* F4 */, 'F4');
      d(68 /* F5 */, 'F5');
      d(69 /* F6 */, 'F6');
      d(70 /* F7 */, 'F7');
      d(71 /* F8 */, 'F8');
      d(72 /* F9 */, 'F9');
      d(73 /* F10 */, 'F10');
      d(74 /* F11 */, 'F11');
      d(75 /* F12 */, 'F12');
      d(76 /* PrintScreen */, 'PrintScreen');
      d(77 /* ScrollLock */, 'ScrollLock');
      d(78 /* Pause */, 'Pause');
      d(79 /* Insert */, 'Insert');
      d(80 /* Home */, 'Home');
      d(81 /* PageUp */, 'PageUp');
      d(82 /* Delete */, 'Delete');
      d(83 /* End */, 'End');
      d(84 /* PageDown */, 'PageDown');
      d(85 /* ArrowRight */, 'ArrowRight');
      d(86 /* ArrowLeft */, 'ArrowLeft');
      d(87 /* ArrowDown */, 'ArrowDown');
      d(88 /* ArrowUp */, 'ArrowUp');
      d(89 /* NumLock */, 'NumLock');
      d(90 /* NumpadDivide */, 'NumpadDivide');
      d(91 /* NumpadMultiply */, 'NumpadMultiply');
      d(92 /* NumpadSubtract */, 'NumpadSubtract');
      d(93 /* NumpadAdd */, 'NumpadAdd');
      d(94 /* NumpadEnter */, 'NumpadEnter');
      d(95 /* Numpad1 */, 'Numpad1');
      d(96 /* Numpad2 */, 'Numpad2');
      d(97 /* Numpad3 */, 'Numpad3');
      d(98 /* Numpad4 */, 'Numpad4');
      d(99 /* Numpad5 */, 'Numpad5');
      d(100 /* Numpad6 */, 'Numpad6');
      d(101 /* Numpad7 */, 'Numpad7');
      d(102 /* Numpad8 */, 'Numpad8');
      d(103 /* Numpad9 */, 'Numpad9');
      d(104 /* Numpad0 */, 'Numpad0');
      d(105 /* NumpadDecimal */, 'NumpadDecimal');
      d(106 /* IntlBackslash */, 'IntlBackslash');
      d(107 /* ContextMenu */, 'ContextMenu');
      d(108 /* Power */, 'Power');
      d(109 /* NumpadEqual */, 'NumpadEqual');
      d(110 /* F13 */, 'F13');
      d(111 /* F14 */, 'F14');
      d(112 /* F15 */, 'F15');
      d(113 /* F16 */, 'F16');
      d(114 /* F17 */, 'F17');
      d(115 /* F18 */, 'F18');
      d(116 /* F19 */, 'F19');
      d(117 /* F20 */, 'F20');
      d(118 /* F21 */, 'F21');
      d(119 /* F22 */, 'F22');
      d(120 /* F23 */, 'F23');
      d(121 /* F24 */, 'F24');
      d(122 /* Open */, 'Open');
      d(123 /* Help */, 'Help');
      d(124 /* Select */, 'Select');
      d(125 /* Again */, 'Again');
      d(126 /* Undo */, 'Undo');
      d(127 /* Cut */, 'Cut');
      d(128 /* Copy */, 'Copy');
      d(129 /* Paste */, 'Paste');
      d(130 /* Find */, 'Find');
      d(131 /* AudioVolumeMute */, 'AudioVolumeMute');
      d(132 /* AudioVolumeUp */, 'AudioVolumeUp');
      d(133 /* AudioVolumeDown */, 'AudioVolumeDown');
      d(134 /* NumpadComma */, 'NumpadComma');
      d(135 /* IntlRo */, 'IntlRo');
      d(136 /* KanaMode */, 'KanaMode');
      d(137 /* IntlYen */, 'IntlYen');
      d(138 /* Convert */, 'Convert');
      d(139 /* NonConvert */, 'NonConvert');
      d(140 /* Lang1 */, 'Lang1');
      d(141 /* Lang2 */, 'Lang2');
      d(142 /* Lang3 */, 'Lang3');
      d(143 /* Lang4 */, 'Lang4');
      d(144 /* Lang5 */, 'Lang5');
      d(145 /* Abort */, 'Abort');
      d(146 /* Props */, 'Props');
      d(147 /* NumpadParenLeft */, 'NumpadParenLeft');
      d(148 /* NumpadParenRight */, 'NumpadParenRight');
      d(149 /* NumpadBackspace */, 'NumpadBackspace');
      d(150 /* NumpadMemoryStore */, 'NumpadMemoryStore');
      d(151 /* NumpadMemoryRecall */, 'NumpadMemoryRecall');
      d(152 /* NumpadMemoryClear */, 'NumpadMemoryClear');
      d(153 /* NumpadMemoryAdd */, 'NumpadMemoryAdd');
      d(154 /* NumpadMemorySubtract */, 'NumpadMemorySubtract');
      d(155 /* NumpadClear */, 'NumpadClear');
      d(156 /* NumpadClearEntry */, 'NumpadClearEntry');
      d(157 /* ControlLeft */, 'ControlLeft');
      d(158 /* ShiftLeft */, 'ShiftLeft');
      d(159 /* AltLeft */, 'AltLeft');
      d(160 /* MetaLeft */, 'MetaLeft');
      d(161 /* ControlRight */, 'ControlRight');
      d(162 /* ShiftRight */, 'ShiftRight');
      d(163 /* AltRight */, 'AltRight');
      d(164 /* MetaRight */, 'MetaRight');
      d(165 /* BrightnessUp */, 'BrightnessUp');
      d(166 /* BrightnessDown */, 'BrightnessDown');
      d(167 /* MediaPlay */, 'MediaPlay');
      d(168 /* MediaRecord */, 'MediaRecord');
      d(169 /* MediaFastForward */, 'MediaFastForward');
      d(170 /* MediaRewind */, 'MediaRewind');
      d(171 /* MediaTrackNext */, 'MediaTrackNext');
      d(172 /* MediaTrackPrevious */, 'MediaTrackPrevious');
      d(173 /* MediaStop */, 'MediaStop');
      d(174 /* Eject */, 'Eject');
      d(175 /* MediaPlayPause */, 'MediaPlayPause');
      d(176 /* MediaSelect */, 'MediaSelect');
      d(177 /* LaunchMail */, 'LaunchMail');
      d(178 /* LaunchApp2 */, 'LaunchApp2');
      d(179 /* LaunchApp1 */, 'LaunchApp1');
      d(180 /* SelectTask */, 'SelectTask');
      d(181 /* LaunchScreenSaver */, 'LaunchScreenSaver');
      d(182 /* BrowserSearch */, 'BrowserSearch');
      d(183 /* BrowserHome */, 'BrowserHome');
      d(184 /* BrowserBack */, 'BrowserBack');
      d(185 /* BrowserForward */, 'BrowserForward');
      d(186 /* BrowserStop */, 'BrowserStop');
      d(187 /* BrowserRefresh */, 'BrowserRefresh');
      d(188 /* BrowserFavorites */, 'BrowserFavorites');
      d(189 /* ZoomToggle */, 'ZoomToggle');
      d(190 /* MailReply */, 'MailReply');
      d(191 /* MailForward */, 'MailForward');
      d(192 /* MailSend */, 'MailSend');
  })();
  (function () {
      for (let i = 0; i <= 193 /* MAX_VALUE */; i++) {
          IMMUTABLE_CODE_TO_KEY_CODE[i] = -1;
      }
      for (let i = 0; i <= 112 /* MAX_VALUE */; i++) {
          IMMUTABLE_KEY_CODE_TO_CODE[i] = -1;
      }
      function define(code, keyCode) {
          IMMUTABLE_CODE_TO_KEY_CODE[code] = keyCode;
          if ((keyCode !== 0 /* Unknown */)
              && (keyCode !== 3 /* Enter */)
              && (keyCode !== 5 /* Ctrl */)
              && (keyCode !== 4 /* Shift */)
              && (keyCode !== 6 /* Alt */)
              && (keyCode !== 57 /* Meta */)) {
              IMMUTABLE_KEY_CODE_TO_CODE[keyCode] = code;
          }
      }
      // Manually added due to the exclusion above (due to duplication with NumpadEnter)
      IMMUTABLE_KEY_CODE_TO_CODE[3 /* Enter */] = 46 /* Enter */;
      define(0 /* None */, 0 /* Unknown */);
      define(1 /* Hyper */, 0 /* Unknown */);
      define(2 /* Super */, 0 /* Unknown */);
      define(3 /* Fn */, 0 /* Unknown */);
      define(4 /* FnLock */, 0 /* Unknown */);
      define(5 /* Suspend */, 0 /* Unknown */);
      define(6 /* Resume */, 0 /* Unknown */);
      define(7 /* Turbo */, 0 /* Unknown */);
      define(8 /* Sleep */, 0 /* Unknown */);
      define(9 /* WakeUp */, 0 /* Unknown */);
      // define(ScanCode.KeyA, KeyCode.Unknown);
      // define(ScanCode.KeyB, KeyCode.Unknown);
      // define(ScanCode.KeyC, KeyCode.Unknown);
      // define(ScanCode.KeyD, KeyCode.Unknown);
      // define(ScanCode.KeyE, KeyCode.Unknown);
      // define(ScanCode.KeyF, KeyCode.Unknown);
      // define(ScanCode.KeyG, KeyCode.Unknown);
      // define(ScanCode.KeyH, KeyCode.Unknown);
      // define(ScanCode.KeyI, KeyCode.Unknown);
      // define(ScanCode.KeyJ, KeyCode.Unknown);
      // define(ScanCode.KeyK, KeyCode.Unknown);
      // define(ScanCode.KeyL, KeyCode.Unknown);
      // define(ScanCode.KeyM, KeyCode.Unknown);
      // define(ScanCode.KeyN, KeyCode.Unknown);
      // define(ScanCode.KeyO, KeyCode.Unknown);
      // define(ScanCode.KeyP, KeyCode.Unknown);
      // define(ScanCode.KeyQ, KeyCode.Unknown);
      // define(ScanCode.KeyR, KeyCode.Unknown);
      // define(ScanCode.KeyS, KeyCode.Unknown);
      // define(ScanCode.KeyT, KeyCode.Unknown);
      // define(ScanCode.KeyU, KeyCode.Unknown);
      // define(ScanCode.KeyV, KeyCode.Unknown);
      // define(ScanCode.KeyW, KeyCode.Unknown);
      // define(ScanCode.KeyX, KeyCode.Unknown);
      // define(ScanCode.KeyY, KeyCode.Unknown);
      // define(ScanCode.KeyZ, KeyCode.Unknown);
      // define(ScanCode.Digit1, KeyCode.Unknown);
      // define(ScanCode.Digit2, KeyCode.Unknown);
      // define(ScanCode.Digit3, KeyCode.Unknown);
      // define(ScanCode.Digit4, KeyCode.Unknown);
      // define(ScanCode.Digit5, KeyCode.Unknown);
      // define(ScanCode.Digit6, KeyCode.Unknown);
      // define(ScanCode.Digit7, KeyCode.Unknown);
      // define(ScanCode.Digit8, KeyCode.Unknown);
      // define(ScanCode.Digit9, KeyCode.Unknown);
      // define(ScanCode.Digit0, KeyCode.Unknown);
      define(46 /* Enter */, 3 /* Enter */);
      define(47 /* Escape */, 9 /* Escape */);
      define(48 /* Backspace */, 1 /* Backspace */);
      define(49 /* Tab */, 2 /* Tab */);
      define(50 /* Space */, 10 /* Space */);
      // define(ScanCode.Minus, KeyCode.Unknown);
      // define(ScanCode.Equal, KeyCode.Unknown);
      // define(ScanCode.BracketLeft, KeyCode.Unknown);
      // define(ScanCode.BracketRight, KeyCode.Unknown);
      // define(ScanCode.Backslash, KeyCode.Unknown);
      // define(ScanCode.IntlHash, KeyCode.Unknown);
      // define(ScanCode.Semicolon, KeyCode.Unknown);
      // define(ScanCode.Quote, KeyCode.Unknown);
      // define(ScanCode.Backquote, KeyCode.Unknown);
      // define(ScanCode.Comma, KeyCode.Unknown);
      // define(ScanCode.Period, KeyCode.Unknown);
      // define(ScanCode.Slash, KeyCode.Unknown);
      define(63 /* CapsLock */, 8 /* CapsLock */);
      define(64 /* F1 */, 59 /* F1 */);
      define(65 /* F2 */, 60 /* F2 */);
      define(66 /* F3 */, 61 /* F3 */);
      define(67 /* F4 */, 62 /* F4 */);
      define(68 /* F5 */, 63 /* F5 */);
      define(69 /* F6 */, 64 /* F6 */);
      define(70 /* F7 */, 65 /* F7 */);
      define(71 /* F8 */, 66 /* F8 */);
      define(72 /* F9 */, 67 /* F9 */);
      define(73 /* F10 */, 68 /* F10 */);
      define(74 /* F11 */, 69 /* F11 */);
      define(75 /* F12 */, 70 /* F12 */);
      define(76 /* PrintScreen */, 0 /* Unknown */);
      define(77 /* ScrollLock */, 79 /* ScrollLock */);
      define(78 /* Pause */, 7 /* PauseBreak */);
      define(79 /* Insert */, 19 /* Insert */);
      define(80 /* Home */, 14 /* Home */);
      define(81 /* PageUp */, 11 /* PageUp */);
      define(82 /* Delete */, 20 /* Delete */);
      define(83 /* End */, 13 /* End */);
      define(84 /* PageDown */, 12 /* PageDown */);
      define(85 /* ArrowRight */, 17 /* RightArrow */);
      define(86 /* ArrowLeft */, 15 /* LeftArrow */);
      define(87 /* ArrowDown */, 18 /* DownArrow */);
      define(88 /* ArrowUp */, 16 /* UpArrow */);
      define(89 /* NumLock */, 78 /* NumLock */);
      define(90 /* NumpadDivide */, 108 /* NUMPAD_DIVIDE */);
      define(91 /* NumpadMultiply */, 103 /* NUMPAD_MULTIPLY */);
      define(92 /* NumpadSubtract */, 106 /* NUMPAD_SUBTRACT */);
      define(93 /* NumpadAdd */, 104 /* NUMPAD_ADD */);
      define(94 /* NumpadEnter */, 3 /* Enter */); // Duplicate
      define(95 /* Numpad1 */, 94 /* NUMPAD_1 */);
      define(96 /* Numpad2 */, 95 /* NUMPAD_2 */);
      define(97 /* Numpad3 */, 96 /* NUMPAD_3 */);
      define(98 /* Numpad4 */, 97 /* NUMPAD_4 */);
      define(99 /* Numpad5 */, 98 /* NUMPAD_5 */);
      define(100 /* Numpad6 */, 99 /* NUMPAD_6 */);
      define(101 /* Numpad7 */, 100 /* NUMPAD_7 */);
      define(102 /* Numpad8 */, 101 /* NUMPAD_8 */);
      define(103 /* Numpad9 */, 102 /* NUMPAD_9 */);
      define(104 /* Numpad0 */, 93 /* NUMPAD_0 */);
      define(105 /* NumpadDecimal */, 107 /* NUMPAD_DECIMAL */);
      // define(ScanCode.IntlBackslash, KeyCode.Unknown);
      define(107 /* ContextMenu */, 58 /* ContextMenu */);
      define(108 /* Power */, 0 /* Unknown */);
      define(109 /* NumpadEqual */, 0 /* Unknown */);
      define(110 /* F13 */, 71 /* F13 */);
      define(111 /* F14 */, 72 /* F14 */);
      define(112 /* F15 */, 73 /* F15 */);
      define(113 /* F16 */, 74 /* F16 */);
      define(114 /* F17 */, 75 /* F17 */);
      define(115 /* F18 */, 76 /* F18 */);
      define(116 /* F19 */, 77 /* F19 */);
      define(117 /* F20 */, 0 /* Unknown */);
      define(118 /* F21 */, 0 /* Unknown */);
      define(119 /* F22 */, 0 /* Unknown */);
      define(120 /* F23 */, 0 /* Unknown */);
      define(121 /* F24 */, 0 /* Unknown */);
      define(122 /* Open */, 0 /* Unknown */);
      define(123 /* Help */, 0 /* Unknown */);
      define(124 /* Select */, 0 /* Unknown */);
      define(125 /* Again */, 0 /* Unknown */);
      define(126 /* Undo */, 0 /* Unknown */);
      define(127 /* Cut */, 0 /* Unknown */);
      define(128 /* Copy */, 0 /* Unknown */);
      define(129 /* Paste */, 0 /* Unknown */);
      define(130 /* Find */, 0 /* Unknown */);
      define(131 /* AudioVolumeMute */, 0 /* Unknown */);
      define(132 /* AudioVolumeUp */, 0 /* Unknown */);
      define(133 /* AudioVolumeDown */, 0 /* Unknown */);
      define(134 /* NumpadComma */, 105 /* NUMPAD_SEPARATOR */);
      // define(ScanCode.IntlRo, KeyCode.Unknown);
      define(136 /* KanaMode */, 0 /* Unknown */);
      // define(ScanCode.IntlYen, KeyCode.Unknown);
      define(138 /* Convert */, 0 /* Unknown */);
      define(139 /* NonConvert */, 0 /* Unknown */);
      define(140 /* Lang1 */, 0 /* Unknown */);
      define(141 /* Lang2 */, 0 /* Unknown */);
      define(142 /* Lang3 */, 0 /* Unknown */);
      define(143 /* Lang4 */, 0 /* Unknown */);
      define(144 /* Lang5 */, 0 /* Unknown */);
      define(145 /* Abort */, 0 /* Unknown */);
      define(146 /* Props */, 0 /* Unknown */);
      define(147 /* NumpadParenLeft */, 0 /* Unknown */);
      define(148 /* NumpadParenRight */, 0 /* Unknown */);
      define(149 /* NumpadBackspace */, 0 /* Unknown */);
      define(150 /* NumpadMemoryStore */, 0 /* Unknown */);
      define(151 /* NumpadMemoryRecall */, 0 /* Unknown */);
      define(152 /* NumpadMemoryClear */, 0 /* Unknown */);
      define(153 /* NumpadMemoryAdd */, 0 /* Unknown */);
      define(154 /* NumpadMemorySubtract */, 0 /* Unknown */);
      define(155 /* NumpadClear */, 0 /* Unknown */);
      define(156 /* NumpadClearEntry */, 0 /* Unknown */);
      define(157 /* ControlLeft */, 5 /* Ctrl */); // Duplicate
      define(158 /* ShiftLeft */, 4 /* Shift */); // Duplicate
      define(159 /* AltLeft */, 6 /* Alt */); // Duplicate
      define(160 /* MetaLeft */, 57 /* Meta */); // Duplicate
      define(161 /* ControlRight */, 5 /* Ctrl */); // Duplicate
      define(162 /* ShiftRight */, 4 /* Shift */); // Duplicate
      define(163 /* AltRight */, 6 /* Alt */); // Duplicate
      define(164 /* MetaRight */, 57 /* Meta */); // Duplicate
      define(165 /* BrightnessUp */, 0 /* Unknown */);
      define(166 /* BrightnessDown */, 0 /* Unknown */);
      define(167 /* MediaPlay */, 0 /* Unknown */);
      define(168 /* MediaRecord */, 0 /* Unknown */);
      define(169 /* MediaFastForward */, 0 /* Unknown */);
      define(170 /* MediaRewind */, 0 /* Unknown */);
      define(171 /* MediaTrackNext */, 0 /* Unknown */);
      define(172 /* MediaTrackPrevious */, 0 /* Unknown */);
      define(173 /* MediaStop */, 0 /* Unknown */);
      define(174 /* Eject */, 0 /* Unknown */);
      define(175 /* MediaPlayPause */, 0 /* Unknown */);
      define(176 /* MediaSelect */, 0 /* Unknown */);
      define(177 /* LaunchMail */, 0 /* Unknown */);
      define(178 /* LaunchApp2 */, 0 /* Unknown */);
      define(179 /* LaunchApp1 */, 0 /* Unknown */);
      define(180 /* SelectTask */, 0 /* Unknown */);
      define(181 /* LaunchScreenSaver */, 0 /* Unknown */);
      define(182 /* BrowserSearch */, 0 /* Unknown */);
      define(183 /* BrowserHome */, 0 /* Unknown */);
      define(184 /* BrowserBack */, 0 /* Unknown */);
      define(185 /* BrowserForward */, 0 /* Unknown */);
      define(186 /* BrowserStop */, 0 /* Unknown */);
      define(187 /* BrowserRefresh */, 0 /* Unknown */);
      define(188 /* BrowserFavorites */, 0 /* Unknown */);
      define(189 /* ZoomToggle */, 0 /* Unknown */);
      define(190 /* MailReply */, 0 /* Unknown */);
      define(191 /* MailForward */, 0 /* Unknown */);
      define(192 /* MailSend */, 0 /* Unknown */);
  })();

  exports.ChordKeybinding = ChordKeybinding;
  exports.IMMUTABLE_CODE_TO_KEY_CODE = IMMUTABLE_CODE_TO_KEY_CODE;
  exports.IMMUTABLE_KEY_CODE_TO_CODE = IMMUTABLE_KEY_CODE_TO_CODE;
  exports.ScanCodeBinding = ScanCodeBinding;
  exports.ScanCodeUtils = ScanCodeUtils;
  exports.SimpleKeybinding = SimpleKeybinding;
  exports.StandardKeyboardEvent = StandardKeyboardEvent;
  exports.createKeybinding = createKeybinding;
  exports.createSimpleKeybinding = createSimpleKeybinding;
  exports.getCodeForKeyCode = getCodeForKeyCode;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
