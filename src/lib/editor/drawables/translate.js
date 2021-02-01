// @flow
import type { Drawable } from '.';

export default function translateDrawable<T: Drawable>(drawable: T, x: number, y: number): T {
  switch (drawable.type) {
    case 'rect':
      return {
        ...drawable,
        x: drawable.x + x,
        y: drawable.y + y,
      };
    case 'text':
      return {
        ...drawable,
        x: drawable.x + x,
        y: drawable.y + y,
      };
    case 'ellipse':
      return {
        ...drawable,
        cx: drawable.cx + x,
        cy: drawable.cy + y,
      };
    case 'path':
      return {
        ...drawable,
        points: drawable.points.map((old) => ({
          x: old.x + x,
          y: old.y + y,
        })),
      };
    case 'line':
      return {
        ...drawable,
        x1: drawable.x1 + x,
        x2: drawable.x2 + x,
        y1: drawable.y1 + y,
        y2: drawable.y2 + y,
      };
    default:
      console.error('Unknown drawable type', drawable); // eslint-disable-line no-console
      return drawable;
  }
}
