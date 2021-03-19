import { PathTypes, Point, RoiPath } from "../types";
declare function setCtxStyles(this: any): void;
declare function createCvsPath(
  this: any,
  type: PathTypes,
  points: Point[],
  stroke: boolean
): void;
declare function drawExistRoiPath(
  this: any,
  path: RoiPath,
  index: number,
  stroke?: boolean,
  fill?: boolean
): void;
declare function drawRoiPaths(
  this: any,
  movePoint?: Point,
  notClear?: boolean
): void;
declare function drawRoiPathsWithOpe(this: any, circlePoint: Point): void;
declare const _default: {
  setCtxStyles: typeof setCtxStyles;
  createCvsPath: typeof createCvsPath;
  drawExistRoiPath: typeof drawExistRoiPath;
  drawRoiPaths: typeof drawRoiPaths;
  drawRoiPathsWithOpe: typeof drawRoiPathsWithOpe;
};
export default _default;
