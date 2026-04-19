// nexus/backend/src/routes/bookmarks.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { listBookmarks, addBookmark, removeBookmark } from '../controllers/bookmarksController';

const router = Router();

router.use(authenticate);

router.get('/', listBookmarks);
router.post('/:companyId', addBookmark);
router.delete('/:companyId', removeBookmark);

export default router;
