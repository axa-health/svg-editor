import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { useCallback, useState } from 'react';
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

const ArtboardPen: FunctionComponent<Props> = ({
  onDrawEnd,
  drawingStrokeWidth,
  width,
  onDrawStart,
  height,
  drawingStroke,
  children,
}) => {
  const [drawingPoints, setDrawingPoints] = useState<ReadonlyArray<Coords> | undefined>(undefined);

  const onMouseDown = useCallback(
    ({ start }: { start: Coords }) => {
      onDrawStart();
      setDrawingPoints([start]);
    },
    [onDrawStart],
  );

  const onMouseMove = useCallback(({ current }: { current: Coords }) => {
    setDrawingPoints((existingDrawingPoints) => [...(existingDrawingPoints || []), current]);
  }, []);

  const onMouseUp = useCallback(
    ({ current }: { current: Coords; start: Coords }) => {
      setDrawingPoints((existingDrawingPoints) => {
        const points = [...(existingDrawingPoints || []), current];

        const id = uuid();
        onDrawEnd({
          type: 'path',
          id,
          points,
          stroke: drawingStroke,
          strokeWidth: drawingStrokeWidth,
        });

        return undefined;
      });
    },
    [onDrawEnd, drawingStroke, drawingStrokeWidth],
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
      {drawingPoints && (
        <path
          key="pen"
          d={`M ${drawingPoints.map((p) => p && `${p.x} ${p.y}`).join('L')}`}
          fill="none"
          strokeWidth={drawingStrokeWidth}
          stroke={drawingStroke}
        />
      )}
    </ArtboardBase>
  );
};

export default ArtboardPen;
