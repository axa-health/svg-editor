import type { FunctionComponent, PropsWithChildren } from 'react';
import React from 'react';
import ArtboardPen from './pen';
import ArtboardRect from './rect';
import ArtboardEllipse from './ellipse';
import ArtboardLine from './line';
import type { Crop } from './crop';
import ArtboardCrop from './crop';
import ArtboardText from './text';
import type { Drawable } from '../drawables';

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
  let Artboard;

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
        console.warn('Unknown drawMode', props.drawMode); // eslint-disable-line
      }
  }

  if (!Artboard) {
    return <>{props.children}</>;
  }

  return <Artboard {...props} />;
};

export default ArtboardComponent;
