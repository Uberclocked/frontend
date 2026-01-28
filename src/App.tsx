import { Routes, Route } from "react-router-dom";

import Components from "@/pages/admin/Components.tsx";
import ProductsUser from "@/pages/user/ProductUser.tsx";

import AuthCallback from "../src/components/AuthCallback.tsx";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/admin/Product.tsx";
import Home from "./pages/Home";
import PostsFeed from "./pages/PostsFeed.tsx";
import CartPage from "./pages/user/Cart.tsx";
import CreateCompanyPage from "./pages/user/CreateCompany.tsx";
import CreatePostPage from "./pages/user/CreatePost.tsx";
import MyPosts from "./pages/user/MyPosts.tsx";
import Profile from "./pages/user/Profile.tsx";
import PurchasesPage from "./pages/user/Purchase.tsx";



function App() {
    return (
        <>
            <NavBar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-company"
                    element={ 
                    <ProtectedRoute>
                        <CreateCompanyPage />
                    </ProtectedRoute>
                    }
                />
                <Route path="/posts" element={<PostsFeed />} />

                <Route
                    path="/posts/create"
                    element={
                        <ProtectedRoute>
                            <CreatePostPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/posts/me"
                    element={
                        <ProtectedRoute>
                            <MyPosts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/purchases/me"
                    element={
                        <ProtectedRoute>
                            <PurchasesPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/components" element={
                    <ProtectedRoute>
                        <Components />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/market"
                    element={
                            <ProductsUser />
                    }
                />
            </Routes>
        </>
    );
}

export default App;
