/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';


import { CharCode } from '@fin/charcode';

/**
 * The empty string.
 */
export const empty = '';

export function isFalsyOrWhitespace(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return true;
  }
  return str.trim().length === 0;
}

const _formatRegexp = /{(\d+)}/g;

/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
export function format(value: string, ...args: any[]): string {
  if (args.length === 0) {
    return value;
  }
  return value.replace(_formatRegexp, function (match, group) {
    let idx = parseInt(group, 10);
    return isNaN(idx) || idx < 0 || idx >= args.length ?
      match :
      args[idx];
  });
}

/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
export function escape(html: string): string {
  return html.replace(/[<|>|&]/g, function (match) {
    switch (match) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      default:
        return match;
    }
  });
}

/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
  return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}

/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
export function trim(haystack: string, needle: string = ' '): string {
  let trimmed = ltrim(haystack, needle);
  return rtrim(trimmed, needle);
}

/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function ltrim(haystack?: string, needle?: string): string {
  if (!haystack || !needle) {
    return haystack;
  }

  let needleLen = needle.length;
  if (needleLen === 0 || haystack.length === 0) {
    return haystack;
  }

  let offset = 0;
  let idx = haystack.indexOf(needle, offset);  // tslint:disable-line

  while ((idx) === offset) {
    offset = offset + needleLen;
    idx = haystack.indexOf(needle, offset);
  }
  return haystack.substring(offset);
}

/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function rtrim(haystack?: string, needle?: string): string {
  if (!haystack || !needle) {
    return haystack;
  }

  let needleLen = needle.length,
    haystackLen = haystack.length;

  if (needleLen === 0 || haystackLen === 0) {
    return haystack;
  }

  let offset = haystackLen,
    idx = -1;

  while (true) {
    idx = haystack.lastIndexOf(needle, offset - 1);
    if (idx === -1 || idx + needleLen !== offset) {
      break;
    }
    if (idx === 0) {
      return '';
    }
    offset = idx;
  }

  return haystack.substring(0, offset);
}

export function convertSimple2RegExpPattern(pattern: string): string {
  return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}

/**
 * Determines if haystack starts with needle.
 */
export function startsWith(haystack: string, needle: string): boolean {
  if (haystack.length < needle.length) {
    return false;
  }

  if (haystack === needle) {
    return true;
  }

  for (let i = 0; i < needle.length; i++) {
    if (haystack[i] !== needle[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if haystack ends with needle.
 */
export function endsWith(haystack: string, needle: string): boolean {
  let diff = haystack.length - needle.length;
  if (diff > 0) {
    return haystack.indexOf(needle, diff) === diff;
  } else if (diff === 0) {
    return haystack === needle;
  } else {
    return false;
  }
}

export interface RegExpOptions {
  matchCase?: boolean;
  wholeWord?: boolean;
  multiline?: boolean;
  global?: boolean;
}

export function createRegExp(searchString: string, isRegex: boolean, options: RegExpOptions = {}): RegExp {
  if (!searchString) {
    throw new Error('Cannot create regex from empty string');
  }
  if (!isRegex) {
    searchString = escapeRegExpCharacters(searchString);
  }
  if (options.wholeWord) {
    if (!/\B/.test(searchString.charAt(0))) {
      searchString = '\\b' + searchString;
    }
    if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
      searchString = searchString + '\\b';
    }
  }
  let modifiers = '';
  if (options.global) {
    modifiers += 'g';
  }
  if (!options.matchCase) {
    modifiers += 'i';
  }
  if (options.multiline) {
    modifiers += 'm';
  }

  return new RegExp(searchString, modifiers);
}

export function compare(a: string, b: string): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

function isLowerAsciiLetter(code: number): boolean {
  return code >= CharCode.a && code <= CharCode.z;
}

function isUpperAsciiLetter(code: number): boolean {
  return code >= CharCode.A && code <= CharCode.Z;
}

function isAsciiLetter(code: number): boolean {
  return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
}

export function equalsIgnoreCase(a: string, b: string): boolean {
  const len1 = a ? a.length : 0;
  const len2 = b ? b.length : 0;

  if (len1 !== len2) {
    return false;
  }

  return doEqualsIgnoreCase(a, b);
}

function doEqualsIgnoreCase(a: string, b: string, stopAt = a.length): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  for (let i = 0; i < stopAt; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);

    if (codeA === codeB) {
      continue;
    }

    // a-z A-Z
    if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
      let diff = Math.abs(codeA - codeB);
      if (diff !== 0 && diff !== 32) {
        return false;
      }
    }

    // Any other charcode
    else {
      if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
        return false;
      }
    }
  }

  return true;
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
  const candidateLength = candidate.length;
  if (candidate.length > str.length) {
    return false;
  }

  return doEqualsIgnoreCase(str, candidate, candidateLength);
}

export function startsWithUTF8BOM(str: string): boolean {
  return (str && str.length > 0 && str.charCodeAt(0) === CharCode.UTF8_BOM);
}

export function safeBtoa(str: string): string {
  return btoa(encodeURIComponent(str)); // we use encodeURIComponent because btoa fails for non Latin 1 values
}

export function repeat(s: string, count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}

var KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;

export function kebabCase(str) {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase();
  });
};
