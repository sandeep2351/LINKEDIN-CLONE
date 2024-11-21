import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate
    const queryClient = useQueryClient();

    const { mutate: loginMutation, isLoading } = useMutation({
        mutationFn: (userData) => axiosInstance.post("/auth/login", userData),
        onSuccess: (response) => {
            const token = response.data?.token;
            if (token) {
                localStorage.setItem("jwt-linkedin", token); // Use consistent token key
                queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Invalidate authUser query
                toast.success("Login Successful");
                navigate('/'); // Redirect to homepage
            } else {
                toast.error("Login successful, but token is missing in the response");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Something went wrong");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation({ username, password });
        setPassword("");
        setUsername("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
            />
            <button type="submit" className="btn btn-primary w-full">
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Login"}
            </button>
        </form>
    );
};

export default LoginForm;
