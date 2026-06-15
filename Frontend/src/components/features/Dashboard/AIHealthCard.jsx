import { useState, useEffect } from "react";
import { Brain, TrendingUp, ShieldCheck, Sparkles, AlertCircle, ChevronRight, Activity } from "lucide-react";
import axios from "axios";

const AIHealthCard = ({ refreshTrigger }) => {
    const [health, setHealth] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
        fetchMonthlyReport();
    }, [refreshTrigger]);

    const fetchHealth = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:5000/api/ai/analyze", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHealth(data);
        } catch (err) {
            console.error("AI analysis failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyReport = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:5000/api/ai/report", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.report) setReport(data.report);
        } catch (err) {}
    };


    if (loading) return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 h-40 animate-pulse flex items-center justify-center">
            <Brain className="text-slate-200" size={32} />
        </div>
    );

    if (!health) return null;

    const getScoreColor = (score) => {
        if (score > 80) return "text-emerald-500 bg-emerald-50";
        if (score > 60) return "text-[#E4570A] bg-orange-50";
        return "text-amber-500 bg-amber-50";
    };

    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110 duration-700">
                <Brain size={100} />
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">Financial IQ</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Analysis</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-black text-xs ${getScoreColor(health.score)}`}>
                    {health.score}%
                </div>
            </div>

            {report && (
                <div className="mb-6 bg-[#013653] p-6 rounded-[2rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={60} />
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                            <Brain size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">T-Co Monthly Review</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed mb-1 pr-8">
                        {report}
                    </p>
                </div>
            )}

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative mb-4">

                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                        <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                            "{health.recommendation}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <TrendingUp size={14} className={health.forecast === 'Upward' ? 'text-emerald-500' : 'text-slate-400'} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{health.status} Growth</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure habits</span>
                    </div>
                </div>
                <button className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[#E4570A] transition-all transform hover:rotate-12">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default AIHealthCard;
