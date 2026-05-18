import type { Drawable } from '../drawables';
import type { Coords } from '../utils';

export type ArtboardCanvasProps = {
  width: number;
  height: number;
};

export type ArtboardDrawCallbacksProps = {
  onDrawEnd: (drawable: Drawable) => void;
  onDrawStart: () => void;
};

export type ArtboardStrokeProps = {
  drawingStroke: string;
  drawingStrokeWidth: number;
};

export type ArtboardFillProps = {
  drawingFill: string;
};

export type ArtboardMinSizeProps = {
  minWidth: number;
  minHeight: number;
};

export type ArtboardTextProps = {
  fontSize: number;
  text: ReadonlyArray<string>;
};

export type DragStart = { start: Coords };

export type DragCurrent = {
  start: Coords;
  current: Coords;
};

export type BoundsInput = {
  startCoord?: Coords;
  currentCoord?: Coords;
};
