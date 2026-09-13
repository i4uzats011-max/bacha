export type SubjectId = 'all' | 'math' | 'english' | 'hindi' | 'urdu' | 'coding' | 'science' | 'manners';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  hindiName: string;
  urduName: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
}

// Levels 1 to 5 correspond directly to NCERT Classes 1 to 5
export type Level = 1 | 2 | 3 | 4 | 5;

export interface Player {
  id: 'p1' | 'p2';
  name: string;
  age: number;
  level: Level; // Current Class / Level
  avatar: string;
  color: string;
  bgGradient: string;
  score: number;
  streak: number;
  correctAnswers: number;
  totalAnswered: number;
}

export interface Question {
  id: string;
  subject: Exclude<SubjectId, 'all'>;
  level: Level; // 1 = Class 1, 2 = Class 2, 3 = Class 3, 4 = Class 4, 5 = Class 5
  question: string; // Simple English
  questionHindi: string; // Clear Hindi translation
  questionUrdu?: string; // Clear Urdu translation (اردو رسم الخط)
  options: string[]; // Options
  correctIndex: number;
  explanation: string; // Simple English
  explanationHindi?: string;
  explanationUrdu?: string;
  hint?: string;
  icon?: string;
  ncertChapter?: string; // e.g. "NCERT Class 1 Math Ch 1: Shapes and Space"
  activityTip?: string; // Fun hands-on NCERT activity
  youtubeQuery: string; // Targeted search query for kid-friendly video lesson
  codeSnippet?: string;
}

export interface MoralStory {
  id: string;
  title: string;
  titleHindi: string;
  titleUrdu: string;
  category: 'respect' | 'truth' | 'sharing' | 'cleanliness' | 'table_manners' | 'polite_words';
  icon: string;
  summaryEn: string;
  summaryHi: string;
  summaryUr: string;
  moralEn: string;
  moralHi: string;
  moralUr: string;
  youtubeQuery: string;
  quizQuestion: Question;
}

export type GameMode = 'battle' | 'split' | 'practice' | 'puzzle';

export type MathOperation = 'add' | 'multiply' | 'subtract';

export interface PuzzleBubble {
  id: string;
  value: number;
  colorClass: string;
  isPopping?: boolean;
  isVanished?: boolean;
  delayIndex: number;
}

export interface GameSettings {
  battleLevel: Level; // Level chosen for elder child (Ammeya). Ahil gets max(1, battleLevel - 2)
  totalRounds: number;
  timerSeconds: number; // 0 = casual/relaxed, 15 = blitz, 25 = normal
  soundEnabled: boolean;
  ttsEnabled: boolean;
  speechRate: number;
}

export interface AnswerLog {
  question: Question;
  playerId: 'p1' | 'p2';
  playerName: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface MatchRecord {
  _id?: string;
  subject: SubjectId;
  battleLevel: Level;
  totalRounds: number;
  p1: {
    name: string;
    level: Level;
    score: number;
    correctAnswers: number;
    totalAnswered: number;
  };
  p2: {
    name: string;
    level: Level;
    score: number;
    correctAnswers: number;
    totalAnswered: number;
  };
  createdAt?: string;
  logs: AnswerLog[];
}
