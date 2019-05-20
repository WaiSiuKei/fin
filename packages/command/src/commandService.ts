import { Disposable } from '@fin/disposable/src';
import { Event, Emitter } from '@fin/event/src';
import { CommandsRegistry, ICommand, ICommandEvent, ICommandService } from './commands';

export const NullCommandService: ICommandService = {
    onWillExecuteCommand: () => ({ dispose: () => { } }),
    executeCommand() {
        return Promise.resolve(undefined);
    }
};

export class CommandService extends Disposable implements ICommandService {
    private _onWillExecuteCommand: Emitter<ICommandEvent> = this._register(new Emitter<ICommandEvent>());
    public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;

    executeCommand<T>(id: string, ...args: any[]): Promise<T> {
        return this._tryExecuteCommand(id, args);
    }

    private _tryExecuteCommand(id: string, args: any[]): Promise<any> {
        const command = this._getCommand(id);
        if (!command) {
            return Promise.reject(new Error(`command '${id}' not found`));
        }

        try {
            this._onWillExecuteCommand.fire({ commandId: id });
            const result = command.handler.apply(null, args);
            return Promise.resolve(result);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    protected _getCommand(id: string): ICommand {
        return CommandsRegistry.getCommand(id);
    }
}
