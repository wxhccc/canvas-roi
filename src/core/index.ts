/// <reference types="resize-observer-browser" />
import {
  publicMethods,
  eventNames,
  clickPathTypes,
  dragPathTypes
} from './const'
import {
  jsonClone,
  fixRectPoints,
  bindMethods,
  countDistance,
  getVirtualRectPoints
} from './utils'
import { defaultOptions } from './options'
import cvsEventHandlers from './cvs-events'
import cvsContextMethods from './cvs-context'
import {
  Point,
  Size,
  RoiPath,
  PathTypes,
  CanvasMouseEvents,
  ROIEvents,
  CustomHanlder,
  RoiOptions,
  MethodsMap,
  OperateCursor,
  ElementOrSelector,
  ParitalRoiOptions,
  PathChangeType
} from '../types'

export { publicMethods, eventNames }

export default class CanvasRoi {
  // properties
  isEventsListening!: boolean
  drawing!: boolean
  needDrag!: boolean
  dragging!: boolean
  modifying!: boolean
  operateCursor!: OperateCursor | null
  lastMoveEvent!: MouseEvent | null
  newPath!: RoiPath
  value!: RoiPath[]
  paths!: RoiPath[]
  curSingleType!: PathTypes | ''
  pathPointsCoincide!: boolean
  hasInvertPath!: boolean
  choseIndex!: number
  resizeTicker!: number
  _events: { [key in CanvasMouseEvents]: (...args: any[]) => unknown }
  _ElObserver: ResizeObserver | undefined
  _ElScaleObserver: MediaQueryList | undefined
  // methods
  // methods
  _keyPress!: typeof cvsEventHandlers.keyPress
  _cvsMouseUp!: typeof cvsEventHandlers.cvsMouseUp
  _cvsMouseDown!: typeof cvsEventHandlers.cvsMouseDown
  _cvsMouseMove!: typeof cvsEventHandlers.cvsMouseMove
  _cvsMouseClick!: typeof cvsEventHandlers.cvsMouseClick
  _checkMouseCanOperate!: typeof cvsEventHandlers.checkMouseCanOperate
  _setCtxStyles: typeof cvsContextMethods.setCtxStyles = () => undefined
  _createCvsPath: typeof cvsContextMethods.createCvsPath = () => undefined
  _drawExistRoiPath: typeof cvsContextMethods.drawExistRoiPath = () => undefined
  _drawRoiPaths: typeof cvsContextMethods.drawRoiPaths = () => undefined
  _drawRoiPathsWithOpe: typeof cvsContextMethods.drawRoiPathsWithOpe = () =>
    undefined

  public $el?: HTMLElement
  public $opts: RoiOptions
  public $cvs?: HTMLCanvasElement
  public $ctx?: CanvasRenderingContext2D
  public $size?: Size
  public $cvsSize!: Size

  constructor(
    elementOrSelector?: ElementOrSelector,
    options?: ParitalRoiOptions
  ) {
    bindMethods.call(this, cvsEventHandlers as MethodsMap)

    this._initInstanceVars()
    this.$opts = defaultOptions()
    this._mergeOptions(options)
    this._events = {
      keyup: this._keyPress.bind(this),
      click: this._cvsMouseClick.bind(this),
      mousedown: this._cvsMouseDown.bind(this),
      mousemove: this._cvsMouseMove.bind(this),
      mouseup: this._cvsMouseUp.bind(this),
      contextmenu: this._cvsMouseClick.bind(this)
    }
    elementOrSelector && this.mount(elementOrSelector)
  }

  _initInstanceVars(): void {
    Object.assign(this, {
      isEventsListening: false,
      drawing: false,
      needDrag: true,
      dragging: false,
      modifying: false,
      operateCursor: null,
      lastMoveEvent: null,
      newPath: {},
      value: [],
      paths: [],
      curSingleType: '',
      pathPointsCoincide: false,
      hasInvertPath: false,
      choseIndex: -1,
      resizeTicker: 0
    })
  }

  _init(): void {
    const canvas = document.createElement('canvas')
    bindMethods.call(this, cvsContextMethods as MethodsMap)
    canvas.className = 'canvas-roi'

    canvas.tabIndex = 99999 * (1 + Math.random())
    canvas.style.cssText = 'outline: none;transform-origin: 0 0;'
    this.$cvs = canvas
    this.$ctx = this.$cvs.getContext('2d') || undefined
    this.resetCanvas()
    this.$el && this.$el.appendChild(this.$cvs)
    this._addEventHandler(this.$opts.readonly)
    this.$opts.autoFit && this._initObserver()
    this._emitEvent('onReady')
  }

  _initObserver(): void {
    if (!this.$el) return
    this._ElObserver = new ResizeObserver(this._sizeChangeWatcher.bind(this))
    this._ElObserver.observe(this.$el)
    this._ElScaleObserver = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    )
    this._ElScaleObserver.addEventListener(
      'change',
      this._scaleChangeWatcher.bind(this)
    )
  }

  _sizeChangeWatcher(): void {
    if (!this.$cvs) {
      return
    }
    clearTimeout(this.resizeTicker)
    this.resizeTicker = window.setTimeout(() => {
      this._emitEvent('onResize')
      this.resetCanvas()
    }, 50)
  }
  _scaleChangeWatcher() {
    console.log(123123123131)
    if (!this.$cvs) {
      return
    }
    this.resetCanvas()
  }

  _autoFitChange(newValue?: boolean): void {
    if (newValue) {
      if (!this._ElObserver) {
        return this._initObserver()
      }
      return this._ElObserver.observe(this.$el as Element)
    }
    return this._ElObserver?.unobserve(this.$el as Element)
  }

  _mergeOptions<K extends keyof RoiOptions>(
    options: ParitalRoiOptions = {}
  ): void {
    if (!options) return
    const { hasOwnProperty, toString } = Object.prototype
    ;(Object.keys(options) as K[]).forEach((key) => {
      const item = options[key]
      if (
        hasOwnProperty.call(this.$opts, key) &&
        toString.call(item) === '[object Object]' &&
        this.$opts[key]
      ) {
        Object.assign(this.$opts[key], options[key])
      } else if (typeof item !== 'undefined') {
        this.$opts[key] = item as RoiOptions[K]
      }
    })
    this._checkSingleType()
  }

  _emitEvent(name: ROIEvents, ...args: unknown[]): void {
    const callback = this.$opts[name] as CustomHanlder
    typeof callback === 'function' && callback.call(this, ...args)
  }

  /**
   * check methods
   */
  _checkSingleType(): void {
    const { allowTypes, singleType, currentType } = this.$opts
    this.curSingleType =
      singleType &&
      allowTypes &&
      currentType &&
      allowTypes.includes(currentType)
        ? currentType
        : ''
    this.curSingleType && this._resetChooseState()
  }

  _isPathMax(): boolean {
    const { maxPath } = this.$opts
    return maxPath && maxPath > 0 ? this.paths.length >= maxPath : false
  }

  _isSingleTypeAllow(isDrag?: boolean): boolean {
    const types: PathTypes[] = isDrag ? dragPathTypes : clickPathTypes
    return Boolean(
      !this.$opts.singleType ||
        (this.curSingleType && types.includes(this.curSingleType))
    )
  }

  _floatToFixed(value: number): number {
    const { digits = 0 } = this.$opts
    if (digits < 1) return value
    const times = 10 ** digits
    return Math.round(value * times) / times
  }

  _emitValue(changeType: PathChangeType = 'add', index = 0): void {
    const value = this.paths

    this._completePathsInfo(value)
    this._emitEvent('onInput', this._switchCoordsScale(value))
    this._emitEvent('onChange', changeType, index)
  }

  _completePathsInfo(values: RoiPath[]): void {
    values.forEach((path) => {
      const { type, points } = path
      let info = {}

      if (type === 'rect') {
        const fixedPoints = fixRectPoints(points[0], points[1])
        info = {
          points: fixedPoints,
          start: this.scale(fixedPoints[0]),
          width: this.scale({ x: fixedPoints[1].x - fixedPoints[0].x, y: 0 }).x,
          height: this.scale({ x: 0, y: fixedPoints[1].y - fixedPoints[0].y }).y
        }
      } else if (type === 'circle') {
        const radius = countDistance(points[0], points[1])
        info = {
          center: this.scale(points[0]),
          radius,
          scaleRadius: this.scale({ x: radius, y: 0 }).x
        }
      }
      Object.assign(path, info)
    })
  }

  _switchCoordsScale(values: RoiPath[], toPx?: boolean): RoiPath[] {
    const newValue = jsonClone(values)
    const { rectFullPoint } = this.$opts
    newValue.forEach((path) => {
      let { points } = path
      if (Array.isArray(points)) {
        if (path.type === 'rect') {
          if (toPx && points.length === 4) {
            points = [points[0], points[2]]
          } else if (rectFullPoint && !toPx && points.length === 2) {
            points = getVirtualRectPoints(points)
          }
        }
        path.points = points.map((point) =>
          toPx ? this.invert(point) : this.scale(point)
        )
      }
    })
    return newValue
  }

  _addEventHandler(readonly?: boolean): void {
    ;(Object.keys(this._events) as CanvasMouseEvents[]).forEach(
      (eventName) =>
        (!readonly || eventName === 'mouseup') &&
        this.$cvs &&
        this.$cvs.addEventListener(eventName, this._events[eventName])
    )
    this.isEventsListening = true
  }

  _removeEventHandler(forceAll?: boolean): void {
    ;(Object.keys(this._events) as CanvasMouseEvents[]).forEach(
      (eventName) =>
        (forceAll || eventName !== 'mouseup') &&
        this.$cvs &&
        this.$cvs.removeEventListener(eventName, this._events[eventName])
    )
    this.isEventsListening = false
  }

  _resetNewPath(): void {
    Object.assign(this, {
      drawing: false,
      needDrag: false,
      dragging: false,
      newPath: {},
      pathPointsCoincide: false
    })
  }

  _createNewPath(
    startPoint: Point,
    type: PathTypes = 'rect',
    needDrag = true
  ): void {
    this.drawing = true
    this.needDrag = needDrag
    Object.assign(this.newPath, { type, points: [startPoint], inner: true })
    this._emitEvent('onDrawStart', type, startPoint)
  }

  _addNewPath(): void {
    this._emitEvent('onDrawEnd')
    const { reverse, singleType } = this.$opts
    reverse ? this.paths.unshift(this.newPath) : this.paths.push(this.newPath)
    this._emitValue()
    !singleType && this.choosePath(reverse ? 0 : this.paths.length - 1)
    this._resetNewPath()
  }

  _resetChooseState(): void {
    this.choosePath(-1)
  }

  _deletePath(): void {
    if (this.choseIndex < 0) return
    const index = this.choseIndex
    this.paths.splice(index, 1)
    this._resetChooseState()
    this._checkMouseCanOperate()
    this._emitValue('delete', index)
  }

  _invertChosePath(): void {
    const { choseIndex: idx } = this
    idx >= 0 && (this.paths[idx].inner = !this.paths[idx].inner)
    this._emitValue('modify', idx)
  }

  // public methods
  mount(elementOrSelector: ElementOrSelector): void {
    const element =
      typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector
    if (!element) return
    this.$el = element as HTMLElement
    this.$el instanceof HTMLElement
      ? this._init()
      : console.warn('the param element should be an HTMLElement')
  }

  resetOptions(options: ParitalRoiOptions): void {
    const oldAutoFit = this.$opts.autoFit
    this._mergeOptions(options)

    options.globalStyles && this._setCtxStyles()
    ;(options.width !== this.$opts.width ||
      options.height !== this.$opts.height) &&
      this.resetCanvas()

    if (options.readonly) {
      this.isEventsListening && this._removeEventHandler()
    } else {
      this._addEventHandler()
    }

    this.$opts.autoFit !== oldAutoFit && this._autoFitChange(this.$opts.autoFit)
    this.redrawCanvas(true)
  }

  resetCanvas(): void {
    const { offsetWidth, offsetHeight } = this.$el || {}
    const { canvasScale = 2, width: optWidth, height: optHeight } = this.$opts
    const width = optWidth || offsetWidth || 0
    const height = optHeight || offsetHeight || 0
    this.$size = { width, height }
    this.$cvsSize = {
      width: width * canvasScale,
      height: height * canvasScale
    }
    if (this.$cvs) {
      Object.assign(this.$cvs, this.$cvsSize)
      Object.assign(this.$cvs.style, {
        width: `${canvasScale * 100}%`,
        height: `${canvasScale * 100}%`,
        transform: `scale(${1 / canvasScale})`
      })
    }
    this.setValue(this.value)
    this._setCtxStyles()
    this._drawRoiPaths()
  }

  scale(coords: Point, useSize?: boolean): Point {
    const { width, height } = useSize && this.$size ? this.$size : this.$cvsSize
    return {
      x: this._floatToFixed(coords.x / width),
      y: this._floatToFixed(coords.y / height)
    }
  }

  invert(scaleCoords: Point, useSize?: boolean): Point {
    const { width, height } = useSize && this.$size ? this.$size : this.$cvsSize
    return {
      x: Math.round(scaleCoords.x * width),
      y: Math.round(scaleCoords.y * height)
    }
  }

  setValue(value: RoiPath[]): void {
    if (Array.isArray(value)) {
      this.value = value
      this.paths = this._switchCoordsScale(value, true)
      this._drawRoiPaths()
    }
  }

  choosePath(index: number): void {
    this.choseIndex = this.paths[index] ? index : -1
    this._emitEvent('onChoose', this.choseIndex)
    this._drawRoiPaths()
  }

  clearCanvas(): void {
    if (this.$ctx && this.$cvs)
      this.$ctx.clearRect(0, 0, this.$cvs.width, this.$cvs.height)
  }

  redrawCanvas(isClear?: boolean): void {
    this._drawRoiPaths(undefined, !isClear)
  }

  exportImageFromCanvas(resolve: (url: string) => void): void {
    this.$cvs &&
      this.$cvs.toBlob((file) => {
        resolve(file ? window.URL.createObjectURL(file) : '')
      })
  }

  customDrawing(fn: CustomHanlder): void {
    if (!this.$ctx || typeof fn !== 'function') return
    this.$ctx.save()
    fn.call(this, this)
    this.redrawCanvas()
    this.$ctx.restore()
  }

  destroy(): void {
    this._removeEventHandler()
    if (this._ElObserver) {
      this._autoFitChange(false)
    }
    if (this.$el && this.$cvs) {
      this.$el.removeChild(this.$cvs)
      delete this.$ctx
      delete this.$cvs
    }
  }
}
