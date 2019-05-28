import { KeybindingService, KeybindingsRegistry } from '@fin/keybinding';
import { KeyCode, KeyMod } from '@fin/keyboard';
import { ContextKeyService } from '@fin/contextkey';
import { CommandService } from '@fin/command';

KeybindingsRegistry.registerCommandAndKeybindingRule({
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

const keyBindingService = new KeybindingService(window, new ContextKeyService(), new CommandService());
