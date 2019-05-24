import { getCurrentKeyboardLayout, getKeyMap, IKeyboardLayoutInfo, IKeyboardMapping, ILinuxKeyboardLayoutInfo, IMacKeyboardLayoutInfo, IWindowsKeyboardLayoutInfo } from '@fin/keybinding/src/nativeKeymap';
import { CachedKeyboardMapper, IKeyboardMapper } from '@fin/keybinding/src/keyboardMapper';
import { Event, Emitter } from '@fin/event/src';
import { MacLinuxFallbackKeyboardMapper } from '@fin/keybinding/src/macLinuxFallbackKeyboardMapper';
import { OperatingSystem, OS } from '@fin/platform/src';
import { IWindowsKeyboardMapping, WindowsKeyboardMapper, windowsKeyboardMappingEquals } from '@fin/keybinding/src/windowsKeyboardMapper';
import { IMacLinuxKeyboardMapping, MacLinuxKeyboardMapper, macLinuxKeyboardMappingEquals } from '@fin/keybinding/src/macLinuxKeyboardMapper';
import { KeybindingResolver } from '@fin/keybinding/src/keybindingResolver';
import { IUserKeybindingItem, KeybindingIO, OutputBuilder } from '@fin/keybinding/src/keybindingIO';
import { IKeybindingEvent, IKeyboardEvent, IUserFriendlyKeybinding, KeybindingSource } from '@fin/keybinding/src/keybinding';
import { AbstractKeybindingService } from '@fin/keybinding/src/abstractKeybindingService';
import { ICommandService } from '@fin/command/src';
import { IContextKeyService } from '@fin/contextkey/src';
import { IKeybindingItem, KeybindingsRegistry } from '@fin/keybinding/src/keybindingsRegistry';
import { ResolvedKeybindingItem } from '@fin/keybinding/src/resolvedKeybindingItem';
import { Keybinding, ResolvedKeybinding } from '@fin/keyboard/src/keyCodes';
import { addDisposableListener, EventType } from '@fin/dom/src';
import { StandardKeyboardEvent } from '@fin/keyboard/src/keyboardEvent';

export class KeyboardMapperFactory {
  public static readonly INSTANCE = new KeyboardMapperFactory();

  private _layoutInfo: IKeyboardLayoutInfo;
  private _rawMapping: IKeyboardMapping;
  private _keyboardMapper: IKeyboardMapper;
  private _initialized: boolean;

  private readonly _onDidChangeKeyboardMapper: Emitter<void> = new Emitter<void>();
  public readonly onDidChangeKeyboardMapper: Event<void> = this._onDidChangeKeyboardMapper.event;

  private constructor() {
    this._layoutInfo = null;
    this._rawMapping = null;
    this._keyboardMapper = null;
    this._initialized = false;
  }

  public getKeyboardMapper(dispatchConfig: DispatchConfig): IKeyboardMapper {
    if (!this._initialized) {
      this._setKeyboardData(getCurrentKeyboardLayout(), getKeyMap());
    }
    if (dispatchConfig === DispatchConfig.KeyCode) {
      // Forcefully set to use keyCode
      return new MacLinuxFallbackKeyboardMapper(OS);
    }
    return this._keyboardMapper;
  }

  public getCurrentKeyboardLayout(): IKeyboardLayoutInfo {
    if (!this._initialized) {
      this._setKeyboardData(getCurrentKeyboardLayout(), getKeyMap());
    }
    return this._layoutInfo;
  }

  private static _isUSStandard(_kbInfo: IKeyboardLayoutInfo): boolean {
    if (OS === OperatingSystem.Linux) {
      const kbInfo = <ILinuxKeyboardLayoutInfo>_kbInfo;
      return (kbInfo && kbInfo.layout === 'us');
    }

    if (OS === OperatingSystem.Macintosh) {
      const kbInfo = <IMacKeyboardLayoutInfo>_kbInfo;
      return (kbInfo && kbInfo.id === 'com.apple.keylayout.US');
    }

    if (OS === OperatingSystem.Windows) {
      const kbInfo = <IWindowsKeyboardLayoutInfo>_kbInfo;
      return (kbInfo && kbInfo.name === '00000409');
    }

    return false;
  }

  // public getRawKeyboardMapping(): IKeyboardMapping {
  //   if (!this._initialized) {
  //     this._setKeyboardData(getCurrentKeyboardLayout(), getKeyMap());
  //   }
  //   return this._rawMapping;
  // }

  private _setKeyboardData(layoutInfo: IKeyboardLayoutInfo, rawMapping: IKeyboardMapping): void {
    this._layoutInfo = layoutInfo;

    if (this._initialized && KeyboardMapperFactory._equals(this._rawMapping, rawMapping)) {
      // nothing to do...
      return;
    }

    this._initialized = true;
    this._rawMapping = rawMapping;
    this._keyboardMapper = new CachedKeyboardMapper(
      KeyboardMapperFactory._createKeyboardMapper(this._layoutInfo, this._rawMapping)
    );
    this._onDidChangeKeyboardMapper.fire();
  }

  private static _createKeyboardMapper(layoutInfo: IKeyboardLayoutInfo, rawMapping: IKeyboardMapping): IKeyboardMapper {
    const isUSStandard = KeyboardMapperFactory._isUSStandard(layoutInfo);
    if (OS === OperatingSystem.Windows) {
      return new WindowsKeyboardMapper(isUSStandard, <IWindowsKeyboardMapping>rawMapping);
    }

    if (Object.keys(rawMapping).length === 0) {
      // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
      return new MacLinuxFallbackKeyboardMapper(OS);
    }

    if (OS === OperatingSystem.Macintosh) {
      const kbInfo = <IMacKeyboardLayoutInfo>layoutInfo;
      if (kbInfo.id === 'com.apple.keylayout.DVORAK-QWERTYCMD') {
        // Use keyCode based dispatching for DVORAK - QWERTY ⌘
        return new MacLinuxFallbackKeyboardMapper(OS);
      }
    }

    return new MacLinuxKeyboardMapper(isUSStandard, <IMacLinuxKeyboardMapping>rawMapping, OS);
  }

  private static _equals(a: IKeyboardMapping, b: IKeyboardMapping): boolean {
    if (OS === OperatingSystem.Windows) {
      return windowsKeyboardMappingEquals(<IWindowsKeyboardMapping>a, <IWindowsKeyboardMapping>b);
    }

    return macLinuxKeyboardMappingEquals(<IMacLinuxKeyboardMapping>a, <IMacLinuxKeyboardMapping>b);
  }
}

export const enum DispatchConfig {
  Code,
  KeyCode
}

export class KeybindingService extends AbstractKeybindingService {

  private _keyboardMapper: IKeyboardMapper;
  private _cachedResolver: KeybindingResolver;
  private _firstTimeComputingResolver: boolean;

  constructor(
    windowElement: Window,
    contextKeyService: IContextKeyService,
    commandService: ICommandService,
  ) {
    super(contextKeyService, commandService);

    let dispatchConfig = DispatchConfig.KeyCode; //  DispatchConfig.KeyCode or DispatchConfig.Code

    this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper(dispatchConfig);
    this._register(KeyboardMapperFactory.INSTANCE.onDidChangeKeyboardMapper(() => {
      this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper(dispatchConfig);
      this.updateResolver({ source: KeybindingSource.Default });
    }));

    this._cachedResolver = null;
    this._firstTimeComputingResolver = true;

    this._register(addDisposableListener(windowElement, EventType.KEY_DOWN, (e: KeyboardEvent) => {
      let keyEvent = new StandardKeyboardEvent(e);
      let shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
      if (shouldPreventDefault) {
        keyEvent.preventDefault();
      }
    }));
  }

  // public dumpDebugInfo(): string {
  //   const layoutInfo = JSON.stringify(KeyboardMapperFactory.INSTANCE.getCurrentKeyboardLayout(), null, '\t');
  //   const mapperInfo = this._keyboardMapper.dumpDebugInfo();
  //   const rawMapping = JSON.stringify(KeyboardMapperFactory.INSTANCE.getRawKeyboardMapping(), null, '\t');
  //   return `Layout info:\n${layoutInfo}\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
  // }

  private _safeGetConfig(): IUserFriendlyKeybinding[] {
    return [];
  }

  public customKeybindingsCount(): number {
    let userKeybindings = this._safeGetConfig();

    return userKeybindings.length;
  }

  private updateResolver(event: IKeybindingEvent): void {
    this._cachedResolver = null;
    this._onDidUpdateKeybindings.fire(event);
  }

  protected _getResolver(): KeybindingResolver {
    if (!this._cachedResolver) {
      const defaults = this._resolveKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
      const overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
      this._cachedResolver = new KeybindingResolver(defaults, overrides);
      this._firstTimeComputingResolver = false;
    }
    return this._cachedResolver;
  }

  protected _documentHasFocus(): boolean {
    return document.hasFocus();
  }

  private _resolveKeybindingItems(items: IKeybindingItem[], isDefault: boolean): ResolvedKeybindingItem[] {
    let result: ResolvedKeybindingItem[] = [], resultLen = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const when = (item.when ? item.when.normalize() : null);
      const keybinding = item.keybinding;
      if (!keybinding) {
        // This might be a removal keybinding item in user settings => accept it
        result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
      } else {
        const resolvedKeybindings = this.resolveKeybinding(keybinding);
        for (let j = 0; j < resolvedKeybindings.length; j++) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
        }
      }
    }

    return result;
  }

  private _resolveUserKeybindingItems(items: IUserKeybindingItem[], isDefault: boolean): ResolvedKeybindingItem[] {
    let result: ResolvedKeybindingItem[] = [], resultLen = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const when = (item.when ? item.when.normalize() : null);
      const firstPart = item.firstPart;
      const chordPart = item.chordPart;
      if (!firstPart) {
        // This might be a removal keybinding item in user settings => accept it
        result[resultLen++] = new ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
      } else {
        const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
        for (let j = 0; j < resolvedKeybindings.length; j++) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
        }
      }
    }

    return result;
  }

  private _getExtraKeybindings(isFirstTime: boolean): IUserKeybindingItem[] {
    let extraUserKeybindings: IUserFriendlyKeybinding[] = this._safeGetConfig();
    return extraUserKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k, OS));
  }

  public resolveKeybinding(kb: Keybinding): ResolvedKeybinding[] {
    return this._keyboardMapper.resolveKeybinding(kb);
  }

  public resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding {
    return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
  }

  public resolveUserBinding(userBinding: string): ResolvedKeybinding[] {
    const [firstPart, chordPart] = KeybindingIO._readUserBinding(userBinding);
    return this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
  }

  public getDefaultKeybindingsContent(): string {
    const resolver = this._getResolver();
    const defaultKeybindings = resolver.getDefaultKeybindings();
    const boundCommands = resolver.getDefaultBoundCommands();
    return (
      KeybindingService._getDefaultKeybindings(defaultKeybindings)
      + '\n\n'
      + KeybindingService._getAllCommandsAsComment(boundCommands)
    );
  }

  private static _getDefaultKeybindings(defaultKeybindings: ResolvedKeybindingItem[]): string {
    let out = new OutputBuilder();
    out.writeLine('[');

    let lastIndex = defaultKeybindings.length - 1;
    defaultKeybindings.forEach((k, index) => {
      KeybindingIO.writeKeybindingItem(out, k, OS);
      if (index !== lastIndex) {
        out.writeLine(',');
      } else {
        out.writeLine();
      }
    });
    out.writeLine(']');
    return out.toString();
  }

  private static _getAllCommandsAsComment(boundCommands: Map<string, boolean>): string {
    const unboundCommands = KeybindingResolver.getAllUnboundCommands(boundCommands);
    let pretty = unboundCommands.sort().join('\n// - ');
    return '// ' + 'Here are other available commands: ' + '\n// - ' + pretty;
  }
}
