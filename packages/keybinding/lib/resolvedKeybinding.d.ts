export declare class ResolvedKeybindingPart {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyLabel: string;
    readonly keyAriaLabel: string;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, kbLabel: string, kbAriaLabel: string);
}
/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */
export declare abstract class ResolvedKeybinding {
    /**
     * This prints the binding in a format suitable for displaying in the UI.
     */
    abstract getLabel(): string;
    /**
     * This prints the binding in a format suitable for ARIA.
     */
    abstract getAriaLabel(): string;
    /**
     * This prints the binding in a format suitable for user settings.
     */
    abstract getUserSettingsLabel(): string;
    /**
     * Is the user settings label reflecting the label?
     */
    abstract isWYSIWYG(): boolean;
    /**
     * Is the binding a chord?
     */
    abstract isChord(): boolean;
    /**
     * Returns the firstPart, chordPart that should be used for dispatching.
     */
    abstract getDispatchParts(): [string, string];
    /**
     * Returns the firstPart, chordPart of the keybinding.
     * For simple keybindings, the second element will be null.
     */
    abstract getParts(): [ResolvedKeybindingPart, ResolvedKeybindingPart];
}
