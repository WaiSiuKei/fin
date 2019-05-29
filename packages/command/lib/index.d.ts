import { Disposable, IDisposable } from '@fin/disposable';
import { Event } from '@fin/event';

export interface ICommandEvent {
	commandId: string;
}
export interface ICommandService {
	onWillExecuteCommand: Event<ICommandEvent>;
	executeCommand<T = any>(commandId: string, ...args: any[]): Promise<T>;
}
export interface ICommandsMap {
	[id: string]: ICommand;
}
export interface ICommandHandler {
	(...args: any[]): void;
}
export interface ICommand {
	id: string;
	handler: ICommandHandler;
}
export interface ICommandRegistry {
	registerCommand(id: string, command: ICommandHandler): IDisposable;
	registerCommand(command: ICommand): IDisposable;
	getCommand(id: string): ICommand;
	getCommands(): ICommandsMap;
}
export declare class CommandsRegistry implements ICommandRegistry {
	private _commands;
	registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable;
	getCommand(id: string): ICommand;
	getCommands(): ICommandsMap;
}
export declare const NullCommandService: ICommandService;
export declare class CommandService extends Disposable implements ICommandService {
	private _commandsRegistry;
	private _onWillExecuteCommand;
	readonly onWillExecuteCommand: Event<ICommandEvent>;
	constructor(_commandsRegistry: CommandsRegistry);
	executeCommand<T>(id: string, ...args: any[]): Promise<T>;
	private _tryExecuteCommand;
	protected _getCommand(id: string): ICommand;
}

export {};
