import type { CSSProperties, FunctionComponent } from 'react';
import { useCallback, useMemo } from 'react';
import type {
  DragIndicatorBoundsOverrideProps,
  DragIndicatorBoundsProps,
  DragIndicatorCursorProps,
  DragIndicatorMouseDownHandler,
  DragIndicatorResizeHandleMouseDown,
  DragIndicatorResizeHandlesProps,
} from './types';

type Props = DragIndicatorBoundsProps &
  DragIndicatorBoundsOverrideProps &
  DragIndicatorResizeHandlesProps &
  DragIndicatorCursorProps & {
    id: string;
    onDragIndicatorMouseDown: DragIndicatorMouseDownHandler;
    selected: boolean;
    animation?: boolean;
  };

function inverseDirection(
  inverseCursorHorizontal: boolean | undefined | null,
  inverseCursorVertical: boolean | undefined | null,
  direction: 'nw' | 'ne' | 'se' | 'sw',
): 'nw' | 'ne' | 'se' | 'sw' {
  let [v, h] = `${direction}`;

  if (inverseCursorVertical) {
    v = v === 'n' ? 's' : 'n';
  }

  if (inverseCursorHorizontal) {
    h = h === 'e' ? 'w' : 'e';
  }

  return `${v}${h}` as 'nw' | 'ne' | 'se' | 'sw';
}

const DragIndicator: FunctionComponent<Props> = ({
  id,
  onDragIndicatorMouseDown,
  onResizeHandleTopLeftMouseDown,
  onResizeHandleTopRightMouseDown,
  onResizeHandleBottomLeftMouseDown,
  onResizeHandleBottomRightMouseDown,
  diX,
  diY,
  diWidth,
  diHeight,
  diStrokeWidth,
  selected,
  inverseCursorHorizontal,
  inverseCursorVertical,
  animation = true,
  diRight,
  diTop,
  diLeft,
  diBottom,
}) => {
  const overlayStrokeWidth = useMemo(() => Math.max(0.65, diStrokeWidth * 0.62), [diStrokeWidth]);
  const handleRadius = useMemo(() => Math.max(4, diStrokeWidth * 1.25), [diStrokeWidth]);

  const diStyles: CSSProperties = useMemo(
    () => ({
      fill: selected ? 'rgba(100, 116, 139, 0.045)' : 'transparent',
      stroke: selected ? '#64748b' : 'none',
      strokeWidth: overlayStrokeWidth,
      strokeDasharray: `${overlayStrokeWidth * 1.1} ${overlayStrokeWidth * 1.5}`,
      animation: animation ? 'dash 8s linear forwards infinite' : 'none',
      cursor: 'move',
      transition: 'fill 180ms ease, stroke 180ms ease',
      opacity: selected ? 0.95 : 1,
    }),
    [animation, overlayStrokeWidth, selected],
  );

  const makeResizeHandleStyles = useCallback(
    (direction: 'nw' | 'ne' | 'se' | 'sw') => ({
      fill: selected ? '#94a3b8' : 'none',
      stroke: selected ? '#f8fafc' : 'none',
      strokeWidth: 0.7,
      transition: 'fill 180ms ease, stroke 180ms ease',
      cursor: `${inverseDirection(inverseCursorHorizontal, inverseCursorVertical, direction)}-resize`,
    }),
    [inverseCursorHorizontal, inverseCursorVertical, selected],
  );

  const diTopToUse = useMemo(() => diTop ?? diY, [diTop, diY]);
  const diBottomToUse = useMemo(() => diBottom ?? diY + diHeight, [diBottom, diHeight, diY]);
  const diLeftToUse = useMemo(() => diLeft ?? diX, [diLeft, diX]);
  const diRightToUse = useMemo(() => diRight ?? diX + diWidth, [diRight, diWidth, diX]);

  const resizeHandles = useMemo(
    () =>
      [
        {
          key: 'top-left',
          direction: 'nw' as const,
          cx: diLeftToUse,
          cy: diTopToUse,
          onMouseDown: onResizeHandleTopLeftMouseDown,
        },
        {
          key: 'top-right',
          direction: 'ne' as const,
          cx: diRightToUse,
          cy: diTopToUse,
          onMouseDown: onResizeHandleTopRightMouseDown,
        },
        {
          key: 'bottom-left',
          direction: 'sw' as const,
          cx: diLeftToUse,
          cy: diBottomToUse,
          onMouseDown: onResizeHandleBottomLeftMouseDown,
        },
        {
          key: 'bottom-right',
          direction: 'se' as const,
          cx: diRightToUse,
          cy: diBottomToUse,
          onMouseDown: onResizeHandleBottomRightMouseDown,
        },
      ].filter(
        (
          handle,
        ): handle is {
          key: string;
          direction: 'nw' | 'ne' | 'sw' | 'se';
          cx: number;
          cy: number;
          onMouseDown: DragIndicatorResizeHandleMouseDown;
        } => Boolean(handle.onMouseDown),
      ),
    [
      diBottomToUse,
      diLeftToUse,
      diRightToUse,
      diTopToUse,
      onResizeHandleBottomLeftMouseDown,
      onResizeHandleBottomRightMouseDown,
      onResizeHandleTopLeftMouseDown,
      onResizeHandleTopRightMouseDown,
    ],
  );

  return (
    <g>
      <rect
        style={diStyles}
        pointerEvents="bounding-box"
        x={diX}
        y={diY}
        width={diWidth}
        height={diHeight}
        strokeWidth={diStrokeWidth}
        onMouseDown={onDragIndicatorMouseDown}
      />
      {resizeHandles.map((handle) => (
        <circle
          key={handle.key}
          pointerEvents="bounding-box"
          style={makeResizeHandleStyles(handle.direction)}
          cx={handle.cx}
          cy={handle.cy}
          r={handleRadius}
          onMouseDown={handle.onMouseDown}
          data-id={id}
        />
      ))}
    </g>
  );
};

export default DragIndicator;
