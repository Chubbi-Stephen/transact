import { useState, useEffect, useCallback } from "react";
import TransactionItem from "./TransactionItem";
import { transactionsApi } from "../../../services/api";
import { TransactionSkeleton } from "../../common/Skeleton";

const TransactionHistory = ({ limit, refreshTrigger }) => {
	const [filter, setFilter] = useState("all");
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchTransactions = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				limit: limit || 10,
			};
			if (filter !== "all") {
				params.type = filter === "incoming" ? "credit" : "debit";
			}
			const { data } = await transactionsApi.getAll(params);
			setTransactions(data);
		} catch (error) {
			console.error("Failed to fetch transactions:", error);
		} finally {
			setLoading(false);
		}
	}, [limit, filter]);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions, refreshTrigger]);

    const FilterButton = ({ label, value }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === value 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
            }`}
        >
            {label}
        </button>
    );

	return (
		<div className="bg-white p-6 rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
			    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Movements</h3>
                <div className="flex space-x-2">
                    <FilterButton label="All" value="all" />
                    <FilterButton label="In" value="incoming" />
                    <FilterButton label="Out" value="outgoing" />
                </div>
            </div>
			
			<div className="space-y-1">
				{loading ? (
					[1, 2, 3].map(i => <TransactionSkeleton key={i} />)
				) : transactions.length > 0 ? (
					transactions.slice(0, limit || 5).map((transaction) => (
						<TransactionItem key={transaction._id} transaction={transaction} />
					))
				) : (
					<div className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No transactions recorded.</div>
				)}
			</div>
		</div>
	);
};


export default TransactionHistory;
