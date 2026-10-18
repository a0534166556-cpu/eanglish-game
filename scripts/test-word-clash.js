/**
 * Word Clash regression tests — run: node scripts/test-word-clash.js
 */
const {
  QUESTION_DURATION_MS,
  createGame,
  joinGame,
  applyMove,
  applyQuestionDeadline,
  computeTimeLeft,
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

function deepClone(g) {
  return JSON.parse(JSON.stringify(g));
}

console.log('\n=== Word Clash Engine Tests ===\n');

// 1) Create + join
{
  console.log('1) Create & join');
  const t0 = 1_000_000;
  let game = createGame('p1', { now: t0 });
  assert(game.status === 'waiting', 'starts waiting');
  assert(game.currentRound === 0, 'round 0');
  assert(!!game.currentWord?.startedAt, 'word has startedAt');

  const joined = joinGame(game, 'p2', { now: t0 + 5000 });
  game = joined.game;
  assert(!joined.error, 'join ok');
  assert(game.status === 'active', 'becomes active');
  assert(game.currentWord.startedAt === t0 + 5000, 'timer resets on join');
  assert(computeTimeLeft(game, { now: t0 + 5000 }) === 20, 'full 20s after join');
}

// 2) Shared timer both players see same value
{
  console.log('\n2) Shared timer');
  const t0 = 2_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  const mid = t0 + 7500;
  assert(computeTimeLeft(game, { now: mid }) === 13, 'after 7.5s → 13 left');
  assert(computeTimeLeft(game, { now: t0 + 20000 }) === 0, 'at 20s → 0');
}

// 3) Both answer correctly → advance exactly one round
{
  console.log('\n3) Both answer → one advance');
  const t0 = 3_000_000;
  let game = createGame('p1', { maxRounds: 5, now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  const r0 = game.currentRound;
  const word0 = game.currentWord.word;

  applyMove(game, {
    playerId: 'p1',
    answer: 'definition',
    selectedIndex: 1,
    round: 0,
  }, { now: t0 + 1000 });
  assert(game.currentRound === r0, 'still same round after one answer');
  assert(game.playerStates.player1.score === 10, 'p1 scored 10');

  applyMove(game, {
    playerId: 'p2',
    answer: 'definition',
    selectedIndex: 1,
    round: 0,
  }, { now: t0 + 2000 });
  assert(game.currentRound === r0 + 1, 'advanced exactly +1');
  assert(game.currentWord.word !== word0, 'new word');
  assert(game.playerStates.player1.hasAnswered === false, 'flags reset p1');
  assert(game.playerStates.player2.hasAnswered === false, 'flags reset p2');
  assert(computeTimeLeft(game, { now: t0 + 2000 }) === 20, 'new question full timer');
}

// 4) Stale timeout from previous round must NOT skip
{
  console.log('\n4) Stale round ignored (no skip)');
  const t0 = 4_000_000;
  let game = createGame('p1', { maxRounds: 5, now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;

  // Finish round 0
  applyMove(game, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 100 });
  applyMove(game, { playerId: 'p2', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 200 });
  assert(game.currentRound === 1, 'on round 1');

  const roundBefore = game.currentRound;
  const scoreBefore = game.playerStates.player1.score;

  // Late timeout meant for round 0
  const res = applyMove(
    game,
    { playerId: 'p1', answer: 'timeout', selectedIndex: -1, round: 0 },
    { now: t0 + 300 }
  );
  assert(res.ignored === true, 'stale move ignored');
  assert(game.currentRound === roundBefore, 'round unchanged');
  assert(game.playerStates.player1.hasAnswered === false, 'not marked answered');
  assert(game.playerStates.player1.score === scoreBefore, 'score unchanged');
}

// 5) Double submit ignored
{
  console.log('\n5) Double submit');
  const t0 = 5_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  applyMove(game, { playerId: 'p1', answer: 'definition', selectedIndex: 0, round: 0 }, { now: t0 + 100 });
  const score = game.playerStates.player1.score;
  applyMove(game, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 200 });
  assert(game.playerStates.player1.score === score, 'second submit does not re-score');
  assert(game.currentRound === 0, 'still round 0 until p2 answers');
}

// 6) Deadline timeouts both AFK → advance once
{
  console.log('\n6) Deadline both AFK');
  const t0 = 6_000_000;
  let game = createGame('p1', { maxRounds: 5, now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  const changed = applyQuestionDeadline(game, { now: t0 + QUESTION_DURATION_MS });
  assert(changed === true, 'deadline applied');
  assert(game.currentRound === 1, 'advanced once after full timeout');
  assert(game.playerStates.player1.hasAnswered === false, 'reset after advance');
}

// 7) Deadline does nothing before 20s
{
  console.log('\n7) No early deadline');
  const t0 = 7_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  const changed = applyQuestionDeadline(game, { now: t0 + 19999 });
  assert(changed === false, 'no change at 19.999s');
  assert(game.currentRound === 0, 'still round 0');
}

// 8) One answered + deadline → timeout other + advance once
{
  console.log('\n8) One answered + deadline');
  const t0 = 8_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  applyMove(game, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 500 });
  assert(game.currentRound === 0, 'waiting for p2');
  applyQuestionDeadline(game, { now: t0 + QUESTION_DURATION_MS });
  assert(game.currentRound === 1, 'advanced after p2 auto-timeout');
  assert(game.playerStates.player1.score === 10, 'p1 kept score');
}

// 9) Rapid stale timeouts cannot skip many rounds
{
  console.log('\n9) No multi-skip from stale timeouts');
  const t0 = 9_000_000;
  let game = createGame('p1', { maxRounds: 5, now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;

  // Play round 0 normally
  applyMove(game, { playerId: 'p1', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 100 });
  applyMove(game, { playerId: 'p2', answer: 'definition', selectedIndex: 1, round: 0 }, { now: t0 + 200 });
  assert(game.currentRound === 1, 'round 1');

  // Flood timeouts for wrong rounds only (not the current round 1)
  for (const r of [0, 2, 3, 4]) {
    applyMove(game, { playerId: 'p1', answer: 'timeout', selectedIndex: -1, round: r }, { now: t0 + 300 + r });
    applyMove(game, { playerId: 'p2', answer: 'timeout', selectedIndex: -1, round: r }, { now: t0 + 301 + r });
  }
  assert(game.currentRound === 1, 'still round 1 after stale flood');
  assert(game.status === 'active', 'still active');
}

// 10) Full match ends after maxRounds questions
{
  console.log('\n10) Full match 5 rounds');
  const t0 = 10_000_000;
  let game = createGame('p1', { maxRounds: 5, now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  let t = t0;

  for (let expectedRound = 0; expectedRound < 5; expectedRound++) {
    assert(game.status === 'active', `active at round ${expectedRound}`);
    assert(game.currentRound === expectedRound, `currentRound is ${expectedRound}`);
    const type = game.currentWord.questionType;
    const idx = type === 'definition' ? 1 : 2;
    t += 1000;
    applyMove(game, { playerId: 'p1', answer: type, selectedIndex: idx, round: expectedRound }, { now: t });
    t += 1000;
    applyMove(game, { playerId: 'p2', answer: type, selectedIndex: idx, round: expectedRound }, { now: t });
  }

  assert(game.status === 'finished', 'finished after 5 rounds');
  assert(game.winner === 'draw', 'draw when equal scores');
  assert(game.playerStates.player1.score === 50, 'p1 score 50');
  assert(game.playerStates.player2.score === 50, 'p2 score 50');
}

// 11) Wrong answer type rejected
{
  console.log('\n11) Wrong question type');
  const t0 = 11_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  // round 0 is definition
  const res = applyMove(
    game,
    { playerId: 'p1', answer: 'sentence', selectedIndex: 0, round: 0 },
    { now: t0 + 100 }
  );
  assert(res.error === 'wrong_type', 'rejects wrong type');
  assert(game.playerStates.player1.hasAnswered === false, 'not marked');
}

// 12) Concurrent deadline calls don't multi-advance (simulate)
{
  console.log('\n12) Concurrent deadline idempotent');
  const t0 = 12_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  const a = deepClone(game);
  const b = deepClone(game);
  applyQuestionDeadline(a, { now: t0 + QUESTION_DURATION_MS });
  applyQuestionDeadline(b, { now: t0 + QUESTION_DURATION_MS });
  assert(a.currentRound === 1 && b.currentRound === 1, 'each clone advances once');
  // second call on same object
  applyQuestionDeadline(a, { now: t0 + QUESTION_DURATION_MS + 100 });
  assert(a.currentRound === 1, 'second deadline on fresh question does nothing');
}

// 13) Timer display never jumps above 20 or negative
{
  console.log('\n13) Timer bounds');
  const t0 = 13_000_000;
  let game = createGame('p1', { now: t0 });
  game = joinGame(game, 'p2', { now: t0 }).game;
  assert(computeTimeLeft(game, { now: t0 - 1000 }) === 20, 'clock skew capped at 20');
  assert(computeTimeLeft(game, { now: t0 + 60000 }) === 0, 'far future is 0');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
