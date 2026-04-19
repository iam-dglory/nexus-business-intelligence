// nexus/backend/src/routes/companies.ts
import { Router } from 'express';
import { query } from 'express-validator';
import {
  listCompanies,
  getCompany,
  searchCompanies,
  getTrending,
  createCompany,
} from '../controllers/companiesController';
import { authenticate } from '../middleware/authenticate';
import { optionalAuth } from '../middleware/optionalAuth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/companies — main map feed with filters
router.get(
  '/',
  optionalAuth,
  [
    query('lat').optional().isFloat(),
    query('lng').optional().isFloat(),
    query('radius').optional().isFloat({ min: 1, max: 5000 }),
    query('type').optional().isIn(['B2B', 'B2C', 'HYBRID']),
    query('industry').optional().isString(),
    query('minAge').optional().isInt({ min: 0 }),
    query('maxAge').optional().isInt({ max: 200 }),
    query('minValuation').optional().isInt({ min: 0 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 500 }),
  ],
  validate,
  listCompanies,
);

// GET /api/companies/search — autocomplete
router.get('/search', searchCompanies);

// GET /api/companies/trending
router.get('/trending', getTrending);

// GET /api/companies/:id
router.get('/:id', optionalAuth, getCompany);

// POST /api/companies — create (authenticated business users)
router.post('/', authenticate, createCompany);

export default router;
