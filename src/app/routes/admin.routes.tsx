import AdminAllPurchasesPage from "@/pages/admin/AdminAllPurchasesPage";
import AdminPostsPage from "@/pages/admin/AdminPostsPage";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";
import Components from "@/pages/admin/Components";
import Products from "@/pages/admin/Product";
import type { RouteObject } from "react-router-dom";
import AdminPromotionsPage from "@/pages/admin/promotion/AdminPromotionsPage.tsx";
import AdminCompaniesPage from "@/pages/admin/company/AllCompanies.tsx";

export const adminRoutes: RouteObject = {
  path: "admin",
  children: [
    { path: "purchases", element: <AdminAllPurchasesPage /> },
    { path: "components", element: <Components /> },
    { path: "companies", element: <AdminCompaniesPage /> },
    { path: "products", element: <Products /> },
    { path: "promotions", element: <AdminPromotionsPage /> },
    { path: "reviews", element: <AdminReviewsPage /> },
    { path: "posts", element: <AdminPostsPage /> },
  ],
}
