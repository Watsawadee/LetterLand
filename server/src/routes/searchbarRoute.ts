import express from 'express';
import { searchGames } from '../controllers/searchbarController';

const router = express.Router();
router.get('/search-games', searchGames);
export default router;
