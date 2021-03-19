declare function keyPress(this: any, e: KeyboardEvent): void;
declare function checkMouseCanOperate(this: any, e?: MouseEvent): void;
declare function cvsMouseMove(this: any, e: MouseEvent): void;
declare function cvsMouseClick(this: any, e: MouseEvent): void;
declare function cvsMouseDown(this: any, e: MouseEvent): void;
declare function cvsMouseUp(this: any, e: MouseEvent): void;
declare const _default: {
  keyPress: typeof keyPress;
  cvsMouseUp: typeof cvsMouseUp;
  cvsMouseDown: typeof cvsMouseDown;
  cvsMouseMove: typeof cvsMouseMove;
  cvsMouseClick: typeof cvsMouseClick;
  checkMouseCanOperate: typeof checkMouseCanOperate;
};
export default _default;
