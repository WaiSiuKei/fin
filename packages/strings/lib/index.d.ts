export declare const empty = "";
export declare function isFalsyOrWhitespace(str: string): boolean;
export declare function format(value: string, ...args: any[]): string;
export declare function escape(html: string): string;
export declare function escapeRegExpCharacters(value: string): string;
export declare function trim(haystack: string, needle?: string): string;
export declare function ltrim(haystack?: string, needle?: string): string;
export declare function rtrim(haystack?: string, needle?: string): string;
export declare function convertSimple2RegExpPattern(pattern: string): string;
export declare function startsWith(haystack: string, needle: string): boolean;
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
