import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Coords } from '../utils';
import ArtboardBase from './base';
import { getRectBoundsFromCoords, isBelowMinSize } from './bounds';
import type {
  ArtboardCanvasProps,
  ArtboardDrawCallbacksProps,
  ArtboardFillProps,
  ArtboardMinSizeProps,
  ArtboardStrokeProps,
  BoundsInput,
  DragCurrent,
  DragStart,
} from './types';

type Props = PropsWithChildren<
  ArtboardCanvasProps &
    ArtboardDrawCallbacksProps &
    ArtboardFillProps &
    ArtboardStrokeProps &
    ArtboardMinSizeProps
>;

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
    ({ startCoord, currentCoord }: BoundsInput) => {
      const rectBounds = getRectBoundsFromCoords({ startCoord, currentCoord });

      if (!rectBounds || isBelowMinSize(rectBounds, minWidth, minHeight)) {
        return null;
      }

      return rectBounds;
    },
    [minHeight, minWidth],
  );

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
      const rectBounds = getRectBounds({ startCoord: start, currentCoord: current });

      if (rectBounds) {
        const id = crypto.randomUUID();
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
