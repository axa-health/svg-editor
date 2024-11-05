import type { Drawable } from '.';

const rectMinWidth = 10;
const ellipseMinWidth = 10;

export default function resizeDrawable<T extends Drawable>(
  drawable: T,
  handleX: 'left' | 'right',
  handleY: 'top' | 'bottom',
  newX: number,
  newY: number,
): T {
  switch (drawable.type) {
    case 'rect': {
      let { x, y, width, height } = drawable;

      if (handleX === 'left') {
        width = Math.max(rectMinWidth, width - (newX - x));
        x = newX;
      } else if (handleX === 'right') {
        width = Math.max(rectMinWidth, newX - x);
      }

      if (handleY === 'top') {
        height = Math.max(rectMinWidth, height - (newY - y));
        y = newY;
      } else if (handleY === 'bottom') {
        height = Math.max(rectMinWidth, newY - y);
      }

      return {
        ...drawable,
        x,
        y,
        width,
        height,
      };
    }
    case 'ellipse': {
      let { cx, cy, rx, ry } = drawable;

      if (handleX === 'left') {
        const moveRight = newX - (cx - rx);
        const moveRightHalf = moveRight / 2;
        rx = Math.max(ellipseMinWidth, rx - moveRightHalf);
        cx += moveRightHalf;
      } else if (handleX === 'right') {
        const moveRight = newX - (cx + rx);
        const moveRightHalf = moveRight / 2;
        rx = Math.max(ellipseMinWidth, rx + moveRightHalf);
        cx += moveRightHalf;
      }

      if (handleY === 'top') {
        const moveUp = newY - (cy - ry);
        const moveUpHalf = moveUp / 2;
        ry = Math.max(ellipseMinWidth, ry - moveUpHalf);
        cy += moveUpHalf;
      } else if (handleY === 'bottom') {
        const moveUp = newY - (cy + ry);
        const moveUpHalf = moveUp / 2;
        ry = Math.max(ellipseMinWidth, ry + moveUpHalf);
        cy += moveUpHalf;
      }

      /* if (handleY === 'top') {
        ry = ry - ((newY - y) / 2);
        y = newY;
      } else if (handleY === 'bottom') {
        ry = (newY - y) / 2;
      } */

      return {
        ...drawable,
        cx,
        cy,
        rx,
        ry,
      };
    }
    case 'line': {
      let { x1, x2, y1, y2 } = drawable;

      if (handleX === 'left') {
        x1 = newX;
      } else if (handleX === 'right') {
        x2 = newX;
      }

      if (handleY === 'top') {
        y1 = newY;
      } else if (handleY === 'bottom') {
        y2 = newY;
      }

      return {
        ...drawable,
        x1,
        x2,
        y1,
        y2,
      };
    }
    default:
      console.warn("Can't resize drawable of type %s", drawable.type); // eslint-disable-line no-console
      return drawable;
  }
}
