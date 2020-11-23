var publicMethods = ['mount', 'resetOptions', 'resetCanvas', 'scale', 'invert', 'setValue', 'clearCanvas', 'redrawCanvas', 'exportImageFromCanvas', 'customDrawing', 'choosePath', 'destroy'];
var eventNames = ['ready', 'input', 'change', 'choose', 'resize', 'draw-start', 'draw-end', 'modify-start'];
var clickPathTypes = ['point', 'line', 'polygon'];
var dragPathTypes = ['rect', 'circle'];

function jsonClone(value) {
    return JSON.parse(JSON.stringify(value));
}
function fixRectPoints(start, end) {
    var center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    var _a = [Math.abs(start.x - end.x), Math.abs(start.y - end.y)], width = _a[0], height = _a[1];
    return [
        { x: center.x - width / 2, y: center.y - height / 2 },
        { x: center.x + width / 2, y: center.y + height / 2 },
    ];
}
function getVirtualRectPoints(points) {
    return points.length === 2 ? [points[0], { x: points[1].x, y: points[0].y }, points[1], { x: points[0].x, y: points[1].y }] : points;
}
function countDistance(point1, point2) {
    return Math.sqrt(Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2));
}
function checkPointsEqual(oPoint, dPoint) {
    return oPoint.x === dPoint.x && oPoint.y === dPoint.y;
}
function getMousePoint(e) {
    return { x: e.offsetX, y: e.offsetY };
}
function bindMethods(methods) {
    for (var key in methods) {
        this["_" + key] = methods[key];
    }
}

var booleanType = function (value) { return ({ type: Boolean, "default": value }); };
var objectType = function (value) { return ({ type: Object, "default": function () { return (value); } }); };
var arrayType = function (value) { return ({ type: Array, "default": function () { return (value); } }); };
var numberType = function (value) { return ({ type: Number, "default": value }); };
function optionsTypes() {
    return {
        readonly: booleanType(false),
        canvasScale: numberType(2),
        globalStyles: objectType({
            lineWidth: 2,
            strokeStyle: 'rgba(14, 126, 226, 1)',
            fillStyle: 'rgba(14, 126, 226, 0.6)'
        }),
        focusStyles: objectType(null),
        operateFocusOnly: booleanType(true),
        operateCircle: objectType({
            styles: {
                fillStyle: 'rgba(255, 255, 255, 0.9)'
            },
            radius: 4
        }),
        sensitive: objectType({ line: 4, point: 3 }),
        allowTypes: arrayType(['point', 'line', 'circle', 'rect', 'polygon']),
        singleType: booleanType(false),
        currentType: { type: String, "default": '' },
        pathCanMove: booleanType(true),
        digits: numberType(3),
        distanceCheck: numberType(10),
        tinyRectSize: numberType(4),
        rectAspectRatio: numberType(0),
        tinyCircleRadius: numberType(6),
        blurStrokeOpacity: numberType(0.5),
        ignoreInvalidSelect: booleanType(false),
        rectCursors: objectType({
            side: ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'],
            corner: ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize']
        }),
        maxPath: numberType(0),
        initChoseIndex: numberType(-1),
        width: { type: Number },
        height: { type: Number },
        autoFit: booleanType(false)
    };
}
function defaultOptions() {
    var result = {};
    var typesObject = optionsTypes();
    Object.keys(typesObject).forEach(function (prop) {
        if (Object.prototype.hasOwnProperty.call(typesObject[prop], 'default')) {
            var defaultVal = typesObject[prop]["default"];
            result[prop] = typeof defaultVal === 'function' ? defaultVal() : defaultVal;
        }
    });
    return result;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function keyPress(e) {
    var key = e.key.toLowerCase();
    switch (key) {
        case 'backspace':
        case 'delete':
            this._deletePath();
            break;
        case 't':
            this._invertChosePath();
            break;
    }
}
function getRectEndPoint(truePoint) {
    var startPoint = this.newPath.points[0];
    var ratio = this.$opts.rectAspectRatio;
    return ratio > 0 ? { x: truePoint.x, y: startPoint.y + ratio * (truePoint.x - startPoint.x) } : truePoint;
}
function dragDrawingHandle(e) {
    !this.dragging && (this.dragging = !checkPointsEqual(this.newPath.points[0], getMousePoint(e)));
    var point = getMousePoint(e);
    this._drawRoiPaths(this.newPath.type === 'rect' ? getRectEndPoint.call(this, point) : point);
}
function checkPointsNearly(oPoint, dPoint, cusDistanceCheck) {
    var _a = this.$opts, distanceCheck = _a.distanceCheck, canvasScale = _a.canvasScale;
    var checkValue = cusDistanceCheck || distanceCheck;
    return typeof checkValue === 'function' ? checkValue(oPoint, dPoint) : (Math.abs(oPoint.x - dPoint.x) < checkValue * canvasScale && Math.abs(oPoint.y - dPoint.y) < checkValue * canvasScale);
}
function clickDrawingHandle(e) {
    var endPoint = getMousePoint(e);
    var points = this.newPath.points;
    this.pathPointsCoincide = false;
    if (points.length > 2) {
        var startPoint = points[0];
        if (checkPointsNearly.call(this, endPoint, startPoint)) {
            endPoint = startPoint;
            this.pathPointsCoincide = true;
        }
    }
    this._drawRoiPaths(endPoint);
}
function polygonAddPoint(points, point, lineIndex) {
    points.splice(lineIndex + 1, 0, point);
    Object.assign(this.operateCursor, { pointIndex: lineIndex + 1, lineIndex: -1 });
}
function modifyChosePath(e) {
    var newPoint = getMousePoint(e);
    var _a = this.operateCursor || {}, startPoint = _a.startPoint, pathIndex = _a.pathIndex, pointIndex = _a.pointIndex, lineIndex = _a.lineIndex, inPath = _a.inPath;
    if (!this.paths[pathIndex])
        return;
    var _b = this.paths[pathIndex], type = _b.type, points = _b.points;
    if (!inPath && type === 'circle') {
        points[1] = newPoint;
        this._drawRoiPathsWithOpe(newPoint);
        return;
    }
    var distance = [newPoint.x - startPoint.x, newPoint.y - startPoint.y];
    this.operateCursor.startPoint = newPoint;
    var isRect = type === 'rect';
    var pointMove = function (point, xStatic, yStatic) {
        !xStatic && (point.x += distance[0]);
        !yStatic && (point.y += distance[1]);
    };
    if (inPath) {
        points.forEach(function (point) { return pointMove(point); });
        this._drawRoiPaths();
        return;
    }
    if (pointIndex >= 0) {
        var rectPointsMove = function (idx) {
            if (idx === 1) {
                points[0].y += distance[1];
                points[1].x += distance[0];
            }
            else if (idx === 3) {
                points[0].x += distance[0];
                points[1].y += distance[1];
            }
            else {
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
    var length = points.length;
    var _a = this.$opts, canvasScale = _a.canvasScale, point = _a.sensitive.point;
    for (var i = 0; i < length; i += 1) {
        var start = points[i];
        var end = points[(i + 1) % length];
        var pointSen = point * canvasScale;
        var nearCorer = checkPointsNearly.call(this, start, ckPoint, pointSen)
            ? i
            : (checkPointsNearly.call(this, end, ckPoint, pointSen) ? (i + 1) : -1);
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
    var type = path.type, points = path.points;
    var _a = this.$opts, canvasScale = _a.canvasScale, line = _a.sensitive.line, pathCanMove = _a.pathCanMove;
    this.$ctx.save();
    this.$ctx.lineWidth = line * canvasScale;
    var result = false;
    if (type === 'rect' || type === 'polygon') {
        var checkPoints = type === 'rect' ? getVirtualRectPoints(points) : points;
        var info = checkPointLocalInPath.call(this, checkPoints, point);
        info && (result = true) && (this.operateCursor = __assign({ pathType: type, pathIndex: idx }, info));
    }
    else if (type === 'circle') {
        this._createCvsPath(type, points);
        result = this.$ctx.isPointInStroke(point.x, point.y);
        result && (this.operateCursor = { pathType: 'circle', pathIndex: idx });
    }
    if (pathCanMove && checkInPath) {
        this._createCvsPath(type, points);
        var checkFn = type === 'line' ? 'isPointInStroke' : 'isPointInPath';
        result = this.$ctx[checkFn](point.x, point.y);
        result && (this.operateCursor = { pathType: type, pathIndex: idx, inPath: true });
    }
    this.$ctx.restore();
    return result;
}
function checkMouseCanOperate(e) {
    var _this = this;
    var point = e ? getMousePoint(e) : null;
    this.operateCursor = null;
    this.$cvs.style.cursor = 'inherit';
    var _a = this, paths = _a.paths, choseIndex = _a.choseIndex, operateFocusOnly = _a.$opts.operateFocusOnly;
    if (operateFocusOnly) {
        if (paths[choseIndex]) {
            getMousePosition.call(this, paths[choseIndex], point, choseIndex);
            !this.operateCursor && getMousePosition.call(this, paths[choseIndex], point, choseIndex, true);
        }
    }
    else {
        this.paths.some(function (path, idx) { return getMousePosition.call(_this, path, point, idx); });
        !this.operateCursor && this.paths.some(function (path, idx) { return getMousePosition.call(_this, path, point, idx, true); });
    }
    var drawOpeCircle = false;
    if (this.operateCursor) {
        var _b = this.operateCursor, pathType = _b.pathType, lineIndex = _b.lineIndex, pointIndex = _b.pointIndex, inPath = _b.inPath, pathIndex = _b.pathIndex;
        if (!inPath && pathType === 'rect') {
            var _c = this.$opts.rectCursors, side = _c.side, corner = _c.corner;
            this.$cvs.style.cursor = pointIndex > -1 ? corner[pointIndex] : side[lineIndex];
        }
        else if (inPath) {
            (pathIndex === choseIndex) && (this.$cvs.style.cursor = 'move');
        }
        else {
            drawOpeCircle = true;
        }
    }
    this._drawRoiPathsWithOpe(drawOpeCircle && point);
}
function cvsMouseMove(e) {
    var _a = this, drawing = _a.drawing, needDrag = _a.needDrag, dragging = _a.dragging, modifying = _a.modifying, lastMoveEvent = _a.lastMoveEvent;
    if (((drawing && needDrag && dragging) || modifying) && e.buttons !== 1) {
        this.cvsMouseUp(lastMoveEvent);
        return;
    }
    drawing
        ? (needDrag ? dragDrawingHandle.call(this, e) : clickDrawingHandle.call(this, e))
        : modifying ? modifyChosePath.call(this, e) : checkMouseCanOperate.call(this, e);
    this.lastMoveEvent = e;
}
function drawingPoint(e) {
    if (!this.drawing) {
        var point = getMousePoint(e);
        this._createNewPath(point, 'point', false);
        this._addNewPath();
    }
}
function drawingLine(e) {
    if (!this.drawing) {
        var startPoint = getMousePoint(e);
        this._createNewPath(startPoint, 'line', false);
    }
    else {
        var newPoint = getMousePoint(e);
        this.newPath.points.push(newPoint);
        this._addNewPath();
    }
}
function drawingPolygon(e) {
    if (!this.drawing) {
        var startPoint = getMousePoint(e);
        this._createNewPath(startPoint, 'polygon', false);
    }
    else if (this.pathPointsCoincide) {
        this._addNewPath();
    }
    else {
        var newPoint = getMousePoint(e);
        this.newPath.points.push(newPoint);
    }
}
function cvsMouseClick(e) {
    e.preventDefault();
    this.$cvs.focus();
    var _a = this, drawing = _a.drawing, needDrag = _a.needDrag, modifying = _a.modifying;
    if (this._isPathMax() || !this._isSingleTypeAllow() || ((drawing && needDrag) || modifying))
        return;
    var pos = getMousePoint(e);
    if (e.type === 'contextmenu') {
        drawing && (this.newPath.type === 'polygon' ? this.newPath.points.pop() : this._resetNewPath());
    }
    else {
        var _b = this.$opts, singleType = _b.singleType, allowTypes = _b.allowTypes;
        if (singleType && clickPathTypes.includes(this.curSingleType) && allowTypes.includes(this.curSingleType)) {
            switch (this.curSingleType) {
                case 'polygon':
                    drawingPolygon.call(this, e);
                    break;
                case 'point':
                    drawingPoint.call(this, e);
                    break;
                case 'line':
                    drawingLine.call(this, e);
                    break;
            }
        }
        else if (!singleType && e.shiftKey && allowTypes.includes('polygon')) {
            this.drawingPolygon(e);
        }
    }
    this._drawRoiPaths(pos);
}
function cvsMouseDown(e) {
    e.preventDefault();
    if (e.buttons >= 2)
        return;
    if (this.operateCursor && (!this.operateCursor.inPath || this.operateCursor.pathIndex === this.choseIndex)) {
        this.modifying = true;
        this._emitEvent('modify-start', e);
        this.operateCursor.originStartPoint = getMousePoint(e);
        this.operateCursor.startPoint = getMousePoint(e);
        return;
    }
    if (this._isPathMax() || !this._isSingleTypeAllow(true) || (!this.$opts.singleType && e.shiftKey))
        return;
    var type = this.curSingleType || (e.ctrlKey ? 'circle' : 'rect');
    if (!this.$opts.allowTypes.includes(type))
        return;
    var startPoint = getMousePoint(e);
    this._createNewPath(startPoint, type);
    this._drawRoiPaths();
}
function addDragPath(endPoint) {
    var _a = this.newPath, type = _a.type, points = _a.points;
    var startPoint = points[0];
    if (type === 'rect') {
        this.newPath.points = fixRectPoints(startPoint, endPoint);
    }
    else if (type === 'circle') {
        points.push(endPoint);
    }
    this._addNewPath();
}
function checkRoiValid(startPoint, endPoint) {
    var _a = this.$opts, tinyRectSize = _a.tinyRectSize, tinyCircleRadius = _a.tinyCircleRadius, cs = _a.canvasScale;
    var type = this.newPath.type;
    var tinyValue = type === 'rect' ? tinyRectSize : tinyCircleRadius;
    return tinyValue > 0
        ? (type === 'rect'
            ? Math.abs(startPoint.x - endPoint.x) > tinyValue * cs && Math.abs(startPoint.y - endPoint.y) > tinyValue * cs
            : countDistance(startPoint, endPoint) > tinyValue * cs)
        : !checkPointsEqual(startPoint, endPoint);
}
function checkMouseInPaths(pos) {
    var _this = this;
    this.$ctx.save();
    var index = this.paths.findIndex(function (path) {
        _this._createCvsPath(path.type, path.points);
        var checkFn = path.type === 'line' ? 'isPointInStroke' : 'isPointInPath';
        return _this.$ctx[checkFn](pos.x, pos.y);
    });
    this.$ctx.restore();
    return index;
}
function checkPathFocus(point) {
    var choseIndex = checkMouseInPaths.call(this, point);
    !(this.$opts.ignoreInvalidSelect && choseIndex === -1) && this.choosePath(choseIndex);
}
function cvsMouseUp(e) {
    var endPoint = getMousePoint(e);
    if (this.drawing && this.needDrag && this.dragging) {
        checkRoiValid.call(this, this.newPath.points[0], endPoint)
            ? addDragPath.call(this, this.newPath.type === 'rect' ? getRectEndPoint.call(this, endPoint) : endPoint)
            : this._resetNewPath();
        return;
    }
    if (this.modifying) {
        this.modifying = false;
        !checkPointsEqual(this.operateCursor.originStartPoint, endPoint) && this._emitValue('modify', this.choseIndex);
    }
    else if (this.$opts.readonly) {
        checkPathFocus.call(this, endPoint);
        this._drawRoiPaths();
    }
    else if (!e.shiftKey && (!this.$opts.singleType || !this.curSingleType)) {
        this._resetNewPath();
        checkPathFocus.call(this, endPoint);
        checkMouseCanOperate.call(this, e);
    }
}
var cvsEventHandlers = {
    keyPress: keyPress,
    cvsMouseUp: cvsMouseUp,
    cvsMouseDown: cvsMouseDown,
    cvsMouseMove: cvsMouseMove,
    cvsMouseClick: cvsMouseClick,
    checkMouseCanOperate: checkMouseCanOperate
};

function setCtxStyles() {
    var _a = this.$opts, globalStyles = _a.globalStyles, canvasScale = _a.canvasScale;
    if (this.$ctx)
        Object.assign(this.$ctx, globalStyles, { lineWidth: globalStyles.lineWidth * canvasScale });
}
function createCvsPath(type, points, stroke) {
    var _this = this;
    this.$ctx.beginPath();
    switch (type) {
        case 'point':
            this.$ctx.arc(points[0].x, points[0].y, this.$ctx.lineWidth * 1.4, 0, 2 * Math.PI);
            break;
        case 'line':
        case 'rect':
        case 'polygon': {
            var truePoints = (type === 'rect') ? getVirtualRectPoints(points) : points;
            truePoints.forEach(function (point, idx) {
                var x = point.x, y = point.y;
                idx === 0 ? _this.$ctx.moveTo(x, y) : _this.$ctx.lineTo(x, y);
                stroke && type === 'polygon' && _this.$ctx.stroke();
            });
            break;
        }
        case 'circle': {
            var center = points[0];
            var radius = countDistance(center, points[1]);
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
    if (!path)
        return;
    var type = path.type;
    var points = path.points.concat(movePoint ? [movePoint] : []);
    if (points.length < 2)
        return;
    this.$ctx.save();
    this.$ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this._createCvsPath(type, points, type === 'polygon');
    this.$ctx.fill();
    type !== 'polygon' && this.$ctx.stroke();
    type === 'polygon' && drawPointSign.call(this, points);
    this.$ctx.restore();
}
function drawExistRoiPath(path, index, stroke, fill) {
    if (stroke === void 0) { stroke = true; }
    if (fill === void 0) { fill = true; }
    this.$ctx.save();
    var type = path.type, points = path.points, styles = path.styles, inner = path.inner;
    if (!points || points.length < 1)
        return undefined;
    var _a = this.$opts, blurStrokeOpacity = _a.blurStrokeOpacity, focusStyles = _a.focusStyles;
    styles && Object.assign(this.$ctx, styles);
    this._createCvsPath(type, points);
    if (focusStyles) {
        index === this.choseIndex && Object.assign(this.$ctx, focusStyles);
    }
    else {
        this.$ctx.globalAlpha = index !== this.choseIndex ? blurStrokeOpacity : 1;
    }
    if (type === 'point') {
        this.$ctx.fillStyle = this.$ctx.strokeStyle;
        this.$ctx.fill();
    }
    else if (fill) {
        inner ? this.$ctx.fill() : clearExistRoiPath.call(this);
    }
    type !== 'point' && stroke && this.$ctx.stroke();
    !this.$opts.readonly && type === 'polygon' && drawPointSign.call(this, points);
    !focusStyles && (this.$ctx.globalAlpha = 1);
    this.$ctx.restore();
}
function drawRoiPaths(movePoint, notClear) {
    var _this = this;
    !notClear && this.clearCanvas();
    this.hasInvertPath = this.paths.some(function (path) { return !path.inner; });
    if (this.hasInvertPath) {
        /* 如果存在反选路径，则绘制反选遮层，然后镂空所有反选选区。最后对所有选区描边及非反选填充 */
        this.$ctx.fillRect(0, 0, this.$cvs.width, this.$cvs.height);
        this.paths.forEach(function (path, idx) { return !path.inner && _this._drawExistRoiPath(path, idx, false); });
        this.paths.forEach(function (path, idx) { return _this._drawExistRoiPath(path, idx, true, path.inner); });
    }
    else {
        this.paths.forEach(function (path, idx) { return _this._drawExistRoiPath(path, idx); });
    }
    this.drawing && drawNewRoiPath.call(this, this.newPath, movePoint);
}
function drawPointSign(points) {
    var _this = this;
    this.$ctx.save();
    points.forEach(function (point) {
        _this.$ctx.beginPath();
        _this.$ctx.arc(point.x, point.y, _this.$ctx.lineWidth * 1.4, 0, 2 * Math.PI);
        _this.$ctx.fillStyle = _this.$ctx.strokeStyle;
        _this.$ctx.fill();
    });
    this.$ctx.restore();
}
function drawOpeDragPoint(point) {
    this.$ctx.save();
    this.$ctx.beginPath();
    var _a = this.$opts, _b = _a.operateCircle, radius = _b.radius, styles = _b.styles, canvasScale = _a.canvasScale;
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
    setCtxStyles: setCtxStyles,
    createCvsPath: createCvsPath,
    drawExistRoiPath: drawExistRoiPath,
    drawRoiPaths: drawRoiPaths,
    drawRoiPathsWithOpe: drawRoiPathsWithOpe
};

/// <reference types="resize-observer-browser" />
var CanvasRoi = /** @class */ (function () {
    function CanvasRoi(elementOrSelector, options) {
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
            contextmenu: this._cvsMouseClick.bind(this)
        };
        elementOrSelector && this.mount(elementOrSelector);
    }
    CanvasRoi.prototype._initInstanceVars = function () {
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
            curSingleType: '',
            pathPointsCoincide: false,
            hasInvertPath: false,
            choseIndex: -1,
            resizeTicker: 0
        });
    };
    CanvasRoi.prototype._init = function () {
        var canvas = document.createElement('canvas');
        if (canvas.getContext) {
            bindMethods.call(this, cvsContextMethods);
            canvas.className = 'canvas-roi';
            canvas.tabIndex = 99999 * (1 + Math.random());
            canvas.style.cssText = 'outline: none;transform-origin: 0 0;';
            this.$cvs = canvas;
            this.$ctx = this.$cvs.getContext('2d');
            this.resetCanvas();
            this.$el.appendChild(this.$cvs);
            this._addEventHandler(this.$opts.readonly);
            this.$opts.autoFit && this._initObserver();
            this._emitEvent('ready');
        }
    };
    CanvasRoi.prototype._initObserver = function () {
        if (!this.$el)
            return;
        this._ElObserver = new ResizeObserver(this._sizeChangeWatcher.bind(this));
        this._ElObserver.observe(this.$el);
    };
    CanvasRoi.prototype._sizeChangeWatcher = function () {
        var _this = this;
        clearTimeout(this.resizeTicker);
        this.resizeTicker = window.setTimeout(function () {
            _this._emitEvent('resize');
            _this.resetCanvas();
        }, 50);
    };
    CanvasRoi.prototype._autoFitChange = function (newValue) {
        if (newValue) {
            if (!this._ElObserver) {
                return this._initObserver();
            }
            return this._ElObserver.observe(this.$el);
        }
        return this._ElObserver.unobserve(this.$el);
    };
    CanvasRoi.prototype._mergeOptions = function (options) {
        var _this = this;
        if (!options)
            return;
        var _a = Object.prototype, hasOwnProperty = _a.hasOwnProperty, toString = _a.toString;
        Object.keys(options).forEach(function (key) {
            hasOwnProperty.call(_this.$opts, key) && toString.call(options[key]) === '[object Object]' && _this.$opts[key]
                ? Object.assign(_this.$opts[key], options[key])
                : (_this.$opts[key] = options[key]);
        });
        this._checkSingleType();
    };
    CanvasRoi.prototype._emitEvent = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var callback = this.$opts[name];
        typeof callback === 'function' && callback.apply(void 0, args);
    };
    /**
     * check methods
     */
    CanvasRoi.prototype._checkSingleType = function () {
        var _a = this.$opts, allowTypes = _a.allowTypes, singleType = _a.singleType, currentType = _a.currentType;
        this.curSingleType = singleType && allowTypes.includes(currentType) ? currentType : '';
        this.curSingleType && this._resetChooseState();
    };
    CanvasRoi.prototype._isPathMax = function () {
        return this.$opts.maxPath > 0 ? (this.paths.length >= this.$opts.maxPath) : false;
    };
    CanvasRoi.prototype._isSingleTypeAllow = function (isDrag) {
        var types = isDrag ? dragPathTypes : clickPathTypes;
        return !this.$opts.singleType || (this.curSingleType && types.includes(this.curSingleType));
    };
    CanvasRoi.prototype._floatToFixed = function (value) {
        var digits = this.$opts.digits;
        if (digits < 1)
            return value;
        var times = Math.pow(10, digits);
        return Math.round(value * times) / times;
    };
    CanvasRoi.prototype._emitValue = function (changeType, index) {
        if (changeType === void 0) { changeType = 'add'; }
        if (index === void 0) { index = 0; }
        var value = this.paths;
        this._completePathsInfo(value);
        this._emitEvent('input', this._switchCoordsScale(value));
        this._emitEvent('change', changeType, index);
    };
    CanvasRoi.prototype._completePathsInfo = function (values) {
        var _this = this;
        values.forEach(function (path) {
            var type = path.type, points = path.points;
            var info = {};
            if (type === 'rect') {
                var fixedPoints = fixRectPoints(points[0], points[1]);
                info = {
                    points: fixedPoints,
                    start: _this.scale(fixedPoints[0]),
                    width: _this.scale({ x: fixedPoints[1].x - fixedPoints[0].x, y: 0 }).x,
                    height: _this.scale({ x: 0, y: fixedPoints[1].y - fixedPoints[0].y }).y
                };
            }
            else if (type === 'circle') {
                var radius = countDistance(points[0], points[1]);
                info = {
                    center: _this.scale(points[0]),
                    radius: radius,
                    scaleRadius: _this.scale({ x: radius, y: 0 }).x
                };
            }
            Object.assign(path, info);
        });
    };
    CanvasRoi.prototype._switchCoordsScale = function (values, toPx) {
        var _this = this;
        var newValue = jsonClone(values);
        newValue.forEach(function (path) {
            var points = path.points;
            Array.isArray(points)
                && (path.points = points.map(function (point) { return (toPx ? _this.invert(point) : _this.scale(point)); }));
        });
        return newValue;
    };
    CanvasRoi.prototype._addEventHandler = function (readonly) {
        var _this = this;
        Object.keys(this._events).forEach(function (eventName) { return (!readonly || eventName === 'mouseup') && _this.$cvs.addEventListener(eventName, _this._events[eventName]); });
        this.isEventsListening = true;
    };
    CanvasRoi.prototype._removeEventHandler = function (forceAll) {
        var _this = this;
        Object.keys(this._events).forEach(function (eventName) { return (forceAll || eventName !== 'mouseup') && _this.$cvs.removeEventListener(eventName, _this._events[eventName]); });
        this.isEventsListening = false;
    };
    CanvasRoi.prototype._resetNewPath = function () {
        Object.assign(this, {
            drawing: false,
            needDrag: false,
            dragging: false,
            newPath: {},
            pathPointsCoincide: false
        });
    };
    CanvasRoi.prototype._createNewPath = function (startPoint, type, needDrag) {
        if (type === void 0) { type = 'rect'; }
        if (needDrag === void 0) { needDrag = true; }
        this.drawing = true;
        this.needDrag = needDrag;
        Object.assign(this.newPath, { type: type, points: [startPoint], inner: true });
        this._emitEvent('draw-start', type, startPoint);
    };
    CanvasRoi.prototype._addNewPath = function () {
        this._emitEvent('draw-end');
        this.paths.unshift(this.newPath);
        this._emitValue();
        !this.$opts.singleType && this.choosePath(0);
        this._resetNewPath();
    };
    CanvasRoi.prototype._resetChooseState = function () {
        this.choosePath(-1);
    };
    CanvasRoi.prototype._deletePath = function () {
        if (this.choseIndex < 0)
            return;
        var index = this.choseIndex;
        this.paths.splice(index, 1);
        this._resetChooseState();
        this._checkMouseCanOperate();
        this._emitValue('delete', index);
    };
    CanvasRoi.prototype._invertChosePath = function () {
        var idx = this.choseIndex;
        idx >= 0 && (this.paths[idx].inner = !this.paths[idx].inner);
        this._emitValue('modify', idx);
    };
    // public methods
    CanvasRoi.prototype.mount = function (elementOrSelector) {
        this.$el = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
        this.$el instanceof HTMLElement ? this._init() : console.warn('the param element should be an HTMLElement');
    };
    CanvasRoi.prototype.resetOptions = function (options) {
        var oldAutoFit = this.$opts.autoFit;
        this._mergeOptions(options);
        options.globalStyles && this._setCtxStyles();
        (options.width !== this.$opts.width || options.height !== this.$opts.height) && this.resetCanvas();
        if (options.readonly) {
            this.isEventsListening && this._removeEventHandler();
        }
        else {
            this._addEventHandler();
        }
        this.$opts.autoFit !== oldAutoFit && this._autoFitChange(this.$opts.autoFit);
        this.redrawCanvas(true);
    };
    CanvasRoi.prototype.resetCanvas = function () {
        var _a = this.$el, offsetWidth = _a.offsetWidth, offsetHeight = _a.offsetHeight;
        var _b = this.$opts, canvasScale = _b.canvasScale, optWidth = _b.width, optHeight = _b.height;
        var width = optWidth || offsetWidth;
        var height = offsetHeight || optHeight;
        this.$size = { width: width, height: height };
        this.$cvsSize = { width: width * canvasScale, height: height * canvasScale };
        Object.assign(this.$cvs, this.$cvsSize);
        Object.assign(this.$cvs.style, { width: canvasScale * 100 + "%", height: canvasScale * 100 + "%", transform: "scale(" + 1 / canvasScale + ")" });
        this.setValue(this.value);
        this._setCtxStyles();
        this._drawRoiPaths();
    };
    CanvasRoi.prototype.scale = function (coords, useSize) {
        var _a = useSize ? this.$size : this.$cvsSize, width = _a.width, height = _a.height;
        return { x: this._floatToFixed(coords.x / width), y: this._floatToFixed(coords.y / height) };
    };
    CanvasRoi.prototype.invert = function (scaleCoords, useSize) {
        var _a = useSize ? this.$size : this.$cvsSize, width = _a.width, height = _a.height;
        return { x: Math.round(scaleCoords.x * width), y: Math.round(scaleCoords.y * height) };
    };
    CanvasRoi.prototype.setValue = function (value) {
        if (Array.isArray(value)) {
            this.value = value;
            this.paths = this._switchCoordsScale(value, true);
            this._drawRoiPaths();
        }
    };
    CanvasRoi.prototype.choosePath = function (index) {
        this.choseIndex = this.paths[index] ? index : -1;
        this._emitEvent('choose', this.choseIndex);
        this._drawRoiPaths();
    };
    CanvasRoi.prototype.clearCanvas = function () {
        this.$ctx && this.$ctx.clearRect(0, 0, this.$cvs.width, this.$cvs.height);
    };
    CanvasRoi.prototype.redrawCanvas = function (isClear) {
        this._drawRoiPaths(null, !isClear);
    };
    CanvasRoi.prototype.exportImageFromCanvas = function (resolve) {
        this.$cvs.toBlob(function (file) {
            resolve(file ? window.URL.createObjectURL(file) : '');
        });
    };
    CanvasRoi.prototype.customDrawing = function (fn) {
        if (typeof fn !== 'function')
            return;
        this.$ctx.save();
        fn.call(this, this);
        this.redrawCanvas();
        this.$ctx.restore();
    };
    CanvasRoi.prototype.destroy = function () {
        this._removeEventHandler();
        this.$el.removeChild(this.$cvs);
        delete this.$ctx;
        delete this.$cvs;
    };
    return CanvasRoi;
}());

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
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

var css_248z = ".canvas-roi {\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  left: 0;\r\n  top: 0;\r\n  overflow: hidden;\r\n}";
styleInject(css_248z);

function getProxyMethod() {
    var proxyMethods = {};
    publicMethods.forEach(function (name) {
        proxyMethods[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return this.callInstanceMethod.apply(this, __spreadArrays([name], args));
        };
    });
    return proxyMethods;
}
var propTypes = optionsTypes();
var CanvasRoiComponent = {
    name: 'CanvasRoi',
    props: __assign({ options: {
            type: Object,
            "default": function () { return ({}); }
        }, value: {
            type: Array,
            "default": function () { return ([]); }
        } }, propTypes),
    data: function () {
        var $roi = null;
        return {
            $instanceId: +new Date() + Math.random(),
            $roi: $roi,
            selfCurrentType: ''
        };
    },
    mounted: function () {
        this.$roi = new CanvasRoi(this.$el, this.handledOptions);
        this.value && this.updateValue(this.value);
    },
    destroy: function () {
        this.$roi && this.$roi.destroy();
    },
    computed: {
        handledEvents: function () {
            var _this = this;
            var events = {};
            eventNames.forEach(function (name) {
                events[name] = _this.emitEvent.bind(_this, name);
            });
            return events;
        },
        handledOptions: function () {
            return __assign(__assign(__assign({}, this.$props), this.options), this.handledEvents);
        }
    },
    watch: {
        value: 'updateValue',
        handledOptions: 'resetVueOptions'
    },
    methods: __assign({ callInstanceMethod: function (methodName) {
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return this.$roi ? (_a = this.$roi)[methodName].apply(_a, args) : undefined;
        },
        updateValue: function (value) {
            this.callInstanceMethod('setValue', value);
        },
        emitEvent: function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var cusHandler = this.options[name] || this[name];
            typeof cusHandler === 'function' && cusHandler.apply(this, args);
            this.$emit.apply(this, __spreadArrays([name], args));
        },
        resetVueOptions: function (value) {
            this.callInstanceMethod('resetOptions', value);
        } }, getProxyMethod()),
    render: function (h) {
        return h('div', {
            "class": 'canvas-roi',
            attrs: {
                'data-id': this.$instanceId
            }
        }, this.$slots["default"]);
    },
    install: function (Vue) {
        Vue.component(CanvasRoi.name, CanvasRoi);
    }
};

export default CanvasRoiComponent;
export { CanvasRoi, eventNames, optionsTypes, publicMethods };
