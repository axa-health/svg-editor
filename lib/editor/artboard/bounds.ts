import type { BoundsInput } from './types';

type RectBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SizeBounds = {
  width: number;
  height: number;
};

type MinCheckMode = 'either' | 'both';

export const getRectBoundsFromCoords = ({
  startCoord,
  currentCoord,
}: BoundsInput): RectBounds | null => {
  if (!startCoord || !currentCoord) {
    return null;
  }

  const lowerX = Math.min(startCoord.x, currentCoord.x);
  const lowerY = Math.min(startCoord.y, currentCoord.y);
  const higherX = Math.max(startCoord.x, currentCoord.x);
  const higherY = Math.max(startCoord.y, currentCoord.y);

  const width = higherX - lowerX;
  const height = higherY - lowerY;

  if (width === 0 || height === 0) {
    return null;
  }

  return {
    x: lowerX,
    y: lowerY,
    width,
    height,
  };
};

export const isBelowMinSize = (
  bounds: SizeBounds,
  minWidth: number,
  minHeight: number,
  mode: MinCheckMode = 'either',
) => {
  if (mode === 'both') {
    return bounds.width < minWidth && bounds.height < minHeight;
  }

  return bounds.width < minWidth || bounds.height < minHeight;
};

export const getEllipseBoundsFromCoords = (input: BoundsInput) => {
  const rectBounds = getRectBoundsFromCoords(input);

  if (!rectBounds) {
    return null;
  }

  return {
    cx: rectBounds.x + rectBounds.width / 2,
    cy: rectBounds.y + rectBounds.height / 2,
    rx: rectBounds.width / 2,
    ry: rectBounds.height / 2,
    width: rectBounds.width,
    height: rectBounds.height,
  };
};

export const getLinePointsFromCoords = ({ startCoord, currentCoord }: BoundsInput) => {
  if (!startCoord || !currentCoord) {
    return null;
  }

  return {
    x1: startCoord.x,
    y1: startCoord.y,
    x2: currentCoord.x,
    y2: currentCoord.y,
  };
};
