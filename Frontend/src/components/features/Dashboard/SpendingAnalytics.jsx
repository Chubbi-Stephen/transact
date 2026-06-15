import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import { aiApi } from "../../../services/api";
import { PieChart, BarChart3, TrendingDown } from "lucide-react";
import { useUI } from "../../../context/UIContext";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend
);

const SpendingAnalytics = ({ refreshTrigger }) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
    const { toggleChat } = useUI();

	useEffect(() => {
		const fetchAnalysis = async () => {
			try {
				setLoading(true);
				const { data } = await aiApi.analyze();
				setData(data);
			} catch (error) {
				console.error("Failed to fetch analytics:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchAnalysis();
	}, [refreshTrigger]);

	const COLORS = ["#E4570A", "#013653", "#38BDF8", "#F472B6", "#818CF8", "#A0AEC0"];

	if (loading) return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center animate-pulse">
            <PieChart className="text-slate-100 mb-4" size={48} />
            <div className="h-4 w-32 bg-slate-50 rounded-full"></div>
        </div>
    );

	if (!data || !data.insights || data.insights.length === 0) {
		return (
			<div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all pointer-events-none">
                    <BarChart3 size={180} />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-[2rem] mb-6 shadow-inner">
                        <TrendingDown size={32} className="text-slate-200" />
                    </div>
                    
                    <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] mb-3">AI Spending Insights</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-loose max-w-[200px] mb-8">
                        Your financial story is just beginning. Start spending to unlock deep AI analysis.
                    </p>

                    {/* Ghost Progress Bars */}
                    <div className="w-full space-y-4 opacity-10 pointer-events-none">
                        {[70, 45, 30].map((w, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between h-2 bg-slate-100 rounded-full w-full">
                                    <div className="h-full bg-slate-200 rounded-full" style={{ width: `${w}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => toggleChat(true)}
                        className="mt-8 px-8 py-3 bg-[#013653] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E4570A] transition-all shadow-lg active:scale-95"
                    >
                        Start Your Journey
                    </button>
                </div>
			</div>
		);
	}

	const doughnutData = {
		labels: data.insights.map((i) => i.category),
		datasets: [
			{
				data: data.insights.map((i) => i.amount),
				backgroundColor: COLORS.slice(0, data.insights.length),
				borderWidth: 0,
				hoverOffset: 10,
				borderRadius: 4
			},
		],
	};

	return (
		<div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
			<div className="flex justify-between items-start mb-10">
				<div>
                    <div className="flex items-center space-x-3 mb-2">
					    <h3 className="text-[#013653] font-black text-xs uppercase tracking-widest">Monthly Spending</h3>
                        <div className="flex items-center space-x-1 px-2 py-0.5 bg-orange-50 rounded-full">
                            <TrendingDown size={10} className="text-[#E4570A]" />
                            <span className="text-[8px] font-black text-[#E4570A] uppercase tracking-widest">v1.2 AI</span>
                        </div>
                    </div>
					<p className="text-2xl font-black text-slate-900">₦{data.totalSpent?.toLocaleString()}</p>
				</div>
				<PieChart size={24} className="text-slate-200" />
			</div>
			
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div className="relative flex justify-center">
					<div className="w-full max-w-[200px]">
						<Doughnut data={doughnutData} options={{ cutout: "82%", plugins: { legend: { display: false } } }} />
					</div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Total Spent</p>
                        <p className="text-sm font-black text-slate-900">{data.insights.length} Cats</p>
                    </div>
				</div>

				<div className="space-y-4">
                    {data.insights.slice(0, 4).map((i, idx) => (
                        <div key={i.category} className="group">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">{i.category}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900">₦{i.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${i.percentage}%`, backgroundColor: COLORS[idx] }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    
                    {data.recommendation && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">AI Smart Advice</p>
                            <p className="text-[10px] font-bold text-slate-900 leading-relaxed italic">"{data.recommendation}"</p>
                        </div>
                    )}
				</div>
			</div>
		</div>
	);
};

export default SpendingAnalytics;
