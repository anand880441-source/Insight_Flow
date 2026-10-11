const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analytics.controller');

router.get('/overview', ctrl.overview);
router.get('/trends', ctrl.trends);
router.get('/top-complaints', ctrl.topComplaints);
router.get('/sentiment-by-category', ctrl.sentimentByCategory);

module.exports = router;
