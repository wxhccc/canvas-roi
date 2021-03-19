import { PropOptions, RoiOptions } from "../types";

const booleanType = (value: boolean): PropOptions<boolean> => ({
  type: Boolean,
  default: value,
});
const objectType = <T>(value: T): PropOptions<T> => ({
  type: Object,
  default: () => value,
});
const arrayType = <T>(value: T[]): PropOptions<T[]> => ({
  type: Array,
  default: () => value,
});
const numberType = (value: number): PropOptions<number> => ({
  type: Number,
  default: value,
});

export function optionsTypes(): {
  [key in keyof RoiOptions]: PropOptions<any>;
} {
  return {
    readonly: booleanType(false),
    canvasScale: numberType(2),
    globalStyles: objectType({
      lineWidth: 2,
      strokeStyle: "rgba(14, 126, 226, 1)",
      fillStyle: "rgba(14, 126, 226, 0.6)",
    }),
    focusStyles: objectType(null),
    operateFocusOnly: booleanType(true),
    operateCircle: objectType({
      styles: {
        fillStyle: "rgba(255, 255, 255, 0.9)",
      },
      radius: 4,
    }),
    sensitive: objectType({ line: 4, point: 3 }),
    allowTypes: arrayType(["point", "line", "circle", "rect", "polygon"]),
    singleType: booleanType(false),
    currentType: { type: String, default: "" },
    pathCanMove: booleanType(true),
    digits: numberType(3),
    distanceCheck: numberType(10),
    tinyRectSize: numberType(4),
    rectAspectRatio: numberType(0),
    tinyCircleRadius: numberType(6),
    blurStrokeOpacity: numberType(0.5),
    ignoreInvalidSelect: booleanType(false),
    rectCursors: objectType({
      side: ["ns-resize", "ew-resize", "ns-resize", "ew-resize"],
      corner: ["nw-resize", "ne-resize", "se-resize", "sw-resize"],
    }),
    maxPath: numberType(0),
    initChoseIndex: numberType(-1),
    width: { type: Number },
    height: { type: Number },
    autoFit: booleanType(false),
  };
}

export function defaultOptions<K extends keyof RoiOptions>(): RoiOptions {
  const result: RoiOptions = {};
  const typesObject = optionsTypes();
  (Object.keys(typesObject) as K[]).forEach((prop) => {
    if (typesObject[prop] && "default" in typesObject[prop]) {
      const defaultVal = typesObject[prop]!.default;
      result[prop] =
        typeof defaultVal === "function" ? defaultVal() : defaultVal;
    }
  });
  return result;
}
