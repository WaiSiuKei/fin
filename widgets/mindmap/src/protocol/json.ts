import { IFileProtocol } from './def';

export class JSONProtocol implements IFileProtocol<Object> {
  encode(): string | Buffer {
    return '';
  }

  decode(local: string | Buffer): Object {
    return null;
  }
}
