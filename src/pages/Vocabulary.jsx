import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Search, BookOpen, Play, Check, X, ChevronLeft, ChevronRight, RefreshCw, Calendar, Clock, Volume2, Pencil, ArrowRight } from 'lucide-react';

const Vocabulary = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [words, setWords] = useState([]);
  const [activeTab, setActiveTab] = useState(mode === 'flashcard' ? 'flashcards' : mode === 'review' ? 'review' : 'list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [reviewFinished, setReviewFinished] = useState(false);

  // AI Practice states
  const [aiPracticeActive, setAiPracticeActive] = useState(false);
  const [aiQuestion, setAiQuestion] = useState(null);
  const [aiUserAnswer, setAiUserAnswer] = useState('');
  const [aiShowResult, setAiShowResult] = useState(false);
  const [aiIsCorrect, setAiIsCorrect] = useState(null);
  const [aiScore, setAiScore] = useState({ correct: 0, incorrect: 0 });
  const [aiFinished, setAiFinished] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiCurrentIndex, setAiCurrentIndex] = useState(0);

  const [newWord, setNewWord] = useState({ word: '', translation: '', example: '', category: 'Basic' });

  const srsIntervals = [1, 3, 7, 15, 30];
  const categories = ['All', 'Basic', 'Intermediate', 'Advanced'];

  // Initial vocabulary words
  const defaultWords = [
    { id: 1, word: 'bacon', translation: 'bekon', example: 'Bacon is usually eaten on weekends.', category: 'Basic' },
    { id: 2, word: 'bagel', translation: 'non turi', example: 'Bagels are popular for breakfast in America.', category: 'Basic' },
    { id: 3, word: 'breakfast', translation: 'nonushta', example: 'I eat breakfast every morning.', category: 'Basic' },
    { id: 4, word: 'bright', translation: 'yorqin', example: 'Blue, pink, and yellow are bright colors.', category: 'Basic' },
    { id: 5, word: 'brother-in-law', translation: 'kuyov, pochcha', example: 'My brother-in-law is a doctor.', category: 'Advanced' },
    { id: 6, word: 'cereal', translation: 'yorma', example: 'Many Americans eat cereal for breakfast.', category: 'Basic' },
    { id: 7, word: 'chaotic', translation: 'tartibsiz', example: 'American breakfast can be chaotic.', category: 'Intermediate' },
    { id: 8, word: 'childhood', translation: 'bolalik', example: 'I remember my childhood.', category: 'Basic' },
    { id: 9, word: 'clothes', translation: 'kiyim', example: 'I like to wear comfortable clothes.', category: 'Basic' },
    { id: 10, word: 'coat', translation: 'kurtka', example: 'In winter, people wear big coats.', category: 'Basic' },
    { id: 11, word: 'coffee', translation: 'qahva', example: 'I always drink coffee in the morning.', category: 'Basic' },
    { id: 12, word: 'colorful', translation: 'rang-barang', example: 'Uzbek people love wearing colorful clothes.', category: 'Basic' },
  ];

  useEffect(() => {
    if (user) {
      loadWords();
    } else {
      const saved = localStorage.getItem('vocabulary');
      if (saved) {
        setWords(JSON.parse(saved));
      } else {
        // Load default words if no saved words
        setWords(defaultWords);
        localStorage.setItem('vocabulary', JSON.stringify(defaultWords));
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (words.length > 0 && !user) {
      localStorage.setItem('vocabulary', JSON.stringify(words));
    }
  }, [words, user]);

  const loadWords = async () => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error loading words:', error);
      const saved = localStorage.getItem('vocabulary');
      if (saved) {
        setWords(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveWord = async (wordData) => {
    const wordWithMeta = {
      ...wordData,
      user_id: user?.id || 'local',
      next_review: new Date().toISOString(),
      review_count: 0,
      last_review: null,
      created_at: new Date().toISOString()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('vocabulary')
          .insert([wordWithMeta])
          .select()
          .single();

        if (error) throw error;
        setWords([data, ...words]);
      } catch (error) {
        console.error('Error saving word:', error);
        const newWordObj = { ...wordWithMeta, id: Date.now() };
        setWords([newWordObj, ...words]);
      }
    } else {
      const newWordObj = { ...wordWithMeta, id: Date.now() };
      setWords([newWordObj, ...words]);
    }

    setShowAddModal(false);
    setNewWord({ word: '', translation: '', example: '', category: 'Basic' });
  };

  const handleEditWord = (word) => {
    setEditingWord({ ...word });
    setShowEditModal(true);
  };

  const saveEditedWord = async (updatedWord) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('vocabulary')
          .update({
            word: updatedWord.word,
            translation: updatedWord.translation,
            example: updatedWord.example,
            category: updatedWord.category
          })
          .eq('id', updatedWord.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating word:', error);
      }
    }
    setWords(words.map(w => w.id === updatedWord.id ? updatedWord : w));
    setShowEditModal(false);
    setEditingWord(null);
  };

  // Sort words alphabetically
  const sortedWords = useMemo(() => {
    return [...words].sort((a, b) => a.word.localeCompare(b.word));
  }, [words]);

  // Get words due for review - always recalculate from current words
  const dueWords = useMemo(() => {
    const now = new Date();
    return words.filter(word => {
      if (!word.next_review) return true;
      const nextReview = new Date(word.next_review);
      return nextReview <= now;
    });
  }, [words]);

  // Filter words for display
  const filteredWords = sortedWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || word.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateNextReview = (reviewCount) => {
    const intervalIndex = Math.min(reviewCount, srsIntervals.length - 1);
    const days = srsIntervals[intervalIndex];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString();
  };

  const markAsReviewed = async (word, correct) => {
    const newReviewCount = correct ? word.review_count + 1 : 0;
    const nextReview = calculateNextReview(newReviewCount);

    const updatedWord = {
      ...word,
      review_count: newReviewCount,
      last_review: new Date().toISOString(),
      next_review: nextReview
    };

    if (user) {
      try {
        await supabase
          .from('vocabulary')
          .update({
            review_count: newReviewCount,
            last_review: updatedWord.last_review,
            next_review: nextReview
          })
          .eq('id', word.id);
      } catch (error) {
        console.error('Error updating word:', error);
      }
    }

    // Update words state
    const updatedWords = words.map(w => w.id === word.id ? updatedWord : w);
    setWords(updatedWords);

    // Check if there are still due words
    const remainingDue = updatedWords.filter(w => {
      if (!w.next_review) return true;
      return new Date(w.next_review) <= new Date();
    });

    if (remainingDue.length === 0) {
      setReviewFinished(true);
    } else if (currentCard >= remainingDue.length) {
      setCurrentCard(Math.max(0, remainingDue.length - 1));
    }
    setFlipped(false);
  };

  const handleNextCard = () => {
    const nextIndex = (currentCard + 1) % filteredWords.length;
    setCurrentCard(nextIndex);
    setFlipped(false);
  };

  const handlePrevCard = () => {
    const prevIndex = (currentCard - 1 + filteredWords.length) % filteredWords.length;
    setCurrentCard(prevIndex);
    setFlipped(false);
  };

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const getNextReviewText = (nextReview) => {
    if (!nextReview) return 'Hozir organish kerak';
    const now = new Date();
    const next = new Date(nextReview);
    const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Hozir organish kerak';
    if (diff === 1) return '1 kun keyin';
    if (diff < 7) return `${diff} kun keyin`;
    if (diff < 30) return `${Math.ceil(diff / 7)} hafta keyin`;
    return `${Math.ceil(diff / 30)} oy keyin`;
  };

  const resetReview = () => {
    setCurrentCard(0);
    setFlipped(false);
    setReviewFinished(false);
  };

  // AI Practice Functions
  const generateAIQuestions = () => {
    if (words.length < 3) return [];

    // Select random words for practice
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(10, words.length));

    const questions = selectedWords.map(word => {
      // Create a question based on the word
      const templates = [
        { question: `"${word.translation}" so'zini inglizchada qanday yoziladi?`, answer: word.word },
        { question: `"${word.word}" so'zining o'zbekcha tarjimasi nima?`, answer: word.translation },
        { question: `"${word.translation}" - bu so'zning inglizchasi write in English:`, answer: word.word },
      ];
      const template = templates[Math.floor(Math.random() * templates.length)];
      return { ...template, word };
    });

    return questions;
  };

  const startAIPractice = () => {
    const questions = generateAIQuestions();
    if (questions.length > 0) {
      setAiQuestions(questions);
      setAiCurrentIndex(0);
      setAiQuestion(questions[0]);
      setAiUserAnswer('');
      setAiShowResult(false);
      setAiIsCorrect(null);
      setAiScore({ correct: 0, incorrect: 0 });
      setAiFinished(false);
      setAiPracticeActive(true);
    }
  };

  // Handle Enter key for AI practice
  useEffect(() => {
    if (activeTab !== 'ai-practice' || !aiPracticeActive || aiFinished) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (!aiShowResult && aiUserAnswer.trim()) {
          checkAIAnswer();
        } else if (aiShowResult) {
          nextAIQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, aiPracticeActive, aiFinished, aiShowResult, aiUserAnswer]);

  // Auto-focus input for AI practice
  useEffect(() => {
    if (activeTab === 'ai-practice' && aiPracticeActive && !aiFinished && !aiShowResult) {
      setTimeout(() => {
        const input = document.querySelector('.ai-practice .input-field');
        if (input) input.focus();
      }, 100);
    }
  }, [activeTab, aiPracticeActive, aiFinished, aiShowResult, aiCurrentIndex]);

  const checkAIAnswer = () => {
    const currentQ = aiQuestions[aiCurrentIndex];
    const userAnswer = aiUserAnswer.trim().toLowerCase();
    const correctAnswer = currentQ.answer.trim().toLowerCase();

    // Simple check - check if the answer is close enough
    const isCorrect = userAnswer === correctAnswer ||
      userAnswer.includes(correctAnswer) ||
      correctAnswer.includes(userAnswer);

    setAiIsCorrect(isCorrect);
    setAiShowResult(true);

    if (isCorrect) {
      setAiScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setAiScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const nextAIQuestion = () => {
    if (aiCurrentIndex < aiQuestions.length - 1) {
      setAiCurrentIndex(prev => prev + 1);
      setAiQuestion(aiQuestions[aiCurrentIndex + 1]);
      setAiUserAnswer('');
      setAiShowResult(false);
      setAiIsCorrect(null);
    } else {
      setAiFinished(true);
    }
  };

  const closeAIPractice = () => {
    setAiPracticeActive(false);
    setAiFinished(false);
    setAiQuestions([]);
    setAiCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="vocabulary-page">
        <div className="page-inner">
          <div className="loading">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-page">
      <div className="page-inner">
        <div className="page-header">
          <div className="header-content">
            <h1>Lugat</h1>
            <p>{words.length} soz, {dueWords.length} takrorlash uchun tayyor</p>
          </div>
          <div className="header-actions">
            <button
              className={`btn-secondary ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => { setActiveTab('list'); setReviewFinished(false); }}
            >
              <Search size={18} />
              Royxat
            </button>
            <button
              className={`btn-secondary ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => { setActiveTab('review'); resetReview(); }}
            >
              <RefreshCw size={18} />
              Takrorlash
              {dueWords.length > 0 && <span className="badge">{dueWords.length}</span>}
            </button>
            <button
              className={`btn-primary ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => { setActiveTab('flashcards'); setCurrentCard(0); setFlipped(false); }}
            >
              <Play size={18} />
              Flashcard
            </button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Qoshish
            </button>
            <button
              className={`btn-secondary ${activeTab === 'ai-practice' ? 'active' : ''}`}
              onClick={() => { startAIPractice(); setActiveTab('ai-practice'); }}
              disabled={words.length < 3}
            >
              <BookOpen size={18} />
              AI Test
            </button>
          </div>
        </div>

        {/* Add Word Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Yangi so'z qo'shish</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); saveWord(newWord); }}>
                <div className="form-group">
                  <label>Inglizcha so'z *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="masalan: Beautiful"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tarjima *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="masalan: Chiroyli"
                    value={newWord.translation}
                    onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Misol gap *</label>
                  <textarea
                    className="input-field"
                    placeholder="masalan: She has a beautiful smile."
                    value={newWord.example}
                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                    required
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Doraja</label>
                  <select
                    className="input-field"
                    value={newWord.category}
                    onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                  >
                    <option value="Basic">Basic - Asosiy</option>
                    <option value="Intermediate">Intermediate - Ortacha</option>
                    <option value="Advanced">Advanced - Murakkab</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn-primary">
                    <Plus size={18} />
                    Qoshish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Word Modal */}
        {showEditModal && editingWord && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>So'zni tahrirlash</h3>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); saveEditedWord(editingWord); }}>
                <div className="form-group">
                  <label>Inglizcha so'z *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingWord.word}
                    onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tarjima *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingWord.translation}
                    onChange={(e) => setEditingWord({ ...editingWord, translation: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Misol gap *</label>
                  <textarea
                    className="input-field"
                    value={editingWord.example}
                    onChange={(e) => setEditingWord({ ...editingWord, example: e.target.value })}
                    required
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Doraja</label>
                  <select
                    className="input-field"
                    value={editingWord.category}
                    onChange={(e) => setEditingWord({ ...editingWord, category: e.target.value })}
                  >
                    <option value="Basic">Basic - Asosiy</option>
                    <option value="Intermediate">Intermediate - Ortacha</option>
                    <option value="Advanced">Advanced - Murakkab</option>
                  </select>
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

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="review-section">
            {reviewFinished || dueWords.length === 0 ? (
              <div className="empty-review">
                <Check size={64} className="success-icon" />
                <h2>Barcha so'zlar takrorlandi!</h2>
                <p>Keyingi takrorlash uchun kuting</p>
                <div className="next-review-info">
                  {words.length > 0 ? (
                    <span>Keyingi takrorlash: {getNextReviewText(words.find(w => w.next_review)?.next_review)}</span>
                  ) : (
                    <span>Haligacha so'z qo'shmagansiz</span>
                  )}
                </div>
                <button className="btn-primary" onClick={resetReview} style={{marginTop: '20px'}}>
                  <RefreshCw size={18} />
                  Qayta boshlash
                </button>
              </div>
            ) : (
              <>
                <div className="review-header">
                  <div className="review-info">
                    <h2>Bugungi takrorlash</h2>
                    <p>{dueWords.length} ta so'z takrorlash uchun tayyor</p>
                  </div>
                  <div className="srs-info card">
                    <Calendar size={20} />
                    <div>
                      <span className="srs-title">Spaced Repetition</span>
                      <span className="srs-desc">1, 3, 7, 15, 30 kun</span>
                    </div>
                  </div>
                </div>

                <div className="review-cards">
                  <div
                    className={`review-card card ${flipped ? 'flipped' : ''}`}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <div className="review-card-inner">
                      <div className="review-front">
                        <div className="review-word-header">
                          <span className={`category-badge ${dueWords[currentCard]?.category?.toLowerCase()}`}>
                            {dueWords[currentCard]?.category || 'Basic'}
                          </span>
                          <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speakWord(dueWords[currentCard]?.word || ''); }}>
                            <Volume2 size={20} />
                          </button>
                        </div>
                        <h2>{dueWords[currentCard]?.word || ''}</h2>
                        <p className="review-hint">Burchaklash uchun bosing</p>
                      </div>
                      <div className="review-back">
                        <h2>{dueWords[currentCard]?.translation || ''}</h2>
                        <p className="review-example">"{dueWords[currentCard]?.example || ''}"</p>
                        <div className="review-level">
                          <span>Takrorlash #{dueWords[currentCard]?.review_count + 1 || 1}</span>
                          <span>{srsIntervals[Math.min(dueWords[currentCard]?.review_count || 0, srsIntervals.length - 1)]} kun</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="review-controls">
                  <span className="review-counter">
                    {currentCard + 1} / {dueWords.length}
                  </span>
                  <div className="review-buttons">
                    <button
                      className="btn-incorrect"
                      onClick={() => {
                        if (dueWords[currentCard]) {
                          markAsReviewed(dueWords[currentCard], false);
                        }
                      }}
                    >
                      <X size={20} />
                      Notogri
                    </button>
                    <button
                      className="btn-correct"
                      onClick={() => {
                        if (dueWords[currentCard]) {
                          markAsReviewed(dueWords[currentCard], true);
                        }
                      }}
                    >
                      <Check size={20} />
                      Togri
                    </button>
                  </div>
                </div>

                <div className="review-progress">
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${dueWords.length > 0 ? ((currentCard + 1) / dueWords.length) * 100 : 100}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="list-view">
            <div className="filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="category-filter">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredWords.length > 0 ? (
              <div className="words-grid">
                {filteredWords.map((word, index) => (
                  <div
                    key={word.id}
                    className={`word-card card animate-slide-up ${word.review_count > 0 ? 'learned' : ''}`}
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="word-header">
                      <span className={`category-badge ${word.category?.toLowerCase() || 'basic'}`}>
                        {word.category || 'Basic'}
                      </span>
                      <button className="edit-btn" onClick={() => handleEditWord(word)}>
                        <Pencil size={16} />
                      </button>
                    </div>
                    <div className="word-content">
                      <div className="word-row">
                        <h3>{word.word}</h3>
                        <button className="speak-btn-small" onClick={() => speakWord(word.word)}>
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <p className="translation">{word.translation}</p>
                      <p className="example">{word.example}</p>
                    </div>
                    <div className="word-footer">
                      <span className="next-review">
                        <Clock size={14} />
                        {getNextReviewText(word.next_review)}
                      </span>
                      <div className="srs-progress">
                        <div className="srs-dots">
                          {[1, 3, 7, 15, 30].map((day, i) => (
                            <span
                              key={day}
                              className={`srs-dot ${(word.review_count || 0) >= i + 1 ? 'filled' : ''}`}
                            >
                              <span className="srs-tooltip">{day}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>So'zlar topilmadi</h3>
                <p>Yangi so'z qo'shing yoki qidiruv sozini ozgartiring</p>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={18} />
                  So'z qo'shish
                </button>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="flashcard-view">
            {filteredWords.length > 0 ? (
              <div className="flashcard-container">
                <div
                  className={`flashcard ${flipped ? 'flipped' : ''}`}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front card">
                      <span className="card-category">
                        {filteredWords[currentCard]?.category || 'Basic'}
                      </span>
                      <h2>{filteredWords[currentCard]?.word}</h2>
                      <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speakWord(filteredWords[currentCard]?.word || ''); }}>
                        <Volume2 size={24} />
                      </button>
                      <p className="tap-hint">Burchaklash uchun bosing</p>
                    </div>
                    <div className="flashcard-back card">
                      <h2>{filteredWords[currentCard]?.translation}</h2>
                      <p className="example">"{filteredWords[currentCard]?.example}"</p>
                    </div>
                  </div>
                </div>
                <div className="flashcard-controls">
                  <button className="control-btn" onClick={handlePrevCard}>
                    <ChevronLeft size={24} />
                  </button>
                  <span className="card-counter">
                    {currentCard + 1} / {filteredWords.length}
                  </span>
                  <button className="control-btn" onClick={handleNextCard}>
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>So'zlar topilmadi</h3>
                <p>Yangi so'z qo'shing</p>
              </div>
            )}
          </div>
        )}

        {/* AI Practice Tab */}
        {activeTab === 'ai-practice' && (
          <div className="ai-practice-section">
            {!aiPracticeActive ? (
              <div className="ai-start card">
                <BookOpen size={64} className="ai-icon" />
                <h2>AI Tarjima Testi</h2>
                <p>Tanlangan so'zlaringiz asosida o'zbekcha gaplar beriladi, siz inglizcha tarjimasini yozing</p>
                <div className="ai-info">
                  <span><BookOpen size={16} /> {words.length} ta so'z</span>
                </div>
                <button className="btn-primary btn-lg" onClick={startAIPractice} disabled={words.length < 3}>
                  <Play size={20} /> Boshlash
                </button>
                {words.length < 3 && <p className="ai-hint">Kamida 3 ta so'z kerak</p>}
              </div>
            ) : aiFinished ? (
              <div className="ai-result card">
                <div className={`result-icon ${aiScore.correct > aiScore.incorrect ? 'success' : 'warning'}`}>
                  {aiScore.correct > aiScore.incorrect ? <Check size={64} /> : <X size={64} />}
                </div>
                <h2>Test Yakunlandi!</h2>
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-value correct">{aiScore.correct}</span>
                    <span className="stat-label">To'g'ri</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value incorrect">{aiScore.incorrect}</span>
                    <span className="stat-label">Noto'g'ri</span>
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
            ) : (
              <div className="ai-practice">
                <div className="practice-header">
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
                      placeholder="Inglizcha javob yozing..."
                      value={aiUserAnswer}
                      onChange={(e) => setAiUserAnswer(e.target.value)}
                      disabled={aiShowResult}
                    />
                  </div>

                  {aiShowResult && (
                    <div className={`answer-feedback ${aiIsCorrect ? 'correct' : 'incorrect'}`}>
                      {aiIsCorrect ? (
                        <div className="feedback-content correct">
                          <Check size={24} /> <span>To'g'ri!</span>
                        </div>
                      ) : (
                        <div className="feedback-content incorrect">
                          <X size={24} />
                          <div className="correct-answer">
                            <span>To'g'ri javob:</span>
                            <strong>{aiQuestion?.answer}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="practice-actions">
                  {!aiShowResult ? (
                    <button className="btn-primary" onClick={checkAIAnswer} disabled={!aiUserAnswer.trim()}>
                      Tekshirish
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={nextAIQuestion}>
                      {aiCurrentIndex < aiQuestions.length - 1 ? 'Keyingi savol' : 'Natijani ko\'rish'} <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .vocabulary-page {
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

        .badge {
          background: var(--error);
          color: white;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 10px;
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

        .review-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .review-info h2 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .review-info p {
          color: var(--text-secondary);
        }

        .srs-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
        }

        .srs-info svg {
          color: var(--secondary);
        }

        .srs-info div {
          display: flex;
          flex-direction: column;
        }

        .srs-title {
          font-weight: 600;
        }

        .srs-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .review-cards {
          margin-bottom: 24px;
        }

        .review-card {
          height: 350px;
          cursor: pointer;
          perspective: 1000px;
        }

        .review-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .review-card.flipped .review-card-inner {
          transform: rotateY(180deg);
        }

        .review-front,
        .review-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px;
        }

        .review-back {
          transform: rotateY(180deg);
        }

        .review-word-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 16px;
        }

        .speak-btn {
          background: none;
          border: none;
          color: var(--secondary);
          cursor: pointer;
          padding: 8px;
          transition: transform 0.3s ease;
        }

        .speak-btn:hover {
          transform: scale(1.1);
        }

        .review-card h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .review-hint {
          position: absolute;
          bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .review-example {
          color: var(--text-secondary);
          font-style: italic;
          margin-bottom: 20px;
        }

        .review-level {
          display: flex;
          gap: 16px;
          color: var(--secondary);
          font-size: 14px;
        }

        .review-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .review-counter {
          font-size: 18px;
          font-weight: 600;
        }

        .review-buttons {
          display: flex;
          gap: 16px;
        }

        .btn-incorrect,
        .btn-correct {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-incorrect {
          background: var(--error);
          color: white;
        }

        .btn-correct {
          background: var(--success);
          color: white;
        }

        .btn-incorrect:hover,
        .btn-correct:hover {
          transform: translateY(-2px);
        }

        .review-progress {
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-review {
          text-align: center;
          padding: 60px;
        }

        .empty-review .success-icon {
          color: var(--success);
          margin-bottom: 24px;
        }

        .empty-review h2 {
          margin-bottom: 8px;
        }

        .empty-review p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .next-review-info {
          color: var(--secondary);
          font-weight: 500;
        }

        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          border: 1px solid #2A3A5C;
          border-radius: 8px;
          padding: 12px 16px;
          flex: 1;
          min-width: 250px;
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

        .category-filter {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          background: var(--surface);
          border: 1px solid #2A3A5C;
          color: var(--text-secondary);
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: var(--secondary);
          color: white;
          border-color: var(--secondary);
        }

        .words-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .word-card {
          position: relative;
        }

        .word-card.learned {
          border: 1px solid var(--success);
        }

        .word-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-badge {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }

        .category-badge.basic { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .category-badge.intermediate { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
        .category-badge.advanced { background: rgba(239, 68, 68, 0.2); color: var(--error); }

        .edit-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .word-card:hover .edit-btn {
          opacity: 1;
        }

        .edit-btn:hover {
          color: var(--secondary);
        }

        .word-content {
          margin-bottom: 12px;
        }

        .word-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .word-card h3 {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .speak-btn-small {
          background: none;
          border: none;
          color: var(--secondary);
          cursor: pointer;
          padding: 4px;
        }

        .translation {
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .example {
          color: var(--text-secondary);
          font-size: 14px;
          font-style: italic;
        }

        .word-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .next-review {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .srs-progress {
          display: flex;
          align-items: center;
        }

        .srs-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .srs-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .srs-dot.filled {
          background: linear-gradient(135deg, #F7931E 0%, #FFB84D 100%);
          border-color: #F7931E;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(247, 147, 30, 0.4);
        }

        .srs-tooltip {
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--surface);
          color: var(--text-primary);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
        }

        .srs-dot:hover .srs-tooltip {
          opacity: 1;
          visibility: visible;
        }

        .flashcard-view {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .flashcard-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
        }

        .flashcard {
          width: 100%;
          height: 320px;
          perspective: 1000px;
          cursor: pointer;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }

        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px;
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }

        .flashcard-front h2,
        .flashcard-back h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .flashcard-back .example {
          color: var(--text-secondary);
          font-style: italic;
        }

        .tap-hint {
          position: absolute;
          bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .flashcard-controls {
          display: flex;
          align-items: center;
          gap: 32px;
          margin-top: 24px;
        }

        .control-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid #2A3A5C;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: var(--secondary);
          border-color: var(--secondary);
        }

        .card-counter {
          font-size: 18px;
          font-weight: 600;
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

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .filters {
            flex-direction: column;
          }

          .category-filter {
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .review-buttons {
            flex-direction: column;
            width: 100%;
          }

          .btn-incorrect,
          .btn-correct {
            width: 100%;
            justify-content: center;
          }
        }

        /* AI Practice Styles */
        .ai-practice-section {
          max-width: 600px;
          margin: 0 auto;
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

        .ai-info {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
          color: var(--text-secondary);
        }

        .ai-info span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ai-hint {
          color: var(--error);
          font-size: 14px;
          margin-top: 12px;
        }

        .btn-lg {
          padding: 16px 32px;
          font-size: 18px;
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

        .stat-value.correct {
          color: var(--success);
        }

        .stat-value.incorrect {
          color: var(--error);
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .result-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .ai-practice .practice-header {
          margin-bottom: 24px;
        }

        .ai-practice .question-counter {
          display: block;
          text-align: center;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .ai-practice .question-card {
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

        .ai-practice .answer-feedback {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
        }

        .ai-practice .answer-feedback.correct {
          background: rgba(110, 231, 183, 0.1);
          border: 1px solid var(--success);
        }

        .ai-practice .answer-feedback.incorrect {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
        }

        .ai-practice .feedback-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-practice .feedback-content.correct {
          color: var(--success);
        }

        .ai-practice .feedback-content.incorrect {
          color: var(--error);
        }

        .ai-practice .correct-answer {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ai-practice .correct-answer span {
          font-size: 12px;
          opacity: 0.8;
        }

        .ai-practice .practice-actions {
          text-align: center;
        }

        .ai-practice .practice-actions button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default Vocabulary;