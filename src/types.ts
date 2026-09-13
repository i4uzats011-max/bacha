export type SubjectId = 'all' | 'math' | 'english' | 'hindi' | 'coding' | 'science';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  hindiName: string;
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
  options: string[]; // Options (bilingual where applicable)
  correctIndex: number;
  explanation: string; // Kid-friendly explanation in simple words
  explanationHindi?: string;
  hint?: string;
  icon?: string;
  ncertChapter?: string; // e.g. "NCERT Class 1 Math Ch 1: Shapes and Space"
  activityTip?: string; // Fun hands-on NCERT activity
  youtubeQuery: string; // Targeted search query for kid-friendly video lesson
  codeSnippet?: string;
}

export type GameMode = 'battle' | 'split' | 'practice';

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
