import { useMount, useUnmount } from "ahooks";
import Header from "./components/Header";
import LeftSide from "./components/LeftSide";
import Playground from "./components/Playground";
import RightSide from "./components/RightSide";
import { useCanvasStore } from "./hook";
import styles from "./styles/index.module.css"

export default function Screen(){
  const {id, canvasStore, destroyStore} = useCanvasStore();

  useMount(()=>{
    canvasStore.getDetail(id);
  });

  useUnmount(()=>{
    destroyStore();
  })

  
  
  return (
    <div className={styles.root}>
      <Header />
      <div className={styles.area}>
        <LeftSide />
        <Playground />
        <RightSide />
      </div>
    </div>
  )
}