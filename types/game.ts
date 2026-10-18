export type Player = 'player1' | 'player2';
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GameResult = Player | 'draw' | null;

export interface WordChallenge {
  word: string;
  definitions: string[];
  correctDefinitionIndex: number;
  sentences: string[];
  correctSentenceIndex: number;
  /** Which question the players answer this round */
  questionType?: 'definition' | 'sentence';
}

export interface PlayerState {
  score: number;
  lastAnswerTime?: number;
  isReady: boolean;
  hasAnswered?: boolean; // Track if player has answered current question
  powerUps: {
    revealLetter: number;
    skipWord: number;
    freezeOpponent: number;
  };
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'emoji';
}

export interface LastEmoji {
  sender: string;
  emoji: string;
  time: number;
}

export interface Game {
  id: string;
  status: GameStatus;
  currentRound: number;
  maxRounds: number;
  currentWord?: WordChallenge;
  players: {
    player1: string | null;
    player2: string | null;
  };
  playerStates: {
    player1: PlayerState;
    player2: PlayerState;
  };
  winner: GameResult;
  lastMove: {
    player: Player;
    answer: 'definition' | 'sentence' | 'timeout';
    isCorrect: boolean;
    time: number;
    selectedIndex: number;
  } | null;
  difficulty?: string;
  createdAt: number;
  updatedAt: number;
  chatMessages: ChatMessage[];
  lastEmoji?: LastEmoji | null;
  revealedLetters?: {
    [key in Player]?: string[];
  };
}

export interface GameMove {
  gameId: string;
  player: Player;
  answer: 'definition' | 'sentence';
  selectedIndex: number;
} 