import CanvasRoi from "./core";
import "./vue-roi.css";
import { RoiOptions, RoiPath, ROIEvents } from "./types";
declare const CanvasRoiComponent: import("vue").DefineComponent<
  {
    readonly?: import("./types").PropOptions<any> | undefined;
    canvasScale?: import("./types").PropOptions<any> | undefined;
    globalStyles?: import("./types").PropOptions<any> | undefined;
    focusStyles?: import("./types").PropOptions<any> | undefined;
    operateFocusOnly?: import("./types").PropOptions<any> | undefined;
    operateCircle?: import("./types").PropOptions<any> | undefined;
    sensitive?: import("./types").PropOptions<any> | undefined;
    allowTypes?: import("./types").PropOptions<any> | undefined;
    singleType?: import("./types").PropOptions<any> | undefined;
    currentType?: import("./types").PropOptions<any> | undefined;
    pathCanMove?: import("./types").PropOptions<any> | undefined;
    digits?: import("./types").PropOptions<any> | undefined;
    distanceCheck?: import("./types").PropOptions<any> | undefined;
    tinyRectSize?: import("./types").PropOptions<any> | undefined;
    rectAspectRatio?: import("./types").PropOptions<any> | undefined;
    tinyCircleRadius?: import("./types").PropOptions<any> | undefined;
    blurStrokeOpacity?: import("./types").PropOptions<any> | undefined;
    ignoreInvalidSelect?: import("./types").PropOptions<any> | undefined;
    rectCursors?: import("./types").PropOptions<any> | undefined;
    maxPath?: import("./types").PropOptions<any> | undefined;
    autoFit?: import("./types").PropOptions<any> | undefined;
    initChoseIndex?: import("./types").PropOptions<any> | undefined;
    width?: import("./types").PropOptions<any> | undefined;
    height?: import("./types").PropOptions<any> | undefined;
    ready?: import("./types").PropOptions<any> | undefined;
    input?: import("./types").PropOptions<any> | undefined;
    change?: import("./types").PropOptions<any> | undefined;
    choose?: import("./types").PropOptions<any> | undefined;
    resize?: import("./types").PropOptions<any> | undefined;
    "draw-start"?: import("./types").PropOptions<any> | undefined;
    "draw-end"?: import("./types").PropOptions<any> | undefined;
    "modify-start"?: import("./types").PropOptions<any> | undefined;
    options: {
      type: ObjectConstructor;
      default: () => RoiOptions;
    };
    value: {
      type: ArrayConstructor;
      default: () => RoiPath[];
    };
  },
  unknown,
  {
    $_instanceId: number;
    $_roi: CanvasRoi | null;
    selfCurrentType: string;
  },
  {
    handledEvents(): {
      ready?: (() => void) | undefined;
      input?: (() => void) | undefined;
      change?: (() => void) | undefined;
      choose?: (() => void) | undefined;
      resize?: (() => void) | undefined;
      "draw-start"?: (() => void) | undefined;
      "draw-end"?: (() => void) | undefined;
      "modify-start"?: (() => void) | undefined;
    };
    handledOptions(): RoiOptions;
  },
  {
    callInstanceMethod(methodName: string, ...args: any[]): any;
    updateValue(value: RoiPath[]): void;
    emitEvent<T>(name: ROIEvents, ...args: T[]): void;
    resetVueOptions(value: RoiOptions): void;
  },
  import("vue").ComponentOptionsMixin,
  import("vue").ComponentOptionsMixin,
  ROIEvents[],
  ROIEvents,
  import("vue").VNodeProps &
    import("vue").AllowedComponentProps &
    import("vue").ComponentCustomProps,
  Readonly<
    {
      options: Record<string, any>;
      value: unknown[];
    } & {
      ready?: any;
      input?: any;
      change?: any;
      choose?: any;
      resize?: any;
      "draw-start"?: any;
      "draw-end"?: any;
      "modify-start"?: any;
      width?: any;
      height?: any;
      readonly?: any;
      canvasScale?: any;
      globalStyles?: any;
      focusStyles?: any;
      operateFocusOnly?: any;
      operateCircle?: any;
      sensitive?: any;
      allowTypes?: any;
      singleType?: any;
      currentType?: any;
      pathCanMove?: any;
      digits?: any;
      distanceCheck?: any;
      tinyRectSize?: any;
      rectAspectRatio?: any;
      tinyCircleRadius?: any;
      blurStrokeOpacity?: any;
      ignoreInvalidSelect?: any;
      rectCursors?: any;
      maxPath?: any;
      autoFit?: any;
      initChoseIndex?: any;
    }
  >,
  {
    options: Record<string, any>;
    value: unknown[];
  }
>;
export default CanvasRoiComponent;
