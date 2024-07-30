import express from 'express';
import { createRecord, deleteRecord, getUserRecords } from '../controllers/recordsController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createRecord);
router.get('/', auth, getUserRecords);
router.delete('/:id', auth, deleteRecord);

export default router;
