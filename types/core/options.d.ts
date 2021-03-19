import { PropOptions, RoiOptions } from "../types";
export declare function optionsTypes(): {
  [key in keyof RoiOptions]: PropOptions<any>;
};
export declare function defaultOptions<
  K extends keyof RoiOptions
>(): RoiOptions;
