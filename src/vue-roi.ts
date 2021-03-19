import { defineComponent, h, App } from "vue";
import CanvasRoi, { publicMethods, optionsTypes, eventNames } from "./core";
import "./vue-roi.css";
import { RoiOptions, RoiPath, ROIEvents } from "./types";

function getProxyMethod() {
  const proxyMethods: { [key: string]: (...args: unknown[]) => unknown } = {};
  publicMethods.forEach((name) => {
    proxyMethods[name] = function (...args: unknown[]) {
      return this.callInstanceMethod(name, ...args);
    };
  });
  return proxyMethods;
}

const propTypes = optionsTypes();

const CanvasRoiComponent = defineComponent({
  name: "CanvasRoi",
  props: {
    options: {
      type: Object,
      default: (): RoiOptions => ({}),
    },
    value: {
      type: Array,
      default: (): RoiPath[] => [],
    },
    ...propTypes,
  },
  emits: eventNames,
  data() {
    return {
      $_instanceId: +new Date() + Math.random(),
      $_roi: null as CanvasRoi | null,
      selfCurrentType: "",
    };
  },
  mounted() {
    this.$_roi = new CanvasRoi(this.$el, this.handledOptions);
    this.value && this.updateValue(this.value as RoiPath[]);
  },
  destroy() {
    this.$_roi && this.$_roi.destroy();
  },
  computed: {
    handledEvents() {
      const events: { [key in ROIEvents]?: () => void } = {};
      eventNames.forEach((name) => {
        events[name] = this.emitEvent.bind(this, name);
      });
      return events;
    },
    handledOptions(): RoiOptions {
      return { ...this.$props, ...this.options, ...this.handledEvents };
    },
  },
  watch: {
    value: "updateValue",
    handledOptions: "resetVueOptions",
  },
  methods: {
    callInstanceMethod(methodName: string, ...args: any[]) {
      const instance = this.$_roi as any;
      if (
        !instance ||
        !instance[methodName] ||
        typeof instance[methodName] !== "function"
      )
        return;
      return instance[methodName](...args);
    },
    updateValue(value: RoiPath[]) {
      this.callInstanceMethod("setValue", value);
    },
    emitEvent<T>(name: ROIEvents, ...args: T[]) {
      const cusHandler = this.options[name] || this[name];
      typeof cusHandler === "function" && cusHandler.apply(this, args);
      this.$emit(name, ...args);
    },
    resetVueOptions(value: RoiOptions) {
      this.callInstanceMethod("resetOptions", value);
    },
    ...getProxyMethod(),
  },
  render() {
    return h(
      "div",
      {
        class: "canvas-roi",
        "data-id": this.$data.$_instanceId,
      },
      this.$slots.default
    );
  },
  install(app: App) {
    app.component(CanvasRoi.name, CanvasRoi);
  },
});

export default CanvasRoiComponent;
