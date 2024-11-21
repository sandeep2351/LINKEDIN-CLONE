import Navbar from "./Navbar";

const Layout = ({ children }) => {
	return (
		<div className="min-h-screen bg-base-100 flex flex-col">
			<Navbar />
			<main
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
				role="main"
				aria-label="Main Content"
			>
				{children}
			</main>
		</div>
	);
};

export default Layout;
