import React, { useState } from 'react';
import { Player, Question, AnswerLog } from '../types';
import { soundManager } from '../utils/sound';
import { CheckCircle2, XCircle, RotateCcw, Video } from 'lucide-react';

interface SplitBattleArenaProps {
  players: [Player, Player];
  roundNumber: number;
  totalRounds: number;
  p1Question: Question;
  p2Question: Question;
  onBothAnswered: (p1Log: AnswerLog, p2Log: AnswerLog) => void;
}

export const SplitBattleArena: React.FC<SplitBattleArenaProps> = ({
  players,
  roundNumber,
  totalRounds,
  p1Question,
  p2Question,
  onBothAnswered,
}) => {
  const [invertTop, setInvertTop] = useState(true);
  const [p1Selected, setP1Selected] = useState<number | null>(null);
  const [p2Selected, setP2Selected] = useState<number | null>(null);

  const handleOpenYouTube = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playTap();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleP1Answer = (index: number) => {
    if (p1Selected !== null) return;
    setP1Selected(index);
    if (index === p1Question.correctIndex) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    checkFinish(index, p2Selected);
  };

  const handleP2Answer = (index: number) => {
    if (p2Selected !== null) return;
    setP2Selected(index);
    if (index === p2Question.correctIndex) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    checkFinish(p1Selected, index);
  };

  const checkFinish = (p1Ans: number | null, p2Ans: number | null) => {
    if (p1Ans !== null && p2Ans !== null) {
      setTimeout(() => {
        onBothAnswered(
          {
            question: p1Question,
            playerId: 'p1',
            playerName: players[0].name,
            selectedOption: p1Ans,
            isCorrect: p1Ans === p1Question.correctIndex,
            timeSpent: 5,
          },
          {
            question: p2Question,
            playerId: 'p2',
            playerName: players[1].name,
            selectedOption: p2Ans,
            isCorrect: p2Ans === p2Question.correctIndex,
            timeSpent: 5,
          }
        );
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-lg mx-auto p-2 gap-2 overflow-hidden">
      {/* Top Player (Ammeya - Class 3) */}
      <div
        className={`flex-1 rounded-2xl p-3 flex flex-col justify-between border-2 border-sky-500/50 bg-gradient-to-b from-sky-950/90 to-slate-900 transition-transform ${
          invertTop ? 'rotate-180' : ''
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-black text-sky-300">
            <span className="text-xl">{players[0].avatar}</span>
            <span>{players[0].name} (Class {players[0].level})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleOpenYouTube(p1Question.youtubeQuery, e)}
              className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"
            >
              <Video size={11} /> <span>Video</span>
            </button>
            <span className="text-amber-400 font-bold">⭐ {players[0].score}</span>
          </div>
        </div>

        <div className="my-1">
          <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">
            {p1Question.question}
          </p>
          <p className="text-[11px] text-amber-300 font-semibold truncate">
            {p1Question.questionHindi}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {p1Question.options.map((opt, i) => {
            const isSel = p1Selected === i;
            const isCor = i === p1Question.correctIndex;
            let btnClass = 'bg-slate-800 text-slate-200 border-slate-700';
            if (p1Selected !== null) {
              if (isCor) btnClass = 'bg-emerald-700 text-white border-emerald-400';
              else if (isSel) btnClass = 'bg-rose-700 text-white border-rose-400';
            }
            return (
              <button
                key={i}
                disabled={p1Selected !== null}
                onClick={() => handleP1Answer(i)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-between active:scale-95 transition-all ${btnClass}`}
              >
                <span className="truncate">{opt}</span>
                {p1Selected !== null && isCor && <CheckCircle2 size={14} />}
                {p1Selected !== null && isSel && !isCor && <XCircle size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Divider Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-black text-slate-400">
        <span>Round {roundNumber} / {totalRounds}</span>
        <button
          onClick={() => {
            setInvertTop(!invertTop);
            soundManager.playTap();
          }}
          className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20"
        >
          <RotateCcw size={12} />
          <span>Flip Top Screen</span>
        </button>
        <span className="text-pink-400">DUAL BUZZER</span>
      </div>

      {/* Bottom Player (Ahil - Class 1) */}
      <div className="flex-1 rounded-2xl p-3 flex flex-col justify-between border-2 border-pink-500/50 bg-gradient-to-b from-slate-900 to-pink-950/90">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-black text-pink-300">
            <span className="text-xl">{players[1].avatar}</span>
            <span>{players[1].name} (Class {players[1].level})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleOpenYouTube(p2Question.youtubeQuery, e)}
              className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"
            >
              <Video size={11} /> <span>Video</span>
            </button>
            <span className="text-amber-400 font-bold">⭐ {players[1].score}</span>
          </div>
        </div>

        <div className="my-1">
          <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">
            {p2Question.question}
          </p>
          <p className="text-[11px] text-amber-300 font-semibold truncate">
            {p2Question.questionHindi}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {p2Question.options.map((opt, i) => {
            const isSel = p2Selected === i;
            const isCor = i === p2Question.correctIndex;
            let btnClass = 'bg-slate-800 text-slate-200 border-slate-700';
            if (p2Selected !== null) {
              if (isCor) btnClass = 'bg-emerald-700 text-white border-emerald-400';
              else if (isSel) btnClass = 'bg-rose-700 text-white border-rose-400';
            }
            return (
              <button
                key={i}
                disabled={p2Selected !== null}
                onClick={() => handleP2Answer(i)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-between active:scale-95 transition-all ${btnClass}`}
              >
                <span className="truncate">{opt}</span>
                {p2Selected !== null && isCor && <CheckCircle2 size={14} />}
                {p2Selected !== null && isSel && !isCor && <XCircle size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
