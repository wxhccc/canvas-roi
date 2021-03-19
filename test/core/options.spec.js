/* eslint-env node, jest */
import "jest-canvas-mock";
import { CanvasRoi } from "../../dist/index.es";

it("canvasScale can scale canvas inner size(not css size)", () => {
  const canvasScale = 4;
  const roiSize = { width: 200, height: 100 };
  const instance = new CanvasRoi(document.body, { ...roiSize, canvasScale });
  expect(instance.$cvsSize).toEqual({
    width: roiSize.width * canvasScale,
    height: roiSize.height * canvasScale,
  });
});
it("invertFillStyles should work when you want to custom fillStyle", () => {
  const instance = new CanvasRoi(document.body, {
    invertFillStyles: ["#fff", "red"],
  });
  expect(instance.$ctx).toHaveProperty("fillStyle", "rgba(14, 126, 226, 0.6)");
});
it("custom width and height should be work", () => {
  const size = { width: 500, height: 200 };
  const instance = new CanvasRoi(document.body, size);
  expect(instance.$size).toEqual(size);
  const canvasSize = {
    width: instance.$cvs.width,
    height: instance.$cvs.height,
  };
  expect(canvasSize).toEqual(instance.$cvsSize);
});
// 测试配置项中的事件监听
describe("events test", () => {
  // 测试路径
  const testPaths = [
    {
      type: "rect",
      points: [
        { x: 0.12, y: 0.188 },
        { x: 0.375, y: 0.54 },
      ],
      inner: true,
    },
  ];
  it("ready event handler should be call when canvas is mounted", () => {
    const handler = jest.fn();
    const instance = new CanvasRoi(document.body, { ready: handler });
    instance.$ctx;
    expect(handler).toBeCalled();
  });
  it("input & change event handler should be called when instance.paths change", () => {
    const handler = jest.fn();
    const changeHandler = jest.fn();
    const instance = new CanvasRoi(document.body, {
      input: handler,
      change: changeHandler,
      width: 200,
      height: 100,
    });
    // 由于无法模拟组件内部生成路径，故使用外部方法来测试事件
    instance.setValue(testPaths);
    expect(instance.paths.length).toBe(1);
    instance.choseIndex = 0;
    instance._deletePath();
    expect(handler).toBeCalledWith([]);
    expect(changeHandler).toBeCalledWith("delete", 0);
  });
  it("input choose handler should be called when instance.choseIndex change", () => {
    const handler = jest.fn();
    const instance = new CanvasRoi(document.body, {
      choose: handler,
      width: 200,
      height: 100,
    });
    // 由于无法模拟组件内部生成路径，故使用外部方法来测试事件
    instance.setValue(testPaths);
    instance.choosePath(0);
    expect(instance.choseIndex).toBe(0);
    expect(handler).toBeCalledWith(0);
  });
});
