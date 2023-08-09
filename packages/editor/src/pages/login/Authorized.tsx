import PageLoading from "@/components/PageLoading";
import { useGlobalStore } from "@/store";
import { message } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function Authorized() {
	const { from = "" } = useParams<{ from: string }>();
	const { userStore } = useGlobalStore();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		if (
			(state !== localStorage.getItem("authState")) ||
			!code
		) {
			message.error("state参数验证失败");
			navigate("/login");
			return;
		}
		localStorage.removeItem("authState");

		userStore
			.userAuth(code, from, `http://localhost:5173/authorized/${from}`)
			.then((rel) => {
				if (rel) {
					navigate("/");
				} else {
					message.error("授权失败");
					// navigate("/login");
				}
			})
			.catch(() => {
				// navigate("/login");
			});
	}, [from, searchParams, navigate, userStore]);

	return <PageLoading />;
}
