import { useState, useEffect } from "react";
import { Plus, Target, ChevronRight } from "lucide-react";
import { budgetApi } from "../../../services/api";
import BudgetCard from "./BudgetCard";
import SetBudgetModal from "../Modals/SetBudgetModal";
import { CardSkeleton } from "../../common/Skeleton";

const BudgetOverview = ({ refreshTrigger }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const { data } = await budgetApi.getAll();
            setBudgets(data);
        } catch (err) {
            console.error("Failed to fetch budgets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, [refreshTrigger]);

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Budget Tracker</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Manage your monthly limits</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 bg-white border border-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus size={14} className="text-[#E4570A]" />
                    <span>Set Limit</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <CardSkeleton key={i} />)
                ) : budgets.length > 0 ? (
                    budgets.map(budget => (
                        <BudgetCard key={budget.category} budget={budget} />
                    ))
                ) : (
                    <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] p-12 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No active budgets found</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="mt-6 text-[10px] font-black text-[#E4570A] uppercase tracking-widest hover:underline"
                        >
                            Create your first budget limit →
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <SetBudgetModal 
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchBudgets}
                />
            )}
        </div>
    );
};

export default BudgetOverview;
