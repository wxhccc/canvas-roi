import { defineComponent, h, App, PropType } from 'vue'
import CanvasRoi, { publicMethods, eventNames } from './core'
import { RoiOptions, RoiPath, ROIEvents, ParitalRoiOptions } from './types'
import './vue-roi.css'

export type VueROIEvent =
  | 'ready'
  | 'input'
  | 'change'
  | 'choose'
  | 'resize'
  | 'draw-start'
  | 'draw-end'
  | 'modify-start'

const vueEventMap: Record<ROIEvents, VueROIEvent> = {
  onReady: 'ready',
  onInput: 'input',
  onChange: 'change',
  onChoose: 'choose',
  onResize: 'resize',
  onDrawStart: 'draw-start',
  onDrawEnd: 'draw-end',
  onModifyStart: 'modify-start',
}

function getProxyMethod() {
  const proxyMethods: { [key: string]: (...args: unknown[]) => unknown } = {}
  publicMethods.forEach((name) => {
    proxyMethods[name] = function (...args: unknown[]) {
      return this.callInstanceMethod(name, ...args)
    }
  })
  return proxyMethods
}

type CvsStyles = PropType<Partial<CanvasRenderingContext2D>>

const optionProps = () => ({
  readonly: {
    type: Boolean,
    default: undefined,
  },
  canvasScale: Number,
  globalStyles: Object as CvsStyles,
  focusStyles: Object as CvsStyles,
  operateFocusOnly: {
    type: Boolean,
    default: undefined,
  },
  operateCircle: Object as PropType<RoiOptions['operateCircle']>,
  sensitive: Object as PropType<RoiOptions['sensitive']>,
  allowTypes: Array as PropType<RoiOptions['allowTypes']>,
  singleType: {
    type: Boolean,
    default: undefined,
  },
  currentType: String as PropType<RoiOptions['currentType']>,
  pathCanMove: {
    type: Boolean,
    default: undefined,
  },
  digits: Number,
  distanceCheck: Number,
  tinyRectSize: Number,
  rectAspectRatio: Number,
  tinyCircleRadius: Number,
  blurStrokeOpacity: Number,
  ignoreInvalidSelect: {
    type: Boolean,
    default: undefined,
  },
  rectCursors: Object as PropType<RoiOptions['rectCursors']>,
  maxPath: Number,
  initChoseIndex: Number,
  width: Number,
  height: Number,
  autoFit: {
    type: Boolean,
    default: undefined,
  },
})

const CanvasRoiComponent = defineComponent({
  name: 'CanvasRoi',
  props: {
    options: {
      type: Object as PropType<ParitalRoiOptions>,
      default: () => ({}),
    },
    modelValue: {
      type: Array,
      default: (): RoiPath[] => [],
    },
    ...optionProps(),
  },
  emits: ['update:modelValue'].concat(Object.values(vueEventMap)),
  data() {
    return {
      $_instanceId: +new Date() + Math.random(),
      $_roi: null as CanvasRoi | null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$_roi = new CanvasRoi(this.$el, this.handledOptions)
      this.modelValue && this.updateValue(this.modelValue as RoiPath[])
    })
  },
  beforeUnmount() {
    this.$_roi && this.$_roi.destroy()
  },
  computed: {
    handledEvents() {
      const events = {} as Record<
        ROIEvents,
        (name: ROIEvents, ...args: any[]) => void
      >
      eventNames.forEach((name) => {
        events[name] = this.emitEvent.bind(this, name)
      })
      return events
    },
    handledOptions(): ParitalRoiOptions {
      const propOptions: ParitalRoiOptions = Object.keys(this.$props).reduce(
        (acc, item) => {
          if (item !== 'options' && item !== 'modelValue') {
            const key = item as keyof Omit<ParitalRoiOptions, ROIEvents>
            const value = this.$props[key] as ParitalRoiOptions[typeof key]
            if (value !== undefined) acc[item] = value
          }
          return acc
        },
        {} as any
      )
      console.log(propOptions)
      return { ...propOptions, ...this.options, ...this.handledEvents }
    },
  },
  watch: {
    modelValue: 'updateValue',
    handledOptions: 'resetVueOptions',
  },
  methods: {
    callInstanceMethod(methodName: string, ...args: any[]) {
      const instance = this.$_roi as any
      if (
        !instance ||
        !instance[methodName] ||
        typeof instance[methodName] !== 'function'
      )
        return
      return instance[methodName](...args)
    },
    updateValue(value: RoiPath[]) {
      this.callInstanceMethod('setValue', value)
    },
    emitEvent(name: ROIEvents, ...args: any[]) {
      const cusHandler = this.options[name]
      typeof cusHandler === 'function' && cusHandler.apply(this, args)
      const vueEventName =
        name === 'onInput' ? 'update:modelValue' : vueEventMap[name]
      this.$emit(vueEventName, ...args)
    },
    resetVueOptions(value: RoiOptions) {
      this.callInstanceMethod('resetOptions', value)
    },
    ...getProxyMethod(),
  },
  render() {
    return h(
      'div',
      {
        class: 'canvas-roi',
        'data-id': this.$data.$_instanceId,
      },
      this.$slots.default
    )
  },
  install(app: App) {
    app.component(CanvasRoi.name, CanvasRoi)
  },
})

export default CanvasRoiComponent
