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

const ArtboardComponent: FunctionComponent<Props> = (props) => {
  let Artboard: FunctionComponent<Props> | undefined;

  switch (props.drawMode) {
    case 'pen':
      Artboard = ArtboardPen;
      break;
    case 'rect':
      Artboard = ArtboardRect;
      break;
    case 'text':
      Artboard = ArtboardText;
      break;
    case 'ellipse':
      Artboard = ArtboardEllipse;
      break;
    case 'line':
      Artboard = ArtboardLine;
      break;
    case 'crop':
      Artboard = ArtboardCrop;
      break;
    default:
      if (props.drawMode) {
        console.warn('Unknown drawMode', props.drawMode);
      }
  }

  if (!Artboard) {
    return <>{props.children}</>;
  }

  return <Artboard {...props} />;
};

export default ArtboardComponent;
