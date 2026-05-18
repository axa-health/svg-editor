import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Coords } from '../utils';
import ArtboardBase from './base';
import { getEllipseBoundsFromCoords, isBelowMinSize } from './bounds';
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
    ({ startCoord, currentCoord }: BoundsInput) => {
      const ellipseBounds = getEllipseBoundsFromCoords({ startCoord, currentCoord });

      if (!ellipseBounds || isBelowMinSize(ellipseBounds, minWidth, minHeight)) {
        return null;
      }

      return {
        cx: ellipseBounds.cx,
        cy: ellipseBounds.cy,
        rx: ellipseBounds.rx,
        ry: ellipseBounds.ry,
      };
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
      const ellipseBounds = getEllipseBounds({ startCoord: start, currentCoord: current });

      if (ellipseBounds) {
        const id = crypto.randomUUID();
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
