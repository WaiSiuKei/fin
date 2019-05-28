export function getKeyMap() {
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

export interface IWindowsKeyMapping {
  vkey: string;
  value: string;
}

export interface IWindowsKeyboardMapping {
  [code: string]: IWindowsKeyMapping;
}

export interface ILinuxKeyMapping {
  value: string;
}

export interface ILinuxKeyboardMapping {
  [code: string]: ILinuxKeyMapping;
}

export interface IMacKeyMapping {
  value: string;
}

export interface IMacKeyboardMapping {
  [code: string]: IMacKeyMapping;
}

export type IKeyboardMapping = IWindowsKeyboardMapping | ILinuxKeyboardMapping | IMacKeyboardMapping;

export interface IWindowsKeyboardLayoutInfo {
  name: string;
  id: string;
  text: string;
}

export interface ILinuxKeyboardLayoutInfo {
  model: string;
  layout: string;
  variant: string;
  options: string;
  rules: string;
}

export interface IMacKeyboardLayoutInfo {
  id: string;
  lang: string;
}

export type IKeyboardLayoutInfo = IWindowsKeyboardLayoutInfo | ILinuxKeyboardLayoutInfo | IMacKeyboardLayoutInfo;
