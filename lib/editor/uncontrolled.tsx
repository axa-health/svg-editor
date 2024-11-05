import type { FunctionComponent } from 'react';
import React, { useCallback, useState } from 'react';
import Editor, { type Props as EditorProps } from '.';

export type Props = Omit<
  EditorProps,
  'zoom' | 'translateX' | 'translateY' | 'onDrag' | 'onZoom'
> & {
  initialZoom?: number;
  initialTranslateX?: number;
  initialTranslateY?: number;
  onZoom?: (zoom: number) => void;
};

const UncontrolledEditor: FunctionComponent<Props> = ({
  onZoom,
  initialZoom,
  initialTranslateY,
  initialTranslateX,
  ...props
}) => {
  const [zoom, setZoom] = useState(initialZoom || 1);
  const [translateX, setTranslateX] = useState(initialTranslateX || 0);
  const [translateY, setTranslateY] = useState(initialTranslateY || 0);

  const handleDrag = useCallback((x: number, y: number) => {
    setTranslateY(y);
    setTranslateX(x);
  }, []);

  const handleZoom = useCallback(
    (zoomToUse: number) => {
      setZoom(zoomToUse);
      if (onZoom) {
        onZoom(zoomToUse);
      }
    },
    [onZoom],
  );

  return (
    <Editor
      zoom={zoom}
      translateX={translateX}
      translateY={translateY}
      onDrag={handleDrag}
      onZoom={handleZoom}
      {...props}
    />
  );
};

export default UncontrolledEditor;
