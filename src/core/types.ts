/* eslint-disable @typescript-eslint/no-unused-vars */
interface Point {
  x: number,
  y: number
}

interface Size {
  width: number,
  height: number
}

type CanvasMouseEvents = 'keyup' | 'click' | 'mousedown' | 'mousemove' | 'mouseup' | 'contextmenu';

type ROIEvents = 'ready' | 'input' | 'change' | 'choose' | 'resize' | 'draw-start' | 'draw-end' | 'modify-start';

type ClickPathTypes = 'point' | 'line' | 'polygon';

type DragPathTypes = 'rect' | 'circle';

type PathTypes = ClickPathTypes | DragPathTypes;

interface CustomHanlder {
  <T>(...args: T[]): void
}

type MethodsMap = {
  [key: string]: CustomHanlder
}

interface RoiPath {
  type: PathTypes,
  points: Array<Point>,
  styles: CanvasRenderingContext2D,
  inner: boolean,
  center?: Point,
  radius?: number,
  scaleRadius?: number,
  start?: Point,
  width?: number,
  height?: number
}
