export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export type CanvasMouseEvents =
  | 'keyup'
  | 'click'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'contextmenu'

export type ROIEvents =
  | 'onReady'
  | 'onInput'
  | 'onChange'
  | 'onChoose'
  | 'onResize'
  | 'onDrawStart'
  | 'onDrawEnd'
  | 'onModifyStart'

export type ClickPathTypes = 'point' | 'line' | 'polygon'

export type DragPathTypes = 'rect' | 'circle'

export type PathTypes = ClickPathTypes | DragPathTypes

export interface CustomHanlder {
  (...args: any[]): void
}

export type MethodsMap = {
  [key: string]: CustomHanlder
}

export type PublicMethodNames =
  | 'mount'
  | 'resetOptions'
  | 'resetCanvas'
  | 'scale'
  | 'invert'
  | 'setValue'
  | 'clearCanvas'
  | 'redrawCanvas'
  | 'exportImageFromCanvas'
  | 'customDrawing'
  | 'choosePath'
  | 'destroy'

export interface RoiPath {
  type: PathTypes
  points: Point[]
  styles: CanvasRenderingContext2D
  inner: boolean
  center?: Point
  radius?: number
  scaleRadius?: number
  start?: Point
  width?: number
  height?: number
}

export type GlobalStyles = Partial<CanvasRenderingContext2D> &
  Pick<CanvasRenderingContext2D, 'lineWidth' | 'strokeStyle' | 'fillStyle'>

export interface RoiOptions {
  readonly: boolean
  canvasScale: number
  globalStyles: GlobalStyles
  focusStyles?: Partial<CanvasRenderingContext2D>
  operateFocusOnly: boolean
  operateCircle: {
    styles: Partial<CanvasRenderingContext2D>
    radius: number
  }
  sensitive: {
    line: number
    point: number
  }
  allowTypes: PathTypes[]
  singleType: boolean
  currentType: '' | PathTypes
  pathCanMove: boolean
  digits: number
  distanceCheck: number
  tinyRectSize: number
  rectAspectRatio: number
  tinyCircleRadius: number
  blurStrokeOpacity: number
  ignoreInvalidSelect: boolean
  rectCursors: {
    side: string[]
    corner: string[]
  }
  maxPath: number
  autoFit: boolean
  initChoseIndex: number
  width?: number
  height?: number
  onReady?: CustomHanlder
  onInput?: CustomHanlder
  onChange?: CustomHanlder
  onChoose?: CustomHanlder
  onResize?: CustomHanlder
  onDrawStart?: CustomHanlder
  onDrawEnd?: CustomHanlder
  onModifyStart?: CustomHanlder
}

export interface OperateCursor {
  pathType?: PathTypes
  pathIndex?: number
  originStartPoint?: Point
  startPoint?: Point
  pointIndex?: number
  lineIndex?: number
  inPath?: boolean
}

export type ElementOrSelector = HTMLElement | string

export type PowerPartial<T> = {
  [U in keyof T]?: T[U] extends Record<string, unknown>
    ? PowerPartial<T[U]>
    : T[U]
}

export type NotObject<T> = T extends Record<string, unknown> ? never : T

export type ParitalRoiOptions = PowerPartial<RoiOptions>
