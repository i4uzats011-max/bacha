import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles, BookOpen, ChevronDown, ChevronUp, Video } from 'lucide-react';
import { Player, AnswerLog } from '../types';
import { soundManager } from '../utils/sound';

interface VictoryModalProps {
  players: [Player, Player];
  logs: AnswerLog[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  players,
  logs,
  onPlayAgain,
  onGoHome,
}) => {
  const [showReview, setShowReview] = useState(false);

  const [p1, p2] = players;
  const isTie = p1.score === p2.score;
  const winner = p1.score > p2.score ? p1 : p2;
  const runnerUp = p1.score > p2.score ? p2 : p1;

  useEffect(() => {
    soundManager.playVictory();

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);
      confetti({
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.4 },
        spread: 60,
        colors: ['#FFD124', '#FF6B35', '#FF4D80', '#06D6A0', '#3A86FF'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const mistakes = logs.filter((l) => !l.isCorrect);

  const handleOpenYouTube = (query: string) => {
    soundManager.playTap();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 my-auto">
        {/* Victory Podium Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <span className="text-5xl sm:text-6xl animate-bounce-slow inline-block">
              {isTie ? '🤝' : '🏆'}
            </span>
            <Sparkles className="absolute -top-1 -right-2 text-amber-400 animate-spin" size={24} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isTie ? 'Super Tie! Ammeya & Ahil are Champions!' : `${winner.name} Wins the Clash!`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isTie
              ? 'Incredible performance from both Ammeya and Ahil!'
              : `Spectacular effort by both ${winner.name} and ${runnerUp.name}!`}
          </p>
        </div>

        {/* Both Kids Score Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Ammeya */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center text-center ${
              !isTie && winner.id === p1.id
                ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <span className="text-3xl mb-1">{p1.avatar}</span>
            <h4 className="text-sm font-black text-sky-300 max-w-[120px] truncate">{p1.name}</h4>
            <span className="text-[10px] text-slate-400 font-bold mb-2">Class {p1.level} (Age 8)</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              ⭐ {p1.score}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {p1.correctAnswers} / {p1.totalAnswered} Correct
            </span>
          </div>

          {/* Ahil */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center text-center ${
              !isTie && winner.id === p2.id
                ? 'bg-pink-950/80 border-pink-400 ring-2 ring-pink-400/50'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <span className="text-3xl mb-1">{p2.avatar}</span>
            <h4 className="text-sm font-black text-pink-300 max-w-[120px] truncate">{p2.name}</h4>
            <span className="text-[10px] text-slate-400 font-bold mb-2">Class {p2.level} (Age 6)</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              ⭐ {p2.score}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {p2.correctAnswers} / {p2.totalAnswered} Correct
            </span>
          </div>
        </div>

        {/* Review Mistakes & Learn with YouTube */}
        {mistakes.length > 0 && (
          <div className="border border-slate-700/80 rounded-2xl overflow-hidden bg-slate-950/50">
            <button
              onClick={() => {
                setShowReview(!showReview);
                soundManager.playTap();
              }}
              className="w-full p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-400 bg-slate-800/60 hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>Review & Learn from Mistakes ({mistakes.length})</span>
              </div>
              {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showReview && (
              <div className="p-3 space-y-3 max-h-56 overflow-y-auto text-xs divide-y divide-slate-800">
                {mistakes.map((m, i) => (
                  <div key={i} className="pt-2.5 first:pt-0 space-y-1.5 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-200">
                          {m.playerName}: {m.question.question}
                        </p>
                        <p className="text-[11px] text-amber-300">
                          {m.question.questionHindi}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenYouTube(m.question.youtubeQuery)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                      >
                        <Video size={11} /> <span>Video</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-rose-400">
                        ❌ Picked: {m.selectedOption >= 0 ? m.question.options[m.selectedOption] : 'Time Up'}
                      </span>
                      <span className="text-emerald-400">
                        ✅ Correct: {m.question.options[m.question.correctIndex]}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      💡 {m.question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => {
              soundManager.playTap();
              onPlayAgain();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
            <span>Play Next Match</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTap();
              onGoHome();
            }}
            className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Home size={18} />
            <span>Subjects</span>
          </button>
        </div>
      </div>
    </div>
  );
};
