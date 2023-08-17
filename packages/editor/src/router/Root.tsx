import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";
import { ConfigProvider, theme } from "antd";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import PageLoading from "@/components/PageLoading";

export default function Root() {

	return (
		<ConfigProvider
			locale={zhCN}
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorPrimary: "#378cb7",
					borderRadius: 4,
					colorBgContainer: "#212c3d",
					colorBgElevated: "#212c3d",
					controlOutlineWidth: 0,
				},
			}}
		>
			<Suspense fallback={<PageLoading />}><Outlet /></Suspense>
		</ConfigProvider>
	);
}
