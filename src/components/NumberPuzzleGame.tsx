import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Lightbulb, ArrowLeft, Trophy, Flame, Volume2, VolumeX, CheckCircle2, AlertCircle } from 'lucide-react';
import { Player, Level, MathOperation, PuzzleBubble } from '../types';
import { soundManager } from '../utils/sound';
import { speechReader } from '../utils/speech';

interface NumberPuzzleGameProps {
  players: [Player, Player];
  battleLevel: Level;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  onExit: () => void;
  onAddScore?: (playerId: 'p1' | 'p2', points: number) => void;
}

const BUBBLE_GRADIENTS = [
  'from-sky-500 to-blue-600 border-sky-300/60 shadow-sky-500/30',
  'from-pink-500 to-rose-600 border-pink-300/60 shadow-pink-500/30',
  'from-amber-500 to-orange-600 border-amber-300/60 shadow-amber-500/30',
  'from-emerald-500 to-teal-600 border-emerald-300/60 shadow-emerald-500/30',
  'from-purple-500 to-indigo-600 border-purple-300/60 shadow-purple-500/30',
  'from-violet-500 to-fuchsia-600 border-violet-300/60 shadow-violet-500/30',
  'from-cyan-500 to-blue-500 border-cyan-300/60 shadow-cyan-500/30',
  'from-lime-500 to-emerald-600 border-lime-300/60 shadow-lime-500/30',
];

export const NumberPuzzleGame: React.FC<NumberPuzzleGameProps> = ({
  players,
  battleLevel,
  soundEnabled,
  ttsEnabled,
  onExit,
  onAddScore,
}) => {
  // Active player selection: 0 = Player 1 (Ammeya), 1 = Player 2 (Ahil)
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);
  const activePlayer = players[activePlayerIndex];

  // Difficulty & Operation
  const [level, setLevel] = useState<Level>(() => (activePlayerIndex === 0 ? battleLevel : (Math.max(1, battleLevel - 2) as Level)));
  const [operation, setOperation] = useState<MathOperation>('add');

  // Game board states
  const [targetNumber, setTargetNumber] = useState<number>(12);
  const [bubbles, setBubbles] = useState<PuzzleBubble[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shakingIds, setShakingIds] = useState<string[]>([]);
  const [hintPair, setHintPair] = useState<[string, string] | null>(null);

  // Score & streaks
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [clearedPairsCount, setClearedPairsCount] = useState(0);
  const [lastEquation, setLastEquation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Local sound & speech toggles
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [ttsOn, setTtsOn] = useState(ttsEnabled);

  // Sync player level when switching players
  const handleSwitchPlayer = (index: 0 | 1) => {
    setActivePlayerIndex(index);
    const newLvl = index === 0 ? battleLevel : (Math.max(1, battleLevel - 2) as Level);
    setLevel(newLvl);
    soundManager.playTap();
  };

  // Helper: Find all matching pairs from an array of numbers
  const findValidPairs = useCallback(
    (nums: { id: string; val: number }[], op: MathOperation, target: number): [string, string][] => {
      const valid: [string, string][] = [];
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const a = nums[i].val;
          const b = nums[j].val;
          let match = false;
          if (op === 'add' && a + b === target) match = true;
          if (op === 'multiply' && a * b === target) match = true;
          if (op === 'subtract' && Math.abs(a - b) === target) match = true;

          if (match) {
            valid.push([nums[i].id, nums[j].id]);
          }
        }
      }
      return valid;
    },
    []
  );

  // Generate puzzle board with target and guaranteed valid pairs
  const generateNewPuzzle = useCallback(
    (currentOp: MathOperation, currentLvl: Level) => {
      setSelectedIds([]);
      setShakingIds([]);
      setHintPair(null);
      setRoundCompleted(false);

      let newTarget = 12;
      const pairs: [number, number][] = [];

      if (currentOp === 'add') {
        if (currentLvl <= 2) {
          // Junior: targets between 6 and 20 (e.g. 8, 10, 12, 14, 15, 16, 18, 20)
          const targetPool = [8, 10, 12, 14, 15, 16, 18, 20];
          newTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
          // Collect all valid pairs
          const candidatePairs: [number, number][] = [];
          for (let i = 1; i <= Math.floor(newTarget / 2); i++) {
            candidatePairs.push([i, newTarget - i]);
          }
          // Pick 3-4 pairs
          const shuffledPairs = [...candidatePairs].sort(() => Math.random() - 0.5);
          pairs.push(...shuffledPairs.slice(0, Math.min(4, shuffledPairs.length)));
        } else {
          // Senior (Class 3-5): targets between 20 and 60
          const targetPool = [20, 24, 25, 30, 32, 36, 40, 48, 50, 60];
          newTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
          const candidatePairs: [number, number][] = [];
          for (let i = 2; i <= Math.floor(newTarget / 2); i += 2) {
            candidatePairs.push([i, newTarget - i]);
          }
          for (let i = 3; i <= Math.floor(newTarget / 2); i += 4) {
            candidatePairs.push([i, newTarget - i]);
          }
          const shuffledPairs = [...candidatePairs].sort(() => Math.random() - 0.5);
          pairs.push(...shuffledPairs.slice(0, Math.min(4, shuffledPairs.length)));
        }
      } else if (currentOp === 'multiply') {
        if (currentLvl <= 2) {
          // Junior: Basic multiplication targets (6, 8, 10, 12, 14, 15, 16, 18, 20)
          const juniorMultipliers: { target: number; pairs: [number, number][] }[] = [
            { target: 12, pairs: [[6, 2], [3, 4], [2, 6], [4, 3]] },
            { target: 16, pairs: [[4, 4], [8, 2], [2, 8]] },
            { target: 18, pairs: [[9, 2], [6, 3], [3, 6], [2, 9]] },
            { target: 20, pairs: [[4, 5], [10, 2], [2, 10], [5, 4]] },
            { target: 24, pairs: [[6, 4], [8, 3], [12, 2]] },
            { target: 10, pairs: [[5, 2], [2, 5]] },
            { target: 15, pairs: [[5, 3], [3, 5]] },
          ];
          const choice = juniorMultipliers[Math.floor(Math.random() * juniorMultipliers.length)];
          newTarget = choice.target;
          pairs.push(...choice.pairs.slice(0, 3));
        } else {
          // Senior: Richer tables like 13 * 2 = 26, 7 * 4 = 28, 12 * 4 = 48, 9 * 4 = 36, etc.
          const seniorMultipliers: { target: number; pairs: [number, number][] }[] = [
            { target: 26, pairs: [[13, 2], [2, 13]] },
            { target: 24, pairs: [[6, 4], [8, 3], [12, 2], [3, 8]] },
            { target: 28, pairs: [[14, 2], [7, 4], [4, 7]] },
            { target: 30, pairs: [[15, 2], [6, 5], [10, 3], [5, 6]] },
            { target: 32, pairs: [[16, 2], [8, 4], [4, 8]] },
            { target: 36, pairs: [[9, 4], [6, 6], [12, 3], [18, 2]] },
            { target: 40, pairs: [[8, 5], [10, 4], [20, 2], [5, 8]] },
            { target: 48, pairs: [[12, 4], [8, 6], [16, 3], [24, 2], [6, 8]] },
            { target: 50, pairs: [[25, 2], [10, 5], [5, 10]] },
            { target: 60, pairs: [[12, 5], [15, 4], [20, 3], [30, 2], [6, 10]] },
          ];
          const choice = seniorMultipliers[Math.floor(Math.random() * seniorMultipliers.length)];
          newTarget = choice.target;
          pairs.push(...choice.pairs.slice(0, 3));
        }
      } else if (currentOp === 'subtract') {
        // Subtraction: a - b = target
        newTarget = currentLvl <= 2 ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 15) + 10;
        for (let step = 1; step <= 4; step++) {
          const b = step * 2;
          const a = newTarget + b;
          pairs.push([a, b]);
        }
      }

      setTargetNumber(newTarget);

      // Create flat list of values from guaranteed pairs
      const allValues: number[] = [];
      pairs.forEach(([a, b]) => {
        allValues.push(a, b);
      });

      // Add 4-6 fun distractors
      const distractorCount = Math.max(4, 16 - allValues.length);
      for (let i = 0; i < distractorCount; i++) {
        let dist = 1;
        if (currentOp === 'multiply') {
          dist = Math.floor(Math.random() * 9) + 2;
        } else {
          dist = Math.floor(Math.random() * Math.max(10, newTarget)) + 1;
        }
        allValues.push(dist);
      }

      // Shuffle values
      const shuffledValues = [...allValues].sort(() => Math.random() - 0.5);

      // Construct PuzzleBubble array
      const newBubbles: PuzzleBubble[] = shuffledValues.map((val, idx) => ({
        id: `bubble_${Date.now()}_${idx}_${Math.random()}`,
        value: val,
        colorClass: BUBBLE_GRADIENTS[idx % BUBBLE_GRADIENTS.length],
        isPopping: false,
        isVanished: false,
        delayIndex: idx,
      }));

      setBubbles(newBubbles);

      // Announce target via TTS
      if (ttsOn) {
        const opWord = currentOp === 'add' ? 'जोड़कर' : currentOp === 'multiply' ? 'गुणा करके' : 'घटाकर';
        speechReader.speak(`नया लक्ष्य: ${newTarget}! संख्याएँ ${opWord} ${newTarget} बनाइए!`);
      }
    },
    [ttsOn]
  );

  // Initialize on mount or operation/level change
  useEffect(() => {
    generateNewPuzzle(operation, level);
  }, [operation, level, generateNewPuzzle]);

  // Handle Bubble Click
  const handleBubbleClick = (bubble: PuzzleBubble) => {
    if (bubble.isPopping || bubble.isVanished || roundCompleted) return;

    // Deselect if already clicked
    if (selectedIds.includes(bubble.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== bubble.id));
      if (soundOn) soundManager.playTap();
      return;
    }

    // Play tap sound & speak value
    if (soundOn) soundManager.playBubbleTap(bubble.value);
    if (ttsOn) speechReader.speak(String(bubble.value));

    // Clear hint glow
    if (hintPair) setHintPair(null);

    // If 0 selected -> select this one
    if (selectedIds.length === 0) {
      setSelectedIds([bubble.id]);
      return;
    }

    // If 1 selected -> this is the 2nd bubble! Validate pair
    if (selectedIds.length === 1) {
      const firstId = selectedIds[0];
      const firstBubble = bubbles.find((b) => b.id === firstId);
      if (!firstBubble) {
        setSelectedIds([bubble.id]);
        return;
      }

      const a = firstBubble.value;
      const b = bubble.value;
      let isCorrect = false;
      let equationStr = '';

      if (operation === 'add') {
        isCorrect = a + b === targetNumber;
        equationStr = `${a} + ${b} = ${targetNumber}`;
      } else if (operation === 'multiply') {
        isCorrect = a * b === targetNumber;
        equationStr = `${a} × ${b} = ${targetNumber}`;
      } else if (operation === 'subtract') {
        isCorrect = Math.abs(a - b) === targetNumber;
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        equationStr = `${big} - ${small} = ${targetNumber}`;
      }

      if (isCorrect) {
        // SUCCESS! 🎉
        if (soundOn) {
          soundManager.playBubblePop();
          soundManager.playCorrect();
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f43f5e', '#fbbf24', '#34d399', '#a855f7'],
        });

        // Mark popping animation
        setBubbles((prev) =>
          prev.map((item) => (item.id === firstId || item.id === bubble.id ? { ...item, isPopping: true } : item))
        );

        // TTS praise
        if (ttsOn) {
          speechReader.speak(`${equationStr}! बहुत बढ़िया!`);
        }

        setLastEquation(equationStr);
        setFeedback({ message: `✨ ${equationStr}! शाबाश! +10 Points!`, isCorrect: true });

        const pts = 10 + streak * 2;
        setScore((s) => s + pts);
        setStreak((str) => str + 1);
        setClearedPairsCount((c) => c + 1);
        onAddScore?.(activePlayer.id, pts);

        // Vanish after pop animation completes
        setTimeout(() => {
          setBubbles((prev) =>
            prev.map((item) =>
              item.id === firstId || item.id === bubble.id ? { ...item, isPopping: false, isVanished: true } : item
            )
          );
          setSelectedIds([]);
        }, 320);

        // Check if any valid pairs remain on board
        setTimeout(() => {
          setBubbles((latestBubbles) => {
            const activeRemaining = latestBubbles
              .filter((b) => !b.isVanished && b.id !== firstId && b.id !== bubble.id)
              .map((b) => ({ id: b.id, val: b.value }));

            const remainingPairs = findValidPairs(activeRemaining, operation, targetNumber);

            if (remainingPairs.length === 0) {
              // ALL PAIRS CLEARED! VICTORY!
              setRoundCompleted(true);
              if (soundOn) soundManager.playVictory();
              confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
              setFeedback({ message: `🏆 सभी जोड़े पूरे हुए! नया लक्ष्य आ रहा है...`, isCorrect: true });
              setTimeout(() => {
                generateNewPuzzle(operation, level);
              }, 2000);
            }
            return latestBubbles;
          });
        }, 400);
      } else {
        // WRONG PAIR ❌
        if (soundOn) soundManager.playWrong();

        // Wobble / shake
        setShakingIds([firstId, bubble.id]);

        let wrongResult = 0;
        let wrongSymbol = '+';
        if (operation === 'add') {
          wrongResult = a + b;
          wrongSymbol = '+';
        } else if (operation === 'multiply') {
          wrongResult = a * b;
          wrongSymbol = '×';
        } else {
          wrongResult = Math.abs(a - b);
          wrongSymbol = '-';
        }

        setFeedback({
          message: `${a} ${wrongSymbol} ${b} = ${wrongResult} (हमें ${targetNumber} बनाना है!)`,
          isCorrect: false,
        });

        setStreak(0);

        // Reset selection after shake
        setTimeout(() => {
          setShakingIds([]);
          setSelectedIds([]);
        }, 650);
      }
    }
  };

  // Provide Hint: subtly glows one valid pair
  const handleHint = () => {
    const active = bubbles.filter((b) => !b.isVanished).map((b) => ({ id: b.id, val: b.value }));
    const valid = findValidPairs(active, operation, targetNumber);

    if (valid.length > 0) {
      const hint = valid[Math.floor(Math.random() * valid.length)];
      setHintPair(hint);
      if (soundOn) soundManager.playStreak();
      const b1 = bubbles.find((b) => b.id === hint[0]);
      const b2 = bubbles.find((b) => b.id === hint[1]);
      if (ttsOn && b1 && b2) {
        speechReader.speak(`संकेत: ${b1.value} और ${b2.value} को देखिए!`);
      }
    } else {
      setFeedback({ message: 'इस बोर्ड पर अब कोई और जोड़ा नहीं बचा! नया नंबर दबाएं!', isCorrect: false });
    }
  };

  // Remaining active bubble count
  const remainingCount = useMemo(() => bubbles.filter((b) => !b.isVanished).length, [bubbles]);

  // Remaining valid pairs count
  const remainingValidPairsCount = useMemo(() => {
    const active = bubbles.filter((b) => !b.isVanished).map((b) => ({ id: b.id, val: b.value }));
    return findValidPairs(active, operation, targetNumber).length;
  }, [bubbles, operation, targetNumber, findValidPairs]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Header & Controls */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-3 sm:p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundManager.playTap();
              onExit();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-black text-xs sm:text-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div>
            <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-1.5">
              <span>🫧</span>
              <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                संख्या जोड़-गुणा पहेली
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">
              दो नंबर चुनो जो मिलकर लक्ष्य संख्या बनाएं!
            </p>
          </div>
        </div>

        {/* Player Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleSwitchPlayer(0)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs transition-all ${
              activePlayerIndex === 0
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{players[0].avatar}</span>
            <span className="hidden sm:inline">{players[0].name}</span>
          </button>
          <button
            onClick={() => handleSwitchPlayer(1)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs transition-all ${
              activePlayerIndex === 1
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{players[1].avatar}</span>
            <span className="hidden sm:inline">{players[1].name}</span>
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              soundManager.enabled = next;
            }}
            className={`p-2 rounded-xl border text-xs transition-all ${
              soundOn ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => {
              const next = !ttsOn;
              setTtsOn(next);
              speechReader.enabled = next;
            }}
            className={`p-2 rounded-xl border text-xs transition-all ${
              ttsOn ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            🗣️
          </button>
        </div>
      </div>

      {/* Operation & Level Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Math Operation Toggles */}
        <div className="bg-slate-900/80 p-2 rounded-2xl border border-slate-800 flex items-center justify-between gap-1">
          <button
            onClick={() => {
              setOperation('add');
              soundManager.playTap();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              operation === 'add'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">➕</span> जोड़ (Addition)
          </button>
          <button
            onClick={() => {
              setOperation('multiply');
              soundManager.playTap();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              operation === 'multiply'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">✖️</span> गुणा (Multiplication)
          </button>
          <button
            onClick={() => {
              setOperation('subtract');
              soundManager.playTap();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              operation === 'subtract'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base">➖</span> घटाना (Subtract)
          </button>
        </div>

        {/* Level & Mode info */}
        <div className="bg-slate-900/80 p-2 rounded-2xl border border-slate-800 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activePlayer.avatar}</span>
            <div>
              <span className="text-xs font-black text-white">{activePlayer.name}'s Challenge</span>
              <p className="text-[10px] text-amber-400 font-bold">
                {level <= 2 ? 'Junior (Class 1-2 Level)' : 'Senior (Class 3-5 Level)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl text-amber-400 font-black text-xs">
              <Trophy size={14} />
              <span>{score} pts</span>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-xl text-rose-400 font-black text-xs animate-pulse">
                <Flame size={14} />
                <span>{streak}x Streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-5 sm:p-7 border-2 border-indigo-500/40 shadow-2xl text-center space-y-3">
        {/* Background ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30 mb-1">
            <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
            <span>लक्ष्य संख्या (TARGET NUMBER)</span>
          </div>

          {/* Big Target Number Orb */}
          <div className="my-2 relative flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 p-1 shadow-2xl shadow-indigo-500/40 animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-2 border-white/20">
                <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 tracking-tight">
                  {targetNumber}
                </span>
                <span className="text-[9px] font-black uppercase text-indigo-300">
                  {operation === 'add' ? 'Make by +' : operation === 'multiply' ? 'Make by ×' : 'Make by -'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md font-bold">
            {operation === 'add' && `स्क्रीन से किन्हीं 2 नंबरों को चुनो जिनका जोड़ ${targetNumber} बने!`}
            {operation === 'multiply' && `स्क्रीन से किन्हीं 2 नंबरों को चुनो जिनका गुणा ${targetNumber} बने!`}
            {operation === 'subtract' && `स्क्रीन से किन्हीं 2 नंबरों को चुनो जिनका अंतर (घटाना) ${targetNumber} बने!`}
          </p>

          {/* Action buttons under target: Hint, New Target, Remaining Pairs */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-black">
            <button
              onClick={handleHint}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Lightbulb size={14} />
              <span>संकेत (Hint)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playTap();
                generateNewPuzzle(operation, level);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <RotateCcw size={14} />
              <span>नया नंबर (New Target)</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-emerald-300 border border-slate-700">
              🎯 बचे हुए जोड़े: <strong>{remainingValidPairsCount}</strong>
            </span>
          </div>
        </div>

        {/* Live Equation / Feedback Notification Banner */}
        {feedback && (
          <div
            className={`py-2 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              feedback.isCorrect
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/20'
            }`}
          >
            {feedback.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Scattered Bubble Playground */}
      <div className="bg-slate-900/60 rounded-3xl p-4 sm:p-6 border border-slate-800 min-h-[360px] flex flex-col justify-center relative overflow-hidden shadow-inner">
        {/* Playful background circles */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Selection Indicator Banner */}
        <div className="mb-3 flex items-center justify-between text-xs px-2 text-slate-400 font-bold">
          <span>
            {selectedIds.length === 0 && '👇 नीचे से पहला नंबर चुनिए:'}
            {selectedIds.length === 1 && (
              <span className="text-amber-300 font-extrabold animate-pulse">
                ✨ पहला नंबर चुना गया ({bubbles.find((b) => b.id === selectedIds[0])?.value})! अब दूसरा नंबर चुनिए:
              </span>
            )}
            {selectedIds.length === 2 && 'जांच हो रही है...'}
          </span>

          <span className="text-slate-500 font-medium text-[11px]">
            बबल गायब: {clearedPairsCount * 2} | शेष: {remainingCount}
          </span>
        </div>

        {/* Grid of Bouncy Bubbles */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 p-1">
          {bubbles.map((bubble) => {
            if (bubble.isVanished) {
              return (
                <div
                  key={bubble.id}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-800/40 opacity-0 pointer-events-none"
                />
              );
            }

            const isSelected = selectedIds.includes(bubble.id);
            const isShaking = shakingIds.includes(bubble.id);
            const isHinted = hintPair?.includes(bubble.id);

            return (
              <button
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble)}
                disabled={bubble.isPopping}
                className={`group relative aspect-square rounded-2xl sm:rounded-3xl p-2 flex flex-col items-center justify-center font-black transition-all select-none ${
                  bubble.isPopping
                    ? 'scale-125 opacity-0 duration-300 pointer-events-none'
                    : isShaking
                    ? 'animate-bounce text-white border-2 border-rose-400 shadow-lg shadow-rose-500/40 bg-rose-700'
                    : isSelected
                    ? 'scale-105 border-4 border-amber-300 shadow-xl shadow-amber-400/50 bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 ring-4 ring-amber-300/40 z-20'
                    : isHinted
                    ? 'scale-105 border-4 border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-600 text-white animate-pulse ring-4 ring-amber-400/50 z-10'
                    : `bg-gradient-to-br ${bubble.colorClass} text-white hover:scale-105 active:scale-90 border-2 shadow-lg`
                }`}
                style={{
                  transitionDuration: '200ms',
                }}
              >
                {/* Bubble Sparkle Light Accent */}
                <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-white/60 pointer-events-none" />

                {/* Bubble Number Value */}
                <span className="text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md tracking-tight">
                  {bubble.value}
                </span>

                {/* Subtle Indicator */}
                {isSelected && (
                  <span className="absolute -top-2 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full px-1.5 py-0.5 shadow-md">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Round Completion Celebration Card */}
        {roundCompleted && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in duration-300">
            <span className="text-5xl animate-bounce">🎉</span>
            <h3 className="text-2xl font-black text-amber-300">शानदार! सारे जोड़े पूरे हुए!</h3>
            <p className="text-sm text-slate-300 font-semibold">
              आपने लक्ष्य <strong>{targetNumber}</strong> को सफलतापूर्वक हल कर लिया!
            </p>
            <div className="pt-2">
              <button
                onClick={() => generateNewPuzzle(operation, level)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
              >
                अगली पहेली खेलें ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Education Tip for Kids & Parents */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>💡</span>
          <span>
            {operation === 'add' && 'जोड़ से बच्चे संख्याओं के संयोजन (Number Bonds) सीखते हैं!'}
            {operation === 'multiply' && 'गुणा से पहाड़े (Tables) और गुणनखंड (Factors) याद होते हैं!'}
            {operation === 'subtract' && 'घटाने से संख्याओं के बीच का अंतर समझना आसान होता है!'}
          </span>
        </div>
        {lastEquation && (
          <span className="text-amber-300 font-black hidden sm:inline">
            अंतिम हल: {lastEquation} ⭐
          </span>
        )}
      </div>
    </div>
  );
};
