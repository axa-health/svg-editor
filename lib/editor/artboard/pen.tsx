import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';
import type { Coords } from '../utils';
import ArtboardBase from './base';
import type { ArtboardCanvasProps, ArtboardDrawCallbacksProps, ArtboardStrokeProps } from './types';

type Props = PropsWithChildren<
  ArtboardCanvasProps & ArtboardDrawCallbacksProps & ArtboardStrokeProps
>;

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

        const id = crypto.randomUUID();
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
