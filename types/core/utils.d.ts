import { Point, MethodsMap } from "../types";
export declare function jsonClone<T>(value: T): T;
export declare function fixRectPoints(start: Point, end: Point): Point[];
export declare function getVirtualRectPoints(points: Point[]): Point[];
export declare function countDistance(point1: Point, point2: Point): number;
export declare function checkPointsEqual(oPoint: Point, dPoint: Point): boolean;
export declare function getMousePoint(e: MouseEvent): Point;
export declare function bindMethods(this: any, methods: MethodsMap): void;
