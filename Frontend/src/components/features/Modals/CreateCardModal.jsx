import { useState } from "react";
import { X, CreditCard, ChevronRight, Check } from "lucide-react";
import { cardApi } from "../../../services/api";
import toast from "react-hot-toast";

const CreateCardModal = ({ onClose, onSuccess }) => {
    const [cardName, setCardName] = useState("");
    const [cardType, setCardType] = useState("Visa");
    const [currency, setCurrency] = useState("NGN");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await cardApi.create({ cardName, cardType, currency });
            toast.success(`${currency} Virtual Card Issued!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create card");
        } finally {
            setLoading(false);
        }
    };

    const fee = currency === 'USD' ? 2500 : 500;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
                <button onClick={onClose} className="absolute right-8 top-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-10">
                    <div className="bg-[#E4570A] h-16 w-16 rounded-[1.5rem] flex justify-center items-center shadow-xl shadow-[#E4570A]/20 mb-6">
                        <CreditCard className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Issue Virtual Card</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Instant provisioning & secure usage</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setCurrency("NGN")}
                            className={`p-6 rounded-[1.5rem] border transition-all text-left relative overflow-hidden ${currency === 'NGN' ? 'border-[#E4570A] bg-orange-50/50' : 'border-slate-100 bg-slate-50'}`}
                        >
                            {currency === 'NGN' && <div className="absolute top-4 right-4 text-[#E4570A]"><Check size={16} /></div>}
                            <p className="text-xs font-black text-slate-900">₦ NGN</p>
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Local Support</p>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setCurrency("USD")}
                            className={`p-6 rounded-[1.5rem] border transition-all text-left relative overflow-hidden ${currency === 'USD' ? 'border-[#E4570A] bg-orange-50/50' : 'border-slate-100 bg-slate-50'}`}
                        >
                            {currency === 'USD' && <div className="absolute top-4 right-4 text-[#E4570A]"><Check size={16} /></div>}
                            <p className="text-xs font-black text-slate-900">$ USD</p>
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">International</p>
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2 ml-4">Card Label</label>
                        <input
                            type="text"
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:border-[#E4570A] outline-none text-sm font-bold shadow-inner"
                            placeholder="e.g. Netflix Card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issuance Fee</span>
                        <span className="text-sm font-black text-slate-900">₦{fee.toLocaleString()}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                    >
                        <span>{loading ? "Provisioning..." : "Process Issuance"}</span>
                        <ChevronRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCardModal;
