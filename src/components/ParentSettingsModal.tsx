import React, { useState } from 'react';
import { X, Clock, Award, Volume2, Mic, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react';
import { GameSettings } from '../types';
import { soundManager } from '../utils/sound';

interface ParentSettingsModalProps {
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onResetScores: () => void;
  onClose: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  settings,
  onSave,
  onResetScores,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [showCurriculum, setShowCurriculum] = useState(false);

  const handleSave = () => {
    soundManager.playTap();
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-amber-400" size={24} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Parent Controls & Settings</h2>
            <p className="text-xs text-slate-400">Tailor the quiz environment to your children</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Rounds per battle */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
              <Award size={16} className="text-amber-400" />
              <span>Questions per Match</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5, 8, 12].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setLocalSettings({ ...localSettings, totalRounds: count });
                    soundManager.playTap();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                    localSettings.totalRounds === count
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {count} Rounds
                </button>
              ))}
            </div>
          </div>

          {/* Timer Mode */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
              <Clock size={16} className="text-sky-400" />
              <span>Answer Timer</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Casual (No Timer)', value: 0 },
                { label: 'Standard (20s)', value: 20 },
                { label: 'Blitz (12s)', value: 12 },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setLocalSettings({ ...localSettings, timerSeconds: item.value });
                    soundManager.playTap();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black border text-center transition-all ${
                    localSettings.timerSeconds === item.value
                      ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              💡 Tip: Use Casual Mode for younger kids to think without anxiety.
            </p>
          </div>

          {/* Audio Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setLocalSettings({
                  ...localSettings,
                  soundEnabled: !localSettings.soundEnabled,
                });
                soundManager.playTap();
              }}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                localSettings.soundEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 size={18} />
                <span className="text-xs font-bold">Sound Effects</span>
              </div>
              <span className="text-xs font-black">
                {localSettings.soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                setLocalSettings({
                  ...localSettings,
                  ttsEnabled: !localSettings.ttsEnabled,
                });
                soundManager.playTap();
              }}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                localSettings.ttsEnabled
                  ? 'bg-pink-950/60 border-pink-500/50 text-pink-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic size={18} />
                <span className="text-xs font-bold">Read Aloud</span>
              </div>
              <span className="text-xs font-black">
                {localSettings.ttsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Syllabus Guide Toggle */}
          <div className="border border-slate-700 rounded-2xl p-3 bg-slate-950/60">
            <button
              onClick={() => setShowCurriculum(!showCurriculum)}
              className="w-full flex items-center justify-between text-xs font-black text-amber-400"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>What are my kids learning? (Curriculum Guide)</span>
              </div>
              <span>{showCurriculum ? '▲' : '▼'}</span>
            </button>

            {showCurriculum && (
              <div className="mt-3 space-y-3 text-xs divide-y divide-slate-800 pt-2">
                <div className="space-y-1">
                  <h4 className="font-black text-pink-400">Ahil (Age 6 • Class 1 NCERT):</h4>
                  <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px]">
                    <li><strong>Math (Math-Magic):</strong> Addition under 20, subtraction, round vs flat shapes, counting.</li>
                    <li><strong>English (Mridang):</strong> Phonics, sight words, rhyming words, opposites, simple words.</li>
                    <li><strong>Hindi (सारंगी/रिमझिम):</strong> वर्णमाला (स्वर, व्यंजन), पशु-पक्षी, फलों के नाम, सरल विलोम.</li>
                    <li><strong>Coding:</strong> Direction arrows (UP, DOWN, LEFT, RIGHT), robot navigation.</li>
                    <li><strong>Science:</strong> Living vs non-living, 5 senses (eyes, nose, ears), day & night sky.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-black text-sky-400">Ammeya (Age 8 • Class 3 NCERT):</h4>
                  <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px]">
                    <li><strong>Math (Math-Magic):</strong> Multiplication tables, division, perimeter of square, place values.</li>
                    <li><strong>English (Marigold):</strong> Parts of speech (verbs, nouns), spellings, irregular plurals.</li>
                    <li><strong>Hindi (रिमझिम):</strong> संज्ञा पहचान, विलोम, पर्यायवाची, सरल मुहावरे (नौ दो ग्यारह होना).</li>
                    <li><strong>Coding:</strong> Repeat loops, geometry drawing, CPU = Brain of computer, debugging.</li>
                    <li><strong>Science (Looking Around):</strong> Poonam's Day Out, plant fairy, chlorophyll, food chain.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Reset Scores */}
          <button
            onClick={() => {
              if (window.confirm('Reset both kids scores to 0?')) {
                onResetScores();
                soundManager.playTap();
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 border border-rose-600/30 text-rose-300 hover:bg-rose-900/40 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Reset Match Scores</span>
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
