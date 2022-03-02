import type CanvasRoi from './'
import { DistanceCheck, OperateCursor, Point, RoiPath } from '../types'
import { clickPathTypes } from './const'
import {
  getMousePoint,
  checkPointsEqual,
  getVirtualRectPoints,
  countDistance,
  fixRectPoints
} from './utils'

function keyPress(this: CanvasRoi, e: KeyboardEvent): void {
  const key = e.key.toLowerCase()
  switch (key) {
    case 'backspace':
    case 'delete':
      this._deletePath()
      break
    case 't':
      this._invertChosePath()
      break
    default:
      break
  }
}

function getRectEndPoint(this: CanvasRoi, truePoint: Point): Point {
  const [startPoint] = this.newPath.points
  const { rectAspectRatio: ratio } = this.$opts
  return ratio > 0
    ? { x: truePoint.x, y: startPoint.y + ratio * (truePoint.x - startPoint.x) }
    : truePoint
}

function dragDrawingHandle(this: CanvasRoi, e: MouseEvent) {
  !this.dragging &&
    (this.dragging = !checkPointsEqual(
      this.newPath.points[0],
      getMousePoint(e)
    ))
  const point = getMousePoint(e)
  this._drawRoiPaths(
    this.newPath.type === 'rect' ? getRectEndPoint.call(this, point) : point
  )
}

function checkPointsNearly(
  this: CanvasRoi,
  oPoint: Point,
  dPoint: Point,
  cusDistanceCheck?: DistanceCheck
): boolean {
  const { distanceCheck, canvasScale } = this.$opts
  const checkValue = cusDistanceCheck || distanceCheck
  return typeof checkValue === 'function'
    ? checkValue(oPoint, dPoint)
    : Math.abs(oPoint.x - dPoint.x) < checkValue * canvasScale &&
        Math.abs(oPoint.y - dPoint.y) < checkValue * canvasScale
}

function clickDrawingHandle(this: CanvasRoi, e: MouseEvent) {
  let endPoint = getMousePoint(e)
  const { points } = this.newPath
  this.pathPointsCoincide = false

  if (points.length > 2) {
    const startPoint = points[0]
    if (checkPointsNearly.call(this, endPoint, startPoint)) {
      endPoint = startPoint
      this.pathPointsCoincide = true
    }
  }
  this._drawRoiPaths(endPoint)
}

function polygonAddPoint(
  this: CanvasRoi,
  points: Point[],
  point: Point,
  lineIndex: number
) {
  points.splice(lineIndex + 1, 0, point)
  Object.assign(this.operateCursor, {
    pointIndex: lineIndex + 1,
    lineIndex: -1
  })
}

function modifyChosePath(this: CanvasRoi, e: MouseEvent) {
  const newPoint = getMousePoint(e)
  const {
    startPoint: { x, y } = { x: 0, y: 0 },
    pathIndex = -1,
    pointIndex = -1,
    lineIndex,
    inPath
  } = this.operateCursor || {}
  if (!this.paths[pathIndex]) return
  const { type, points } = this.paths[pathIndex]

  if (!inPath && type === 'circle') {
    points[1] = newPoint
    this._drawRoiPathsWithOpe(newPoint)
    return
  }
  const distance = [newPoint.x - x, newPoint.y - y]
  this.operateCursor && (this.operateCursor.startPoint = newPoint)
  const isRect = type === 'rect'
  const pointMove = (point: Point, xStatic?: boolean, yStatic?: boolean) => {
    !xStatic && (point.x += distance[0])
    !yStatic && (point.y += distance[1])
  }

  if (inPath) {
    points.forEach((point: Point) => pointMove(point))
    this._drawRoiPaths()
    return
  }

  if (pointIndex >= 0) {
    const rectPointsMove = (idx: number) => {
      if (idx === 1) {
        points[0].y += distance[1]
        points[1].x += distance[0]
      } else if (idx === 3) {
        points[0].x += distance[0]
        points[1].y += distance[1]
      } else {
        pointMove(points[idx / 2])
      }
    }
    isRect ? rectPointsMove(pointIndex) : pointMove(points[pointIndex])
    this._drawRoiPathsWithOpe(isRect ? undefined : newPoint)
    return
  }

  if (lineIndex && lineIndex >= 0) {
    isRect
      ? lineIndex % 3 === 0
        ? pointMove(points[0], lineIndex === 0, lineIndex === 3)
        : pointMove(points[1], lineIndex === 2, lineIndex === 1)
      : polygonAddPoint.call(this, points, newPoint, lineIndex)
    this._drawRoiPathsWithOpe(isRect ? undefined : newPoint)
  }
}

function checkPointLocalInPath(
  this: CanvasRoi,
  points: Point[],
  ckPoint: Point
) {
  if (!this.$ctx) return
  const { length } = points
  const {
    canvasScale,
    sensitive: { point }
  } = this.$opts
  for (let i = 0; i < length; i += 1) {
    const start = points[i]
    const end = points[(i + 1) % length]
    const pointSen = point * canvasScale
    const nearCorer = checkPointsNearly.call(this, start, ckPoint, pointSen)
      ? i
      : checkPointsNearly.call(this, end, ckPoint, pointSen)
      ? i + 1
      : -1
    if (nearCorer > -1) {
      return { pointIndex: nearCorer }
    }
    this.$ctx.beginPath()
    this.$ctx.moveTo(start.x, start.y)
    this.$ctx.lineTo(end.x, end.y)
    this.$ctx.closePath()
    if (this.$ctx.isPointInStroke(ckPoint.x, ckPoint.y)) {
      return { lineIndex: i }
    }
  }
  return
}

function getMousePosition(
  this: CanvasRoi,
  path: RoiPath,
  point: Point,
  idx?: number,
  checkInPath?: boolean
) {
  if (!this.$ctx) return
  const { type, points } = path
  const {
    canvasScale,
    sensitive: { line },
    pathCanMove
  } = this.$opts
  this.$ctx.save()
  this.$ctx.lineWidth = line * canvasScale
  let result = false

  if (type === 'rect' || type === 'polygon') {
    const checkPoints = type === 'rect' ? getVirtualRectPoints(points) : points
    const info = checkPointLocalInPath.call(this, checkPoints, point)
    info &&
      (result = true) &&
      (this.operateCursor = { pathType: type, pathIndex: idx, ...info })
  } else if (type === 'circle') {
    this._createCvsPath(type, points)
    result = this.$ctx.isPointInStroke(point.x, point.y)
    result && (this.operateCursor = { pathType: 'circle', pathIndex: idx })
  }
  if (pathCanMove && checkInPath) {
    this._createCvsPath(type, points)
    const checkFn = type === 'line' ? 'isPointInStroke' : 'isPointInPath'
    result = this.$ctx[checkFn](point.x, point.y)
    result &&
      (this.operateCursor = { pathType: type, pathIndex: idx, inPath: true })
  }
  this.$ctx.restore()
  return result
}

function checkMouseCanOperate(this: CanvasRoi, e?: MouseEvent): void {
  if (!this.$cvs) return
  const point = e ? getMousePoint(e) : undefined
  if (!point) return
  this.operateCursor = null
  this.$cvs.style.cursor = 'inherit'
  const {
    paths,
    choseIndex,
    $opts: { operateFocusOnly }
  } = this
  if (operateFocusOnly) {
    if (paths[choseIndex]) {
      getMousePosition.call(this, paths[choseIndex], point, choseIndex)
      !this.operateCursor &&
        getMousePosition.call(this, paths[choseIndex], point, choseIndex, true)
    }
  } else {
    this.paths.some((path: RoiPath, idx: number) =>
      getMousePosition.call(this, path, point, idx)
    )
    !this.operateCursor &&
      this.paths.some((path: RoiPath, idx: number) =>
        getMousePosition.call(this, path, point, idx, true)
      )
  }
  let drawOpeCircle = false
  if (this.operateCursor) {
    const {
      pathType,
      lineIndex,
      pointIndex,
      inPath,
      pathIndex
    } = this.operateCursor
    if (!inPath && pathType === 'rect') {
      const { side, corner } = this.$opts.rectCursors
      this.$cvs.style.cursor =
        pointIndex > -1 ? corner[pointIndex] : side[lineIndex]
    } else if (inPath) {
      pathIndex === choseIndex && (this.$cvs.style.cursor = 'move')
    } else {
      drawOpeCircle = true
    }
  }
  this._drawRoiPathsWithOpe(drawOpeCircle ? point : undefined)
}

function cvsMouseMove(this: CanvasRoi, e: MouseEvent): void {
  const { drawing, needDrag, dragging, modifying, lastMoveEvent } = this
  if (((drawing && needDrag && dragging) || modifying) && e.buttons !== 1) {
    this._cvsMouseUp(lastMoveEvent as MouseEvent)
    return
  }
  drawing
    ? needDrag
      ? dragDrawingHandle.call(this, e)
      : clickDrawingHandle.call(this, e)
    : modifying
    ? modifyChosePath.call(this, e)
    : checkMouseCanOperate.call(this, e)
  this.lastMoveEvent = e
}

function drawingPoint(this: CanvasRoi, e: MouseEvent) {
  if (!this.drawing) {
    const point = getMousePoint(e)
    this._createNewPath(point, 'point', false)
    this._addNewPath()
  }
}

function drawingLine(this: CanvasRoi, e: MouseEvent) {
  if (!this.drawing) {
    const startPoint = getMousePoint(e)
    this._createNewPath(startPoint, 'line', false)
  } else {
    const newPoint = getMousePoint(e)
    this.newPath.points.push(newPoint)
    this._addNewPath()
  }
}

function drawingPolygon(this: CanvasRoi, e: MouseEvent) {
  if (!this.drawing) {
    const startPoint = getMousePoint(e)
    this._createNewPath(startPoint, 'polygon', false)
  } else if (this.pathPointsCoincide) {
    this._addNewPath()
  } else {
    const newPoint = getMousePoint(e)
    this.newPath.points.push(newPoint)
  }
}

function cvsMouseClick(this: CanvasRoi, e: MouseEvent): void {
  e.preventDefault()
  if (!this.$cvs) return
  this.$cvs.focus()
  const { drawing, needDrag, modifying } = this
  if (
    this._isPathMax() ||
    !this._isSingleTypeAllow() ||
    (drawing && needDrag) ||
    modifying
  )
    return
  const pos = getMousePoint(e)
  if (e.type === 'contextmenu') {
    drawing &&
      (this.newPath.type === 'polygon'
        ? this.newPath.points.pop()
        : this._resetNewPath())
  } else {
    const { singleType, allowTypes } = this.$opts
    if (
      singleType &&
      (clickPathTypes as string[]).includes(this.curSingleType) &&
      (allowTypes as string[]).includes(this.curSingleType)
    ) {
      switch (this.curSingleType) {
        case 'polygon':
          drawingPolygon.call(this, e)
          break
        case 'point':
          drawingPoint.call(this, e)
          break
        case 'line':
          drawingLine.call(this, e)
          break
        default:
          break
      }
    } else if (!singleType && e.shiftKey && allowTypes.includes('polygon')) {
      drawingPolygon.call(this, e)
    }
  }
  this._drawRoiPaths(pos)
}

function cvsMouseDown(this: CanvasRoi, e: MouseEvent): void {
  e.preventDefault()

  if (e.buttons >= 2) return

  if (
    this.operateCursor &&
    (!this.operateCursor.inPath ||
      this.operateCursor.pathIndex === this.choseIndex)
  ) {
    this.modifying = true
    this._emitEvent('onModifyStart', e)
    this.operateCursor.originStartPoint = getMousePoint(e)
    this.operateCursor.startPoint = getMousePoint(e)
    return
  }

  if (
    this._isPathMax() ||
    !this._isSingleTypeAllow(true) ||
    (!this.$opts.singleType && e.shiftKey)
  )
    return
  const type = this.curSingleType || (e.ctrlKey ? 'circle' : 'rect')
  if (!this.$opts.allowTypes.includes(type)) return
  const startPoint = getMousePoint(e)
  this._createNewPath(startPoint, type)
  this._drawRoiPaths()
}

function addDragPath(this: CanvasRoi, endPoint: Point) {
  const { type, points } = this.newPath
  const startPoint = points[0]
  if (type === 'rect') {
    this.newPath.points = fixRectPoints(startPoint, endPoint)
  } else if (type === 'circle') {
    points.push(endPoint)
  }
  this._addNewPath()
}

function checkRoiValid(this: CanvasRoi, startPoint: Point, endPoint: Point) {
  const { tinyRectSize, tinyCircleRadius, canvasScale: cs } = this.$opts
  const { type } = this.newPath
  const tinyValue = type === 'rect' ? tinyRectSize : tinyCircleRadius
  return tinyValue > 0
    ? type === 'rect'
      ? Math.abs(startPoint.x - endPoint.x) > tinyValue * cs &&
        Math.abs(startPoint.y - endPoint.y) > tinyValue * cs
      : countDistance(startPoint, endPoint) > tinyValue * cs
    : !checkPointsEqual(startPoint, endPoint)
}

function checkMouseInPaths(this: CanvasRoi, pos: Point) {
  if (!this.$ctx) return -1
  this.$ctx.save()
  const index = this.paths.findIndex((path: RoiPath) => {
    if (!this.$ctx) return
    this._createCvsPath(path.type, path.points)
    const checkFn = path.type === 'line' ? 'isPointInStroke' : 'isPointInPath'
    return this.$ctx[checkFn](pos.x, pos.y)
  })
  this.$ctx.restore()
  return index
}

function checkPathFocus(this: CanvasRoi, point: Point) {
  const choseIndex = checkMouseInPaths.call(this, point)
  !(this.$opts.ignoreInvalidSelect && choseIndex === -1) &&
    this.choosePath(choseIndex)
}

function cvsMouseUp(this: CanvasRoi, e: MouseEvent): void {
  const endPoint = getMousePoint(e)
  if (this.drawing && this.needDrag && this.dragging) {
    checkRoiValid.call(this, this.newPath.points[0], endPoint)
      ? addDragPath.call(
          this,
          this.newPath.type === 'rect'
            ? getRectEndPoint.call(this, endPoint)
            : endPoint
        )
      : this._resetNewPath()
    return
  }
  if (this.modifying) {
    this.modifying = false
    const { originStartPoint = {} as Point } = this
      .operateCursor as OperateCursor
    !checkPointsEqual(originStartPoint, endPoint) &&
      this._emitValue('modify', this.choseIndex)
  } else if (this.$opts.readonly) {
    checkPathFocus.call(this, endPoint)
    this._drawRoiPaths()
  } else if (!e.shiftKey && (!this.$opts.singleType || !this.curSingleType)) {
    this._resetNewPath()

    checkPathFocus.call(this, endPoint)
    checkMouseCanOperate.call(this, e)
  }
}

export default {
  keyPress,
  cvsMouseUp,
  cvsMouseDown,
  cvsMouseMove,
  cvsMouseClick,
  checkMouseCanOperate
}
