import React from "react";
import SharedGameScreen from "../components/SharedGameScreen";
import { questionsAndAnswers } from "../data/gameData";

export default function CrosswordSearchGame() {
  return (
    <SharedGameScreen
      mode="crossword"
      title="Answer the clues!"
      CELL_SIZE={50}
      GRID_SIZE={10}
      questionsAndAnswers={questionsAndAnswers}
    />
  );
}
