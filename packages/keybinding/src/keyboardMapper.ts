import { ScanCodeBinding } from '@fin/keyboard';
import { OperatingSystem, OS } from '@fin/platform';
import { Keybinding, SimpleKeybinding } from '@fin/keyboard';
import { ResolvedKeybinding } from './resolvedKeybinding';
import { getKeyMap, IKeyboardMapping } from './nativeKeymap';
import { IWindowsKeyboardMapping, WindowsKeyboardMapper, windowsKeyboardMappingEquals } from './windowsKeyboardMapper';
import { IMacLinuxKeyboardMapping, MacLinuxKeyboardMapper, macLinuxKeyboardMappingEquals } from './macLinuxKeyboardMapper';
import { IKeyboardEventLite } from '@fin/keybinding/src/keybinding';

export interface IKeyboardMapper {
	dumpDebugInfo(): string;
	resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
	resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding;
	resolveUserBinding(firstPart: SimpleKeybinding | ScanCodeBinding, chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[];
}

export class CachedKeyboardMapper implements IKeyboardMapper {

	private _actual: IKeyboardMapper;
	private _cache: Map<string, ResolvedKeybinding[]>;

	constructor(actual: IKeyboardMapper) {
		this._actual = actual;
		this._cache = new Map<string, ResolvedKeybinding[]>();
	}

	public dumpDebugInfo(): string {
		return this._actual.dumpDebugInfo();
	}

	public resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[] {
		let hashCode = keybinding.getHashCode();
		if (!this._cache.has(hashCode)) {
			let r = this._actual.resolveKeybinding(keybinding);
			this._cache.set(hashCode, r);
			return r;
		}
		return this._cache.get(hashCode);
	}

	public resolveKeyboardEvent(keyboardEvent: IKeyboardEventLite): ResolvedKeybinding {
		return this._actual.resolveKeyboardEvent(keyboardEvent);
	}

	public resolveUserBinding(firstPart: SimpleKeybinding | ScanCodeBinding, chordPart: SimpleKeybinding | ScanCodeBinding): ResolvedKeybinding[] {
		return this._actual.resolveUserBinding(firstPart, chordPart);
	}
}

export class KeyboardMapperFactory {
  public static readonly INSTANCE = new KeyboardMapperFactory();

  private _rawMapping: IKeyboardMapping;
  private _keyboardMapper: IKeyboardMapper;
  private _initialized: boolean;

  private constructor() {
    this._rawMapping = getKeyMap();
    this._keyboardMapper = null;
    this._initialized = false;
  }

  public getKeyboardMapper(): IKeyboardMapper {
    if (!this._initialized) {
      this._initialized = true;
      this._keyboardMapper = new CachedKeyboardMapper(
        KeyboardMapperFactory._createKeyboardMapper(this._rawMapping)
      );
    }
    return this._keyboardMapper;
  }

  private static _createKeyboardMapper(rawMapping: IKeyboardMapping): IKeyboardMapper {
    const isUSStandard = true;
    if (OS === OperatingSystem.Windows) {
      return new WindowsKeyboardMapper(isUSStandard, <IWindowsKeyboardMapping>rawMapping);
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
