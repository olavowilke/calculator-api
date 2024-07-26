const express = require('express');
const router = express.Router();
const {createRecord, getUserRecords, deleteRecord} = require('../controllers/recordsController');
const {auth} = require('../middleware/auth');

router.post('/', auth, createRecord);
router.get('/', auth, getUserRecords);
router.delete('/:id', auth, deleteRecord);

module.exports = router;
