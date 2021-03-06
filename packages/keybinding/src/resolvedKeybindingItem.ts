import { ContextKeyExpr } from '@fin/contextkey';
import { CharCode } from '@fin/charcode';
import { ResolvedKeybinding } from './resolvedKeybinding';

export class ResolvedKeybindingItem {
	public readonly resolvedKeybinding: ResolvedKeybinding;
	public readonly keypressFirstPart: string;
	public readonly keypressChordPart: string;
	public readonly bubble: boolean;
	public readonly command: string;
	public readonly commandArgs: any;
	public readonly when: ContextKeyExpr;
	public readonly isDefault: boolean;

	constructor(resolvedKeybinding: ResolvedKeybinding, command: string, commandArgs: any, when: ContextKeyExpr, isDefault: boolean) {
		this.resolvedKeybinding = resolvedKeybinding;
		if (resolvedKeybinding) {
			let [keypressFirstPart, keypressChordPart] = resolvedKeybinding.getDispatchParts();
			this.keypressFirstPart = keypressFirstPart;
			this.keypressChordPart = keypressChordPart;
		} else {
			this.keypressFirstPart = null;
			this.keypressChordPart = null;
		}
		this.bubble = (command ? command.charCodeAt(0) === CharCode.Caret : false);
		this.command = this.bubble ? command.substr(1) : command;
		this.commandArgs = commandArgs;
		this.when = when;
		this.isDefault = isDefault;
	}
}
