export interface IDimension {
  width: number
  height: number
}

export function getHorizionalSpacingToParent(tier: number) {
  if (tier === 0) {
    return 100;
  }
  if (tier === 1) {
    return 50;
  }
  return 10;
}

export function getVerticalSpacingToParent(tier: number) {
  if (tier === 0) {
    return 10;
  }
  if (tier === 1) {
    return 8;
  }
  return 5;
}
