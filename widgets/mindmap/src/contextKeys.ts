import { RawContextKey } from '@fin/contextkey';

export namespace MapContextKeys {
  export const hadTopicFocus = new RawContextKey<boolean>('mapHasTopicFocus', false);

}
