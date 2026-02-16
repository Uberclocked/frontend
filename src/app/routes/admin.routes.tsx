import AdminAllPurchasesPage from "@/pages/admin/AdminAllPurchasesPage";
import AdminPostsPage from "@/pages/admin/AdminPostsPage";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";
import Components from "@/pages/admin/Components";
import Products from "@/pages/admin/Product";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
  path: "admin",
  children: [
    { path: "purchases", element: <AdminAllPurchasesPage /> },
    { path: "components", element: <Components /> },
    { path: "products", element: <Products /> },
    { path: "reviews", element: <AdminReviewsPage /> },
    { path: "posts", element: <AdminPostsPage /> },
  ],
}
