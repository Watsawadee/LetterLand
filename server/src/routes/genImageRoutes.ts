import express from 'express';
import { genImageAPI, getImage } from '../controllers/genImageController';
const router = express.Router();

router.get('/image/:fileName', getImage);
router.post('/genimage', genImageAPI);

export default router;
