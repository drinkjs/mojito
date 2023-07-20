import dayjs from "dayjs";

export function dateFormat(date:string | Date, format?:string){
  if(!format){
    format = "YYYY-MM-DD HH:mm:ss"
  }
  return dayjs(new Date(date)).format(format)
}

export function getPackScriptUrl(packJsonUrl:string, packName:string){
  const path = packJsonUrl.substring(
    0,
    packJsonUrl.indexOf("mojito-pack.json")
  );
  return `${path}${packName}.js`
}

export function smallId(){
  return Date.now().toString(36)
}