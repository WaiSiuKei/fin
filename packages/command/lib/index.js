(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fin/linkedlist'), require('@fin/event'), require('@fin/disposable')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fin/linkedlist', '@fin/event', '@fin/disposable'], factory) :
    (global = global || self, factory(global['@fin/command'] = {}, global.linkedlist, global.event, global.disposable));
}(this, function (exports, linkedlist, event, disposable) { 'use strict';

    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    const CommandsRegistry = new class {
        constructor() {
            this._commands = new Map();
        }
        registerCommand(idOrCommand, handler) {
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
                commands = new linkedlist.LinkedList();
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
        getCommand(id) {
            const list = this._commands.get(id);
            if (!list || list.isEmpty()) {
                return undefined;
            }
            return list.iterator().next().value;
        }
        getCommands() {
            const result = Object.create(null);
            this._commands.forEach((value, key) => {
                result[key] = this.getCommand(key);
            });
            return result;
        }
    };

    const NullCommandService = {
        onWillExecuteCommand: () => ({ dispose: () => { } }),
        executeCommand() {
            return Promise.resolve(undefined);
        }
    };
    class CommandService extends disposable.Disposable {
        constructor() {
            super(...arguments);
            this._onWillExecuteCommand = this._register(new event.Emitter());
            this.onWillExecuteCommand = this._onWillExecuteCommand.event;
        }
        executeCommand(id, ...args) {
            return this._tryExecuteCommand(id, args);
        }
        _tryExecuteCommand(id, args) {
            const command = this._getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this._onWillExecuteCommand.fire({ commandId: id });
                const result = command.handler.apply(null, args);
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        _getCommand(id) {
            return CommandsRegistry.getCommand(id);
        }
    }

    exports.CommandService = CommandService;
    exports.CommandsRegistry = CommandsRegistry;
    exports.NullCommandService = NullCommandService;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
