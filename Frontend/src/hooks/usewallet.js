import { useState, useEffect, useCallback } from "react";
import { authApi, transactionsApi } from "../services/api";

export const useWallet = () => {
	const [balance, setBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchBalance = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await authApi.getProfile();
			setBalance(data.user.balance || 0);
			setError(null);
		} catch (err) {
			setError("Failed to fetch wallet balance");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBalance();
	}, [fetchBalance]);

	const addMoney = async (amount) => {
		try {
			await transactionsApi.create({
				amount,
				type: 'credit',
				category: 'Income',
				description: 'Wallet funding',
				status: 'completed'
			});
			await fetchBalance();
			return true;
		} catch (err) {
			setError(err.response?.data?.message || "Failed to add money");
			return false;
		}
	};

	const withdraw = async (amount) => {
		try {
			await transactionsApi.create({
				amount,
				type: 'debit',
				category: 'Transfer',
				description: 'Wallet withdrawal',
				status: 'completed'
			});
			await fetchBalance();
			return true;
		} catch (err) {
			setError(err.response?.data?.message || "Failed to withdraw money");
			return false;
		}
	};

	return { balance, loading, error, addMoney, withdraw, refreshBalance: fetchBalance };
};

