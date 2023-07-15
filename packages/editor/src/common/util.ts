import dayjs from "dayjs";

export function dateFormat(date:string | Date, format?:string){
  if(!format){
    format = "YYYY-MM-DD HH:mm:ss"
  }
  return dayjs(new Date(date)).format(format)
}