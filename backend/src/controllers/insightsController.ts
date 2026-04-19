// nexus/backend/src/controllers/insightsController.ts
import { Request, Response, NextFunction } from 'express';
import { getInsights } from '../services/aiInsights';
import { AppError } from '../utils/AppError';

export async function getCompanyInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const insights = await getInsights(companyId);
    if (!insights) throw new AppError('Company not found', 404);
    res.json(insights);
  } catch (err) {
    next(err);
  }
}
