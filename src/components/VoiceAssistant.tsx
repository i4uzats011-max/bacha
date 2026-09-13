import React, { useState } from 'react';
import { Volume2, Sparkles, X, MessageSquare, Bot } from 'lucide-react';
import { Question } from '../types';
import { speechReader } from '../utils/speech';
import { soundManager } from '../utils/sound';

interface VoiceAssistantProps {
  currentQuestion: Question;
  childName: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentQuestion,
  childName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  const handleExplain = (lang: 'en' | 'hi' | 'ur') => {
    soundManager.playTap();
    setIsSpeaking(true);
    let explanation = '';

    if (lang === 'hi') {
      explanation = `नमस्ते ${childName}! सुनो, सवाल पूछ रहा है: ${currentQuestion.questionHindi}. इसका मतलब है: ${currentQuestion.explanationHindi || currentQuestion.explanation}. तुम यह कर सकते हो!`;
    } else if (lang === 'ur') {
      explanation = `پیارے ${childName}! سوال ہے: ${currentQuestion.questionUrdu || currentQuestion.questionHindi}. اس کا مطلب ہے: ${currentQuestion.explanationUrdu || currentQuestion.explanation}. شاباش کوشش کرو!`;
    } else {
      explanation = `Hey ${childName}! Here is an easy explanation: ${currentQuestion.question}. Hint: ${currentQuestion.hint || currentQuestion.explanation}. You are super smart, choose the best option!`;
    }

    setSpokenText(explanation);
    speechReader.speak(explanation, () => {
      setIsSpeaking(false);
    });
  };

  const handleStop = () => {
    speechReader.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="relative">
      {/* Mascot Trigger Button */}
      <button
        onClick={() => {
          soundManager.playTap();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all animate-bounce-slow"
      >
        <span className="text-base">🤖</span>
        <span>Voice Explainer</span>
      </button>

      {/* Pop-up Explainer Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                  {isSpeaking ? '🗣️' : '🤖'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    <span>Gyanu Ustad (Voice Helper)</span>
                    <Sparkles size={14} className="text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-amber-300 font-bold">
                    Helping {childName} understand easily!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleStop();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Speaking Status / Animation */}
            {isSpeaking && (
              <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Volume2 size={16} className="animate-pulse text-amber-400" />
                  <span>Speaking aloud to {childName}...</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
                  "{spokenText}"
                </p>
                <button
                  onClick={handleStop}
                  className="text-[10px] font-bold text-rose-400 hover:underline pt-1 block"
                >
                  ⏹️ Stop Speaking
                </button>
              </div>
            )}

            {/* Choose Language to Explain */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-slate-400 block">
                Tap to hear voice explanation:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExplain('en')}
                  className="p-2.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-200 text-xs font-black flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <span>🇬🇧 English</span>
                  <span className="text-[9px] text-slate-400">Simple Words</span>
                </button>
                <button
                  onClick={() => handleExplain('hi')}
                  className="p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-xs font-black flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <span>🇮🇳 हिंदी</span>
                  <span className="text-[9px] text-slate-400">सरल भाषा</span>
                </button>
                <button
                  onClick={() => handleExplain('ur')}
                  className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-black flex flex-col items-center gap-1 active:scale-95 transition-all"
                >
                  <span>🇵🇰 اردو</span>
                  <span className="text-[9px] text-slate-400">آسان الفاظ</span>
                </button>
              </div>
            </div>

            {/* Hint Box */}
            {currentQuestion.hint && (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="font-bold text-amber-300 block mb-0.5">💡 Quick Hint:</span>
                <span>{currentQuestion.hint}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
