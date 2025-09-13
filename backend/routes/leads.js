import { Router } from 'express';
import { createLead, getLeads, getLead, updateLead, deleteLead } from '../controllers/leadController.js';
import authenticateToken from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;