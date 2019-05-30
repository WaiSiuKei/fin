export class ResolvedKeybindingPart {
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;

  readonly keyLabel: string;
  readonly keyAriaLabel: string;

  constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, kbLabel: string, kbAriaLabel: string) {
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
export abstract class ResolvedKeybinding {
  /**
   * This prints the binding in a format suitable for displaying in the UI.
   */
  public abstract getLabel(): string;
  /**
   * This prints the binding in a format suitable for user settings.
   */
  public abstract getUserSettingsLabel(): string;
  /**
   * Is the user settings label reflecting the label?
   */
  public abstract isWYSIWYG(): boolean;

  /**
   * Is the binding a chord?
   */
  public abstract isChord(): boolean;

  /**
   * Returns the firstPart, chordPart that should be used for dispatching.
   */
  public abstract getDispatchParts(): [string, string];
  /**
   * Returns the firstPart, chordPart of the keybinding.
   * For simple keybindings, the second element will be null.
   */
  public abstract getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
}
