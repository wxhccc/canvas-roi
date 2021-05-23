import React, { useRef, useEffect, useImperativeHandle } from 'react'
import CanvasRoi, { publicMethods, style } from './index'
import { RoiPath, PublicMethodNames, ParitalRoiOptions } from './types'

export interface RoiProps extends ParitalRoiOptions {
  value?: RoiPath[]
  children?: React.ReactNode
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
    if (lastValue.current === props.value) {
      $roi.current.resetOptions(props)
    } else if (props.value) {
      $roi.current.setValue(props.value)
      lastValue.current = props.value
    }
  }, [props])

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
    ...(props.noInlineStyle ? {} : { style }),
    ref: $el
  })
})

export default CanvasRoiComponent
