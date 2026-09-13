import { Question, Level, SubjectId } from '../types';
import { ncertQuestions } from './ncertQuestions';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate dynamic addition/subtraction for Level 1 (Class 1)
function generateDynamicMathLevel1(): Question {
  const isAdd = Math.random() > 0.4;
  const id = `dyn_l1_math_${Date.now()}_${Math.random()}`;

  if (isAdd) {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 7) + 1;
    const correct = a + b;
    const wrong1 = correct + 1;
    const wrong2 = Math.max(1, correct - 1);
    const wrong3 = correct + 2;
    const options = shuffleArray([correct.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()]);

    return {
      id,
      subject: 'math',
      level: 1,
      question: `What is ${a} + ${b}? 🧮`,
      questionHindi: `${a} + ${b} कितना होता है?`,
      options,
      correctIndex: options.indexOf(correct.toString()),
      explanation: `${a} and ${b} makes ${correct}! Great counting! ⭐`,
      explanationHindi: `${a} में ${b} जोड़ने पर ${correct} बनते हैं! शाबाश! ⭐`,
      hint: `Start at ${a} and count forward ${b} numbers!`,
      icon: '➕',
      ncertChapter: 'NCERT Class 1 Math Ch 3: Addition (जोड़)',
      activityTip: 'Activity: Count with pebbles or fingers! 🖐️',
      youtubeQuery: 'NCERT Class 1 Math Addition for kids cartoon'
    };
  } else {
    const a = Math.floor(Math.random() * 6) + 4; // 4 to 9
    const b = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const correct = a - b;
    const wrong1 = correct + 1;
    const wrong2 = Math.max(1, correct - 1);
    const wrong3 = correct + 2;
    const options = shuffleArray([correct.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()]);

    return {
      id,
      subject: 'math',
      level: 1,
      question: `What is ${a} - ${b}? 🎈`,
      questionHindi: `${a} - ${b} कितना होता है?`,
      options,
      correctIndex: options.indexOf(correct.toString()),
      explanation: `If you have ${a} candies and give away ${b}, you have ${correct} left! 🍬`,
      explanationHindi: `${a} में से ${b} घटाने पर ${correct} बचते हैं!`,
      hint: `Count backwards ${b} steps from ${a}!`,
      icon: '➖',
      ncertChapter: 'NCERT Class 1 Math Ch 4: Subtraction (घटाव)',
      activityTip: 'Activity: Remove ${b} items from a group of ${a}! 🧱',
      youtubeQuery: 'NCERT Class 1 Math Subtraction for kids cartoon'
    };
  }
}

// Generate dynamic multiplication/division for Level 3 (Class 3)
function generateDynamicMathLevel3(): Question {
  const isMult = Math.random() > 0.4;
  const id = `dyn_l3_math_${Date.now()}_${Math.random()}`;

  if (isMult) {
    const a = Math.floor(Math.random() * 7) + 3; // 3 to 9
    const b = Math.floor(Math.random() * 7) + 2; // 2 to 8
    const correct = a * b;
    const wrong1 = correct + a;
    const wrong2 = Math.max(1, correct - b);
    const wrong3 = (a + 1) * b;
    const options = shuffleArray([correct.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()]);

    return {
      id,
      subject: 'math',
      level: 3,
      question: `What is ${a} × ${b}? (Multiplication) ✖️`,
      questionHindi: `${a} × ${b} कितना होता है? (गुणा)`,
      options,
      correctIndex: options.indexOf(correct.toString()),
      explanation: `${a} times ${b} is ${correct}! Multiplication wizard! 🏆`,
      explanationHindi: `${a} का पहाड़ा ${b} बार पढ़ने पर ${correct} आता है! ✖️`,
      hint: `Recall your ${a} times table!`,
      icon: '✖️',
      ncertChapter: 'NCERT Class 3 Math Ch 9: How Many Times? (पहाड़े)',
      activityTip: `Activity: Draw ${a} groups of ${b} dots on paper! ✏️`,
      youtubeQuery: `NCERT Class 3 Math Table of ${a} animation for kids`
    };
  } else {
    const divisor = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const quotient = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const dividend = divisor * quotient;
    const correct = quotient;
    const wrong1 = quotient + 1;
    const wrong2 = Math.max(1, quotient - 1);
    const wrong3 = quotient + 2;
    const options = shuffleArray([correct.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()]);

    return {
      id,
      subject: 'math',
      level: 3,
      question: `What is ${dividend} ÷ ${divisor}? (Division) ➗`,
      questionHindi: `${dividend} ÷ ${divisor} कितना होता है? (भाग)`,
      options,
      correctIndex: options.indexOf(correct.toString()),
      explanation: `${dividend} divided by ${divisor} is ${correct}, because ${divisor} × ${correct} = ${dividend}!`,
      explanationHindi: `${divisor} × ${correct} = ${dividend}, इसलिए भागफल ${correct} है! ➗`,
      hint: `What number multiplied by ${divisor} gives ${dividend}?`,
      icon: '➗',
      ncertChapter: 'NCERT Class 3 Math Ch 12: Can We Share? (बंटवारा)',
      activityTip: 'Activity: Share ${dividend} buttons equally among ${divisor} friends! 🔘',
      youtubeQuery: 'NCERT Class 3 Math Can We Share division for kids'
    };
  }
}

// Generate dynamic question based on level
export function getQuestionForPlayer(level: Level, subject: SubjectId, usedIds: Set<string>): Question {
  // 30% chance for fresh dynamic arithmetic on math or all
  const useDynamic = Math.random() < 0.3 && (subject === 'math' || subject === 'all');

  if (useDynamic) {
    if (level === 1) return generateDynamicMathLevel1();
    if (level >= 3) return generateDynamicMathLevel3();
  }

  // Filter from curated NCERT questions
  let filtered = ncertQuestions.filter((q) => {
    const matchesSubject = subject === 'all' || q.subject === subject;
    const matchesLevel = q.level === level;
    return matchesSubject && matchesLevel;
  });

  // If none match exact level, fallback to nearest level
  if (filtered.length === 0) {
    filtered = ncertQuestions.filter((q) => subject === 'all' || q.subject === subject);
  }

  // Exclude already used questions in this battle
  let available = filtered.filter((q) => !usedIds.has(q.id));
  if (available.length === 0) {
    available = filtered;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  return chosen;
}
