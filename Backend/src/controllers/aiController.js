const AIService = require('../services/aiService');

const analyzeSpending = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const analysis = await AIService.analyzeTransactions(userId);
        res.status(200).json(analysis);
    } catch (error) {
        console.error("[AI Controller] Error:", error);
        res.status(500).json({ message: "Failed to analyze transactions" });
    }
};

const getBudgetRecommendations = async (req, res) => {
    // We've consolidated this into analyzeSpending for now
    try {
        const userId = req.user.id || req.user._id;
        const analysis = await AIService.analyzeTransactions(userId);
        res.status(200).json({ recommendations: [analysis.recommendation] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const predictExpenses = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const forecast = await AIService.getPredictiveForecast(userId);
        res.status(200).json(forecast);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const chatWithCoach = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await AIService.chatWithCoach(userId, req.body.message);
        res.status(200).json({ reply: result.reply, action: result.action || null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const report = await AIService.getMonthlyCoachingReport(userId);
        res.status(200).json({ report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    analyzeSpending, 
    getBudgetRecommendations, 
    predictExpenses, 
    chatWithCoach, 
    getMonthlyReport 
};