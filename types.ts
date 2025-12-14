export interface HistoryQuestion {
  id: string;
  topic: string; // The main historical concept (e.g., "The Silk Road")
  description?: string; // Optional context
  correctItems: string[]; // 5 items that belong to the topic
  distractorItems: string[]; // 5 items that do NOT belong
}

export interface CardItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface User {
  username: string;
  highScore: number;
}

export type GameState = 'welcome' | 'playing' | 'gameover' | 'victory';

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}