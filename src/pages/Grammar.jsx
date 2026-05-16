import { useState } from 'react';
import { ChevronRight, Check, BookOpen, FileText, HelpCircle } from 'lucide-react';

const Grammar = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    {
      id: 'present-simple',
      title: 'Present Simple',
      description: 'Hozirgi oddiy zamon',
      level: 'Basic',
      lessons: [
        { id: 1, title: 'Subject + Verb (to do)', content: 'I play football every weekend. She works at a bank.' },
        { id: 2, title: 'Negations: Subject + do/does + not + verb', content: 'I do not (don\'t) like coffee. He does not (doesn\'t) play tennis.' },
        { id: 3, title: 'Questions: Do/Does + Subject + verb?', content: 'Do you speak English? Does she live in London?' },
      ]
    },
    {
      id: 'present-continuous',
      title: 'Present Continuous',
      description: 'Hozirgi davomli zamon',
      level: 'Basic',
      lessons: [
        { id: 1, title: 'Subject + am/is/are + verb-ing', content: 'I am reading a book. She is cooking dinner.' },
        { id: 2, title: 'Use: Actions happening now', content: 'Look! It is raining. She is studying at the moment.' },
        { id: 3, title: 'Time expressions: now, right now, at the moment', content: 'I am working right now. They are playing now.' },
      ]
    },
    {
      id: 'past-simple',
      title: 'Past Simple',
      description: 'O\'tgan oddiy zamon',
      level: 'Intermediate',
      lessons: [
        { id: 1, title: 'Regular verbs: verb + ed', content: 'I played football yesterday. She worked late last night.' },
        { id: 2, title: 'Irregular verbs: past form', content: 'I went to school. She ate breakfast at 8 AM.' },
        { id: 3, title: 'Negations: did not (didn\'t) + verb', content: 'I did not (didn\'t) go to the party.' },
      ]
    },
    {
      id: 'future-will',
      title: 'Future with Will',
      description: 'Kelasi zamon (will)',
      level: 'Intermediate',
      lessons: [
        { id: 1, title: 'Will + verb (instant decisions)', content: 'I will call you later. It will rain tomorrow.' },
        { id: 2, title: 'Will vs Going to', content: 'Will: predictions without evidence. Going to: plans or evidence.' },
        { id: 3, title: 'Will not (won\'t)', content: 'I will not (won\'t) lie to you.' },
      ]
    },
    {
      id: 'present-perfect',
      title: 'Present Perfect',
      description: 'Hozirgi yakuniy zamon',
      level: 'Advanced',
      lessons: [
        { id: 1, title: 'Have/has + past participle', content: 'I have (I\'ve) finished my homework.' },
        { id: 2, title: 'Use: Experience + result connection', content: 'I have visited Paris twice. (experience) She has lost her keys. (result)' },
        { id: 3, title: 'For and since', content: 'I have lived here for 5 years. I have lived here since 2019.' },
      ]
    },
  ];

  return (
    <div className="grammar-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Grammatika</h1>
          <p>Grammatik qoidalar va misollar</p>
        </div>

        {!selectedTopic ? (
          <div className="topics-grid">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="topic-card card animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="topic-header">
                  <div className="topic-icon">
                    <BookOpen size={24} />
                  </div>
                  <span className={`level-badge ${topic.level.toLowerCase()}`}>
                    {topic.level}
                  </span>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <div className="topic-footer">
                  <span className="lessons-count">
                    <FileText size={16} />
                    {topic.lessons.length} ta dars
                  </span>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="lesson-view">
            <button className="back-btn" onClick={() => setSelectedTopic(null)}>
              <ChevronRight size={20} style={{transform: 'rotate(180deg)'}} />
              Barcha mavzular
            </button>

            <div className="lesson-header">
              <h2>{selectedTopic.title}</h2>
              <p>{selectedTopic.description}</p>
            </div>

            <div className="lessons-list">
              {selectedTopic.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="lesson-card card animate-slide-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="lesson-number">{index + 1}</div>
                  <div className="lesson-content">
                    <h4>{lesson.title}</h4>
                    <div className="lesson-example">
                      <FileText size={16} />
                      <p>{lesson.content}</p>
                    </div>
                  </div>
                  <button className="complete-btn">
                    <Check size={18} />
                    Tugallangan
                  </button>
                </div>
              ))}
            </div>

            <div className="practice-section">
              <div className="practice-card card">
                <div className="practice-icon">
                  <HelpCircle size={24} />
                </div>
                <h4>Mashq qilish</h4>
                <p>Bu mavzuni mustahkamlash uchun test ishlang</p>
                <button className="btn-primary">
                  Testni boshlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .grammar-page {
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

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .topic-card {
          cursor: pointer;
        }

        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .topic-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--gradient-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .level-badge {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }

        .level-badge.basic {
          background: rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        .level-badge.intermediate {
          background: rgba(245, 158, 11, 0.2);
          color: var(--warning);
        }

        .level-badge.advanced {
          background: rgba(239, 68, 68, 0.2);
          color: var(--error);
        }

        .topic-card h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .topic-card p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .topic-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .lessons-count {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .lesson-view {
          max-width: 800px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 24px;
          padding: 0;
        }

        .back-btn:hover {
          color: var(--secondary);
        }

        .lesson-header {
          margin-bottom: 32px;
        }

        .lesson-header h2 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .lesson-header p {
          color: var(--text-secondary);
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        .lesson-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .lesson-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .lesson-content {
          flex: 1;
        }

        .lesson-content h4 {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .lesson-example {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 8px;
          color: var(--text-secondary);
        }

        .lesson-example svg {
          flex-shrink: 0;
          color: var(--secondary);
        }

        .complete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface);
          border: 1px solid #2A3A5C;
          color: var(--text-secondary);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .complete-btn:hover {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .practice-section {
          margin-top: 40px;
        }

        .practice-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px;
        }

        .practice-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(247, 147, 30, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          margin-bottom: 16px;
        }

        .practice-card h4 {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .practice-card p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .topic-card h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default Grammar;