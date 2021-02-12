import * as React from 'react'
import * as monaco from 'monaco-editor'

interface Props {
  value?: string;
  onCreate?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  language?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  opts?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export default (props: Props) => {
  const { value, onCreate, onChange, language, style, opts } = props
  const ref = React.useRef<HTMLDivElement|null>()
  const inChange = React.useRef(false)
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>()

  React.useEffect(() => {
    if (!ref.current) { return; }
    const editor = monaco.editor.create(ref.current, {
      value,
      language: language || 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
      ...opts
    })
    editorRef.current = editor
    if (onCreate) onCreate(editor)

    if (onChange) {
      editor.getModel()!.onDidChangeContent(() => {
        if (inChange.current) {
          inChange.current = false
          return
        }
        const val = editor.getValue()
        onChange(val)
      })
    }

    return () => {
      editor.getModel()!.dispose()
      editor.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (editorRef.current) {
      inChange.current = true
      editorRef.current.setValue(value || '')
    }
  }, [value])

  return <div style={{ ...style }} ref={(r) => { ref.current = r }} />
}
