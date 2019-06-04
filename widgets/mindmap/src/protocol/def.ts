

export interface IFileProtocol<T> {
  // fileExtension: string
  // dataType: string
  // mineType: string
  encode(): string | Buffer
  decode(local: string | Buffer): T
}
