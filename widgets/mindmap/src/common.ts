export interface IDimension {
  width: number
  height: number
}

export enum Align {
  Top,
  Center,
  Bottom
}

export enum Justify {
  Left,
  Middle,
  Right
}

export function getHorizionalSpacingOfChildren(tier: number) {
  if (tier === 0) {
    return 100;
  }
  return 50;
}

export function getVerticalSpacingOfChildren(tier: number) {
  if (tier === 0) {
    return 20;
  }
  if (tier === 1) {
    return 10;
  }
  return 5;
}
