import { KeybindingService, KeybindingsRegistry } from '@fin/keybinding';
import { KeyCode, KeyMod } from '@fin/keyboard';
import { ContextKeyService } from '@fin/contextkey';
import { CommandService, CommandsRegistry } from '@fin/command';

const commandsRegistry = new CommandsRegistry();
const keybindingsRegistry = new KeybindingsRegistry(commandsRegistry);

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'test',
  weight: 100,
  when: undefined,
  primary: KeyMod.CtrlCmd | KeyCode.KEY_P,
  secondary: [KeyMod.CtrlCmd | KeyCode.KEY_E],
  mac: { primary: KeyMod.CtrlCmd | KeyCode.KEY_P, secondary: null },
  handler() {
    console.log('hello');
  }
});

const keyBindingService = new KeybindingService(window, new ContextKeyService(), new CommandService(commandsRegistry), keybindingsRegistry);
