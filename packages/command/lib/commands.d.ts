import { IDisposable } from '@fin/disposable';
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
export declare const CommandsRegistry: ICommandRegistry;
