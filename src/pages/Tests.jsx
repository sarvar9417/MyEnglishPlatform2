import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Clock, Target, ArrowRight } from 'lucide-react';

const Tests = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'vocabulary';

  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [testType, setTestType] = useState(initialType);

  const testTypes = [
    { id: 'vocabulary', name: "Lug'at testi", questions: 10, description: "So'zlarning ma'nosini tekshirish" },
    { id: 'grammar', name: 'Grammatika testi', questions: 10, description: 'Grammatik qoidalarni tekshirish' },
    { id: 'mixed', name: 'Aralash test', questions: 15, description: 'Barcha bilimlarni tekshirish' },
  ];

  const questions = {
    vocabulary: [
      { question: '"Apple" sozi qanday manoni anglatadi?', options: ['Olma', 'Nok', 'Uzum', 'Banan'], correct: 0 },
      { question: '"Beautiful" sozi qanday manoni anglatadi?', options: ['Chiroyli', 'Yoqimsiz', 'Katta', 'Kichik'], correct: 0 },
      { question: '"Computer" sozi qanday manoni anglatadi?', options: ['Kitob', 'Kompyuter', 'Telefon', 'Televizor'], correct: 1 },
      { question: '"Environment" sozi qanday manoni anglatadi?', options: ['Sport', 'Muhit', 'Taom', 'Uy'], correct: 1 },
      { question: '"Philosophy" sozi qanday manoni anglatadi?', options: ['Matematika', 'Falsafa', 'Kimyo', 'Fizika'], correct: 1 },
      { question: '"Develop" feli qanday manoni anglatadi?', options: ['Yomonlashtirish', 'Rivojlantirish', 'Tugatish', 'Boshlash'], correct: 1 },
      { question: '"Experience" sozi qanday manoni anglatadi?', options: ['Tajriba', 'Xato', 'Muvaffaqiyat', 'Kutilgan'], correct: 0 },
      { question: '"Knowledge" sozi qanday manoni anglatadi?', options: ['Boylik', 'Bilim', 'Quvvat', 'Vaqt'], correct: 1 },
      { question: '"Decision" sozi qanday manoni anglatadi?', options: ['Savol', 'Qaror', 'Harakat', 'Natija'], correct: 1 },
      { question: '"Achieve" feli qanday manoni anglatadi?', options: ['Muvaffaqiyatga erishmoq', 'Bajarilmagan', 'Qochmoq', 'Tashlab ketmoq'], correct: 0 },
    ],
    grammar: [
      { question: "Togri variantni tanlang: 'She ___ to school every day.'", options: ['go', 'goes', 'going', 'went'], correct: 1 },
      { question: "Togri variantni tanlang: 'I ___ coffee right now.'", options: ['drink', 'drinks', 'am drinking', 'drank'], correct: 2 },
      { question: "Togri variantni tanlang: 'They ___ football yesterday.'", options: ['play', 'plays', 'played', 'playing'], correct: 2 },
      { question: "Togri variantni tanlang: 'She ___ TV since 5 PM.'", options: ['watch', 'watches', 'watched', 'has been watching'], correct: 3 },
      { question: "Togri variantni tanlang: '___ you like some tea?'", options: ['Do', 'Does', 'Are', 'Is'], correct: 0 },
      { question: "Togri variantni tanlang: 'I ___ my homework tomorrow.'", options: ['will finish', 'finish', 'finished', 'finishing'], correct: 0 },
      { question: "Togri variantni tanlang: 'The book ___ on the table.'", options: ['is', 'are', 'was', 'were'], correct: 0 },
      { question: "Togri variantni tanlang: 'He ___ not come yesterday.'", options: ['do', 'does', 'did', 'will'], correct: 2 },
      { question: "Togri variantni tanlang: 'If I ___ rich, I would travel.'", options: ['am', 'was', 'were', 'be'], correct: 2 },
      { question: "Togri variantni tanlang: 'I have lived here ___ 5 years.'", options: ['for', 'since', 'during', 'while'], correct: 0 },
    ],
    mixed: [
      { question: '"Apple" sozi qanday manoni anglatadi?', options: ['Olma', 'Nok', 'Uzum', 'Banan'], correct: 0 },
      { question: "Togri variantni tanlang: 'She ___ to school every day.'", options: ['go', 'goes', 'going', 'went'], correct: 1 },
      { question: '"Beautiful" sozi qanday manoni anglatadi?', options: ['Chiroyli', 'Yoqimsiz', 'Katta', 'Kichik'], correct: 0 },
      { question: "Togri variantni tanlang: 'I ___ coffee right now.'", options: ['drink', 'drinks', 'am drinking', 'drank'], correct: 2 },
      { question: '"Computer" sozi qanday manoni anglatadi?', options: ['Kitob', 'Kompyuter', 'Telefon', 'Televizor'], correct: 1 },
      { question: "Togri variantni tanlang: 'They ___ football yesterday.'", options: ['play', 'plays', 'played', 'playing'], correct: 2 },
      { question: '"Environment" sozi qanday manoni anglatadi?', options: ['Sport', 'Muhit', 'Taom', 'Uy'], correct: 1 },
      { question: "Togri variantni tanlang: '___ you like some tea?'", options: ['Do', 'Does', 'Are', 'Is'], correct: 0 },
      { question: '"Philosophy" sozi qanday manoni anglatadi?', options: ['Matematika', 'Falsafa', 'Kimyo', 'Fizika'], correct: 1 },
      { question: "Togri variantni tanlang: 'I ___ my homework tomorrow.'", options: ['will finish', 'finish', 'finished', 'finishing'], correct: 0 },
      { question: '"Experience" sozi qanday manoni anglatadi?', options: ['Tajriba', 'Xato', 'Muvaffaqiyat', 'Kutilgan'], correct: 0 },
      { question: "Togri variantni tanlang: 'If I ___ rich, I would travel.'", options: ['am', 'was', 'were', 'be'], correct: 2 },
      { question: '"Knowledge" sozi qanday manoni anglatadi?', options: ['Boylik', 'Bilim', 'Quvvat', 'Vaqt'], correct: 1 },
      { question: "Togri variantni tanlang: 'He ___ not come yesterday.'", options: ['do', 'does', 'did', 'will'], correct: 2 },
      { question: '"Achieve" feli qanday manoni anglatadi?', options: ['Muvaffaqiyatga erishmoq', 'Bajarilmagan', 'Qochmoq', 'Tashlab ketmoq'], correct: 0 },
    ]
  };

  const currentTest = testTypes.find(t => t.id === testType);
  const testQuestions = questions[testType];

  const startTest = (type) => {
    setTestType(type);
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
  };

  const nextQuestion = () => {
    if (selectedAnswer === testQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setShowResult(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  if (showResult) {
    const percentage = Math.round((score / testQuestions.length) * 100);
    return (
      <div className="tests-page">
        <div className="page-inner">
          <div className="result-container">
            <div className={`result-icon ${percentage >= 70 ? 'success' : 'warning'}`}>
              {percentage >= 70 ? <Trophy size={64} /> : <Target size={64} />}
            </div>
            <h1>Test yakunlandi!</h1>
            <div className="result-stats">
              <div className="result-stat">
                <CheckCircle size={24} className="correct" />
                <span>{score} togri</span>
              </div>
              <div className="result-stat">
                <XCircle size={24} className="incorrect" />
                <span>{testQuestions.length - score} notogri</span>
              </div>
              <div className="result-stat">
                <Target size={24} />
                <span>{percentage}%</span>
              </div>
            </div>
            <p className="result-message">
              {percentage >= 80 ? 'Ajoyib natija! Davom eting!' :
               percentage >= 60 ? 'Yaxshi natija! Kopiroq mashq qiling!' :
               'Koproq organish kerak. Qayta urinib korish!'}
            </p>
            <div className="result-actions">
              <button className="btn-primary" onClick={() => startTest(testType)}>
                <ArrowRight size={18} />
                Qayta topshirish
              </button>
              <button className="btn-secondary" onClick={resetTest}>
                Boshqa test tanlash
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .result-container {
            max-width: 500px;
            margin: 80px auto;
            text-align: center;
          }

          .result-icon {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 32px;
          }

          .result-icon.success {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
          }

          .result-icon.warning {
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning);
          }

          .result-container h1 {
            margin-bottom: 32px;
          }

          .result-stats {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-bottom: 24px;
          }

          .result-stat {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }

          .result-stat .correct { color: var(--success); }
          .result-stat .incorrect { color: var(--error); }

          .result-message {
            color: var(--text-secondary);
            margin-bottom: 32px;
          }

          .result-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }

  if (testStarted) {
    return (
      <div className="tests-page">
        <div className="page-inner">
          <div className="test-container">
            <div className="test-header">
              <div className="test-info">
                <h2>{currentTest.name}</h2>
                <span className="question-counter">
                  Savol {currentQuestion + 1} / {testQuestions.length}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{width: `${((currentQuestion + 1) / testQuestions.length) * 100}%`}}
                ></div>
              </div>
            </div>

            <div className="question-card card animate-slide-up">
              <h3 className="question-text">{testQuestions[currentQuestion].question}</h3>
              <div className="options-list">
                {testQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswer === index ? (index === testQuestions[currentQuestion].correct ? 'correct' : 'incorrect') : ''} ${selectedAnswer !== null && index === testQuestions[currentQuestion].correct ? 'show-correct' : ''}`}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {selectedAnswer !== null && index === testQuestions[currentQuestion].correct && <CheckCircle size={20} className="option-icon" />}
                    {selectedAnswer === index && index !== testQuestions[currentQuestion].correct && <XCircle size={20} className="option-icon" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="test-footer">
              {selectedAnswer !== null ? (
                <button className="btn-primary" onClick={nextQuestion}>
                  {currentQuestion < testQuestions.length - 1 ? 'Keyingi savol' : 'Natijani korish'}
                </button>
              ) : (
                <p className="select-hint">Javobni tanlang</p>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .test-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 40px 0;
          }

          .test-header {
            margin-bottom: 32px;
          }

          .test-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .test-info h2 {
            font-size: 24px;
          }

          .question-counter {
            background: var(--surface);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
          }

          .question-card {
            padding: 32px;
            margin-bottom: 24px;
          }

          .question-text {
            font-size: 20px;
            margin-bottom: 24px;
            line-height: 1.5;
          }

          .options-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .option-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
            padding: 16px 20px;
            background: var(--surface);
            border: 2px solid #2A3A5C;
            border-radius: 12px;
            text-align: left;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .option-btn:hover:not(:disabled) {
            border-color: var(--secondary);
            background: rgba(247, 147, 30, 0.05);
          }

          .option-btn:disabled {
            cursor: default;
          }

          .option-btn.correct {
            border-color: var(--success);
            background: rgba(16, 185, 129, 0.1);
          }

          .option-btn.incorrect {
            border-color: var(--error);
            background: rgba(239, 68, 68, 0.1);
          }

          .option-btn.show-correct {
            border-color: var(--success);
            background: rgba(16, 185, 129, 0.05);
          }

          .option-letter {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--card);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          .option-text {
            flex: 1;
            font-size: 16px;
          }

          .option-icon {
            flex-shrink: 0;
          }

          .option-btn.correct .option-icon { color: var(--success); }
          .option-btn.incorrect .option-icon { color: var(--error); }

          .test-footer {
            text-align: center;
          }

          .select-hint {
            color: var(--text-secondary);
            font-size: 14px;
          }

          @media (max-width: 768px) {
            .test-info {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tests-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Testlar</h1>
          <p>O'z bilimlaringizni sinab korish</p>
        </div>

        <div className="tests-grid">
          {testTypes.map((test, index) => (
            <div
              key={test.id}
              className="test-card card animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="test-icon">
                <Trophy size={32} />
              </div>
              <h3>{test.name}</h3>
              <p>{test.description}</p>
              <div className="test-meta">
                <span><Clock size={16} /> {test.questions} ta savol</span>
                <span><Target size={16} /> ~10 daqiqa</span>
              </div>
              <button className="btn-primary" onClick={() => startTest(test.id)}>
                <ArrowRight size={18} />
                Boshlash
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .tests-page {
          padding: 0;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .page-header p {
          color: var(--text-secondary);
        }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .test-card {
          text-align: center;
          padding: 32px;
        }

        .test-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: var(--gradient-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
        }

        .test-card h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .test-card p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .test-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 24px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .test-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .test-card button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default Tests;