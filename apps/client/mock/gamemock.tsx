import { Game, GameTemplate } from '../types/gametypes';

export const recentGamesMock: Game[] = [
  {
    id: 1,
    startedAt: '2025-07-01T10:00:00Z',
    finishedAt: '2025-07-01T10:05:00Z',
    isHintUsed: true,
    isFinished: true,
    gameCode: 'abc123',
    timer: true,
    gameTemplate: {
      id: 11,
      gameTopic: 'Sea Creatures',
      gameType: 'crossword',
      difficulty: 'A1',
      isPublic: false,
    },
  },
  {
    id: 2,
    startedAt: '2025-07-03T14:00:00Z',
    finishedAt: '2025-07-03T14:10:00Z',
    isHintUsed: false,
    isFinished: true,
    gameCode: 'pizza456',
    timer: false,
    gameTemplate: {
      id: 12,
      gameTopic: 'Pizza Store',
      gameType: 'wordsearch',
      difficulty: 'B2',
      isPublic: false,
    },
  },
];

export const publicGamesMock: GameTemplate[] = [
  {
    id: 21,
    gameTopic: 'Aquatic Life',
    gameType: 'crossword',
    difficulty: 'C1',
    isPublic: true,
  },
  {
    id: 22,
    gameTopic: 'Dinosaur Park',
    gameType: 'wordsearch',
    difficulty: 'A2',
    isPublic: true,
  },
];
