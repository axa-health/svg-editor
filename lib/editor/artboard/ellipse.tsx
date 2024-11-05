import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
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

const ArtboardEllipse: FunctionComponent<Props> = ({
  drawingStrokeWidth,
  drawingStroke,
  width,
  drawingFill,
  minWidth,
  minHeight,
  height,
  onDrawStart,
  onDrawEnd,
  children,
}) => {
  const [startCoord, setStartCoord] = useState<Coords | undefined>();
  const [currentCoord, setCurrentCoord] = useState<Coords | undefined>();
  const getEllipseBounds = useCallback(
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
      const halfWidth = widthToUse / 2;
      const halfHeight = heightToUse / 2;

      if (widthToUse === 0 || heightToUse === 0) {
        return null;
      }
      if (widthToUse < minWidth || heightToUse < minHeight) {
        return null;
      }

      return {
        cx: lowerX + halfWidth,
        cy: lowerY + halfHeight,
        rx: halfWidth,
        ry: halfHeight,
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

      const ellipseBounds = getEllipseBounds({ startCoord: start, currentCoord: current });

      if (ellipseBounds) {
        const id = uuid();
        onDrawEnd({
          type: 'ellipse',
          id,
          ...ellipseBounds,
          fill: drawingFill,
          stroke: drawingStroke,
          strokeWidth: drawingStrokeWidth,
        });
      }
      setCurrentCoord(undefined);
      setStartCoord(undefined);
    },
    [getEllipseBounds, onDrawEnd, drawingFill, drawingStroke, drawingStrokeWidth],
  );

  const ellipseBounds = useMemo(
    () => getEllipseBounds({ currentCoord, startCoord }),
    [currentCoord, getEllipseBounds, startCoord],
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
      {ellipseBounds && (
        <ellipse
          {...ellipseBounds}
          key="ellipse"
          fill={drawingFill}
          stroke={drawingStroke}
          strokeWidth={drawingStrokeWidth}
        />
      )}
    </ArtboardBase>
  );
};

export default ArtboardEllipse;
