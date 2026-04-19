// nexus/backend/src/routes/insights.ts
import { Router } from 'express';
import { getCompanyInsights } from '../controllers/insightsController';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

// GET /api/insights/:companyId
router.get('/:companyId', optionalAuth, getCompanyInsights);

export default router;
