import { createBrowserRouter } from "react-router-dom";
import Project from "../pages/project";
import Screen from "../pages/screen"
import ErrorPage from "./ErrorPage";
import Root from "./Root";

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
        path: "screen/:id",
        element: <Screen />,
      },
    ],
  },
]);