import { useState } from "react";
import { Eye, EyeOff, Plus, ArrowUpRight } from "lucide-react";
import AddMoneyModal from "../Modals/AddMoneyModal";
import WithdrawModal from "../Modals/WithdrawModal";
import KycModal from "../Modals/KycModal";
import { useAuth } from "../../../hooks/useAuth";
import { ShieldCheck, ShieldAlert, BadgeCheck } from "lucide-react";

const BalanceCard = ({ onRefresh }) => {
	const [activeModal, setActiveModal] = useState(null);
	const [showBalance, setShowBalance] = useState(true);
	const { user } = useAuth();

	const kycLevels = {
		1: { label: "Tier 1", icon: <ShieldAlert size={10} />, class: "bg-amber-50 text-amber-600 border-amber-100" },
		2: { label: "Tier 2", icon: <ShieldCheck size={10} />, class: "bg-blue-50 text-blue-600 border-blue-100" },
		3: { label: "Tier 3", icon: <BadgeCheck size={10} />, class: "bg-green-50 text-green-600 border-green-100" }
	};

	const currentKyc = kycLevels[user?.kycLevel || 1];

	const closeModal = () => setActiveModal(null);

	const formattedBalance = user?.balance?.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}) || "0.00";

	return (
		<>
			<div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
				<div className="relative z-10">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center space-x-3">
							<span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Primary Wallet</span>
							<button 
								onClick={() => user?.kycLevel === 1 && setActiveModal("kyc")}
								className={`px-3 py-1.5 rounded-full border flex items-center space-x-1.5 transition-all active:scale-95 ${currentKyc.class}`}
							>
								{currentKyc.icon}
								<span className="text-[9px] font-black uppercase tracking-widest">{currentKyc.label}</span>
							</button>
						</div>
						<button
							onClick={() => setShowBalance(!showBalance)}
							className="text-slate-400 hover:text-[#E4570A] transition-colors p-2 bg-slate-50 rounded-full"
						>
							{showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
					
					<div className="flex items-baseline space-x-2">
						<span className="text-xl font-bold text-slate-400">₦</span>
						<h2 className="text-4xl font-black text-slate-900 tracking-tight">
							{showBalance ? formattedBalance : "••••••"}
						</h2>
					</div>
					
					{user?.accountNumber && (
						<div className="mt-4 flex items-center space-x-2 bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
							<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Acct:</span>
							<span className="text-xs font-black text-slate-900 tracking-[0.1em]">{user.accountNumber}</span>
						</div>
					)}

					
					<div className="mt-8 flex space-x-3">
						<button 
							className="flex-1 bg-[#013653] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#012a41] transition-colors shadow-lg shadow-[#013653]/20"
							onClick={() => setActiveModal("add")}
						>
							<Plus size={16} />
							<span>Fund Wallet</span>
						</button>
						<button 
							className="flex-1 bg-[#E4570A] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#cf4f09] transition-colors shadow-lg shadow-[#E4570A]/20"
							onClick={() => setActiveModal("withdraw")}
						>
							<ArrowUpRight size={16} />
							<span>Withdraw</span>
						</button>
					</div>
				</div>
				
				<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E4570A]/5 rounded-full blur-2xl"></div>
			</div>

			{activeModal === "add" && <AddMoneyModal onClose={closeModal} onRefresh={onRefresh} />}
			{activeModal === "withdraw" && <WithdrawModal onClose={closeModal} onRefresh={onRefresh} />}
			{activeModal === "kyc" && <KycModal onClose={closeModal} />}
		</>
	);
};

export default BalanceCard;
