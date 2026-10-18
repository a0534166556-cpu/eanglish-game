/**
 * Full Word Clash functionality checklist.
 * Run: node scripts/test-word-clash-full.js
 */
const {
  QUESTION_DURATION_MS,
  createGame,
  joinGame,
  applyMove,
  applyQuestionDeadline,
  computeTimeLeft,
  resolveSymbol,
} = require('../lib/wordClashEngine');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ✅ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ❌ ${msg}`);
  }
}

console.log('\n=== Word Clash Full Functionality ===\n');

// --- Lobby ---
console.log('A) Lobby: create / join / full / already-in');
{
  const t0 = 1000;
  let g = createGame('alice', { now: t0 });
  assert(g.status === 'waiting', 'create → waiting');
  assert(resolveSymbol(g, 'alice') === 'player1', 'creator is player1');

  let r = joinGame(g, 'bob', { now: t0 + 1 });
  g = r.game;
  assert(g.status === 'active', 'join → active');
  assert(resolveSymbol(g, 'bob') === 'player2', 'joiner is player2');
  assert(g.currentWord.startedAt === t0 + 1, 'clock starts on join');

  r = joinGame(g, 'bob', { now: t0 + 2 });
  assert(!r.error, 're-join same player ok');
  assert(g.players.player2 === 'bob', 'still bob');

  r = joinGame(g, 'carol', { now: t0 + 3 });
  assert(r.error === 'full', 'third player rejected');
}

// --- Scoring ---
console.log('\nB) Scoring: correct / wrong / timeout');
{
  const t0 = 2000;
  let g = createGame('p1', { now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;

  applyMove(g, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 100 });
  assert(g.playerStates.player1.score === 10, 'correct = +10');

  applyMove(g, { playerId: 'p2', answer: 'definition', selectedIndex: 0, round: 0 }, { now: t0 + 200 });
  assert(g.playerStates.player2.score === 0, 'wrong = 0');
  assert(g.currentRound === 1, 'advanced after both');

  // sentence round
  assert(g.currentWord.questionType === 'sentence', 'round 1 is sentence');
  applyMove(g, { playerId: 'p1', answer: 'sentence', selectedIndex: 2, round: 1 }, { now: t0 + 300 });
  applyMove(g, { playerId: 'p2', answer: 'timeout', selectedIndex: -1, round: 1 }, { now: t0 + 400 });
  assert(g.playerStates.player1.score === 20, 'p1 +10 again');
  assert(g.playerStates.player2.score === 0, 'timeout scores 0');
  assert(g.currentRound === 2, 'advanced to round 2');
}

// --- Timer sync ---
console.log('\nC) Timer: shared + bounds + deadline');
{
  const t0 = 3000;
  let g = createGame('p1', { now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;
  assert(computeTimeLeft(g, { now: t0 }) === 20, 'start 20');
  assert(computeTimeLeft(g, { now: t0 + 10000 }) === 10, 'mid 10');
  assert(computeTimeLeft(g, { now: t0 + QUESTION_DURATION_MS }) === 0, 'end 0');

  applyQuestionDeadline(g, { now: t0 + QUESTION_DURATION_MS });
  assert(g.currentRound === 1, 'deadline advances once');
  assert(computeTimeLeft(g, { now: t0 + QUESTION_DURATION_MS }) === 20, 'new question 20s');
}

// --- Anti-skip ---
console.log('\nD) Anti-skip: stale rounds / double answer');
{
  const t0 = 4000;
  let g = createGame('p1', { maxRounds: 5, now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;
  applyMove(g, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 1 });
  applyMove(g, { playerId: 'p2', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 2 });
  assert(g.currentRound === 1, 'on round 1');

  const before = g.currentRound;
  for (const r of [0, 2, 3, 4]) {
    applyMove(g, { playerId: 'p1', answer: 'timeout', selectedIndex: -1, round: r }, { now: t0 + 10 + r });
    applyMove(g, { playerId: 'p2', answer: 'timeout', selectedIndex: -1, round: r }, { now: t0 + 20 + r });
  }
  assert(g.currentRound === before, 'stale flood ignored');

  applyMove(g, { playerId: 'p1', answer: 'sentence', selectedIndex: 0, round: 1 }, { now: t0 + 50 });
  const score = g.playerStates.player1.score;
  applyMove(g, { playerId: 'p1', answer: 'sentence', selectedIndex: 2, round: 1 }, { now: t0 + 51 });
  assert(g.playerStates.player1.score === score, 'double answer ignored');
}

// --- Winner ---
console.log('\nE) Match end + winner');
{
  const t0 = 5000;
  let g = createGame('p1', { maxRounds: 2, now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;

  // Round 0: only p1 correct
  applyMove(g, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 1 });
  applyMove(g, { playerId: 'p2', answer: 'definition', selectedIndex: 0, round: 0 }, { now: t0 + 2 });
  // Round 1: both wrong/timeout
  applyMove(g, { playerId: 'p1', answer: 'timeout', selectedIndex: -1, round: 1 }, { now: t0 + 3 });
  applyMove(g, { playerId: 'p2', answer: 'timeout', selectedIndex: -1, round: 1 }, { now: t0 + 4 });

  assert(g.status === 'finished', 'finished');
  assert(g.winner === 'player1', 'p1 wins');
  assert(g.currentWord === null, 'no current word when finished');
}

// --- Question type gate ---
console.log('\nF) Question type enforcement');
{
  const t0 = 6000;
  let g = createGame('p1', { now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;
  const res = applyMove(g, { playerId: 'p1', answer: 'sentence', selectedIndex: 0, round: 0 }, { now: t0 + 1 });
  assert(res.error === 'wrong_type', 'definition round rejects sentence');
}

// --- Parallel play simulation (both answer same ms) ---
console.log('\nG) Parallel answers same tick');
{
  const t0 = 7000;
  let g = createGame('p1', { now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;
  applyMove(g, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 5 });
  applyMove(g, { playerId: 'p2', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 5 });
  assert(g.currentRound === 1, 'both same time → one advance');
  assert(g.playerStates.player1.score === 10 && g.playerStates.player2.score === 10, 'both scored');
}

// --- Waiting game cannot move ---
console.log('\nH) Waiting game rejects moves');
{
  const t0 = 8000;
  const g = createGame('p1', { now: t0 });
  const res = applyMove(g, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 1 });
  // applyQuestionDeadline returns early without player2; status still waiting
  assert(g.status === 'waiting', 'still waiting');
  assert(res.error === 'not_active' || g.playerStates.player1.hasAnswered !== true, 'no play while waiting');
}

// --- Client contract: response shape fields UI needs ---
console.log('\nI) Client contract fields');
{
  const t0 = 9000;
  let g = createGame('p1', { now: t0 });
  g = joinGame(g, 'p2', { now: t0 }).game;
  const need = [
    'id', 'status', 'currentRound', 'maxRounds', 'currentWord',
    'players', 'playerStates', 'lastMove', 'winner', 'chatMessages',
  ];
  for (const k of need) assert(k in g, `game.${k} exists`);
  assert('startedAt' in g.currentWord, 'currentWord.startedAt');
  assert('questionType' in g.currentWord, 'currentWord.questionType');
  assert(Array.isArray(g.currentWord.definitions) && g.currentWord.definitions.length === 4, '4 definitions');
  assert(Array.isArray(g.currentWord.sentences) && g.currentWord.sentences.length === 4, '4 sentences');
}

console.log(`\n=== Full suite: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
