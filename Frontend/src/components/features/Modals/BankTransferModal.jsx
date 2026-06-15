import { useState, useEffect } from "react";
import { Landmark, ArrowRight, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import PinModal from "./PinModal";
import { transactionsApi } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";

const NIGERIAN_BANKS = [
    { name: "Access Bank", code: "044" },
    { name: "First Bank", code: "011" },
    { name: "GTBank", code: "058" },
    { name: "Kuda Bank", code: "090267" },
    { name: "UBA", code: "033" },
    { name: "Zenith Bank", code: "057" },
    { name: "Stanbic IBTC", code: "221" }
];

const BankTransferModal = ({ onClose, onRefresh }) => {
	const [step, setStep] = useState(1); // 1: Form, 2: PIN, 3: Success
	const [loading, setLoading] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [resolvedName, setResolvedName] = useState("");
	
	const [formData, setFormData] = useState({
		bank: "",
		accountNumber: "",
		amount: "",
		note: ""
	});

	const { user } = useAuth();
    
    // Limits
    const limits = { 1: 50000, 2: 200000, 3: 5000000 };
    const MAX_LIMIT = limits[user?.kycLevel || 1];


	// Simulate name lookup
	useEffect(() => {
		if (formData.accountNumber.length === 10 && formData.bank) {
			setIsValidating(true);
			setTimeout(() => {
				setResolvedName("JOHN OKORO DOE"); // Mocked resolution
				setIsValidating(false);
			}, 1000);
		} else {
			setResolvedName("");
		}
	}, [formData.accountNumber, formData.bank]);

	const handleSubmit = (e) => {
		e.preventDefault();
        if (parseFloat(formData.amount) > user?.balance) return toast.error("Insufficient balance");
        if (parseFloat(formData.amount) > MAX_LIMIT) return toast.error(`Tier 1 Limit exceeded. Max is ₦${MAX_LIMIT.toLocaleString()}`);
		setStep(2);
	};

	const handlePinSuccess = async (pin) => {
		setLoading(true);
		try {
			await transactionsApi.create({
				type: "debit",
				amount: parseFloat(formData.amount),
				category: "Transfer",
				description: `Transfer to ${formData.bank} - ${formData.accountNumber} (${resolvedName})`,
				pin
			});
			setStep(3);
			if (onRefresh) onRefresh();
		} catch (err) {
			toast.error(err.response?.data?.message || "Transfer failed");
			setStep(1);
		} finally {
			setLoading(false);
		}
	};

	if (step === 3) {
		return (
			<Modal onClose={onClose}>
				<div className="p-10 text-center animate-in zoom-in-95 duration-300">
					<div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
						<CheckCircle2 size={40} />
					</div>
					<h3 className="text-3xl font-black text-slate-900 mb-2">Success!</h3>
					<p className="text-sm font-medium text-slate-400 mb-10">
						Transfer of ₦{parseFloat(formData.amount).toLocaleString()} to {resolvedName} was successful.
					</p>
					<button
						onClick={onClose}
						className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em]"
					>
						Done
					</button>
				</div>
			</Modal>
		);
	}

	if (step === 2) {
		return (
			<PinModal 
				onClose={() => setStep(1)} 
				onSuccess={handlePinSuccess}
				title="Confirm Transfer"
				amount={formData.amount}
			/>
		);
	}

	return (
		<Modal title="Bank Transfer" onClose={onClose}>
			<form onSubmit={handleSubmit} className="p-6 space-y-6">
                {user?.kycLevel < 3 && (
                    <div className="p-4 bg-amber-50 rounded-2xl flex items-start space-x-3 border border-amber-100">
                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Tier {user?.kycLevel} Limit Applied</p>
                            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed">
                                You can only send up to ₦{MAX_LIMIT.toLocaleString()}. Upgrade to Tier {user?.kycLevel + 1} for ₦{limits[user?.kycLevel + 1]?.toLocaleString()} limits.
                            </p>
                        </div>
                    </div>
                )}


				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
							<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Select Bank</label>
							<select
								className="w-full bg-transparent font-bold text-sm outline-none"
								value={formData.bank}
								onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
								required
							>
								<option value="">Choose a bank</option>
								{NIGERIAN_BANKS.map((b) => (
									<option key={b.code} value={b.name}>{b.name}</option>
								))}
							</select>
						</div>

						<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner relative">
							<label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Account Number</label>
							<input
								type="text"
								maxLength={10}
								className="w-full bg-transparent font-black tracking-widest text-lg outline-none"
								placeholder="0123456789"
								value={formData.accountNumber}
								onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
								required
							/>
							{isValidating && <div className="absolute right-4 bottom-4"><Loader2 size={16} className="animate-spin text-[#E4570A]" /></div>}
						</div>
					</div>

					{resolvedName && (
						<div className="animate-in fade-in slide-in-from-top-2 p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="bg-white/10 p-2 rounded-lg"><Landmark size={14} /></div>
								<span className="text-[10px] font-black uppercase tracking-tighter">{resolvedName}</span>
							</div>
							<div className="bg-green-500 h-2 w-2 rounded-full"></div>
						</div>
					)}

					<div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner text-center">
						<label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Amount to Send</label>
						<div className="flex items-center justify-center space-x-2">
							<span className="text-2xl font-bold text-slate-300">₦</span>
							<input
								type="number"
								className="bg-transparent text-4xl font-black text-slate-900 outline-none w-48 text-center"
								placeholder="0"
								value={formData.amount}
								onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
								required
							/>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={!resolvedName || !formData.amount}
					className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-30 disabled:translate-y-0"
				>
					Continue <ArrowRight size={16} className="inline ml-2" />
				</button>
			</form>
		</Modal>
	);
};

export default BankTransferModal;
