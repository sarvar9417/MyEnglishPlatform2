import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Play, Edit3, RefreshCw, Check, X, ArrowRight, FileText, Target, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const IrregularVerbs = () => {
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Practice states
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, wrongVerbs: [] });
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [practiceVerbs, setPracticeVerbs] = useState([]);

  useEffect(() => {
    fetchVerbs();
  }, []);

  // Handle Enter key for checking answer or moving to next question
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !practiceFinished) {
        if (!showResult) {
          // Determine how many answers are needed based on practice type
          const activePractice = activeView;
          if (activePractice === 'practice3') {
            if (answer1 && answer2 && answer3) checkAnswer();
          } else {
            if (answer1 && answer2) checkAnswer();
          }
        } else {
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, answer1, answer2, answer3, activeView, practiceFinished]);

  // Auto-focus first input when question changes or result is hidden
  useEffect(() => {
    if (!showResult && practiceStarted) {
      setTimeout(() => {
        const input = document.querySelector('.input-field');
        if (input) input.focus();
      }, 100);
    }
  }, [currentQuestion, showResult, practiceStarted]);

  const fetchVerbs = async () => {
    try {
      const { data, error } = await supabase
        .from('irregular_verbs')
        .select('*')
        .order('base_form', { ascending: true });

      if (error) throw error;

      // Transform data to match our format
      const transformedVerbs = data.map(verb => ({
        base: verb.base_form,
        past: verb.past_simple,
        pastPart: verb.past_participle,
        meaning: verb.meaning_uz,
        dual: verb.is_dual_form || false
      }));

      setVerbs(transformedVerbs);
    } catch (error) {
      console.error('Error fetching verbs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerbs = verbs.filter(verb =>
    verb.base.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verb.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomVerbs = (count) => {
    const shuffled = [...verbs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startPractice = (type) => {
    const randomVerbs = getRandomVerbs(10);
    // For practice2, generate showPast for each verb
    const verbsWithShowPast = randomVerbs.map(verb => ({
      ...verb,
      showPast: Math.random() > 0.5
    }));
    setPracticeVerbs(verbsWithShowPast);
    setPracticeStarted(true);
    setCurrentQuestion(0);
    setAnswer1('');
    setAnswer2('');
    setAnswer3('');
    setShowResult(false);
    setIsCorrect(null);
    setScore({ correct: 0, incorrect: 0, wrongVerbs: [] });
    setPracticeFinished(false);
    setActiveView(type);
  };

  const checkAnswer = () => {
    const currentVerb = practiceVerbs[currentQuestion];
    let correct = false;

    const isDualForm = currentVerb.dual;

    // Helper to check if answer matches any form (for dual verbs)
    const checkDualForm = (answer, expected) => {
      if (!isDualForm) return answer === expected;
      const forms = expected.split('/').map(f => f.toLowerCase().replace(/\s/g, ''));
      return forms.includes(answer);
    };

    if (activeView === 'practice1') {
      // Base form shown, write past and past participle
      const ans1 = answer1.trim().toLowerCase().replace(/\s/g, '');
      const ans2 = answer2.trim().toLowerCase().replace(/\s/g, '');

      if (currentVerb.base === 'be') {
        correct = (ans1 === 'was' || ans1 === 'were') && ans2 === 'been';
      } else {
        const pastForms = currentVerb.past.toLowerCase().replace(/\s/g, '').split('/');
        const partForms = currentVerb.pastPart.toLowerCase().replace(/\s/g, '').split('/');
        const correct1 = pastForms.includes(ans1);
        const correct2 = partForms.includes(ans2);
        correct = correct1 && correct2;
      }
    } else if (activeView === 'practice2') {
      // Random form shown, write other two
      const ans1 = answer1.trim().toLowerCase().replace(/\s/g, '');
      const ans2 = answer2.trim().toLowerCase().replace(/\s/g, '');

      // Get all forms for this verb
      const allForms = [
        currentVerb.base.toLowerCase(),
        ...currentVerb.past.toLowerCase().replace(/\s/g, '').split('/'),
        ...currentVerb.pastPart.toLowerCase().replace(/\s/g, '').split('/')
      ];

      // Check both answers are valid and different
      const valid1 = allForms.includes(ans1);
      const valid2 = allForms.includes(ans2);
      correct = valid1 && valid2 && ans1 !== ans2;
    } else if (activeView === 'practice3') {
      // Uzbek meaning shown, write all 3
      const ans1 = answer1.trim().toLowerCase().replace(/\s/g, '');
      const ans2 = answer2.trim().toLowerCase().replace(/\s/g, '');
      const ans3 = answer3.trim().toLowerCase().replace(/\s/g, '');

      // Get all valid forms for this verb
      const allForms = [
        currentVerb.base.toLowerCase(),
        ...currentVerb.past.toLowerCase().replace(/\s/g, '').split('/'),
        ...currentVerb.pastPart.toLowerCase().replace(/\s/g, '').split('/')
      ];

      // Check if all 3 answers are valid and different
      const valid1 = ans1 && allForms.includes(ans1);
      const valid2 = ans2 && allForms.includes(ans2);
      const valid3 = ans3 && allForms.includes(ans3);

      // Must have all 3 correct and they must be different forms
      const uniqueAnswers = new Set([ans1, ans2, ans3].filter(a => a));
      correct = valid1 && valid2 && valid3 && uniqueAnswers.size === 3;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        wrongVerbs: [...prev.wrongVerbs, currentVerb]
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1);
      setAnswer1('');
      setAnswer2('');
      setShowResult(false);
      setIsCorrect(null);
    } else {
      setPracticeFinished(true);
    }
  };

  const restartPractice = () => {
    startPractice(activeView);
  };

  const backToList = () => {
    setActiveView('list');
    setPracticeStarted(false);
    setPracticeFinished(false);
  };

  const currentVerb = practiceVerbs[currentQuestion] || null;

  // Practice Mode 1: Base form shown
  if (activeView === 'practice1') {
    if (practiceFinished) {
      const percentage = Math.round((score.correct / 10) * 100);
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-result">
              <div className={`result-icon ${percentage >= 70 ? 'success' : 'warning'}`}>
                {percentage >= 70 ? <Check size={64} /> : <X size={64} />}
              </div>
              <h1>Test yakunlandi!</h1>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-value correct">{score.correct}</span>
                  <span className="stat-label">To'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value incorrect">{score.incorrect}</span>
                  <span className="stat-label">Noto'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{percentage}%</span>
                  <span className="stat-label">Foiz</span>
                </div>
              </div>

              {score.wrongVerbs.length > 0 && (
                <div className="wrong-verbs">
                  <h3>Noto'g'ri javoblar:</h3>
                  <div className="wrong-list">
                    {score.wrongVerbs.map((verb, index) => (
                      <div key={index} className="wrong-item">
                        <span className="verb-base">{verb.base}</span>
                        <span className="verb-answers">{verb.past} - {verb.pastPart}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button className="btn-primary" onClick={restartPractice}>
                  <RefreshCw size={18} />
                  Qayta boshlash
                </button>
                <button className="btn-secondary" onClick={backToList}>
                  <ArrowRight size={18} />
                  Jadvalga qaytish
                </button>
              </div>
            </div>
          </div>
          <style>{getResultStyles()}</style>
        </div>
      );
    }

    if (!practiceStarted) {
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-start">
              <div className="practice-icon"><FileText size={48} /></div>
              <h2>1-shakl: Base Form</h2>
              <p>Asosiy shakli (base form) beriladi, siz past va o'tgan zamondagi shakllarini yozing</p>
              <div className="practice-info">
                <span><FileText size={16} /> 10 ta soz</span>
                <span><Target size={16} /> 2 ta javob</span>
              </div>
              <button className="btn-primary btn-lg" onClick={() => startPractice('practice1')}>
                <Play size={20} /> Boshlash
              </button>
            </div>
          </div>
          <style>{getPracticeStartStyles()}</style>
        </div>
      );
    }

    return (
      <div className="verbs-page">
        <div className="page-inner">
          <div className="practice-container">
            <div className="practice-header">
              <span className="question-counter">Savol {currentQuestion + 1} / 10</span>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="question-card">
              <div className="verb-display">
                <span className="verb-label">Base Form</span>
                <h2>{currentVerb?.base}</h2>
                <p className="verb-meaning">({currentVerb?.meaning})</p>
              </div>

              <div className="answer-inputs">
                <div className="input-group">
                  <label>Past Simple (otgan zamon)</label>
                  <input type="text" className="input-field" placeholder="masalan: became"
                    value={answer1} onChange={(e) => setAnswer1(e.target.value)} disabled={showResult} />
                </div>
                <div className="input-group">
                  <label>Past Participle</label>
                  <input type="text" className="input-field" placeholder="masalan: become"
                    value={answer2} onChange={(e) => setAnswer2(e.target.value)} disabled={showResult} />
                </div>
              </div>

              {showResult && (
                <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? (
                    <div className="feedback-content correct">
                      <Check size={24} /> <span>To'g'ri!</span>
                    </div>
                  ) : (
                    <div className="feedback-content incorrect">
                      <X size={24} />
                      <div className="correct-answer">
                        <span>To'g'ri javob:</span>
                        <strong>{currentVerb?.past} - {currentVerb?.pastPart}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="practice-actions">
              {!showResult ? (
                <button className="btn-primary" onClick={checkAnswer} disabled={!answer1 || !answer2}>
                  Tekshirish
                </button>
              ) : (
                <button className="btn-primary" onClick={nextQuestion}>
                  {currentQuestion < 9 ? 'Keyingi savol' : 'Natijani korish'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <style>{getPracticeStyles()}</style>
      </div>
    );
  }

  // Practice Mode 2: Random form
  if (activeView === 'practice2') {
    if (practiceFinished) {
      const percentage = Math.round((score.correct / 10) * 100);
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-result">
              <div className={`result-icon ${percentage >= 70 ? 'success' : 'warning'}`}>
                {percentage >= 70 ? <Check size={64} /> : <X size={64} />}
              </div>
              <h1>Test yakunlandi!</h1>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-value correct">{score.correct}</span>
                  <span className="stat-label">To'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value incorrect">{score.incorrect}</span>
                  <span className="stat-label">Noto'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{percentage}%</span>
                  <span className="stat-label">Foiz</span>
                </div>
              </div>

              {score.wrongVerbs.length > 0 && (
                <div className="wrong-verbs">
                  <h3>Noto'g'ri javoblar:</h3>
                  <div className="wrong-list">
                    {score.wrongVerbs.map((verb, index) => (
                      <div key={index} className="wrong-item">
                        <span className="verb-base">{verb.base}</span>
                        <span className="verb-answers">{verb.past} - {verb.pastPart}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button className="btn-primary" onClick={restartPractice}>
                  <RefreshCw size={18} /> Qayta boshlash
                </button>
                <button className="btn-secondary" onClick={backToList}>
                  <ArrowRight size={18} /> Jadvalga qaytish
                </button>
              </div>
            </div>
          </div>
          <style>{getResultStyles()}</style>
        </div>
      );
    }

    if (!practiceStarted) {
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-start">
              <div className="practice-icon"><Edit3 size={48} /></div>
              <h2>Arbitrary shakl</h2>
              <p>Istalgan shakli (base, past yoki past participle) beriladi, qolgan ikki shaklini yozing</p>
              <div className="practice-info">
                <span><FileText size={16} /> 10 ta soz</span>
                <span><Target size={16} /> 2 ta javob</span>
              </div>
              <button className="btn-primary btn-lg" onClick={() => startPractice('practice2')}>
                <Play size={20} /> Boshlash
              </button>
            </div>
          </div>
          <style>{getPracticeStartStyles()}</style>
        </div>
      );
    }

    const showPast = currentVerb?.showPast;
    const displayForm = showPast ? currentVerb?.past : currentVerb?.pastPart;

    return (
      <div className="verbs-page">
        <div className="page-inner">
          <div className="practice-container">
            <div className="practice-header">
              <span className="question-counter">Savol {currentQuestion + 1} / 10</span>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="question-card">
              <div className="verb-display">
                <span className="verb-label">{showPast ? 'Past Simple' : 'Past Participle'}</span>
                <h2>{displayForm}</h2>
                <p className="verb-meaning">({currentVerb?.meaning})</p>
              </div>

              <div className="answer-inputs">
                <div className="input-group">
                  <label>Base Form (asos)</label>
                  <input type="text" className="input-field" placeholder="masalan: become"
                    value={answer1} onChange={(e) => setAnswer1(e.target.value)} disabled={showResult} />
                </div>
                <div className="input-group">
                  <label>{showPast ? 'Past Participle' : 'Past Simple'}</label>
                  <input type="text" className="input-field" placeholder={showPast ? 'masalan: become' : 'masalan: became'}
                    value={answer2} onChange={(e) => setAnswer2(e.target.value)} disabled={showResult} />
                </div>
              </div>

              {showResult && (
                <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? (
                    <div className="feedback-content correct">
                      <Check size={24} /> <span>To'g'ri!</span>
                    </div>
                  ) : (
                    <div className="feedback-content incorrect">
                      <X size={24} />
                      <div className="correct-answer">
                        <span>To'g'ri javob:</span>
                        <strong>{currentVerb?.base} - {currentVerb?.past} - {currentVerb?.pastPart}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="practice-actions">
              {!showResult ? (
                <button className="btn-primary" onClick={checkAnswer} disabled={!answer1 || !answer2}>
                  Tekshirish
                </button>
              ) : (
                <button className="btn-primary" onClick={nextQuestion}>
                  {currentQuestion < 9 ? 'Keyingi savol' : 'Natijani korish'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <style>{getPracticeStyles()}</style>
      </div>
    );
  }

  // Practice Mode 3: Uzbek meaning
  if (activeView === 'practice3') {
    if (practiceFinished) {
      const percentage = Math.round((score.correct / 10) * 100);
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-result">
              <div className={`result-icon ${percentage >= 70 ? 'success' : 'warning'}`}>
                {percentage >= 70 ? <Check size={64} /> : <X size={64} />}
              </div>
              <h1>Test yakunlandi!</h1>
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-value correct">{score.correct}</span>
                  <span className="stat-label">To'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value incorrect">{score.incorrect}</span>
                  <span className="stat-label">Noto'g'ri</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{percentage}%</span>
                  <span className="stat-label">Foiz</span>
                </div>
              </div>

              {score.wrongVerbs.length > 0 && (
                <div className="wrong-verbs">
                  <h3>Noto'g'ri javoblar:</h3>
                  <div className="wrong-list">
                    {score.wrongVerbs.map((verb, index) => (
                      <div key={index} className="wrong-item">
                        <span className="verb-uzbek">{verb.meaning}</span>
                        <span className="verb-answers">{verb.base} - {verb.past} - {verb.pastPart}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button className="btn-primary" onClick={restartPractice}>
                  <RefreshCw size={18} /> Qayta boshlash
                </button>
                <button className="btn-secondary" onClick={backToList}>
                  <ArrowRight size={18} /> Jadvalga qaytish
                </button>
              </div>
            </div>
          </div>
          <style>{getResultStyles()}</style>
        </div>
      );
    }

    if (!practiceStarted) {
      return (
        <div className="verbs-page">
          <div className="page-inner">
            <div className="practice-start">
              <div className="practice-icon"><BookOpen size={48} /></div>
              <h2>O'zbekcha tarjima</h2>
              <p>O'zbekcha manosi beriladi, uchchala inglizcha shaklini yozing (base, past, past participle)</p>
              <div className="practice-info">
                <span><FileText size={16} /> 10 ta soz</span>
                <span><Target size={16} /> 3 ta javob</span>
              </div>
              <button className="btn-primary btn-lg" onClick={() => startPractice('practice3')}>
                <Play size={20} /> Boshlash
              </button>
            </div>
          </div>
          <style>{getPracticeStartStyles()}</style>
        </div>
      );
    }

    return (
      <div className="verbs-page">
        <div className="page-inner">
          <div className="practice-container">
            <div className="practice-header">
              <span className="question-counter">Savol {currentQuestion + 1} / 10</span>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="question-card">
              <div className="verb-display">
                <span className="verb-label">O'zbekcha</span>
                <h2>{currentVerb?.meaning}</h2>
              </div>

              <div className="answer-inputs">
                <div className="input-group">
                  <label>Base Form (asos)</label>
                  <input type="text" className="input-field" placeholder="masalan: become"
                    value={answer1} onChange={(e) => setAnswer1(e.target.value)} disabled={showResult} />
                </div>
                <div className="input-group">
                  <label>Past Simple</label>
                  <input type="text" className="input-field" placeholder="masalan: became"
                    value={answer2} onChange={(e) => setAnswer2(e.target.value)} disabled={showResult} />
                </div>
                <div className="input-group">
                  <label>Past Participle</label>
                  <input type="text" className="input-field" placeholder="masalan: become"
                    value={answer3} onChange={(e) => setAnswer3(e.target.value)} disabled={showResult} />
                </div>
              </div>

              {showResult && !isCorrect && (
                <div className="answer-feedback incorrect">
                  <div className="feedback-content incorrect">
                    <X size={24} />
                    <div className="correct-answer">
                      <span>To'g'ri javob:</span>
                      <strong>{currentVerb?.base} - {currentVerb?.past} - {currentVerb?.pastPart}</strong>
                    </div>
                  </div>
                </div>
              )}

              {showResult && isCorrect && (
                <div className="answer-feedback correct">
                  <div className="feedback-content correct">
                    <Check size={24} /> <span>To'g'ri!</span>
                  </div>
                </div>
              )}
            </div>

            <div className="practice-actions">
              {!showResult ? (
                <button className="btn-primary" onClick={checkAnswer} disabled={!answer1 || !answer2 || !answer3}>
                  Tekshirish
                </button>
              ) : (
                <button className="btn-primary" onClick={nextQuestion}>
                  {currentQuestion < 9 ? 'Keyingi savol' : 'Natijani korish'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <style>{getPracticeStyles()}</style>
      </div>
    );
  }

  // List View
  if (loading) {
    return (
      <div className="verbs-page">
        <div className="page-inner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader size={40} className="spin" style={{ color: '#F7931E' }} />
          <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="verbs-page">
      <div className="page-inner">
        <div className="page-header">
          <div className="header-content">
            <h1>Irregular Verbs</h1>
            <p>{verbs.length} ta irregular fel</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => startPractice('practice1')}>
              <FileText size={18} /> 1-shakl
            </button>
            <button className="btn-secondary" onClick={() => startPractice('practice2')}>
              <Edit3 size={18} /> Arbitrary
            </button>
            <button className="btn-secondary" onClick={() => startPractice('practice3')}>
              <BookOpen size={18} /> Tarjima
            </button>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="verbs-table">
          <div className="table-header">
            <span>Base Form</span>
            <span>Past Simple</span>
            <span>Past Participle</span>
            <span>Tarjima</span>
          </div>
          <div className="table-body">
            {filteredVerbs.map((verb, index) => (
              <div key={index} className="table-row">
                <span className="base-form">{verb.base}</span>
                <span className="past-form">{verb.past}</span>
                <span className="participle-form">{verb.pastPart}</span>
                <span className="meaning">{verb.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .verbs-page { padding: 0; min-height: 100vh; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .header-content h1 { font-size: 32px; margin-bottom: 8px; }
        .header-content p { color: var(--text-secondary); }
        .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .header-actions button { display: flex; align-items: center; gap: 8px; }
        .search-box { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; max-width: 400px; }
        .search-box svg { color: var(--text-secondary); }
        .search-box input { background: none; border: none; color: var(--text-primary); flex: 1; font-size: 16px; }
        .search-box input:focus { outline: none; }
        .verbs-table { background: var(--card); backdrop-filter: blur(10px); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 2fr 2fr 2fr 2fr; gap: 16px; padding: 16px 24px; background: var(--bg-tertiary); font-weight: 600; color: var(--text-secondary); font-size: 14px; }
        .table-body { max-height: 600px; overflow-y: auto; }
        .table-row { display: grid; grid-template-columns: 2fr 2fr 2fr 2fr; gap: 16px; padding: 14px 24px; border-bottom: 1px solid var(--border); transition: background 0.2s ease; }
        .table-row:hover { background: var(--bg-tertiary); }
        .table-row:last-child { border-bottom: none; }
        .base-form { font-weight: 600; color: #8B5CF6; }
        .past-form { color: #6EE7B7; }
        .participle-form { color: #A78BFA; }
        .meaning { color: var(--text-secondary); font-size: 14px; }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; }
          .header-actions { width: 100%; }
          .table-header, .table-row { grid-template-columns: 1fr 1fr; }
          .table-header span:nth-child(4), .table-row span:nth-child(4) { display: none; }
        }
      `}</style>
    </div>
  );
};

function getPracticeStartStyles() {
  return `
    .practice-start { text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto; }
    .practice-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 24px; }
    .practice-start h2 { font-size: 28px; margin-bottom: 12px; }
    .practice-start p { color: var(--text-secondary); margin-bottom: 24px; }
    .practice-info { display: flex; justify-content: center; gap: 24px; margin-bottom: 32px; color: var(--text-secondary); }
    .practice-info span { display: flex; align-items: center; gap: 8px; }
    .btn-lg { padding: 16px 32px; font-size: 18px; }
  `;
}

function getPracticeStyles() {
  return `
    .practice-container { max-width: 600px; margin: 0 auto; }
    .practice-header { margin-bottom: 24px; }
    .question-counter { display: block; text-align: center; margin-bottom: 12px; font-weight: 600; }
    .progress-bar { height: 8px; background: var(--surface); border-radius: 4px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); border-radius: 4px; transition: width 0.3s ease; }
    .question-card { background: var(--card); backdrop-filter: blur(10px); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .verb-display { text-align: center; margin-bottom: 32px; }
    .verb-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
    .verb-display h2 { font-size: 36px; color: var(--accent-primary); margin: 8px 0; }
    .verb-meaning { color: var(--text-secondary); font-size: 16px; }
    .answer-inputs { display: flex; flex-direction: column; gap: 16px; }
    .input-group { display: flex; flex-direction: column; gap: 8px; }
    .input-group label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
    .answer-feedback { margin-top: 20px; padding: 16px; border-radius: 12px; }
    .answer-feedback.correct { background: rgba(110, 231, 183, 0.1); border: 1px solid var(--success); }
    .answer-feedback.incorrect { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); }
    .feedback-content { display: flex; align-items: center; gap: 12px; }
    .feedback-content.correct { color: var(--success); }
    .feedback-content.incorrect { color: var(--error); flex-wrap: wrap; }
    .correct-answer { display: flex; flex-direction: column; gap: 4px; }
    .correct-answer span { font-size: 12px; opacity: 0.8; }
    .practice-actions { text-align: center; }
    .practice-actions button { display: inline-flex; align-items: center; gap: 8px; }
  `;
}

function getResultStyles() {
  return `
    .practice-result { text-align: center; padding: 40px; max-width: 600px; margin: 0 auto; }
    .result-icon { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .result-icon.success { background: rgba(110, 231, 183, 0.2); color: var(--success); }
    .result-icon.warning { background: rgba(239, 68, 68, 0.2); color: var(--error); }
    .practice-result h1 { font-size: 28px; margin-bottom: 24px; }
    .result-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 32px; }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 32px; font-weight: 700; }
    .stat-value.correct { color: var(--success); }
    .stat-value.incorrect { color: var(--error); }
    .stat-label { font-size: 14px; color: var(--text-secondary); }
    .wrong-verbs { text-align: left; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .wrong-verbs h3 { font-size: 16px; margin-bottom: 16px; color: var(--error); }
    .wrong-list { display: flex; flex-direction: column; gap: 12px; }
    .wrong-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; }
    .verb-base { font-weight: 600; color: var(--accent-primary); }
    .verb-uzbek { color: var(--text-secondary); }
    .verb-answers { color: var(--accent-secondary); }
    .result-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .result-actions button { display: flex; align-items: center; gap: 8px; }
  `;
}

export default IrregularVerbs;