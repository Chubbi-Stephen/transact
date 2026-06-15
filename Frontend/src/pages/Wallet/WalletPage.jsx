import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Copy, Check, Landmark, PiggyBank, ReceiptText, ArrowUpRight, ArrowDownLeft, ShieldCheck, Eye, EyeOff, LayoutGrid } from "lucide-react";
import TransactionHistory from "../../components/features/Transactions/TransactionHistory";
import toast from "react-hot-toast";
import { savingsApi, transactionsApi } from "../../services/api";

const WalletPage = () => {
    const { user } = useAuth();
    const [showBalance, setShowBalance] = useState(true);
    const [copied, setCopied] = useState(false);
    const [vaultData, setVaultData] = useState(null);
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPageData = async () => {
             setLoading(true);
             await Promise.all([fetchVaultDetails(), fetchSummary()]);
             setLoading(false);
        };
        loadPageData();
    }, []);

    const fetchVaultDetails = async () => {
        try {
            const { data } = await savingsApi.getVault();
            setVaultData(data);
        } catch (err) {
            console.error("Failed to load vault details");
        }
    };


    const fetchSummary = async () => {
        try {
            const { data } = await transactionsApi.getSummary();
            setSummary(data);
        } catch (err) {
            console.error("Failed to load summary:", err);
        }
    };



    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Account Number Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto pb-32 px-4">
            {/* 1. HERO: The Financial Command Center */}
            <div className="bg-[#013653] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Total Asset Value (NGN)</p>
                    <div className="flex items-center space-x-6 mb-8">
                        <h2 className="text-5xl font-black tracking-tighter">
                            {showBalance ? `₦${((user?.balance || 0) + (vaultData?.balance || 0)).toLocaleString()}` : "••••••••"}
                        </h2>
                        <button onClick={() => setShowBalance(!showBalance)} className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>

                    {/* Asset Distribution */}
                    <div className="flex gap-4 w-full">
                        <div className="flex-1 bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Main Wallet</p>
                            <p className="text-sm font-black">₦{user?.balance?.toLocaleString() || "0.00"}</p>
                        </div>
                        <div className="flex-1 bg-[#E4570A]/10 backdrop-blur-sm p-4 rounded-3xl border border-[#E4570A]/20">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#E4570A] mb-1">T-Vault</p>
                            <p className="text-sm font-black text-[#E4570A]">₦{vaultData?.balance?.toLocaleString() || "0.00"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. INTENTION: Virtual Bank Account (Receive Money) */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                    <Landmark size={80} />
                </div>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl">
                        <Landmark size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Receive Funds</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transfer to this account to fund your wallet</p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Kuda Microfinance Bank</p>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{user?.accountNumber || "7044231201"}</p>
                        <p className="text-[10px] font-bold text-slate-600 mt-1">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <button 
                        onClick={() => copyToClipboard(user?.accountNumber || "7044231201")}
                        className={`p-4 rounded-2xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-slate-900 shadow-sm'}`}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            {/* 3. INSIGHT: Spending Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm">
                    <div className="p-3 bg-green-50 text-green-500 w-fit rounded-2xl mb-4">
                        <ArrowDownLeft size={20} strokeWidth={3} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Incoming this month</p>
                    <p className="text-lg font-black text-slate-800">₦{summary.totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm">
                    <div className="p-3 bg-orange-50 text-orange-500 w-fit rounded-2xl mb-4">
                        <ArrowUpRight size={20} strokeWidth={3} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Outgoing this month</p>
                    <p className="text-lg font-black text-slate-800">₦{summary.totalExpenses.toLocaleString()}</p>
                </div>
            </div>

            {/* 4. HISTORY: Activity log */}
            <div>
                <div className="flex justify-between items-center mb-6 px-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-900 text-white rounded-xl">
                            <ReceiptText size={16} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Activity Log</h3>
                    </div>
                    <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#E4570A]">Statement</button>
                </div>
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                    <TransactionHistory limit={30} />
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
