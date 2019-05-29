/**
 * The empty string.
 */
export declare const empty = "";
export declare function isFalsyOrWhitespace(str: string): boolean;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
export declare function format(value: string, ...args: any[]): string;
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
export declare function escape(html: string): string;
/**
 * Escapes regular expression characters in a given string
 */
export declare function escapeRegExpCharacters(value: string): string;
/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
export declare function trim(haystack: string, needle?: string): string;
/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export declare function ltrim(haystack?: string, needle?: string): string;
/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export declare function rtrim(haystack?: string, needle?: string): string;
export declare function convertSimple2RegExpPattern(pattern: string): string;
/**
 * Determines if haystack starts with needle.
 */
export declare function startsWith(haystack: string, needle: string): boolean;
/**
 * Determines if haystack ends with needle.
 */
export declare function endsWith(haystack: string, needle: string): boolean;
export interface RegExpOptions {
    matchCase?: boolean;
    wholeWord?: boolean;
    multiline?: boolean;
    global?: boolean;
}
export declare function createRegExp(searchString: string, isRegex: boolean, options?: RegExpOptions): RegExp;
export declare function compare(a: string, b: string): number;
export declare function equalsIgnoreCase(a: string, b: string): boolean;
export declare function startsWithIgnoreCase(str: string, candidate: string): boolean;
export declare function startsWithUTF8BOM(str: string): boolean;
export declare function safeBtoa(str: string): string;
export declare function repeat(s: string, count: number): string;
export declare function kebabCase(str: any): any;
