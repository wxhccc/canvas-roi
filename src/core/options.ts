import { RoiOptions } from '../types'

export function defaultOptions(): RoiOptions {
  return {
    readonly: false,
    canvasScale: 2,
    globalStyles: {
      lineWidth: 2,
      strokeStyle: 'rgba(14, 126, 226, 1)',
      fillStyle: 'rgba(14, 126, 226, 0.6)'
    },
    focusStyles: undefined,
    operateFocusOnly: true,
    operateCircle: {
      styles: {
        fillStyle: 'rgba(255, 255, 255, 0.9)'
      },
      radius: 4
    },
    sensitive: { line: 4, point: 3 },
    allowTypes: ['point', 'line', 'circle', 'rect', 'polygon'],
    singleType: false,
    currentType: '',
    pathCanMove: true,
    digits: 3,
    distanceCheck: 10,
    tinyRectSize: 4,
    rectAspectRatio: 0,
    tinyCircleRadius: 6,
    blurStrokeOpacity: 0.5,
    ignoreInvalidSelect: false,
    rectCursors: {
      side: ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'],
      corner: ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize']
    },
    maxPath: 0,
    autoFit: false,
    reverse: true
  }
}
