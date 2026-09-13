import React from 'react';
import { SubjectId, GameMode, Player, Level } from '../types';
import { soundManager } from '../utils/sound';
import { Swords, Smartphone, UserCheck, Sparkles, BookOpen, Video, Award } from 'lucide-react';

interface SubjectSelectorProps {
  players: [Player, Player];
  selectedMode: GameMode;
  battleLevel: Level;
  onChangeBattleLevel: (level: Level) => void;
  onSelectMode: (mode: GameMode) => void;
  onStartQuiz: (subject: SubjectId) => void;
  onSoloPractice: (level: Level, subject: SubjectId) => void;
}

interface SubjectCardDef {
  id: SubjectId;
  title: string;
  hindiTitle: string;
  emoji: string;
  gradient: string;
  border: string;
  tag: string;
  description: string;
}

const SUBJECTS: SubjectCardDef[] = [
  {
    id: 'all',
    title: 'NCERT Grand Tournament',
    hindiTitle: 'महासंग्राम (All Subjects)',
    emoji: '👑',
    gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
    border: 'border-amber-500/40 hover:border-amber-400',
    tag: 'ALL 5 SUBJECTS 🔥',
    description: 'A surprise mix of Math, English, Hindi, Coding & Science with Video Hints!'
  },
  {
    id: 'math',
    title: 'NCERT Math Quest',
    hindiTitle: 'गणित की चुनौती (Math-Magic)',
    emoji: '🔢',
    gradient: 'from-blue-600/20 via-cyan-600/20 to-teal-600/20',
    border: 'border-blue-500/40 hover:border-blue-400',
    tag: 'MATH-MAGIC 🧮',
    description: 'Shapes, addition & counting for Ahil vs Tables, division & perimeter for Ammeya'
  },
  {
    id: 'english',
    title: 'Simple English Wordcraft',
    hindiTitle: 'सरल अंग्रेज़ी (Mridang & Marigold)',
    emoji: '📖',
    gradient: 'from-purple-600/20 via-pink-600/20 to-rose-600/20',
    border: 'border-purple-500/40 hover:border-purple-400',
    tag: 'EASY WORDS 🔤',
    description: 'Short easy English words with Hindi translations + Rhymes and Opposites'
  },
  {
    id: 'hindi',
    title: 'Hindi Gyan (रिमझिम / सारंगी)',
    hindiTitle: 'हिंदी ज्ञान भंडार',
    emoji: '🇮🇳',
    gradient: 'from-orange-600/20 via-amber-600/20 to-yellow-600/20',
    border: 'border-orange-500/40 hover:border-orange-400',
    tag: 'NCERT RIMJHIM',
    description: 'वर्णमाला, पशु-पक्षी (Class 1) vs विलोम, पर्यायवाची व मुहावरे (Class 3)'
  },
  {
    id: 'coding',
    title: 'Junior Coding & Robot Logic',
    hindiTitle: 'कंप्यूटर और कोडिंग',
    emoji: '💻',
    gradient: 'from-emerald-600/20 via-green-600/20 to-lime-600/20',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    tag: 'FUTURE SKILLS 🤖',
    description: 'Robot directions & parts (Class 1) vs Loops, CPU & algorithms (Class 3)'
  },
  {
    id: 'science',
    title: 'NCERT Natural Science / EVS',
    hindiTitle: 'प्राकृतिक विज्ञान (आस-पास)',
    emoji: '🌿',
    gradient: 'from-teal-600/20 via-emerald-600/20 to-cyan-600/20',
    border: 'border-teal-500/40 hover:border-teal-400',
    tag: 'LOOKING AROUND 🌍',
    description: 'Living things & 5 senses (Class 1) vs Poonam\'s Day Out & photosynthesis (Class 3)'
  },
];

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  players,
  selectedMode,
  battleLevel,
  onChangeBattleLevel,
  onSelectMode,
  onStartQuiz,
  onSoloPractice,
}) => {
  const ammeyaLevel = battleLevel;
  const ahilLevel = Math.max(1, (battleLevel - 2) as Level) as Level;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Sibling Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/70 via-purple-900/60 to-pink-900/70 p-5 sm:p-7 border border-indigo-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black tracking-wide border border-amber-400/30">
                <Sparkles size={14} /> 2-LEVEL FAIR GAP ACTIVE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30">
                <Video size={13} /> YouTube Video Hints Included
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ammeya vs Ahil: NCERT Clash!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Simple English + हिंदी translations for every question, with real NCERT textbook activities & YouTube animations!
            </p>
          </div>

          {/* Kids Face-off Badges */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/60 p-3 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl animate-wiggle">{players[0].avatar}</span>
              <span className="text-xs font-black text-sky-400 max-w-[80px] truncate">{players[0].name}</span>
              <span className="text-[10px] text-amber-400 font-black">Level {ammeyaLevel} (Class {ammeyaLevel})</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                VS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl animate-wiggle">{players[1].avatar}</span>
              <span className="text-xs font-black text-pink-400 max-w-[80px] truncate">{players[1].name}</span>
              <span className="text-[10px] text-emerald-400 font-black">Level {ahilLevel} (Class {ahilLevel})</span>
            </div>
          </div>
        </div>
      </div>

      {/* NCERT Level Selector (Level 1 to Level 5) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={18} />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Choose Match Level (1 to 5)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Rule: Ahil is always 2 levels behind Ammeya!
          </span>
        </div>

        {/* Level Buttons 1 to 5 */}
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as Level[]).map((lvl) => {
            const isSelected = battleLevel === lvl;
            const ahilCal = Math.max(1, lvl - 2);
            return (
              <button
                key={lvl}
                onClick={() => {
                  onChangeBattleLevel(lvl);
                  soundManager.playTap();
                }}
                className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-600 to-purple-700 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="text-xs sm:text-sm font-black">Level {lvl}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-300">Class {lvl}</span>
                <span className="text-[8px] sm:text-[9px] text-amber-300 mt-0.5">
                  Ahil: Cl {ahilCal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Handicap Preview Card */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300">
            🎯 <strong>Ammeya:</strong> Class {ammeyaLevel} NCERT Questions
          </span>
          <span className="text-emerald-400 font-bold">
            🌱 <strong>Ahil:</strong> Class {ahilLevel} NCERT Questions (2 Classes Gap)
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="space-y-2">
        <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block px-1">
          Select Game Mode
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => {
              onSelectMode('battle');
              soundManager.playTap();
            }}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all active:scale-95 ${
              selectedMode === 'battle'
                ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Smartphone size={22} className={selectedMode === 'battle' ? 'text-amber-300' : ''} />
            <span className="text-xs sm:text-sm font-black text-center">Pass & Play</span>
            <span className="text-[10px] text-slate-300/80 hidden sm:inline">Turn by Turn</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('split');
              soundManager.playTap();
            }}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all active:scale-95 ${
              selectedMode === 'split'
                ? 'bg-gradient-to-b from-purple-600 to-purple-800 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Swords size={22} className={selectedMode === 'split' ? 'text-pink-300' : ''} />
            <span className="text-xs sm:text-sm font-black text-center">Split Screen</span>
            <span className="text-[10px] text-slate-300/80 hidden sm:inline">Dual Buzzer</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('practice');
              soundManager.playTap();
            }}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all active:scale-95 ${
              selectedMode === 'practice'
                ? 'bg-gradient-to-b from-teal-600 to-teal-800 text-white border-teal-400 shadow-lg shadow-teal-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <UserCheck size={22} className={selectedMode === 'practice' ? 'text-teal-300' : ''} />
            <span className="text-xs sm:text-sm font-black text-center">Solo Practice</span>
            <span className="text-[10px] text-slate-300/80 hidden sm:inline">Single Child</span>
          </button>
        </div>
      </div>

      {/* Solo Practice Quick Picker */}
      {selectedMode === 'practice' && (
        <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-3">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
            <BookOpen size={18} />
            <span>Who is practicing today?</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSoloPractice(ammeyaLevel, 'all')}
              className="p-3 rounded-xl bg-slate-800/90 border border-sky-500/40 hover:bg-sky-950/50 flex items-center gap-2 text-left transition-all active:scale-95"
            >
              <span className="text-2xl">{players[0].avatar}</span>
              <div>
                <p className="text-xs font-bold text-sky-300">{players[0].name}</p>
                <p className="text-[10px] text-slate-400">Class {ammeyaLevel} Practice</p>
              </div>
            </button>
            <button
              onClick={() => onSoloPractice(ahilLevel, 'all')}
              className="p-3 rounded-xl bg-slate-800/90 border border-pink-500/40 hover:bg-pink-950/50 flex items-center gap-2 text-left transition-all active:scale-95"
            >
              <span className="text-2xl">{players[1].avatar}</span>
              <div>
                <p className="text-xs font-bold text-pink-300">{players[1].name}</p>
                <p className="text-[10px] text-slate-400">Class {ahilLevel} Practice</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Subject Cards Grid */}
      <div className="space-y-3">
        <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block px-1">
          Choose NCERT Subject
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {SUBJECTS.map((sub) => (
            <div
              key={sub.id}
              onClick={() => {
                soundManager.playTap();
                onStartQuiz(sub.id);
              }}
              className={`group cursor-pointer rounded-2xl p-4 bg-gradient-to-br ${sub.gradient} bg-slate-900 border ${sub.border} shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-3xl p-2 rounded-xl bg-slate-950/40 border border-white/5">
                    {sub.emoji}
                  </span>
                  <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-slate-950/70 text-amber-300 border border-amber-500/20">
                    {sub.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  {sub.title}
                </h3>
                <p className="text-xs text-slate-300 font-semibold mb-1.5">
                  {sub.hindiTitle}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black text-white/90">
                <span>Start Match ➔</span>
                <span className="text-amber-400 text-xs">Ammeya & Ahil Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
