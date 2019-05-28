/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '@fin/disposable';
import { Event } from '@fin/event';
import { LinkedList } from '@fin/linkedlist';

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

export const CommandsRegistry: ICommandRegistry = new class implements ICommandRegistry {
    private _commands = new Map<string, LinkedList<ICommand>>();

    registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable {

        if (!idOrCommand) {
            throw new Error(`invalid command`);
        }

        if (typeof idOrCommand === 'string') {
            if (!handler) {
                throw new Error(`invalid command`);
            }
            return this.registerCommand({ id: idOrCommand, handler });
        }

        // find a place to store the command
        const { id } = idOrCommand;

        let commands = this._commands.get(id);
        if (!commands) {
            commands = new LinkedList<ICommand>();
            this._commands.set(id, commands);
        }

        let removeFn = commands.unshift(idOrCommand);

        return {
            dispose: () => {
                removeFn();
                if (this._commands.get(id).isEmpty()) {
                    this._commands.delete(id);
                }
            }
        };
    }

    getCommand(id: string): ICommand {
        const list = this._commands.get(id);
        if (!list || list.isEmpty()) {
            return undefined;
        }
        return list.iterator().next().value;
    }

    getCommands(): ICommandsMap {
        const result: ICommandsMap = Object.create(null);
        this._commands.forEach((value, key) => {
            result[key] = this.getCommand(key);
        });
        return result;
    }
};
