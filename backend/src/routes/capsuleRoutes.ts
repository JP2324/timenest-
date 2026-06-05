import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import multer from 'multer';
import { createCapsule, getMyCapsules, getReceivedCapsules, getCapsuleById, uploadMedia } from '../controllers/capsuleController';

const router = Router();

// Multer configured for in-memory storage (buffers sent to ImageKit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

router.post('/', requireAuth(), createCapsule);
router.get('/mine', requireAuth(), getMyCapsules);
router.get('/received', requireAuth(), getReceivedCapsules);
router.post('/upload', requireAuth(), upload.array('files', 10), uploadMedia);

// Dynamic param route must come after static routes
router.get('/:id', requireAuth(), getCapsuleById);

export default router;

