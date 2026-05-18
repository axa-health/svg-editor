import type { CSSProperties, FunctionComponent, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import DragIndicator from './drag-indicator';
import type { DrawableSelectableProps, TextDrawableShapeProps } from './types';

type Props = TextDrawableShapeProps & DrawableSelectableProps;

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
    (e: ReactMouseEvent) => {
      onSelect(e, id);
    },
    [id, onSelect],
  );

  const handleDragIndicatorMouseDown = useCallback(
    (e: ReactMouseEvent) => {
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

  const keyedText = useMemo(() => {
    const seen = new Map<string, number>();
    return text.map((line) => {
      const occurrence = (seen.get(line) ?? 0) + 1;
      seen.set(line, occurrence);
      return { line, key: `${line}-${occurrence}` };
    });
  }, [text]);

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
        {keyedText.map(({ line, key }) => (
          <tspan key={key} x={x} dy={fontSize}>
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
