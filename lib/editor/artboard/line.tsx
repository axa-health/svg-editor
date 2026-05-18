import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Coords } from '../utils';
import ArtboardBase from './base';
import { getLinePointsFromCoords } from './bounds';
import type {
  ArtboardCanvasProps,
  ArtboardDrawCallbacksProps,
  ArtboardStrokeProps,
  DragCurrent,
  DragStart,
} from './types';

type Props = PropsWithChildren<
  ArtboardCanvasProps & ArtboardDrawCallbacksProps & ArtboardStrokeProps
>;

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

  const getLinePoints = useCallback(getLinePointsFromCoords, []);

  const onMouseDown = useCallback(
    ({ start }: DragStart) => {
      onDrawStart();
      setStartCoord(start);
    },
    [onDrawStart],
  );

  const onMouseMove = useCallback(({ current }: DragCurrent) => {
    setCurrentCoord(current);
  }, []);

  const onMouseUp = useCallback(
    ({ current, start }: DragCurrent) => {
      const linePoints = getLinePoints({ startCoord: start, currentCoord: current });

      if (linePoints) {
        const id = crypto.randomUUID();
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
    [drawingStroke, drawingStrokeWidth, getLinePoints, onDrawEnd],
  );

  const points = useMemo(
    () => getLinePoints({ currentCoord, startCoord }),
    [currentCoord, getLinePoints, startCoord],
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
