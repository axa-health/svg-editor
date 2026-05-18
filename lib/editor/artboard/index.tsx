import type { FunctionComponent, PropsWithChildren } from 'react';
import type { Drawable } from '../drawables';
import type { Crop } from './crop';
import ArtboardCrop from './crop';
import ArtboardEllipse from './ellipse';
import ArtboardLine from './line';
import ArtboardPen from './pen';
import ArtboardRect from './rect';
import ArtboardText from './text';

type Props = PropsWithChildren<{
  drawMode: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop' | 'text';
  height: number;
  width: number;
  onCropEnd: (crop: Crop) => void;
  onDrawEnd: (drawable: Drawable) => void;
  onDrawStart: () => void;
  onCropStart: () => void;
  drawingStroke: string;
  drawingStrokeWidth: number;
  drawingFill: string;
  minHeight: number;
  minWidth: number;
  fontSize: number;
  text: ReadonlyArray<string>;
}>;

const artboards: Record<NonNullable<Props['drawMode']>, FunctionComponent<Props>> = {
  pen: ArtboardPen,
  rect: ArtboardRect,
  text: ArtboardText,
  ellipse: ArtboardEllipse,
  line: ArtboardLine,
  crop: ArtboardCrop,
};

const ArtboardComponent: FunctionComponent<Props> = (props) => {
  const Artboard = props.drawMode ? artboards[props.drawMode] : undefined;

  if (!Artboard) {
    return <>{props.children}</>;
  }

  return <Artboard {...props} />;
};

export default ArtboardComponent;
