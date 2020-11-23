import './types';

export const publicMethods: string[] = ['mount', 'resetOptions', 'resetCanvas', 'scale', 'invert', 'setValue', 'clearCanvas', 'redrawCanvas', 'exportImageFromCanvas', 'customDrawing', 'choosePath', 'destroy'];

export const eventNames: ROIEvents[] = ['ready', 'input', 'change', 'choose', 'resize', 'draw-start', 'draw-end', 'modify-start'];

export const clickPathTypes: ClickPathTypes[] = ['point', 'line', 'polygon'];

export const dragPathTypes: DragPathTypes[] = ['rect', 'circle'];
