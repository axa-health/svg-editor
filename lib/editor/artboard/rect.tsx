import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import React, { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props = PropsWithChildren<{
  drawingFill: string;
  drawingStroke: string;
  drawingStrokeWidth: number;
  width: number;
  height: number;
  onDrawEnd: (drawable: Drawable) => void;
  onDrawStart: () => void;
  minWidth: number;
  minHeight: number;
}>;

type Coords = { x: number; y: number };

const ArtboardRect: FunctionComponent<Props> = ({
  width,
  drawingStrokeWidth,
  drawingStroke,
  onDrawEnd,
  drawingFill,
  minWidth,
  onDrawStart,
  minHeight,
  height,
  children,
}) => {
  const [startCoord, setStartCoord] = useState<Coords | undefined>();
  const [currentCoord, setCurrentCoord] = useState<Coords | undefined>();

  const getRectBounds = useCallback(
    ({
      startCoord: startCoordToUse,
      currentCoord: currentCoordToUse,
    }: {
      startCoord?: Coords;
      currentCoord?: Coords;
    }) => {
      if (!startCoordToUse || !currentCoordToUse) {
        return null;
      }

      const lowerX = Math.min(startCoordToUse.x, currentCoordToUse.x);
      const lowerY = Math.min(startCoordToUse.y, currentCoordToUse.y);
      const higherX = Math.max(startCoordToUse.x, currentCoordToUse.x);
      const higherY = Math.max(startCoordToUse.y, currentCoordToUse.y);

      const widthToUse = higherX - lowerX;
      const heightToUse = higherY - lowerY;

      if (widthToUse === 0 || heightToUse === 0) {
        return null;
      }
      if (widthToUse < minWidth || heightToUse < minHeight) {
        return null;
      }

      return {
        x: lowerX,
        y: lowerY,
        width: widthToUse,
        height: heightToUse,
      };
    },
    [minHeight, minWidth],
  );

  const onMouseDown = useCallback(
    ({ start }: { start: Coords }) => {
      onDrawStart();
      setStartCoord(start);
    },
    [onDrawStart],
  );

  const onMouseMove = useCallback(({ current, start }: { current: Coords; start: Coords }) => {
    setCurrentCoord(current);
    setStartCoord(start);
  }, []);

  const onMouseUp = useCallback(
    ({ current, start }: { current: Coords; start: Coords }) => {
      setCurrentCoord(current);
      setStartCoord(start);

      const rectBounds = getRectBounds({ startCoord: start, currentCoord: current });

      if (rectBounds) {
        const id = uuid();
        onDrawEnd({
          type: 'rect',
          id,
          ...rectBounds,
          fill: drawingFill,
          stroke: drawingStroke,
          strokeWidth: drawingStrokeWidth,
        });
      }
      setCurrentCoord(undefined);
      setStartCoord(undefined);
    },
    [getRectBounds, onDrawEnd, drawingFill, drawingStroke, drawingStrokeWidth],
  );

  const rectBounds = useMemo(
    () => getRectBounds({ startCoord, currentCoord }),
    [currentCoord, getRectBounds, startCoord],
  );
  return (
    <ArtboardBase
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      width={width}
      height={height}
    >
      {children}
      {rectBounds && (
        <rect
          key="rect"
          {...rectBounds}
          fill={drawingFill}
          stroke={drawingStroke}
          strokeWidth={drawingStrokeWidth}
        />
      )}
    </ArtboardBase>
  );
};

export default ArtboardRect;
