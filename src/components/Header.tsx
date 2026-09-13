import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Settings as SettingsIcon, Users, BarChart3, Heart } from 'lucide-react';
import { Player, GameSettings } from '../types';
import { soundManager } from '../utils/sound';
import { speechReader } from '../utils/speech';

interface HeaderProps {
  players: [Player, Player];
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenSettings: () => void;
  onOpenProfiles: () => void;
  onOpenParentDashboard?: () => void;
  onOpenManners?: () => void;
  inGame?: boolean;
  onExitGame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  players,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenProfiles,
  onOpenParentDashboard,
  onOpenManners,
  inGame,
  onExitGame,
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    soundManager.enabled = next;
    onUpdateSettings({ soundEnabled: next });
    if (next) soundManager.playTap();
  };

  const toggleTts = () => {
    const next = !settings.ttsEnabled;
    speechReader.enabled = next;
    onUpdateSettings({ ttsEnabled: next });
    if (settings.soundEnabled) soundManager.playTap();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* App Title / Logo */}
        <div className="flex items-center gap-2">
          {inGame ? (
            <button
              onClick={() => {
                if (window.confirm('Leave current quiz battle?')) {
                  onExitGame?.();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-amber-400 border border-slate-700 active:scale-95 transition-all"
            >
              <span>🏠</span> Home
            </button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfiles}>
              <span className="text-2xl sm:text-3xl animate-bounce-slow">🏆</span>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
                  Junior Clash
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-tight">
                  Ammeya & Ahil • NCERT & Manners
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Players mini-status in game */}
        {inGame && (
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1 bg-sky-950/80 px-2 py-1 rounded-lg border border-sky-600/30 text-sky-300">
              <span>{players[0].avatar}</span>
              <span className="max-w-[70px] truncate">{players[0].name}</span>
              <span className="text-amber-400 ml-0.5">⭐ {players[0].score}</span>
            </div>
            <span className="text-slate-500 font-black text-xs">VS</span>
            <div className="flex items-center gap-1 bg-pink-950/80 px-2 py-1 rounded-lg border border-pink-600/30 text-pink-300">
              <span>{players[1].avatar}</span>
              <span className="max-w-[70px] truncate">{players[1].name}</span>
              <span className="text-amber-400 ml-0.5">⭐ {players[1].score}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Moral Stories & Manners Button */}
          {!inGame && onOpenManners && (
            <button
              onClick={() => {
                soundManager.playTap();
                onOpenManners();
              }}
              title="Moral Stories & Good Manners Class"
              className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/40 hover:bg-pink-500/30 transition-all active:scale-90 flex items-center gap-1"
            >
              <Heart size={16} className="text-pink-400 fill-pink-400" />
              <span className="text-xs font-bold hidden sm:inline">Manners</span>
            </button>
          )}

          {/* Parent MongoDB Performance Tracker */}
          {!inGame && onOpenParentDashboard && (
            <button
              onClick={() => {
                soundManager.playTap();
                onOpenParentDashboard();
              }}
              title="Parent Performance Tracker (MongoDB)"
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all active:scale-90 flex items-center gap-1"
            >
              <BarChart3 size={16} className="text-emerald-400" />
              <span className="text-xs font-bold hidden sm:inline">Tracker</span>
            </button>
          )}

          {/* Read Aloud (TTS) Toggle */}
          <button
            onClick={toggleTts}
            aria-label="Toggle Voice Read-Aloud"
            title={settings.ttsEnabled ? 'Voice Read-Aloud: ON' : 'Voice Read-Aloud: OFF'}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              settings.ttsEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {settings.ttsEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound Effects"
            title={settings.soundEnabled ? 'Sound FX: ON' : 'Sound FX: OFF'}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              settings.soundEnabled
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Edit Kids Button */}
          {!inGame && (
            <button
              onClick={onOpenProfiles}
              aria-label="Kids Profiles"
              title="Change Kids Names & Avatars"
              className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all active:scale-90"
            >
              <Users size={18} />
            </button>
          )}

          {/* Parent Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Quiz Settings & Parent Guide"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all active:scale-90"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
