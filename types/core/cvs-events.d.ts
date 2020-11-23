import './types';
declare function keyPress(e: KeyboardEvent): void;
declare function checkMouseCanOperate(e?: MouseEvent): void;
declare function cvsMouseMove(e: MouseEvent): void;
declare function cvsMouseClick(e: MouseEvent): void;
declare function cvsMouseDown(e: MouseEvent): void;
declare function cvsMouseUp(e: MouseEvent): void;
declare const _default: {
    keyPress: typeof keyPress;
    cvsMouseUp: typeof cvsMouseUp;
    cvsMouseDown: typeof cvsMouseDown;
    cvsMouseMove: typeof cvsMouseMove;
    cvsMouseClick: typeof cvsMouseClick;
    checkMouseCanOperate: typeof checkMouseCanOperate;
};
export default _default;
