/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

// --- THIS FILE IS TEMPORARY UNTIL ENV.TS IS CLEANED UP. IT CAN SAFELY BE USED IN ALL TARGET EXECUTION ENVIRONMENTS (node & dom) ---

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isRootUser = false;
let _isNative = false;
let _isWeb = false;
let _isQunit = false;
let _locale: string = undefined;
let _language: string = undefined;

interface NLSConfig {
  locale: string;
  availableLanguages: { [key: string]: string; };
}

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
declare let global: any;

interface INavigator {
  userAgent: string;
  language: string;
}
declare let navigator: INavigator;
declare let self: any;

export const LANGUAGE_DEFAULT = 'en';

// OS detection
if (typeof process === 'object') {
  _isWindows = (process.platform === 'win32');
  _isMacintosh = (process.platform === 'darwin');
  _isLinux = (process.platform === 'linux');
  _isRootUser = !_isWindows && (process.getuid() === 0);
  let rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
  if (rawNlsConfig) {
    try {
      let nlsConfig: NLSConfig = JSON.parse(rawNlsConfig);
      let resolved = nlsConfig.availableLanguages['*'];
      _locale = nlsConfig.locale;
      // VSCode's default language is 'en'
      _language = resolved ? resolved : LANGUAGE_DEFAULT;
    } catch (e) {
    }
  }
  _isNative = true;
} else if (typeof navigator === 'object') {
  let userAgent = navigator.userAgent;
  _isWindows = userAgent.indexOf('Windows') >= 0;
  _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
  _isLinux = userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
  _locale = navigator.language;
  _language = _locale;
  _isQunit = !!(<any>self).QUnit;
}

export enum Platform {
  Web,
  Mac,
  Linux,
  Windows
}

export let _platform: Platform = Platform.Web;
if (_isNative) {
  if (_isMacintosh) {
    _platform = Platform.Mac;
  } else if (_isWindows) {
    _platform = Platform.Windows;
  } else if (_isLinux) {
    _platform = Platform.Linux;
  }
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const isRootUser = _isRootUser;
export const isNative = _isNative;
export const isWeb = _isWeb;
export const platform = _platform;


export const enum OperatingSystem {
  Windows = 1,
  Macintosh = 2,
  Linux = 3
}
export const OS = (_isMacintosh ? OperatingSystem.Macintosh : (_isWindows ? OperatingSystem.Windows : OperatingSystem.Linux));

const userAgent = navigator.userAgent;

export const isIE = (userAgent.indexOf('Trident') >= 0);
export const isEdge = (userAgent.indexOf('Edge/') >= 0);
export const isEdgeOrIE = isIE || isEdge;

export const isOpera = (userAgent.indexOf('Opera') >= 0);
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (!isChrome && (userAgent.indexOf('Safari') >= 0));
export const isWebkitWebView = (!isChrome && !isSafari && isWebKit);
export const isIPad = (userAgent.indexOf('iPad') >= 0);
export const isEdgeWebView = isEdge && (userAgent.indexOf('WebView/') >= 0);
