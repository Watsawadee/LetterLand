import React from "react";
import SharedGameScreen from "../components/SharedGameScreen";
import { questionsAndAnswers } from "../data/gameData";

export default function WordSearchGame() {
  return (
    <SharedGameScreen
      mode="wordsearch"
      title="Find all the words!"
      CELL_SIZE={60}
      GRID_SIZE={10}
      questionsAndAnswers={questionsAndAnswers}
    />
  );
}
