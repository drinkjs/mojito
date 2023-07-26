import Editor from "@monaco-editor/react";


interface CodeEditorProps {
    language: "json" | "javascript" | "typescript";
    width?: number | string;
    height?: number | string;
    defaultValue?:string,
		value?:string,
		onChange?:(value?:string) => void,
		readOnly?:boolean
}

export default function CodeEditor({language, width, height, defaultValue, value, readOnly, onChange}: CodeEditorProps) {
	return (
		<Editor
			theme="vs-dark"
			height={height}
			width={width}
      language={language}
			options={{ lineNumbersMinChars: 1, minimap: { enabled: false }, readOnly}}
      defaultValue={defaultValue}
			value={value}
			onChange={onChange}
		/>
	);
}
