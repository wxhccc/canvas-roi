interface Point {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
declare type CanvasMouseEvents = 'keyup' | 'click' | 'mousedown' | 'mousemove' | 'mouseup' | 'contextmenu';
declare type ROIEvents = 'ready' | 'input' | 'change' | 'choose' | 'resize' | 'draw-start' | 'draw-end' | 'modify-start';
declare type ClickPathTypes = 'point' | 'line' | 'polygon';
declare type DragPathTypes = 'rect' | 'circle';
declare type PathTypes = ClickPathTypes | DragPathTypes;
interface CustomHanlder {
    <T>(...args: T[]): void;
}
declare type MethodsMap = {
    [key: string]: CustomHanlder;
};
interface RoiPath {
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
