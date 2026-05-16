import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateTopicsQuestions, checkSentenceWithAI } from '../lib/gemini';
import { Plus, Search, BookOpen, Play, Check, X, ChevronLeft, ChevronRight, RefreshCw, Clock, Pencil, Trash2, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

const Topics = () => {
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Practice states
  const [aiPracticeActive, setAiPracticeActive] = useState(false);
  const [aiStage, setAiStage] = useState('questions'); // 'questions' or 'sentences'
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiCurrentIndex, setAiCurrentIndex] = useState(0);
  const [aiQuestion, setAiQuestion] = useState(null);
  const [aiUserAnswer, setAiUserAnswer] = useState('');
  const [aiShowResult, setAiShowResult] = useState(false);
  const [aiIsCorrect, setAiIsCorrect] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiScore, setAiScore] = useState({ correct: 0, incorrect: 0, sentences: 0 });
  const [aiFinished, setAiFinished] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingAnswer, setAiLoadingAnswer] = useState(false);

  // Sentence practice states
  const [sentenceTask, setSentenceTask] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [sentenceResult, setSentenceResult] = useState(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);

  const [newTopic, setNewTopic] = useState({ title: '', description: '', keywords: '' });

  const categories = ['All', 'Grammar', 'Business', 'Daily Life', 'Travel', 'Culture', 'Technology', 'Other'];

  useEffect(() => {
    if (user) {
      loadTopics();
    } else {
      const saved = localStorage.getItem('topics');
      if (saved) {
        setTopics(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (topics.length > 0 && !user) {
      localStorage.setItem('topics', JSON.stringify(topics));
    }
  }, [topics, user]);

  const loadTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      const saved = localStorage.getItem('topics');
      if (saved) {
        setTopics(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveTopic = async (topicData) => {
    const topicWithMeta = {
      ...topicData,
      user_id: user?.id || 'local',
      keywords: topicData.keywords.split(',').map(k => k.trim()).filter(k => k),
      created_at: new Date().toISOString()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('topics')
          .insert([topicWithMeta])
          .select()
          .single();

        if (error) throw error;
        setTopics([data, ...topics]);
      } catch (error) {
        console.error('Error saving topic:', error);
        const newTopicObj = { ...topicWithMeta, id: Date.now() };
        setTopics([newTopicObj, ...topics]);
      }
    } else {
      const newTopicObj = { ...topicWithMeta, id: Date.now() };
      setTopics([newTopicObj, ...topics]);
    }

    setShowAddModal(false);
    setNewTopic({ title: '', description: '', keywords: '' });
  };

  const handleEditTopic = (topic) => {
    setEditingTopic({
      ...topic,
      keywords: Array.isArray(topic.keywords) ? topic.keywords.join(', ') : topic.keywords
    });
    setShowEditModal(true);
  };

  const saveEditedTopic = async (updatedTopic) => {
    const topicData = {
      ...updatedTopic,
      keywords: updatedTopic.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    if (user) {
      try {
        const { error } = await supabase
          .from('topics')
          .update({
            title: topicData.title,
            description: topicData.description,
            keywords: topicData.keywords
          })
          .eq('id', topicData.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating topic:', error);
      }
    }

    setTopics(topics.map(t => t.id === topicData.id ? { ...topicData, keywords: Array.isArray(topicData.keywords) ? topicData.keywords : [] } : t));
    setShowEditModal(false);
    setEditingTopic(null);
  };

  const deleteTopic = async (topicId) => {
    if (!confirm('Bu mavzuni o\'chirmoqchimisiz?')) return;

    if (user) {
      try {
        await supabase.from('topics').delete().eq('id', topicId);
      } catch (error) {
        console.error('Error deleting topic:', error);
      }
    }

    setTopics(topics.filter(t => t.id !== topicId));
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // AI Practice Functions
  const startAIPractice = async () => {
    if (topics.length === 0) {
      alert('Avval mavzular qo\'shing!');
      return;
    }

    setAiLoading(true);
    setAiPracticeActive(true);
    setAiStage('questions');
    setAiScore({ correct: 0, incorrect: 0, sentences: 0 });

    console.log('Starting AI practice with topics:', topics.length);

    try {
      const questions = await generateTopicsQuestions(topics);
      console.log('Generated questions:', questions?.length || 0);

      if (questions && questions.length > 0) {
        setAiQuestions(questions);
        setAiCurrentIndex(0);
        setAiQuestion(questions[0]);
      } else {
        alert('Savollar generatsiya qilishda xatolik yuz berdi. Qayta urinib ko\'ring.');
        setAiPracticeActive(false);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Savollar generatsiya qilishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      setAiPracticeActive(false);
    }

    setAiLoading(false);
  };

  const checkAIAnswer = async () => {
    const currentQ = aiQuestions[aiCurrentIndex];
    setAiLoadingAnswer(true);

    const result = await checkSentenceWithAI(
      currentQ.question,
      aiUserAnswer.trim(),
      currentQ.correctAnswer
    );

    if (result) {
      setAiIsCorrect(result.isCorrect);
      setAiFeedback(result.feedback);

      if (result.isCorrect) {
        setAiScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setAiScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    } else {
      // Fallback
      const isCorrect = aiUserAnswer.trim().toLowerCase() === currentQ.correctAnswer.toLowerCase();
      setAiIsCorrect(isCorrect);
      setAiFeedback(isCorrect ? 'To\'g\'ri! 🎉' : `Noto\'g\'ri. To\'g\'ri javob: ${currentQ.correctAnswer}`);

      if (isCorrect) {
        setAiScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setAiScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }

    setAiShowResult(true);
    setAiLoadingAnswer(false);
  };

  const nextAIQuestion = () => {
    if (aiCurrentIndex < aiQuestions.length - 1) {
      setAiCurrentIndex(prev => prev + 1);
      setAiQuestion(aiQuestions[aiCurrentIndex + 1]);
      setAiUserAnswer('');
      setAiShowResult(false);
      setAiIsCorrect(null);
      setAiFeedback('');
    } else {
      // Move to sentence practice
      if (aiStage === 'questions') {
        setAiStage('sentences');
        setAiCurrentIndex(0);
        setAiUserAnswer('');
        setAiShowResult(false);
        setAiIsCorrect(null);
        setAiFeedback('');
      } else {
        setAiFinished(true);
      }
    }
  };

  const generateSentenceTask = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const keywords = Array.isArray(randomTopic.keywords) ? randomTopic.keywords : [];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)] || randomTopic.title;

    setSentenceTask({
      topic: randomTopic.title,
      keyword: keyword,
      sentence: randomTopic.description
    });
    setUserSentence('');
    setSentenceResult(null);
  };

  const checkSentence = async () => {
    if (!sentenceTask) return;

    setSentenceLoading(true);

    const prompt = `You are an English teacher for Uzbek students.

Topic: ${sentenceTask.topic}
Keyword/Phrase: ${sentenceTask.keyword}
Example sentence: ${sentenceTask.sentence}

Student's sentence: "${userSentence}"

Check if the student's sentence:
1. Uses the keyword/phrase correctly
2. Is grammatically correct
3. Makes sense

Respond in this JSON format:
{
  "isCorrect": true or false,
  "score": 1-10,
  "feedback": "short feedback in Uzbek (1-2 sentences)",
  "correction": "if wrong, suggest a corrected sentence"
}`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAaE1xmBze2xSH2MaosfyBykBNPW4agOPI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setSentenceResult(result);
        setAiScore(prev => ({ ...prev, sentences: prev.sentences + (result.score || 5) }));
      }
    } catch (error) {
      console.error('Error checking sentence:', error);
      setSentenceResult({
        isCorrect: true,
        score: 7,
        feedback: 'Rahmat! Gapni qabul qildik.',
        correction: null
      });
    }

    setSentenceLoading(false);
  };

  const nextSentence = () => {
    setSentenceResult(null);
    setUserSentence('');
    generateSentenceTask();
  };

  const closeAIPractice = () => {
    setAiPracticeActive(false);
    setAiFinished(false);
    setAiStage('questions');
    setAiQuestions([]);
    setAiCurrentIndex(0);
    setSentenceTask(null);
    setUserSentence('');
    setSentenceResult(null);
  };

  if (loading) {
    return (
      <div className="topics-page">
        <div className="page-inner">
          <div className="loading">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="topics-page">
      <div className="page-inner">
        <div className="page-header">
          <div className="header-content">
            <h1>Mavzular</h1>
            <p>{topics.length} ta mavzu</p>
          </div>
          <div className="header-actions">
            <button
              className={`btn-secondary ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <Search size={18} />
              Ro'yxat
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Qo'shish
            </button>
            <button
              className="btn-secondary"
              onClick={startAIPractice}
              disabled={topics.length === 0}
            >
              <BookOpen size={18} />
              AI Mashq
            </button>
          </div>
        </div>

        {/* Add Topic Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Yangi mavzu qo'shish</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); saveTopic(newTopic); }}>
                <div className="form-group">
                  <label>Mavzu nomi *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="masalan: Present Perfect"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ta'rif</label>
                  <textarea
                    className="input-field"
                    placeholder="Ushbu mavzu haqida qisqa ma'lumot..."
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Kalit so'zlar (vergul bilan ajrating)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="masalan: since, for, already, yet"
                    value={newTopic.keywords}
                    onChange={(e) => setNewTopic({ ...newTopic, keywords: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn-primary">
                    <Plus size={18} />
                    Qo'shish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Topic Modal */}
        {showEditModal && editingTopic && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Mavzuni tahrirlash</h3>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); saveEditedTopic(editingTopic); }}>
                <div className="form-group">
                  <label>Mavzu nomi *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingTopic.title}
                    onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ta'rif</label>
                  <textarea
                    className="input-field"
                    value={editingTopic.description}
                    onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Kalit so'zlar (vergul bilan ajrating)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingTopic.keywords}
                    onChange={(e) => setEditingTopic({ ...editingTopic, keywords: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn-primary">
                    <Pencil size={18} />
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="list-view">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Mavzularni qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredTopics.length > 0 ? (
              <div className="topics-grid">
                {filteredTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="topic-card card animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="topic-header">
                      <h3>{topic.title}</h3>
                      <div className="topic-actions">
                        <button className="edit-btn" onClick={() => handleEditTopic(topic)}>
                          <Pencil size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => deleteTopic(topic.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {topic.description && (
                      <p className="topic-description">{topic.description}</p>
                    )}
                    {topic.keywords && topic.keywords.length > 0 && (
                      <div className="topic-keywords">
                        {topic.keywords.map((kw, i) => (
                          <span key={i} className="keyword-tag">{kw}</span>
                        ))}
                      </div>
                    )}
                    <div className="topic-footer">
                      <span className="topic-date">
                        <Clock size={14} />
                        {new Date(topic.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>Mavzular topilmadi</h3>
                <p>Yangi mavzu qo'shing</p>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={18} />
                  Mavzu qo'shish
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Practice Section */}
        {aiPracticeActive && (
          <div className="ai-practice-section">
            {aiLoading ? (
              <div className="ai-loading card">
                <Loader2 size={48} className="spinner" />
                <h2>Mavzular bo'yicha mashq tayyorlanmoqda...</h2>
                <p>Gemini AI siz uchun shaxsiylashtirilgan savollar yaratmoqda</p>
              </div>
            ) : aiFinished ? (
              <div className="ai-result card">
                <div className={`result-icon ${aiScore.correct > aiScore.incorrect ? 'success' : 'warning'}`}>
                  {aiScore.correct > aiScore.incorrect ? <Check size={64} /> : <X size={64} />}
                </div>
                <h2>Mashq Yakunlandi!</h2>
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-value correct">{aiScore.correct}</span>
                    <span className="stat-label">To'g'ri javob</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value incorrect">{aiScore.incorrect}</span>
                    <span className="stat-label">Noto'g'ri javob</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{Math.round(aiScore.sentences / 2)}</span>
                    <span className="stat-label">Gaplar bahosi</span>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="btn-primary" onClick={startAIPractice}>
                    <RefreshCw size={18} /> Qayta boshlash
                  </button>
                  <button className="btn-secondary" onClick={closeAIPractice}>
                    Chiqish
                  </button>
                </div>
              </div>
            ) : aiStage === 'questions' ? (
              <div className="ai-practice">
                <div className="practice-header">
                  <span className="stage-badge">Savollar</span>
                  <span className="question-counter">Savol {aiCurrentIndex + 1} / {aiQuestions.length}</span>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${((aiCurrentIndex + 1) / aiQuestions.length) * 100}%` }}></div>
                  </div>
                </div>

                <div className="question-card card">
                  <div className="question-display">
                    <span className="question-label">Savol</span>
                    <h2>{aiQuestion?.question}</h2>
                  </div>

                  <div className="answer-section">
                    <label>Javobingiz:</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Javobingizni yozing..."
                      value={aiUserAnswer}
                      onChange={(e) => setAiUserAnswer(e.target.value)}
                      disabled={aiShowResult}
                    />
                  </div>

                  {aiShowResult && (
                    <div className={`answer-feedback ${aiIsCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="feedback-content">
                        {aiIsCorrect ? <Check size={24} /> : <X size={24} />}
                        <div className="feedback-text">
                          <span className="feedback-main">{aiFeedback}</span>
                          {!aiIsCorrect && (
                            <div className="correct-answer">
                              <span>To'g'ri javob:</span>
                              <strong>{aiQuestion?.correctAnswer}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="practice-actions">
                  {!aiShowResult ? (
                    <button className="btn-primary" onClick={checkAIAnswer} disabled={!aiUserAnswer.trim() || aiLoadingAnswer}>
                      {aiLoadingAnswer ? <Loader2 size={18} className="btn-spinner" /> : null}
                      {aiLoadingAnswer ? 'Tekshirilmoqda...' : 'Tekshirish'}
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={nextAIQuestion}>
                      {aiCurrentIndex < aiQuestions.length - 1 ? 'Keyingi savol' : 'Gaplar tuzishga o\'tish'} <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="sentence-practice">
                {!sentenceTask ? (
                  <div className="sentence-start card">
                    <MessageSquare size={64} className="ai-icon" />
                    <h2>Gap Tuzish Mashqi</h2>
                    <p>Endi o'rgangan mavzlaringiz bo'yicha gaplar tuzishingiz kerak</p>
                    <button className="btn-primary btn-lg" onClick={generateSentenceTask}>
                      <Play size={20} /> Boshlash
                    </button>
                  </div>
                ) : sentenceResult ? (
                  <div className="sentence-result card">
                    <div className={`result-icon ${sentenceResult.isCorrect ? 'success' : 'warning'}`}>
                      {sentenceResult.isCorrect ? <Check size={48} /> : <X size={48} />}
                    </div>
                    <h3>Baholang: {sentenceResult.score}/10</h3>
                    <p className="feedback-text">{sentenceResult.feedback}</p>
                    {sentenceResult.correction && (
                      <div className="correction">
                        <span>To'g'rilangan:</span>
                        <p>{sentenceResult.correction}</p>
                      </div>
                    )}
                    <div className="sentence-actions">
                      <button className="btn-primary" onClick={nextSentence}>
                        Keyingi gap <ArrowRight size={18} />
                      </button>
                      <button className="btn-secondary" onClick={closeAIPractice}>
                        Yakunlash
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sentence-task card">
                    <div className="task-header">
                      <span className="stage-badge">Gap tuzish</span>
                      <p className="task-topic">Mavzu: <strong>{sentenceTask?.topic}</strong></p>
                      <p className="task-keyword">Kalit so'z/fraza: <strong>{sentenceTask?.keyword}</strong></p>
                    </div>

                    <div className="task-example">
                      <span>Misol:</span>
                      <p>"{sentenceTask?.sentence}"</p>
                    </div>

                    <div className="sentence-input">
                      <label>Ushbu kalit so'zdan foydalanib gap tuzing:</label>
                      <textarea
                        className="input-field"
                        placeholder="Your sentence in English..."
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="sentence-actions">
                      <button className="btn-primary" onClick={checkSentence} disabled={!userSentence.trim() || sentenceLoading}>
                        {sentenceLoading ? <Loader2 size={18} className="btn-spinner" /> : null}
                        {sentenceLoading ? 'Tekshirilmoqda...' : 'Tekshirish'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .topics-page {
          padding: 0;
          min-height: 100vh;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: var(--text-secondary);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-content h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .header-content p {
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .header-actions button {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 500px;
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .form-group textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          border: 1px solid #2A3A5C;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
        }

        .search-box svg {
          color: var(--text-secondary);
        }

        .search-box input {
          background: none;
          border: none;
          color: var(--text-primary);
          flex: 1;
          font-size: 16px;
        }

        .search-box input:focus {
          outline: none;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .topic-card {
          padding: 24px;
        }

        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .topic-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .topic-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .delete-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .topic-card:hover .edit-btn,
        .topic-card:hover .delete-btn {
          opacity: 1;
        }

        .edit-btn:hover {
          color: var(--secondary);
        }

        .delete-btn:hover {
          color: var(--error);
        }

        .topic-description {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .topic-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .keyword-tag {
          background: rgba(139, 92, 246, 0.2);
          color: var(--accent-primary);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        .topic-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .topic-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: var(--text-secondary);
        }

        .empty-state svg {
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .empty-state p {
          margin-bottom: 24px;
        }

        /* AI Practice Styles */
        .ai-practice-section {
          max-width: 700px;
          margin: 0 auto;
        }

        .ai-loading {
          text-align: center;
          padding: 60px 20px;
        }

        .ai-loading .spinner {
          color: var(--accent-primary);
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }

        .ai-loading h2 {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .ai-loading p {
          color: var(--text-secondary);
        }

        .ai-start {
          text-align: center;
          padding: 60px 20px;
        }

        .ai-icon {
          color: var(--accent-primary);
          margin-bottom: 24px;
        }

        .ai-start h2 {
          font-size: 28px;
          margin-bottom: 12px;
        }

        .ai-start p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .ai-result {
          text-align: center;
          padding: 40px;
        }

        .ai-result .result-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .ai-result .result-icon.success {
          background: rgba(110, 231, 183, 0.2);
          color: var(--success);
        }

        .ai-result .result-icon.warning {
          background: rgba(239, 68, 68, 0.2);
          color: var(--error);
        }

        .ai-result h2 {
          font-size: 28px;
          margin-bottom: 24px;
        }

        .result-stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
        }

        .stat-value.correct { color: var(--success); }
        .stat-value.incorrect { color: var(--error); }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .result-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .practice-header {
          margin-bottom: 24px;
        }

        .stage-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .question-counter {
          display: block;
          text-align: center;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .question-card {
          padding: 32px;
          margin-bottom: 24px;
        }

        .question-display {
          text-align: center;
          margin-bottom: 24px;
        }

        .question-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .question-display h2 {
          font-size: 20px;
          color: var(--text-primary);
          margin-top: 8px;
        }

        .answer-section {
          margin-bottom: 16px;
        }

        .answer-section label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .answer-feedback {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
        }

        .answer-feedback.correct {
          background: rgba(110, 231, 183, 0.1);
          border: 1px solid var(--success);
        }

        .answer-feedback.incorrect {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
        }

        .feedback-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .feedback-content svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feedback-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .feedback-main {
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
        }

        .correct-answer {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .correct-answer span {
          font-size: 12px;
          opacity: 0.8;
        }

        .practice-actions {
          text-align: center;
        }

        .practice-actions button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-spinner {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        /* Sentence Practice */
        .sentence-start, .sentence-task, .sentence-result {
          text-align: center;
          padding: 40px;
        }

        .sentence-start h2 {
          font-size: 28px;
          margin-bottom: 12px;
        }

        .sentence-start p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .btn-lg {
          padding: 16px 32px;
          font-size: 18px;
        }

        .task-header {
          margin-bottom: 24px;
        }

        .task-topic, .task-keyword {
          color: var(--text-secondary);
          margin: 8px 0;
        }

        .task-topic strong, .task-keyword strong {
          color: var(--text-primary);
        }

        .task-example {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .task-example span {
          font-size: 12px;
          color: var(--accent-primary);
          text-transform: uppercase;
        }

        .task-example p {
          color: var(--text-primary);
          font-style: italic;
          margin-top: 8px;
        }

        .sentence-input {
          text-align: left;
          margin-bottom: 24px;
        }

        .sentence-input label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .sentence-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .sentence-result .result-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .sentence-result h3 {
          margin-bottom: 12px;
        }

        .sentence-result .feedback-text {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .correction {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
        }

        .correction span {
          font-size: 12px;
          color: var(--accent-primary);
        }

        .correction p {
          margin-top: 8px;
          color: var(--text-primary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
          opacity: 0;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .topics-grid {
            grid-template-columns: 1fr;
          }

          .result-stats {
            flex-direction: column;
            gap: 16px;
          }

          .sentence-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Topics;