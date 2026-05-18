import type { MouseEvent as ReactMouseEvent } from 'react';
import type { ResizeHandleX, ResizeHandleY } from '../drawables/types';

export type Crop = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export type CropTranslateHandler = (x: number, y: number) => void;

export type CropResizeHandler = (
  handleX: ResizeHandleX,
  handleY: ResizeHandleY,
  newX: number,
  newY: number,
) => void;

export type CropResizeStartHandler = (
  e: ReactMouseEvent,
  handleX: ResizeHandleX,
  handleY: ResizeHandleY,
) => void;

export type CropBoxProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropInteractionProps = {
  onDragIndicatorMouseDown: (e: ReactMouseEvent) => void;
  onResizeHandleMouseDown: CropResizeStartHandler;
  diStrokeWidth: number;
};
