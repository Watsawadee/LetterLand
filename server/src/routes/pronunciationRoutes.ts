const express = require('express');
const { pronunciation, getAudio } = require('../controllers/pronunciationController');

const router = express.Router();

router.get('/audio/:gameId', getAudio);
router.post('/pronunciation', pronunciation);

export default router;