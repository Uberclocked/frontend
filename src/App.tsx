import { Routes, Route } from "react-router-dom";


import AuthCallback from "../src/components/AuthCallback.tsx";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCompanyPage from "./pages/CreateCompany.tsx";
import CreatePostPage from "./pages/CreatePost.tsx";
import Home from "./pages/Home";
import MyPosts from "./pages/MyPosts.tsx";
import PostsFeed from "./pages/PostsFeed.tsx";
import Profile from "./pages/Profile";


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
            </Routes>
        </>
    );
}

export default App;
