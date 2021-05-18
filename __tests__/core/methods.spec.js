/* eslint-env node, jest */
import 'jest-canvas-mock'
import CanvasRoi from '../../'

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

describe('mount', () => {
  it('would append canvas element to container', () => {
    const instance = new CanvasRoi()
    expect(instance).not.toHaveProperty('$el')
    instance.mount(document.body)
    expect(instance).toHaveProperty('$el')
    expect(instance.$cvs).toBeInstanceOf(HTMLCanvasElement)
  })
})

describe('resetOptions', () => {
  it('update properties which are not object', () => {
    const options = {
      readonly: true,
      canvasScale: 3,
      allowTypes: ['rect'],
      operateFocusOnly: false,
      digits: 4
    }
    const instance = new CanvasRoi(null, options)
    expect(instance.$opts).toMatchObject(options)
  })
  it('should merge properties which are object', () => {
    const globalStyles = {
      lineWidth: 4
    }
    const instance = new CanvasRoi(null, { globalStyles })
    expect(instance.$opts.globalStyles).toMatchObject(globalStyles)
    expect(instance.$opts.globalStyles).not.toEqual(globalStyles)
  })
})

describe('scale', () => {
  it('switch px to scale value between 0 and 1 through $cvsSize/$size', () => {
    const orgSize = { width: 300, height: 100 }
    const instance = new CanvasRoi(document.body, orgSize)
    // 默认使用$cvsSize做转换
    expect(instance.scale({ x: 150, y: 50 })).toEqual({ x: 0.25, y: 0.25 })
    // 也可以使用$size做转换
    expect(instance.scale({ x: 150, y: 50 }, true)).toEqual({ x: 0.5, y: 0.5 })
  })
})
describe('invert', () => {
  it('switch scale value between 0 and 1 to px through $cvsSize/$size', () => {
    const orgSize = { width: 300, height: 100 }
    const instance = new CanvasRoi(document.body, orgSize)
    // 默认使用$cvsSize做转换
    expect(instance.invert({ x: 0.25, y: 0.25 })).toEqual({ x: 150, y: 50 })
    // 也可以使用$size做转换
    expect(instance.invert({ x: 0.5, y: 0.5 }, true)).toEqual({
      x: 150,
      y: 50
    })
  })
})
describe('setValue', () => {
  it('should work', () => {
    const instance = new CanvasRoi(document.body, { width: 300, height: 100 })
    instance.setValue(testPaths)
    expect(instance.paths).toEqual(instance._switchCoordsScale(testPaths, true))
  })
})
describe('choosePath', () => {
  it('should work', () => {
    const instance = new CanvasRoi(document.body, { width: 300, height: 100 })
    instance.setValue(testPaths)
    instance.choosePath(0)
    expect(instance.choseIndex).toBe(0)
  })
})
describe('destroy', () => {
  it('should remove event listener and dom', () => {
    document.body.innerHTML = ''
    const instance = new CanvasRoi(document.body, { width: 300, height: 100 })
    expect(instance.$cvs).toBeTruthy()
    instance.destroy()
    expect(instance.$cvs).toBeFalsy()
    expect(document.body.querySelector('canvas')).toBeFalsy()
  })
})
