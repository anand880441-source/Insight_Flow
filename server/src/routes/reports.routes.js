const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reports.controller');

router.post('/', ctrl.createReport);
router.get('/', ctrl.listReports);
router.get('/:id', ctrl.getReport);
router.delete('/:id', ctrl.deleteReport);

module.exports = router;
