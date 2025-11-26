export type Player = 'player1' | 'player2' | 'player3';
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GameResult = Player | 'draw' | null;

export type QuestionType = 'multiple-choice' | 'sentence-choice' | 'recording' | 'sentence-scramble' | 'dictation';

export interface WordChallenge {
  word: string;
  questionType: QuestionType;
  // For multiple-choice and sentence-choice
  definitions?: string[];
  correctDefinitionIndex?: number;
  sentences?: string[];
  correctSentenceIndex?: number;
  // For recording and dictation
  sentenceToRecord?: string; // המשפט להקלטה/הכתבה
  // For sentence-scramble
  scrambledWords?: string[]; // המילים בסדר מעורב
  correctSentence?: string; // המשפט הנכון
  // For dictation - track if this sentence was recorded earlier
  wasRecorded?: boolean; // האם המשפט הזה נשאל להקלטה קודם
}

export interface PlayerState {
  score: number;
  lastAnswerTime?: number;
  isReady: boolean;
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
    player3: string | null;
  };
  playerStates: {
    player1: PlayerState;
    player2: PlayerState;
    player3: PlayerState;
  };
  winner: GameResult;
  lastMove: {
    player: Player;
    answer: 'definition' | 'sentence' | 'recording' | 'sentence-scramble' | 'dictation';
    isCorrect: boolean;
    time: number;
    selectedIndex: number;
    answerValue?: string;
  } | null;
  timerStartTime?: number; // When the current question timer started
  timeLeft?: number; // Current time left in seconds
  questionResults?: {
    player1?: { isCorrect: boolean; answerTime: number; selectedIndex?: number; speedBonus?: number; speedBonusText?: string; answerTimeSeconds?: number };
    player2?: { isCorrect: boolean; answerTime: number; selectedIndex?: number; speedBonus?: number; speedBonusText?: string; answerTimeSeconds?: number };
    player3?: { isCorrect: boolean; answerTime: number; selectedIndex?: number; speedBonus?: number; speedBonusText?: string; answerTimeSeconds?: number };
  }; // Results for the current question
  createdAt: number;
  updatedAt: number;
  chatMessages: ChatMessage[];
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