import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";
import { ConfigProvider, theme } from "antd";
import { Outlet } from "react-router-dom";

export const dark = {
  borderRadius: 4,
  colorPrimary: "#177ddc",
  colorPrimaryBg: "#28282D",
  colorBgLayout: "#000000",
  colorText: "rgba(255, 255, 255, 0.7)",
  colorSplit: "rgba(253, 253, 253, 0.12)",
	mgColorScrollbar: '#444',
  mgColorSlick:"#fff",
  mgColorEmailNormal:"#018715",
  mgColorEmailProcess:"#026bcf",
  mgColorEmailError:"#a60303",
}

export default function Root() {
	return (
		<ConfigProvider
			locale={zhCN}
			theme={{
				// algorithm: themeDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
				// token: themeDark ? dark : light,
				algorithm: theme.darkAlgorithm,
				token: dark,
			}}
		>
			<Outlet />
		</ConfigProvider>
	);
}
