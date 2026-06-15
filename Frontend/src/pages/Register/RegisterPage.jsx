import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../components/common/Logo";

const RegisterPage = () => {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const { register, loading } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (form.password !== form.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			const { firstName, lastName, username, email, password } = form;
			await register({ firstName, lastName, username, email, password });
			navigate("/");
		} catch (err) {
			const message = err.response?.data?.message || "Registration failed. Please try again.";
			setError(message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<div className="bg-[#E5E3DC] p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white">
				<div className="flex justify-center mb-8">
					<Logo size="lg" />
				</div>
				<h1 className="text-2xl font-black text-center mb-6 text-slate-900 tracking-tight">Create Account</h1>

				{error && (
					<p className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-[11px] font-black uppercase tracking-widest text-center">{error}</p>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="firstName">First Name</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
								value={form.firstName}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="lastName">Last Name</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
								value={form.lastName}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="username">Username</label>
						<input
							id="username"
							name="username"
							type="text"
							className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
							value={form.username}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="email">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
							value={form.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="password">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
							value={form.password}
							onChange={handleChange}
							required
						/>
					</div>
					<div>
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2" htmlFor="confirmPassword">Confirm</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							className="w-full p-4 bg-white/50 border border-slate-100 rounded-2xl focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
							value={form.confirmPassword}
							onChange={handleChange}
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-[#013653] text-white py-5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-[#E4570A] transition-all active:scale-95 disabled:opacity-50 mt-6"
						disabled={loading}
					>
						{loading ? "Creating..." : "Start Building Wealth"}
					</button>
				</form>

				<p className="text-center mt-8 text-sm font-medium text-slate-400">
					Already using Tranxact?{" "}
					<Link to="/login" className="text-[#E4570A] font-black uppercase tracking-widest text-[11px] hover:underline ml-1">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default RegisterPage;
