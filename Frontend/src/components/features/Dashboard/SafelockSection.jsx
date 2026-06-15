import { useState, useEffect } from "react";
import { savingsApi, authApi } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import SafelockCard from "./SafelockCard";
import CreateSafelockModal from "../Modals/CreateSafelockModal";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

const SafelockSection = ({ refreshTrigger, onRefresh }) => {
	const [locks, setLocks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { user, refreshUser } = useAuth();

	const fetchLocks = async () => {
		try {
			setLoading(true);
			const { data } = await savingsApi.getAll();
			setLocks(data);
		} catch (error) {
			console.error("Failed to fetch safelocks:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleRoundUp = async () => {
		try {
			await authApi.toggleRoundUp();
			await refreshUser();
			toast.success(`Spare Change ${!user.roundUpEnabled ? 'enabled' : 'disabled'}!`);
		} catch (error) {
			toast.error("Failed to update round-up setting");
		}
	};

	useEffect(() => {
		fetchLocks();
	}, [refreshTrigger]);

	const handleWithdraw = async (id) => {
		try {
			await savingsApi.withdraw(id);
			await refreshUser();
			fetchLocks();
			if (onRefresh) onRefresh();
			alert("Funds withdrawn successfully with interest!");
		} catch (error) {
			alert(error.response?.data?.message || "Withdrawal failed");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-slate-500 font-medium uppercase tracking-widest text-xs">Safelock (Locked Savings)</h3>
				<button 
					onClick={() => setIsModalOpen(true)}
					className="text-[#E4570A] text-sm font-bold hover:underline"
				>
					+ New Lock
				</button>
			</div>

			{loading ? (
				<div className="flex gap-4 overflow-hidden">
					{[1, 2].map((i) => (
						<div key={i} className="bg-slate-50 h-48 w-[280px] rounded-2xl animate-pulse"></div>
					))}
				</div>
			) : locks.length > 0 ? (
				<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
					{locks.map((lock) => (
						<SafelockCard key={lock._id} lock={lock} onWithdraw={handleWithdraw} />
					))}
				</div>
			) : (
				<div className="bg-[#E5E3DC] p-8 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
					<p className="text-slate-500 mb-4">You have no funds locked. Start saving for the future.</p>
					<button 
						onClick={() => setIsModalOpen(true)}
						className="bg-[#E4570A] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg"
					>
						Create First Safelock
					</button>
				</div>
			)}

			{isModalOpen && (
				<CreateSafelockModal 
					onClose={() => setIsModalOpen(false)} 
					onSuccess={() => {
						setIsModalOpen(false);
						fetchLocks();
						if (onRefresh) onRefresh();
					}} 
				/>
			)}
		</div>
	);
};

export default SafelockSection;
