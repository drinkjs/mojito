import dayjs from "dayjs";
import * as babel from "@babel/standalone";

export function dateFormat(date: string | Date, format?: string) {
	if (!format) {
		format = "YYYY-MM-DD HH:mm:ss";
	}
	return dayjs(new Date(date)).format(format);
}

export function getPackScriptUrl(packJsonUrl: string, packName: string) {
	const path = packJsonUrl.substring(
		0,
		packJsonUrl.indexOf("mojito-pack.json")
	);
	return `${path}${packName}.js`;
}

export function smallId() {
	return Date.now().toString(36);
}

export function compileCode(input: string) {
	const result = babel.transform(input, {
		presets: [
			"env",
		],
		sourceType: "unambiguous",
	});
	return result;
}

export function runCode(code:string){
  try{
    const exports = {}; 
    return eval(code);
  }catch(e){
    console.error(e)
  }
}