import type { CSSProperties, FunctionComponent, MouseEvent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import DragIndicator from './drag-indicator';

type Props = {
  id: string;
  text: ReadonlyArray<string>;
  x: number;
  y: number;
  selected: boolean;
  fontSize: number;
  fill: string;
  onSelect: (e: MouseEvent, id: string) => void;
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void;
  dragIndicatorStrokeWidth: number;
  canSelectDrawable: boolean;
};

const TextDrawable: FunctionComponent<Props> = ({
  id,
  text,
  x,
  y,
  selected,
  dragIndicatorStrokeWidth: diStrokeWidth,
  canSelectDrawable,
  fontSize,
  fill,
  onSelect,
  onDragIndicatorMouseDown,
}) => {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const handleTextRef = useCallback((textElement: SVGTextElement) => {
    if (textElement) {
      setHeight(textElement.getBBox().height);
      setWidth(textElement.getBBox().width);
    }
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      onSelect(e, id);
    },
    [id, onSelect],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: MouseEvent) => {
      onDragIndicatorMouseDown(e, id);
    },
    [id, onDragIndicatorMouseDown],
  );

  const strokeWidthHalf = useMemo(() => diStrokeWidth / 2, [diStrokeWidth]);

  const diX = useMemo(() => x - strokeWidthHalf, [strokeWidthHalf, x]);
  const diY = useMemo(() => y - strokeWidthHalf, [strokeWidthHalf, y]);
  const diWidth = useMemo(() => width + diStrokeWidth, [diStrokeWidth, width]);
  const diHeight = useMemo(() => height + diStrokeWidth, [diStrokeWidth, height]);

  const style: CSSProperties = useMemo(
    () => ({ cursor: canSelectDrawable ? 'pointer' : undefined }),
    [canSelectDrawable],
  );

  if (text && !text.length) {
    return null;
  }

  return (
    <g>
      <text
        ref={handleTextRef}
        x={x}
        y={y}
        alignmentBaseline="hanging"
        letterSpacing="1"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={`${fontSize}px`}
        onClick={handleClick}
        pointerEvents="visible-painted"
        fill={fill}
        style={style}
      >
        {text.map((line, i) => (
          <tspan key={`${line}-${i}`} x={x} dy={fontSize}>
            {line}
          </tspan>
        ))}
      </text>
      {selected && (
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={handleDragIndicatorMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
        />
      )}
    </g>
  );
};
export default TextDrawable;
