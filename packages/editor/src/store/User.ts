import { auth, refresh } from "@/services/user";

export default class User {
  token?:string;
  name?:string;
  id?:string;
  avatarUrl?: string

  loading = false;
  
  async userAuth(code:string, from:string, redirectUri?:string){
    if(this.loading) return Promise.reject();

    this.loading = true;
    return auth({code, from, redirectUri}).then((data)=>{
      if(data){
        this.token = data.token;
        this.name = data.name;
        this.id = data.id;
        this.avatarUrl = data.avatarUrl;
        localStorage.setItem("token", data.token);
        return true;
      }else{
        this.token = undefined;
        this.name = undefined;
        this.id = undefined;
        this.avatarUrl = undefined;
        localStorage.removeItem("token");
        return false;
      }
    }).finally(()=>{
      this.loading = false;
    })
  }

  async userRefresh(){
    if(this.loading) return Promise.reject();
    
    this.loading = true;
    return refresh().then((data)=>{
      if(data){
        this.name = data.name;
        this.id = data.id;
        this.avatarUrl = data.avatarUrl;
        return true;
      }else{
        this.token = undefined;
        this.name = undefined;
        this.id = undefined;
        this.avatarUrl = undefined;
        return false;
      }
    }).finally(()=>{
      this.loading = false;
    })
  }
}