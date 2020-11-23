# CanvasRoi

组件主要用于在图片或视频提供绘制选区并将选区数据输出。


### 如何安装

NPM:

```shell
npm install @wxhccc/canvas-roi --save
```

CDN:

```html
<script src="[npm url]/[pkg@version]/index.js"></script>
```

### 用法示例


```html
<div class="roi-container">
  <img src="pic.jpg" alt="">
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

详细说明可查看仓库内文档

## License

[MIT](https://opensource.org/licenses/MIT)



[⬆ back to top](#内容目录)