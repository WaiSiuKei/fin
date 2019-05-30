import { OperatingSystem } from '@fin/platform';

export interface ModifierLabels {
  readonly ctrlKey: string;
  readonly shiftKey: string;
  readonly altKey: string;
  readonly metaKey: string;
  readonly separator: string;
}

export interface Modifiers {
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
}

export class ModifierLabelProvider {

  public readonly modifierLabels: ModifierLabels[];

  constructor(mac: ModifierLabels, windows: ModifierLabels, linux: ModifierLabels = windows) {
    this.modifierLabels = [null];
    this.modifierLabels[OperatingSystem.Macintosh] = mac;
    this.modifierLabels[OperatingSystem.Windows] = windows;
    this.modifierLabels[OperatingSystem.Linux] = linux;
  }

  public toLabel(firstPartMod: Modifiers, firstPartKey: string, chordPartMod: Modifiers, chordPartKey: string, OS: OperatingSystem): string {
    if (firstPartKey === null && chordPartKey === null) {
      return null;
    }
    return _asString(firstPartMod, firstPartKey, chordPartMod, chordPartKey, this.modifierLabels[OS]);
  }
}

/**
 * A label provider that prints modifiers in a suitable format for displaying in the UI.
 */
export const UILabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: '⌃',
    shiftKey: '⇧',
    altKey: '⌥',
    metaKey: '⌘',
    separator: '',
  },
  {
    ctrlKey: 'Ctrl',
    shiftKey: 'Shift',
    altKey: 'Alt',
    metaKey: 'Windows',
    separator: '+',
  }
);

/**
 * A label provider that prints modifiers in a suitable format for user settings.
 */
export const UserSettingsLabelProvider = new ModifierLabelProvider(
  {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'cmd',
    separator: '+',
  },
  {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'win',
    separator: '+',
  },
  {
    ctrlKey: 'ctrl',
    shiftKey: 'shift',
    altKey: 'alt',
    metaKey: 'meta',
    separator: '+',
  }
);

function _simpleAsString(modifiers: Modifiers, key: string, labels: ModifierLabels): string {
  if (key === null) {
    return '';
  }

  let result: string[] = [];

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

function _asString(firstPartMod: Modifiers, firstPartKey: string, chordPartMod: Modifiers, chordPartKey: string, labels: ModifierLabels): string {
  let result = _simpleAsString(firstPartMod, firstPartKey, labels);

  if (chordPartKey !== null) {
    result += ' ';
    result += _simpleAsString(chordPartMod, chordPartKey, labels);
  }

  return result;
}
