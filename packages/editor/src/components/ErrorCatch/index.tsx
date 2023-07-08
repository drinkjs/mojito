import React, { CSSProperties, ReactElement } from 'react';

interface ErrorCatchProps{
  style?:CSSProperties, 
  children:ReactElement
}

export default class ErrorCatch extends React.Component<ErrorCatchProps> {
  state:{error:any, info:any} = {
    error: null,
    info: null
  };

  constructor(props:ErrorCatchProps){
    super(props)
  }

  componentDidCatch (error:any, info:any) {
    this.setState({ error, info });
    // 上传错误到到服务器
    // logErrorToMyService(error, info);
  }

  render () {
    const { error, info } = this.state;
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
          {info?.componentStack}
        </div>
      );
    }
    return children;
  }
}
