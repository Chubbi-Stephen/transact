import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/home/HomePage";
import WalletPage from "./pages/Wallet/WalletPage";
import TransactionsPage from "./pages/Transactions/TransactionsPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import VirtualCardsPage from "./pages/Cards/VirtualCardsPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import { UIProvider } from "./context/UIContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<ThemeProvider>
		<AuthProvider>
			<SocketProvider>
			<UIProvider>

			<Toaster 
				position="top-center" 
				toastOptions={{
					duration: 4000,
					success: {
						style: {
							background: '#013653',
							color: '#fff',
							borderRadius: '1.5rem',
							fontSize: '11px',
							fontWeight: '900',
							textTransform: 'uppercase',
							letterSpacing: '0.15em',
							padding: '20px 32px',
							border: '1px solid rgba(255,255,255,0.1)',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
						},
						iconTheme: {
							primary: '#E4570A',
							secondary: '#fff',
						},
					},
					error: {
						style: {
							background: '#991B1B',
							color: '#fff',
							borderRadius: '1.5rem',
							fontSize: '11px',
							fontWeight: '900',
							textTransform: 'uppercase',
							letterSpacing: '0.15em',
							padding: '20px 32px',
						},
					},
				}} 
			/>

			<Router>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/verify/:token" element={<VerifyEmailPage />} />
					<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
					<Route path="/" element={<Layout />}>
						<Route
							index
							element={
								<ProtectedRoute>
									<HomePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="wallet"
							element={
								<ProtectedRoute>
									<WalletPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="transactions"
							element={
								<ProtectedRoute>
									<TransactionsPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="profile"
							element={
								<ProtectedRoute>
									<ProfilePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="cards"
							element={
								<ProtectedRoute>
									<VirtualCardsPage />
								</ProtectedRoute>
							}
						/>
					</Route>
				</Routes>
			</Router>
			</UIProvider>
			</SocketProvider>
		</AuthProvider>
		</ThemeProvider>

	);
}

export default App;
