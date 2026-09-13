import { useState, useEffect } from 'react';
import { Player, SubjectId, GameMode, GameSettings, AnswerLog, Question, Level, MatchRecord } from './types';
import { Header } from './components/Header';
import { SubjectSelector } from './components/SubjectSelector';
import { BattleArena } from './components/BattleArena';
import { SplitBattleArena } from './components/SplitBattleArena';
import { PracticeMode } from './components/PracticeMode';
import { VictoryModal } from './components/VictoryModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { ParentSettingsModal } from './components/ParentSettingsModal';
import { ParentDashboard } from './components/ParentDashboard';
import { MannersHub } from './components/MannersHub';
import { getQuestionForPlayer } from './data/dynamicQuestions';
import { soundManager } from './utils/sound';
import { speechReader } from './utils/speech';

const DEFAULT_PLAYERS: [Player, Player] = [
  {
    id: 'p1',
    name: 'Ammeya',
    age: 8,
    level: 3, // Class 3
    avatar: '🚀',
    color: 'sky',
    bgGradient: 'from-sky-500 to-indigo-600',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    totalAnswered: 0,
  },
  {
    id: 'p2',
    name: 'Ahil',
    age: 6,
    level: 1, // Class 1
    avatar: '🦁',
    color: 'pink',
    bgGradient: 'from-pink-500 to-purple-600',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    totalAnswered: 0,
  },
];

const DEFAULT_SETTINGS: GameSettings = {
  battleLevel: 3, // Ammeya at Level 3, Ahil at Level 1 (2 levels gap)
  totalRounds: 5,
  timerSeconds: 0, // Casual untimed by default for peaceful learning
  soundEnabled: true,
  ttsEnabled: true,
  speechRate: 0.85,
};

export function App() {
  const [players, setPlayers] = useState<[Player, Player]>(() => {
    const saved = localStorage.getItem('jc_players_ncert');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PLAYERS;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('jc_settings_ncert');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('jc_players_ncert', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('jc_settings_ncert', JSON.stringify(settings));
    soundManager.enabled = settings.soundEnabled;
    speechReader.enabled = settings.ttsEnabled;
  }, [settings]);

  // Modals
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);
  const [isMannersHubOpen, setIsMannersHubOpen] = useState(false);

  // Game flow
  const [gameMode, setGameMode] = useState<GameMode>('battle');
  const [currentSubject, setCurrentSubject] = useState<SubjectId>('all');
  const [gameState, setGameState] = useState<'home' | 'battle' | 'split' | 'practice' | 'victory'>('home');

  // Battle session state
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerLogs, setAnswerLogs] = useState<AnswerLog[]>([]);

  // Split mode state
  const [splitP1Q, setSplitP1Q] = useState<Question | null>(null);
  const [splitP2Q, setSplitP2Q] = useState<Question | null>(null);

  // Practice state
  const [practiceLevel, setPracticeLevel] = useState<Level>(1);
  const [practiceSubject, setPracticeSubject] = useState<SubjectId>('all');

  // Calculate calibrated levels (Ahil is always 2 levels behind Ammeya)
  const ammeyaLevel = settings.battleLevel;
  const ahilLevel = Math.max(1, (settings.battleLevel - 2) as Level) as Level;

  // Change battle level
  const handleChangeBattleLevel = (lvl: Level) => {
    const ahilLvl = Math.max(1, (lvl - 2) as Level) as Level;
    setSettings((s) => ({ ...s, battleLevel: lvl }));
    setPlayers((prev) => [
      { ...prev[0], level: lvl },
      { ...prev[1], level: ahilLvl },
    ]);
  };

  // Save match results to MongoDB
  const saveMatchRecord = async (finalPlayers: [Player, Player], logs: AnswerLog[]) => {
    const matchRecord: MatchRecord = {
      subject: currentSubject,
      battleLevel: settings.battleLevel,
      totalRounds: settings.totalRounds,
      p1: {
        name: finalPlayers[0].name,
        level: finalPlayers[0].level,
        score: finalPlayers[0].score,
        correctAnswers: finalPlayers[0].correctAnswers,
        totalAnswered: finalPlayers[0].totalAnswered,
      },
      p2: {
        name: finalPlayers[1].name,
        level: finalPlayers[1].level,
        score: finalPlayers[1].score,
        correctAnswers: finalPlayers[1].correctAnswers,
        totalAnswered: finalPlayers[1].totalAnswered,
      },
      logs,
      createdAt: new Date().toISOString(),
    };

    // 1. Cache to local storage
    try {
      const local = JSON.parse(localStorage.getItem('jc_saved_records') || '[]');
      local.unshift(matchRecord);
      localStorage.setItem('jc_saved_records', JSON.stringify(local.slice(0, 50)));
    } catch {
      // ignore
    }

    // 2. Post to MongoDB
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchRecord),
      });
    } catch (err) {
      console.warn('[MongoDB] Saved to local cache:', err);
    }
  };

  // Start Battle Match
  const handleStartBattle = (subject: SubjectId) => {
    if (subject === 'manners') {
      setIsMannersHubOpen(true);
      return;
    }

    setCurrentSubject(subject);
    const newUsed = new Set<string>();
    setUsedIds(newUsed);
    setRoundNumber(1);
    setAnswerLogs([]);

    // Reset scores & ensure levels are calibrated
    setPlayers((prev) => [
      { ...prev[0], level: ammeyaLevel, score: 0, streak: 0, correctAnswers: 0, totalAnswered: 0 },
      { ...prev[1], level: ahilLevel, score: 0, streak: 0, correctAnswers: 0, totalAnswered: 0 },
    ]);

    if (gameMode === 'battle') {
      setCurrentTurn('p1');
      const q = getQuestionForPlayer(ammeyaLevel, subject, newUsed);
      newUsed.add(q.id);
      setCurrentQuestion(q);
      setGameState('battle');
    } else if (gameMode === 'split') {
      const q1 = getQuestionForPlayer(ammeyaLevel, subject, newUsed);
      newUsed.add(q1.id);
      const q2 = getQuestionForPlayer(ahilLevel, subject, newUsed);
      newUsed.add(q2.id);
      setSplitP1Q(q1);
      setSplitP2Q(q2);
      setGameState('split');
    }
  };

  // Start Solo Practice
  const handleStartPractice = (level: Level, subject: SubjectId) => {
    setPracticeLevel(level);
    setPracticeSubject(subject);
    setGameState('practice');
  };

  // Answer Submitted
  const handleAnswerSubmitted = (log: AnswerLog) => {
    setAnswerLogs((prev) => [...prev, log]);

    setPlayers((prev) => {
      const pIndex = log.playerId === 'p1' ? 0 : 1;
      const target = prev[pIndex];
      const streakBonus = log.isCorrect ? target.streak * 5 : 0;
      const pointsEarned = log.isCorrect ? 10 + streakBonus : 0;

      const updated = {
        ...target,
        score: target.score + pointsEarned,
        streak: log.isCorrect ? target.streak + 1 : 0,
        correctAnswers: target.correctAnswers + (log.isCorrect ? 1 : 0),
        totalAnswered: target.totalAnswered + 1,
      };

      if (pIndex === 0) {
        return [updated, prev[1]];
      } else {
        return [prev[0], updated];
      }
    });
  };

  // Next Turn
  const handleNextTurn = () => {
    if (currentTurn === 'p1') {
      // Switch to Ahil (Younger child)
      setCurrentTurn('p2');
      const nextQ = getQuestionForPlayer(ahilLevel, currentSubject, usedIds);
      usedIds.add(nextQ.id);
      setCurrentQuestion(nextQ);
    } else {
      // Ahil finished turn -> check if round ended
      if (roundNumber >= settings.totalRounds) {
        saveMatchRecord(players, answerLogs);
        setGameState('victory');
      } else {
        setRoundNumber((r) => r + 1);
        setCurrentTurn('p1');
        const nextQ = getQuestionForPlayer(ammeyaLevel, currentSubject, usedIds);
        usedIds.add(nextQ.id);
        setCurrentQuestion(nextQ);
      }
    }
  };

  // Split both answered
  const handleSplitBothAnswered = (p1Log: AnswerLog, p2Log: AnswerLog) => {
    const updatedLogs = [...answerLogs, p1Log, p2Log];
    setAnswerLogs(updatedLogs);

    const updatedPlayers: [Player, Player] = [
      {
        ...players[0],
        score: players[0].score + (p1Log.isCorrect ? 10 : 0),
        correctAnswers: players[0].correctAnswers + (p1Log.isCorrect ? 1 : 0),
        totalAnswered: players[0].totalAnswered + 1,
      },
      {
        ...players[1],
        score: players[1].score + (p2Log.isCorrect ? 10 : 0),
        correctAnswers: players[1].correctAnswers + (p2Log.isCorrect ? 1 : 0),
        totalAnswered: players[1].totalAnswered + 1,
      },
    ];
    setPlayers(updatedPlayers);

    if (roundNumber >= settings.totalRounds) {
      saveMatchRecord(updatedPlayers, updatedLogs);
      setGameState('victory');
    } else {
      setRoundNumber((r) => r + 1);
      const q1 = getQuestionForPlayer(ammeyaLevel, currentSubject, usedIds);
      usedIds.add(q1.id);
      const q2 = getQuestionForPlayer(ahilLevel, currentSubject, usedIds);
      usedIds.add(q2.id);
      setSplitP1Q(q1);
      setSplitP2Q(q2);
    }
  };

  const handleResetScores = () => {
    setPlayers((prev) => [
      { ...prev[0], score: 0, streak: 0, correctAnswers: 0, totalAnswered: 0 },
      { ...prev[1], score: 0, streak: 0, correctAnswers: 0, totalAnswered: 0 },
    ]);
  };

  // Add bonus stars from Good Manners class
  const handleAddMannerStars = (stars: number) => {
    setPlayers((prev) => [
      { ...prev[0], score: prev[0].score + stars },
      { ...prev[1], score: prev[1].score + stars },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-reading">
      <Header
        players={players}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
        onOpenParentDashboard={() => setIsParentDashboardOpen(true)}
        onOpenManners={() => setIsMannersHubOpen(true)}
        inGame={gameState === 'battle' || gameState === 'split'}
        onExitGame={() => setGameState('home')}
      />

      <main className="flex-1 pb-8">
        {gameState === 'home' && (
          <SubjectSelector
            players={players}
            selectedMode={gameMode}
            battleLevel={settings.battleLevel}
            onChangeBattleLevel={handleChangeBattleLevel}
            onSelectMode={(mode) => setGameMode(mode)}
            onStartQuiz={(sub) => handleStartBattle(sub)}
            onSoloPractice={(lvl, s) => handleStartPractice(lvl, s)}
          />
        )}

        {gameState === 'battle' && currentQuestion && (
          <BattleArena
            players={players}
            currentTurn={currentTurn}
            roundNumber={roundNumber}
            totalRounds={settings.totalRounds}
            currentQuestion={currentQuestion}
            settings={settings}
            onAnswerSubmitted={handleAnswerSubmitted}
            onNextTurn={handleNextTurn}
          />
        )}

        {gameState === 'split' && splitP1Q && splitP2Q && (
          <SplitBattleArena
            players={players}
            roundNumber={roundNumber}
            totalRounds={settings.totalRounds}
            p1Question={splitP1Q}
            p2Question={splitP2Q}
            onBothAnswered={handleSplitBothAnswered}
          />
        )}

        {gameState === 'practice' && (
          <PracticeMode
            initialLevel={practiceLevel}
            initialSubject={practiceSubject}
            playerName={practiceLevel === ammeyaLevel ? players[0].name : players[1].name}
            avatar={practiceLevel === ammeyaLevel ? players[0].avatar : players[1].avatar}
            settings={settings}
            onExit={() => setGameState('home')}
          />
        )}
      </main>

      {gameState === 'victory' && (
        <VictoryModal
          players={players}
          logs={answerLogs}
          onPlayAgain={() => handleStartBattle(currentSubject)}
          onGoHome={() => setGameState('home')}
        />
      )}

      {/* Profiles Modal */}
      {isProfilesOpen && (
        <ProfileSetupModal
          players={players}
          onSave={(updated) => setPlayers(updated)}
          onClose={() => setIsProfilesOpen(false)}
        />
      )}

      {/* Parent Settings Modal */}
      {isSettingsOpen && (
        <ParentSettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onResetScores={handleResetScores}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Parent MongoDB Analytics Dashboard */}
      {isParentDashboardOpen && (
        <ParentDashboard
          players={players}
          onClose={() => setIsParentDashboardOpen(false)}
        />
      )}

      {/* Moral Stories & Good Manners Hub */}
      {isMannersHubOpen && (
        <MannersHub
          onClose={() => setIsMannersHubOpen(false)}
          onAddStars={handleAddMannerStars}
        />
      )}
    </div>
  );
}

export default App;
