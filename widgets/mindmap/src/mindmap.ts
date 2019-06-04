import { IDimension } from './command';

export interface IMindmap {
  layout(dimension: IDimension): void
}
