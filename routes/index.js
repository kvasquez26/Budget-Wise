import { Router } from 'express';
import homeRoutes from './budgetRoutes.js';
import budgetRoutes from './budget.js';

const router = Router();

//Homepage 
router.use('/', homeRoutes);

//Budget feature
router.use('/budget', budgetRoutes);

//404 handler
router.use((req, res) => {
    return res.status(404).render('error', {
        title: 'Not Found',
        error: 'This page does not exist.'
    });
});

export default router;
