import './types'

export interface RoiOptions {
  readonly?: boolean,
  canvasScale?: number,
  globalStyles?: CanvasRenderingContext2D,
  focusStyles?: CanvasRenderingContext2D,
  operateFocusOnly?: boolean,
  operateCircle?: {
    styles?: CanvasRenderingContext2D,
    radius?: number,
  },
  sensitive?: {
    line?: number,
    point?: number
  },
  allowTypes?: Array<PathTypes>,
  singleType?: boolean,
  currentType?: PathTypes,
  pathCanMove?: boolean,
  digits?: number,
  distanceCheck?: number,
  tinyRectSize?: number,
  rectAspectRatio?: number,
  tinyCircleRadius?: number,
  blurStrokeOpacity?: number,
  ignoreInvalidSelect?: boolean,
  rectCursors?: {
    side?: string[],
    corner?: string[],
  },
  maxPath?: number,
  autoFit?: boolean,
  initChoseIndex?: number,
  width?: number,
  height?: number,
  ready?: CustomHanlder,
  input?: CustomHanlder,
  change?: CustomHanlder,
  choose?: CustomHanlder,
  resize?: CustomHanlder,
  'draw-start'?: CustomHanlder,
  'draw-end'?: CustomHanlder,
  'modify-start'?: CustomHanlder
}

export type Prop<T> = { (): T } | { new(...args: never[]): T & object } | { new(...args: string[]): Function };

export type PropType<T> = Prop<T> | Prop<T>[];

export interface PropOptions<T=any> {
  type?: PropType<T>;
  required?: boolean,
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}

const booleanType = (value: boolean): PropOptions => ({ type: Boolean, default: value });
const objectType = <T>(value: T): PropOptions => ({ type: Object, default: () => (value) });
const arrayType = <T>(value: T[]): PropOptions => ({ type: Array, default: () => (value) });
const numberType = (value: number): PropOptions => ({ type: Number, default: value });


export function optionsTypes(): { [key in keyof RoiOptions]: PropOptions } {
  return {
    readonly: booleanType(false), 
    canvasScale: numberType(2), 
    globalStyles: objectType({ 
      lineWidth: 2,
      strokeStyle: 'rgba(14, 126, 226, 1)',
      fillStyle: 'rgba(14, 126, 226, 0.6)'
    }),
    focusStyles: objectType(null), 
    operateFocusOnly: booleanType(true), 
    operateCircle: objectType({ 
      styles: {
        fillStyle: 'rgba(255, 255, 255, 0.9)',
      },
      radius: 4,
    }),
    sensitive: objectType({ line: 4, point: 3 }), 
    allowTypes: arrayType(['point', 'line', 'circle', 'rect', 'polygon']), 
    singleType: booleanType(false), 
    currentType: { type: String, default: '' },
    pathCanMove: booleanType(true), 
    digits: numberType(3), 
    distanceCheck: numberType(10), 
    tinyRectSize: numberType(4), 
    rectAspectRatio: numberType(0), 
    tinyCircleRadius: numberType(6), 
    blurStrokeOpacity: numberType(0.5), 
    ignoreInvalidSelect: booleanType(false), 
    rectCursors: objectType({ 
      side: ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'],
      corner: ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'],
    }),
    maxPath: numberType(0), 
    initChoseIndex: numberType(-1), 
    width: { type: Number }, 
    height: { type: Number }, 
    autoFit: booleanType(false)
  }
}


export function defaultOptions(): RoiOptions {
  const result: RoiOptions = {};
  const typesObject = optionsTypes();
  Object.keys(typesObject).forEach(<T extends keyof RoiOptions>(prop: T) => {
    if (Object.prototype.hasOwnProperty.call(typesObject[prop], 'default')) {
      const defaultVal = typesObject[prop].default;
      result[prop] = typeof defaultVal === 'function' ? defaultVal() : defaultVal;
    }
  });
  return result;
}
