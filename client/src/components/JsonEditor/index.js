import React, { useRef, useEffect } from 'react';
import { JSONEditor } from '@json-editor/json-editor';

// eslint-disable-next-line react/prop-types
const MyJsonEditor = ({ style }) => {
  const editRef = useRef();

  useEffect(() => {
    const editor = new JSONEditor(editRef.current);
    console.log(editor);
  }, []);

  return (
    <div
      style={{ ...style }}
      ref={(ref) => {
        editRef.current = ref;
      }}
    ></div>
  );
};

export default MyJsonEditor;
