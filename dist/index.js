"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var vue = require("vue");

const publicMethods = [
  "mount",
  "resetOptions",
  "resetCanvas",
  "scale",
  "invert",
  "setValue",
  "clearCanvas",
  "redrawCanvas",
  "exportImageFromCanvas",
  "customDrawing",
  "choosePath",
  "destroy",
];
const eventNames = [
  "ready",
  "input",
  "change",
  "choose",
  "resize",
  "draw-start",
  "draw-end",
  "modify-start",
];
const clickPathTypes = ["point", "line", "polygon"];
const dragPathTypes = ["rect", "circle"];

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}
function fixRectPoints(start, end) {
  const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const [width, height] = [
    Math.abs(start.x - end.x),
    Math.abs(start.y - end.y),
  ];
  return [
    { x: center.x - width / 2, y: center.y - height / 2 },
    { x: center.x + width / 2, y: center.y + height / 2 },
  ];
}
function getVirtualRectPoints(points) {
  return points.length === 2
    ? [
        points[0],
        { x: points[1].x, y: points[0].y },
        points[1],
        { x: points[0].x, y: points[1].y },
      ]
    : points;
}
function countDistance(point1, point2) {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}
function checkPointsEqual(oPoint, dPoint) {
  return oPoint.x === dPoint.x && oPoint.y === dPoint.y;
}
function getMousePoint(e) {
  return { x: e.offsetX, y: e.offsetY };
}
function bindMethods(methods) {
  for (const key in methods) {
    this[`_${key}`] = methods[key];
  }
}

const booleanType = (value) => ({ type: Boolean, default: value });
const objectType = (value) => ({ type: Object, default: () => value });
const arrayType = (value) => ({ type: Array, default: () => value });
const numberType = (value) => ({ type: Number, default: value });
function optionsTypes() {
  return {
    readonly: booleanType(false),
    canvasScale: numberType(2),
    globalStyles: objectType({
      lineWidth: 2,
      strokeStyle: "rgba(14, 126, 226, 1)",
      fillStyle: "rgba(14, 126, 226, 0.6)",
    }),
    focusStyles: objectType(null),
    operateFocusOnly: booleanType(true),
    operateCircle: objectType({
      styles: {
        fillStyle: "rgba(255, 255, 255, 0.9)",
      },
      radius: 4,
    }),
    sensitive: objectType({ line: 4, point: 3 }),
    allowTypes: arrayType(["point", "line", "circle", "rect", "polygon"]),
    singleType: booleanType(false),
    currentType: { type: String, default: "" },
    pathCanMove: booleanType(true),
    digits: numberType(3),
    distanceCheck: numberType(10),
    tinyRectSize: numberType(4),
    rectAspectRatio: numberType(0),
    tinyCircleRadius: numberType(6),
    blurStrokeOpacity: numberType(0.5),
    ignoreInvalidSelect: booleanType(false),
    rectCursors: objectType({
      side: ["ns-resize", "ew-resize", "ns-resize", "ew-resize"],
      corner: ["nw-resize", "ne-resize", "se-resize", "sw-resize"],
    }),
    maxPath: numberType(0),
    initChoseIndex: numberType(-1),
    width: { type: Number },
    height: { type: Number },
    autoFit: booleanType(false),
  };
}
function defaultOptions() {
  const result = {};
  const typesObject = optionsTypes();
  Object.keys(typesObject).forEach((prop) => {
    if (typesObject[prop] && "default" in typesObject[prop]) {
      const defaultVal = typesObject[prop].default;
      result[prop] =
        typeof defaultVal === "function" ? defaultVal() : defaultVal;
    }
  });
  return result;
}

function keyPress(e) {
  const key = e.key.toLowerCase();
  switch (key) {
    case "backspace":
    case "delete":
      this._deletePath();
      break;
    case "t":
      this._invertChosePath();
      break;
  }
}
function getRectEndPoint(truePoint) {
  const [startPoint] = this.newPath.points;
  const { rectAspectRatio: ratio } = this.$opts;
  return ratio > 0
    ? { x: truePoint.x, y: startPoint.y + ratio * (truePoint.x - startPoint.x) }
    : truePoint;
}
function dragDrawingHandle(e) {
  !this.dragging &&
    (this.dragging = !checkPointsEqual(
      this.newPath.points[0],
      getMousePoint(e)
    ));
  const point = getMousePoint(e);
  this._drawRoiPaths(
    this.newPath.type === "rect" ? getRectEndPoint.call(this, point) : point
  );
}
function checkPointsNearly(oPoint, dPoint, cusDistanceCheck) {
  const { distanceCheck, canvasScale } = this.$opts;
  const checkValue = cusDistanceCheck || distanceCheck;
  return typeof checkValue === "function"
    ? checkValue(oPoint, dPoint)
    : Math.abs(oPoint.x - dPoint.x) < checkValue * canvasScale &&
        Math.abs(oPoint.y - dPoint.y) < checkValue * canvasScale;
}
function clickDrawingHandle(e) {
  let endPoint = getMousePoint(e);
  const { points } = this.newPath;
  this.pathPointsCoincide = false;
  if (points.length > 2) {
    const startPoint = points[0];
    if (checkPointsNearly.call(this, endPoint, startPoint)) {
      endPoint = startPoint;
      this.pathPointsCoincide = true;
    }
  }
  this._drawRoiPaths(endPoint);
}
function polygonAddPoint(points, point, lineIndex) {
  points.splice(lineIndex + 1, 0, point);
  Object.assign(this.operateCursor, {
    pointIndex: lineIndex + 1,
    lineIndex: -1,
  });
}
function modifyChosePath(e) {
  const newPoint = getMousePoint(e);
  const { startPoint, pathIndex, pointIndex, lineIndex, inPath } =
    this.operateCursor || {};
  if (!this.paths[pathIndex]) return;
  const { type, points } = this.paths[pathIndex];
  if (!inPath && type === "circle") {
    points[1] = newPoint;
    this._drawRoiPathsWithOpe(newPoint);
    return;
  }
  const distance = [newPoint.x - startPoint.x, newPoint.y - startPoint.y];
  this.operateCursor.startPoint = newPoint;
  const isRect = type === "rect";
  const pointMove = (point, xStatic, yStatic) => {
    !xStatic && (point.x += distance[0]);
    !yStatic && (point.y += distance[1]);
  };
  if (inPath) {
    points.forEach((point) => pointMove(point));
    this._drawRoiPaths();
    return;
  }
  if (pointIndex >= 0) {
    const rectPointsMove = (idx) => {
      if (idx === 1) {
        points[0].y += distance[1];
        points[1].x += distance[0];
      } else if (idx === 3) {
        points[0].x += distance[0];
        points[1].y += distance[1];
      } else {
        pointMove(points[idx / 2]);
      }
    };
    isRect ? rectPointsMove(pointIndex) : pointMove(points[pointIndex]);
    this._drawRoiPathsWithOpe(!isRect && newPoint);
    return;
  }
  if (lineIndex >= 0) {
    isRect
      ? lineIndex % 3 === 0
        ? pointMove(points[0], lineIndex === 0, lineIndex === 3)
        : pointMove(points[1], lineIndex === 2, lineIndex === 1)
      : polygonAddPoint.call(this, points, newPoint, lineIndex);
    this._drawRoiPathsWithOpe(!isRect && newPoint);
  }
}
function checkPointLocalInPath(points, ckPoint) {
  const { length } = points;
  const {
    canvasScale,
    sensitive: { point },
  } = this.$opts;
  for (let i = 0; i < length; i += 1) {
    const start = points[i];
    const end = points[(i + 1) % length];
    const pointSen = point * canvasScale;
    const nearCorer = checkPointsNearly.call(this, start, ckPoint, pointSen)
      ? i
      : checkPointsNearly.call(this, end, ckPoint, pointSen)
      ? i + 1
      : -1;
    if (nearCorer > -1) {
      return { pointIndex: nearCorer };
    }
    this.$ctx.beginPath();
    this.$ctx.moveTo(start.x, start.y);
    this.$ctx.lineTo(end.x, end.y);
    this.$ctx.closePath();
    if (this.$ctx.isPointInStroke(ckPoint.x, ckPoint.y)) {
      return { lineIndex: i };
    }
  }
  return null;
}
function getMousePosition(path, point, idx, checkInPath) {
  const { type, points } = path;
  const {
    canvasScale,
    sensitive: { line },
    pathCanMove,
  } = this.$opts;
  this.$ctx.save();
  this.$ctx.lineWidth = line * canvasScale;
  let result = false;
  if (type === "rect" || type === "polygon") {
    const checkPoints = type === "rect" ? getVirtualRectPoints(points) : points;
    const info = checkPointLocalInPath.call(this, checkPoints, point);
    info &&
      (result = true) &&
      (this.operateCursor = { pathType: type, pathIndex: idx, ...info });
  } else if (type === "circle") {
    this._createCvsPath(type, points);
    result = this.$ctx.isPointInStroke(point.x, point.y);
    result && (this.operateCursor = { pathType: "circle", pathIndex: idx });
  }
  if (pathCanMove && checkInPath) {
    this._createCvsPath(type, points);
    const checkFn = type === "line" ? "isPointInStroke" : "isPointInPath";
    result = this.$ctx[checkFn](point.x, point.y);
    result &&
      (this.operateCursor = { pathType: type, pathIndex: idx, inPath: true });
  }
  this.$ctx.restore();
  return result;
}
function checkMouseCanOperate(e) {
  const point = e ? getMousePoint(e) : undefined;
  if (!point) return;
  this.operateCursor = null;
  this.$cvs.style.cursor = "inherit";
  const {
    paths,
    choseIndex,
    $opts: { operateFocusOnly },
  } = this;
  if (operateFocusOnly) {
    if (paths[choseIndex]) {
      getMousePosition.call(this, paths[choseIndex], point, choseIndex);
      !this.operateCursor &&
        getMousePosition.call(this, paths[choseIndex], point, choseIndex, true);
    }
  } else {
    this.paths.some((path, idx) =>
      getMousePosition.call(this, path, point, idx)
    );
    !this.operateCursor &&
      this.paths.some((path, idx) =>
        getMousePosition.call(this, path, point, idx, true)
      );
  }
  let drawOpeCircle = false;
  if (this.operateCursor) {
    const {
      pathType,
      lineIndex,
      pointIndex,
      inPath,
      pathIndex,
    } = this.operateCursor;
    if (!inPath && pathType === "rect") {
      const { side, corner } = this.$opts.rectCursors;
      this.$cvs.style.cursor =
        pointIndex > -1 ? corner[pointIndex] : side[lineIndex];
    } else if (inPath) {
      pathIndex === choseIndex && (this.$cvs.style.cursor = "move");
    } else {
      drawOpeCircle = true;
    }
  }
  this._drawRoiPathsWithOpe(drawOpeCircle && point);
}
function cvsMouseMove(e) {
  const { drawing, needDrag, dragging, modifying, lastMoveEvent } = this;
  if (((drawing && needDrag && dragging) || modifying) && e.buttons !== 1) {
    this.cvsMouseUp(lastMoveEvent);
    return;
  }
  drawing
    ? needDrag
      ? dragDrawingHandle.call(this, e)
      : clickDrawingHandle.call(this, e)
    : modifying
    ? modifyChosePath.call(this, e)
    : checkMouseCanOperate.call(this, e);
  this.lastMoveEvent = e;
}
function drawingPoint(e) {
  if (!this.drawing) {
    const point = getMousePoint(e);
    this._createNewPath(point, "point", false);
    this._addNewPath();
  }
}
function drawingLine(e) {
  if (!this.drawing) {
    const startPoint = getMousePoint(e);
    this._createNewPath(startPoint, "line", false);
  } else {
    const newPoint = getMousePoint(e);
    this.newPath.points.push(newPoint);
    this._addNewPath();
  }
}
function drawingPolygon(e) {
  if (!this.drawing) {
    const startPoint = getMousePoint(e);
    this._createNewPath(startPoint, "polygon", false);
  } else if (this.pathPointsCoincide) {
    this._addNewPath();
  } else {
    const newPoint = getMousePoint(e);
    this.newPath.points.push(newPoint);
  }
}
function cvsMouseClick(e) {
  e.preventDefault();
  this.$cvs.focus();
  const { drawing, needDrag, modifying } = this;
  if (
    this._isPathMax() ||
    !this._isSingleTypeAllow() ||
    (drawing && needDrag) ||
    modifying
  )
    return;
  const pos = getMousePoint(e);
  if (e.type === "contextmenu") {
    drawing &&
      (this.newPath.type === "polygon"
        ? this.newPath.points.pop()
        : this._resetNewPath());
  } else {
    const { singleType, allowTypes } = this.$opts;
    if (
      singleType &&
      clickPathTypes.includes(this.curSingleType) &&
      allowTypes.includes(this.curSingleType)
    ) {
      switch (this.curSingleType) {
        case "polygon":
          drawingPolygon.call(this, e);
          break;
        case "point":
          drawingPoint.call(this, e);
          break;
        case "line":
          drawingLine.call(this, e);
          break;
      }
    } else if (!singleType && e.shiftKey && allowTypes.includes("polygon")) {
      this.drawingPolygon(e);
    }
  }
  this._drawRoiPaths(pos);
}
function cvsMouseDown(e) {
  e.preventDefault();
  if (e.buttons >= 2) return;
  if (
    this.operateCursor &&
    (!this.operateCursor.inPath ||
      this.operateCursor.pathIndex === this.choseIndex)
  ) {
    this.modifying = true;
    this._emitEvent("modify-start", e);
    this.operateCursor.originStartPoint = getMousePoint(e);
    this.operateCursor.startPoint = getMousePoint(e);
    return;
  }
  if (
    this._isPathMax() ||
    !this._isSingleTypeAllow(true) ||
    (!this.$opts.singleType && e.shiftKey)
  )
    return;
  const type = this.curSingleType || (e.ctrlKey ? "circle" : "rect");
  if (!this.$opts.allowTypes.includes(type)) return;
  const startPoint = getMousePoint(e);
  this._createNewPath(startPoint, type);
  this._drawRoiPaths();
}
function addDragPath(endPoint) {
  const { type, points } = this.newPath;
  const startPoint = points[0];
  if (type === "rect") {
    this.newPath.points = fixRectPoints(startPoint, endPoint);
  } else if (type === "circle") {
    points.push(endPoint);
  }
  this._addNewPath();
}
function checkRoiValid(startPoint, endPoint) {
  const { tinyRectSize, tinyCircleRadius, canvasScale: cs } = this.$opts;
  const { type } = this.newPath;
  const tinyValue = type === "rect" ? tinyRectSize : tinyCircleRadius;
  return tinyValue > 0
    ? type === "rect"
      ? Math.abs(startPoint.x - endPoint.x) > tinyValue * cs &&
        Math.abs(startPoint.y - endPoint.y) > tinyValue * cs
      : countDistance(startPoint, endPoint) > tinyValue * cs
    : !checkPointsEqual(startPoint, endPoint);
}
function checkMouseInPaths(pos) {
  this.$ctx.save();
  const index = this.paths.findIndex((path) => {
    this._createCvsPath(path.type, path.points);
    const checkFn = path.type === "line" ? "isPointInStroke" : "isPointInPath";
    return this.$ctx[checkFn](pos.x, pos.y);
  });
  this.$ctx.restore();
  return index;
}
function checkPathFocus(point) {
  const choseIndex = checkMouseInPaths.call(this, point);
  !(this.$opts.ignoreInvalidSelect && choseIndex === -1) &&
    this.choosePath(choseIndex);
}
function cvsMouseUp(e) {
  const endPoint = getMousePoint(e);
  if (this.drawing && this.needDrag && this.dragging) {
    checkRoiValid.call(this, this.newPath.points[0], endPoint)
      ? addDragPath.call(
          this,
          this.newPath.type === "rect"
            ? getRectEndPoint.call(this, endPoint)
            : endPoint
        )
      : this._resetNewPath();
    return;
  }
  if (this.modifying) {
    this.modifying = false;
    !checkPointsEqual(this.operateCursor.originStartPoint, endPoint) &&
      this._emitValue("modify", this.choseIndex);
  } else if (this.$opts.readonly) {
    checkPathFocus.call(this, endPoint);
    this._drawRoiPaths();
  } else if (!e.shiftKey && (!this.$opts.singleType || !this.curSingleType)) {
    this._resetNewPath();
    checkPathFocus.call(this, endPoint);
    checkMouseCanOperate.call(this, e);
  }
}
var cvsEventHandlers = {
  keyPress,
  cvsMouseUp,
  cvsMouseDown,
  cvsMouseMove,
  cvsMouseClick,
  checkMouseCanOperate,
};

function setCtxStyles() {
  const { globalStyles, canvasScale } = this.$opts;
  if (this.$ctx)
    Object.assign(this.$ctx, globalStyles, {
      lineWidth: globalStyles.lineWidth * canvasScale,
    });
}
function createCvsPath(type, points, stroke) {
  this.$ctx.beginPath();
  switch (type) {
    case "point":
      this.$ctx.arc(
        points[0].x,
        points[0].y,
        this.$ctx.lineWidth * 1.4,
        0,
        2 * Math.PI
      );
      break;
    case "line":
    case "rect":
    case "polygon": {
      const truePoints =
        type === "rect" ? getVirtualRectPoints(points) : points;
      truePoints.forEach((point, idx) => {
        const { x, y } = point;
        idx === 0 ? this.$ctx.moveTo(x, y) : this.$ctx.lineTo(x, y);
        stroke && type === "polygon" && this.$ctx.stroke();
      });
      break;
    }
    case "circle": {
      const center = points[0];
      const radius = countDistance(center, points[1]);
      this.$ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      break;
    }
  }
  this.$ctx.closePath();
}
function clearExistRoiPath() {
  this.$ctx.clip();
  this.clearCanvas();
}
function drawNewRoiPath(path, movePoint) {
  if (!path) return;
  const { type } = path;
  const points = path.points.concat(movePoint ? [movePoint] : []);
  if (points.length < 2) return;
  this.$ctx.save();
  this.$ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  this._createCvsPath(type, points, type === "polygon");
  this.$ctx.fill();
  type !== "polygon" && this.$ctx.stroke();
  type === "polygon" && drawPointSign.call(this, points);
  this.$ctx.restore();
}
function drawExistRoiPath(path, index, stroke = true, fill = true) {
  this.$ctx.save();
  const { type, points, styles, inner } = path;
  if (!points || points.length < 1) return undefined;
  const { blurStrokeOpacity, focusStyles } = this.$opts;
  styles && Object.assign(this.$ctx, styles);
  this._createCvsPath(type, points);
  if (focusStyles) {
    index === this.choseIndex && Object.assign(this.$ctx, focusStyles);
  } else {
    this.$ctx.globalAlpha = index !== this.choseIndex ? blurStrokeOpacity : 1;
  }
  if (type === "point") {
    this.$ctx.fillStyle = this.$ctx.strokeStyle;
    this.$ctx.fill();
  } else if (fill) {
    inner ? this.$ctx.fill() : clearExistRoiPath.call(this);
  }
  type !== "point" && stroke && this.$ctx.stroke();
  !this.$opts.readonly &&
    type === "polygon" &&
    drawPointSign.call(this, points);
  !focusStyles && (this.$ctx.globalAlpha = 1);
  this.$ctx.restore();
}
function drawRoiPaths(movePoint, notClear) {
  !notClear && this.clearCanvas();
  this.hasInvertPath = this.paths.some((path) => !path.inner);
  if (this.hasInvertPath) {
    /* 如果存在反选路径，则绘制反选遮层，然后镂空所有反选选区。最后对所有选区描边及非反选填充 */
    this.$ctx.fillRect(0, 0, this.$cvs.width, this.$cvs.height);
    this.paths.forEach(
      (path, idx) => !path.inner && this._drawExistRoiPath(path, idx, false)
    );
    this.paths.forEach((path, idx) =>
      this._drawExistRoiPath(path, idx, true, path.inner)
    );
  } else {
    this.paths.forEach((path, idx) => this._drawExistRoiPath(path, idx));
  }
  this.drawing && drawNewRoiPath.call(this, this.newPath, movePoint);
}
function drawPointSign(points) {
  this.$ctx.save();
  points.forEach((point) => {
    this.$ctx.beginPath();
    this.$ctx.arc(point.x, point.y, this.$ctx.lineWidth * 1.4, 0, 2 * Math.PI);
    this.$ctx.fillStyle = this.$ctx.strokeStyle;
    this.$ctx.fill();
  });
  this.$ctx.restore();
}
function drawOpeDragPoint(point) {
  this.$ctx.save();
  this.$ctx.beginPath();
  const {
    operateCircle: { radius, styles },
    canvasScale,
  } = this.$opts;
  styles && Object.assign(this.$ctx, styles);
  this.$ctx.arc(point.x, point.y, radius * canvasScale, 0, 2 * Math.PI);
  this.$ctx.stroke();
  this.$ctx.fill();
  this.$ctx.restore();
}
function drawRoiPathsWithOpe(circlePoint) {
  this._drawRoiPaths();
  circlePoint && drawOpeDragPoint.call(this, circlePoint);
}
var cvsContextMethods = {
  setCtxStyles,
  createCvsPath,
  drawExistRoiPath,
  drawRoiPaths,
  drawRoiPathsWithOpe,
};

/// <reference types="resize-observer-browser" />
class CanvasRoi {
  constructor(elementOrSelector, options) {
    bindMethods.call(this, cvsEventHandlers);
    this._initInstanceVars();
    this.$opts = defaultOptions();
    this._mergeOptions(options);
    this._events = {
      keyup: this._keyPress.bind(this),
      click: this._cvsMouseClick.bind(this),
      mousedown: this._cvsMouseDown.bind(this),
      mousemove: this._cvsMouseMove.bind(this),
      mouseup: this._cvsMouseUp.bind(this),
      contextmenu: this._cvsMouseClick.bind(this),
    };
    elementOrSelector && this.mount(elementOrSelector);
  }
  _initInstanceVars() {
    Object.assign(this, {
      isEventsListening: false,
      drawing: false,
      needDrag: true,
      dragging: false,
      modifying: false,
      operateCursor: null,
      lastMoveEvent: null,
      newPath: {},
      value: [],
      paths: [],
      curSingleType: "",
      pathPointsCoincide: false,
      hasInvertPath: false,
      choseIndex: -1,
      resizeTicker: 0,
    });
  }
  _init() {
    const canvas = document.createElement("canvas");
    bindMethods.call(this, cvsContextMethods);
    canvas.className = "canvas-roi";
    canvas.tabIndex = 99999 * (1 + Math.random());
    canvas.style.cssText = "outline: none;transform-origin: 0 0;";
    this.$cvs = canvas;
    this.$ctx = this.$cvs.getContext("2d") || undefined;
    this.resetCanvas();
    this.$el && this.$el.appendChild(this.$cvs);
    this._addEventHandler(this.$opts.readonly);
    this.$opts.autoFit && this._initObserver();
    this._emitEvent("ready");
  }
  _initObserver() {
    if (!this.$el) return;
    this._ElObserver = new ResizeObserver(this._sizeChangeWatcher.bind(this));
    this._ElObserver.observe(this.$el);
  }
  _sizeChangeWatcher() {
    clearTimeout(this.resizeTicker);
    this.resizeTicker = window.setTimeout(() => {
      this._emitEvent("resize");
      this.resetCanvas();
    }, 50);
  }
  _autoFitChange(newValue) {
    if (newValue) {
      if (!this._ElObserver) {
        return this._initObserver();
      }
      return this._ElObserver.observe(this.$el);
    }
    return this._ElObserver.unobserve(this.$el);
  }
  _mergeOptions(options = {}) {
    if (!options) return;
    const { hasOwnProperty, toString } = Object.prototype;
    Object.keys(options).forEach((key) => {
      hasOwnProperty.call(this.$opts, key) &&
      toString.call(options[key]) === "[object Object]" &&
      this.$opts[key]
        ? Object.assign(this.$opts[key], options[key])
        : (this.$opts[key] = options[key]);
    });
    this._checkSingleType();
  }
  _emitEvent(name, ...args) {
    const callback = this.$opts[name];
    typeof callback === "function" && callback(...args);
  }
  /**
   * check methods
   */
  _checkSingleType() {
    const { allowTypes, singleType, currentType } = this.$opts;
    this.curSingleType =
      singleType &&
      allowTypes &&
      currentType &&
      allowTypes.includes(currentType)
        ? currentType
        : "";
    this.curSingleType && this._resetChooseState();
  }
  _isPathMax() {
    const { maxPath } = this.$opts;
    return maxPath && maxPath > 0 ? this.paths.length >= maxPath : false;
  }
  _isSingleTypeAllow(isDrag) {
    const types = isDrag ? dragPathTypes : clickPathTypes;
    return Boolean(
      !this.$opts.singleType ||
        (this.curSingleType && types.includes(this.curSingleType))
    );
  }
  _floatToFixed(value) {
    const { digits = 0 } = this.$opts;
    if (digits < 1) return value;
    const times = 10 ** digits;
    return Math.round(value * times) / times;
  }
  _emitValue(changeType = "add", index = 0) {
    const value = this.paths;
    this._completePathsInfo(value);
    this._emitEvent("input", this._switchCoordsScale(value));
    this._emitEvent("change", changeType, index);
  }
  _completePathsInfo(values) {
    values.forEach((path) => {
      const { type, points } = path;
      let info = {};
      if (type === "rect") {
        const fixedPoints = fixRectPoints(points[0], points[1]);
        info = {
          points: fixedPoints,
          start: this.scale(fixedPoints[0]),
          width: this.scale({ x: fixedPoints[1].x - fixedPoints[0].x, y: 0 }).x,
          height: this.scale({ x: 0, y: fixedPoints[1].y - fixedPoints[0].y })
            .y,
        };
      } else if (type === "circle") {
        const radius = countDistance(points[0], points[1]);
        info = {
          center: this.scale(points[0]),
          radius,
          scaleRadius: this.scale({ x: radius, y: 0 }).x,
        };
      }
      Object.assign(path, info);
    });
  }
  _switchCoordsScale(values, toPx) {
    const newValue = jsonClone(values);
    newValue.forEach((path) => {
      const { points } = path;
      Array.isArray(points) &&
        (path.points = points.map((point) =>
          toPx ? this.invert(point) : this.scale(point)
        ));
    });
    return newValue;
  }
  _addEventHandler(readonly) {
    Object.keys(this._events).forEach(
      (eventName) =>
        (!readonly || eventName === "mouseup") &&
        this.$cvs &&
        this.$cvs.addEventListener(eventName, this._events[eventName])
    );
    this.isEventsListening = true;
  }
  _removeEventHandler(forceAll) {
    Object.keys(this._events).forEach(
      (eventName) =>
        (forceAll || eventName !== "mouseup") &&
        this.$cvs &&
        this.$cvs.removeEventListener(eventName, this._events[eventName])
    );
    this.isEventsListening = false;
  }
  _resetNewPath() {
    Object.assign(this, {
      drawing: false,
      needDrag: false,
      dragging: false,
      newPath: {},
      pathPointsCoincide: false,
    });
  }
  _createNewPath(startPoint, type = "rect", needDrag = true) {
    this.drawing = true;
    this.needDrag = needDrag;
    Object.assign(this.newPath, { type, points: [startPoint], inner: true });
    this._emitEvent("draw-start", type, startPoint);
  }
  _addNewPath() {
    this._emitEvent("draw-end");
    this.paths.unshift(this.newPath);
    this._emitValue();
    !this.$opts.singleType && this.choosePath(0);
    this._resetNewPath();
  }
  _resetChooseState() {
    this.choosePath(-1);
  }
  _deletePath() {
    if (this.choseIndex < 0) return;
    const index = this.choseIndex;
    this.paths.splice(index, 1);
    this._resetChooseState();
    this._checkMouseCanOperate();
    this._emitValue("delete", index);
  }
  _invertChosePath() {
    const { choseIndex: idx } = this;
    idx >= 0 && (this.paths[idx].inner = !this.paths[idx].inner);
    this._emitValue("modify", idx);
  }
  // public methods
  mount(elementOrSelector) {
    const element =
      typeof elementOrSelector === "string"
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;
    if (!element) return;
    this.$el = element;
    this.$el instanceof HTMLElement
      ? this._init()
      : console.warn("the param element should be an HTMLElement");
  }
  resetOptions(options) {
    const oldAutoFit = this.$opts.autoFit;
    this._mergeOptions(options);
    options.globalStyles && this._setCtxStyles();
    (options.width !== this.$opts.width ||
      options.height !== this.$opts.height) &&
      this.resetCanvas();
    if (options.readonly) {
      this.isEventsListening && this._removeEventHandler();
    } else {
      this._addEventHandler();
    }
    this.$opts.autoFit !== oldAutoFit &&
      this._autoFitChange(this.$opts.autoFit);
    this.redrawCanvas(true);
  }
  resetCanvas() {
    if (!this.$el) return;
    const { offsetWidth, offsetHeight } = this.$el;
    const { canvasScale = 2, width: optWidth, height: optHeight } = this.$opts;
    const width = optWidth || offsetWidth;
    const height = offsetHeight || optHeight || 0;
    this.$size = { width, height };
    this.$cvsSize = {
      width: width * canvasScale,
      height: height * canvasScale,
    };
    Object.assign(this.$cvs, this.$cvsSize);
    this.$cvs &&
      Object.assign(this.$cvs.style, {
        width: `${canvasScale * 100}%`,
        height: `${canvasScale * 100}%`,
        transform: `scale(${1 / canvasScale})`,
      });
    this.setValue(this.value);
    this._setCtxStyles();
    this._drawRoiPaths();
  }
  scale(coords, useSize) {
    const { width, height } =
      useSize && this.$size ? this.$size : this.$cvsSize;
    return {
      x: this._floatToFixed(coords.x / width),
      y: this._floatToFixed(coords.y / height),
    };
  }
  invert(scaleCoords, useSize) {
    const { width, height } =
      useSize && this.$size ? this.$size : this.$cvsSize;
    return {
      x: Math.round(scaleCoords.x * width),
      y: Math.round(scaleCoords.y * height),
    };
  }
  setValue(value) {
    if (Array.isArray(value)) {
      this.value = value;
      this.paths = this._switchCoordsScale(value, true);
      this._drawRoiPaths();
    }
  }
  choosePath(index) {
    this.choseIndex = this.paths[index] ? index : -1;
    this._emitEvent("choose", this.choseIndex);
    this._drawRoiPaths();
  }
  clearCanvas() {
    this.$ctx && this.$ctx.clearRect(0, 0, this.$cvs.width, this.$cvs.height);
  }
  redrawCanvas(isClear) {
    this._drawRoiPaths(undefined, !isClear);
  }
  exportImageFromCanvas(resolve) {
    this.$cvs.toBlob((file) => {
      resolve(file ? window.URL.createObjectURL(file) : "");
    });
  }
  customDrawing(fn) {
    if (typeof fn !== "function") return;
    this.$ctx.save();
    fn.call(this, this);
    this.redrawCanvas();
    this.$ctx.restore();
  }
  destroy() {
    this._removeEventHandler();
    if (this.$el && this.$cvs) {
      this.$el.removeChild(this.$cvs);
      delete this.$ctx;
      delete this.$cvs;
    }
  }
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === "undefined") {
    return;
  }

  var head = document.head || document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  style.type = "text/css";

  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z =
  ".canvas-roi {\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  left: 0;\r\n  top: 0;\r\n  overflow: hidden;\r\n}";
styleInject(css_248z);

function getProxyMethod() {
  const proxyMethods = {};
  publicMethods.forEach((name) => {
    proxyMethods[name] = function (...args) {
      return this.callInstanceMethod(name, ...args);
    };
  });
  return proxyMethods;
}
const propTypes = optionsTypes();
const CanvasRoiComponent = vue.defineComponent({
  name: "CanvasRoi",
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Array,
      default: () => [],
    },
    ...propTypes,
  },
  emits: eventNames,
  data() {
    return {
      $_instanceId: +new Date() + Math.random(),
      $_roi: null,
      selfCurrentType: "",
    };
  },
  mounted() {
    this.$_roi = new CanvasRoi(this.$el, this.handledOptions);
    this.value && this.updateValue(this.value);
  },
  destroy() {
    this.$_roi && this.$_roi.destroy();
  },
  computed: {
    handledEvents() {
      const events = {};
      eventNames.forEach((name) => {
        events[name] = this.emitEvent.bind(this, name);
      });
      return events;
    },
    handledOptions() {
      return { ...this.$props, ...this.options, ...this.handledEvents };
    },
  },
  watch: {
    value: "updateValue",
    handledOptions: "resetVueOptions",
  },
  methods: {
    callInstanceMethod(methodName, ...args) {
      const instance = this.$_roi;
      if (
        !instance ||
        !instance[methodName] ||
        typeof instance[methodName] !== "function"
      )
        return;
      return instance[methodName](...args);
    },
    updateValue(value) {
      this.callInstanceMethod("setValue", value);
    },
    emitEvent(name, ...args) {
      const cusHandler = this.options[name] || this[name];
      typeof cusHandler === "function" && cusHandler.apply(this, args);
      this.$emit(name, ...args);
    },
    resetVueOptions(value) {
      this.callInstanceMethod("resetOptions", value);
    },
    ...getProxyMethod(),
  },
  render() {
    return vue.h(
      "div",
      {
        class: "canvas-roi",
        "data-id": this.$data.$_instanceId,
      },
      this.$slots.default
    );
  },
  install(app) {
    app.component(CanvasRoi.name, CanvasRoi);
  },
});

exports.CanvasRoi = CanvasRoi;
exports.default = CanvasRoiComponent;
exports.eventNames = eventNames;
exports.optionsTypes = optionsTypes;
exports.publicMethods = publicMethods;
