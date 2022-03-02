import React, { useRef, useEffect, useImperativeHandle } from 'react'
import CanvasRoi, { publicMethods, style } from './index'
import {
  RoiPath,
  PublicMethodNames,
  ParitalRoiOptions,
  PowerPartial,
  RoiOptions
} from './types'

export interface RoiProps extends ParitalRoiOptions {
  value?: RoiPath[]
  children?: React.ReactNode
  /** 当前选中的选区索引 */
  choseIndex?: number
  /** 是否不添加行内样式，方便进行样式覆盖 */
  noInlineStyle?: boolean
}

export type RefMethod = Pick<CanvasRoi, PublicMethodNames>

const CanvasRoiComponent = React.forwardRef<
  RefMethod,
  RoiProps & React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const $el = useRef<HTMLDivElement>(null)
  const $_instanceId = useRef(+new Date() + Math.random())
  const $roi = useRef<CanvasRoi>()
  const lastValue = useRef<undefined | RoiPath[]>(props.value)
  const lastOptions = useRef<PowerPartial<RoiOptions>>({})
  const { value, choseIndex, children, noInlineStyle, ...roiOptions } = props

  useEffect(() => {
    if ($el.current) {
      $roi.current = new CanvasRoi($el.current, props)
      props.value && $roi.current.setValue(props.value)
    }
    return () => {
      $roi.current && $roi.current.destroy()
    }
  }, [])

  // update options and value
  useEffect(() => {
    if (!$roi.current) return
    if (value && lastValue.current !== value) {
      $roi.current.setValue(value)
      lastValue.current = value
    }
    if (
      Object.keys(roiOptions).some(
        (key) =>
          roiOptions[key as keyof RoiOptions] !==
          lastOptions.current[key as keyof RoiOptions]
      )
    ) {
      lastOptions.current = roiOptions
      $roi.current.resetOptions(roiOptions)
    }
  }, [value, roiOptions])

  useEffect(() => {
    if (!$roi.current || choseIndex === undefined) return
    $roi.current.choosePath(choseIndex)
  }, [choseIndex])

  const getProxyMethod = () => {
    const proxyMethods = {} as RefMethod
    publicMethods.forEach(<K extends keyof RefMethod>(name: K) => {
      proxyMethods[name] = ((...args: Parameters<RefMethod[K]>) => {
        const method = $roi.current && $roi.current[name]
        if (method && method instanceof Function) {
          return (method as any)(...args)
        }
      }) as RefMethod[K]
    })
    return proxyMethods
  }

  useImperativeHandle(ref, getProxyMethod)

  return React.createElement('div', {
    className: 'canvas-roi',
    'data-id': $_instanceId,
    ...(noInlineStyle ? {} : { style }),
    ref: $el
  })
})

export default CanvasRoiComponent
