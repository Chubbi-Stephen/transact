import { useState, useEffect } from "react";
import { Plus, ShieldCheck, Globe, CreditCard, ChevronRight, Eye, EyeOff, Zap } from "lucide-react";
import { cardApi } from "../../services/api";
import toast from "react-hot-toast";
import CreateCardModal from "../../components/features/Modals/CreateCardModal";
import FundCardModal from "../../components/features/Modals/FundCardModal";
import { CardSkeleton } from "../../components/common/Skeleton";

const VirtualCardsPage = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNumbers, setShowNumbers] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const { data } = await cardApi.getAll();
            setCards(data);
        } catch (err) {
            toast.error("Failed to load cards");
        } finally {
            setLoading(false);
        }
    };

    const toggleNumber = (id) => {
        setShowNumbers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const totalBalance = cards.reduce((sum, card) => sum + (card.currency === 'USD' ? card.balance * 1500 : card.balance), 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <div className="bg-white px-6 pt-16 pb-8 border-b border-slate-100 sticky top-0 z-30">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">My Cards</h1>
                        <div className="flex items-center space-x-2">
                            <ShieldCheck size={14} className="text-green-500 fill-green-500/10" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure & encrypted</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="h-14 w-14 bg-[#E4570A] rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-[#E4570A]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 pt-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Combined Value</p>
                        <p className="text-xl font-black text-slate-800">₦{totalBalance.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Slots</p>
                        <p className="text-xl font-black text-slate-800">{cards.length} / 5</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        [1, 2].map(i => <CardSkeleton key={i} />)
                    ) : cards.length > 0 ? (
                        cards.map((card) => (
                            <div key={card._id} className={`${card.color} p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl group transition-all`}>
                                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-7 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10">
                                                <div className="grid grid-cols-2 gap-1 px-2">
                                                    <div className="h-1 w-2 bg-amber-400/50 rounded-full"></div>
                                                    <div className="h-1 w-2 bg-amber-400/50 rounded-full"></div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{card.cardName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black tracking-tighter uppercase">{card.cardType}</p>
                                            <div className="flex items-center space-x-1 justify-end">
                                                <Globe size={10} className="text-white/40" />
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">{card.currency} Virtual</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-mono font-medium tracking-[0.25em]">
                                                {showNumbers[card._id] ? card.cardNumber.match(/.{1,4}/g).join(" ") : "**** **** **** " + card.cardNumber.slice(-4)}
                                            </p>
                                            <button onClick={() => toggleNumber(card._id)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10">
                                                {showNumbers[card._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <div className="flex space-x-8 mt-6 text-white/60">
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest mb-1">Expiry</p>
                                                <p className="text-xs font-black text-white">{card.expiryDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest mb-1">CVV</p>
                                                <p className="text-xs font-black text-white">{showNumbers[card._id] ? card.cvv : "***"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Balance</p>
                                            <p className="text-2xl font-black">{card.currency === 'USD' ? '$' : '₦'}{card.balance.toFixed(2)}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedCard(card)}
                                            className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center space-x-2"
                                        >
                                            <Zap size={14} className="fill-white" />
                                            <span>Fund Card</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <CreditCard size={32} className="text-slate-300" />
                            </div>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-3">No active cards</h3>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl mt-4"
                            >
                                Issue First Card
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateCardModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchCards}
                />
            )}

            {selectedCard && (
                <FundCardModal 
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onSuccess={fetchCards}
                />
            )}
        </div>
    );
};

export default VirtualCardsPage;
