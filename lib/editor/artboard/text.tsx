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
  ArtboardTextProps,
  BoundsInput,
  DragCurrent,
  DragStart,
} from './types';

type Props = PropsWithChildren<
  ArtboardCanvasProps &
    ArtboardDrawCallbacksProps &
    ArtboardFillProps &
    ArtboardMinSizeProps &
    ArtboardTextProps
>;

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
    ({ startCoord, currentCoord }: BoundsInput) => {
      const textBounds = getRectBoundsFromCoords({ startCoord, currentCoord });

      if (!textBounds || isBelowMinSize(textBounds, minWidth, minHeight, 'both')) {
        return null;
      }

      return {
        x: textBounds.x,
        y: textBounds.y,
        height: textBounds.height,
        width: textBounds.width,
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
      const textBounds = getTextBounds({ startCoord: start, currentCoord: current });

      if (textBounds) {
        const id = crypto.randomUUID();
        onDrawEnd({
          type: 'text',
          id,
          ...textBounds,
          text,
          fill: drawingFill,
          fontSize,
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
