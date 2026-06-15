const BudgetService = require('../services/budgetService');

const setBudget = async (req, res) => {
    try {
        const budget = await BudgetService.setBudget(req.user._id, req.body);
        res.status(200).json(budget);
    } catch (error) {
        console.error("[BudgetController]: Failed to set budget:", error);
        res.status(500).json({ 
            message: 'Failed to set budget limit', 
            error: error.message,
            tip: "Check if the amount is a valid number and category is selected."
        });
    }

};

const getBudgets = async (req, res) => {
    try {
        const budgets = await BudgetService.getBudgets(req.user._id);
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
};

module.exports = {
    setBudget,
    getBudgets,
};
