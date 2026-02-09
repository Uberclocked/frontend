import { Routes, Route } from "react-router-dom";

import Components from "@/pages/admin/Components.tsx";
import MyPurchasesPage from "@/pages/user/MyPurchasesPage.tsx";
import ProductsUser from "@/pages/user/ProductUser.tsx";

import AuthCallback from "../src/components/AuthCallback.tsx";

import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/admin/Product.tsx";
import Home from "./pages/Home";
import PostsFeed from "./pages/PostsFeed.tsx";
import CartPage from "./pages/user/Cart.tsx";
import CreateCompanyPage from "./pages/user/CreateCompany.tsx";
import CreatePostPage from "./pages/user/CreatePost.tsx";
import MyPosts from "./pages/user/MyPosts.tsx";
import Profile from "./pages/user/Profile.tsx";
import AdminAllPurchasesPage from "@/pages/admin/AdminAllPurchasesPage.tsx";
import ProductDetailPage from "@/pages/ProductDetailPage.tsx";
import MyReviewsPage from "@/pages/user/MyReviewsPage.tsx";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage.tsx";
import PcBuilderPage from "@/pages/user/PcBuilderPage.tsx";
import PostDetailPage from "@/pages/user/PostDetailPage.tsx";
import AdminPostsPage from "@/pages/admin/AdminPostsPage.tsx";
import NavBarLayout from "./components/layout/NavBarLayout.tsx";
import { useEffect } from "react";
import Checkout from "./pages/Checkout.tsx";
import { initMercadoPago } from "@mercadopago/sdk-react";
import CenteredLayout from "./components/layout/CenteredLayout.tsx";



function App() {
  useEffect(() => {
    initMercadoPago("APP_USR-f45751b2-3f8c-4740-8343-ec69dc9a0c70")
  }, []);

  return (
    <Routes>
      <Route element={<NavBarLayout />}>
        <Route index element={<Home />} />
        <Route path="auth-callback" element={<AuthCallback />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-company"
          element={
            <ProtectedRoute>
              <CreateCompanyPage />
            </ProtectedRoute>
          }
        />
        <Route path="posts" element={<PostsFeed />} />

        <Route
          path="posts/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="posts/:id"
          element={
            <PostDetailPage />
          }
        />
        <Route
          path="posts/me"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-purchases"
          element={
            <ProtectedRoute>
              <MyPurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="all-purchases"
          element={
            <ProtectedRoute>
              <AdminAllPurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:skuPrefix"
          element={
            <ProductDetailPage />
          }
        />
        <Route path="components" element={
          <ProtectedRoute>
            <Components />
          </ProtectedRoute>
        }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="market"
          element={
            <ProductsUser />
          }
        />
        <Route
          path="reviews/me"
          element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reviews"
          element={
            <ProtectedRoute>
              <AdminReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pc-builder"
          element={
            <ProtectedRoute>
              <PcBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="pc-builder/:itemId"
          element={
            <ProtectedRoute>
              <PcBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/posts"
          element={
            <ProtectedRoute>
              <AdminPostsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="checkout/:preferenceId" element={<CenteredLayout />}>
        <Route index element={<Checkout />} />
      </Route>
    </Routes>
  );
}

export default App;
