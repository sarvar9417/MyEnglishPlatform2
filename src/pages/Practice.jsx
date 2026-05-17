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
  Clock,
  Award,
  Crown,
  Medal,
  Shield
} from 'lucide-react';

const Practice = () => {
  const { user } = useAuth();

  // User stats state
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    hearts: 5,
    completedLessons: 0,
    totalLessons: 40,
    dailyGoal: 15,
    todayXP: 0
  });

  // Lesson progress state
  const [lessonProgress, setLessonProgress] = useState({});
  const [achievements, setAchievements] = useState([]);

  // Lesson state
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentLessonProgress, setCurrentLessonProgress] = useState(0);
  const [lessonQuestions, setLessonQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);

  // Vocabulary from storage
  const [vocabulary, setVocabulary] = useState([]);

  const levels = [
    { id: 1, name: 'Unit 1', icon: '🇦', lessons: 8, color: '#10B981', title: 'First Steps' },
    { id: 2, name: 'Unit 2', icon: '🇧', lessons: 8, color: '#F59E0B', title: 'Basics' },
    { id: 3, name: 'Unit 3', icon: '🇨', lessons: 8, color: '#EF4444', title: 'Everyday' },
    { id: 4, name: 'Unit 4', icon: '🇩', lessons: 8, color: '#8B5CF6', title: 'Travel' },
    { id: 5, name: 'Unit 5', icon: '🇪', lessons: 8, color: '#EC4899', title: 'Advanced' },
  ];

  const lessonTypes = [
    { id: 'vocabulary', name: 'Lug\'at', icon: BookOpen, xp: 10, type: 'vocab' },
    { id: 'translate', name: 'Tarjima', icon: Zap, xp: 12, type: 'translate' },
    { id: 'listen', name: 'Eshitish', icon: Volume2, xp: 15, type: 'listen' },
    { id: 'speak', name: 'Gapirish', icon: Target, xp: 20, type: 'speak' },
  ];

  // Badges/Achievements
  const badgeTypes = [
    { type: 'streak_7', name: '7 kun streak', icon: Flame, requirement: 7 },
    { type: 'streak_30', name: '30 kun streak', icon: Flame, requirement: 30 },
    { type: 'lessons_10', name: '10 dars', icon: BookOpen, requirement: 10 },
    { type: 'lessons_50', name: '50 dars', icon: BookOpen, requirement: 50 },
    { type: 'xp_100', name: '100 XP', icon: Zap, requirement: 100 },
    { type: 'xp_1000', name: '1000 XP', icon: Zap, requirement: 1000 },
    { type: 'perfect_5', name: '5 ta mukammal', icon: Star, requirement: 5 },
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
      checkDailyStreak();
    }
    loadVocabulary();
  }, [user]);

  useEffect(() => {
    if (vocabulary.length > 0 && activeLesson) {
      generateLessonQuestions();
    }
  }, [activeLesson, vocabulary]);

  const loadUserData = async () => {
    try {
      // Load user stats
      let { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!statsData) {
        // Create new stats if not exists
        const { data: newStats } = await supabase
          .from('user_stats')
          .insert([{
            user_id: user.id,
            xp: 0,
            streak: 0,
            hearts: 5,
            total_lessons_completed: 0,
            today_xp: 0,
            daily_goal: 15
          }])
          .select()
          .single();

        statsData = newStats;
      }

      // Check if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (statsData.last_practice_date !== today) {
        statsData.today_xp = 0;
      }

      setStats({
        xp: statsData.xp || 0,
        streak: statsData.streak || 0,
        hearts: statsData.hearts || 5,
        completedLessons: statsData.total_lessons_completed || 0,
        totalLessons: 40,
        dailyGoal: statsData.daily_goal || 15,
        todayXP: statsData.today_xp || 0
      });

      // Load lesson progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      const progressMap = {};
      progressData?.forEach(p => {
        const key = `${p.level_id}-${p.lesson_type}-${p.lesson_index}`;
        progressMap[key] = p;
      });
      setLessonProgress(progressMap);

      // Load achievements
      const { data: badgesData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      setAchievements(badgesData || []);

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkDailyStreak = async () => {
    try {
      const { data: todayActivity } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (!todayActivity) {
        // Check yesterday's activity for streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: yesterdayActivity } = await supabase
          .from('daily_activity')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', yesterday.toISOString().split('T')[0])
          .single();

        if (!yesterdayActivity && stats.streak > 0) {
          // Reset streak
          await supabase
            .from('user_stats')
            .update({ streak: 0 })
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error checking streak:', error);
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
        questions.push({
          type: 'translate_en',
          question: `${word.translation} so'zini inglizchaga tarjima qiling`,
          answer: word.word,
          word: word
        });
      } else if (type === 1) {
        questions.push({
          type: 'translate_uz',
          question: `Translate to Uzbek: "${word.word}"`,
          answer: word.translation,
          word: word
        });
      } else if (type === 2) {
        questions.push({
          type: 'fillblank',
          question: `Complete: "${word.example.replace(word.word, '_____')}"`,
          answer: word.word,
          word: word
        });
      } else {
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
    setCurrentLessonProgress(0);
    setCurrentQuestion(0);
    setUserAnswer('');
    setShowResult(false);
    setLessonFinished(false);
  };

  const checkAnswer = async () => {
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
      const xpGain = 10;
      const today = new Date().toISOString().split('T')[0];

      // Update stats
      setStats(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        todayXP: prev.todayXP + xpGain
      }));

      // Save to database
      await supabase
        .from('user_stats')
        .update({
          xp: stats.xp + xpGain,
          total_xp_earned: (stats.xp || 0) + xpGain,
          today_xp: stats.todayXP + xpGain,
          streak: stats.streak + 1,
          last_practice_date: today
        })
        .eq('user_id', user.id);

      // Log daily activity
      const { data: existingActivity } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingActivity) {
        await supabase
          .from('daily_activity')
          .update({ xp_earned: existingActivity.xp_earned + xpGain })
          .eq('id', existingActivity.id);
      } else {
        await supabase
          .from('daily_activity')
          .insert([{
            user_id: user.id,
            date: today,
            xp_earned: xpGain,
            lessons_completed: 0,
            practice_time_minutes: 0
          }]);
      }

      // Check achievements
      await checkAchievements();
    } else {
      // Lose heart
      const newHearts = Math.max(0, stats.hearts - 1);
      setStats(prev => ({ ...prev, hearts: newHearts }));

      await supabase
        .from('user_stats')
        .update({ hearts: newHearts })
        .eq('user_id', user.id);
    }
  };

  const checkAchievements = async () => {
    const newAchievements = [];

    // Check streak achievements
    if (stats.streak >= 7 && !achievements.find(a => a.badge_type === 'streak_7')) {
      newAchievements.push({ user_id: user.id, badge_type: 'streak_7', badge_name: '7 kun streak' });
    }
    if (stats.streak >= 30 && !achievements.find(a => a.badge_type === 'streak_30')) {
      newAchievements.push({ user_id: user.id, badge_type: 'streak_30', badge_name: '30 kun streak' });
    }

    // Check XP achievements
    if (stats.xp >= 100 && !achievements.find(a => a.badge_type === 'xp_100')) {
      newAchievements.push({ user_id: user.id, badge_type: 'xp_100', badge_name: '100 XP' });
    }
    if (stats.xp >= 1000 && !achievements.find(a => a.badge_type === 'xp_1000')) {
      newAchievements.push({ user_id: user.id, badge_type: 'xp_1000', badge_name: '1000 XP' });
    }

    if (newAchievements.length > 0) {
      await supabase.from('achievements').insert(newAchievements);
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < lessonQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
      setCurrentLessonProgress(((currentQuestion + 1) / lessonQuestions.length) * 100);
    } else {
      setLessonFinished(true);

      // Update completed lessons count
      const newCompletedCount = stats.completedLessons + 1;
      setStats(prev => ({ ...prev, completedLessons: newCompletedCount }));

      // Save to database
      await supabase
        .from('user_stats')
        .update({
          total_lessons_completed: newCompletedCount,
          hearts: 5 // Refill hearts after completing lesson
        })
        .eq('user_id', user.id);

      // Save lesson progress
      if (activeLesson) {
        const progressKey = `${activeLesson.level.id}-${activeLesson.type.id}-${0}`;
        const existingProgress = lessonProgress[progressKey];

        if (existingProgress) {
          await supabase
            .from('lesson_progress')
            .update({
              is_completed: true,
              stars: isCorrect ? 3 : 1,
              completed_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
        } else {
          await supabase
            .from('lesson_progress')
            .insert([{
              user_id: user.id,
              level_id: activeLesson.level.id,
              lesson_type: activeLesson.type.id,
              lesson_index: 0,
              is_completed: true,
              is_locked: false,
              stars: isCorrect ? 3 : 1,
              completed_at: new Date().toISOString()
            }]);
        }

        // Unlock next lesson
        const nextLevel = levels.find(l => l.id === activeLesson.level.id + 1);
        if (nextLevel) {
          await supabase
            .from('lesson_progress')
            .insert([{
              user_id: user.id,
              level_id: nextLevel.id,
              lesson_type: 'vocabulary',
              lesson_index: 0,
              is_completed: false,
              is_locked: false
            }]).upsert({}, { onConflict: 'user_id,level_id,lesson_type,lesson_index' });
        }
      }

      // Check for lesson achievements
      if (newCompletedCount === 10 && !achievements.find(a => a.badge_type === 'lessons_10')) {
        await supabase
          .from('achievements')
          .insert([{ user_id: user.id, badge_type: 'lessons_10', badge_name: '10 dars' }]);
        setAchievements(prev => [...prev, { badge_type: 'lessons_10', badge_name: '10 dars' }]);
      }
    }
  };

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const addHearts = async () => {
    setStats(prev => ({ ...prev, hearts: 5 }));
    await supabase
      .from('user_stats')
      .update({ hearts: 5 })
      .eq('user_id', user.id);
  };

  if (stats.hearts <= 0) {
    return (
      <div className="practice-page">
        <div className="no-hearts">
          <Heart size={64} className="heart-icon" />
          <h2>Yuraklar tugadi!</h2>
          <p>Siz barcha yuraklaringizni ishlatdingiz</p>
          <button className="btn-primary" onClick={addHearts}>
            <Heart size={18} /> Yuraklarni tiklash
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
          <div className="lesson-header">
            <button className="close-lesson" onClick={() => setActiveLesson(null)}>
              <X size={24} />
            </button>
            <div className="lesson-progress">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${currentLessonProgress}%` }}></div>
              </div>
              <span>{currentQuestion + 1}/{lessonQuestions.length}</span>
            </div>
            <div className="lesson-xp">
              <Zap size={16} /> +{10}
            </div>
          </div>

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

        <style>{duolingoStyles}</style>
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
            <div className="stat">
              <Flame size={24} />
              <span>{stats.streak} kun streak</span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setActiveLesson(null)}>
            <ChevronRight size={18} /> Davom etish
          </button>
        </div>
        <style>{duolingoStyles}</style>
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
            <span>{stats.todayXP} / {stats.dailyGoal} XP</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min((stats.todayXP / stats.dailyGoal) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="achievements-bar">
            {achievements.map((badge, i) => {
              const badgeInfo = badgeTypes.find(b => b.type === badge.badge_type);
              const Icon = badgeInfo?.icon || Award;
              return (
                <div key={i} className="achievement-badge" title={badge.badge_name}>
                  <Icon size={16} />
                </div>
              );
            })}
          </div>
        )}

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
                    <span>{level.title}</span>
                  </div>
                </div>

                <div className="lessons-list">
                  {Array.from({ length: Math.min(level.lessons, 4) }).map((_, i) => {
                    const progressKey = `${level.id}-${lessonTypes[i % 4].id}-0`;
                    const isCompleted = lessonProgress[progressKey]?.is_completed;
                    const isLocked = lessonProgress[progressKey]?.is_locked ?? (level.id > 1 && !lessonProgress[`${level.id - 1}-vocabulary-0`]?.is_completed);

                    return (
                      <button
                        key={i}
                        className={`lesson-btn ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => !isLocked && startLesson(level, lessonTypes[i % 4])}
                        disabled={isLocked}
                      >
                        {isCompleted ? <Check size={16} /> : isLocked ? <Lock size={16} /> : <Play size={16} />}
                        <span>{lessonTypes[i % 4].name}</span>
                        <span className="lesson-xp">+{lessonTypes[i % 4].xp} XP</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Section */}
        <div className="practice-section">
          <h2>Mashq qilish</h2>
          <div className="practice-grid">
            <button className="practice-card card" onClick={() => startLesson({ name: 'Practice', id: 0 }, lessonTypes[0])}>
              <BookOpen size={32} />
              <h3>Lug'at mashqi</h3>
              <p>So'zlarni takrorlash</p>
            </button>
            <button className="practice-card card" onClick={() => startLesson({ name: 'Practice', id: 0 }, lessonTypes[1])}>
              <Target size={32} />
              <h3>Tarjima mashqi</h3>
              <p>Gaplarni tarjima qilish</p>
            </button>
          </div>
        </div>
      </div>

      <style>{duolingoStyles}</style>
    </div>
  );
};

const duolingoStyles = `
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
    margin-bottom: 24px;
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .achievements-bar {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .achievement-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
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

  .lesson-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
  }

  .lesson-btn.completed {
    background: rgba(16, 185, 129, 0.2);
  }

  .lesson-btn.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .lesson-btn span {
    flex: 1;
  }

  .lesson-xp {
    font-size: 12px;
    color: #FBBF24 !important;
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

  .option-btn:hover:not(:disabled) {
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

  @media (max-width: 768px) {
    .practice-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default Practice;