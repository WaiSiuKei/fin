import { URI } from '@fin/uri';

export interface IInputInit {
  placeholder: string,
  enableURL: boolean
}

export interface IInlineItems {
  update(input: string): void
  focus?(): void
  blur?(): void
  contentIfFocus: string
  contentIfBlur: string
}

export enum InputState {
  IDLE = 0x00,
  PlainText = 0x01,

  BlodText = 0x100,
  ItalicText = 0x110,
}

export function isInEmphasisMode(state: InputState) {
  return state & 0x100;
}

export function isInPlainTextMode(state: InputState) {
  return state & 0x01;
}

export function isURL(str: string): boolean {
  try {
    let u = URI.parse(str);
    return u.scheme === 'HTTP' || u.scheme === 'HTTPS' || u.scheme === 'http' || u.scheme === 'https';
  } catch (e) {
    return false;
  }
}
