import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store";

const { VITE_TOKEN, VITE_NO_LOGIN } = import.meta.env;

export default function AuthorizedRoot() {
	const { userStore } = useGlobalStore();
	const [token] = useState(() => localStorage.getItem("token") || VITE_TOKEN);
	const navigate = useNavigate();

	useEffect(() => {
		if (token) {
			userStore.userRefresh();
		} else {
			if (VITE_NO_LOGIN) {
				userStore.userAuth("123456", "local").then(res =>{
					if(res){
						window.location.reload()
					}
				})
			} else {
				navigate("/login");
			}
		}
	}, [userStore, navigate, token]);

	return token ? <Outlet /> : null;
}
