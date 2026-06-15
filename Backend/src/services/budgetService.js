const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

class BudgetService {
    async setBudget(userId, data) {
        try {
            const { category, amount, period } = data;
            console.log(`[BudgetService] Setting budget for user ${userId}: ${category} = ₦${amount}`);
            
            let budget = await Budget.findOne({ user: userId, category });
            
            if (budget) {
                budget.amount = amount;
                budget.period = period || 'monthly';
                await budget.save();
            } else {
                budget = new Budget({
                    user: userId,
                    category,
                    amount,
                    period: period || 'monthly'
                });
                await budget.save();
            }
            
            return budget;
        } catch (error) {
            console.error("[BudgetService Error]:", error);
            throw error;
        }
    }


    async getBudgets(userId) {
        const budgets = await Budget.find({ user: userId });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const summaries = await Promise.all(budgets.map(async (budget) => {
            const transactions = await Transaction.find({
                user: userId,
                category: budget.category,
                type: 'debit',
                createdAt: { $gte: startOfMonth }
            });

            const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            return {
                ...budget.toObject(),
                spent,
                percentage: Math.min(percentage, 100),
                remaining: Math.max(budget.amount - spent, 0),
                isExceeded: spent > budget.amount
            };
        }));

        return summaries;
    }
}

module.exports = new BudgetService();
