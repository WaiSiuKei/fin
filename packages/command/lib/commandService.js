"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("@fin/event");
const disposable_1 = require("@fin/disposable");
const commands_1 = require("./commands");
exports.NullCommandService = {
    onWillExecuteCommand: () => ({ dispose: () => { } }),
    executeCommand() {
        return Promise.resolve(undefined);
    }
};
class CommandService extends disposable_1.Disposable {
    constructor() {
        super(...arguments);
        this._onWillExecuteCommand = this._register(new event_1.Emitter());
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
        return commands_1.CommandsRegistry.getCommand(id);
    }
}
exports.CommandService = CommandService;
