import React from 'react';

export default class PageLayout extends React.PureComponent {
  render () {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    return children;
  }
}
