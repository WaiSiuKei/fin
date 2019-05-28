export interface IProcessEnvironment {
    [key: string]: string;
}
interface INodeProcess {
    platform: string;
    env: IProcessEnvironment;
    getuid(): number;
    nextTick: Function;
}
export declare let process: INodeProcess;
export declare const LANGUAGE_DEFAULT = "en";
export declare enum Platform {
    Web = 0,
    Mac = 1,
    Linux = 2,
    Windows = 3
}
export declare let _platform: Platform;
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isRootUser: boolean;
export declare const isNative: boolean;
export declare const isWeb: boolean;
export declare const platform: Platform;
export declare const enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3
}
export declare const OS: OperatingSystem;
export declare const isIE: boolean;
export declare const isEdge: boolean;
export declare const isEdgeOrIE: boolean;
export declare const isOpera: boolean;
export declare const isFirefox: boolean;
export declare const isWebKit: boolean;
export declare const isChrome: boolean;
export declare const isSafari: boolean;
export declare const isWebkitWebView: boolean;
export declare const isIPad: boolean;
export declare const isEdgeWebView: boolean;
export {};
