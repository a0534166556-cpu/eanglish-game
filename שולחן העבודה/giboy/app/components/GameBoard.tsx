'use client';

import { useEffect, useState, useRef } from 'react';
import { Game, Player } from '../../types/game';
import useAuthUser from '../../lib/useAuthUser';
// import { subscribeToGame, makeMove, sendChatMessage, useRevealLetter, useSkipWord } from '../../lib/game';

interface GameBoardProps {
  gameId: string;
  currentPlayerId: string;
  currentPlayerSymbol: Player;
}

export default function GameBoard({ gameId, currentPlayerId, currentPlayerSymbol }: GameBoardProps) {
  const { user } = useAuthUser();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsUpdated, setStatsUpdated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [revealedLetter, setRevealedLetter] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [skipError, setSkipError] = useState<string | null>(null);
  const [skipSuccess, setSkipSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  
  // מערכת אימוג'ים
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null);
  const [emojiHistory, setEmojiHistory] = useState<string[]>([]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  
  // Sentence scramble state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const currentWordRef = useRef<string | null>(null); // Track current word to avoid resetting on every poll
  
  // Track if timeout answer was already submitted for current question
  const timeoutAnswerSubmittedRef = useRef<string | null>(null);
  
  // Track if we're currently moving to next round to prevent multiple calls
  const isMovingToNextRoundRef = useRef<boolean>(false);
  
  // Dictation state
  const [dictationAnswer, setDictationAnswer] = useState('');
  
  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string; points: number } | null>(null);
  
  // Time's up modal state
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  const EMOJI_REACTIONS = [
    { emoji: '😊', name: 'שמח', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { emoji: '😢', name: 'עצוב', color: 'bg-blue-100 hover:bg-blue-200' },
    { emoji: '😠', name: 'כועס', color: 'bg-red-100 hover:bg-red-200' },
    { emoji: '😍', name: 'מאוהב', color: 'bg-pink-100 hover:bg-pink-200' },
    { emoji: '🤔', name: 'חושב', color: 'bg-gray-100 hover:bg-gray-200' },
    { emoji: '😴', name: 'עייף', color: 'bg-purple-100 hover:bg-purple-200' },
    { emoji: '🎉', name: 'מחגג', color: 'bg-green-100 hover:bg-green-200' },
    { emoji: '😱', name: 'מפוחד', color: 'bg-orange-100 hover:bg-orange-200' },
    { emoji: '🤯', name: 'מופתע', color: 'bg-indigo-100 hover:bg-indigo-200' },
    { emoji: '😎', name: 'מגניב', color: 'bg-cyan-100 hover:bg-cyan-200' },
  ];

  const sendEmoji = (emoji: string) => {
    setCurrentEmoji(emoji);
    setEmojiHistory(prev => [emoji, ...prev.slice(0, 2)]); // שמירת 3 אימוג'ים אחרונים
    setShowEmojiPicker(false);
    
    // איפוס האימוג'י הנוכחי אחרי 3 שניות
    setTimeout(() => {
      setCurrentEmoji(null);
    }, 3000);
  };

  // ניקוי אימוג'ים ישנים
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiHistory(prev => prev.slice(0, -1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log('Fetching game:', gameId);
        const response = await fetch(`/api/games/word-clash?gameId=${gameId}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Game data:', data.game);
          console.log('Game status:', data.game.status);
          console.log('Players:', data.game.players);
          setGame(data.game);
          setError(null);
          
          // Check all active players are ready
          const activePlayers = [
            data.game.players.player1,
            data.game.players.player2,
            data.game.players.player3
          ].filter(p => p !== null);
          
          const readyPlayers = activePlayers.filter((_, index) => {
            const playerKey = `player${index + 1}` as 'player1' | 'player2' | 'player3';
            return data.game.playerStates[playerKey]?.isReady === true;
          });
          
          const allReady = readyPlayers.length === activePlayers.length && activePlayers.length >= 2;
          
          console.log('Game status check:');
          console.log('Status:', data.game.status);
          console.log('Active players:', activePlayers.length);
          console.log('Ready players:', readyPlayers.length);
          console.log('All ready:', allReady);
          console.log('Player states:', {
            player1: data.game.playerStates.player1?.isReady,
            player2: data.game.playerStates.player2?.isReady,
            player3: data.game.playerStates.player3?.isReady
          });
          
            // Use timer from game state if available, otherwise calculate
          if (data.game.status === 'active' && data.game.currentWord) {
            console.log('Game is active with current word!');
            
            // Check if this is a new question (by comparing currentRound or word)
            const isNewQuestion = !game || 
              game.currentRound !== data.game.currentRound || 
              game.currentWord?.word !== data.game.currentWord?.word;
            
            // Use timer from game state if available
            if (data.game.timerStartTime && data.game.timeLeft !== undefined) {
              // Calculate time left based on server time
              const elapsed = (Date.now() - data.game.timerStartTime) / 1000;
              const calculatedTimeLeft = Math.max(0, Math.floor(data.game.timeLeft - elapsed));
              
              console.log('Using timer from game state:', { 
                calculatedTimeLeft, 
                elapsed, 
                timerStartTime: data.game.timerStartTime, 
                timeLeft: data.game.timeLeft,
                isNewQuestion,
                currentRound: data.game.currentRound
              });
              
              // If this is a new question, reset timer to full time
              if (isNewQuestion) {
                console.log('🔄 New question detected, resetting timer to full time');
                // For new question, always use full time from server
                // Set timer active first, then time left to trigger useEffect
                setIsTimerActive(false); // Reset first
                setTimeout(() => {
                  setTimeLeft(data.game.timeLeft);
                  setIsTimerActive(true);
                  console.log('✅ Timer reset and activated for new question:', data.game.timeLeft);
                }, 100); // Small delay to ensure state update
              } else if (calculatedTimeLeft > 0) {
                // Continuing question - use calculated time
                setIsTimerActive(true);
                setTimeLeft(calculatedTimeLeft);
              } else {
                console.log('Timer expired, but keeping question active');
                // Keep timer "active" for UI purposes, but show 0 time
                setIsTimerActive(true);
                setTimeLeft(0);
              }
            } else {
              // Fallback: calculate time based on question type
              console.log('No timer in game state, using fallback');
              let timeForQuestion = 20;
              if (data.game.currentWord?.questionType === 'dictation' && data.game.currentWord?.wasRecorded) {
                timeForQuestion = 40;
              }
              console.log('Setting timer active with fallback time:', timeForQuestion);
              setIsTimerActive(true);
              setTimeLeft(timeForQuestion);
            }
            
            // Initialize sentence scramble words if needed (only if word changed or not initialized)
            if (data.game.currentWord?.questionType === 'sentence-scramble' && data.game.currentWord?.scrambledWords) {
              const currentWordKey = `${data.game.currentWord.word}_${data.game.currentRound}`;
              // Only initialize if this is a new word or words are empty
              if (currentWordRef.current !== currentWordKey || availableWords.length === 0) {
                console.log('Initializing sentence scramble words for new question:', currentWordKey);
                currentWordRef.current = currentWordKey;
                setAvailableWords([...data.game.currentWord.scrambledWords]);
                setSelectedWords([]);
              }
            } else {
              // Reset ref if not sentence scramble
              currentWordRef.current = null;
            }
          } else {
            // Game is not ready yet, stop timer
            console.log('Game not ready - stopping timer');
            setIsTimerActive(false);
              setTimeLeft(20);
            }
          
          // Check if timer expired and this player hasn't answered yet
          if (data.game.status === 'active' && data.game.currentWord && data.game.timerStartTime && data.game.timeLeft !== undefined) {
            const elapsed = (Date.now() - data.game.timerStartTime) / 1000;
            const calculatedTimeLeft = Math.max(0, Math.floor(data.game.timeLeft - elapsed));
            
            // Create unique key for current question
            const questionKey = `${data.game.currentRound}_${data.game.currentWord?.word || ''}`;
            
            // If timer expired and this player hasn't answered, submit incorrect answer automatically
            if (calculatedTimeLeft <= 0) {
              const hasAnswered = data.game.questionResults?.[currentPlayerSymbol] !== undefined;
              const alreadySubmittedTimeout = timeoutAnswerSubmittedRef.current === questionKey;
              
              if (!hasAnswered && !isSubmittingAnswer && !alreadySubmittedTimeout) {
                console.log('⏰ Polling detected timer expired and player has not answered, submitting incorrect answer...');
                
                // Mark that we're submitting timeout answer for this question
                timeoutAnswerSubmittedRef.current = questionKey;
                
                // Submit incorrect answer based on question type
                const questionType = data.game.currentWord.questionType;
                let answerType: 'definition' | 'sentence' | 'recording' | 'sentence-scramble' | 'dictation' = 'definition';
                
                if (questionType === 'sentence-scramble') {
                  answerType = 'sentence-scramble';
                } else if (questionType === 'dictation') {
                  answerType = 'dictation';
                } else if (questionType === 'recording') {
                  answerType = 'recording';
                } else if (questionType === 'sentence-choice') {
                  answerType = 'sentence';
                } else if (questionType === 'multiple-choice') {
                  answerType = 'definition';
                }
                
                // Submit answer directly (no setTimeout to avoid rate limiting)
                handleAnswer(answerType, 'incorrect').then(() => {
                  console.log('✅ Timeout answer submitted successfully');
                }).catch(err => {
                  console.error('Error submitting timeout answer from polling:', err);
                  // If rate limited, wait a bit and try again
                  if (err && (err.message?.includes('429') || err.message?.includes('Rate limit'))) {
                    console.log('⏳ Rate limited, will retry timeout answer in next poll...');
                    // Reset flag so we can retry
                    if (timeoutAnswerSubmittedRef.current === questionKey) {
                      timeoutAnswerSubmittedRef.current = null;
                    }
                  } else {
                    // For other errors, reset flag to retry
                    if (timeoutAnswerSubmittedRef.current === questionKey) {
                      timeoutAnswerSubmittedRef.current = null;
                    }
                  }
                });
              }
            } else if (calculatedTimeLeft > 0) {
              // Timer is still active, reset the timeout answer flag if question changed
              if (timeoutAnswerSubmittedRef.current && timeoutAnswerSubmittedRef.current !== questionKey) {
                timeoutAnswerSubmittedRef.current = null;
              }
            }
          }
          
          // Check if timer expired - if so, ensure all players submit timeout answers
          let timerExpired = false;
          let elapsed = 0;
          if (data.game.status === 'active' && data.game.currentWord && data.game.timerStartTime && data.game.timeLeft !== undefined) {
            elapsed = (Date.now() - data.game.timerStartTime) / 1000;
            const calculatedTimeLeft = Math.max(0, Math.floor(data.game.timeLeft - elapsed));
            timerExpired = calculatedTimeLeft <= 0;
          }
          
          // Check if all players answered and we need to move to next round
          if (data.game.status === 'active' && data.game.currentWord) {
            const activePlayers = [
              data.game.players.player1,
              data.game.players.player2,
              data.game.players.player3
            ].filter(p => p !== null);
            
            // If timer expired, assume all players who haven't answered will get timeout answers
            // So we should check if we have answers from all active players OR if timer expired
            const questionResults = data.game.questionResults || {};
            const answeredCount = Object.keys(questionResults).length;
            
            // If timer expired, we can proceed to next round even if not all answers are in
            // The server will handle timeout answers in nextRound action
            let allAnswered = false;
            let timeSinceExpired = 0;
            if (timerExpired && data.game.timerStartTime && data.game.timeLeft !== undefined) {
              // If timer expired, check if we've waited enough time for timeout answers
              // Wait at least 3 seconds after timer expired to allow timeout answers to be submitted
              timeSinceExpired = elapsed - data.game.timeLeft;
              const waitedEnough = timeSinceExpired >= 3; // Wait 3 seconds after timer expired
              
              if (waitedEnough) {
                // Enough time has passed - proceed to next round
                // Server will handle timeout answers in nextRound action
                allAnswered = true;
                console.log('⏰ Timer expired and enough time passed, proceeding to next round. Server will handle timeout answers...', {
                  answeredCount,
                  activePlayersCount: activePlayers.length,
                  timeSinceExpired,
                  questionResults: questionResults
                });
              } else {
                // Not enough time yet - wait a bit more
                allAnswered = answeredCount === activePlayers.length && activePlayers.length > 0;
                console.log('⏰ Timer expired but not enough time passed yet, waiting...', {
                  answeredCount,
                  activePlayersCount: activePlayers.length,
                  timeSinceExpired,
                  waitedEnough
                });
              }
            } else {
              // Timer still active, normal check - need all players to answer
              allAnswered = answeredCount === activePlayers.length && activePlayers.length > 0;
            }
            
            console.log('📊 Checking if all players answered:', {
              answeredCount,
              activePlayersCount: activePlayers.length,
              allAnswered,
              timerExpired,
              questionResults: questionResults,
              showFeedback
            });
            
            // If all players answered OR timer expired and enough time passed, trigger auto-move
            // This handles both cases: players answered OR timer expired (server will handle timeout answers)
            // Calculate timeSinceExpired if timer expired
            let calculatedTimeSinceExpired = 0;
            if (timerExpired && data.game.timerStartTime && data.game.timeLeft !== undefined) {
              calculatedTimeSinceExpired = elapsed - data.game.timeLeft;
            }
            
            // Check if question has changed (to prevent showing feedback for old question)
            const currentQuestionKey = data.game.currentWord ? `${data.game.currentRound}_${data.game.currentWord.word || ''}` : null;
            const previousQuestionKey = game?.currentWord ? `${game.currentRound}_${game.currentWord.word || ''}` : null;
            const questionChanged = currentQuestionKey !== previousQuestionKey;
            
            const shouldMoveToNext = allAnswered && (answeredCount > 0 || (timerExpired && calculatedTimeSinceExpired >= 3)) && !isMovingToNextRoundRef.current;
            
            console.log('🔍 Should move to next round?', {
              allAnswered,
              answeredCount,
              timerExpired,
              calculatedTimeSinceExpired,
              shouldMoveToNext,
              showFeedback,
              questionChanged,
              isMovingToNextRound: isMovingToNextRoundRef.current
            });
            
            if (shouldMoveToNext && !questionChanged) {
              // Only show results if we haven't shown them yet and question hasn't changed
              if (!showFeedback) {
                console.log('🔄 Polling detected all players answered! Showing results and moving to next round...');
              
              // Show results (similar to handleAnswer logic)
              const results = data.game.questionResults;
              const myResult = results[currentPlayerSymbol];
              const allResults = Object.entries(results);
              
              // Find fastest correct answer
              const correctAnswers = allResults
                .filter(([_, result]: [string, any]) => result.isCorrect)
                .map(([playerKey, result]: [string, any]) => ({ playerKey, answerTime: result.answerTime }));
              
              const fastest = correctAnswers.length > 0 
                ? correctAnswers.reduce((prev, curr) => curr.answerTime < prev.answerTime ? curr : prev)
                : null;
              
              let resultText = '';
              let totalPoints = 0;
              
              // My result
              if (myResult?.isCorrect) {
                resultText += '✅ אתה ענית נכון! (+3 נקודות) ';
                totalPoints += 3;
                
                // Show speed bonus if applicable
                const speedBonus = (myResult as any).speedBonus || 0;
                const answerTimeSeconds = (myResult as any).answerTimeSeconds || 0;
                
                if (speedBonus > 0) {
                  resultText += `⚡ בונוס מהירות: ${speedBonus} נקודות (ענית תוך ${Math.round(answerTimeSeconds)} שניות) `;
                  totalPoints += speedBonus;
                } else if (answerTimeSeconds > 0) {
                  resultText += `⏱️ ענית תוך ${Math.round(answerTimeSeconds)} שניות (אין בונוס מהירות) `;
                }
              } else {
                resultText += '❌ אתה ענית לא נכון. (-2 נקודות) ';
                totalPoints -= 2;
              }
              
              resultText += '\n\n📊 תוצאות כל השחקנים:\n';
              
              // All players results with their points in this question
              allResults.forEach(([playerKey, result]: [string, any]) => {
                const playerName = playerKey === currentPlayerSymbol ? 'אתה' : 
                  playerKey === 'player1' ? 'שחקן 1' : 
                  playerKey === 'player2' ? 'שחקן 2' : 'שחקן 3';
                
                const questionPoints = result.isCorrect ? (3 + (result.speedBonus || 0)) : -2;
                const speedBonus = result.speedBonus || 0;
                
                if (result.isCorrect) {
                  resultText += `✅ ${playerName}: נכון (+${3 + speedBonus} נקודות)`;
                  if (speedBonus > 0) {
                    resultText += ` ⚡ בונוס מהירות: ${speedBonus}`;
                  }
                } else {
                  resultText += `❌ ${playerName}: לא נכון (-2 נקודות)`;
                }
                resultText += '\n';
              });
              
              // Show total scores for all players
              resultText += '\n🏆 נקודות כוללות:\n';
              allResults.forEach(([playerKey, result]: [string, any]) => {
                const playerName = playerKey === currentPlayerSymbol ? 'אתה' : 
                  playerKey === 'player1' ? 'שחקן 1' : 
                  playerKey === 'player2' ? 'שחקן 2' : 'שחקן 3';
                const totalScore = data.game.playerStates[playerKey as Player]?.score || 0;
                resultText += `${playerName}: ${totalScore} נקודות\n`;
              });
              
              // Show correct answer only if player answered incorrectly
              if (!myResult?.isCorrect) {
                resultText += '\n✅ התשובה הנכונה:\n';
                const currentWord = data.game.currentWord;
                if (currentWord) {
                  if (currentWord.questionType === 'multiple-choice' && currentWord.definitions && currentWord.correctDefinitionIndex !== undefined) {
                    resultText += currentWord.definitions[currentWord.correctDefinitionIndex];
                  } else if (currentWord.questionType === 'sentence-choice' && currentWord.sentences && currentWord.correctSentenceIndex !== undefined) {
                    resultText += currentWord.sentences[currentWord.correctSentenceIndex];
                  } else if (currentWord.questionType === 'recording' && currentWord.sentenceToRecord) {
                    resultText += currentWord.sentenceToRecord;
                  } else if (currentWord.questionType === 'dictation' && currentWord.sentenceToRecord) {
                    resultText += currentWord.sentenceToRecord;
                  } else if (currentWord.questionType === 'sentence-scramble' && currentWord.correctSentence) {
                    resultText += currentWord.correctSentence;
                  }
                }
              }
              
              setFeedbackMessage({
                type: myResult?.isCorrect ? 'success' : 'error',
                text: resultText,
                points: totalPoints
              });
              setShowFeedback(true);
              
              // Auto-hide after 8 seconds (longer to see correct answer) and move to next round
              setTimeout(async () => {
                console.log('🔄 Auto-moving to next round after showing results (from polling)...');
                setShowFeedback(false);
                setFeedbackMessage(null);
                await handleAutoNextRound();
              }, 8000);
              } else {
                // Results already showing (e.g., from timeout), but we still need to move to next round
                // Check if we need to call handleAutoNextRound directly
                console.log('🔄 Polling detected all players answered, but results already showing. Moving to next round now...');
                // Move to next round immediately since timer expired and enough time passed
                setTimeout(async () => {
                  console.log('🔄 Auto-moving to next round (timer expired, results already shown)...');
                  await handleAutoNextRound();
                }, 1000); // Short delay to ensure state is updated
              }
            }
          }
          
          // אם המשחק הסתיים, עדכן סטטיסטיקות
          if (data.game.status === 'finished' && user && !statsUpdated) {
            const playerState = data.game.playerStates[currentPlayerSymbol];
            const opponentState = data.game.playerStates[currentPlayerSymbol === 'player1' ? 'player2' : 'player1'];
            const won = data.game.winner === currentPlayerSymbol;
            const totalRounds = data.game.maxRounds || 5;
            const correctAnswers = Math.floor(playerState.score / 3); // כל תשובה נכונה = 3 נקודות
            const totalQuestions = totalRounds * 2; // 2 שאלות בכל סיבוב (הגדרה + משפט)
            
            // עדכן סטטיסטיקות
            fetch('/api/games/update-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentPlayerId,
                gameName: 'WordClash',
                score: playerState.score,
                won: won,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                perfectScore: correctAnswers === totalQuestions
              })
            }).catch(error => {
              console.error('Failed to update game stats:', error);
            });
            
            setStatsUpdated(true);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch game:', response.status, errorText);
          setError(`Failed to load game: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(`Failed to load game: ${err}`);
      }
    };

    if (gameId) {
      console.log('Starting game fetch for:', gameId);
      fetchGame();
      // Poll for game updates every 2 seconds to avoid rate limiting (10 requests per minute)
      const interval = setInterval(() => {
        console.log('Polling for game updates...');
        fetchGame();
      }, 2000);
      return () => {
        console.log('Clearing interval');
        clearInterval(interval);
      };
    }
  }, [gameId, isTimerActive]);
  
  // Function to automatically move to next round
  const handleAutoNextRound = async () => {
    console.log('🚀 handleAutoNextRound called', { game: !!game, gameId, gameStatus: game?.status, currentRound: game?.currentRound, maxRounds: game?.maxRounds });
    
    // Prevent multiple simultaneous calls
    if (isMovingToNextRoundRef.current) {
      console.log('⏳ Already moving to next round, skipping...');
      return;
    }
    
    if (!game || !gameId) {
      console.log('❌ Cannot move to next round: missing game or gameId');
      return;
    }
    
    // Check if game is finished
    if (game.status === 'finished') {
      console.log('❌ Game is finished, cannot move to next round');
      return;
    }
    
    // Move to next round
    if (game.currentRound < game.maxRounds - 1) {
      console.log('✅ Moving to next round...', { currentRound: game.currentRound, maxRounds: game.maxRounds });
      
      // Set flag to prevent multiple calls
      isMovingToNextRoundRef.current = true;
      
      try {
        const nextResponse = await fetch('/api/games/word-clash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'nextRound',
            gameId: gameId,
            playerId: currentPlayerId, // Add playerId for rate limiting
            playerName: (user && user.id === currentPlayerId) ? (user.name || user.email || 'Player') : 'Player' // Add playerName for rate limiting
          })
        });
        
        console.log('Next round response status:', nextResponse.status);
        
        if (nextResponse.ok) {
          const nextData = await nextResponse.json();
          console.log('✅ Next round data received:', nextData.game);
          setGame(nextData.game);
          // Reset feedback state
          setShowFeedback(false);
          setFeedbackMessage(null);
          // Reset answer states
          setSelectedWords([]);
          setDictationAnswer('');
          setUserTranscript('');
          setRecordingBlob(null);
          // Reset timer - always initialize fresh timer for new question
          // For new question, use the full timeLeft from server (not calculated)
          if (nextData.game.timerStartTime && nextData.game.timeLeft !== undefined) {
            // Use the full timeLeft value for new question (don't calculate elapsed)
            // The server sets timerStartTime when question starts, so we should use full time
            const fullTime = nextData.game.timeLeft;
            console.log('🔄 Resetting timer for new question:', { 
              timerStartTime: nextData.game.timerStartTime, 
              timeLeft: nextData.game.timeLeft,
              fullTime,
              currentRound: nextData.game.currentRound
            });
            // Reset timer first, then activate to ensure useEffect triggers
            setIsTimerActive(false);
            setTimeout(() => {
              setTimeLeft(fullTime);
              setIsTimerActive(true);
              console.log('✅ Timer reset and activated in handleAutoNextRound:', fullTime);
            }, 100); // Small delay to ensure state update
          } else {
            // Fallback: use default time based on question type
            let defaultTime = 20;
            if (nextData.game.currentWord?.questionType === 'dictation' && nextData.game.currentWord?.wasRecorded) {
              defaultTime = 40;
            }
            console.log('🔄 Resetting timer with fallback time:', defaultTime);
            // Reset timer first, then activate to ensure useEffect triggers
            setIsTimerActive(false);
            setTimeout(() => {
              setTimeLeft(defaultTime);
              setIsTimerActive(true);
              console.log('✅ Timer reset and activated with fallback time:', defaultTime);
            }, 100); // Small delay to ensure state update
          }
          // Initialize sentence scramble words if needed
          if (nextData.game.currentWord?.questionType === 'sentence-scramble' && nextData.game.currentWord?.scrambledWords) {
            const currentWordKey = `${nextData.game.currentWord.word}_${nextData.game.currentRound}`;
            currentWordRef.current = currentWordKey;
            setAvailableWords([...nextData.game.currentWord.scrambledWords]);
            setSelectedWords([]);
          } else {
            currentWordRef.current = null;
          }
          
          // Reset timeout answer flag for new question
          timeoutAnswerSubmittedRef.current = null;
          
          // Reset flag after successful move
          isMovingToNextRoundRef.current = false;
        } else {
          const errorData = await nextResponse.json();
          console.error('❌ Failed to move to next round:', errorData);
          
          // Reset flag on error (but wait a bit before allowing retry)
          setTimeout(() => {
            isMovingToNextRoundRef.current = false;
          }, 2000);
        }
      } catch (err) {
        console.error('❌ Error moving to next round:', err);
        
        // Reset flag on error (but wait a bit before allowing retry)
        setTimeout(() => {
          isMovingToNextRoundRef.current = false;
        }, 2000);
      }
    } else {
      console.log('❌ Cannot move to next round: already at max rounds');
      isMovingToNextRoundRef.current = false;
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      console.log('⏱️ Timer tick:', { timeLeft, isTimerActive });
      timer = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          console.log('⏱️ Timer updated:', { prev, newTime });
          return newTime;
        });
      }, 1000);
      
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    } else if (timeLeft === 0 && isTimerActive) {
      // Time's up! Check if all players answered, if so move to next round automatically
      setIsTimerActive(false);
      
      // Check if all players answered
      if (game) {
        const activePlayers = [
          game.players.player1,
          game.players.player2,
          game.players.player3
        ].filter(p => p !== null);
        
        const answeredCount = Object.keys(game.questionResults || {}).length;
        const allAnswered = answeredCount === activePlayers.length;
        
        console.log('⏰ Timer expired!', { 
          answeredCount, 
          activePlayersCount: activePlayers.length, 
          allAnswered,
          questionResults: game.questionResults
        });
        
        // If this player hasn't answered yet, submit incorrect answer automatically
        const hasAnswered = game.questionResults?.[currentPlayerSymbol] !== undefined;
        const questionKey = game.currentWord ? `${game.currentRound}_${game.currentWord.word || ''}` : null;
        const alreadySubmittedTimeout = questionKey && timeoutAnswerSubmittedRef.current === questionKey;
        
        if (!hasAnswered && game.status === 'active' && game.currentWord && !isSubmittingAnswer && !alreadySubmittedTimeout) {
          console.log('⏰ Timer expired and player has not answered, submitting incorrect answer...');
          
          // Mark that we're submitting timeout answer for this question
          if (questionKey) {
            timeoutAnswerSubmittedRef.current = questionKey;
          }
          
          // Submit incorrect answer based on question type
          const questionType = game.currentWord.questionType;
          let answerType: 'definition' | 'sentence' | 'recording' | 'sentence-scramble' | 'dictation' = 'definition';
          
          if (questionType === 'sentence-scramble') {
            answerType = 'sentence-scramble';
          } else if (questionType === 'dictation') {
            answerType = 'dictation';
          } else if (questionType === 'recording') {
            answerType = 'recording';
          } else if (questionType === 'sentence-choice') {
            answerType = 'sentence';
          }
          
          handleAnswer(answerType, 'incorrect').then(() => {
            console.log('✅ Timeout answer submitted successfully from timer');
          }).catch(err => {
            console.error('Error submitting timeout answer:', err);
            // If rate limited, wait a bit and try again
            if (err && (err.message?.includes('429') || err.message?.includes('Rate limit'))) {
              console.log('⏳ Rate limited, will retry timeout answer in next poll...');
              // Reset flag so we can retry
              if (questionKey && timeoutAnswerSubmittedRef.current === questionKey) {
                timeoutAnswerSubmittedRef.current = null;
              }
            } else {
              // For other errors, reset flag to retry
              if (questionKey && timeoutAnswerSubmittedRef.current === questionKey) {
                timeoutAnswerSubmittedRef.current = null;
              }
            }
          });
        } else if (allAnswered) {
          // If all players answered (including timeout answers), the polling will detect it and move to next round
          console.log('⏰ Timer expired and all players answered. Polling will detect and move to next round...');
        } else {
          console.log('⏰ Timer expired but not all players answered yet. Waiting for polling to detect all answered...');
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isTimerActive, timeLeft, game, gameId]);

  const handleAnswer = async (type: 'definition' | 'sentence' | 'recording' | 'sentence-scramble' | 'dictation', indexOrValue?: number | string) => {
    console.log('=== handleAnswer START ===');
    console.log('handleAnswer called:', { 
      type, 
      indexOrValue, 
      currentPlayerId, 
      gameId, 
      isTimerActive, 
      lastMove: game?.lastMove,
      questionResults: game?.questionResults,
      currentPlayerSymbol
    });
    
    if (!game) {
      console.log('❌ No game, cannot answer');
      return;
    }
    
    if (!currentPlayerId) {
      console.log('❌ No currentPlayerId, cannot answer');
      return;
    }
    
    // Verify that user.id matches currentPlayerId (if user exists)
    if (user && user.id !== currentPlayerId) {
      console.warn('⚠️ User ID mismatch! localStorage user:', user.id, 'but currentPlayerId:', currentPlayerId);
      console.warn('⚠️ This might happen when playing with multiple users from the same browser.');
      console.warn('⚠️ Using currentPlayerId from props instead of localStorage user.');
    }
    
    // Allow answering even if timer expired, as long as game is still active
    // The timer might have expired but the question is still valid
    if (!isTimerActive && game.timerStartTime && game.timeLeft !== undefined) {
      const elapsed = (Date.now() - game.timerStartTime) / 1000;
      const calculatedTimeLeft = Math.max(0, Math.floor(game.timeLeft - elapsed));
      if (calculatedTimeLeft <= 0) {
        console.log('⚠️ Timer expired, but allowing answer anyway (game still active)');
        // Don't return - allow the answer
      }
    }
    
    if (game && game.lastMove?.player === currentPlayerSymbol) {
      console.log('❌ Already answered (lastMove)');
      return;
    }
    
    if (game && game.questionResults?.[currentPlayerSymbol]) {
      console.log('❌ Already answered (questionResults)');
      return;
    }
    
    console.log('✅ All checks passed, proceeding with answer...');

    // Prevent multiple submissions
    if (isSubmittingAnswer) {
      console.log('⏳ Already submitting answer, please wait...');
      return;
    }

    // Double-check: if already answered, don't submit again
    if (game && (game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol])) {
      console.log('❌ Already answered, preventing duplicate submission');
      return;
    }

    setIsSubmittingAnswer(true);

    try {
      console.log('Sending answer to API...');
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          gameId: gameId,
          playerId: currentPlayerId,
          playerName: (user && user.id === currentPlayerId) ? (user.name || user.email || 'Player') : 'Player',
          answer: type,
          selectedIndex: typeof indexOrValue === 'number' ? indexOrValue : undefined,
          answerValue: typeof indexOrValue === 'string' ? indexOrValue : undefined
        })
      });
      
      console.log('Answer response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Answer submitted successfully:', data.game);
        setGame(data.game);
        setError(null);

        // Check if all players answered
        const activePlayers = [
          data.game.players.player1,
          data.game.players.player2,
          data.game.players.player3
        ].filter(p => p !== null);
        
        const answeredCount = Object.keys(data.game.questionResults || {}).length;
        const allAnswered = answeredCount === activePlayers.length;
        
        console.log('📊 Answer check:', { 
          answeredCount, 
          activePlayersCount: activePlayers.length, 
          allAnswered,
          questionResults: data.game.questionResults,
          activePlayers
        });
        
        if (allAnswered && data.game.questionResults) {
          console.log('✅ All players answered! Showing results and moving to next round...');
          // Show results for all players
          const results = data.game.questionResults;
          const myResult = results[currentPlayerSymbol];
          const allResults = Object.entries(results);
          
          // Find fastest correct answer
          const correctAnswers = allResults
            .filter(([_, result]: [string, any]) => result.isCorrect)
            .map(([playerKey, result]: [string, any]) => ({ playerKey, answerTime: result.answerTime }));
          
          const fastest = correctAnswers.length > 0 
            ? correctAnswers.reduce((prev, curr) => curr.answerTime < prev.answerTime ? curr : prev)
            : null;
          
          let resultText = '';
          let totalPoints = 0;
          
          // My result
          console.log('📊 My result check:', {
            myResult,
            isCorrect: myResult?.isCorrect,
            speedBonus: (myResult as any)?.speedBonus,
            answerTimeSeconds: (myResult as any)?.answerTimeSeconds
          });
          
          if (myResult?.isCorrect) {
            resultText += '✅ אתה ענית נכון! (+3 נקודות) ';
            totalPoints += 3;
            
            // Show speed bonus if applicable
            const speedBonus = (myResult as any).speedBonus || 0;
            const answerTimeSeconds = (myResult as any).answerTimeSeconds || 0;
            
            if (speedBonus > 0) {
              resultText += `⚡ בונוס מהירות: ${speedBonus} נקודות (ענית תוך ${Math.round(answerTimeSeconds)} שניות) `;
              totalPoints += speedBonus;
            } else if (answerTimeSeconds > 0) {
              resultText += `⏱️ ענית תוך ${Math.round(answerTimeSeconds)} שניות (אין בונוס מהירות) `;
            }
        } else {
            resultText += '❌ אתה ענית לא נכון. (-2 נקודות) ';
            totalPoints -= 2;
            console.log('❌ Player answered incorrectly, will show correct answer');
          }
          
          resultText += '\n\n📊 תוצאות כל השחקנים:\n';
          
          // All players results with their points in this question
          allResults.forEach(([playerKey, result]: [string, any]) => {
            const playerName = playerKey === currentPlayerSymbol ? 'אתה' : 
              playerKey === 'player1' ? 'שחקן 1' : 
              playerKey === 'player2' ? 'שחקן 2' : 'שחקן 3';
            
            const questionPoints = result.isCorrect ? (3 + (result.speedBonus || 0)) : -2;
            const speedBonus = result.speedBonus || 0;
            
            if (result.isCorrect) {
              resultText += `✅ ${playerName}: נכון (+${3 + speedBonus} נקודות)`;
              if (speedBonus > 0) {
                resultText += ` ⚡ בונוס מהירות: ${speedBonus}`;
        }
      } else {
              resultText += `❌ ${playerName}: לא נכון (-2 נקודות)`;
            }
            resultText += '\n';
          });
          
          // Show total scores for all players
          resultText += '\n🏆 נקודות כוללות:\n';
          allResults.forEach(([playerKey, result]: [string, any]) => {
            const playerName = playerKey === currentPlayerSymbol ? 'אתה' : 
              playerKey === 'player1' ? 'שחקן 1' : 
              playerKey === 'player2' ? 'שחקן 2' : 'שחקן 3';
            const totalScore = data.game.playerStates[playerKey as Player]?.score || 0;
            resultText += `${playerName}: ${totalScore} נקודות\n`;
          });
          
          // Show correct answer only if player answered incorrectly
          if (!myResult?.isCorrect) {
            console.log('📝 Showing correct answer because player answered incorrectly');
            resultText += '\n✅ התשובה הנכונה:\n';
            const currentWord = data.game.currentWord;
            if (currentWord) {
              if (currentWord.questionType === 'multiple-choice' && currentWord.definitions && currentWord.correctDefinitionIndex !== undefined) {
                resultText += currentWord.definitions[currentWord.correctDefinitionIndex];
                console.log('📝 Correct answer (multiple-choice):', currentWord.definitions[currentWord.correctDefinitionIndex]);
              } else if (currentWord.questionType === 'sentence-choice' && currentWord.sentences && currentWord.correctSentenceIndex !== undefined) {
                resultText += currentWord.sentences[currentWord.correctSentenceIndex];
                console.log('📝 Correct answer (sentence-choice):', currentWord.sentences[currentWord.correctSentenceIndex]);
              } else if (currentWord.questionType === 'recording' && currentWord.sentenceToRecord) {
                resultText += currentWord.sentenceToRecord;
                console.log('📝 Correct answer (recording):', currentWord.sentenceToRecord);
              } else if (currentWord.questionType === 'dictation' && currentWord.sentenceToRecord) {
                resultText += currentWord.sentenceToRecord;
                console.log('📝 Correct answer (dictation):', currentWord.sentenceToRecord);
              } else if (currentWord.questionType === 'sentence-scramble' && currentWord.correctSentence) {
                resultText += currentWord.correctSentence;
                console.log('📝 Correct answer (sentence-scramble):', currentWord.correctSentence);
              }
            }
          } else {
            console.log('✅ Player answered correctly, not showing correct answer');
          }
          
          setFeedbackMessage({
            type: myResult?.isCorrect ? 'success' : 'error',
            text: resultText,
            points: totalPoints
          });
          setShowFeedback(true);
          
          // Auto-hide after 8 seconds (longer to see correct answer) and move to next round
          setTimeout(async () => {
            console.log('🔄 Auto-moving to next round after showing results...');
            setShowFeedback(false);
            setFeedbackMessage(null);
            
            // Move to next round automatically
            await handleAutoNextRound();
          }, 8000);
        } else {
          // Show feedback for this player only (waiting for other players)
          const myResult = data.game.questionResults?.[currentPlayerSymbol];
          let feedbackText = '';
          let feedbackPoints = 0;
          
          if (myResult?.isCorrect) {
            feedbackText = '✅ אתה ענית נכון! (+3 נקודות) ';
            feedbackPoints = 3;
            
            // Show speed bonus if applicable
            const speedBonus = (myResult as any).speedBonus || 0;
            const answerTimeSeconds = (myResult as any).answerTimeSeconds || 0;
            
            if (speedBonus > 0) {
              feedbackText += `⚡ בונוס מהירות: ${speedBonus} נקודות (ענית תוך ${Math.round(answerTimeSeconds)} שניות) `;
              feedbackPoints += speedBonus;
            } else if (answerTimeSeconds > 0) {
              feedbackText += `⏱️ ענית תוך ${Math.round(answerTimeSeconds)} שניות (אין בונוס מהירות) `;
            }
            
            feedbackText += 'מחכים ליריב... 🎉';
          } else {
            feedbackText = '❌ אתה ענית לא נכון. (-2 נקודות) מחכים ליריב... 😔';
            feedbackPoints = -2;
            
            // Show correct answer if player answered incorrectly
            feedbackText += '\n\n✅ התשובה הנכונה:\n';
            const currentWord = data.game.currentWord;
            if (currentWord) {
              if (currentWord.questionType === 'multiple-choice' && currentWord.definitions && currentWord.correctDefinitionIndex !== undefined) {
                feedbackText += currentWord.definitions[currentWord.correctDefinitionIndex];
              } else if (currentWord.questionType === 'sentence-choice' && currentWord.sentences && currentWord.correctSentenceIndex !== undefined) {
                feedbackText += currentWord.sentences[currentWord.correctSentenceIndex];
              } else if (currentWord.questionType === 'recording' && currentWord.sentenceToRecord) {
                feedbackText += currentWord.sentenceToRecord;
              } else if (currentWord.questionType === 'dictation' && currentWord.sentenceToRecord) {
                feedbackText += currentWord.sentenceToRecord;
              } else if (currentWord.questionType === 'sentence-scramble' && currentWord.correctSentence) {
                feedbackText += currentWord.correctSentence;
              }
            }
          }
          
          setFeedbackMessage({
            type: myResult?.isCorrect ? 'success' : 'error',
            text: feedbackText,
            points: feedbackPoints
          });
          setShowFeedback(true);
          
          // Auto-hide feedback after 3 seconds
          setTimeout(() => {
            setShowFeedback(false);
            setFeedbackMessage(null);
          }, 3000);
        }
        
        // Reset states
        setUserTranscript('');
        setRecordingBlob(null);
        setDictationAnswer('');
        setSelectedWords([]);
        setAvailableWords([]);
      } else {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.error || JSON.stringify(errorData);
          console.error('❌ API Error Response:', response.status, errorData);
        } catch {
          errorText = await response.text();
          console.error('❌ API Error Text:', response.status, errorText);
        }
        setError('שגיאה בשליחת התשובה: ' + errorText);
      }

    } catch (err) {
      console.error('❌ Exception in handleAnswer:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error message:', errorMessage);
      setError('שגיאה בשליחת התשובה: ' + errorMessage);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };
  
  // Recording functions
  const startRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('הדפדפן שלך לא תומך בזיהוי דיבור. אנא השתמש בדפדפן Chrome או Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setUserTranscript('');

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          setUserTranscript(transcript);
          
          if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
          }
          if (recognition) {
            recognition.stop();
          }
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        if (event.error !== 'no-speech') {
          alert('שגיאה בזיהוי דיבור. נסה שוב.');
        }
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        if (recognition) {
          recognition.stop();
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('לא ניתן להתחיל הקלטה. אנא בדוק את הרשאות המיקרופון.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const cleanTranscript = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, '') // Remove more punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };
  
  // Calculate similarity between two words (simple Levenshtein-like)
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    // If one word contains the other, give high similarity
    if (longer.includes(shorter)) return 0.9;
    
    // Simple character-based similarity
    let matches = 0;
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    return matches / Math.max(str1.length, str2.length);
  };
  
  const handleRecordingSubmit = () => {
    if (!game?.currentWord?.sentenceToRecord || !userTranscript) {
      alert('אנא הקלט את עצמך קודם');
      return;
    }
    
    const correctSentence = cleanTranscript(game.currentWord.sentenceToRecord);
    const userAnswer = cleanTranscript(userTranscript);
    
    const correctWords = correctSentence.split(/\s+/).filter(w => w.length > 0);
    const userWords = userAnswer.split(/\s+/).filter(w => w.length > 0);
    const matchingWords = correctWords.filter(word => 
      userWords.some(uw => uw.includes(word) || word.includes(uw))
    );
    const sentenceMatch = matchingWords.length >= Math.max(1, correctWords.length * 0.7);
    
    handleAnswer('recording', sentenceMatch ? 'correct' : 'incorrect');
  };
  
  // Sentence scramble functions
  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (fromAvailable) {
      setAvailableWords(availableWords.filter(w => w !== word));
      setSelectedWords([...selectedWords, word]);
    } else {
      setSelectedWords(selectedWords.filter(w => w !== word));
      setAvailableWords([...availableWords, word]);
    }
  };
  
  const handleScrambleSubmit = () => {
    if (!game?.currentWord?.correctSentence) return;
    
    const userSentence = selectedWords.join(' ').trim();
    const correctSentence = game.currentWord.correctSentence;
    
    // Normalize both sentences for comparison (lowercase, remove extra spaces, remove punctuation)
    const normalizedUser = cleanTranscript(userSentence);
    const normalizedCorrect = cleanTranscript(correctSentence);
    
    // Check exact match
    const exactMatch = normalizedUser === normalizedCorrect;
    
    // Also check if sentences match word by word (more flexible)
    const userWords = normalizedUser.split(/\s+/).filter(w => w.length > 0);
    const correctWords = normalizedCorrect.split(/\s+/).filter(w => w.length > 0);
    const wordByWordMatch = userWords.length === correctWords.length && 
                           userWords.every((word, idx) => word === correctWords[idx]);
    
    // Check if most words match (at least 80% of words, and same length)
    const matchingWords = userWords.filter(word => correctWords.includes(word));
    const wordMatchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;
    const mostlyCorrect = wordMatchRatio >= 0.8 && userWords.length === correctWords.length;
    
    const isCorrect = exactMatch || wordByWordMatch || mostlyCorrect;
    
    console.log('🔍 Sentence scramble check:', {
      userSentence,
      correctSentence,
      normalizedUser,
      normalizedCorrect,
      userWords,
      correctWords,
      exactMatch,
      wordByWordMatch,
      wordMatchRatio,
      mostlyCorrect,
      isCorrect
    });
    
    handleAnswer('sentence-scramble', isCorrect ? 'correct' : 'incorrect');
  };
  
  // Dictation function
  const handleDictationSubmit = () => {
    console.log('📝 handleDictationSubmit called', {
      hasGame: !!game,
      hasCurrentWord: !!game?.currentWord,
      hasSentenceToRecord: !!game?.currentWord?.sentenceToRecord,
      dictationAnswer,
      dictationAnswerTrimmed: dictationAnswer?.trim(),
      isSubmittingAnswer,
      lastMove: game?.lastMove,
      questionResults: game?.questionResults,
      currentPlayerSymbol
    });
    
    if (!game?.currentWord?.sentenceToRecord) {
      console.error('❌ No sentence to record in game');
      alert('שגיאה: לא נמצא משפט לכתיבה');
      return;
    }
    
    if (!dictationAnswer || !dictationAnswer.trim()) {
      console.warn('⚠️ No answer provided');
      alert('אנא כתוב את המשפט');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmittingAnswer) {
      console.log('⏳ Already submitting answer, please wait...');
      return;
    }
    
    // Double-check: if already answered, don't submit again
    if (game && (game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol])) {
      console.log('❌ Already answered, preventing duplicate submission');
      return;
    }
    
    const correctSentence = cleanTranscript(game.currentWord.sentenceToRecord);
    const userAnswer = cleanTranscript(dictationAnswer);
    
    // Check exact match first
    const exactMatch = userAnswer === correctSentence;
    
    // Also check word by word match (more flexible)
    const userWords = userAnswer.split(/\s+/).filter(w => w.length > 0);
    const correctWords = correctSentence.split(/\s+/).filter(w => w.length > 0);
    const wordByWordMatch = userWords.length === correctWords.length && 
                           userWords.every((word, idx) => word === correctWords[idx]);
    
    // Check if most words match (at least 80% of words, and same length)
    // Also check if words are similar (handles typos and variations)
    const matchingWords = userWords.filter(word => {
      // Exact match
      if (correctWords.includes(word)) return true;
      // Similar match (handles small typos)
      return correctWords.some(cw => {
        const similarity = calculateSimilarity(word, cw);
        return similarity >= 0.85; // 85% similarity threshold
      });
    });
    const wordMatchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;
    const mostlyCorrect = wordMatchRatio >= 0.8 && userWords.length === correctWords.length;
    
    const isCorrect = exactMatch || wordByWordMatch || mostlyCorrect;
    
    console.log('🔍 Dictation check:', {
      userAnswer,
      correctSentence,
      userWords,
      correctWords,
      exactMatch,
      wordByWordMatch,
      wordMatchRatio,
      mostlyCorrect,
      isCorrect
    });
    
    handleAnswer('dictation', isCorrect ? 'correct' : 'incorrect');
  };

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-4xl font-bold mb-2">Word Clash</div>
        <div className="text-xl text-gray-600 mb-8">Battle for Meaning</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-lg">טוען משחק...</div>
      </div>
    );
  }

  const currentWord = game.currentWord;
  const playerState = game.playerStates[currentPlayerSymbol];

  // Check if current player already answered
  const currentPlayerAnswered = game.lastMove && game.lastMove.player === currentPlayerSymbol;

  return (
    <div className="flex flex-col items-center gap-6 p-4" style={{ position: 'relative', zIndex: 1 }}>
      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between w-full max-w-2xl gap-4">
        <div className="text-center flex-1">
          <h3 className="font-bold">Your Score</h3>
          <p className="text-2xl">{playerState.score}</p>
        </div>
        <div className="text-center flex-1">
          <h3 className="font-bold">Round</h3>
          <p className="text-2xl">{game.currentRound + 1}/{game.maxRounds}</p>
        </div>
        {/* Show all opponent scores */}
        {game.players.player1 && game.players.player1 !== null && game.players.player1 !== currentPlayerId && (
          <div className="text-center flex-1">
            <h3 className="font-bold text-sm">Player 1</h3>
            <p className="text-xl">{game.playerStates.player1.score}</p>
        </div>
        )}
        {game.players.player2 && game.players.player2 !== null && game.players.player2 !== currentPlayerId && (
          <div className="text-center flex-1">
            <h3 className="font-bold text-sm">Player 2</h3>
            <p className="text-xl">{game.playerStates.player2.score}</p>
          </div>
        )}
        {game.players.player3 && game.players.player3 !== null && game.players.player3 !== currentPlayerId && (
          <div className="text-center flex-1">
            <h3 className="font-bold text-sm">Player 3</h3>
            <p className="text-xl">{game.playerStates.player3.score}</p>
          </div>
        )}
      </div>

      {game.status === 'waiting' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">ממתינים לשחקנים...</div>
          <div className="text-lg text-gray-600 mb-4">שתף את ה-Game ID עם חברים:</div>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg mb-4">{gameId}</div>
          
          {/* Show players list */}
          <div className="mb-4">
            <div className="text-lg font-bold mb-2">שחקנים במשחק:</div>
            <div className="space-y-2">
              {game.players.player1 && game.players.player1 !== null && (
                <div className="bg-blue-100 p-2 rounded">
                  שחקן 1: {game.players.player1 === currentPlayerId ? 'אתה' : 'יריב'}
        </div>
      )}
              {game.players.player2 && game.players.player2 !== null && (
                <div className="bg-green-100 p-2 rounded">
                  שחקן 2: {game.players.player2 === currentPlayerId ? 'אתה' : 'יריב'}
                </div>
              )}
              {game.players.player3 && game.players.player3 !== null && (
                <div className="bg-purple-100 p-2 rounded">
                  שחקן 3: {game.players.player3 === currentPlayerId ? 'אתה' : 'יריב'}
                </div>
              )}
              {(!game.players.player2 || game.players.player2 === null) && (!game.players.player3 || game.players.player3 === null) && (
                <div className="text-gray-500">ממתינים לשחקן נוסף...</div>
              )}
            </div>
          </div>
          
          {/* Start game button - only if at least 2 players */}
          {[game.players.player1, game.players.player2, game.players.player3].filter(p => p !== null).length >= 2 && (
            <button
              onClick={async () => {
                try {
                  console.log('Starting game with ID:', gameId);
                  const response = await fetch('/api/games/word-clash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'start',
                      gameId: gameId
                    })
                  });
                  
                  console.log('Start game response status:', response.status);
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('Game started successfully:', data.game);
                    setGame(data.game);
                    setError(null);
                  } else {
                    const errorData = await response.json();
                    console.error('Error starting game:', errorData);
                    setError(errorData.error || 'שגיאה בהתחלת המשחק');
                  }
                } catch (err) {
                  console.error('Exception starting game:', err);
                  setError('שגיאה בהתחלת המשחק: ' + (err instanceof Error ? err.message : 'Unknown error'));
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              התחל משחק! 🎮
            </button>
          )}
          
          {[game.players.player1, game.players.player2, game.players.player3].filter(p => p !== null).length < 2 && (
            <div className="text-sm text-gray-500">נדרשים לפחות 2 שחקנים כדי להתחיל</div>
          )}
        </div>
      )}

      {game.status === 'active' && (
        // Check if all active players are ready
        (() => {
          const activePlayers = [game.players.player1, game.players.player2, game.players.player3].filter(p => p !== null);
          const readyPlayers = activePlayers.filter((_, index) => {
            const playerKey = `player${index + 1}` as 'player1' | 'player2' | 'player3';
            return game.playerStates[playerKey]?.isReady === true;
          });
          return readyPlayers.length < activePlayers.length;
        })()
      ) && (
        <div className="text-center">
          {(() => {
            const activePlayers = [game.players.player1, game.players.player2, game.players.player3].filter(p => p !== null);
            const readyPlayers = activePlayers.filter((_, index) => {
              const playerKey = `player${index + 1}` as 'player1' | 'player2' | 'player3';
              return game.playerStates[playerKey]?.isReady === true;
            });
            
            if (activePlayers.length === 2) {
              return (
                <>
                  <div className="text-2xl font-bold text-yellow-600 mb-4">ממתינים ששני השחקנים יהיו מוכנים...</div>
                  <div className="text-lg text-gray-600 mb-4">
                    {readyPlayers.length < activePlayers.length
                      ? `ממתינים ששני השחקנים יהיו מוכנים להתחיל (${readyPlayers.length}/${activePlayers.length} מוכנים)`
                      : 'שני השחקנים מחוברים, ממתינים ששניהם יהיו מוכנים...'}
                  </div>
                </>
              );
            } else if (activePlayers.length === 3) {
              return (
                <>
                  <div className="text-2xl font-bold text-yellow-600 mb-4">ממתינים שכל השחקנים יהיו מוכנים...</div>
                  <div className="text-lg text-gray-600 mb-4">
                    {readyPlayers.length < activePlayers.length
                      ? `ממתינים שכל השחקנים יהיו מוכנים להתחיל (${readyPlayers.length}/${activePlayers.length} מוכנים)`
                      : 'שלושה השחקנים מחוברים, ממתינים שכולם יהיו מוכנים...'}
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <div className="text-2xl font-bold text-yellow-600 mb-4">ממתינים לשחקן נוסף...</div>
                  <div className="text-lg text-gray-600 mb-4">
                    נדרשים לפחות 2 שחקנים כדי להתחיל
                  </div>
                </>
              );
            }
          })()}
        </div>
      )}

      {/* Only show questions if game is active and has current word */}
      {game.status === 'active' && 
       currentWord && (
        <>
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-green-600 mb-2">המשחק התחיל! 🎮</div>
            <div className="text-lg font-bold text-blue-600 mb-2">
              שאלה {game.currentRound + 1} מתוך {game.maxRounds}
            </div>
            <div className="text-sm text-gray-600">
              {(() => {
                const activePlayers = [
                  game.players.player1,
                  game.players.player2,
                  game.players.player3
                ].filter(p => p !== null);
                const readyPlayers = activePlayers.filter((_, index) => {
                  const playerKey = `player${index + 1}` as 'player1' | 'player2' | 'player3';
                  return game.playerStates[playerKey]?.isReady === true;
                });
                const allReady = readyPlayers.length === activePlayers.length;
                
                if (allReady && activePlayers.length > 0) {
                  if (activePlayers.length === 2) {
                    return 'שני שחקנים מוכנים - המשחק מתחיל!';
                  } else if (activePlayers.length === 3) {
                    return 'שלושה שחקנים מוכנים - המשחק מתחיל!';
                  } else {
                    return `${activePlayers.length} שחקנים מוכנים - המשחק מתחיל!`;
                  }
                } else {
                  return `מחכים שכל השחקנים יהיו מוכנים... (${readyPlayers.length}/${activePlayers.length})`;
                }
              })()}
            </div>
          </div>
          <div className="flex gap-2 my-4 justify-center">
            <button
              disabled={playerState.powerUps?.revealLetter <= 0}
              onClick={async () => {
                setRevealError(null);
                setRevealedLetter(null);
                try {
                  if (game && game.currentWord) {
                    const letters = game.currentWord.word.split('');
                    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
                    setRevealedLetter(randomLetter);
                    
                    // Update power-ups
                    const updatedGame = {
                      ...game,
                      playerStates: {
                        ...game.playerStates,
                        [currentPlayerSymbol]: {
                          ...game.playerStates[currentPlayerSymbol],
                          powerUps: {
                            ...game.playerStates[currentPlayerSymbol].powerUps,
                            revealLetter: game.playerStates[currentPlayerSymbol].powerUps.revealLetter - 1
                          }
                        }
                      }
                    };
                    setGame(updatedGame);
                  }
                } catch (e: any) {
                  setRevealError(e.message || 'שגיאה');
                }
              }}
              className="bg-yellow-300 px-3 py-1 rounded font-bold disabled:bg-gray-300"
            >
              הצג אות ({playerState.powerUps?.revealLetter || 0})
            </button>
            <button
              disabled={playerState.powerUps?.skipWord <= 0}
              onClick={async () => {
                setSkipError(null);
                setSkipSuccess(false);
                try {
                  if (game) {
                    // Update power-ups
                    const updatedGame = {
                      ...game,
                      playerStates: {
                        ...game.playerStates,
                        [currentPlayerSymbol]: {
                          ...game.playerStates[currentPlayerSymbol],
                          powerUps: {
                            ...game.playerStates[currentPlayerSymbol].powerUps,
                            skipWord: game.playerStates[currentPlayerSymbol].powerUps.skipWord - 1
                          }
                        }
                      }
                    };
                    setGame(updatedGame);
                    setSkipSuccess(true);
                    setTimeout(() => setSkipSuccess(false), 1500);
                  }
                } catch (e: any) {
                  setSkipError(e.message || 'שגיאה');
                }
              }}
              className="bg-blue-300 px-3 py-1 rounded font-bold disabled:bg-gray-300"
            >
              דלג ({playerState.powerUps?.skipWord || 0})
            </button>
            <button
              disabled={playerState.powerUps?.freezeOpponent <= 0}
              onClick={() => alert('הקפא יריב - בקרוב!')}
              className="bg-purple-300 px-3 py-1 rounded font-bold"
            >
              הקפא יריב ({playerState.powerUps?.freezeOpponent || 0})
            </button>
          </div>
          <div className="text-center mt-2">
            {revealError && <div className="text-red-500">{revealError}</div>}
            {game && game.revealedLetters && game.revealedLetters[currentPlayerSymbol] && game.revealedLetters[currentPlayerSymbol].length > 0 && (
              <div className="text-lg font-mono text-blue-700">
                אותיות שנחשפו: {game.revealedLetters[currentPlayerSymbol].join(', ')}
              </div>
            )}
            {revealedLetter && (
              <div className="text-green-700 font-bold animate-bounce">האות שנחשפה: {revealedLetter}</div>
            )}
            {skipError && <div className="text-red-500">{skipError}</div>}
            {skipSuccess && <div className="text-green-700 font-bold animate-bounce">דילגת על המילה!</div>}
          </div>
          <div className="w-full max-w-3xl space-y-6" style={{ position: 'relative', zIndex: 5 }}>
            {/* Question Header Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl" style={{ position: 'relative', zIndex: 5 }}>
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {currentWord.questionType === 'multiple-choice' && <span className="text-4xl">📝</span>}
                  {currentWord.questionType === 'sentence-choice' && <span className="text-4xl">💬</span>}
                  {currentWord.questionType === 'recording' && <span className="text-4xl">🎤</span>}
                  {currentWord.questionType === 'sentence-scramble' && <span className="text-4xl">🔀</span>}
                  {currentWord.questionType === 'dictation' && <span className="text-4xl">✍️</span>}
                  <h2 className="text-4xl font-bold">
                    {currentWord.questionType === 'multiple-choice' || currentWord.questionType === 'sentence-choice' 
                      ? currentWord.word 
                      : currentWord.questionType === 'recording' || currentWord.questionType === 'dictation'
                      ? 'הקלט/כתוב את המשפט'
                      : 'סדר את המילים למשפט נכון'}
                  </h2>
                </div>
              
              {/* Timer */}
                <div className={`inline-block px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm ${
                  timeLeft <= 5 ? 'animate-pulse' : ''
                }`}>
                  <div className={`text-3xl font-bold ${timeLeft <= 5 ? 'text-red-300' : timeLeft <= 10 ? 'text-orange-300' : 'text-green-300'}`}>
                  ⏰ {timeLeft} שניות
                </div>
                  {currentWord.questionType === 'dictation' && currentWord.wasRecorded && (
                    <div className="text-sm text-blue-200 mt-2">💡 זמן כפול - נשאלת להקליט קודם!</div>
                  )}
              </div>
              </div>
            </div>

            {/* Multiple Choice Question */}
            {currentWord.questionType === 'multiple-choice' && currentWord.definitions && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4" style={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto' }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">בחר את ההגדרה הנכונה</h3>
                  <p className="text-lg text-gray-600">למילה: <span className="font-bold text-blue-600 text-xl">{currentWord.word}</span></p>
                </div>
                <div className="space-y-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}>
                  {currentWord.definitions.map((def, index) => {
                    console.log('Rendering button', index, 'for definition:', def);
                    // Disable only if this player already answered
                    // Check both lastMove and questionResults
                    const alreadyAnswered = (game.lastMove?.player === currentPlayerSymbol) || 
                                          (game.questionResults?.[currentPlayerSymbol] !== undefined);
                    // Allow answering if game is active and player hasn't answered yet
                    const isDisabled = alreadyAnswered || game.status !== 'active' || isSubmittingAnswer;
                    
                    // Only log once per render cycle to avoid spam
                    if (index === 0) {
                      console.log('🔵 Button render check:', { 
                        isDisabled, 
                        alreadyAnswered,
                        lastMovePlayer: game.lastMove?.player,
                        currentPlayerSymbol,
                        isTimerActive,
                        questionResults: game.questionResults,
                        timerStartTime: game.timerStartTime,
                        timeLeft: game.timeLeft,
                        showFeedback,
                        showTimeUpModal,
                        gameStatus: game.status
                      });
                    }
                    const isCorrect = game.lastMove?.answer === 'definition' && game.lastMove.selectedIndex === index && game.lastMove.isCorrect;
                    const isIncorrect = game.lastMove?.answer === 'definition' && game.lastMove.selectedIndex === index && !game.lastMove.isCorrect;
                    
                    return (
                    <button
                      key={index}
                        type="button"
                        onMouseDown={(e) => {
                          console.log('🖱️🖱️🖱️ Mouse down on button', index, 'isDisabled:', isDisabled);
                          // Don't manually trigger click - let onClick handle it naturally
                          // This prevents double API calls
                        }}
                        onClick={async (e) => {
                          console.log('🔵🔵🔵 BUTTON CLICKED!!!', index);
                          // Don't prevent default - let the click work
                          e.stopPropagation();
                          console.log('🔵 Button clicked!', { 
                            index, 
                            isDisabled, 
                            lastMove: game.lastMove, 
                            currentPlayerSymbol, 
                            isTimerActive,
                            game: !!game,
                            user: !!user,
                            gameStatus: game.status,
                            questionResults: game.questionResults
                          });
                          if (!isDisabled) {
                            console.log('✅ Button not disabled, calling handleAnswer...');
                            try {
                              await handleAnswer('definition', index);
                            } catch (err) {
                              console.error('❌ Error in handleAnswer:', err);
                            }
                          } else {
                            console.log('❌ Button disabled, reason:', { 
                              alreadyAnswered: game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined,
                              gameNotActive: game.status !== 'active',
                              questionResults: game.questionResults?.[currentPlayerSymbol]
                            });
                          }
                        }}
                        onMouseUp={(e) => {
                          console.log('🖱️🖱️🖱️ Mouse up on button', index);
                          // Don't prevent default on mouseup - let the click work
                        }}
                        onMouseEnter={() => {
                          console.log('🖱️ Mouse enter button', index);
                        }}
                        onTouchStart={(e) => {
                          console.log('👆👆👆 Touch start on button', index);
                          // Don't prevent default - let the click work naturally
                        }}
                        disabled={isDisabled}
                        style={{ 
                          position: 'relative',
                          zIndex: 1000,
                          pointerEvents: isDisabled ? 'none' : 'auto',
                          touchAction: 'manipulation',
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                      className={`
                          w-full p-4 text-left rounded-xl transition-all duration-300 font-medium text-lg
                          ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer hover:shadow-lg hover:scale-[1.02]'}
                          ${isCorrect ? 'border-4 border-green-500 bg-green-100 shadow-lg animate-pulse' : ''}
                          ${isIncorrect ? 'border-4 border-red-500 bg-red-100 shadow-lg animate-shake' : ''}
                          ${!isCorrect && !isIncorrect ? 'border-2 border-gray-300 hover:border-blue-500 shadow-md' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : isIncorrect ? 'text-red-600' : 'text-gray-400'}`}>
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-1">{def}</span>
                          {isCorrect && <span className="text-2xl">✅</span>}
                          {isIncorrect && <span className="text-2xl">❌</span>}
                        </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sentence Choice Question */}
            {currentWord.questionType === 'sentence-choice' && currentWord.sentences && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">בחר את המשפט הנכון</h3>
                  <p className="text-lg text-gray-600">שמשתמש במילה: <span className="font-bold text-purple-600 text-xl">{currentWord.word}</span></p>
                </div>
                <div className="space-y-3">
                  {currentWord.sentences.map((sentence, index) => {
                    // Disable only if this player already answered
                    const alreadyAnswered = (game.lastMove?.player === currentPlayerSymbol) || 
                                          (game.questionResults?.[currentPlayerSymbol] !== undefined);
                    const isDisabled = alreadyAnswered || game.status !== 'active';
                    const isCorrect = game.lastMove?.answer === 'sentence' && game.lastMove.selectedIndex === index && game.lastMove.isCorrect;
                    const isIncorrect = game.lastMove?.answer === 'sentence' && game.lastMove.selectedIndex === index && !game.lastMove.isCorrect;
                    
                    return (
                    <button
                      key={index}
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('💬 Sentence button clicked!', { index, isDisabled });
                          if (!isDisabled) {
                            try {
                              await handleAnswer('sentence', index);
                            } catch (err) {
                              console.error('❌ Error in handleAnswer:', err);
                            }
                          }
                        }}
                        disabled={isDisabled}
                      className={`
                          w-full p-4 text-left rounded-xl transition-all duration-300 font-medium text-lg
                          ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 cursor-pointer hover:shadow-lg hover:scale-[1.02]'}
                          ${isCorrect ? 'border-4 border-green-500 bg-green-100 shadow-lg animate-pulse' : ''}
                          ${isIncorrect ? 'border-4 border-red-500 bg-red-100 shadow-lg animate-shake' : ''}
                          ${!isCorrect && !isIncorrect ? 'border-2 border-gray-300 hover:border-purple-500 shadow-md' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : isIncorrect ? 'text-red-600' : 'text-gray-400'}`}>
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-1 italic">{sentence}</span>
                          {isCorrect && <span className="text-2xl">✅</span>}
                          {isIncorrect && <span className="text-2xl">❌</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recording Question */}
            {currentWord.questionType === 'recording' && currentWord.sentenceToRecord && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-xl border-2 border-red-300">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">🎤 הקלט את המשפט:</h3>
                  <p className="text-2xl font-bold text-gray-800 text-center italic bg-white p-4 rounded-lg shadow-inner">
                    {currentWord.sentenceToRecord}
                </p>
              </div>
                
                {!isRecording && !userTranscript && (
                  <button
                    onClick={startRecording}
                    disabled={game.lastMove?.player === currentPlayerSymbol || !isTimerActive}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-6 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-3xl mr-2">🎤</span>
                    התחל הקלטה
                  </button>
                )}
                
                {isRecording && (
                  <div className="text-center space-y-4">
                    <div className="bg-red-100 p-6 rounded-xl border-4 border-red-500">
                      <div className="text-4xl mb-3 animate-pulse">🎤</div>
                      <div className="text-2xl font-bold text-red-600">מקליט...</div>
            </div>
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      ⏹️ עצור הקלטה
                    </button>
                  </div>
                )}
                
                {userTranscript && (
            <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300">
                      <p className="text-sm text-gray-600 mb-2 font-bold">הטקסט שזוהה:</p>
                      <p className="text-xl font-bold text-gray-800 bg-white p-4 rounded-lg">{userTranscript}</p>
                    </div>
                    <button
                      onClick={handleRecordingSubmit}
                      disabled={game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transform hover:scale-105 transition-all duration-200"
                    >
                      ✅ שלח תשובה
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sentence Scramble Question */}
            {currentWord.questionType === 'sentence-scramble' && currentWord.scrambledWords && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border-2 border-yellow-300 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">🔀 סדר את המילים למשפט נכון</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300">
                    <h4 className="text-xl font-bold mb-3 text-gray-800">המשפט שלך:</h4>
                    <div className="min-h-[80px] bg-white p-6 rounded-lg flex flex-wrap gap-3 border-2 border-dashed border-gray-300">
                      {selectedWords.length === 0 ? (
                        <span className="text-gray-400 text-lg w-full text-center">לחץ על המילים למטה כדי לבנות את המשפט...</span>
                      ) : (
                        selectedWords.map((word, index) => (
                    <button
                      key={index}
                            onClick={() => handleWordClick(word, false)}
                      disabled={game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-600 disabled:bg-gray-400 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                          >
                            {word}
                    </button>
                        ))
                      )}
                </div>
              </div>

                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-300">
                    <h4 className="text-xl font-bold mb-3 text-gray-800">מילים זמינות:</h4>
                    <div className="bg-white p-6 rounded-lg flex flex-wrap gap-3 border-2 border-gray-200">
                      {availableWords.map((word, index) => (
                    <button
                      key={index}
                          onClick={() => handleWordClick(word, true)}
                      disabled={game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                          className="bg-gradient-to-r from-gray-200 to-slate-200 hover:from-gray-300 hover:to-slate-300 text-gray-800 px-5 py-3 rounded-xl font-bold text-lg disabled:bg-gray-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                        >
                          {word}
                    </button>
                  ))}
                </div>
              </div>
                  
                  <button
                    onClick={handleScrambleSubmit}
                    disabled={selectedWords.length === 0 || game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-5 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transform hover:scale-105 transition-all duration-200"
                  >
                    ✅ שלח תשובה
                  </button>
            </div>
              </div>
            )}

            {/* Dictation Question */}
            {currentWord.questionType === 'dictation' && currentWord.sentenceToRecord && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-300">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">✍️ כתוב את המשפט:</h3>
                  <p className="text-2xl font-bold text-gray-800 text-center italic bg-white p-4 rounded-lg shadow-inner mb-3">
                    {currentWord.sentenceToRecord}
                  </p>
                  {currentWord.wasRecorded && (
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-blue-700">💡 נשאלת להקליט את המשפט הזה קודם - יש לך זמן כפול!</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <textarea
                    value={dictationAnswer}
                    onChange={(e) => setDictationAnswer(e.target.value)}
                    disabled={game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                    placeholder="כתוב את המשפט כאן..."
                    className="w-full p-6 border-3 border-gray-300 rounded-xl text-lg disabled:bg-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-inner"
                    rows={4}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔵 Dictation submit button clicked!', {
                      dictationAnswer,
                      dictationAnswerTrimmed: dictationAnswer?.trim(),
                      isDisabled: !dictationAnswer.trim() || game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer,
                      lastMove: game?.lastMove,
                      questionResults: game?.questionResults,
                      currentPlayerSymbol,
                      isSubmittingAnswer
                    });
                    if (!isSubmittingAnswer && dictationAnswer?.trim()) {
                      handleDictationSubmit();
                    }
                  }}
                  disabled={!dictationAnswer.trim() || game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-5 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                  style={{ 
                    position: 'relative',
                    zIndex: 1000,
                    pointerEvents: (!dictationAnswer.trim() || game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer) ? 'none' : 'auto',
                    cursor: (!dictationAnswer.trim() || game.lastMove?.player === currentPlayerSymbol || game.questionResults?.[currentPlayerSymbol] !== undefined || isSubmittingAnswer) ? 'not-allowed' : 'pointer'
                  }}
                >
                  ✅ שלח תשובה
                </button>
              </div>
            )}

            {currentPlayerAnswered && (
              <div className="text-lg text-blue-700 font-bold animate-pulse mt-4">ענית! מחכים לתשובת היריב...</div>
            )}
            {game.lastMove && game.lastMove.player !== currentPlayerSymbol && (
              <div className="text-lg text-green-700 font-bold animate-bounce mt-4">היריב ענה! מחכים לסיבוב הבא...</div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
              >
                העתק קישור למשחק
              </button>
              {showToast && (
                <div className="fixed bottom-8 right-8 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                  הקישור הועתק!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {game.status === 'finished' && (() => {
        // Calculate rankings
        const activePlayers = [
          { key: 'player1' as Player, id: game.players.player1, score: game.playerStates.player1?.score || 0 },
          { key: 'player2' as Player, id: game.players.player2, score: game.playerStates.player2?.score || 0 },
          { key: 'player3' as Player, id: game.players.player3, score: game.playerStates.player3?.score || 0 }
        ].filter(p => p.id !== null);
        
        // Sort by score (descending)
        activePlayers.sort((a, b) => b.score - a.score);
        
        return (
          <div className="text-center bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <h2 className="text-4xl font-bold mb-6 text-purple-700">
              {game.winner === 'draw' ? "תיקו! 🎉" : 
               game.winner === currentPlayerSymbol ? 'ניצחת! 🏆' : 'הפסדת 😔'}
          </h2>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🏆 דירוג סופי:</h3>
              
              {activePlayers.map((player, index) => {
                const isCurrentPlayer = player.id === currentPlayerId;
                const playerName = isCurrentPlayer ? 'אתה' : 
                  player.key === 'player1' ? 'שחקן 1' : 
                  player.key === 'player2' ? 'שחקן 2' : 'שחקן 3';
                
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const place = index === 0 ? 'מקום ראשון' : index === 1 ? 'מקום שני' : 'מקום שלישי';
                
                return (
                  <div 
                    key={player.key}
                    className={`p-4 rounded-xl shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white' :
                      'bg-white text-gray-800'
                    } ${isCurrentPlayer ? 'ring-4 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{medal}</span>
                        <div className="text-left">
                          <div className="text-xl font-bold">{place}</div>
                          <div className="text-lg">{playerName}</div>
        </div>
                      </div>
                      <div className="text-3xl font-bold">{player.score} נקודות</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* מערכת אימוג'ים */}
      {game && (
        <div className="w-full max-w-2xl mt-8 bg-white bg-opacity-90 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">תגובות מהירות</h3>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
            >
              😊 שליחת אימוג'י
            </button>
          </div>

          {/* בחירת אימוג'י */}
          {showEmojiPicker && (
            <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              {EMOJI_REACTIONS.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => sendEmoji(reaction.emoji)}
                  className={`p-2 rounded-lg transition-all duration-200 ${reaction.color} hover:scale-110`}
                  title={reaction.name}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}

          {/* אימוג'י נוכחי */}
          {currentEmoji && (
            <div className="text-center mb-4">
              <div className="text-6xl animate-bounce">{currentEmoji}</div>
              <p className="text-sm text-gray-600 mt-2">שלחת אימוג'י!</p>
            </div>
          )}

          {/* היסטוריית אימוג'ים */}
          {emojiHistory.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              {emojiHistory.map((emoji, index) => (
                <div
                  key={index}
                  className="text-2xl animate-fade-in opacity-80"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* קומפוננטת צ'אט */}
      {game && (
        <div className="w-full max-w-2xl mt-4 bg-white bg-opacity-80 rounded-lg shadow p-4">
          <div className="h-40 overflow-y-auto mb-2 border-b pb-2">
            {game.chatMessages && game.chatMessages.length > 0 ? (
              game.chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-1 text-sm ${msg.sender === currentPlayerId ? 'text-blue-700 text-right' : 'text-gray-800 text-left'}`}>
                  <span className="font-bold">{msg.sender === currentPlayerId ? 'אתה' : 'יריב'}: </span>{msg.text}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center">אין הודעות עדיין</div>
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim()) return;
              // await sendChatMessage(gameId, currentPlayerId, chatInput.trim());
              setChatInput('');
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="כתוב הודעה..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              שלח
            </button>
          </form>
        </div>
      )}

      {/* Time's Up Modal - REMOVED - using automatic progression */}
      {false && showTimeUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 border-4 border-orange-500">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce text-orange-500">
                ⏰
              </div>
              <h2 className="text-3xl font-bold mb-4 text-orange-600">
                הזמן נגמר! עוברים לשאלה הבאה...
              </h2>
              <button
                onClick={async () => {
                  setShowTimeUpModal(false);
                  // Move to next round
                  if (game && game.currentRound < game.maxRounds - 1) {
                    try {
                      const nextResponse = await fetch('/api/games/word-clash', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'nextRound',
                          gameId: gameId
                        })
                      });
                      
                      if (nextResponse.ok) {
                        const nextData = await nextResponse.json();
                        setGame(nextData.game);
                        // Reset timer
                        setTimeLeft(nextData.game.timeLeft || 20);
                        setIsTimerActive(true);
                      } else {
                        console.error('Failed to move to next round');
                      }
                    } catch (err) {
                      console.error('Error moving to next round:', err);
                    }
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors mt-4"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && feedbackMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowFeedback(false)}>
          <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-300 ${
            feedbackMessage.type === 'success' 
              ? 'border-4 border-green-500' 
              : 'border-4 border-red-500'
          }`}>
            <div className="text-center">
              <div className={`text-6xl mb-4 animate-bounce ${
                feedbackMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {feedbackMessage.type === 'success' ? '✅' : '❌'}
              </div>
              <div className={`text-lg font-bold mb-4 whitespace-pre-line text-right ${
                feedbackMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedbackMessage.text}
              </div>
              <div className={`text-2xl font-bold mb-4 ${
                feedbackMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedbackMessage.points > 0 ? '+' : ''}{feedbackMessage.points} נקודות
              </div>
              <div className="text-gray-600">
                {feedbackMessage.type === 'success' 
                  ? 'כל הכבוד! המשך כך! 🎉' 
                  : 'אל תתייאש, נסה שוב! 💪'}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-5px);} 80%{transform:translateX(5px);} 100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.4s; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.4s; }
      `}</style>
    </div>
  );
} 