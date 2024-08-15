import React, { Fragment, type Node } from 'react';
import ArtboardPen from './pen';
import ArtboardRect from './rect';
import ArtboardEllipse from './ellipse';
import ArtboardLine from './line';
import ArtboardCrop from './crop';
import ArtboardText from './text';

type Props = {
  drawMode: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop',
  height: number,
  width: number,
  children: Node,
  onCropEnd: Function,
  onDrawEnd: Function,
  onDrawStart: () => void,
  onCropStart: () => void,
};

const ArtboardComponent = (props: Props) => {
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

  return (
    // $FlowFixMe #yolor
    <Artboard
      {...props}
    />
  );
};

export default ArtboardComponent;
