import express from 'express';
import {
    createOperation,
    deleteOperation,
    getOperationById,
    getOperations,
    updateOperation
} from '../controllers/operationsController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Define the route handlers with type annotations
router.post('/', auth, createOperation);
router.get('/', auth, getOperations);
router.get('/:id', auth, getOperationById);
router.put('/:id', auth, updateOperation);
router.delete('/:id', auth, deleteOperation);

export default router;
