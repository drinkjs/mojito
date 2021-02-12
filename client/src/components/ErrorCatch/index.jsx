import * as React from 'react';

export default class ErrorCatch extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    error: null,
    info: null
  };

  componentDidCatch (error, info) {
    this.setState({ error, info });
    // 上传错误到到服务器
    // logErrorToMyService(error, info);
  }

  render () {
    const { error, info } = this.state;
    // eslint-disable-next-line react/prop-types
    const { children, style } = this.props;
    if (error) {
      return (
        <div
          style={{
            ...style,
            color: '#cc0000'
          }}
        >
          发生错误: {error.toString()}
          <br />
          {info.componentStack}
        </div>
      );
    }
    return children;
  }
}
