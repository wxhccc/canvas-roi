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

export type Context2DStyles = Partial<CanvasRenderingContext2D>

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
  styles?: Context2DStyles
  inner: boolean
  center?: Point
  radius?: number
  scaleRadius?: number
  start?: Point
  width?: number
  height?: number
}

export type GlobalStyles = Context2DStyles &
  Pick<CanvasRenderingContext2D, 'lineWidth' | 'strokeStyle' | 'fillStyle'>

export type DistanceCheck = ((oPoint: Point, dPoint: Point) => boolean) | number

export type PathChangeType = 'add' | 'modify' | 'delete'

/** 组件配置对象 */
export interface RoiOptions {
  /** 是否只读，只读模式下仍可以选中选区 */
  readonly: boolean
  /** canvas元素的放大比例，默认为2像素 */
  canvasScale: number
  /** 画布的全局样式 */
  globalStyles: GlobalStyles
  /** 选区的选中状态样式 */
  focusStyles?: Context2DStyles
  /** 是否只能操作选中的选区 */
  operateFocusOnly: boolean
  /** 多边形操作小圆的样式和半径 */
  operateCircle: {
    styles: Context2DStyles
    /** 小圆半径，单位：像素 */
    radius: number
  }
  /** 鼠标操作判断的灵敏度，单位：像素 */
  sensitive: {
    line: number
    point: number
  }
  /** 允许绘制的选区类型 */
  allowTypes: PathTypes[]
  /** 是否使用单一类型模式，切换类型需要currentType字段配合 */
  singleType: boolean
  /** 单类型模式下，当前在绘制选区的类型，为''时不可绘制，只能选择和修改选区 */
  currentType: '' | PathTypes
  /** 选区是否支持移动位置 */
  pathCanMove: boolean
  /** 坐标点度量值的精确度，默认为小数点后3位 */
  digits: number
  /** 两点之间的距离检测像素，小于设定值则判定为接近，默认值为10像素 */
  distanceCheck: DistanceCheck
  /** 当矩形的宽高小于这个值时认为是误操作，不会生成矩形。默认值为4像素 */
  tinyRectSize: number
  /** 绘制矩形时固定的宽高比，默认无限制 */
  rectAspectRatio: number
  /** 无效圆的半径值。默认值为6像素 */
  tinyCircleRadius: number
  /** 非选中选区的的透明度，用于区分当前选中路径和其他路径，默认值0.5 */
  blurStrokeOpacity: number
  /** 是否忽略无效的选中操作。如果为true时点击空白处不会变更选中项。默认为false */
  ignoreInvalidSelect: boolean
  /** 配置光标在矩形选区的边和角上时的展示形态。索引顺序是上、右、下、左 */
  rectCursors: {
    side: string[]
    corner: string[]
  }
  /** 运行绘制的最大路径数量，默认为0不限制 */
  maxPath: number
  /** 是否自适应容器尺寸的变化，基于ResizeObserver */
  autoFit: boolean
  /** 组件的宽度，单位像素，通常不需要指定 */
  width?: number
  /** 组件的高度，单位像素，通常不需要指定 */
  height?: number
  /** 是否需要按后画在前的方式处理数据，默认是true */
  reverse: boolean
  /** 组件初始化完成时出发 */
  onReady?: CustomHanlder
  /** 绑定选区数据发生变化时触发 */
  onInput?: (value: RoiPath[]) => void
  /** 单一选区发生变化时出发 */
  onChange?: (type: PathChangeType, index: number) => void
  /** 当前选中选区索引变化时触发 */
  onChoose?: (index: number) => void
  /** 组件容器尺寸变化时触发 */
  onResize?: CustomHanlder
  /** 选区绘制开始时触发 */
  onDrawStart?: (pathType: PathTypes, startPoint: Point) => void
  /** 选区绘制结束时触发 */
  onDrawEnd?: CustomHanlder
  /** 选区修改开始时触发 */
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
