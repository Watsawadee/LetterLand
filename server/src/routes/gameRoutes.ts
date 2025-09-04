import express from "express";
import {
  getAllGameController,
  getAllGameByUserIdController,
  getGameDataController,
  getWordFoundController,
  recordFoundWordController,
  batchRecordFoundWordsController,
} from "../controllers/gameController";

const router = express.Router();

router.get("/", getAllGameController);
router.get("/user/:userId", getAllGameByUserIdController);
router.get("/:gameId", getGameDataController);
router.get("/wordfound/:gameId", getWordFoundController);

router.post("/:gameId/wordfound", recordFoundWordController);
router.post("/:gameId/wordfound/batch", batchRecordFoundWordsController);

export default router;
