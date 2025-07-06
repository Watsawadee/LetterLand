import React from "react";
import SharedGameScreen from "../components/SharedGameScreen";
import { questionsAndAnswers } from "../data/gameData";

export default function CrosswordSearchGame() {
  return (
    <SharedGameScreen
      mode="crossword_search"
      title="Titlee!"
      CELL_SIZE={55}
      GRID_SIZE={12}
      questionsAndAnswers={questionsAndAnswers}
    />
  );
}
