/* eslint-env node, jest */
import 'jest-canvas-mock';
import { CanvasRoi, optionsTypes, publicMethods, eventNames } from '../../lib';

console.log(eventNames);

// 测试导出项是否正确
describe('exports test', () => {
  it('the default export should be Class(function)', () => {
    expect(CanvasRoi).toBeInstanceOf(Function);
  });

  it('optionsTypes should be a function which return an object', () => {
    expect(optionsTypes).toBeInstanceOf(Function);
    expect(optionsTypes()).toBeInstanceOf(Object);
  });
  it('publicMethods and eventNames should return string array', () => {
    expect(publicMethods.every((item) => typeof item === 'string')).toBe(true);
    expect(eventNames.every((item) => typeof item === 'string')).toBe(true);
  });
});
// 测试类的实例
describe('instance test', () => {
  it('the instance of class CanvasRoi should be object', () => {
    expect(new CanvasRoi()).toBeInstanceOf(Object);
  });
  it('the dom should mounted if el is provide', () => {
    const instance = new CanvasRoi(document.body);
    expect(instance.$el).toEqual(document.body);
    expect(instance.$cvs).toBeInstanceOf(HTMLCanvasElement);
  });
  // 检测实例是否包含指定的属性
  it('test instance\'s important properties', () => {
    const instance = new CanvasRoi();
    expect(instance).toHaveProperty('$opts');
    expect(instance).toHaveProperty('_events');
    expect(instance).toHaveProperty('paths', []);
    expect(instance).toHaveProperty('newPath', {});
  });
});
