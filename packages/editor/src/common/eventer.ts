export class MojitoEvent<T> extends Event{
  data?:T
  constructor(type:string, data?:T){
    super(type);
    this.data = data;
  }
}

const evener = new EventTarget();
const eventemitter = {
  emit: (event:string, data?:any)=> evener.dispatchEvent(new MojitoEvent(event, data)),
  on: evener.addEventListener.bind(this),
  off: evener.removeEventListener.bind(this)
}

export default eventemitter