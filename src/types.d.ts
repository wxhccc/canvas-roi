import { PropType } from "vue";

declare interface Point {
  x: number;
  y: number;
}

declare interface Size {
  width: number;
  height: number;
}

type CanvasMouseEvents =
  | "keyup"
  | "click"
  | "mousedown"
  | "mousemove"
  | "mouseup"
  | "contextmenu";

type ROIEvents =
  | "ready"
  | "input"
  | "change"
  | "choose"
  | "resize"
  | "draw-start"
  | "draw-end"
  | "modify-start";

type ClickPathTypes = "point" | "line" | "polygon";

type DragPathTypes = "rect" | "circle";

type PathTypes = ClickPathTypes | DragPathTypes;

interface CustomHanlder {
  <T>(...args: T[]): void;
}

type MethodsMap = {
  [key: string]: CustomHanlder;
};

declare interface RoiPath {
  type: PathTypes;
  points: Array<Point>;
  styles: CanvasRenderingContext2D;
  inner: boolean;
  center?: Point;
  radius?: number;
  scaleRadius?: number;
  start?: Point;
  width?: number;
  height?: number;
}

declare interface RoiOptions {
  readonly?: boolean;
  canvasScale?: number;
  globalStyles?: CanvasRenderingContext2D;
  focusStyles?: CanvasRenderingContext2D;
  operateFocusOnly?: boolean;
  operateCircle?: {
    styles?: CanvasRenderingContext2D;
    radius?: number;
  };
  sensitive?: {
    line?: number;
    point?: number;
  };
  allowTypes?: Array<PathTypes>;
  singleType?: boolean;
  currentType?: PathTypes;
  pathCanMove?: boolean;
  digits?: number;
  distanceCheck?: number;
  tinyRectSize?: number;
  rectAspectRatio?: number;
  tinyCircleRadius?: number;
  blurStrokeOpacity?: number;
  ignoreInvalidSelect?: boolean;
  rectCursors?: {
    side?: string[];
    corner?: string[];
  };
  maxPath?: number;
  autoFit?: boolean;
  initChoseIndex?: number;
  width?: number;
  height?: number;
  ready?: CustomHanlder;
  input?: CustomHanlder;
  change?: CustomHanlder;
  choose?: CustomHanlder;
  resize?: CustomHanlder;
  "draw-start"?: CustomHanlder;
  "draw-end"?: CustomHanlder;
  "modify-start"?: CustomHanlder;
}

declare interface PropOptions<T> {
  type?: PropType<T> | true | null;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}
