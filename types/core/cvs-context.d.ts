import './types';
declare function setCtxStyles(): void;
declare function createCvsPath(type: PathTypes, points: Point[], stroke: boolean): void;
declare function drawExistRoiPath(path: RoiPath, index: number, stroke?: boolean, fill?: boolean): void;
declare function drawRoiPaths(movePoint?: Point, notClear?: boolean): void;
declare function drawRoiPathsWithOpe(circlePoint: Point): void;
declare const _default: {
    setCtxStyles: typeof setCtxStyles;
    createCvsPath: typeof createCvsPath;
    drawExistRoiPath: typeof drawExistRoiPath;
    drawRoiPaths: typeof drawRoiPaths;
    drawRoiPathsWithOpe: typeof drawRoiPathsWithOpe;
};
export default _default;
