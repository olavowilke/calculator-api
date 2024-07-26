const express = require('express');
const router = express.Router();
const {
    createOperation,
    getOperations,
    getOperationById,
    updateOperation,
    deleteOperation
} = require('../controllers/operationsController');
const {auth} = require('../middleware/auth');

router.post('/', auth, createOperation);
router.get('/', auth, getOperations);
router.get('/:id', auth, getOperationById);
router.put('/:id', auth, updateOperation);
router.delete('/:id', auth, deleteOperation);

module.exports = router;
