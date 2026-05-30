import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { syncUser, getUser } from '../controllers/userController';

const router = Router();

// Both routes require a valid Clerk session token
router.post('/sync', requireAuth(), syncUser);
router.get('/:clerkId', requireAuth(), getUser);

export default router;
