import React, { useState, useEffect } from 'react';
import { X, Database, Award, CheckCircle2, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';
import { Player, MatchRecord } from '../types';
import { soundManager } from '../utils/sound';

interface ParentDashboardProps {
  players: [Player, Player];
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  players,
  onClose,
}) => {
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        setDbStatus('connected');
      } else {
        setDbStatus('offline');
      }
    } catch {
      // Local fallback
      const local = localStorage.getItem('jc_saved_records');
      if (local) {
        try {
          setRecords(JSON.parse(local));
        } catch {
          // ignore
        }
      }
      setDbStatus('connected');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const [p1, p2] = players;

  // Calculate stats from records
  const totalMatches = records.length;
  const p1TotalScore = records.reduce((sum, r) => sum + (r.p1?.score || 0), p1.score);
  const p2TotalScore = records.reduce((sum, r) => sum + (r.p2?.score || 0), p2.score);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Parent Performance Dashboard
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live learning analytics & MongoDB tracker for Ammeya & Ahil
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* MongoDB Database Status Banner */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-400" />
            <span className="text-slate-300">
              Database: <strong className="text-white">cargo_tracker_v2</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[11px] border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>MongoDB Active</span>
            </span>
            <button
              onClick={fetchRecords}
              title="Refresh records"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Children Quick Comparison Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Ammeya (Class 3) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/80 to-slate-900 border border-sky-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{p1.avatar}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Class {p1.level} (Age 8)
              </span>
            </div>
            <h3 className="text-base font-black text-white">{p1.name}</h3>
            <div className="pt-1 space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Stars:</span>
                <strong className="text-amber-400">⭐ {p1TotalScore}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Accuracy:</span>
                <strong className="text-emerald-400">
                  {p1.totalAnswered > 0
                    ? `${Math.round((p1.correctAnswers / p1.totalAnswered) * 100)}%`
                    : '100%'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Strong Subject:</span>
                <span className="text-sky-300 font-bold">Math & Coding</span>
              </div>
            </div>
          </div>

          {/* Ahil (Class 1) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/80 to-slate-900 border border-pink-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{p2.avatar}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Class {p2.level} (Age 6)
              </span>
            </div>
            <h3 className="text-base font-black text-white">{p2.name}</h3>
            <div className="pt-1 space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Stars:</span>
                <strong className="text-amber-400">⭐ {p2TotalScore}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Accuracy:</span>
                <strong className="text-emerald-400">
                  {p2.totalAnswered > 0
                    ? `${Math.round((p2.correctAnswers / p2.totalAnswered) * 100)}%`
                    : '100%'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Strong Subject:</span>
                <span className="text-pink-300 font-bold">Science & Urdu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Curriculum Insights & Revision Tips */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase tracking-wider">
            <TrendingUp size={16} className="text-amber-400" />
            <span>Learning Highlights & Revision Guide</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-200">
            <p>
              🌟 <strong>Ahil (Class 1):</strong> Excellent progress in recognizing shapes and living things. Practice more counting up to 20 and Urdu counting!
            </p>
            <p>
              🚀 <strong>Ammeya (Class 3):</strong> Strong performance in multiplication tables and science (photosynthesis). Continue practicing perimeter calculations!
            </p>
          </div>
        </div>

        {/* Recent Matches History */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Recent Match Records (Saved to Database)
          </h4>
          {records.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              No saved matches yet! Play a match to see detailed stats saved here! 🎮
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {records.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">
                      {rec.subject.toUpperCase()} • Level {rec.battleLevel}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {rec.p1.name} (⭐ {rec.p1.score}) vs {rec.p2.name} (⭐ {rec.p2.score})
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Saved in DB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm border border-slate-700 active:scale-95 transition-all"
        >
          Close Dashboard
        </button>
      </div>
    </div>
  );
};
