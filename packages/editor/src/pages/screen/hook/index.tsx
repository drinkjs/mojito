import Canvas from "@/store/Canvas";
import { useCreateLocalStore } from "fertile";
import { useParams } from "react-router-dom";


export function useCanvasStore() {
	const { id = "canvas" } = useParams<{ id: string }>();
	const { useStore, destroyStore } = useCreateLocalStore(()=>({ canvasStore: new Canvas() }), id);
	const { canvasStore } = useStore();
	return { canvasStore, id, destroyStore };
}
