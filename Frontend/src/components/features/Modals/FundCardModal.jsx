import { useState } from "react";
import { X, Zap, ChevronRight, Info } from "lucide-react";
import { cardApi } from "../../../services/api";
import toast from "react-hot-toast";

const FundCardModal = ({ card, onClose, onSuccess }) => {
    const [amountNgn, setAmountNgn] = useState("");
    const [loading, setLoading] = useState(false);

    const rate = 1500;
    const amountDest = card.currency === 'USD' ? (Number(amountNgn) / rate).toFixed(2) : Number(amountNgn).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await cardApi.fund({ 
                cardId: card._id, 
                amountNgn: Number(amountNgn) 
            });
            toast.success(`Card Funded Successfully!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fund card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button onClick={onClose} className="absolute right-8 top-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-10">
                    <div className="bg-slate-900 h-16 w-16 rounded-[1.5rem] flex justify-center items-center shadow-xl mb-6">
                        <Zap className="text-white fill-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fund Card</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Transfer from Main Wallet</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center space-x-4">
                        <div className={`w-12 h-8 ${card.color} rounded-lg shadow-sm border border-white/10`}></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{card.cardName}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ending in {card.cardNumber.slice(-4)}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2 ml-4">Amount to Transfer (₦)</label>
                        <input
                            type="number"
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:border-slate-900 outline-none text-sm font-bold shadow-inner"
                            placeholder="Amount in NGN"
                            value={amountNgn}
                            onChange={(e) => setAmountNgn(e.target.value)}
                            required
                        />
                    </div>

                    {card.currency === 'USD' && (
                        <div className="bg-orange-50/50 p-5 rounded-[1.5rem] border border-orange-100 flex items-start space-x-3">
                            <Info size={16} className="text-[#E4570A] mt-0.5" />
                            <div>
                                <p className="text-[9px] font-black text-[#E4570A] uppercase tracking-widest mb-1">Exchange Rate Applied</p>
                                <p className="text-[10px] font-bold text-slate-600">1 USD = ₦{rate}. Your card will be credited with <span className="text-slate-900 font-black">${amountDest}</span></p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Credit</span>
                        <span className="text-xl font-black text-slate-900">{card.currency === 'USD' ? '$' : '₦'}{amountDest}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !amountNgn}
                        className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                    >
                        <span>{loading ? "Processing..." : "Confirm Transfer"}</span>
                        <ChevronRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FundCardModal;
