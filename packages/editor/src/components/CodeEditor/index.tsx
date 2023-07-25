import Editor from "@monaco-editor/react";


interface CodeEditorProps {
    language: "json" | "javascript" | "typescript";
    width?: number | string;
    height?: number | string;
    defaultValue?:string
		onChange?:(value?:string) => void
}

export default function CodeEditor({language, width, height, defaultValue, onChange}: CodeEditorProps) {
	return (
		<Editor
			theme="vs-dark"
			height={height}
			width={width}
      language={language}
			options={{ lineNumbersMinChars: 1, minimap: { enabled: false } }}
      defaultValue={defaultValue}
			onChange={onChange}
		/>
	);
}
