!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? e(exports, require("vue"))
    : "function" == typeof define && define.amd
    ? define(["exports", "vue"], e)
    : e(
        ((t =
          "undefined" != typeof globalThis
            ? globalThis
            : t || self).CanvasRoi = {}),
        t.vue
      );
})(this, function (t, e) {
  "use strict";
  const s = [
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
    ],
    i = [
      "ready",
      "input",
      "change",
      "choose",
      "resize",
      "draw-start",
      "draw-end",
      "modify-start",
    ],
    n = ["point", "line", "polygon"],
    h = ["rect", "circle"];
  function o(t, e) {
    const s = (t.x + e.x) / 2,
      i = (t.y + e.y) / 2,
      [n, h] = [Math.abs(t.x - e.x), Math.abs(t.y - e.y)];
    return [
      { x: s - n / 2, y: i - h / 2 },
      { x: s + n / 2, y: i + h / 2 },
    ];
  }
  function a(t) {
    return 2 === t.length
      ? [t[0], { x: t[1].x, y: t[0].y }, t[1], { x: t[0].x, y: t[1].y }]
      : t;
  }
  function r(t, e) {
    return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
  }
  function c(t, e) {
    return t.x === e.x && t.y === e.y;
  }
  function l(t) {
    return { x: t.offsetX, y: t.offsetY };
  }
  function p(t) {
    for (const e in t) this["_" + e] = t[e];
  }
  const d = (t) => ({ type: Boolean, default: t }),
    u = (t) => ({ type: Object, default: () => t }),
    y = (t) => ({ type: Number, default: t });
  function f() {
    return {
      readonly: d(!1),
      canvasScale: y(2),
      globalStyles: u({
        lineWidth: 2,
        strokeStyle: "rgba(14, 126, 226, 1)",
        fillStyle: "rgba(14, 126, 226, 0.6)",
      }),
      focusStyles: u(null),
      operateFocusOnly: d(!0),
      operateCircle: u({
        styles: { fillStyle: "rgba(255, 255, 255, 0.9)" },
        radius: 4,
      }),
      sensitive: u({ line: 4, point: 3 }),
      allowTypes:
        ((t = ["point", "line", "circle", "rect", "polygon"]),
        { type: Array, default: () => t }),
      singleType: d(!1),
      currentType: { type: String, default: "" },
      pathCanMove: d(!0),
      digits: y(3),
      distanceCheck: y(10),
      tinyRectSize: y(4),
      rectAspectRatio: y(0),
      tinyCircleRadius: y(6),
      blurStrokeOpacity: y(0.5),
      ignoreInvalidSelect: d(!1),
      rectCursors: u({
        side: ["ns-resize", "ew-resize", "ns-resize", "ew-resize"],
        corner: ["nw-resize", "ne-resize", "se-resize", "sw-resize"],
      }),
      maxPath: y(0),
      initChoseIndex: y(-1),
      width: { type: Number },
      height: { type: Number },
      autoFit: d(!1),
    };
    var t;
  }
  function v(t) {
    const [e] = this.newPath.points,
      { rectAspectRatio: s } = this.$opts;
    return s > 0 ? { x: t.x, y: e.y + s * (t.x - e.x) } : t;
  }
  function x(t) {
    !this.dragging && (this.dragging = !c(this.newPath.points[0], l(t)));
    const e = l(t);
    this._drawRoiPaths("rect" === this.newPath.type ? v.call(this, e) : e);
  }
  function g(t, e, s) {
    const { distanceCheck: i, canvasScale: n } = this.$opts,
      h = s || i;
    return "function" == typeof h
      ? h(t, e)
      : Math.abs(t.x - e.x) < h * n && Math.abs(t.y - e.y) < h * n;
  }
  function $(t) {
    let e = l(t);
    const { points: s } = this.newPath;
    if (((this.pathPointsCoincide = !1), s.length > 2)) {
      const t = s[0];
      g.call(this, e, t) && ((e = t), (this.pathPointsCoincide = !0));
    }
    this._drawRoiPaths(e);
  }
  function _(t, e, s) {
    t.splice(s + 1, 0, e),
      Object.assign(this.operateCursor, { pointIndex: s + 1, lineIndex: -1 });
  }
  function w(t) {
    const e = l(t),
      { startPoint: s, pathIndex: i, pointIndex: n, lineIndex: h, inPath: o } =
        this.operateCursor || {};
    if (!this.paths[i]) return;
    const { type: a, points: r } = this.paths[i];
    if (!o && "circle" === a)
      return (r[1] = e), void this._drawRoiPathsWithOpe(e);
    const c = [e.x - s.x, e.y - s.y];
    this.operateCursor.startPoint = e;
    const p = "rect" === a,
      d = (t, e, s) => {
        !e && (t.x += c[0]), !s && (t.y += c[1]);
      };
    if (o) return r.forEach((t) => d(t)), void this._drawRoiPaths();
    if (n >= 0) {
      const t = (t) => {
        1 === t
          ? ((r[0].y += c[1]), (r[1].x += c[0]))
          : 3 === t
          ? ((r[0].x += c[0]), (r[1].y += c[1]))
          : d(r[t / 2]);
      };
      return p ? t(n) : d(r[n]), void this._drawRoiPathsWithOpe(!p && e);
    }
    h >= 0 &&
      (p
        ? h % 3 == 0
          ? d(r[0], 0 === h, 3 === h)
          : d(r[1], 2 === h, 1 === h)
        : _.call(this, r, e, h),
      this._drawRoiPathsWithOpe(!p && e));
  }
  function P(t, e) {
    const { length: s } = t,
      {
        canvasScale: i,
        sensitive: { point: n },
      } = this.$opts;
    for (let h = 0; h < s; h += 1) {
      const o = t[h],
        a = t[(h + 1) % s],
        r = n * i,
        c = g.call(this, o, e, r) ? h : g.call(this, a, e, r) ? h + 1 : -1;
      if (c > -1) return { pointIndex: c };
      if (
        (this.$ctx.beginPath(),
        this.$ctx.moveTo(o.x, o.y),
        this.$ctx.lineTo(a.x, a.y),
        this.$ctx.closePath(),
        this.$ctx.isPointInStroke(e.x, e.y))
      )
        return { lineIndex: h };
    }
    return null;
  }
  function m(t, e, s, i) {
    const { type: n, points: h } = t,
      {
        canvasScale: o,
        sensitive: { line: r },
        pathCanMove: c,
      } = this.$opts;
    this.$ctx.save(), (this.$ctx.lineWidth = r * o);
    let l = !1;
    if ("rect" === n || "polygon" === n) {
      const t = "rect" === n ? a(h) : h,
        i = P.call(this, t, e);
      i &&
        (l = !0) &&
        (this.operateCursor = { pathType: n, pathIndex: s, ...i });
    } else "circle" === n && (this._createCvsPath(n, h), (l = this.$ctx.isPointInStroke(e.x, e.y)), l && (this.operateCursor = { pathType: "circle", pathIndex: s }));
    if (c && i) {
      this._createCvsPath(n, h);
      const t = "line" === n ? "isPointInStroke" : "isPointInPath";
      (l = this.$ctx[t](e.x, e.y)),
        l && (this.operateCursor = { pathType: n, pathIndex: s, inPath: !0 });
    }
    return this.$ctx.restore(), l;
  }
  function C(t) {
    const e = t ? l(t) : void 0;
    if (!e) return;
    (this.operateCursor = null), (this.$cvs.style.cursor = "inherit");
    const {
      paths: s,
      choseIndex: i,
      $opts: { operateFocusOnly: n },
    } = this;
    n
      ? s[i] &&
        (m.call(this, s[i], e, i),
        !this.operateCursor && m.call(this, s[i], e, i, !0))
      : (this.paths.some((t, s) => m.call(this, t, e, s)),
        !this.operateCursor &&
          this.paths.some((t, s) => m.call(this, t, e, s, !0)));
    let h = !1;
    if (this.operateCursor) {
      const {
        pathType: t,
        lineIndex: e,
        pointIndex: s,
        inPath: n,
        pathIndex: o,
      } = this.operateCursor;
      if (n || "rect" !== t)
        n ? o === i && (this.$cvs.style.cursor = "move") : (h = !0);
      else {
        const { side: t, corner: i } = this.$opts.rectCursors;
        this.$cvs.style.cursor = s > -1 ? i[s] : t[e];
      }
    }
    this._drawRoiPathsWithOpe(h && e);
  }
  function b(t) {
    if (!this.drawing) {
      const e = l(t);
      this._createNewPath(e, "point", !1), this._addNewPath();
    }
  }
  function S(t) {
    if (this.drawing) {
      const e = l(t);
      this.newPath.points.push(e), this._addNewPath();
    } else {
      const e = l(t);
      this._createNewPath(e, "line", !1);
    }
  }
  function E(t) {
    if (this.drawing)
      if (this.pathPointsCoincide) this._addNewPath();
      else {
        const e = l(t);
        this.newPath.points.push(e);
      }
    else {
      const e = l(t);
      this._createNewPath(e, "polygon", !1);
    }
  }
  function O(t) {
    const { type: e, points: s } = this.newPath,
      i = s[0];
    "rect" === e
      ? (this.newPath.points = o(i, t))
      : "circle" === e && s.push(t),
      this._addNewPath();
  }
  function I(t, e) {
    const { tinyRectSize: s, tinyCircleRadius: i, canvasScale: n } = this.$opts,
      { type: h } = this.newPath,
      o = "rect" === h ? s : i;
    return o > 0
      ? "rect" === h
        ? Math.abs(t.x - e.x) > o * n && Math.abs(t.y - e.y) > o * n
        : r(t, e) > o * n
      : !c(t, e);
  }
  function T(t) {
    this.$ctx.save();
    const e = this.paths.findIndex((e) => {
      this._createCvsPath(e.type, e.points);
      const s = "line" === e.type ? "isPointInStroke" : "isPointInPath";
      return this.$ctx[s](t.x, t.y);
    });
    return this.$ctx.restore(), e;
  }
  function M(t) {
    const e = T.call(this, t);
    (!this.$opts.ignoreInvalidSelect || -1 !== e) && this.choosePath(e);
  }
  var k = {
    keyPress: function (t) {
      switch (t.key.toLowerCase()) {
        case "backspace":
        case "delete":
          this._deletePath();
          break;
        case "t":
          this._invertChosePath();
      }
    },
    cvsMouseUp: function (t) {
      const e = l(t);
      this.drawing && this.needDrag && this.dragging
        ? I.call(this, this.newPath.points[0], e)
          ? O.call(this, "rect" === this.newPath.type ? v.call(this, e) : e)
          : this._resetNewPath()
        : this.modifying
        ? ((this.modifying = !1),
          !c(this.operateCursor.originStartPoint, e) &&
            this._emitValue("modify", this.choseIndex))
        : this.$opts.readonly
        ? (M.call(this, e), this._drawRoiPaths())
        : t.shiftKey ||
          (this.$opts.singleType && this.curSingleType) ||
          (this._resetNewPath(), M.call(this, e), C.call(this, t));
    },
    cvsMouseDown: function (t) {
      if ((t.preventDefault(), t.buttons >= 2)) return;
      if (
        this.operateCursor &&
        (!this.operateCursor.inPath ||
          this.operateCursor.pathIndex === this.choseIndex)
      )
        return (
          (this.modifying = !0),
          this._emitEvent("modify-start", t),
          (this.operateCursor.originStartPoint = l(t)),
          void (this.operateCursor.startPoint = l(t))
        );
      if (
        this._isPathMax() ||
        !this._isSingleTypeAllow(!0) ||
        (!this.$opts.singleType && t.shiftKey)
      )
        return;
      const e = this.curSingleType || (t.ctrlKey ? "circle" : "rect");
      if (!this.$opts.allowTypes.includes(e)) return;
      const s = l(t);
      this._createNewPath(s, e), this._drawRoiPaths();
    },
    cvsMouseMove: function (t) {
      const {
        drawing: e,
        needDrag: s,
        dragging: i,
        modifying: n,
        lastMoveEvent: h,
      } = this;
      ((e && s && i) || n) && 1 !== t.buttons
        ? this.cvsMouseUp(h)
        : (e
            ? s
              ? x.call(this, t)
              : $.call(this, t)
            : n
            ? w.call(this, t)
            : C.call(this, t),
          (this.lastMoveEvent = t));
    },
    cvsMouseClick: function (t) {
      t.preventDefault(), this.$cvs.focus();
      const { drawing: e, needDrag: s, modifying: i } = this;
      if (this._isPathMax() || !this._isSingleTypeAllow() || (e && s) || i)
        return;
      const h = l(t);
      if ("contextmenu" === t.type)
        e &&
          ("polygon" === this.newPath.type
            ? this.newPath.points.pop()
            : this._resetNewPath());
      else {
        const { singleType: e, allowTypes: s } = this.$opts;
        if (
          e &&
          n.includes(this.curSingleType) &&
          s.includes(this.curSingleType)
        )
          switch (this.curSingleType) {
            case "polygon":
              E.call(this, t);
              break;
            case "point":
              b.call(this, t);
              break;
            case "line":
              S.call(this, t);
          }
        else
          !e && t.shiftKey && s.includes("polygon") && this.drawingPolygon(t);
      }
      this._drawRoiPaths(h);
    },
    checkMouseCanOperate: C,
  };
  function R() {
    this.$ctx.clip(), this.clearCanvas();
  }
  function z(t, e) {
    if (!t) return;
    const { type: s } = t,
      i = t.points.concat(e ? [e] : []);
    i.length < 2 ||
      (this.$ctx.save(),
      (this.$ctx.fillStyle = "rgba(255, 255, 255, 0.2)"),
      this._createCvsPath(s, i, "polygon" === s),
      this.$ctx.fill(),
      "polygon" !== s && this.$ctx.stroke(),
      "polygon" === s && j.call(this, i),
      this.$ctx.restore());
  }
  function j(t) {
    this.$ctx.save(),
      t.forEach((t) => {
        this.$ctx.beginPath(),
          this.$ctx.arc(t.x, t.y, 1.4 * this.$ctx.lineWidth, 0, 2 * Math.PI),
          (this.$ctx.fillStyle = this.$ctx.strokeStyle),
          this.$ctx.fill();
      }),
      this.$ctx.restore();
  }
  function N(t) {
    this.$ctx.save(), this.$ctx.beginPath();
    const {
      operateCircle: { radius: e, styles: s },
      canvasScale: i,
    } = this.$opts;
    s && Object.assign(this.$ctx, s),
      this.$ctx.arc(t.x, t.y, e * i, 0, 2 * Math.PI),
      this.$ctx.stroke(),
      this.$ctx.fill(),
      this.$ctx.restore();
  }
  var V = {
    setCtxStyles: function () {
      const { globalStyles: t, canvasScale: e } = this.$opts;
      this.$ctx && Object.assign(this.$ctx, t, { lineWidth: t.lineWidth * e });
    },
    createCvsPath: function (t, e, s) {
      switch ((this.$ctx.beginPath(), t)) {
        case "point":
          this.$ctx.arc(
            e[0].x,
            e[0].y,
            1.4 * this.$ctx.lineWidth,
            0,
            2 * Math.PI
          );
          break;
        case "line":
        case "rect":
        case "polygon":
          ("rect" === t ? a(e) : e).forEach((e, i) => {
            const { x: n, y: h } = e;
            0 === i ? this.$ctx.moveTo(n, h) : this.$ctx.lineTo(n, h),
              s && "polygon" === t && this.$ctx.stroke();
          });
          break;
        case "circle": {
          const t = e[0],
            s = r(t, e[1]);
          this.$ctx.arc(t.x, t.y, s, 0, 2 * Math.PI);
          break;
        }
      }
      this.$ctx.closePath();
    },
    drawExistRoiPath: function (t, e, s = !0, i = !0) {
      this.$ctx.save();
      const { type: n, points: h, styles: o, inner: a } = t;
      if (!h || h.length < 1) return;
      const { blurStrokeOpacity: r, focusStyles: c } = this.$opts;
      o && Object.assign(this.$ctx, o),
        this._createCvsPath(n, h),
        c
          ? e === this.choseIndex && Object.assign(this.$ctx, c)
          : (this.$ctx.globalAlpha = e !== this.choseIndex ? r : 1),
        "point" === n
          ? ((this.$ctx.fillStyle = this.$ctx.strokeStyle), this.$ctx.fill())
          : i && (a ? this.$ctx.fill() : R.call(this)),
        "point" !== n && s && this.$ctx.stroke(),
        !this.$opts.readonly && "polygon" === n && j.call(this, h),
        !c && (this.$ctx.globalAlpha = 1),
        this.$ctx.restore();
    },
    drawRoiPaths: function (t, e) {
      !e && this.clearCanvas(),
        (this.hasInvertPath = this.paths.some((t) => !t.inner)),
        this.hasInvertPath
          ? (this.$ctx.fillRect(0, 0, this.$cvs.width, this.$cvs.height),
            this.paths.forEach(
              (t, e) => !t.inner && this._drawExistRoiPath(t, e, !1)
            ),
            this.paths.forEach((t, e) =>
              this._drawExistRoiPath(t, e, !0, t.inner)
            ))
          : this.paths.forEach((t, e) => this._drawExistRoiPath(t, e)),
        this.drawing && z.call(this, this.newPath, t);
    },
    drawRoiPathsWithOpe: function (t) {
      this._drawRoiPaths(), t && N.call(this, t);
    },
  };
  class A {
    constructor(t, e) {
      p.call(this, k),
        this._initInstanceVars(),
        (this.$opts = (function () {
          const t = {},
            e = f();
          return (
            Object.keys(e).forEach((s) => {
              if (e[s] && "default" in e[s]) {
                const i = e[s].default;
                t[s] = "function" == typeof i ? i() : i;
              }
            }),
            t
          );
        })()),
        this._mergeOptions(e),
        (this._events = {
          keyup: this._keyPress.bind(this),
          click: this._cvsMouseClick.bind(this),
          mousedown: this._cvsMouseDown.bind(this),
          mousemove: this._cvsMouseMove.bind(this),
          mouseup: this._cvsMouseUp.bind(this),
          contextmenu: this._cvsMouseClick.bind(this),
        }),
        t && this.mount(t);
    }
    _initInstanceVars() {
      Object.assign(this, {
        isEventsListening: !1,
        drawing: !1,
        needDrag: !0,
        dragging: !1,
        modifying: !1,
        operateCursor: null,
        lastMoveEvent: null,
        newPath: {},
        value: [],
        paths: [],
        curSingleType: "",
        pathPointsCoincide: !1,
        hasInvertPath: !1,
        choseIndex: -1,
        resizeTicker: 0,
      });
    }
    _init() {
      const t = document.createElement("canvas");
      p.call(this, V),
        (t.className = "canvas-roi"),
        (t.tabIndex = 99999 * (1 + Math.random())),
        (t.style.cssText = "outline: none;transform-origin: 0 0;"),
        (this.$cvs = t),
        (this.$ctx = this.$cvs.getContext("2d") || void 0),
        this.resetCanvas(),
        this.$el && this.$el.appendChild(this.$cvs),
        this._addEventHandler(this.$opts.readonly),
        this.$opts.autoFit && this._initObserver(),
        this._emitEvent("ready");
    }
    _initObserver() {
      this.$el &&
        ((this._ElObserver = new ResizeObserver(
          this._sizeChangeWatcher.bind(this)
        )),
        this._ElObserver.observe(this.$el));
    }
    _sizeChangeWatcher() {
      clearTimeout(this.resizeTicker),
        (this.resizeTicker = window.setTimeout(() => {
          this._emitEvent("resize"), this.resetCanvas();
        }, 50));
    }
    _autoFitChange(t) {
      return t
        ? this._ElObserver
          ? this._ElObserver.observe(this.$el)
          : this._initObserver()
        : this._ElObserver.unobserve(this.$el);
    }
    _mergeOptions(t = {}) {
      if (!t) return;
      const { hasOwnProperty: e, toString: s } = Object.prototype;
      Object.keys(t).forEach((i) => {
        e.call(this.$opts, i) &&
        "[object Object]" === s.call(t[i]) &&
        this.$opts[i]
          ? Object.assign(this.$opts[i], t[i])
          : (this.$opts[i] = t[i]);
      }),
        this._checkSingleType();
    }
    _emitEvent(t, ...e) {
      const s = this.$opts[t];
      "function" == typeof s && s(...e);
    }
    _checkSingleType() {
      const { allowTypes: t, singleType: e, currentType: s } = this.$opts;
      (this.curSingleType = e && t && s && t.includes(s) ? s : ""),
        this.curSingleType && this._resetChooseState();
    }
    _isPathMax() {
      const { maxPath: t } = this.$opts;
      return !!(t && t > 0) && this.paths.length >= t;
    }
    _isSingleTypeAllow(t) {
      const e = t ? h : n;
      return Boolean(
        !this.$opts.singleType ||
          (this.curSingleType && e.includes(this.curSingleType))
      );
    }
    _floatToFixed(t) {
      const { digits: e = 0 } = this.$opts;
      if (e < 1) return t;
      const s = 10 ** e;
      return Math.round(t * s) / s;
    }
    _emitValue(t = "add", e = 0) {
      const s = this.paths;
      this._completePathsInfo(s),
        this._emitEvent("input", this._switchCoordsScale(s)),
        this._emitEvent("change", t, e);
    }
    _completePathsInfo(t) {
      t.forEach((t) => {
        const { type: e, points: s } = t;
        let i = {};
        if ("rect" === e) {
          const t = o(s[0], s[1]);
          i = {
            points: t,
            start: this.scale(t[0]),
            width: this.scale({ x: t[1].x - t[0].x, y: 0 }).x,
            height: this.scale({ x: 0, y: t[1].y - t[0].y }).y,
          };
        } else if ("circle" === e) {
          const t = r(s[0], s[1]);
          i = {
            center: this.scale(s[0]),
            radius: t,
            scaleRadius: this.scale({ x: t, y: 0 }).x,
          };
        }
        Object.assign(t, i);
      });
    }
    _switchCoordsScale(t, e) {
      const s = ((i = t), JSON.parse(JSON.stringify(i)));
      var i;
      return (
        s.forEach((t) => {
          const { points: s } = t;
          Array.isArray(s) &&
            (t.points = s.map((t) => (e ? this.invert(t) : this.scale(t))));
        }),
        s
      );
    }
    _addEventHandler(t) {
      Object.keys(this._events).forEach(
        (e) =>
          (!t || "mouseup" === e) &&
          this.$cvs &&
          this.$cvs.addEventListener(e, this._events[e])
      ),
        (this.isEventsListening = !0);
    }
    _removeEventHandler(t) {
      Object.keys(this._events).forEach(
        (e) =>
          (t || "mouseup" !== e) &&
          this.$cvs &&
          this.$cvs.removeEventListener(e, this._events[e])
      ),
        (this.isEventsListening = !1);
    }
    _resetNewPath() {
      Object.assign(this, {
        drawing: !1,
        needDrag: !1,
        dragging: !1,
        newPath: {},
        pathPointsCoincide: !1,
      });
    }
    _createNewPath(t, e = "rect", s = !0) {
      (this.drawing = !0),
        (this.needDrag = s),
        Object.assign(this.newPath, { type: e, points: [t], inner: !0 }),
        this._emitEvent("draw-start", e, t);
    }
    _addNewPath() {
      this._emitEvent("draw-end"),
        this.paths.unshift(this.newPath),
        this._emitValue(),
        !this.$opts.singleType && this.choosePath(0),
        this._resetNewPath();
    }
    _resetChooseState() {
      this.choosePath(-1);
    }
    _deletePath() {
      if (this.choseIndex < 0) return;
      const t = this.choseIndex;
      this.paths.splice(t, 1),
        this._resetChooseState(),
        this._checkMouseCanOperate(),
        this._emitValue("delete", t);
    }
    _invertChosePath() {
      const { choseIndex: t } = this;
      t >= 0 && (this.paths[t].inner = !this.paths[t].inner),
        this._emitValue("modify", t);
    }
    mount(t) {
      const e = "string" == typeof t ? document.querySelector(t) : t;
      e &&
        ((this.$el = e),
        this.$el instanceof HTMLElement
          ? this._init()
          : console.warn("the param element should be an HTMLElement"));
    }
    resetOptions(t) {
      const e = this.$opts.autoFit;
      this._mergeOptions(t),
        t.globalStyles && this._setCtxStyles(),
        (t.width !== this.$opts.width || t.height !== this.$opts.height) &&
          this.resetCanvas(),
        t.readonly
          ? this.isEventsListening && this._removeEventHandler()
          : this._addEventHandler(),
        this.$opts.autoFit !== e && this._autoFitChange(this.$opts.autoFit),
        this.redrawCanvas(!0);
    }
    resetCanvas() {
      if (!this.$el) return;
      const { offsetWidth: t, offsetHeight: e } = this.$el,
        { canvasScale: s = 2, width: i, height: n } = this.$opts,
        h = i || t,
        o = e || n || 0;
      (this.$size = { width: h, height: o }),
        (this.$cvsSize = { width: h * s, height: o * s }),
        Object.assign(this.$cvs, this.$cvsSize),
        this.$cvs &&
          Object.assign(this.$cvs.style, {
            width: 100 * s + "%",
            height: 100 * s + "%",
            transform: `scale(${1 / s})`,
          }),
        this.setValue(this.value),
        this._setCtxStyles(),
        this._drawRoiPaths();
    }
    scale(t, e) {
      const { width: s, height: i } =
        e && this.$size ? this.$size : this.$cvsSize;
      return { x: this._floatToFixed(t.x / s), y: this._floatToFixed(t.y / i) };
    }
    invert(t, e) {
      const { width: s, height: i } =
        e && this.$size ? this.$size : this.$cvsSize;
      return { x: Math.round(t.x * s), y: Math.round(t.y * i) };
    }
    setValue(t) {
      Array.isArray(t) &&
        ((this.value = t),
        (this.paths = this._switchCoordsScale(t, !0)),
        this._drawRoiPaths());
    }
    choosePath(t) {
      (this.choseIndex = this.paths[t] ? t : -1),
        this._emitEvent("choose", this.choseIndex),
        this._drawRoiPaths();
    }
    clearCanvas() {
      this.$ctx && this.$ctx.clearRect(0, 0, this.$cvs.width, this.$cvs.height);
    }
    redrawCanvas(t) {
      this._drawRoiPaths(void 0, !t);
    }
    exportImageFromCanvas(t) {
      this.$cvs.toBlob((e) => {
        t(e ? window.URL.createObjectURL(e) : "");
      });
    }
    customDrawing(t) {
      "function" == typeof t &&
        (this.$ctx.save(),
        t.call(this, this),
        this.redrawCanvas(),
        this.$ctx.restore());
    }
    destroy() {
      this._removeEventHandler(),
        this.$el &&
          this.$cvs &&
          (this.$el.removeChild(this.$cvs), delete this.$ctx, delete this.$cvs);
    }
  }
  !(function (t, e) {
    void 0 === e && (e = {});
    var s = e.insertAt;
    if (t && "undefined" != typeof document) {
      var i = document.head || document.getElementsByTagName("head")[0],
        n = document.createElement("style");
      (n.type = "text/css"),
        "top" === s && i.firstChild
          ? i.insertBefore(n, i.firstChild)
          : i.appendChild(n),
        n.styleSheet
          ? (n.styleSheet.cssText = t)
          : n.appendChild(document.createTextNode(t));
    }
  })(
    ".canvas-roi {\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  left: 0;\r\n  top: 0;\r\n  overflow: hidden;\r\n}"
  );
  const F = f(),
    W = e.defineComponent({
      name: "CanvasRoi",
      props: {
        options: { type: Object, default: () => ({}) },
        value: { type: Array, default: () => [] },
        ...F,
      },
      emits: i,
      data: () => ({
        $_instanceId: +new Date() + Math.random(),
        $_roi: null,
        selfCurrentType: "",
      }),
      mounted() {
        (this.$_roi = new A(this.$el, this.handledOptions)),
          this.value && this.updateValue(this.value);
      },
      destroy() {
        this.$_roi && this.$_roi.destroy();
      },
      computed: {
        handledEvents() {
          const t = {};
          return (
            i.forEach((e) => {
              t[e] = this.emitEvent.bind(this, e);
            }),
            t
          );
        },
        handledOptions() {
          return { ...this.$props, ...this.options, ...this.handledEvents };
        },
      },
      watch: { value: "updateValue", handledOptions: "resetVueOptions" },
      methods: {
        callInstanceMethod(t, ...e) {
          const s = this.$_roi;
          if (s && s[t] && "function" == typeof s[t]) return s[t](...e);
        },
        updateValue(t) {
          this.callInstanceMethod("setValue", t);
        },
        emitEvent(t, ...e) {
          const s = this.options[t] || this[t];
          "function" == typeof s && s.apply(this, e), this.$emit(t, ...e);
        },
        resetVueOptions(t) {
          this.callInstanceMethod("resetOptions", t);
        },
        ...(function () {
          const t = {};
          return (
            s.forEach((e) => {
              t[e] = function (...t) {
                return this.callInstanceMethod(e, ...t);
              };
            }),
            t
          );
        })(),
      },
      render() {
        return e.h(
          "div",
          { class: "canvas-roi", "data-id": this.$data.$_instanceId },
          this.$slots.default
        );
      },
      install(t) {
        t.component(A.name, A);
      },
    });
  (t.CanvasRoi = A),
    (t.default = W),
    (t.eventNames = i),
    (t.optionsTypes = f),
    (t.publicMethods = s),
    Object.defineProperty(t, "__esModule", { value: !0 });
});
