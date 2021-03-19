import { Point, MethodsMap } from "../types";

export function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function fixRectPoints(start: Point, end: Point): Point[] {
  const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const [width, height] = [
    Math.abs(start.x - end.x),
    Math.abs(start.y - end.y),
  ];
  return [
    { x: center.x - width / 2, y: center.y - height / 2 },
    { x: center.x + width / 2, y: center.y + height / 2 },
  ];
}

export function getVirtualRectPoints(points: Point[]): Point[] {
  return points.length === 2
    ? [
        points[0],
        { x: points[1].x, y: points[0].y },
        points[1],
        { x: points[0].x, y: points[1].y },
      ]
    : points;
}

export function countDistance(point1: Point, point2: Point): number {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

export function checkPointsEqual(oPoint: Point, dPoint: Point): boolean {
  return oPoint.x === dPoint.x && oPoint.y === dPoint.y;
}

export function getMousePoint(e: MouseEvent): Point {
  return { x: e.offsetX, y: e.offsetY };
}

export function bindMethods(this: any, methods: MethodsMap): void {
  for (const key in methods) {
    this[`_${key}`] = methods[key];
  }
}
