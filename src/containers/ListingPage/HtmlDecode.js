import React, { Component } from 'react';
import { bool, node, string } from 'prop-types';
import classNames from 'classnames';

class HtmlDecode extends Component {
  constructor(props) {
    super(props);
    this.state = { mounted: false };
  }
  componentDidMount() {
    this.setState({ mounted: true }); // eslint-disable-line react/no-did-mount-set-state
  }
  decodeString(inString) {
    return inString.replaceAll("＜", "<").replaceAll("＞", ">");
  }
  render() {
    const {
      htmlString,
      ...rest
    } = this.props;

    return (
      <div dangerouslySetInnerHTML={{ __html: this.decodeString(htmlString) }} />
    );
  }
}

export default HtmlDecode;
