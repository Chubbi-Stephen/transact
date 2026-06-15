import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Briefcase, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { savingsApi } from '../../../services/api';
import toast from 'react-hot-toast';
import { useUI } from '../../../context/UIContext';
import axios from 'axios';

const FloatingChat = () => {
    const { isChatOpen, toggleChat } = useUI();
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([
        { role: 'assistant', content: "What's good? I'm T-Co, your wealth mentor. Ready to make some smart moves today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const scrollRef = useRef(null);
    const { user } = useAuth();
    const { openModal } = useUI();


    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = message;
        setMessage('');
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);
        setPendingAction(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, 
                { message: userMsg },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
            if (res.data.action) {
                setPendingAction(res.data.action);
            }
        } catch (err) {
            setHistory(prev => [...prev, { role: 'assistant', content: "I'm briefly offline. Let's sync up in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const executeAction = async () => {
        if (!pendingAction) return;
        const { action, amount } = pendingAction;

        try {
            if (action === 'vault_deposit') {
                await savingsApi.investToVault({ amount });
                toast.success(`₦${amount.toLocaleString()} moved to T-Vault!`);
            } else if (action === 'safelock_create') {
                openModal('safelock', { amount });
                toast.success("Opening Safelock config...");
            } else if (action === 'bank_transfer') {
                openModal('bank', { amount });
                toast.success("Opening Bank Transfer...");
            } else if (action === 'buy_airtime') {
                openModal('airtime', { amount });
                toast.success("Opening Airtime...");
            }
            
            setPendingAction(null);
            setHistory(prev => [...prev, { role: 'assistant', content: "Action triggered! Check your screen." }]);
        } catch (err) {
            toast.error("Action failed. Check your balance.");
        }
    };

    return (
        <div className="fixed bottom-28 right-6 z-[9999] flex flex-col items-end">

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="rounded-[2.5rem] w-80 md:w-96 shadow-2xl overflow-hidden mb-6 flex flex-col h-[600px]"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {/* Header */}
                        <div className="p-6 bg-[#013653] text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="flex items-center space-x-3 relative z-10">
                                <div className="w-10 h-10 bg-[#E4570A] rounded-2xl flex items-center justify-center shadow-lg">
                                    <Briefcase size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">T-Co Live</h3>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Connected</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => toggleChat(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {history.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm font-bold leading-relaxed shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-[#013653] text-white rounded-br-none' 
                                            : 'bg-white text-[#013653] rounded-bl-none border border-slate-200'}`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>

                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-[1.5rem] rounded-bl-none border border-slate-100 shadow-sm flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}

                            {/* Action Confirmation Card */}
                            {pendingAction && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#013653] p-5 rounded-[2rem] text-white shadow-xl border border-white/10"
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-white/10 rounded-xl">
                                            <CheckCircle2 size={16} className="text-[#E4570A]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">T-Co Insight</span>
                                    </div>
                                    <h4 className="text-sm font-black mb-1">Confirm {pendingAction.action.replace('_', ' ')}?</h4>
                                    <p className="text-[10px] text-white/50 font-bold mb-4">Triggering ₦{pendingAction.amount.toLocaleString()} transaction...</p>
                                    
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={executeAction}
                                            className="flex-1 bg-[#E4570A] p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2"
                                        >
                                            <span>Do It</span>
                                            <ChevronRight size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setPendingAction(null)}
                                            className="flex-1 bg-white/5 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Not Now
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Message T-Co..."
                                    className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-6 pr-14 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#013653] transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isTyping}
                                    className="absolute right-2 p-3 bg-[#013653] text-white rounded-2xl hover:bg-[#014a72] transition-all disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleChat()}
                className="w-16 h-16 bg-[#013653] rounded-[1.8rem] shadow-2xl flex items-center justify-center text-white relative group"
            >
                <div className="absolute inset-0 bg-[#E4570A] rounded-[1.8rem] opacity-0 group-hover:opacity-10 scale-110 transition-all"></div>
                <MessageSquare size={24} className="relative z-10" />
                {isChatOpen && <X size={24} className="absolute z-10" />}
            </motion.button>
        </div>
    );
};

export default FloatingChat;
