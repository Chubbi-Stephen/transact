import { TrendingUp, AlertCircle } from "lucide-react";

const BudgetCard = ({ budget }) => {
    const { category, amount, spent, percentage, isExceeded, remaining } = budget;

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{category}</h4>
                    <p className="text-xl font-black text-slate-900">₦{spent.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-2xl ${isExceeded ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-900'}`}>
                    {isExceeded ? <AlertCircle size={20} /> : <TrendingUp size={20} />}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                        {isExceeded ? "Limit Exceeded" : `₦${remaining.toLocaleString()} left`}
                    </p>
                    <p className="text-[9px] font-black text-slate-900">{Math.round(percentage)}%</p>
                </div>
                
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : 'bg-slate-900'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Limit: ₦{amount.toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default BudgetCard;
