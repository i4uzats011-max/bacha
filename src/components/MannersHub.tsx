import React, { useState } from 'react';
import { Heart, Video, Sparkles, X, CheckCircle2, ArrowRight, Volume2, BookOpen } from 'lucide-react';
import { moralStories } from '../data/moralStories';
import { MoralStory } from '../types';
import { soundManager } from '../utils/sound';
import { speechReader } from '../utils/speech';

interface MannersHubProps {
  onClose: () => void;
  onAddStars: (stars: number) => void;
}

export const MannersHub: React.FC<MannersHubProps> = ({ onClose, onAddStars }) => {
  const [selectedStory, setSelectedStory] = useState<MoralStory | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleOpenYouTube = (query: string) => {
    soundManager.playTap();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReadAloud = (story: MoralStory) => {
    soundManager.playTap();
    const text = `${story.title}. ${story.summaryEn}. Moral: ${story.moralEn}. ${story.titleHindi}. ${story.summaryHi}. ${story.titleUrdu}. ${story.summaryUr}.`;
    speechReader.speak(text);
  };

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null || !selectedStory) return;
    setSelectedAnswer(idx);
    setQuizCompleted(true);

    if (idx === selectedStory.quizQuestion.correctIndex) {
      soundManager.playCorrect();
      onAddStars(10);
    } else {
      soundManager.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-pink-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">💖</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Moral Stories & Good Manners Class
              </h2>
            </div>
            <p className="text-xs text-pink-300 font-bold mt-0.5">
              اخلاقی کہانیاں و آداب • नैतिक कहानियां व संस्कार (Hindi, English & Urdu)
            </p>
          </div>
          <button
            onClick={() => {
              speechReader.stop();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stories List View */}
        {!selectedStory ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Select a golden manner to watch animated stories and learn etiquettes together:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moralStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => {
                    soundManager.playTap();
                    setSelectedStory(story);
                    setSelectedAnswer(null);
                    setQuizCompleted(false);
                  }}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-pink-500/50 cursor-pointer transition-all active:scale-95 space-y-2 group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      {story.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      Watch & Learn
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-pink-300 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-amber-300 font-semibold">{story.titleHindi}</p>
                    <p className="text-xs text-emerald-300 font-bold mt-0.5" dir="rtl">
                      {story.titleUrdu}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-black text-pink-400">
                    <span>Open Class ➔</span>
                    <span className="text-amber-400">⭐ 10 Stars Quiz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Story Detail View with YouTube Launcher and Quiz */
          <div className="space-y-5">
            {/* Back Button */}
            <button
              onClick={() => {
                speechReader.stop();
                setSelectedStory(null);
              }}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 active:scale-95"
            >
              ← Back to All Stories
            </button>

            {/* Story Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-950/60 to-purple-950/60 border border-pink-500/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2.5 rounded-2xl bg-slate-900 border border-white/10">
                    {selectedStory.icon}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedStory.title}
                    </h3>
                    <p className="text-xs text-amber-300 font-bold">{selectedStory.titleHindi}</p>
                    <p className="text-xs text-emerald-300 font-bold" dir="rtl">
                      {selectedStory.titleUrdu}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleReadAloud(selectedStory)}
                  title="Listen to story summary"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Trilingual Summary */}
              <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <p className="text-slate-200 leading-relaxed font-semibold">
                  🇬🇧 <strong>English:</strong> {selectedStory.summaryEn}
                </p>
                <p className="text-amber-200 leading-relaxed font-semibold">
                  🇮🇳 <strong>हिंदी:</strong> {selectedStory.summaryHi}
                </p>
                <p className="text-emerald-200 leading-relaxed font-bold" dir="rtl">
                  🇵🇰 <strong>اردو:</strong> {selectedStory.summaryUr}
                </p>
              </div>

              {/* Moral of the story banner */}
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                <span>Golden Moral: {selectedStory.moralEn} ({selectedStory.moralHi})</span>
              </div>

              {/* Watch on YouTube Button */}
              <button
                onClick={() => handleOpenYouTube(selectedStory.youtubeQuery)}
                className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Video size={18} />
                <span>Watch Animated Cartoon Story on YouTube</span>
              </button>
            </div>

            {/* Mini Manner Quiz for Kids */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                <BookOpen size={16} />
                <span>Quick Manner Check (Earn 10 Stars ⭐)</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold text-white">
                  {selectedStory.quizQuestion.question}
                </p>
                <p className="text-xs text-amber-300 font-semibold">
                  {selectedStory.quizQuestion.questionHindi}
                </p>
                {selectedStory.quizQuestion.questionUrdu && (
                  <p className="text-xs text-emerald-300 font-bold" dir="rtl">
                    {selectedStory.quizQuestion.questionUrdu}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {selectedStory.quizQuestion.options.map((opt, i) => {
                  const isCorrect = i === selectedStory.quizQuestion.correctIndex;
                  const isSelected = selectedAnswer === i;
                  let btnClass = 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750';

                  if (selectedAnswer !== null) {
                    if (isCorrect) btnClass = 'bg-emerald-800 text-white border-emerald-500 ring-2 ring-emerald-400';
                    else if (isSelected) btnClass = 'bg-rose-800 text-white border-rose-500';
                    else btnClass = 'bg-slate-900/60 text-slate-500 border-slate-800';
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSelectAnswer(i)}
                      className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-bold text-left flex items-center justify-between transition-all active:scale-98 ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {quizCompleted && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
                  <p className="font-bold">
                    {selectedAnswer === selectedStory.quizQuestion.correctIndex ? '🎉 शाबाश! Very Well Done!' : '💡 Learning:'}
                  </p>
                  <p>{selectedStory.quizQuestion.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
