import ProtectedRoute from "@/components/ProtectedRoute";
import MyCartPage from "@/pages/me/cart/MyCart";
import MyReviewsPage from "@/pages/me/reviews/MyReviewsPage";
import MyPosts from "@/pages/me/posts/MyPosts";
import Profile from "@/pages/me/profile/Profile";
import type { RouteObject } from "react-router-dom";
import MyPurchasesPage from "@/pages/me/purchases/MyPurchasesPage";

export const meRoutes: RouteObject = {
  path: "me",
  element: <ProtectedRoute />,
  children: [
    { path: "cart", element: <MyCartPage /> },
    { path: "posts", element: < MyPosts /> },
    { path: "profiles", element: <Profile /> },
    { path: "purchases", element: <MyPurchasesPage /> },
    { path: "reviews", element: <MyReviewsPage /> },
  ]
}
