import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/LoginPage";
import Signup from "./pages/auth/SignUpPage";
import Homepage from "./pages/HomePage";
import NotificationPage from "./pages/NotificationPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";

function App() {
  // Retrieve JWT from localStorage
  const getAuthToken = () => localStorage.getItem("jwt-linkedin");

  // Fetch authenticated user details
  const { data: authUser, isLoading, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const token = getAuthToken();
      console.log(token);

      // If token is missing, return null to indicate unauthenticated state
      if (!token) {
        console.log("No token found. User is unauthenticated.");
        return null;
      }

      try {
        // API call to fetch user details without passing headers since it's handled by the interceptor
        const res = await axiosInstance.get("/auth/me");
        console.log("Auth User:", res.data); // Log user details for debugging
        return res.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "An unexpected error occurred.");
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Prevent caching stale results
  });

  // Refetch user details when token changes
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      console.log("Token found. Refetching user details...");
      refetch();
    }
  }, [refetch]);

  // Show loading UI while user data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Define application routes */}
      <Routes>
        {/* Home page - Only accessible to authenticated users */}
        <Route
          path="/"
          element={authUser ? <Homepage /> : <Navigate to="/login" />}
        />

        {/* Signup page - Redirect if already logged in */}
        <Route
          path="/signup"
          element={!authUser ? <Signup /> : <Navigate to="/" />}
        />

        {/* Login page - Redirect if already logged in */}
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />

        {/* Notifications page - Accessible only to authenticated users */}
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />

        {/* Network page - Accessible only to authenticated users */}
        <Route
          path="/network"
          element={authUser ? <NetworkPage /> : <Navigate to="/login" />}
        />

        {/* Post page - Dynamic route, accessible only to authenticated users */}
        <Route
          path="/post/:postId"
          element={authUser ? <PostPage /> : <Navigate to="/login" />}
        />

        {/* Profile page - Dynamic route, accessible only to authenticated users */}
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
