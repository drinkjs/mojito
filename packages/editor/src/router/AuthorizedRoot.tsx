import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store";

export default function AuthorizedRoot() {
	const { userStore } = useGlobalStore();
	const [token] = useState(() => localStorage.getItem("token"));
	const navigate = useNavigate();

	useEffect(() => {
		if (token) {
      userStore.userRefresh();
		}else{
      navigate("/login");
    }
	}, [userStore, navigate, token]);

	return (
    token ? <Outlet /> : null
	);
}
