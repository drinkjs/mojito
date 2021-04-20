import React, { useRef, useEffect } from 'react';
import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-twilight';

// interface Props {
//   style?:React.CSSProperties,
//   onChange?:(value?:string)=>void;
//   value?:string;
//   mode?:"json"|"javascript"|"css"
// }

const CodeEditor = (props) => {
  // eslint-disable-next-line react/prop-types
  const { style, value, onChange, mode = 'json', onReady } = props;
  const editRef = useRef();
  const aceEditor = useRef();
  const currCode = useRef();

  useEffect(() => {
    const editor = ace.edit(editRef.current);
    aceEditor.current = editor;
    editor.setTheme('ace/theme/twilight');
    editor.session.setMode(`ace/mode/${mode}`);
    editor.setFontSize(14);
    editor.session.setOptions(
      { tabSize: 2, useSoftTabs: true }
    )
    editor.setValue(value || '', 1);
    currCode.current = value || '';
    editor.on('change', () => {
      const val = editor.getValue();
      if (onChange && currCode.current !== val) {
        currCode.current = val;
        onChange(val);
      }
    });

    if (onReady) {
      onReady(editor);
    }

    return () => {
      aceEditor.current = null;
      editor.on('change', undefined);
      editor.destroy();
      editor.container.remove();
    };
  }, []);

  // useEffect(() => {
  //   aceEditor.current &&
  //     currCode.current !== value &&
  //     aceEditor.current.setValue(value);
  // }, [value]);

  return (
    <div
      style={{ ...style }}
      ref={(ref) => {
        editRef.current = ref;
      }}
    ></div>
  );
};

export default CodeEditor;
