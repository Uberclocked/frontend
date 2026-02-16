import BuilderPage from "@/pages/builder/BuilderPage";
import { builderPageLoader } from "@/pages/builder/BuilderPage.loader";
import type { RouteObject } from "react-router-dom";

export const buildRoutes: RouteObject = {
  path: "build",
  children: [
    { index: true, loader: builderPageLoader, element: <BuilderPage />, },
    { path: ":itemId", element: <BuilderPage /> }
  ]
}
