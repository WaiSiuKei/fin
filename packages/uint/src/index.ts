export const enum Constants {
  /**
   * Max unsigned integer that fits on 32 bits.
   */
  MAX_UINT_32 = 4294967295, // 2^32 - 1
}


export function toUint32(v: number): number {
  if (v < 0) {
    return 0;
  }
  if (v > Constants.MAX_UINT_32) {
    return Constants.MAX_UINT_32;
  }
  return v | 0;
}
