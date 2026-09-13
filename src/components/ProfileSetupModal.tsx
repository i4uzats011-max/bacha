import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { soundManager } from '../utils/sound';

interface ProfileSetupModalProps {
  players: [Player, Player];
  onSave: (updatedPlayers: [Player, Player]) => void;
  onClose: () => void;
}

const AVATARS = [
  '🐯', '🚀', '🦄', '🦖', '🤖', '🦸', '🦁', '🐼', '🐬', '👑', '🌈', '⚡'
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  players,
  onSave,
  onClose,
}) => {
  const [p1Name, setP1Name] = useState(players[0].name);
  const [p1Avatar, setP1Avatar] = useState(players[0].avatar);

  const [p2Name, setP2Name] = useState(players[1].name);
  const [p2Avatar, setP2Avatar] = useState(players[1].avatar);

  const handleSave = () => {
    soundManager.playTap();
    onSave([
      {
        ...players[0],
        name: p1Name.trim() || 'Champion 1',
        avatar: p1Avatar,
      },
      {
        ...players[1],
        name: p2Name.trim() || 'Champion 2',
        avatar: p2Avatar,
      },
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-amber-400" size={24} />
          <h2 className="text-xl sm:text-2xl font-black text-white">Customize Competitors</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Set your children's real names and pick their favorite battle avatars!
        </p>

        <div className="space-y-6">
          {/* Elder Child - Class 3 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-600/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-sky-400">
                Elder Child • Age 8
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black border border-sky-500/30">
                Class 3 Questions 📘
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl p-2 rounded-2xl bg-sky-900/60 border border-sky-500/30 shadow-inner">
                {p1Avatar}
              </span>
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Name</label>
                <input
                  type="text"
                  value={p1Name}
                  maxLength={15}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-sky-400 text-sm"
                  placeholder="e.g. Ammeya"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Choose Avatar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setP1Avatar(av);
                      soundManager.playTap();
                    }}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                      p1Avatar === av
                        ? 'bg-sky-500 text-white ring-2 ring-sky-300 scale-110 shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Younger Child - Class 1 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-600/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-pink-400">
                Younger Child • Age 6
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black border border-pink-500/30">
                Class 1 Questions 📙
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl p-2 rounded-2xl bg-pink-900/60 border border-pink-500/30 shadow-inner">
                {p2Avatar}
              </span>
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Name</label>
                <input
                  type="text"
                  value={p2Name}
                  maxLength={15}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-pink-400 text-sm"
                  placeholder="e.g. Ahil"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Choose Avatar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setP2Avatar(av);
                      soundManager.playTap();
                    }}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                      p2Avatar === av
                        ? 'bg-pink-500 text-white ring-2 ring-pink-300 scale-110 shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Check size={20} />
          Save & Start Playing!
        </button>
      </div>
    </div>
  );
};
