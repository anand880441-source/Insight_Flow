const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');

router.post('/analyze', ctrl.analyze);
router.post('/cluster', ctrl.cluster);
router.get('/issues', ctrl.listIssues);
router.post('/issues/bulk-status', ctrl.bulkUpdateStatus);
router.patch('/issues/:id', ctrl.updateIssue);

module.exports = router;
