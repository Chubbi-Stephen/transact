const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.setBudget);

module.exports = router;
