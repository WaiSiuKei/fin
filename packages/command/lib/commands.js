"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const linkedlist_1 = require("@fin/linkedlist");
class CommandsRegistry {
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
            commands = new linkedlist_1.LinkedList();
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
}
exports.CommandsRegistry = CommandsRegistry;
;
