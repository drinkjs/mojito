import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import ErrorPage from "./ErrorPage";
import Root from "./Root";

const Login = lazy(() => import("../pages/login"));
const Authorized = lazy(() => import("../pages/login/Authorized"));
const Project = lazy(() => import("../pages/project"));
const Screen = lazy(() => import("../pages/screen"));
const Preview = lazy(() => import("../pages/screen/Preview"));

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "",
				element: <Project />,
			},
			{
				path:"/login",
				element: <Login />,
			},
			{
				path:"/authorized/:from",
				element: <Authorized />,
			},
			{
				path: "editor/:id",
				element: <Screen />,
			},
			{
				path: "preview/:id",
				element: <Preview />,
			},
		],
	},
]);
