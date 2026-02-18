import AuthCallback from "@/components/AuthCallback";
import NavBarLayout from "@/components/layout/NavBarLayout";
import { createBrowserRouter } from "react-router-dom";
import { postsRoutes } from "./posts.routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/home/Home";
import { buildRoutes } from "./build.routes";
import { adminRoutes } from "./admin.routes";
import CenteredLayout from "@/components/layout/CenteredLayout";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/payment/PaymentSuccess";
import PaymentFailure from "@/pages/payment/PaymentFailure";
import PaymentPending from "@/pages/payment/PaymentPending";
import { homeLoader } from "@/pages/home/home.load";
import HomeErrorPage from "@/pages/home/Home.error";
import RootErrorPage from "@/pages/Root.error";
import AppRootLayout from "@/components/layout/AppRootLayout";
import CreateCompanyPage from "@/pages/company/CreateCompany";
import MyReviewsPage from "@/pages/me/reviews/MyReviewsPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";
import ProductsUser from "@/pages/product/ProductUser";
import MyCartPage from "@/pages/me/cart/MyCart";
import MyPurchasesPage from "@/pages/me/purchases/MyPurchasesPage";
import MyProfile from "@/pages/me/profile/MyProfile";
import PostInterestedPage from "@/pages/posts/PostInterestedPage";
import CouponsPage from "@/pages/me/promotion/CouponsPage.tsx";

export const router = createBrowserRouter([
  {
    element: <AppRootLayout />,
    errorElement: <RootErrorPage />,
    children: [
      {
        element: <NavBarLayout />,
        children: [
          { index: true, loader: homeLoader, element: <Home />, errorElement: <HomeErrorPage /> },
          { path: "auth-callback", element: <AuthCallback /> },
          postsRoutes,
          buildRoutes,
          adminRoutes,
          { path: "products/:skuPrefix", element: <ProductDetailPage /> },
          { path: "market", element: <ProductsUser /> },
          {
            element: <ProtectedRoute />,
            children: [
              { path: "profile", element: <MyProfile /> },
              { path: "create-company", element: <CreateCompanyPage /> },
              { path: "cart", element: <MyCartPage /> },
              { path: "purchases", element: <MyPurchasesPage /> },
              { path: "reviews/me", element: <MyReviewsPage /> },
              { path: "coupons", element: <CouponsPage /> },
            ],
          },
          { path: "posts/:id/interested", element: <PostInterestedPage /> },
        ],
      },
      {
        element: <CenteredLayout />,
        children: [
          { path: "checkout/:preferenceId", element: <Checkout /> },
          {
            path: "payment",
            children: [
              { path: "success", element: <PaymentSuccess /> },
              { path: "pending", element: <PaymentPending /> },
              { path: "failure", element: <PaymentFailure /> },
            ],
          },
        ],
      },
    ],
  }
])
