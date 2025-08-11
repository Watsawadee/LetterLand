import express from "express";
import {
  getAllGameController,
  getAllGameByUserIdController,
  getGameDataController,
  recordFoundWordController,
  batchRecordFoundWordsController,
} from "../controllers/gameController";

const router = express.Router();

router.get("/game", getAllGameController);
router.get("/:userId", getAllGameByUserIdController);
router.get("/gamedata/:gameId", getGameDataController);

router.post("/:gameId/wordfound", recordFoundWordController);
router.post("/:gameId/wordfound/batch", batchRecordFoundWordsController);

export default router;
