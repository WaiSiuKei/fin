/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position } from '../core/position';
import { Range } from '../core/range';
import { EndOfLinePreference } from '../model';
import { endsWith, startsWith, commonPrefixLength, commonSuffixLength, containsFullWidthCharacter, containsEmoji } from '@fin/strings';

export interface ITextAreaWrapper {
  getValue(): string;
  setValue(reason: string, value: string): void;

  getSelectionStart(): number;
  getSelectionEnd(): number;
  setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void;
}

export interface ISimpleModel {
  getLineCount(): number;
  getLineMaxColumn(lineNumber: number): number;
  getValueInRange(range: Range, eol: EndOfLinePreference): string;
}

export interface ITypeData {
  text: string;
  replaceCharCnt: number;
}

export class TextAreaState {

  public static readonly EMPTY = new TextAreaState('', 0, 0, null, null);

  public readonly value: string;
  public readonly selectionStart: number;
  public readonly selectionEnd: number;
  public readonly selectionStartPosition: Position | null;
  public readonly selectionEndPosition: Position | null;

  constructor(value: string, selectionStart: number, selectionEnd: number, selectionStartPosition: Position | null, selectionEndPosition: Position | null) {
    this.value = value;
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
    this.selectionStartPosition = selectionStartPosition;
    this.selectionEndPosition = selectionEndPosition;
  }

  public toString(): string {
    return '[ <' + this.value + '>, selectionStart: ' + this.selectionStart + ', selectionEnd: ' + this.selectionEnd + ']';
  }

  public static readFromTextArea(textArea: ITextAreaWrapper): TextAreaState {
    return new TextAreaState(textArea.getValue(), textArea.getSelectionStart(), textArea.getSelectionEnd(), null, null);
  }

  public collapseSelection(): TextAreaState {
    return new TextAreaState(this.value, this.value.length, this.value.length, null, null);
  }

  public writeToTextArea(reason: string, textArea: ITextAreaWrapper, select: boolean): void {
    // console.log(Date.now() + ': writeToTextArea ' + reason + ': ' + this.toString());
    textArea.setValue(reason, this.value);
    if (select) {
      textArea.setSelectionRange(reason, this.selectionStart, this.selectionEnd);
    }
  }

  public deduceEditorPosition(offset: number): [Position | null, number, number] {
    if (offset <= this.selectionStart) {
      const str = this.value.substring(offset, this.selectionStart);
      return this._finishDeduceEditorPosition(this.selectionStartPosition, str, -1);
    }
    if (offset >= this.selectionEnd) {
      const str = this.value.substring(this.selectionEnd, offset);
      return this._finishDeduceEditorPosition(this.selectionEndPosition, str, 1);
    }
    const str1 = this.value.substring(this.selectionStart, offset);
    if (str1.indexOf(String.fromCharCode(8230)) === -1) {
      return this._finishDeduceEditorPosition(this.selectionStartPosition, str1, 1);
    }
    const str2 = this.value.substring(offset, this.selectionEnd);
    return this._finishDeduceEditorPosition(this.selectionEndPosition, str2, -1);
  }

  private _finishDeduceEditorPosition(anchor: Position | null, deltaText: string, signum: number): [Position | null, number, number] {
    let lineFeedCnt = 0;
    let lastLineFeedIndex = -1;
    while ((lastLineFeedIndex = deltaText.indexOf('\n', lastLineFeedIndex + 1)) !== -1) {
      lineFeedCnt++;
    }
    return [anchor, signum * deltaText.length, lineFeedCnt];
  }

  public static selectedText(text: string): TextAreaState {
    return new TextAreaState(text, 0, text.length, null, null);
  }

  public static deduceInput(previousState: TextAreaState, currentState: TextAreaState, couldBeEmojiInput: boolean, couldBeTypingAtOffset0: boolean): ITypeData {
    if (!previousState) {
      // This is the EMPTY state
      return {
        text: '',
        replaceCharCnt: 0
      };
    }

    // console.log('------------------------deduceInput');
    // console.log('PREVIOUS STATE: ' + previousState.toString());
    // console.log('CURRENT STATE: ' + currentState.toString());

    let previousValue = previousState.value;
    let previousSelectionStart = previousState.selectionStart;
    let previousSelectionEnd = previousState.selectionEnd;
    let currentValue = currentState.value;
    let currentSelectionStart = currentState.selectionStart;
    let currentSelectionEnd = currentState.selectionEnd;

    if (couldBeTypingAtOffset0 && previousValue.length > 0 && previousSelectionStart === previousSelectionEnd && currentSelectionStart === currentSelectionEnd) {
      // See https://github.com/Microsoft/vscode/issues/42251
      // where typing always happens at offset 0 in the textarea
      // when using a custom title area in OSX and moving the window
      if (!startsWith(currentValue, previousValue) && endsWith(currentValue, previousValue)) {
        // Looks like something was typed at offset 0
        // ==> pretend we placed the cursor at offset 0 to begin with...
        previousSelectionStart = 0;
        previousSelectionEnd = 0;
      }
    }

    // Strip the previous suffix from the value (without interfering with the current selection)
    const previousSuffix = previousValue.substring(previousSelectionEnd);
    const currentSuffix = currentValue.substring(currentSelectionEnd);
    const suffixLength = commonSuffixLength(previousSuffix, currentSuffix);
    currentValue = currentValue.substring(0, currentValue.length - suffixLength);
    previousValue = previousValue.substring(0, previousValue.length - suffixLength);

    const previousPrefix = previousValue.substring(0, previousSelectionStart);
    const currentPrefix = currentValue.substring(0, currentSelectionStart);
    const prefixLength = commonPrefixLength(previousPrefix, currentPrefix);
    currentValue = currentValue.substring(prefixLength);
    previousValue = previousValue.substring(prefixLength);
    currentSelectionStart -= prefixLength;
    previousSelectionStart -= prefixLength;
    currentSelectionEnd -= prefixLength;
    previousSelectionEnd -= prefixLength;

    // console.log('AFTER DIFFING PREVIOUS STATE: <' + previousValue + '>, selectionStart: ' + previousSelectionStart + ', selectionEnd: ' + previousSelectionEnd);
    // console.log('AFTER DIFFING CURRENT STATE: <' + currentValue + '>, selectionStart: ' + currentSelectionStart + ', selectionEnd: ' + currentSelectionEnd);

    if (couldBeEmojiInput && currentSelectionStart === currentSelectionEnd && previousValue.length > 0) {
      // on OSX, emojis from the emoji picker are inserted at random locations
      // the only hints we can use is that the selection is immediately after the inserted emoji
      // and that none of the old text has been deleted

      let potentialEmojiInput: string | null = null;

      if (currentSelectionStart === currentValue.length) {
        // emoji potentially inserted "somewhere" after the previous selection => it should appear at the end of `currentValue`
        if (startsWith(currentValue, previousValue)) {
          // only if all of the old text is accounted for
          potentialEmojiInput = currentValue.substring(previousValue.length);
        }
      } else {
        // emoji potentially inserted "somewhere" before the previous selection => it should appear at the start of `currentValue`
        if (endsWith(currentValue, previousValue)) {
          // only if all of the old text is accounted for
          potentialEmojiInput = currentValue.substring(0, currentValue.length - previousValue.length);
        }
      }

      if (potentialEmojiInput !== null && potentialEmojiInput.length > 0) {
        // now we check that this is indeed an emoji
        // emojis can grow quite long, so a length check is of no help
        // e.g. 1F3F4 E0067 E0062 E0065 E006E E0067 E007F  ; fully-qualified     # 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England

        // Oftentimes, emojis use Variation Selector-16 (U+FE0F), so that is a good hint
        // http://emojipedia.org/variation-selector-16/
        // > An invisible codepoint which specifies that the preceding character
        // > should be displayed with emoji presentation. Only required if the
        // > preceding character defaults to text presentation.
        if (/\uFE0F/.test(potentialEmojiInput) || containsEmoji(potentialEmojiInput)) {
          return {
            text: potentialEmojiInput,
            replaceCharCnt: 0
          };
        }
      }
    }

    if (currentSelectionStart === currentSelectionEnd) {
      // composition accept case (noticed in FF + Japanese)
      // [blahblah] => blahblah|
      if (
        previousValue === currentValue
        && previousSelectionStart === 0
        && previousSelectionEnd === previousValue.length
        && currentSelectionStart === currentValue.length
        && currentValue.indexOf('\n') === -1
      ) {
        if (containsFullWidthCharacter(currentValue)) {
          return {
            text: '',
            replaceCharCnt: 0
          };
        }
      }

      // no current selection
      const replacePreviousCharacters = (previousPrefix.length - prefixLength);
      // console.log('REMOVE PREVIOUS: ' + (previousPrefix.length - prefixLength) + ' chars');

      return {
        text: currentValue,
        replaceCharCnt: replacePreviousCharacters
      };
    }

    // there is a current selection => composition case
    const replacePreviousCharacters = previousSelectionEnd - previousSelectionStart;
    return {
      text: currentValue,
      replaceCharCnt: replacePreviousCharacters
    };
  }
}
