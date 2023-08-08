import dayjs from "dayjs";
import { minify } from "terser";

export function dateFormat(date: string | Date, format?: string) {
	if (!format) {
		format = "YYYY-MM-DD HH:mm:ss";
	}
	return dayjs(new Date(date)).format(format);
}

export function formatPackScriptUrl(packJsonUrl: string, packName: string) {
	const path = packJsonUrl.substring(
		0,
		packJsonUrl.indexOf("mojito-pack.json")
	);
	return `${path}${packName}.js`;
}

export function smallId() {
	return Date.now().toString(36);
}

let babel: any
export async function compileCode(input: string) {
	if (!babel) {
		babel = await import("@babel/standalone")
	}
	const min = await minify(input);
	const result = babel.transform(min.code, {
		presets: [
			"env",
		],
		sourceType: "unambiguous",
	});
	return result;
}

export function runCode(code: string) {
	try {
		const exports = {};
		console.log(exports)
		return eval(code);
	} catch (e) {
		console.error(e)
	}
}

export const localCache = {
  get(key:string){
    const cache = localStorage.getItem(key);
    if(cache){
      try{
        return JSON.parse(cache);
      }catch{
        return cache;
      }
    }
  },

  set(key:string, value:any){
    if(typeof value === "object"){
      localStorage.setItem(key, JSON.stringify(value));
    }else{
      localStorage.setItem(key, value);
    }
  }
}