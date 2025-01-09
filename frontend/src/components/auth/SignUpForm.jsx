import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const queryClient = useQueryClient();

	const { mutate: signUpMutation, isLoading } = useMutation({
		mutationFn: async (data) => {
			const response = await axiosInstance.post("/auth/signup", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Account created successfully!");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			// Reset form fields after successful signup
			setName("");
			setEmail("");
			setUsername("");
			setPassword("");
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
			toast.error(errorMessage);
		},
	});

	const handleSignUp = (e) => {
		e.preventDefault();

		// Basic form validation
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		signUpMutation({ name, username, email, password });
	};

	return (
		<form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full max-w-md mx-auto">
			<input
				type="text"
				placeholder="Full name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="input input-bordered w-full"
				required
			/>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className="input input-bordered w-full"
				required
			/>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="input input-bordered w-full"
				required
			/>
			<input
				type="password"
				placeholder="Password (6+ characters)"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="input input-bordered w-full"
				required
			/>

			<button type="submit" disabled={isLoading} className={`btn btn-primary w-full ${isLoading && "opacity-50 cursor-not-allowed"}`}>
				{isLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : "Agree & Join"}
			</button>
		</form>
	);
};

export default SignUpForm;
