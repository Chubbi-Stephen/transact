import { useState } from "react";
import { X, Target, ChevronRight } from "lucide-react";
import { budgetApi } from "../../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = [
    'Food & Drink',
    'Groceries',
    'Utilities',
    'Subscriptions',
    'Shopping',
    'Healthcare',
    'Entertainment',
    'Bills',
    'Data',
    'Other',
];

const SetBudgetModal = ({ onClose, onSuccess }) => {
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await budgetApi.set({
                category,
                amount: Number(amount),
                period: 'monthly'
            });
            toast.success(`${category} budget set!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Failed to set budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
                <button onClick={onClose} className="absolute right-8 top-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-10">
                    <div className="bg-slate-900 h-16 w-16 rounded-[1.5rem] flex justify-center items-center shadow-xl mb-6">
                        <Target className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set Budget</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 text-center">Plan your spending to save more</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2 ml-4">Category</label>
                        <select 
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:border-slate-900 outline-none text-sm font-bold appearance-none cursor-pointer"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2 ml-4">Monthly Limit (₦)</label>
                        <input
                            type="number"
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:border-slate-900 outline-none text-sm font-bold shadow-inner"
                            placeholder="e.g. 50000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                    >
                        <span>{loading ? "Saving..." : "Set Budget Limit"}</span>
                        <ChevronRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetBudgetModal;
