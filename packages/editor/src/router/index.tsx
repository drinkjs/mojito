import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import ErrorPage from "./ErrorPage";
import Root from "./Root";

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
