import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import ArtboardBase from './base';

export type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = PropsWithChildren<{
  width: number;
  height: number;
  onCropEnd: (crop: Crop) => void;
  onCropStart: () => void;
  minWidth: number;
  minHeight: number;
}>;

type Coords = { x: number; y: number };

const ArtboardCrop: FunctionComponent<Props> = ({
  width,
  height,
  children,
  onCropEnd,
  onCropStart,
  minHeight,
  minWidth,
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
      onCropStart();
      setStartCoord(start);
    },
    [onCropStart],
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
        onCropEnd(rectBounds);
      }
      setCurrentCoord(undefined);
      setStartCoord(undefined);
    },
    [getRectBounds, onCropEnd],
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
        <path
          d={`M0 0 H${width} V${height} H0 Z M${rectBounds.x} ${rectBounds.y} H${rectBounds.x + rectBounds.width} V${rectBounds.y + rectBounds.height} H${rectBounds.x} Z`}
          fillRule="evenodd"
          fill="rgba(0,0,0,0.7)"
        />
      )}
    </ArtboardBase>
  );
};

export default ArtboardCrop;
