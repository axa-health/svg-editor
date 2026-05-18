import type { FunctionComponent, PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props = PropsWithChildren<{
  drawingFill: string;
  fontSize: number;
  text: ReadonlyArray<string>;
  width: number;
  height: number;
  onDrawEnd: (drawable: Drawable) => void;
  onDrawStart: () => void;
  minWidth: number;
  minHeight: number;
}>;

type Coords = { x: number; y: number };

const ArtboardText: FunctionComponent<Props> = ({
  minHeight,
  minWidth,
  text,
  width,
  height,
  onDrawEnd,
  onDrawStart,
  drawingFill,
  fontSize,
  children,
}) => {
  const [startCoord, setStartCoord] = useState<Coords | undefined>();
  const [currentCoord, setCurrentCoord] = useState<Coords | undefined>();

  const getTextBounds = useCallback(
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

      console.log(widthToUse, startCoordToUse, currentCoordToUse);
      console.log(heightToUse, startCoordToUse, currentCoordToUse);

      if (widthToUse < minWidth && heightToUse < minHeight) {
        return null;
      }

      return {
        x: lowerX,
        y: lowerY,
        height: heightToUse,
        width: widthToUse,
      };
    },
    [minHeight, minWidth],
  );

  const onMouseDown = useCallback(
    ({ start }: { start: Coords }) => {
      console.log('down', start);
      onDrawStart();
      setStartCoord(start);
    },
    [onDrawStart],
  );

  const onMouseMove = useCallback(({ current, start }: { current: Coords; start: Coords }) => {
    console.log('move', current, start);
    setCurrentCoord(current);
    setStartCoord(start);
  }, []);

  const onMouseUp = useCallback(
    ({ current, start }: { current: Coords; start: Coords }) => {
      console.log('up', start, current);
      setCurrentCoord(current);
      setStartCoord(start);

      const textBounds = getTextBounds({ startCoord: start, currentCoord: current });

      if (textBounds) {
        const id = crypto.randomUUID();
        onDrawEnd({
          type: 'text',
          id,
          ...textBounds,
          text: text,
          fill: drawingFill,
          fontSize: fontSize,
        });
      }
      setCurrentCoord(undefined);
      setStartCoord(undefined);
    },
    [getTextBounds, onDrawEnd, text, drawingFill, fontSize],
  );

  const textBounds = useMemo(
    () => getTextBounds({ startCoord, currentCoord }),
    [currentCoord, getTextBounds, startCoord],
  );

  const keyedText = useMemo(() => {
    const seen = new Map<string, number>();
    return text.map((line) => {
      const occurrence = (seen.get(line) ?? 0) + 1;
      seen.set(line, occurrence);
      return { line, key: `${line}-${occurrence}` };
    });
  }, [text]);

  return (
    <ArtboardBase
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      width={width}
      height={height}
    >
      {children}
      {textBounds && (
        <text
          {...textBounds}
          letterSpacing="1"
          fill={drawingFill}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={`${fontSize}px`}
          alignmentBaseline="hanging"
        >
          {keyedText.map(({ line, key }) => (
            <tspan key={key} x={textBounds.x} dy={fontSize}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </ArtboardBase>
  );
};

export default ArtboardText;
