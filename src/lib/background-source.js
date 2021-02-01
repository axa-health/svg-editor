// @flow

import { PureComponent, type Node } from 'react';
import determineFileType from './util/determine-file-type';

type Source = string | Blob | File | URL;

export type RenderProps = {
  state: 'LOADING',
} | {
  state: 'ERROR',
} | {
  state: 'LOADED',
  url: string,
  width: number,
  height: number,
};

export type RenderPropFunc = (source: RenderProps) => Node

type Props = {|
  source: Source,
  hqPdf?: boolean,
  children: RenderPropFunc,
  fetcher?: (url: string) => Promise<Blob>,
  pdfjs?: () => Promise<any>,
|};

type State = {
  source: RenderProps,
};

function defaultFetcher(url: string): Promise<Blob> {
  return fetch(url).then((res) => res.blob());
}

export default class GenericBackgroundSource extends PureComponent<Props, State> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    fetcher: defaultFetcher,
  }

  constructor(props) {
    super(props);
    this.state = {
      source: { state: 'LOADING' },
    };
  }

  componentDidMount() {
    this.updateSource(this.props.source, this.props.source);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      this.updateSource(this.props.source, this.props.source);
    }
  }

  // eslint-disable-next-line consistent-return
  updateSource = (source: Source, initialSource: Source) => {
    if (typeof window !== 'undefined' && source instanceof window.URL) {
      return this.updateSource(source.toString(), initialSource);
    }

    if (typeof source === 'string') {
      this.setState({ source: { state: 'LOADING' } });

      return this.props.fetcher(source)
        .then(
          (blob) => {
            // stop if source changed in meantime
            if (this.props.source !== initialSource) {
              return;
            }

            // eslint-disable-next-line consistent-return
            return this.updateSource(blob, initialSource);
          },
          (e) => {
            this.setState({ source: { state: 'ERROR', error: { code: 'FETCHER_THREW_ERROR', details: e } } });
          },
        );
    }

    if (source instanceof Blob || source instanceof File) {
      this.setState({ source: { state: 'LOADING' } });

      const blobSource = source;
      return determineFileType(source)
        .then(
          (fileType) => {
            // stop if source changed in meantime
            if (this.props.source !== initialSource) {
              return;
            }

            if (!fileType) {
              this.setState({ source: { state: 'ERROR', error: { code: 'UNKNOWN_FILE_TYPE' } } });
              return;
            }

            if (fileType.type === 'pdf') {
              // eslint-disable-next-line consistent-return
              return this.pdfToPng(blobSource, 1)
                .then(
                  ({ png: url, width, height }) => {
                    // stop if source changed in meantime
                    if (this.props.source !== initialSource) {
                      return;
                    }

                    this.setState({
                      source: {
                        state: 'LOADED',
                        url,
                        width,
                        height,
                      },
                    });

                    // now re-render the PDF in higher quality and update the context afterwards
                    if (this.props.hqPdf) {
                      // eslint-disable-next-line consistent-return
                      return this.pdfToPng(blobSource, 5)
                        .then(
                          ({ png: hqUrl, width: hqWidth, height: hqHeight }) => {
                            // stop if source changed in meantime
                            if (this.props.source !== initialSource) {
                              return;
                            }

                            this.setState({
                              source: {
                                state: 'LOADED',
                                url: hqUrl,
                                width: hqWidth,
                                height: hqHeight,
                              },
                            });
                          },
                          (e) => {
                            console.error('Failed to render PDF in higher quality', e); // eslint-disable-line no-console
                          },
                        );
                    }
                  },
                  (e) => {
                    // stop if source changed in meantime
                    if (this.props.source !== initialSource) {
                      return;
                    }

                    this.setState({ source: { state: 'ERROR', error: { code: 'PDF_TO_PNG_FAILED', details: e } } });
                  },
                );
            }

            const url = (URL || window.webkitURL).createObjectURL(blobSource);

            const img = document.createElement('img');
            const prom = new Promise((res, rej) => {
              img.onload = () => {
                res(img);
              };
              img.onerror = rej;
            });
            img.src = url;

            // eslint-disable-next-line consistent-return
            return prom.then(
              ({ width, height }) => {
                // stop if source changed in meantime
                if (this.props.source !== initialSource) {
                  return;
                }

                this.setState({
                  source: {
                    state: 'LOADED',
                    url,
                    width,
                    height,
                  },
                });
              },
              (e) => {
                // stop if source changed in meantime
                if (this.props.source !== initialSource) {
                  return;
                }

                this.setState({ source: { state: 'ERROR', error: { code: 'DETERMINE_IMG_DIMENSIONS_FAILED', details: e } } });
              },
            );
          },
          (e) => {
            // stop if source changed in meantime
            if (this.props.source !== initialSource) {
              return;
            }

            this.setState({ source: { state: 'ERROR', error: { code: 'DETERMINE_FILE_TYPE_FAILED', details: e } } });
          },
        );
    }

    this.setState({ source: { state: 'ERROR', error: { code: 'UNKNOWN_SOURCE_TYPE', details: source } } });
  }

  pdfToPng = (blob: Blob, zoom: number) => {
    if (!this.props.pdfjs) {
      return Promise.reject(new Error('Missing pdfjs prop in BackgroundSource'));
    }
    return this.props.pdfjs()
      .then((pdfJs) => pdfJs.getDocument(URL.createObjectURL(blob)).promise
        // TODO: validate that there is only one page...
        .then((doc) => doc.getPage(1))
        .then((page) => {
          const viewport = page.getViewport({ scale: zoom, roation: 0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport,
          };

          return page.render(renderContext).promise
            .then(() => {
              let png;

              const height = viewport.height / zoom;
              const width = viewport.width / zoom;

              if (canvas.toBlob) {
                return new Promise((res) => canvas.toBlob(res))
                  .then((b) => {
                    png = (URL || window.webkitURL).createObjectURL(b);
                    return { png, width, height };
                  });
              }

              return {
                png: canvas.toDataURL(),
                width,
                height,
              };
            });
        }));
  }

  render() {
    const { children } = this.props;
    const { source } = this.state;
    return children(source);
  }
}
