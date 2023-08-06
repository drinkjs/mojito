import Editor, { loader, Monaco } from "@monaco-editor/react";
import {isEqual, } from "lodash-es";
import { useDebounceFn, useUpdateEffect } from "ahooks";
import { useCallback, useRef, useState } from "react";

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
	const monacoRef = useRef<Monaco | null>(null);
	const [code, setCode] = useState(value || defaultValue);

	const handleEditorDidMount = (_: any, monaco: Monaco)=>{
		monacoRef.current = monaco;
	}
	
	useUpdateEffect(()=>{
		if(value && language === "json"){
			try{
				setCode((oldValue) =>{
					if(!oldValue){
						return value;
					}else if(!isEqual(JSON.parse(value), JSON.parse(oldValue))){
						return value;
					}
					return oldValue;
				})
			}catch(e){
				console.error(e);
			}
		}else{
			setCode(value ?? "")
		}
	}, [value, language])

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
			onMount={handleEditorDidMount}
		/>
	);
}
