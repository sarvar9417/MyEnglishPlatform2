import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  BookOpen,
  Play,
  Target,
  Flame,
  Zap,
  Heart,
  ChevronRight,
  Check,
  X,
  Lock,
  Star,
  Trophy,
  RefreshCw,
  Volume2,
  Clock
} from 'lucide-react';

const Practice = () => {
  const { user } = useAuth();

  // User stats state
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    hearts: 5,
    completedLessons: 0,
    totalLessons: 40
  });
  const [dailyGoal] = useState(15); // XP per day goal
  const [todayXP, setTodayXP] = useState(0);

  // Lesson state
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [lessonQuestions, setLessonQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);

  // Vocabulary from storage
  const [vocabulary, setVocabulary] = useState([]);

  const levels = [
    { id: 1, name: 'Basic', icon: '🇦', lessons: 8, color: '#10B981' },
    { id: 2, name: 'Intermediate', icon: '🇧', lessons: 8, color: '#F59E0B' },
    { id: 3, name: 'Advanced', icon: '🇨', lessons: 8, color: '#EF4444' },
    { id: 4, name: 'Expert', icon: '🇩', lessons: 8, color: '#8B5CF6' },
    { id: 5, name: 'Master', icon: '🇪', lessons: 8, color: '#EC4899' },
  ];

  const lessonTypes = [
    { id: 'vocabulary', name: 'Lug\'at', icon: BookOpen, xp: 10 },
    { id: 'translate', name: 'Tarjima', icon: Zap, xp: 12 },
    { id: 'listen', name: 'Eshitish', icon: Volume2, xp: 15 },
    { id: 'speak', name: 'Gapirish', icon: Target, xp: 20 },
  ];

  useEffect(() => {
    loadUserStats();
    loadVocabulary();
  }, [user]);

  useEffect(() => {
    if (vocabulary.length > 0 && activeLesson) {
      generateLessonQuestions();
    }
  }, [activeLesson, vocabulary]);

  const loadUserStats = async () => {
    // Load from localStorage for now
    const savedStats = localStorage.getItem('duolingo_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Check daily streak
    const lastPractice = localStorage.getItem('last_practice_date');
    const today = new Date().toDateString();
    if (lastPractice !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPractice === yesterday.toDateString()) {
        // Continue streak
        const currentStreak = parseInt(localStorage.getItem('streak') || '0');
        setStats(prev => ({ ...prev, streak: currentStreak }));
      } else {
        // Reset streak
        localStorage.setItem('streak', '0');
        setStats(prev => ({ ...prev, streak: 0 }));
      }
    }

    // Check today's XP
    const todayXPData = localStorage.getItem('today_xp');
    const xpDate = localStorage.getItem('xp_date');
    if (xpDate === today) {
      setTodayXP(parseInt(todayXPData || '0'));
    }
  };

  const loadVocabulary = async () => {
    let words = [];

    if (user) {
      const { data } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user.id);
      words = data || [];
    } else {
      const saved = localStorage.getItem('vocabulary');
      if (saved) words = JSON.parse(saved);
    }

    if (words.length === 0) {
      // Default words for practice
      words = [
        { word: 'hello', translation: 'salom', example: 'Hello, how are you?' },
        { word: 'goodbye', translation: 'xayr', example: 'Goodbye, see you later!' },
        { word: 'thank you', translation: 'rahmat', example: 'Thank you for helping me.' },
        { word: 'please', translation: 'iltimos', example: 'Please help me.' },
        { word: 'yes', translation: 'ha', example: 'Yes, I understand.' },
        { word: 'no', translation: 'yo\'q', example: 'No, I don\'t know.' },
        { word: 'water', translation: 'suv', example: 'I want to drink water.' },
        { word: 'food', translation: 'ovqat', example: 'The food is delicious.' },
        { word: 'house', translation: 'uy', example: 'My house is big.' },
        { word: 'book', translation: 'kitob', example: 'I read a book every day.' },
        { word: 'friend', translation: 'do\'st', example: 'He is my best friend.' },
        { word: 'family', translation: 'oilа', example: 'My family lives in Tashkent.' },
        { word: 'work', translation: 'ish', example: 'I go to work every morning.' },
        { word: 'school', translation: 'maktab', example: 'Children go to school.' },
        { word: 'time', translation: 'vaqt', example: 'What time is it?' },
      ];
    }

    setVocabulary(words);
  };

  const generateLessonQuestions = () => {
    const questions = [];
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 10);

    selectedWords.forEach((word, index) => {
      const type = index % 4;

      if (type === 0) {
        // Translation to English
        questions.push({
          type: 'translate_en',
          question: `${word.translation} so'zini inglizchaga tarjima qiling`,
          answer: word.word,
          word: word
        });
      } else if (type === 1) {
        // Translation to Uzbek
        questions.push({
          type: 'translate_uz',
          question: `Translate to Uzbek: "${word.word}"`,
          answer: word.translation,
          word: word
        });
      } else if (type === 2) {
        // Fill in the blank
        questions.push({
          type: 'fillblank',
          question: `Complete: "${word.example.replace(word.word, '_____')}"`,
          answer: word.word,
          word: word
        });
      } else {
        // Multiple choice (words meaning)
        const wrongAnswers = vocabulary
          .filter(w => w.word !== word.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.translation);

        const options = [word.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);

        questions.push({
          type: 'multiple',
          question: `What is the meaning of "${word.word}"?`,
          answer: word.translation,
          options: options,
          word: word
        });
      }
    });

    setLessonQuestions(questions);
  };

  const startLesson = (level, type) => {
    setActiveLesson({ level, type });
    setLessonProgress(0);
    setCurrentQuestion(0);
    setUserAnswer('');
    setShowResult(false);
    setLessonFinished(false);
  };

  const checkAnswer = () => {
    if (!lessonQuestions[currentQuestion]) return;

    const currentQ = lessonQuestions[currentQuestion];
    const userAns = userAnswer.trim().toLowerCase();
    const correctAns = currentQ.answer.toLowerCase();

    let correct = false;

    if (currentQ.type === 'multiple') {
      correct = userAns === correctAns;
    } else {
      correct = userAns === correctAns ||
        correctAns.includes(userAns) ||
        userAns.includes(correctAns);
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Add XP
      const xpGain = 10;
      setStats(prev => {
        const newStats = { ...prev, xp: prev.xp + xpGain };
        localStorage.setItem('duolingo_stats', JSON.stringify(newStats));
        return newStats;
      });

      // Update today XP
      const newTodayXP = todayXP + xpGain;
      setTodayXP(newTodayXP);
      localStorage.setItem('today_xp', newTodayXP.toString());
      localStorage.setItem('xp_date', new Date().toDateString());

      // Update streak
      localStorage.setItem('last_practice_date', new Date().toDateString());
      localStorage.setItem('streak', (stats.streak + 1).toString());
    } else {
      // Lose heart
      setStats(prev => {
        const newStats = { ...prev, hearts: Math.max(0, prev.hearts - 1) };
        localStorage.setItem('duolingo_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < lessonQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
      setLessonProgress(((currentQuestion + 1) / lessonQuestions.length) * 100);
    } else {
      setLessonFinished(true);
      // Update completed lessons
      setStats(prev => {
        const newStats = { ...prev, completedLessons: prev.completedLessons + 1 };
        localStorage.setItem('duolingo_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  };

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  if (stats.hearts <= 0) {
    return (
      <div className="practice-page">
        <div className="no-hearts">
          <Heart size={64} className="heart-icon" />
          <h2>Yuraklar tugadi!</h2>
          <p>Siz barcha yuraklaringizni ishlatdingiz. Yana olish uchun:</p>
          <button className="btn-primary" onClick={() => setStats(prev => ({ ...prev, hearts: 5 }))}>
            <Heart size={18} /> Yuraklarni tiklash (bepul)
          </button>
        </div>
      </div>
    );
  }

  if (activeLesson && !lessonFinished) {
    const currentQ = lessonQuestions[currentQuestion];

    return (
      <div className="practice-page">
        <div className="lesson-view">
          {/* Lesson Header */}
          <div className="lesson-header">
            <button className="close-lesson" onClick={() => setActiveLesson(null)}>
              <X size={24} />
            </button>
            <div className="lesson-progress">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${lessonProgress}%` }}></div>
              </div>
              <span>{currentQuestion + 1}/{lessonQuestions.length}</span>
            </div>
            <div className="lesson-xp">
              <Zap size={16} /> +{10}
            </div>
          </div>

          {/* Question */}
          <div className="question-section">
            <h2>{currentQ?.question}</h2>

            {currentQ?.type === 'multiple' && (
              <div className="options-grid">
                {currentQ.options.map((option, i) => (
                  <button
                    key={i}
                    className={`option-btn ${userAnswer === option ? 'selected' : ''}`}
                    onClick={() => setUserAnswer(option)}
                    disabled={showResult}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ?.type !== 'multiple' && (
              <div className="answer-input">
                <input
                  type="text"
                  placeholder="Javobingizni yozing..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showResult}
                />
                {currentQ?.type === 'translate_en' && (
                  <button className="speak-btn" onClick={() => speakWord(userAnswer)}>
                    <Volume2 size={20} />
                  </button>
                )}
              </div>
            )}

            {currentQ?.word?.example && !showResult && (
              <div className="example-hint">
                <span>Misol:</span> {currentQ.word.example}
              </div>
            )}

            {showResult && (
              <div className={`result-banner ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? (
                  <>
                    <Check size={24} />
                    <span>To'g'ri!</span>
                  </>
                ) : (
                  <>
                    <X size={24} />
                    <span>Noto'g'ri</span>
                  </>
                )}
              </div>
            )}

            {!showResult ? (
              <button
                className="btn-primary check-btn"
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
              >
                Tekshirish
              </button>
            ) : (
              <button className="btn-primary check-btn" onClick={nextQuestion}>
                {currentQuestion < lessonQuestions.length - 1 ? 'Keyingi' : 'Darsni tugatish'}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        <style>{`
          .practice-page {
            min-height: 100vh;
            padding: 20px;
          }

          .lesson-view {
            max-width: 600px;
            margin: 0 auto;
          }

          .lesson-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
          }

          .close-lesson {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 8px;
          }

          .lesson-progress {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .lesson-progress .progress-bar {
            flex: 1;
            height: 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            overflow: hidden;
          }

          .lesson-progress span {
            font-size: 14px;
            color: var(--text-secondary);
          }

          .lesson-xp {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #FBBF24;
            font-weight: 600;
          }

          .question-section {
            text-align: center;
          }

          .question-section h2 {
            font-size: 24px;
            margin-bottom: 32px;
            color: var(--text-primary);
          }

          .options-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 32px;
          }

          .option-btn {
            padding: 16px 24px;
            background: var(--surface);
            border: 2px solid #2A3A5C;
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .option-btn:hover {
            border-color: var(--secondary);
          }

          .option-btn.selected {
            border-color: var(--secondary);
            background: rgba(139, 92, 246, 0.2);
          }

          .answer-input {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .answer-input input {
            flex: 1;
            padding: 16px;
            background: var(--surface);
            border: 2px solid #2A3A5C;
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 18px;
          }

          .speak-btn {
            padding: 16px;
            background: var(--surface);
            border: 2px solid #2A3A5C;
            border-radius: 12px;
            color: var(--secondary);
            cursor: pointer;
          }

          .example-hint {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 24px;
          }

          .example-hint span {
            color: var(--accent-primary);
          }

          .result-banner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-size: 18px;
            font-weight: 600;
          }

          .result-banner.correct {
            background: rgba(110, 231, 183, 0.2);
            color: var(--success);
          }

          .result-banner.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error);
          }

          .check-btn {
            width: 100%;
            max-width: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
        `}</style>
      </div>
    );
  }

  if (lessonFinished) {
    return (
      <div className="practice-page">
        <div className="lesson-complete card">
          <div className="complete-icon">
            <Trophy size={64} />
          </div>
          <h2>Dars muvaffaqiyatli!</h2>
          <p>Siz {lessonQuestions.length} ta savoldan o'tdingiz</p>

          <div className="complete-stats">
            <div className="stat">
              <Zap size={24} />
              <span>+{lessonQuestions.length * 10} XP</span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setActiveLesson(null)}>
            <ChevronRight size={18} /> Davom etish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <div className="page-inner">
        {/* Header Stats */}
        <div className="stats-bar">
          <div className="stat-item streak">
            <Flame size={20} />
            <span>{stats.streak}</span>
          </div>
          <div className="stat-item xp">
            <Zap size={20} />
            <span>{stats.xp}</span>
          </div>
          <div className="stat-item hearts">
            <Heart size={20} />
            <span>{stats.hearts}</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="daily-goal card">
          <div className="goal-header">
            <span>Kunlik maqsad</span>
            <span>{todayXP} / {dailyGoal} XP</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min((todayXP / dailyGoal) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Levels */}
        <div className="levels-section">
          <h2>Darsliklar</h2>
          <div className="levels-grid">
            {levels.map(level => (
              <div key={level.id} className="level-card card">
                <div className="level-header" style={{ borderColor: level.color }}>
                  <span className="level-icon">{level.icon}</span>
                  <div className="level-info">
                    <h3>{level.name}</h3>
                    <span>{level.lessons} dars</span>
                  </div>
                </div>

                <div className="lessons-list">
                  {Array.from({ length: Math.min(level.lessons, 4) }).map((_, i) => (
                    <button
                      key={i}
                      className="lesson-btn"
                      onClick={() => startLesson(level, lessonTypes[i % 4])}
                    >
                      <Play size={16} />
                      <span>{lessonTypes[i % 4].name}</span>
                      <span className="lesson-xp">+{lessonTypes[i % 4].xp} XP</span>
                    </button>
                  ))}
                  {level.lessons > 4 && (
                    <button className="more-lessons">
                      <Lock size={14} />
                      <span>{level.lessons - 4} more</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Section */}
        <div className="practice-section">
          <h2>Mashq qilish</h2>
          <div className="practice-grid">
            <button className="practice-card card" onClick={() => startLesson({ name: 'Practice' }, 'vocabulary')}>
              <BookOpen size={32} />
              <h3>Lug'at mashqi</h3>
              <p>So'zlarni takrorlash</p>
            </button>
            <button className="practice-card card" onClick={() => startLesson({ name: 'Practice' }, 'translate')}>
              <Target size={32} />
              <h3>Tarjima mashqi</h3>
              <p>Gaplarni tarjima qilish</p>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .practice-page {
          min-height: 100vh;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--surface);
          border-radius: 20px;
          font-weight: 600;
        }

        .stat-item.streak { color: #F97316; }
        .stat-item.xp { color: #FBBF24; }
        .stat-item.hearts { color: #EF4444; }

        .daily-goal {
          padding: 20px;
          margin-bottom: 32px;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .levels-section, .practice-section {
          margin-bottom: 40px;
        }

        .levels-section h2, .practice-section h2 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .levels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .level-card {
          padding: 20px;
        }

        .level-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid;
          margin-bottom: 16px;
        }

        .level-icon {
          font-size: 32px;
        }

        .level-info h3 {
          font-size: 18px;
          margin: 0;
        }

        .level-info span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lesson-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .lesson-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .lesson-btn span {
          flex: 1;
        }

        .lesson-xp {
          font-size: 12px;
          color: #FBBF24 !important;
        }

        .more-lessons {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 1px dashed #2A3A5C;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .practice-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .practice-card {
          padding: 24px;
          text-align: center;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .practice-card:hover {
          border-color: var(--secondary);
        }

        .practice-card svg {
          color: var(--accent-primary);
          margin-bottom: 12px;
        }

        .practice-card h3 {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .practice-card p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .no-hearts {
          text-align: center;
          padding: 60px 20px;
        }

        .no-hearts .heart-icon {
          color: var(--error);
          margin-bottom: 24px;
        }

        .no-hearts h2 {
          margin-bottom: 12px;
        }

        .no-hearts p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .lesson-complete {
          max-width: 400px;
          margin: 100px auto;
          text-align: center;
          padding: 40px;
        }

        .complete-icon {
          color: #FBBF24;
          margin-bottom: 24px;
        }

        .lesson-complete h2 {
          margin-bottom: 8px;
        }

        .lesson-complete p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .complete-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .complete-stats .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FBBF24;
          font-size: 20px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .practice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Practice;