import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, ArrowRight, Lightbulb, CheckCircle2, XCircle, Home, Video, BookOpen } from 'lucide-react';
import { Level, SubjectId, Question, GameSettings } from '../types';
import { getQuestionForPlayer } from '../data/dynamicQuestions';
import { soundManager } from '../utils/sound';
import { speechReader } from '../utils/speech';

interface PracticeModeProps {
  initialLevel: Level;
  initialSubject: SubjectId;
  playerName: string;
  avatar: string;
  settings: GameSettings;
  onExit: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  initialLevel,
  initialSubject,
  playerName,
  avatar,
  settings,
  onExit,
}) => {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    getQuestionForPlayer(initialLevel, initialSubject, new Set())
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loadNextQuestion = useCallback(
    (lvl: Level, s: SubjectId, used: Set<string>) => {
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
      const nextQ = getQuestionForPlayer(lvl, s, used);
      setCurrentQuestion(nextQ);
      setUsedIds((prev) => new Set([...prev, nextQ.id]));

      if (settings.ttsEnabled) {
        setIsSpeaking(true);
        speechReader.speak(`${nextQ.question}. ${nextQ.questionHindi}`, () => setIsSpeaking(false));
      }
    },
    [settings.ttsEnabled]
  );

  useEffect(() => {
    return () => {
      speechReader.stop();
    };
  }, []);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    speechReader.stop();

    if (index === currentQuestion.correctIndex) {
      soundManager.playCorrect();
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    speechReader.speak(`${currentQuestion.question}. ${currentQuestion.questionHindi}`, () => {
      setIsSpeaking(false);
    });
  };

  const handleOpenYouTube = (query: string) => {
    soundManager.playTap();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Top Practice Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 active:scale-95"
        >
          <Home size={14} /> Back
        </button>

        {/* Level selection (1 to 5) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          {([1, 2, 3, 4, 5] as Level[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                loadNextQuestion(lvl, subject, usedIds);
                soundManager.playTap();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                level === lvl ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cl. {lvl}
            </button>
          ))}
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-2 text-xs font-black">
          <span className="text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
            ⭐ {score} pts
          </span>
          {streak > 1 && (
            <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded-xl border border-orange-400/20">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Solo Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/70 to-slate-900 border border-teal-500/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{avatar}</span>
          <div>
            <h3 className="text-base font-black text-white">
              {playerName}'s NCERT Practice (Class {level})
            </h3>
            <p className="text-xs text-teal-300">
              Take your time to learn with videos & activities! 🌱
            </p>
          </div>
        </div>

        {/* Subject quick badge */}
        <select
          value={subject}
          onChange={(e) => {
            const nextSub = e.target.value as SubjectId;
            setSubject(nextSub);
            loadNextQuestion(level, nextSub, usedIds);
            soundManager.playTap();
          }}
          className="bg-slate-800 text-xs font-bold text-amber-300 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="all">👑 All Subjects</option>
          <option value="math">🔢 Math</option>
          <option value="english">📖 English</option>
          <option value="hindi">🇮🇳 Hindi</option>
          <option value="coding">💻 Coding</option>
          <option value="science">🌿 Science</option>
        </select>
      </div>

      {/* NCERT Chapter */}
      {currentQuestion.ncertChapter && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-500/30">
          <BookOpen size={14} className="text-indigo-400" />
          <span>{currentQuestion.ncertChapter}</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">
              {currentQuestion.icon || '❓'}
            </span>
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </p>
              <p className="text-sm sm:text-base font-semibold text-amber-300 leading-snug">
                {currentQuestion.questionHindi}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button
              onClick={handleSpeak}
              aria-label="Read question"
              className={`p-2.5 sm:p-3 rounded-2xl transition-all flex-shrink-0 ${
                isSpeaking
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Volume2 size={20} />
            </button>

            <button
              onClick={() => handleOpenYouTube(currentQuestion.youtubeQuery)}
              title="Watch video on YouTube"
              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <Video size={13} />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Code Snippet if present */}
        {currentQuestion.codeSnippet && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto whitespace-pre">
            {currentQuestion.codeSnippet}
          </div>
        )}

        {/* Hint button */}
        {currentQuestion.hint && !isAnswered && (
          <div>
            <button
              onClick={() => {
                setShowHint(!showHint);
                soundManager.playTap();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400/90 hover:text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20"
            >
              <Lightbulb size={14} />
              <span>{showHint ? 'Hide Hint' : 'Need a Little Hint?'}</span>
            </button>
            {showHint && (
              <p className="mt-2 text-xs text-amber-200/90 bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 italic">
                💡 {currentQuestion.hint}
              </p>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let optionStyle = 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-750';
            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-900/90 text-emerald-200 border-emerald-500 ring-2 ring-emerald-400';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-rose-900/90 text-rose-200 border-rose-500';
              } else {
                optionStyle = 'bg-slate-900/60 text-slate-500 border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(idx)}
                className={`min-h-[56px] px-4 py-3 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-between text-left transition-all ${optionStyle}`}
              >
                <span>{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="text-emerald-400" size={20} />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="text-rose-400" size={20} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation, Activity & Next */}
      {isAnswered && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-teal-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-white">
              {selectedOption === currentQuestion.correctIndex ? '🎉 शाबाश! Well Done!' : '💡 Learning Concept:'}
            </h4>
            <button
              onClick={() => handleOpenYouTube(currentQuestion.youtubeQuery)}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Video size={14} />
              <span>Watch on YouTube</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold">
            {currentQuestion.explanation}
          </p>
          {currentQuestion.explanationHindi && (
            <p className="text-xs sm:text-sm text-amber-300 leading-relaxed">
              {currentQuestion.explanationHindi}
            </p>
          )}

          {currentQuestion.activityTip && (
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-xs text-teal-200">
              <span className="font-bold text-amber-300 block mb-0.5">
                🎨 NCERT Activity:
              </span>
              <span>{currentQuestion.activityTip}</span>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playTap();
              loadNextQuestion(level, subject, usedIds);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Next Practice Question</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
