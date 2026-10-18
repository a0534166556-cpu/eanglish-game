/**
 * Pure Word Clash game engine (shared by API + tests).
 */

export const QUESTION_DURATION_MS = 20000;

type GetNextWord = (difficulty: string, round: number) => any;

function makePlayerState(overrides: Record<string, any> = {}) {
  return {
    score: 0,
    isReady: true,
    hasAnswered: false,
    lastAnswerTime: undefined as number | undefined,
    powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 },
    ...overrides,
  };
}

export function makeWord(round = 0, startedAt = Date.now()) {
  return {
    word: `word_r${round}`,
    definitions: ['a', 'b', 'c', 'd'],
    correctDefinitionIndex: 1,
    sentences: ['s1', 's2', 's3', 's4'],
    correctSentenceIndex: 2,
    questionType: (round % 2 === 0 ? 'definition' : 'sentence') as 'definition' | 'sentence',
    startedAt,
  };
}

export function createGame(player1Id: string, { maxRounds = 5, now = Date.now() } = {}) {
  return {
    id: `game_${now}`,
    status: 'waiting' as string,
    currentRound: 0,
    maxRounds,
    difficulty: 'easy',
    currentWord: makeWord(0, now) as any,
    currentQuestion: null as any,
    players: { player1: player1Id as string | null, player2: null as string | null },
    playerStates: {
      player1: makePlayerState(),
      player2: makePlayerState({ isReady: false }),
    },
    lastMove: null as any,
    winner: null as string | null,
    createdAt: now,
    updatedAt: now,
    chatMessages: [] as any[],
  };
}

export function joinGame(game: any, player2Id: string, { now = Date.now() } = {}) {
  if (game.status === 'finished') return { error: 'finished' as const, game };
  if (game.players.player1 === player2Id || game.players.player2 === player2Id) {
    return { game };
  }
  if (game.players.player2) return { error: 'full' as const, game };

  game.players.player2 = player2Id;
  game.status = 'active';
  game.playerStates.player1.hasAnswered = false;
  game.playerStates.player2 = makePlayerState();
  if (game.currentWord) game.currentWord.startedAt = now;
  else game.currentWord = makeWord(game.currentRound, now);
  game.updatedAt = now;
  return { game };
}

export function advanceRoundIfReady(
  game: any,
  { now = Date.now(), getNextWord }: { now?: number; getNextWord?: GetNextWord } = {}
): boolean {
  const both =
    game.playerStates?.player1?.hasAnswered === true &&
    game.playerStates?.player2?.hasAnswered === true &&
    game.players?.player2 !== null;
  if (!both) return false;

  game.playerStates.player1.hasAnswered = false;
  game.playerStates.player2.hasAnswered = false;
  game.playerStates.player1.lastAnswerTime = undefined;
  game.playerStates.player2.lastAnswerTime = undefined;
  game.currentRound += 1;

  if (game.currentRound >= game.maxRounds) {
    const s1 = game.playerStates.player1.score || 0;
    const s2 = game.playerStates.player2.score || 0;
    if (s1 > s2) game.winner = 'player1';
    else if (s2 > s1) game.winner = 'player2';
    else game.winner = 'draw';
    game.status = 'finished';
    game.currentWord = null;
  } else {
    const next = getNextWord
      ? getNextWord(game.difficulty || 'easy', game.currentRound)
      : makeWord(game.currentRound, now);
    if (!next) {
      game.status = 'finished';
      game.currentWord = null;
    } else {
      game.currentWord = next;
      if (!game.currentWord.startedAt) game.currentWord.startedAt = now;
      game.currentQuestion = null;
    }
  }
  game.updatedAt = now;
  return true;
}

export function applyQuestionDeadline(
  game: any,
  { now = Date.now(), getNextWord }: { now?: number; getNextWord?: GetNextWord } = {}
): boolean {
  if (!game || game.status !== 'active' || !game.players?.player2) return false;
  if (!game.currentWord) return false;

  if (!game.currentWord.startedAt) {
    game.currentWord.startedAt = now;
    return true;
  }

  if (now - game.currentWord.startedAt < QUESTION_DURATION_MS) return false;

  let changed = false;
  for (const p of ['player1', 'player2'] as const) {
    if (game.playerStates[p].hasAnswered !== true) {
      game.playerStates[p].hasAnswered = true;
      game.playerStates[p].lastAnswerTime = now;
      game.lastMove = {
        player: p,
        answer: 'timeout',
        isCorrect: false,
        time: now,
        selectedIndex: -1,
      };
      changed = true;
    }
  }
  if (advanceRoundIfReady(game, { now, getNextWord })) changed = true;
  return changed;
}

export function computeTimeLeft(game: any, { now = Date.now() } = {}) {
  if (!game || game.status !== 'active' || !game.currentWord) return 0;
  const started = game.currentWord.startedAt || game.updatedAt || now;
  const left = Math.ceil((QUESTION_DURATION_MS - (now - started)) / 1000);
  return Math.min(20, Math.max(0, left));
}

export function resolveSymbol(game: any, playerId: string) {
  if (game.players.player1 === playerId) return 'player1' as const;
  if (game.players.player2 === playerId) return 'player2' as const;
  return null;
}

export function applyMove(
  game: any,
  {
    playerId,
    answer,
    selectedIndex,
    round,
  }: { playerId: string; answer: string; selectedIndex: number; round?: number },
  { now = Date.now(), getNextWord }: { now?: number; getNextWord?: GetNextWord } = {}
) {
  applyQuestionDeadline(game, { now, getNextWord });

  if (game.status !== 'active') return { error: 'not_active' as const, game };

  const symbol = resolveSymbol(game, playerId);
  if (!symbol) return { error: 'not_in_game' as const, game };

  if (typeof round === 'number' && round !== game.currentRound) {
    return { game, ignored: true as const };
  }

  if (game.playerStates[symbol].hasAnswered === true) {
    return { game, ignored: true as const };
  }

  const expectedType =
    game.currentWord?.questionType || (game.currentRound % 2 === 0 ? 'definition' : 'sentence');

  if (answer !== 'timeout' && answer !== expectedType) {
    return { error: 'wrong_type' as const, game };
  }

  let isCorrect = false;
  if (answer === 'timeout') {
    isCorrect = false;
  } else if (game.currentWord) {
    if (answer === 'definition') {
      isCorrect = game.currentWord.correctDefinitionIndex === selectedIndex;
    } else if (answer === 'sentence') {
      isCorrect = game.currentWord.correctSentenceIndex === selectedIndex;
    }
  }

  game.playerStates[symbol].hasAnswered = true;
  game.playerStates[symbol].lastAnswerTime = now;
  game.lastMove = {
    player: symbol,
    answer,
    isCorrect,
    time: now,
    selectedIndex: typeof selectedIndex === 'number' ? selectedIndex : -1,
  };
  if (isCorrect) game.playerStates[symbol].score += 10;

  advanceRoundIfReady(game, { now, getNextWord });
  game.updatedAt = now;
  return { game };
}
