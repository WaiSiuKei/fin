/**
 * End of line character preference.
 */
export const enum EndOfLinePreference {
  /**
   * Use the end of line character identified in the text buffer.
   */
  TextDefined = 0,
  /**
   * Use line feed (\n) as the end of line character.
   */
  LF = 1,
  /**
   * Use carriage return and line feed (\r\n) as the end of line character.
   */
  CRLF = 2
}
