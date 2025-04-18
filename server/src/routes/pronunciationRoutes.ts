const express = require('express');
const { pronunciation } = require('../controllers/pronunciationController');

const router = express.Router();

router.post('/pronunciation', pronunciation);

export default router;