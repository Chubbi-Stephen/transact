import { useState, useEffect } from "react";
import { aiApi } from "../../../services/api";
import { Sparkles, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react";
import { CardSkeleton } from "../../common/Skeleton";

const ForecastingSection = ({ refreshTrigger }) => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                const { data } = await aiApi.getForecast();
                setForecast(data);
            } catch (err) {
                console.error("Failed to fetch forecast");
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, [refreshTrigger]);

    if (loading) return <CardSkeleton />;

    if (!forecast || forecast.predictions.length === 0) {
        return null;
    }

    const { predictions, totalPredictedExpense, safetyStatus, advice } = forecast;

    return (
        <div className="bg-[#013653] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                            <TrendingDown size={20} className="text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">AI Cashflow Forecast</h3>
                            <p className="text-xl font-black">₦{totalPredictedExpense.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center space-x-2 ${
                        safetyStatus === 'Safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        {safetyStatus === 'Safe' ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                        <span>{safetyStatus}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    {predictions.slice(0, 3).map((pred, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{pred.category}</span>
                            <span className="text-xs font-black">~ ₦{pred.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-[#E4570A]/20 p-6 rounded-[2rem] border border-[#E4570A]/20 backdrop-blur-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E4570A] mb-2">Forecasting Insight</p>
                    <p className="text-[11px] font-bold text-white/90 leading-relaxed italic line-clamp-2">
                        "{advice}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForecastingSection;
