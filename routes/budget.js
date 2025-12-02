import { Router } from 'express';
import { budgetData } from '../data/index.js';

const router = Router();

const TEMP_USER_ID = "654a1f2b9c3e4a0012a5d789";

//GET - show budget form + current budget
router.get('/', async (req, res) => {
    try {
        const userId = TEMP_USER_ID;
        const currentBudget = await budgetData.getBudgetForUser(userId);

        return res.render('budget', {
            title: 'Set Your Budget',
            budget: currentBudget,
            error: null
        });
    } catch (e) {
        return res.status(500).render('budget', {
            title: 'Set Your Budget',
            budget: null,
            error: e.message
        });
    }
});

//POST - create or update budget
router.post('/', async (req, res) => {
    try {
        const userId = TEMP_USER_ID;
        const {totalBudget } = req.body;

        if (!totalBudget || totalBudget.trim() === '') {
            return res.status(400).render('budget', {
                title: 'Set Your Budget',
                budget: null,
                error: 'A budget amount is required.'
            });
        }

        await budgetData.createOrUpdateBudget(userId, totalBudget);

        return res.redirect('/dashboard');
    } catch (e) {
        return res.status(500).render('budget', {
            title: 'Set Your Budget',
            budget: null,
            error: e.message
        });
    }
});

export default router;