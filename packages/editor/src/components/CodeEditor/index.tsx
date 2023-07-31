import Editor, { loader } from "@monaco-editor/react";
import { useDebounceFn, useUpdateEffect } from "ahooks";
import { useCallback, useEffect, useState } from "react";

loader.config({ paths: { vs: 'http://cdn.staticfile.org/monaco-editor/0.40.0/min/vs' } });

interface CodeEditorProps {
	language: "json" | "javascript" | "typescript" | "css";
	width?: number | string;
	height?: number | string;
	defaultValue?: string;
	value?: string;
	onChange?: (value?: string) => void;
	readOnly?: boolean;
}

export default function CodeEditor({
	language,
	width,
	height,
	defaultValue,
	value,
	readOnly,
	onChange,
}: CodeEditorProps) {
	
	const [code, setCode] = useState(value);

	useUpdateEffect(()=>{
		setCode(value)
	}, [value])

	const { run } = useDebounceFn(
    (code?:string) => {
			if(onChange) onChange(code);
    },
    {
      wait: 500,
    },
  );

	const changeHandler = useCallback((code?:string)=>{
		setCode(code);
		run(code);
	}, [run])

	return (
		<Editor
			theme="vs-dark"
			height={height}
			width={width}
			language={language}
			options={{
				lineNumbersMinChars: 1,
				minimap: { enabled: false },
				readOnly,
			}}
			defaultValue={defaultValue}
			value={code}
			onChange={changeHandler}
		/>
	);
}
