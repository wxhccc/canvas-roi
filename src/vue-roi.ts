import { defineComponent, h, App, PropType, ref, computed } from 'vue'
import CanvasRoi, { publicMethods, eventNames, style } from './index'
import {
  RoiOptions,
  RoiPath,
  ROIEvents,
  ParitalRoiOptions,
  PublicMethodNames,
  CustomHanlder
} from './types'

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
  onModifyStart: 'modify-start'
}

type CvsStyles = PropType<Partial<CanvasRenderingContext2D>>

const optionProps = () => ({
  readonly: {
    type: Boolean,
    default: undefined
  },
  canvasScale: Number,
  globalStyles: Object as CvsStyles,
  focusStyles: Object as CvsStyles,
  operateFocusOnly: {
    type: Boolean,
    default: undefined
  },
  operateCircle: Object as PropType<RoiOptions['operateCircle']>,
  sensitive: Object as PropType<RoiOptions['sensitive']>,
  allowTypes: Array as PropType<RoiOptions['allowTypes']>,
  singleType: {
    type: Boolean,
    default: undefined
  },
  currentType: String as PropType<RoiOptions['currentType']>,
  pathCanMove: {
    type: Boolean,
    default: undefined
  },
  digits: Number,
  distanceCheck: Number,
  tinyRectSize: Number,
  rectAspectRatio: Number,
  tinyCircleRadius: Number,
  blurStrokeOpacity: Number,
  ignoreInvalidSelect: {
    type: Boolean,
    default: undefined
  },
  rectCursors: Object as PropType<RoiOptions['rectCursors']>,
  maxPath: Number,
  initChoseIndex: Number,
  width: Number,
  height: Number,
  autoFit: {
    type: Boolean,
    default: undefined
  },
  noInlineStyle: Boolean,
  choseIndex: Number,
  rectFullPoint: Boolean
})

const CanvasRoiComponent = defineComponent({
  name: 'CanvasRoi',
  props: {
    options: {
      type: Object as PropType<ParitalRoiOptions>,
      default: () => ({})
    },
    modelValue: {
      type: Array as PropType<RoiPath[]>,
      default: (): RoiPath[] => []
    },
    ...optionProps()
  },
  emits: ['update:modelValue'].concat(Object.values(vueEventMap)),
  setup(props, { emit }) {
    const instanceId = +new Date() + Math.random()
    const roi = ref<CanvasRoi>()

    const emitEvent = (name: ROIEvents, ...args: any[]) => {
      const cusHandler = props.options[name] as CustomHanlder
      cusHandler instanceof Function && cusHandler(...args)
      const vueEventName =
        name === 'onInput' ? 'update:modelValue' : vueEventMap[name]
      emit(vueEventName, ...args)
    }

    const handledEvents = computed(() =>
      eventNames.reduce((acc, name) => {
        acc[name] = emitEvent.bind(undefined, name)
        return acc
      }, {} as ParitalRoiOptions)
    )

    const rootProps = computed(() => ({
      class: 'canvas-roi',
      'data-id': instanceId,
      ...(props.noInlineStyle ? {} : { style })
    }))

    const proxyMethod = publicMethods.reduce((acc, name) => {
      acc[name] = (...args: any[]) => {
        const method = roi.value && roi.value[name]
        if (!method || !(method instanceof Function)) return
        return (method as any).call(roi.value, ...args)
      }
      return acc
    }, {} as Record<PublicMethodNames, CanvasRoi[PublicMethodNames]>)

    return { roi, handledEvents, rootProps, ...proxyMethod }
  },
  mounted() {
    this.$nextTick(() => {
      this.roi = new CanvasRoi(this.$el, this.handledOptions)
      this.modelValue && this.updateValue(this.modelValue)
    })
  },
  beforeUnmount() {
    this.roi && this.roi.destroy()
  },
  computed: {
    handledOptions(): ParitalRoiOptions {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { options, modelValue, choseIndex, ...propOptions } = this.$props
      return { ...propOptions, ...options, ...this.handledEvents }
    }
  },
  watch: {
    modelValue: 'updateValue',
    handledOptions: 'resetVueOptions',
    choseIndex: 'updateChoseIndex'
  },
  methods: {
    callInstanceMethod<M extends PublicMethodNames>(
      methodName: M,
      ...args: Parameters<CanvasRoi[M]>
    ) {
      const method = this.roi && this.roi[methodName]
      if (!method || !(method instanceof Function)) return
      return (method as any).call(this.roi, ...args)
    },
    updateValue(value: RoiPath[]) {
      this.callInstanceMethod('setValue', value)
    },
    resetVueOptions(value: RoiOptions) {
      this.callInstanceMethod('resetOptions', value)
    },
    updateChoseIndex(index: number) {
      this.callInstanceMethod('choosePath', index)
    }
  },
  render() {
    return h('div', this.rootProps, this.$slots.default)
  },
  install(app: App) {
    app.component(CanvasRoi.name, CanvasRoi)
  }
})

export default CanvasRoiComponent
