import { Request } from '@mojito/common/network';
import { message } from 'antd';

const request = new Request({
  prefix: '/api',
});

request.interceptors.response.use(async (response)=>{
  const rel = await response.clone().json();
  if(!rel){
    return;
  }

  if (rel.code === 0) {
    return rel.data;
  }else if(rel.msg){
    message.error(rel.msg)
  }
})

export const {get, post, list} = request;

export default request