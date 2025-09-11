import express from "express";
import {
  getAllGameController,
  getAllGameByUserIdController,
  getGameDataController,
  getWordFoundController,
  recordFoundWordController,
  batchRecordFoundWordsController,
  completeGameController,
  deleteIncompleteGameController,
} from "../controllers/gameController";

const router = express.Router();

router.get("/", getAllGameController);
router.get("/user/:userId", getAllGameByUserIdController);
router.get("/wordfound/:gameId", getWordFoundController);

router.post("/:gameId/complete", completeGameController);
router.post("/:gameId/wordfound/batch", batchRecordFoundWordsController);
router.post("/:gameId/wordfound", recordFoundWordController);

router.delete("/:gameId/delete", deleteIncompleteGameController);

router.get("/:gameId", getGameDataController);

export default router;
