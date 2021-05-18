import React, { useRef, useEffect, useImperativeHandle } from 'react'
import CanvasRoi, { publicMethods } from './core'
import { RoiPath, PublicMethodNames, ParitalRoiOptions } from './types'
import './vue-roi.css'

export interface RoiProps extends ParitalRoiOptions {
  value?: RoiPath[]
  children?: React.ReactNode
}

export type RefMethod = Pick<CanvasRoi, PublicMethodNames>

const CanvasRoiComponent: React.ForwardRefRenderFunction<
  RefMethod,
  RoiProps
> = (props, ref) => {
  const $el = useRef<HTMLDivElement>(null)
  const $_instanceId = useRef(+new Date() + Math.random())
  const $roi = useRef<CanvasRoi>()
  const lastValue = useRef<undefined | RoiPath[]>(props.value)

  useEffect(() => {
    $roi.current = new CanvasRoi($el.current as HTMLDivElement, props)
    props.value && $roi.current.setValue(props.value)
    return () => {
      $roi.current && $roi.current?.destroy()
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
    const proxyMethods = {} as Pick<CanvasRoi, PublicMethodNames>
    publicMethods.forEach((name) => {
      proxyMethods[name] = (...args: Parameters<CanvasRoi[typeof name]>) => {
        return $roi.current && ($roi.current[name] as any)(...args)
      }
    })
    return proxyMethods
  }

  useImperativeHandle(ref, getProxyMethod)

  return <div ref={$el} className="canvas-roi" data-id={$_instanceId}></div>
}
export default React.forwardRef(CanvasRoiComponent)
