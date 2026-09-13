import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import { Question, Level, SubjectId } from '../types';
import { soundManager } from '../utils/sound';

interface CustomQuestionModalProps {
  onClose: () => void;
  onQuestionsUpdated?: () => void;
}

export const CUSTOM_QUESTIONS_STORAGE_KEY = 'jc_custom_questions_user';

export function getStoredCustomQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const CustomQuestionModal: React.FC<CustomQuestionModalProps> = ({
  onClose,
  onQuestionsUpdated,
}) => {
  const [questions, setQuestions] = useState<Question[]>(() => getStoredCustomQuestions());
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('add');

  // Form State
  const [subject, setSubject] = useState<Exclude<SubjectId, 'all'>>('math');
  const [level, setLevel] = useState<Level>(1);
  const [questionHi, setQuestionHi] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanationHi, setExplanationHi] = useState('');
  const [hintHi, setHintHi] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    onQuestionsUpdated?.();
  }, [questions, onQuestionsUpdated]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionHi.trim() && !questionEn.trim()) {
      alert('कृपया प्रश्न दर्ज करें!');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      alert('कृपया सभी 4 विकल्प भरें!');
      return;
    }

    const newQ: Question = {
      id: `custom_q_${Date.now()}_${Math.random()}`,
      subject,
      level,
      question: questionEn.trim() || questionHi.trim(),
      questionHindi: questionHi.trim() || questionEn.trim(),
      options: options.map((opt) => opt.trim()),
      correctIndex,
      explanation: explanationHi.trim() || `Correct answer is option ${correctIndex + 1}!`,
      explanationHindi: explanationHi.trim() || `सही उत्तर विकल्प ${correctIndex + 1} है!`,
      hint: hintHi.trim() || 'ध्यान से सोचें!',
      icon: subject === 'math' ? '🔢' : subject === 'english' ? '📖' : subject === 'hindi' ? '🇮🇳' : '💡',
      ncertChapter: `Parent Custom Question (Class ${level})`,
      youtubeQuery: `${subject} lesson for kids`,
    };

    setQuestions((prev) => [newQ, ...prev]);
    soundManager.playCorrect();

    // Reset Form
    setQuestionHi('');
    setQuestionEn('');
    setOptions(['', '', '', '']);
    setExplanationHi('');
    setHintHi('');
    setSuccessMsg('✅ प्रश्न सफलतापूर्वक जुड़ गया!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('क्या आप इस प्रश्न को हटाना चाहते हैं?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      soundManager.playTap();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">📝</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">कस्टम प्रश्न बैंक (Custom Questions)</h2>
              <p className="text-xs text-slate-400">अपने मनपसंद प्रश्न जोड़ें और बच्चों से क्विज़ में पूछें!</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'add'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus size={16} />
            <span>नया प्रश्न जोड़ें (Add New)</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>सहेजे गए प्रश्न ({questions.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'add' ? (
            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs font-bold text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">विषय (Subject)</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Exclude<SubjectId, 'all'>)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="math">गणित (Math)</option>
                    <option value="english">अंग्रेज़ी (English)</option>
                    <option value="hindi">हिंदी (Hindi)</option>
                    <option value="science">विज्ञान / EVS (Science)</option>
                    <option value="coding">कंप्यूटर / कोडिंग (Coding)</option>
                    <option value="manners">अच्छी आदतें (Good Manners)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">कक्षा / स्तर (Class / Level)</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value) as Level)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value={1}>Class 1 (Ahil's Level)</option>
                    <option value={2}>Class 2</option>
                    <option value={3}>Class 3 (Ammeya's Level)</option>
                    <option value={4}>Class 4</option>
                    <option value={5}>Class 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">प्रश्न हिंदी में (Question in Hindi)</label>
                <input
                  type="text"
                  placeholder="जैसे: 7 + 5 कितना होता है? या भारत का राष्ट्रीय पक्षी कौन सा है?"
                  value={questionHi}
                  onChange={(e) => setQuestionHi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Question in English (वैकल्पिक / Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. What is 7 + 5? Or What is the national bird of India?"
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-slate-400">
                  4 विकल्प और सही उत्तर चुनें (Select radio button for Correct Answer)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        correctIndex === idx
                          ? 'border-emerald-500/60 bg-emerald-950/30'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={correctIndex === idx}
                        onChange={() => setCorrectIndex(idx)}
                        className="accent-emerald-500 cursor-pointer w-4 h-4"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        placeholder={`विकल्प ${idx + 1}`}
                        value={options[idx]}
                        onChange={(e) => {
                          const updated = [...options] as [string, string, string, string];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        className="bg-transparent w-full text-white text-xs outline-none placeholder:text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation & Hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">व्याख्या / Explanation</label>
                  <input
                    type="text"
                    placeholder="जैसे: 7 में 5 जोड़ने पर 12 होता है!"
                    value={explanationHi}
                    onChange={(e) => setExplanationHi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">संकेत / Hint</label>
                  <input
                    type="text"
                    placeholder="जैसे: 7 से आगे 5 गिनें!"
                    value={hintHi}
                    onChange={(e) => setHintHi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  <span>प्रश्न जोड़ें और सहेजें (Save Question)</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-400">
                  <HelpCircle className="mx-auto text-slate-600" size={36} />
                  <p className="text-sm font-bold">अभी तक कोई कस्टम प्रश्न नहीं जोड़ा गया है।</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="text-xs text-indigo-400 hover:underline font-bold"
                  >
                    + पहला प्रश्न जोड़ें
                  </button>
                </div>
              ) : (
                questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-[10px]">
                          Class {q.level} • {q.subject.toUpperCase()}
                        </span>
                        <span className="text-slate-500 font-bold">#{i + 1}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{q.questionHindi}</p>
                      {q.question && q.question !== q.questionHindi && (
                        <p className="text-xs text-slate-400 italic">{q.question}</p>
                      )}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
                              idx === q.correctIndex
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {idx + 1}. {opt} {idx === q.correctIndex && '✓'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all"
                      title="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
