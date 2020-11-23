/// <reference types="resize-observer-browser" />
import './types';
import { publicMethods, eventNames, clickPathTypes, dragPathTypes } from './const';
import { jsonClone, fixRectPoints, bindMethods, countDistance } from './utils';
import { optionsTypes, defaultOptions, RoiOptions } from './options'
import cvsEventHandlers from './cvs-events'
import cvsContextMethods from './cvs-context'

export {
  publicMethods,
  eventNames,
  optionsTypes
};

interface PointSwitch {
  (point: Point, useSize?: boolean): Point
}

type ElementOrSelector = HTMLElement | string

interface BaseRoi {
  readonly $el: HTMLElement;
  readonly $opts: RoiOptions;
  readonly $cvs?: HTMLCanvasElement;
  readonly $ctx?: CanvasRenderingContext2D;
  readonly $size?: Size;
  readonly $cvsSize?: Size;

  mount(elementOrSelector?: ElementOrSelector): void;
  resetOptions(options: RoiOptions): void;
  resetCanvas(): void;
  scale: PointSwitch,
  invert: PointSwitch,
  setValue(value: Array<RoiPath>): void;
  clearCanvas(): void;
  redrawCanvas(isClear: boolean): void;
  exportImageFromCanvas(callback: (url: string) => void): void;
  customDrawing(callback: (this: this) => void): void;
  choosePath(index: number): void;
  destroy(): void;
}

interface OperateCursor {
  pathType?: PathTypes,
  pathIndex?: number,
  originStartPoint?: Point,
  startPoint?: Point,
  pointIndex?: number,
  lineIndex?: number
}


export default class CanvasRoi implements BaseRoi {
  // properties
  private isEventsListening: boolean 
  private drawing: boolean 
  private needDrag: boolean 
  private dragging: boolean 
  private modifying: boolean 
  private operateCursor: OperateCursor
  private lastMoveEvent: MouseEvent 
  private newPath: RoiPath
  private value: RoiPath[] 
  private paths: RoiPath[] 
  private curSingleType: PathTypes | ''
  private pathPointsCoincide: boolean
  private hasInvertPath: boolean
  private choseIndex: number
  private resizeTicker: number
  private _events: { [key in CanvasMouseEvents]: () => unknown }
  private _ElObserver: ResizeObserver
  // methods
  private _keyPress: typeof cvsEventHandlers.keyPress
  private _cvsMouseUp: typeof cvsEventHandlers.cvsMouseUp
  private _cvsMouseDown: typeof cvsEventHandlers.cvsMouseDown
  private _cvsMouseMove: typeof cvsEventHandlers.cvsMouseMove
  private _cvsMouseClick: typeof cvsEventHandlers.cvsMouseClick
  private _checkMouseCanOperate: typeof cvsEventHandlers.checkMouseCanOperate
  private _setCtxStyles: typeof cvsContextMethods.setCtxStyles
  private _createCvsPath: typeof cvsContextMethods.createCvsPath
  private _drawExistRoiPath: typeof cvsContextMethods.drawExistRoiPath
  private _drawRoiPaths: typeof cvsContextMethods.drawRoiPaths
  private _drawRoiPathsWithOpe: typeof cvsContextMethods.drawRoiPathsWithOpe

  public $el: HTMLElement;
  public $opts: RoiOptions;
  public $cvs?: HTMLCanvasElement;
  public $ctx?: CanvasRenderingContext2D;
  public $size?: Size;
  public $cvsSize?: Size;

  constructor(elementOrSelector?: ElementOrSelector, options?: RoiOptions) {
    bindMethods.call(this, cvsEventHandlers);

    this._initInstanceVars();
    this.$opts = defaultOptions();
    this._mergeOptions(options);
    this._events = {
      keyup: this._keyPress.bind(this),
      click: this._cvsMouseClick.bind(this),
      mousedown: this._cvsMouseDown.bind(this),
      mousemove: this._cvsMouseMove.bind(this),
      mouseup: this._cvsMouseUp.bind(this),
      contextmenu: this._cvsMouseClick.bind(this),
    };
    elementOrSelector && this.mount(elementOrSelector);
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
    });
  }

  _init(): void {
    const canvas = document.createElement('canvas');
    if (canvas.getContext) {
      bindMethods.call(this, cvsContextMethods);
      canvas.className = 'canvas-roi';
      
      canvas.tabIndex = 99999 * (1 + Math.random());
      canvas.style.cssText = 'outline: none;transform-origin: 0 0;';
      this.$cvs = canvas;
      this.$ctx = this.$cvs.getContext('2d');
      this.resetCanvas();
      this.$el.appendChild(this.$cvs);
      this._addEventHandler(this.$opts.readonly);
      this.$opts.autoFit && this._initObserver();
      this._emitEvent('ready');
    }
  }

  _initObserver(): void {
    if (!this.$el) return;
    this._ElObserver = new ResizeObserver(this._sizeChangeWatcher.bind(this));
    this._ElObserver.observe(this.$el);
  }

  _sizeChangeWatcher(): void {
    clearTimeout(this.resizeTicker);
    this.resizeTicker = window.setTimeout(() => {
      this._emitEvent('resize');
      this.resetCanvas();
    }, 50);
  }

  _autoFitChange(newValue: boolean): void {
    if (newValue) {
      if (!this._ElObserver) {
        return this._initObserver();
      }
      return this._ElObserver.observe(this.$el);
    }
    return this._ElObserver.unobserve(this.$el);
  }

  _mergeOptions(options: RoiOptions): void {
    if (!options) return;
    const { hasOwnProperty, toString } = Object.prototype;
    Object.keys(options).forEach(<T extends keyof RoiOptions>(key: T) => {
      hasOwnProperty.call(this.$opts, key) && toString.call(options[key]) === '[object Object]' && this.$opts[key]
        ? Object.assign(this.$opts[key], options[key])
        : (this.$opts[key] = options[key]);
    });
    this._checkSingleType();
  }

  _emitEvent(name: ROIEvents, ...args: any[]): void {
    const callback = this.$opts[name];
    typeof callback === 'function' && callback(...args);
  }

  /**
   * check methods
   */
  _checkSingleType(): void {
    const { allowTypes, singleType, currentType } = this.$opts;
    this.curSingleType = singleType && allowTypes.includes(currentType) ? currentType : '';
    this.curSingleType && this._resetChooseState();
  }

  _isPathMax(): boolean {
    return this.$opts.maxPath > 0 ? (this.paths.length >= this.$opts.maxPath) : false;
  }

  _isSingleTypeAllow(isDrag: boolean): boolean {
    const types: PathTypes[] = isDrag ? dragPathTypes : clickPathTypes;
    return !this.$opts.singleType || (this.curSingleType && types.includes(this.curSingleType));
  }

  _floatToFixed(value: number): number {
    const { digits } = this.$opts;
    if (digits < 1) return value;
    const times = 10 ** digits;
    return Math.round(value * times) / times;
  }

  _emitValue(changeType = 'add', index = 0): void {
    const value = this.paths;
    
    this._completePathsInfo(value);
    this._emitEvent('input', this._switchCoordsScale(value));
    this._emitEvent('change', changeType, index);
  }

  _completePathsInfo(values: RoiPath[]): void {
    values.forEach((path) => {
      const { type, points } = path;
      let info = {};
      
      if (type === 'rect') {
        const fixedPoints = fixRectPoints(points[0], points[1]);
        info = {
          points: fixedPoints,
          start: this.scale(fixedPoints[0]),
          width: this.scale({ x: fixedPoints[1].x - fixedPoints[0].x, y: 0 }).x,
          height: this.scale({ x: 0, y: fixedPoints[1].y - fixedPoints[0].y }).y,
        };
      } else if (type === 'circle') {
        const radius = countDistance(points[0], points[1]);
        info = {
          center: this.scale(points[0]),
          radius,
          scaleRadius: this.scale({ x: radius, y: 0 }).x,
        };
      }
      Object.assign(path, info);
    });
  }

  _switchCoordsScale(values: RoiPath[], toPx?: boolean): RoiPath[] {
    const newValue = jsonClone(values);
    newValue.forEach((path) => {
      const { points } = path;
      Array.isArray(points)
        && (path.points = points.map((point) => (toPx ? this.invert(point) : this.scale(point))));
    });
    return newValue;
  }

  _addEventHandler(readonly?: boolean): void {
    Object.keys(this._events).forEach(
      (eventName: CanvasMouseEvents) => (!readonly || eventName === 'mouseup') && this.$cvs.addEventListener(eventName, this._events[eventName])
    );
    this.isEventsListening = true;
  }

  
  _removeEventHandler(forceAll?: boolean): void {
    Object.keys(this._events).forEach(
      (eventName: CanvasMouseEvents) => (forceAll || eventName !== 'mouseup') && this.$cvs.removeEventListener(eventName, this._events[eventName])
    );
    this.isEventsListening = false;
  }

  _resetNewPath(): void {
    Object.assign(this, {
      drawing: false,
      needDrag: false,
      dragging: false,
      newPath: {},
      pathPointsCoincide: false,
    });
  }

  _createNewPath(startPoint: Point, type: PathTypes = 'rect', needDrag = true): void {
    this.drawing = true;
    this.needDrag = needDrag;
    Object.assign(this.newPath, { type, points: [startPoint], inner: true });
    this._emitEvent('draw-start', type, startPoint);
  }

  _addNewPath(): void {
    this._emitEvent('draw-end');
    this.paths.unshift(this.newPath);
    this._emitValue();
    !this.$opts.singleType && this.choosePath(0);
    this._resetNewPath();
  }

  _resetChooseState(): void {
    this.choosePath(-1);
  }

  _deletePath(): void {
    if (this.choseIndex < 0) return;
    const index = this.choseIndex;
    this.paths.splice(index, 1);
    this._resetChooseState();
    this._checkMouseCanOperate();
    this._emitValue('delete', index);
  }

  _invertChosePath(): void {
    const { choseIndex: idx } = this;
    idx >= 0 && (this.paths[idx].inner = !this.paths[idx].inner);
    this._emitValue('modify', idx);
  }



  // public methods
  mount(elementOrSelector: ElementOrSelector): void {
    this.$el = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
    this.$el instanceof HTMLElement ? this._init() : console.warn('the param element should be an HTMLElement');
  }

  resetOptions(options: RoiOptions): void {
    const oldAutoFit = this.$opts.autoFit;
    this._mergeOptions(options);
    
    options.globalStyles && this._setCtxStyles();
    
    (options.width !== this.$opts.width || options.height !== this.$opts.height) && this.resetCanvas();
    
    if (options.readonly) {
      this.isEventsListening && this._removeEventHandler();
    } else {
      this._addEventHandler();
    }
    
    this.$opts.autoFit !== oldAutoFit && this._autoFitChange(this.$opts.autoFit);
    this.redrawCanvas(true);
  }

  resetCanvas(): void {
    const { offsetWidth, offsetHeight } = this.$el;
    const { canvasScale, width: optWidth, height: optHeight } = this.$opts;
    const width = optWidth || offsetWidth;
    const height = offsetHeight || optHeight;
    this.$size = { width, height };
    this.$cvsSize = { width: width * canvasScale, height: height * canvasScale };
    Object.assign(this.$cvs, this.$cvsSize);
    Object.assign(this.$cvs.style, { width: `${canvasScale * 100}%`, height: `${canvasScale * 100}%`, transform: `scale(${1 / canvasScale})` });
    this.setValue(this.value);
    this._setCtxStyles();
    this._drawRoiPaths();
  }

  scale(coords: Point, useSize?: boolean): Point {
    const { width, height } = useSize ? this.$size : this.$cvsSize;
    return { x: this._floatToFixed(coords.x / width), y: this._floatToFixed(coords.y / height) };
  }

  invert(scaleCoords: Point, useSize?: boolean): Point {
    const { width, height } = useSize ? this.$size : this.$cvsSize;
    return { x: Math.round(scaleCoords.x * width), y: Math.round(scaleCoords.y * height) };
  }

  setValue(value: RoiPath[]): void {
    if (Array.isArray(value)) {
      this.value = value;
      this.paths = this._switchCoordsScale(value, true);
      this._drawRoiPaths();
    }
  }

  choosePath(index: number): void {
    this.choseIndex = this.paths[index] ? index : -1;
    this._emitEvent('choose', this.choseIndex);
    this._drawRoiPaths();
  }

  clearCanvas(): void {
    this.$ctx && this.$ctx.clearRect(0, 0, this.$cvs.width, this.$cvs.height);
  }

  redrawCanvas(isClear?: boolean): void {
    this._drawRoiPaths(null, !isClear);
  }

  exportImageFromCanvas(resolve: (url: string) => void) : void{
    this.$cvs.toBlob((file) => {
      resolve(file ? window.URL.createObjectURL(file) : '');
    });
  }

  customDrawing(fn: CustomHanlder): void {
    if (typeof fn !== 'function') return;
    this.$ctx.save();
    fn.call(this, this);
    this.redrawCanvas();
    this.$ctx.restore();
  }

  destroy(): void {
    this._removeEventHandler();
    this.$el.removeChild(this.$cvs);
    delete this.$ctx;
    delete this.$cvs;
  }
}
