import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {catalogShape} from '../../CatalogPropTypes';
import FrameComponent from './FrameComponent';
import runscript from '../../utils/runscript';

const frameStyle = {
  width: '100%',
  height: '100%',
  lineHeight: 0,
  margin: 0,
  padding: 0,
  border: 'none'
};

const renderStyles = (styles) => {
  return styles.map((src, i) => <link key={i} href={src} rel='stylesheet' type='text/css' />);
};

export default class Frame extends Component {
  constructor() {
    super();
    this.state = {};
    this.firstRun = true;
  }

  renderDidFinish() {
    const {runScript} = this.props;

    if (runScript && this.firstRun) {
      this.evalFrameScripts();
    }

    this.firstRun = false;
  }

  evalFrameScripts() {
    const scope = this.frame.iframe.contentDocument;
    const headScripts = Array.from(scope.head.querySelectorAll('script'));
    const bodyScripts = Array.from(scope.body.querySelectorAll('script'));

    bodyScripts.forEach((bodyScript) => {
      // const scriptAlreadyExecuted = headScripts.some((headScript) => {
      //   return headScript.textContent === bodyScript.textContent;
      // });

      // if (scriptAlreadyExecuted) {
      //   return;
      // }

      runscript(bodyScript);
    });
  }

  render() {
    const {children, width, parentWidth, scrolling} = this.props;
    const {catalog: {page: {styles}}} = this.context;
    const height = this.state.height || this.props.height;
    const autoHeight = !this.props.height;
    const scale = Math.min(1, parentWidth / width);
    const scaledHeight = autoHeight ? height : height * scale;

    const onRender = (content) => {
      if (!autoHeight) {
        this.renderDidFinish();

        return;
      }

      const contentHeight = content.offsetHeight;

      if (contentHeight !== height) {
        this.setState({height: contentHeight});
      }

      this.renderDidFinish();
    };

    return (
      <div style={{lineHeight: 0, width: parentWidth, height: scaledHeight}}>
        <div style={{
          width: width,
          height: height,
          transformOrigin: '0% 0%',
          transform: `scale( ${scale} )`,
          overflow: 'hidden'
        }}>
          <FrameComponent
            ref={(frame) => {this.frame = frame;}}
            style={frameStyle}
            frameBorder='0'
            scrolling={scrolling}
            head={[
              <style key='stylereset'>{'html,body{margin:0;padding:0;}'}</style>,
              ...renderStyles(styles)
            ]}
            onRender={onRender}
          >
            {children}
          </FrameComponent>
        </div>
      </div>
    );
  }
}

Frame.propTypes = {
  children: PropTypes.element,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  parentWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  scrolling: PropTypes.oneOf(['yes', 'no', 'auto']),
  runScript: PropTypes.bool
};

Frame.contextTypes = {
  catalog: catalogShape.isRequired
};
