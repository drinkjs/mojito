import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";
import { ConfigProvider, theme } from "antd";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";

// export const dark = {
// 	borderRadius: 4,
// 	colorPrimary: "#177ddc",
// 	colorPrimaryBg: "#28282D",
// 	colorBgLayout: "#000000",
// 	colorText: "rgba(255, 255, 255, 0.7)",
// 	colorSplit: "rgba(253, 253, 253, 0.12)",
// 	mgColorScrollbar: "#444",
// 	mgColorSlick: "#fff",
// 	mgColorEmailNormal: "#018715",
// 	mgColorEmailProcess: "#026bcf",
// 	mgColorEmailError: "#a60303",
// };

export default function Root() {
	return (
		<ConfigProvider
			locale={zhCN}
			theme={{
				// algorithm: themeDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
				// token: themeDark ? dark : light,
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
			<Suspense fallback={<p>loading...</p>}>
				<Outlet />
			</Suspense>
		</ConfigProvider>
	);
}
