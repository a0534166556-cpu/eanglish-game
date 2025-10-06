import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '../../../../lib/rateLimiter';

// Persistent storage using JSON files (simulated localStorage on server)
const GAMES_FILE = './games.json';
const fs = require('fs');
const path = require('path');

// Helper functions for persistent storage
function loadGames() {
  try {
    if (fs.existsSync(GAMES_FILE)) {
      const data = fs.readFileSync(GAMES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading games:', error);
  }
  return {};
}

function saveGames(games: any) {
  try {
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
  } catch (error) {
    console.error('Error saving games:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(clientIP, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const { action, gameId, playerId, playerName } = await req.json();
    
    // Input validation
    if (!action || !playerId || !playerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Sanitize inputs
    const sanitizedPlayerId = playerId.toString().replace(/[<>\"'&]/g, '');
    const sanitizedPlayerName = playerName.toString().replace(/[<>\"'&]/g, '');
    
    // Length validation
    if (sanitizedPlayerId.length > 50 || sanitizedPlayerName.length > 50) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }
    
    if (sanitizedPlayerId.length === 0 || sanitizedPlayerName.length === 0) {
      return NextResponse.json({ error: 'Input cannot be empty' }, { status: 400 });
    }

    switch (action) {
      case 'create':
        const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGame = {
          id: newGameId,
          status: 'waiting',
          currentRound: 0,
          maxRounds: 5,
          currentWord: {
            word: 'APPLE',
            definitions: [
              'A red or green fruit that grows on trees',
              'A technology company founded by Steve Jobs',
              'A type of computer operating system',
              'A round object used in sports'
            ],
            sentences: [
              'I eat an apple every day for breakfast',
              'Apple Inc. makes iPhones and MacBooks',
              'The new Apple operating system is very fast',
              'He threw the apple across the field'
            ],
            correctDefinitionIndex: 0,
            correctSentenceIndex: 0
          },
          players: {
            player1: sanitizedPlayerId,
            player2: null
          },
          playerStates: {
            player1: {
              score: 0,
              isReady: true,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            },
            player2: {
              score: 0,
              isReady: false,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            }
          },
          lastMove: null,
          winner: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          chatMessages: [],
          revealedLetters: {
            player1: [],
            player2: []
          }
        };
        
        // Load existing games
        const createGames = loadGames();
        
        // Save new game
        createGames[newGameId] = newGame;
        saveGames(createGames);
        
        console.log('Created game:', newGameId, 'for player:', sanitizedPlayerId);
        console.log('Games saved to file');
        console.log('Game data:', JSON.stringify(newGame, null, 2));
        
        return NextResponse.json({ gameId: newGameId, game: newGame });

      case 'join':
        // Load existing games
        const joinGames = loadGames();
        
        if (!gameId || !joinGames[gameId]) {
          console.log('Game not found:', gameId);
          console.log('Available games:', Object.keys(joinGames));
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const existingGame = joinGames[gameId];
        if (existingGame.players.player2) {
          console.log('Game is full:', gameId);
          return NextResponse.json({ error: 'Game is full' }, { status: 400 });
        }

        // Add second player
        existingGame.players.player2 = sanitizedPlayerId;
        existingGame.status = 'active';
        existingGame.updatedAt = Date.now();
        
        // Save updated game
        joinGames[gameId] = existingGame;
        saveGames(joinGames);
        
        console.log('Player joined game:', gameId, 'player:', sanitizedPlayerId);
        console.log('Game status:', existingGame.status);
        console.log('Players:', existingGame.players);
        
        return NextResponse.json({ game: existingGame });

      case 'get':
        // Load existing games
        const getGames = loadGames();
        
        if (!gameId || !getGames[gameId]) {
          console.log('Game not found for get:', gameId);
          console.log('Available games:', Object.keys(getGames));
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const gameData = getGames[gameId];
        console.log('Getting game:', gameId, 'status:', gameData.status);
        console.log('Game data:', JSON.stringify(gameData, null, 2));
        return NextResponse.json({ game: gameData });

      case 'move':
        // Load existing games
        const moveGames = loadGames();
        
        if (!gameId || !moveGames[gameId]) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const currentGame = moveGames[gameId];
        const { answer, selectedIndex } = await req.json();
        
        // Check if answer is correct
        const isCorrect = answer === 'definition' 
          ? selectedIndex === currentGame.currentWord?.correctDefinitionIndex
          : selectedIndex === currentGame.currentWord?.correctSentenceIndex;

        // Update game state
        const playerSymbol = currentGame.players.player1 === playerId ? 'player1' : 'player2';
        currentGame.lastMove = {
          player: playerSymbol,
          answer: answer,
          isCorrect: isCorrect,
          time: Date.now(),
          selectedIndex: selectedIndex
        };

        if (isCorrect) {
          currentGame.playerStates[playerSymbol].score += 10;
        }

        currentGame.updatedAt = Date.now();
        
        // Save updated game
        moveGames[gameId] = currentGame;
        saveGames(moveGames);
        
        return NextResponse.json({ game: currentGame });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');
  
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
  }

  // Load existing games
  const games = loadGames();
  
  if (!games[gameId]) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  return NextResponse.json({ game: games[gameId] });
}
