// nexus/backend/src/routes/connections.ts
import { Router } from 'express';
import { body } from 'express-validator';
import {
  sendConnection,
  listConnections,
  respondToConnection,
} from '../controllers/connectionsController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('companyId').isUUID(),
    body('role').isIn(['BUYER', 'SELLER', 'INVESTOR']),
    body('message').optional().isString().trim().isLength({ max: 500 }),
  ],
  validate,
  sendConnection,
);

router.get('/', listConnections);

router.patch(
  '/:id',
  [body('status').isIn(['ACCEPTED', 'DECLINED'])],
  validate,
  respondToConnection,
);

export default router;
