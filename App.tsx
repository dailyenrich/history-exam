import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestions } from './services/geminiService';
import { TUTORIAL_QUESTION, INITIAL_LEADERBOARD } from './constants';
import { HistoryQuestion, CardItem, GameState, User } from './types';
import Card from './components/Card';
import Dock from './components/Dock';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  // Application State
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [user, setUser] = useState<User>({ username: '', highScore: 0 });
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>(INITIAL_LEADERBOARD);
  
  // Game Logic State
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionPool, setQuestionPool] = useState<HistoryQuestion[]>([]);
  
  // Current Round State
  const [currentQuestion, setCurrentQuestion] = useState<HistoryQuestion | null>(null);
  const [deck, setDeck] = useState<CardItem[]>([]); // The 10 choices
  const [dockSlots, setDockSlots] = useState<(CardItem | null)[]>([null, null, null, null, null]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load Leaderboard from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('history_game_leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // Save leaderboard whenever it changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('history_game_leaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Pre-fetch questions when pool is low
  useEffect(() => {
    if (gameState === 'playing' && questionPool.length < 3 && !loading) {
      setLoading(true);
      // Calculate the start level for the new batch.
      // Current active level is `level`.
      // The pool contains questions for subsequent levels.
      const nextBatchStartLevel = level + questionPool.length + 1;

      generateQuestions(5, nextBatchStartLevel).then(newQuestions => {
        setQuestionPool(prev => [...prev, ...newQuestions]);
        setLoading(false);
      });
    }
  }, [gameState, questionPool.length, loading, level]);

  // Start a new Level/Round
  const startLevel = useCallback(() => {
    // Reset Round State
    setDockSlots([null, null, null, null, null]);
    setIsVerifying(false);

    let nextQuestion: HistoryQuestion;

    if (level === 1) {
      nextQuestion = TUTORIAL_QUESTION;
    } else {
      if (questionPool.length > 0) {
        // Pop from pool
        const [first, ...rest] = questionPool;
        nextQuestion = first;
        setQuestionPool(rest);
      } else {
        // Fallback if pool empty (shouldn't happen often due to pre-fetch)
        setLoading(true);
        // Fetch starting from current level since we have none
        generateQuestions(3, level).then(qs => {
          if(qs.length > 0) {
             setQuestionPool(qs.slice(1));
             setCurrentQuestion(qs[0]);
             prepareDeck(qs[0]);
          }
          setLoading(false);
        });
        return; // Wait for async
      }
    }

    setCurrentQuestion(nextQuestion);
    prepareDeck(nextQuestion);

  }, [level, questionPool]);

  // Helper to shuffle and prepare deck
  const prepareDeck = (q: HistoryQuestion) => {
    const correct: CardItem[] = q.correctItems.map((text, i) => ({ id: `c-${i}`, text, isCorrect: true }));
    const distractors: CardItem[] = q.distractorItems.map((text, i) => ({ id: `d-${i}`, text, isCorrect: false }));
    
    // Combine and Shuffle
    const combined = [...correct, ...distractors]
      .sort(() => Math.random() - 0.5);
    
    setDeck(combined);
  };

  // Start Game Button
  const handleStartGame = () => {
    const trimmedUsername = user.username.trim();
    if (!trimmedUsername) {
      alert("请输入少侠尊姓大名！");
      return;
    }
    // Update user state with trimmed name
    setUser(prev => ({ ...prev, username: trimmedUsername }));
    
    setGameState('playing');
    setLevel(1);
    setScore(0);
    // Start level 1 immediately
    // Note: useEffect dependency on level/gameState will handle flow if structured right, 
    // but here we call explicitly to ensure sync.
  };

  // Effect to trigger startLevel when level changes or game starts
  useEffect(() => {
    if (gameState === 'playing') {
      startLevel();
    }
  }, [level, gameState]); // Dependency on startLevel omitted to avoid loop, startLevel is stable via ref or careful deps


  // Card Click Logic
  const handleCardClick = (card: CardItem) => {
    if (isVerifying) return;

    // Find first empty slot
    const emptyIndex = dockSlots.findIndex(slot => slot === null);
    if (emptyIndex === -1) return; // Full

    const newSlots = [...dockSlots];
    newSlots[emptyIndex] = card;
    setDockSlots(newSlots);

    // Check if full after this move
    if (newSlots.every(slot => slot !== null)) {
      verifyAnswer(newSlots as CardItem[]);
    }
  };

  // Dock Click (Remove) Logic
  const handleDockRemove = (index: number) => {
    if (isVerifying) return;
    const newSlots = [...dockSlots];
    newSlots[index] = null;
    
    // Shift items to fill gap (optional, but good UX)
    const compacted = newSlots.filter(s => s !== null);
    while (compacted.length < 5) compacted.push(null);
    
    setDockSlots(compacted);
  };

  // Verification Logic
  const verifyAnswer = (slots: CardItem[]) => {
    setIsVerifying(true);
    
    setTimeout(() => {
      // Check if all slots are correct items
      const allCorrect = slots.every(item => item.isCorrect);

      if (allCorrect) {
        // Success
        setScore(prev => prev + 1);
        setLevel(prev => prev + 1); 
        // Logic continues via useEffect on 'level' change
      } else {
        // Failure
        handleGameOver();
      }
      setIsVerifying(false);
    }, 1500); // 1.5s delay to see the full cards
  };

  const handleGameOver = () => {
    setGameState('gameover');
    
    // Update Leaderboard
    setLeaderboard(prev => {
      const allEntries = [...prev, { username: user.username, score: score }];
      
      // Deduplicate: keep highest score per username
      const uniqueEntries = new Map<string, number>();
      
      allEntries.forEach(entry => {
        const existingScore = uniqueEntries.get(entry.username);
        if (existingScore === undefined || entry.score > existingScore) {
           uniqueEntries.set(entry.username, entry.score);
        }
      });

      const newBoard = Array.from(uniqueEntries.entries())
        .map(([username, score]) => ({ username, score }))
        .sort((a, b) => b.score - a.score);

      return newBoard;
    });
  };

  const handleRestart = () => {
    setGameState('welcome');
    setScore(0);
    setLevel(1);
    setQuestionPool([]);
  };

  // --- RENDER ---

  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-paper max-w-lg w-full p-8 rounded-lg shadow-2xl border-4 border-wood text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-wood opacity-50"></div>
          
          <h1 className="text-4xl md:text-6xl font-serif text-seal-red mb-2 mt-4 font-bold tracking-widest">
            历史状元
          </h1>
          <p className="text-ink mb-8 text-lg font-serif">穿越时空，考据古今</p>

          <div className="mb-8">
            <label className="block text-left text-wood font-bold mb-2 ml-1">少侠留名：</label>
            <input 
              type="text" 
              maxLength={10}
              placeholder="请输入名字"
              className="w-full bg-[#fcf6e6] border-2 border-wood p-3 rounded text-xl text-center focus:outline-none focus:ring-2 focus:ring-seal-red text-ink placeholder-gray-400"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>

          <button 
            onClick={handleStartGame}
            className="w-full bg-seal-red hover:bg-[#8b1a1a] text-white text-2xl font-bold py-4 rounded shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>开始闯关</span>
          </button>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>第一关：新手试炼</p>
            <p>第二关：正式科举 (AI出题)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative">
      {/* Header Info */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-paper p-3 rounded shadow border border-wood mb-4 z-10">
        <div className="flex flex-col">
          <span className="text-xs text-gray-600">考生</span>
          <span className="font-bold text-ink">{user.username}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-seal-red">第 {level} 关</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-600">积分</span>
          <span className="font-bold text-wood text-xl">{score}</span>
        </div>
      </div>

      {/* Game Area */}
      {currentQuestion ? (
        <div className="w-full max-w-3xl flex-1 flex flex-col relative">
          
          {/* Question Board */}
          <div className="bg-paper p-6 rounded-lg shadow-lg border-2 border-wood mb-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-wood text-paper px-4 py-1 rounded text-sm font-bold">
               {level === 1 ? '教学关卡' : level > 30 ? '世界历史' : '历史考题'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-ink mb-2 mt-2">{currentQuestion.topic}</h2>
            <p className="text-gray-700 italic">{currentQuestion.description || "请找出相关的5个历史要素"}</p>
            
            {level === 1 && (
                <div className="mt-2 text-sm text-seal-red font-bold animate-pulse">
                    提示：点击下方卡片，找出属于该题目的5个正确选项。
                </div>
            )}
          </div>

          {/* Card Grid (The Pool) */}
          <div className="grid grid-cols-5 gap-2 md:gap-4 mb-auto">
            {deck.map((item) => (
              <Card 
                key={item.id} 
                item={item} 
                onClick={() => handleCardClick(item)}
                selected={dockSlots.some(s => s?.id === item.id)}
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* The Dock */}
          <Dock 
            slots={dockSlots} 
            onRemove={handleDockRemove} 
            isVerifying={isVerifying} 
          />

        </div>
      ) : (
         <div className="flex-1 flex items-center justify-center">
             <div className="text-paper text-2xl animate-bounce">正在研磨墨汁，生成考题...</div>
         </div>
      )}

      {/* Overlays */}
      {gameState === 'gameover' && (
        <Leaderboard 
          currentScore={score} 
          users={leaderboard} 
          onRestart={handleRestart}
          isGameOver={true}
        />
      )}
    </div>
  );
};

export default App;