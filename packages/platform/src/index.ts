let { userAgent } = navigator;

export enum Platform {
  Web,
  Mac,
  Linux,
  Windows
}

export let _platform: Platform = Platform.Web;

export const isWindows = userAgent.indexOf('Windows') >= 0;
export const isMacintosh = userAgent.indexOf('Macintosh') >= 0;
export const isLinux = userAgent.indexOf('Linux') >= 0;
export const platform = _platform;

export const enum OperatingSystem {
  Windows = 1,
  Macintosh = 2,
  Linux = 3
}

export const OS: OperatingSystem = (isMacintosh ? OperatingSystem.Macintosh : (isWindows ? OperatingSystem.Windows : OperatingSystem.Linux));

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
