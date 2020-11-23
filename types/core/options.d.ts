import './types';
export interface RoiOptions {
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
    'draw-start'?: CustomHanlder;
    'draw-end'?: CustomHanlder;
    'modify-start'?: CustomHanlder;
}
export declare type Prop<T> = {
    (): T;
} | {
    new (...args: never[]): T & object;
} | {
    new (...args: string[]): Function;
};
export declare type PropType<T> = Prop<T> | Prop<T>[];
export interface PropOptions<T = any> {
    type?: PropType<T>;
    required?: boolean;
    default?: T | null | undefined | (() => T | null | undefined);
    validator?(value: T): boolean;
}
export declare function optionsTypes(): {
    [key in keyof RoiOptions]: PropOptions;
};
export declare function defaultOptions(): RoiOptions;
