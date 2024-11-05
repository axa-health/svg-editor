import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import React, { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props = PropsWithChildren<{
  drawingStroke: string;
  drawingStrokeWidth: number;
  width: number;
  height: number;
  onDrawEnd: (drawable: Drawable) => void;
  onDrawStart: () => void;
}>;

type Coords = { x: number; y: number };

const ArtboardLine: FunctionComponent<Props> = ({
  drawingStroke,
  drawingStrokeWidth,
  width,
  onDrawEnd,
  onDrawStart,
  height,
  children,
}) => {
  const [startCoord, setStartCoord] = useState<Coords | undefined>();
  const [currentCoord, setCurrentCoord] = useState<Coords | undefined>();

  const getLinePoints = ({
    startCoord: startCoordToUse,
    currentCoord: currentCoordToUse,
  }: {
    startCoord?: Coords;
    currentCoord?: Coords;
  }) => {
    if (!startCoordToUse || !currentCoordToUse) {
      return null;
    }
    return {
      x1: startCoordToUse.x,
      y1: startCoordToUse.y,
      x2: currentCoordToUse.x,
      y2: currentCoordToUse.y,
    };
  };

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

      const linePoints = getLinePoints({ startCoord: start, currentCoord: current });

      if (linePoints) {
        const id = uuid();
        onDrawEnd({
          type: 'line',
          id,
          ...linePoints,
          stroke: drawingStroke,
          strokeWidth: drawingStrokeWidth,
        });
      }
      setCurrentCoord(undefined);
      setStartCoord(undefined);
    },
    [onDrawEnd, drawingStroke, drawingStrokeWidth],
  );

  const points = useMemo(
    () => getLinePoints({ currentCoord, startCoord }),
    [currentCoord, startCoord],
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
      {points && <line {...points} stroke={drawingStroke} strokeWidth={drawingStrokeWidth} />}
    </ArtboardBase>
  );
};

export default ArtboardLine;
