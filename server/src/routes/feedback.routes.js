const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/feedback.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', ctrl.createFeedback);
router.get('/', ctrl.listFeedback);
router.get('/:id', ctrl.getFeedback);
router.delete('/:id', ctrl.deleteFeedback);
router.post('/import', upload.single('file'), ctrl.importCSV);

module.exports = router;
