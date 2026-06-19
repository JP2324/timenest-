import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';

const router = Router();

// Static routes must come before dynamic param routes
router.get('/', requireAuth(), getNotifications);
router.get('/unread-count', requireAuth(), getUnreadCount);
router.patch('/read-all', requireAuth(), markAllAsRead);
router.patch('/:id/read', requireAuth(), markAsRead);

export default router;
