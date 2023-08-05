export const DefaultLayerSize = {
	width: 300,
	height: 200,
};

export const DefaultPageSize = { width: 1920, height: 1080 };

export const MojitoLayerEvent = {
	onMount: "__mojito_c_mount__",
	onUnmount: "__mojito_c_unmount__",
	onMessage: "__mojito_c_message__",
	sendMessage: "__mojito_c_send_message__"
}

export const MojitoLayerEventInfo = [
	{
		eventName: MojitoLayerEvent.onMount,
		name:"组件加载"
	},
	{
		eventName: MojitoLayerEvent.onUnmount,
		name:"组件卸载"
	},
	{
		eventName: MojitoLayerEvent.onMessage,
		name:"接收消息"
	},
]