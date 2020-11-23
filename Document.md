# CanvasRoi

组件主要用于在图片或视频提供绘制选区并将选区数据输出。

## 内容目录

- [主要功能](#主要功能)
- [文件目录](#文件目录)
- [开始使用](#开始使用)
- [配置](#配置)
- [方法](#方法)
- [实例属性](#实例属性)
- [事件](#事件)
- [Vue组件](#Vue组件)
- [License](#license)

## 主要功能

- 支持绘制矩形、多边形、园形、点、线5种选区路径。
- 支持指定绘制路径类型
- 支持单类型路径模式
- 支持已绘制选区的修改和移动。
- 支持选区的正反选。
- 支持自定义背景，并且可以将合成内容导出。
- 支持组件自动适应容器尺寸变化


## 开始使用

### 安装

NPM:

```shell
npm install @wxhccc/canvas-roi --save
```

CDN:

```html
<script src="[npm url]/[pkg@version]/index.js"></script>
```

### 用法

```js
import { CanvasRoi } from '@wxhccc/canvas-roi';

new CanvasRoi(element[, options]);

```
#### CanvasRoi构造函数

- **element** <`HTMLElement`> 用来放置组件的容器.

- **options** <`Object`> 组件的配置对象，详见 [配置](#配置).


#### 示例

```html
<div class="roi-container">
  <img src="picture.jpg" alt="">
</div>
```

```js
import { CanvasRoi } from '@wxhccc/canvas-roi';

const roi = new CanvasRoi('.roi-container', {
  // input回调函数可从组件内接收数据的变化
  input: value => {}
});
// 也可以外部设置组件的数据
roi.setValue(value)
```

#### 绘制操作说明

绘制矩形

> 点击选区起点，按住鼠标左键拖动，在合适的位置松开

绘制多边形

> `shift`按住(单类型模式不需要)，然后通过点击操作选择合适的端点，最后光标靠近起点让路径闭合，点击确定即可完成绘制。

绘制圆形

> 按住`ctrl`键(单类型模式不需要)，然后在圆心点击鼠标，按住左键拖动，在合适的大小放开鼠标。

删除选区、反选选区

> 点击需要进行操作的选区，当选区高亮时。按`DELETE`/`Backspace`键可删除选中选区。按`T`可反选选区。


## 配置

**配置对象中的属性，会进行2层深度的浅合并**

### readonly

- Type: `Boolean`
- Default: `false`

是否仅作展示不能编辑, 但是可以正常选取选区

### canvasScale

- Type: `Number`
- Default: `2`

组件使用的canvas作为选区绘制画板，为了减少斜线的锯齿效果，所以会将canvas元素放大一定倍数然后用样式缩放到原始尺寸。默认放大2倍。

ps: 配置中的属性绝大部分会自动按此属性的进行处理。配置时可以忽略缩放因素。

### allowTypes 

- Type: `Array`
- Default: `['circle', 'rect', 'polygon']`

允许绘制的选区类型数组，可以用于限制绘制类型

### singleType

- Type: `Boolean`
- Default: `false`

是否开启单类型绘制模式。此模式下仅能绘制`currentType`指定类型的选区。此外此模式下绘制不需要辅助按键。
但是需要注意的是，此模式下绘制过程和操作过程分开了。操作主要是选中和调整大小等。

### currentType

- Type: `String`
- Default: `rect`

单类型绘制模式当前可绘制类型，受`allowTypes`的限制。当传入的属性为`''`或者其他非有效类型字符串，亦或者不在`allowTypes`中时，无法进行绘制，仅能对已绘制选区进行操作。

### globalStyles

- Type: `Object`
- Default:
  ```
  {
    lineWidth: 2,
    fillStyle: 'rgba(14, 126, 226, 0.8)'
    strokeStyle: 'rgba(14, 126, 226, 1)',
  }
  ```

canvas画布的全局样式，支持所有canvas上下文`context`支持的样式，具体见[CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)


### focusStyles

- Type: `Object`
- Default: `null`

路径获取焦点时的样式，默认样式为非获取焦点路径添加透明度。

### operateFocusOnly

- Type: `Boolean`
- Default: `true`

是否仅能操作选中选区

### operateCircle

- Type: `Object`
- Options:
  - styles: 小圆圈的样式
  - radius: 小圆圈的半径
- Default: 
  ```
  {
    styles: {
      fillStyle: 'rgba(255, 255, 255, 0.9)'
    },
    radius: 4
  }
  ```


配置多边形和圆形路径操作光标跟踪圆圈的样式。


### sensitive

- Type: `Object`
- Options:
  - line: 路径线的灵敏度(px)
  - point: 路径端点的灵敏度(px)
- Default: 
  ```
  {
    line: 4,
    point: 3
  }
  ```

正常情况下，路径的点和线不会太宽。为了增加操作的便利性，会对判定距离进行一定的放大。灵敏度这个配置项可以配置路径线的可识别范围，以及端点的可感知距离。


### pathCanMove

- Type: `Boolean`
- Default: `true`

是否可以拖拽移动选中选区


### digits

- Type: `Number(Integer)`,
- Default: `3`

组件返回数据中度量值的精度，默认保留小数点后3位。设置为小于1的数字时会返回全精度的浮点数。


### distanceCheck

- Type: `Number`/`(point1, point2) => Boolean`
- Default: `10`

绘制多边形时，鼠标离起点一定距离时会自动吸附到起点，这个属性用于配置这个距离。也可以配置返回boolean值的函数,参数为用于比较的点对象。

### tinyRectSize

- Type: `Number`
- Default: `4`

当矩形的宽高小于这个值时认为是误操作，不会生成矩形。

### rectAspectRatio

- Type: `Number`
- Default: `0`

绘制矩形时固定的宽高比，默认无限制

### maxPath

- Type: `Number`
- Default: `0`

运行绘制的最大路径数量，默认为0不限制

### blurStrokeOpacity

- Type: `Number(Float)`
- Default: `0.5`

非选中选区的的透明度，用于区分当前选中路径和其他路径

### ignoreInvalidSelect

- Type: `Boolean`
- Default: `false`

是否忽略无效的选中操作。如果为`true`时点击空白处不会变更选中项。

### rectCursors

- Type: `Object`
- Options:
  - side: `Array`
  - corner: `Array`
- Default: 
  ```
  {
    side: ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'],
    corner: ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize']
  }
  ```

配置光标在矩形选区的边和角上时的展示形态。索引顺序是上、右、下、左

### width

- Type: `Number`
- Default: ``

组件的宽度，默认使用容器的宽度。

### height

- Type: `Number`
- Default: ``

组件的宽度，默认使用容器的高度。

### autoFit

- Type: `Boolean`
- Default: `false`

是否自动适应容器尺寸。此特性使用了实验性API实现。如果浏览器环境不支持，建议通过监听导致容器尺寸变化得操作（resize，临近节点隐藏显示）来修改组件尺寸。


### ready

- Type: `Function`
- Default: `null`

`ready` 事件的快捷方式.

### input

- Type: `Function`
- Default: `null`

`input` 事件的快捷方式.

### change

- Type: `Function`
- Default: `null`

`change` 事件的快捷方式.

### choose

- Type: `Function`
- Default: `null`

`choose` 事件的快捷方式.

## 注意事项

**关于方法和事件中提到的选区索引，组件采用类图层方式管理选区数组，即后绘制的索引小**

## 方法

由于组件需要在获取的dom元素后才能初始化，所以调用实例上的方法需要在初始化完成后。 除了 "mount"和"destroy".

### mount(element)

挂载函数，用于将组件挂载到给的节点元素中。

```js
const roi = new Roi(null, options);
...
// 在需要的时候手动挂载
roi.mount('.container');
```

### resetOptions(options)

修改实例的配置对象

### resetCanvas()

容器尺寸变化后，可用来重置画布的尺寸。可适用于不支持autoFit的浏览器

### scale(pxPoint, useSize)

- **pxPoint**:
  - Type: `Object`
  - Options:
    - x: `Number`
    - y: `Number`
- **useSize**: 是否使用$size做转换，默认使用$cvsSize
  - Type: `Boolean`
  - default `false`

根据组件的尺寸，将像素表示的点转换为0-1度量的坐标

### invert(scalePoint, useSize)

- **scalePoint**:
  - Type: `Object`
  - Options:
    - x: `Number`
    - y: `Number`
- **useSize**: 是否使用$size做转换
  - Type: `Boolean`
  - default `false`

根据组件的尺寸，将0-1度量表示的点转换为像素坐标

### setValue(value)

- **value**:
  - Type: `Array`

设置组件内部路径集合数据值

### choosePath(index)

- **index**:
  - Type: `Number`

设置指定索引的选区为选中状态，如果索引无对应选区，则清除选中状态。

### clearCanvas()

清除画布内容

### redrawCanvas(isClear)

重绘画布上路径内容，默认不清除画布内容，可以传入参数清除或手动清除。

### customDrawing(fn)

- **fn**:
  - Type: `function(instance)`

自定义绘制逻辑。绘制完成后会覆盖上路径内容。

### exportImageFromCanvas(resolve)

- **resolve(blobUrl)**:
  - Type: `function`

将画布上的内容导出为本地url的形式供页面使用。

### destroy()

销毁组件实例

## 实例属性

注意请不要修改实例属性，避免引起异常。

### `$size`

组件的尺寸对象，保护`width`和`height`属性

### `$cvs`

组件内的canvas元素

### `$cvsSize`

组件内的canvas元素的实际宽高，$size的尺寸乘以放大比例后的值。在自定义绘制逻辑时可能需要使用。

### `$ctx`

canvas画布的上下文，可用于自定义绘制逻辑。


## 事件

事件通过在配置对象里传入对应回调函数来监听

### ready

组件初始化完后触发的事件，


### input

- **value**: 路径数据
  - Type: `Array`


数据更新事件，用于将更新后的数据同步到组件外。

### change

- **type**: 产生变更的类型
  - Type: `String`
  - Enum: ['add', 'modify', 'delete']
- **index**: 产生变更的选区的索引
  - Type: `Number`


数据发生变化后触发的事件，可用于区分添加、修改和删除操作.

### choose

- **index**: 选中选区的索引
  - Type: `Number`


选中选区发生变化时触发。如果有选中选区则index为选区索引，否则为-1

### resize

组件尺寸发生变化时触发。只有设置了auto-fit属性为true的实例才会触发

### draw-start

- **type**: 新选区类型
  - Type: `String`
- **startPoint**: 起始点坐标，单位px
  - Type: `Object`


开始绘制选区时触发。

### draw-end

选区绘制结束时触发，包括右键取掉绘制的情况。

### modify-start

选区开始修改时触发。修改完会触发modify事件。


## Vue组件

组件默认导出一个封装好的vue组件.

用法如下：

```
<template>
...
  <div class="image-pane">
    <img src="......" alt="" />
    <canvas-roi
      v-model="path"
      :options="options"
    ></canvas-roi>
  </div>
  
...
</template>
<script>
...
import CanvasRoi from 'canvas-roi';

...
components: {
  CanvasRoi
},
data: {
  path: []
}
...
</script>
```

### props

#### value

- Type: `Array`
- Default: `[]`

传入的路径对象数组

#### options

- Type: `Object`
- Default: `{}`

传给组件内实例的配置对象，优先级高于其他属性

#### ...options

组件将options的所有配置项代理到组件的props属性上，可以直接设置属性而不通过options参数


### events

> vue组件会代理所有核心组件支持的所有事件并emit同名事件。可以通过事件监听来捕获事件了。

### slots

#### 默认

添加默认插槽，可用于在画布上添加额外的控制模块dom.


## License

[MIT](https://opensource.org/licenses/MIT)



[⬆ back to top](#内容目录)