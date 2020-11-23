import './core/types';
import { CreateElement, VueConstructor } from 'vue';
import CanvasRoi, { publicMethods, optionsTypes, eventNames } from './core';
import './vue-roi.css';
import { RoiOptions } from './core/options';

function getProxyMethod() {
  const proxyMethods: { [key: string]: (...args: any[]) => any } = {};
  publicMethods.forEach((name) => {
    proxyMethods[name] = function (...args: any) {
      return this.callInstanceMethod(name, ...args);
    };
  });
  return proxyMethods;
}

const propTypes = optionsTypes();

const CanvasRoiComponent = {
  name: 'CanvasRoi',
  props: {
    options: {
      type: Object,
      default: (): RoiOptions => ({})
    },
    value: {
      type: Array,
      default: (): RoiPath[] => ([])
    },
    ...propTypes
  },
  data() {
    const $roi: CanvasRoi = null
    return {
      $instanceId: +new Date() + Math.random(),
      $roi,
      selfCurrentType: ''
    };
  },
  mounted() {
    this.$roi = new CanvasRoi(this.$el, this.handledOptions);
    this.value && this.updateValue(this.value);
  },
  destroy() {
    this.$roi && this.$roi.destroy();
  },
  computed: {
    handledEvents() {
      const events: { [key in ROIEvents]?: () => void } = {};
      eventNames.forEach((name) => {
        events[name] = this.emitEvent.bind(this, name);
      });
      return events;
    },
    handledOptions() {
      return { ...this.$props, ...this.options, ...this.handledEvents };
    }
  },
  watch: {
    value: 'updateValue',
    handledOptions: 'resetVueOptions'
  },
  methods: {
    callInstanceMethod(methodName: string, ...args: any[]) {
      return this.$roi ? this.$roi[methodName](...args) : undefined;
    },
    updateValue(value: RoiPath[]) {
      this.callInstanceMethod('setValue', value);
    },
    emitEvent(name: ROIEvents, ...args: any[]) {
      const cusHandler = this.options[name] || this[name];
      typeof cusHandler === 'function' && cusHandler.apply(this, args);
      this.$emit(name, ...args);
    },
    resetVueOptions(value: RoiOptions) {
      this.callInstanceMethod('resetOptions', value);
    },
    ...getProxyMethod()
  },
  render(h: CreateElement) {
    return h('div', {
      class: 'canvas-roi',
      attrs: {
        'data-id': this.$instanceId
      }
    }, this.$slots.default);
  },
  install(Vue: VueConstructor) {
    Vue.component(CanvasRoi.name, CanvasRoi);
  }
};

export default CanvasRoiComponent;
