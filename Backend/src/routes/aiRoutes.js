const express = require('express');
const {
    analyzeSpending,
    getBudgetRecommendations,
    predictExpenses,
    chatWithCoach,
    getMonthlyReport
} = require('../controllers/aiController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/analyze', analyzeSpending);
router.get('/recommendations', getBudgetRecommendations);
router.get('/predict', predictExpenses);
router.post('/chat', chatWithCoach);
router.get('/report', getMonthlyReport);


module.exports = router;