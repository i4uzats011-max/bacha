import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Lightbulb, Flame, ArrowRight, Sparkles, CheckCircle2, XCircle, Video, BookOpen } from 'lucide-react';
import { Player, Question, GameSettings, AnswerLog } from '../types';
import { soundManager } from '../utils/sound';
import { speechReader } from '../utils/speech';
import { VoiceAssistant } from './VoiceAssistant';

interface BattleArenaProps {
  players: [Player, Player];
  currentTurn: 'p1' | 'p2';
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question;
  settings: GameSettings;
  onAnswerSubmitted: (log: AnswerLog) => void;
  onNextTurn: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  players,
  currentTurn,
  roundNumber,
  totalRounds,
  currentQuestion,
  settings,
  onAnswerSubmitted,
  onNextTurn,
}) => {
  const activePlayer = currentTurn === 'p1' ? players[0] : players[1];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Reset state when new question or turn arrives
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimeLeft(settings.timerSeconds);
    setStartTime(Date.now());

    // Automatically speak question aloud if TTS is enabled
    if (settings.ttsEnabled) {
      handleSpeak();
    }

    return () => {
      speechReader.stop();
    };
  }, [currentQuestion.id, currentTurn]);

  // Handle timer countdown
  useEffect(() => {
    if (settings.timerSeconds === 0 || isAnswered) return;

    if (timeLeft <= 0) {
      handleOptionSelect(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1 && settings.soundEnabled) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, settings.timerSeconds]);

  const handleSpeak = () => {
    setIsSpeaking(true);
    // Read English question first, then Hindi translation
    const textToRead = `${currentQuestion.question}. ${currentQuestion.questionHindi}`;
    speechReader.speak(textToRead, () => {
      setIsSpeaking(false);
    });
  };

  const handleOpenYouTube = (query: string) => {
    soundManager.playTap();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (isAnswered) return;

      speechReader.stop();
      setIsSpeaking(false);
      setSelectedOption(index);
      setIsAnswered(true);

      const isCorrect = index === currentQuestion.correctIndex;
      const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      if (isCorrect) {
        soundManager.playCorrect();
        if (activePlayer.streak >= 2) {
          setTimeout(() => soundManager.playStreak(), 200);
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }
      } else {
        soundManager.playWrong();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(150);
        }
      }

      onAnswerSubmitted({
        question: currentQuestion,
        playerId: currentTurn,
        playerName: activePlayer.name,
        selectedOption: index,
        isCorrect,
        timeSpent,
      });
    },
    [isAnswered, currentQuestion, startTime, activePlayer, currentTurn, onAnswerSubmitted]
  );

  const isClass1 = activePlayer.level === 1;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* Top Progress Bar & NCERT Chapter */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
              Round {roundNumber} / {totalRounds}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {currentQuestion.subject}
            </span>
          </div>

          {/* Streak indicator */}
          {activePlayer.streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-black text-orange-400 bg-orange-500/20 px-2.5 py-1 rounded-xl border border-orange-500/40 animate-pulse">
              <Flame size={14} />
              <span>{activePlayer.streak} Streak!</span>
            </div>
          )}
        </div>

        {/* NCERT Chapter Tag */}
        {currentQuestion.ncertChapter && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <BookOpen size={12} className="text-indigo-400" />
            <span className="truncate">{currentQuestion.ncertChapter}</span>
          </div>
        )}
      </div>

      {/* Active Kid Turn Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all shadow-xl ${
          isClass1
            ? 'bg-gradient-to-r from-pink-950/80 via-purple-950/70 to-slate-900 border-pink-500/50 shadow-pink-500/10'
            : 'bg-gradient-to-r from-sky-950/80 via-indigo-950/70 to-slate-900 border-sky-500/50 shadow-sky-500/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce-slow">
              {activePlayer.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {activePlayer.name}'s Turn!
                </h3>
                <span
                  className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border ${
                    isClass1
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                >
                  Class {activePlayer.level} NCERT
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {activePlayer.name === 'Ahil'
                  ? '🌱 Ahil: Age 6 (Class 1 Easy Words)'
                  : '🚀 Ammeya: Age 8 (Class 3 NCERT)'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              ⭐ {activePlayer.score}
            </span>
            <span className="block text-[10px] text-slate-400 font-bold">Stars</span>
          </div>
        </div>

        {/* Timer Bar */}
        {settings.timerSeconds > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-400">Time</span>
              <span
                className={`font-black ${
                  timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-amber-300'
                }`}
              >
                ⏱️ {timeLeft}s
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5
                    ? 'bg-red-500'
                    : timeLeft <= 10
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${(timeLeft / settings.timerSeconds) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700 flex-shrink-0">
              {currentQuestion.icon || '❓'}
            </span>
            <div className="space-y-1">
              {/* Simple English Question */}
              <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </p>
              {/* Hindi Translation */}
              <p className="text-sm sm:text-base font-semibold text-amber-300 leading-snug">
                {currentQuestion.questionHindi}
              </p>
              {/* Urdu Translation if present */}
              {currentQuestion.questionUrdu && (
                <p className="text-sm sm:text-base font-bold text-emerald-300 leading-snug" dir="rtl">
                  {currentQuestion.questionUrdu}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {/* Interactive Voice Assistant */}
            <VoiceAssistant
              currentQuestion={currentQuestion}
              childName={activePlayer.name}
            />

            <div className="flex items-center gap-1.5 mt-1">
              {/* Voice Read Aloud Button */}
              <button
                onClick={handleSpeak}
                aria-label="Read Question Aloud"
                title="Listen to question"
                className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                  isSpeaking
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Volume2 size={18} />
              </button>

              {/* YouTube Video Hint Button */}
              <button
                onClick={() => handleOpenYouTube(currentQuestion.youtubeQuery)}
                title="Watch video hint on YouTube"
                className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black flex items-center gap-1 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
              >
                <Video size={13} />
                <span>Video Hint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippet if present */}
        {currentQuestion.codeSnippet && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto whitespace-pre">
            {currentQuestion.codeSnippet}
          </div>
        )}

        {/* Text Hint button */}
        {currentQuestion.hint && !isAnswered && (
          <div>
            <button
              onClick={() => {
                setShowHint(!showHint);
                soundManager.playTap();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400/90 hover:text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20 active:scale-95 transition-all"
            >
              <Lightbulb size={14} />
              <span>{showHint ? 'Hide Hint' : 'Need a Text Hint?'}</span>
            </button>
            {showHint && (
              <p className="mt-2 text-xs sm:text-sm text-amber-200/90 bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 italic">
                💡 {currentQuestion.hint}
              </p>
            )}
          </div>
        )}

        {/* 4 Large Touch-Friendly Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let optionStyle =
              'bg-slate-800/90 hover:bg-slate-750 text-slate-100 border-slate-700 active:scale-98';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle =
                  'bg-emerald-900/90 text-emerald-200 border-emerald-500 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30 animate-wiggle';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'bg-rose-900/90 text-rose-200 border-rose-500 opacity-90';
              } else {
                optionStyle = 'bg-slate-900/60 text-slate-500 border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(idx)}
                className={`min-h-[58px] sm:min-h-[64px] px-4 py-3 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-between text-left transition-all ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center text-xs font-black text-slate-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="break-words">{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && <CheckCircle2 className="text-emerald-400" size={20} />}
                    {isSelected && !isCorrect && <XCircle className="text-rose-400" size={20} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer Explanation, NCERT Activity & YouTube Video Card */}
      {isAnswered && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              <h4 className="text-sm font-black text-white">
                {selectedOption === currentQuestion.correctIndex ? '🎉 शाबाश! Awesome Job!' : '💡 Learning Moment:'}
              </h4>
            </div>

            {/* Direct YouTube Video Button */}
            <button
              onClick={() => handleOpenYouTube(currentQuestion.youtubeQuery)}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Video size={14} />
              <span>Watch on YouTube</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-slate-200 leading-relaxed font-semibold">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.explanationHindi && (
              <p className="text-amber-300 leading-relaxed">
                {currentQuestion.explanationHindi}
              </p>
            )}
          </div>

          {/* NCERT Hands-on Activity */}
          {currentQuestion.activityTip && (
            <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200">
              <span className="font-bold text-amber-300 block mb-0.5">
                🎨 NCERT Fun Activity / खेल-खेल में सीखें:
              </span>
              <span>{currentQuestion.activityTip}</span>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playTap();
              onNextTurn();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
          >
            <span>Pass Phone / Next Turn</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
