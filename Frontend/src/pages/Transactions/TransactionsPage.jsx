import { useState, useEffect } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, Download, LayoutGrid, SlidersHorizontal, PackageOpen } from "lucide-react";
import TransactionItem from "../../components/features/Transactions/TransactionItem";
import { transactionsApi } from "../../services/api";
import toast from "react-hot-toast";
import { TransactionSkeleton } from "../../components/common/Skeleton";
import { exportTransactionsToCSV } from "../../utils/exportUtils";

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, credit, debit
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data } = await transactionsApi.getAll();
            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTransactions(sorted);
        } catch (err) {
            toast.error("Failed to load transaction history");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (transactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }
        toast.promise(
            new Promise((resolve) => {
                exportTransactionsToCSV(transactions, `Transact-Statement-${new Date().toISOString().split('T')[0]}.csv`);
                setTimeout(resolve, 500);
            }),
            {
                loading: 'Preparing export...',
                success: 'Statement downloaded!',
                error: 'Export failed',
            }
        );
    };


    const filteredTransactions = transactions.filter((t) => {
        const matchesType = filter === "all" || t.type === filter;
        const matchesSearch =
            searchTerm === "" ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const FilterButton = ({ label, value, icon: Icon }) => (
        <button
            onClick={() => setFilter(value)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                filter === value 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
        >
            {Icon && <Icon size={14} />}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">History</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
                        <Calendar size={12} className="mr-2" />
                        Complete Transaction Logs
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-5 py-3.5 bg-slate-100 text-slate-900 rounded-[1.2rem] font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E4570A] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, category or amount..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none shadow-sm focus:border-[#E4570A]/30 focus:ring-4 focus:ring-[#E4570A]/5 transition-all text-sm font-bold placeholder:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <FilterButton label="All Logs" value="all" icon={LayoutGrid} />
                    <FilterButton label="Inflow" value="credit" icon={ArrowDownLeft} />
                    <FilterButton label="Outflow" value="debit" icon={ArrowUpRight} />
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Statement for June 2026</h3>
                    <div className="flex items-center space-x-4 text-slate-400">
                        <SlidersHorizontal size={14} />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <TransactionSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        <div className="space-y-2">
                            {filteredTransactions.map((t) => (
                                <TransactionItem key={t._id} transaction={t} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
                                <PackageOpen size={36} />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-2">No Transactions Found</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                {searchTerm ? "Try adjusting your search or filters to find what you're looking for." : "Start spending to see your transaction history here."}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => {setSearchTerm(""); setFilter("all");}}
                                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#E4570A]"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Summary */}
            {!loading && filteredTransactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Total Inflow this Month</p>
                        <p className="text-2xl font-black tracking-tight">₦{transactions.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                    </div>
                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Outflow this Month</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">₦{transactions.filter(t => t.type === 'debit').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;
