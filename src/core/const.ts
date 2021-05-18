import {
  ROIEvents,
  ClickPathTypes,
  DragPathTypes,
  PublicMethodNames,
} from '../types'

export const publicMethods: PublicMethodNames[] = [
  'mount',
  'resetOptions',
  'resetCanvas',
  'scale',
  'invert',
  'setValue',
  'clearCanvas',
  'redrawCanvas',
  'exportImageFromCanvas',
  'customDrawing',
  'choosePath',
  'destroy',
]

export const eventNames: ROIEvents[] = [
  'onReady',
  'onInput',
  'onChange',
  'onChoose',
  'onResize',
  'onDrawStart',
  'onDrawEnd',
  'onModifyStart',
]

export const clickPathTypes: ClickPathTypes[] = ['point', 'line', 'polygon']

export const dragPathTypes: DragPathTypes[] = ['rect', 'circle']
