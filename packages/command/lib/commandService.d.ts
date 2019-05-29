import { Event } from '@fin/event';
import { Disposable } from '@fin/disposable';
import { ICommand, ICommandEvent, ICommandService } from './commands';
export declare const NullCommandService: ICommandService;
export declare class CommandService extends Disposable implements ICommandService {
    private _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
    private _tryExecuteCommand;
    protected _getCommand(id: string): ICommand;
}
