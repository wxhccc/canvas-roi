/* eslint-env node, jest */
import { mount } from '@vue/test-utils'
import CanvasRoi from '../../dist/vue-roi'
import { nextTick } from 'vue'

// 测试实例方法的调用
const testPaths = [
  {
    type: 'rect',
    points: [
      { x: 0.12, y: 0.188 },
      { x: 0.375, y: 0.54 }
    ],
    inner: true
  }
]

describe('CanvasRoi.vue', () => {
  // 测试dom渲染
  describe('dom render', () => {
    it('render wrapper box correct', () => {
      const wrapper = mount(CanvasRoi)
      expect(wrapper.element.tagName).toBe('DIV')
    })
    it('canvas element render correct', async () => {
      const wrapper = mount(CanvasRoi)
      await nextTick()
      expect(wrapper.find('canvas').exists()).toBe(true)
    })
  })
  const defaultSize = {
    width: 300,
    height: 100
  }
  // 测试props配置项
  describe(':props', () => {
    const checkCanvasSize = (instance, roiSize, canvasScale = 2) => {
      expect(instance.$cvsSize).toEqual({
        width: roiSize.width * canvasScale,
        height: roiSize.height * canvasScale
      })
    }
    const checkContextProperties = (instance, property, value) => {
      expect(instance.$ctx).toHaveProperty(property, value)
    }
    it(':options - set core instance config immediate', async () => {
      const options = {
        ...defaultSize,
        canvasScale: 4,
        globalStyles: {
          fillStyle: '#ff0000'
        }
      }
      const wrapper = mount(CanvasRoi, {
        propsData: { options }
      })
      await nextTick()
      checkCanvasSize(wrapper.vm.roi, options, options.canvasScale)
      checkContextProperties(wrapper.vm.roi, 'fillStyle', '#ff0000')
    })
    describe('check proxy properties', () => {
      it(':canvasScale - scale canvas inner size', async () => {
        const wrapper = mount(CanvasRoi, {
          propsData: {
            ...defaultSize,
            canvasScale: 3
          }
        })
        await nextTick()
        checkCanvasSize(wrapper.vm.roi, defaultSize, 3)
      })
      it(":globalStyles - set context's global styles", async () => {
        const wrapper = mount(CanvasRoi, {
          propsData: {
            globalStyles: {
              fillStyle: '#ff0000'
            }
          }
        })
        await nextTick()
        checkContextProperties(wrapper.vm.roi, 'fillStyle', '#ff0000')
      })
    })
  })
  // 测试methods事件代理
  describe('methods', () => {
    // 测试事件是否成功代理到vue组件实例上
    describe('scale', () => {
      it('should work', async () => {
        const wrapper = mount(CanvasRoi, {
          propsData: { ...defaultSize }
        })
        await nextTick()
        const instance = wrapper.vm
        // 默认使用$cvsSize做转换
        expect(instance.scale({ x: 150, y: 50 })).toEqual({ x: 0.25, y: 0.25 })
        // 也可以使用$size做转换
        expect(instance.scale({ x: 150, y: 50 }, true)).toEqual({
          x: 0.5,
          y: 0.5
        })
      })
    })
    describe('setValue', () => {
      it('should work', async () => {
        const wrapper = mount(CanvasRoi, {
          propsData: { ...defaultSize }
        })
        await nextTick()
        const instance = wrapper.vm
        instance.setValue(testPaths)
        expect(instance.roi.paths).toEqual(
          instance.roi._switchCoordsScale(testPaths, true)
        )
      })
    })
  })
  // 测试events事件代理
  describe('@events', () => {
    it('@ready - will trigger when component ready', async () => {
      const wrapper = mount(CanvasRoi, {
        propsData: { ...defaultSize }
      })
      await nextTick()
      expect(wrapper.emitted().ready).toBeTruthy()
    })
    it('@update:modelValue & @change - will trigger when value change', async () => {
      const wrapper = mount(CanvasRoi, {
        propsData: { ...defaultSize }
      })
      await nextTick()
      const instance = wrapper.vm
      // 由于无法模拟组件内部生成路径，故使用外部方法来测试事件
      instance.setValue(testPaths)
      expect(instance.roi.paths.length).toBe(1)
      instance.roi.choseIndex = 0
      instance.roi._deletePath()

      expect(wrapper.emitted()['update:modelValue'][0]).toEqual([[]])
      expect(wrapper.emitted().change).toEqual([['delete', 0]])
    })
    it('@choose - will trigger when path chose', async () => {
      const wrapper = mount(CanvasRoi, {
        propsData: { ...defaultSize }
      })
      await nextTick()
      const instance = wrapper.vm
      // 由于无法模拟组件内部生成路径，故使用外部方法来测试事件
      instance.setValue(testPaths)
      instance.choosePath(0)
      expect(wrapper.emitted().choose[0]).toEqual([0])
    })
  })
})
