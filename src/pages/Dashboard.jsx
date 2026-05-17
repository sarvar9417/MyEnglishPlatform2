import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  BookOpen,
  Clock,
  Trophy,
  Flame,
  ArrowRight,
  Play,
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  Brain,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    wordsLearned: 0,
    wordsToReview: 0,
    timeSpent: 0,
    testsCompleted: 0,
    streak: 0,
    accuracy: 0
  });

  const [todayWords, setTodayWords] = useState([]);

  // Load stats from localStorage or Supabase
  useEffect(() => {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Get today's review words
    const savedWords = localStorage.getItem('vocabulary');
    if (savedWords) {
      const words = JSON.parse(savedWords);
      const now = new Date();
      const dueWords = words.filter(word => {
        if (!word.next_review) return true;
        return new Date(word.next_review) <= now;
      });
      setTodayWords(dueWords);
      setStats(prev => ({ ...prev, wordsToReview: dueWords.length }));
    }
  }, []);

  const modules = [
    {
      id: 'vocabulary',
      title: 'Lugat',
      description: 'Sozlarni o\'rganish va takrorlash',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #F7931E 0%, #FFB84D 100%)',
      stat: `${stats.wordsLearned} ta o'rganilgan`,
      link: '/vocabulary'
    },
    {
      id: 'grammar',
      title: 'Grammatika',
      description: 'Grammatik qoidalar va misollar',
      icon: Brain,
      gradient: 'linear-gradient(135deg, #00C9A7 0%, #00E5BB 100%)',
      stat: '5 ta mavzu',
      link: '/grammar'
    },
    {
      id: 'tests',
      title: 'Testlar',
      description: 'Bilimlarni sinab korish',
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      stat: `${stats.testsCompleted} ta test`,
      link: '/tests'
    }
  ];

  const quickActions = [
    {
      id: 'review',
      title: 'Bugungi takrorlash',
      subtitle: `${stats.wordsToReview} ta so'z`,
      icon: RefreshCwIcon,
      color: '#F7931E',
      link: '/vocabulary?mode=review',
      badge: stats.wordsToReview > 0 ? `${stats.wordsToReview} ta` : null
    },
    {
      id: 'flashcard',
      title: 'Flashcard mashq',
      subtitle: 'Sozlarni yodlash',
      icon: Play,
      color: '#00C9A7',
      link: '/vocabulary?mode=flashcard'
    },
    {
      id: 'quick-test',
      title: 'Tezkor test',
      subtitle: '5 ta savol',
      icon: Target,
      color: '#8B5CF6',
      link: '/tests?type=vocabulary'
    }
  ];

  const recentActivity = [
    { type: 'word', text: '"Beautiful" sozi o\'rganildi', time: '2 soat oldin' },
    { type: 'test', text: 'Grammatika testi yakunlandi (80%)', time: '1 kun oldin' },
    { type: 'streak', text: '7 kun ketma-ketlik!', time: '2 kun oldin' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Salom, {user?.user_metadata?.full_name || 'Student'}!</h1>
            <p>Keling, bugungi o'rganishni boshlaylik</p>
          </div>
          <div className="header-right">
            <div className="streak-pill">
              <Flame size={18} />
              <span>{stats.streak || 14}</span>
              <span className="streak-label">kun ketma-ketlik</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card apple">
              <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #F7931E 0%, #FFB84D 100%)' }}>
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.wordsLearned || 127}</span>
                <span className="stat-label">O'rganilgan so'zlar</span>
              </div>
              <div className="stat-trend up">
                <TrendingUp size={14} />
                +12%
              </div>
            </div>

            <div className="stat-card apple">
              <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #00C9A7 0%, #00E5BB 100%)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.timeSpent || 26}</span>
                <span className="stat-label">Soat o'rganish</span>
              </div>
              <div className="stat-trend up">
                <TrendingUp size={14} />
                +8%
              </div>
            </div>

            <div className="stat-card apple">
              <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' }}>
                <Trophy size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.testsCompleted || 23}</span>
                <span className="stat-label">Testlar</span>
              </div>
              <div className="stat-trend up">
                <TrendingUp size={14} />
                +5%
              </div>
            </div>

            <div className="stat-card apple">
              <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)' }}>
                <Target size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.accuracy || 78}%</span>
                <span className="stat-label">Aniqlik</span>
              </div>
              <div className="stat-trend neutral">
                <TrendingUp size={14} />
                0%
              </div>
            </div>
          </div>
        </div>

        {/* Review Banner */}
        {stats.wordsToReview > 0 && (
          <div className="review-banner">
            <div className="banner-icon">
              <Sparkles size={24} />
            </div>
            <div className="banner-content">
              <h3>Bugungi takrorlash</h3>
              <p>{stats.wordsToReview} ta so'z takrorlash uchun tayyor</p>
            </div>
            <Link to="/vocabulary?mode=review" className="banner-btn">
              Boshlash
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Modules Section */}
        <div className="modules-section">
          <h2 className="section-title">O'rganish bo'limlari</h2>
          <div className="modules-grid">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={module.link}
                className="module-card apple"
              >
                <div className="module-icon" style={{ background: module.gradient }}>
                  <module.icon size={28} />
                </div>
                <div className="module-info">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <span className="module-stat">{module.stat}</span>
                </div>
                <ArrowRight size={20} className="module-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Tezkor harakatlar</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className="quick-action-card apple"
              >
                <div className="action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                  <action.icon size={22} />
                </div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.subtitle}</p>
                </div>
                {action.badge && <span className="action-badge">{action.badge}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Section */}
        <div className="activity-section">
          <h2 className="section-title">So'nggi faoliyat</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'word' && <BookOpen size={16} />}
                  {activity.type === 'test' && <Trophy size={16} />}
                  {activity.type === 'streak' && <Flame size={16} />}
                </div>
                <div className="activity-content">
                  <span>{activity.text}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 40px 48px;
          min-height: 100vh;
          background:
            radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
            var(--bg-primary);
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .header-left h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .header-left p {
          color: var(--text-secondary);
          font-size: 16px;
        }

        .streak-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
          padding: 12px 24px;
          border-radius: 24px;
          color: white;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
        }

        .streak-label {
          font-weight: 400;
          opacity: 0.9;
          font-size: 13px;
        }

        /* Stats Section */
        .stats-section {
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card.apple {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card.apple:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-md);
        }

        .stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .stat-trend.up {
          background: var(--success-bg);
          color: var(--success);
        }

        .stat-trend.neutral {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
        }

        /* Review Banner */
        .review-banner {
          display: flex;
          align-items: center;
          gap: 24px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 40px;
        }

        .banner-icon {
          width: 56px;
          height: 56px;
          background: var(--accent-gradient);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .banner-content {
          flex: 1;
        }

        .banner-content h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .banner-content p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .banner-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--accent-gradient);
          color: white;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .banner-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--accent-glow);
        }

        /* Section Title */
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }

        /* Modules Section */
        .modules-section {
          margin-bottom: 40px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .module-card.apple {
          display: flex;
          align-items: center;
          gap: 18px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .module-card.apple:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-md);
        }

        .module-card.apple:hover .module-arrow {
          transform: translateX(6px);
          color: var(--accent-primary);
        }

        .module-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .module-info {
          flex: 1;
        }

        .module-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 6px;
        }

        .module-info p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .module-stat {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .module-arrow {
          color: var(--text-tertiary);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-bottom: 40px;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .quick-action-card.apple {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px 24px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .quick-action-card.apple:hover {
          border-color: var(--border-hover);
          transform: translateY(-3px);
          box-shadow: var(--shadow-sm);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          font-size: 15px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .action-content p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .action-badge {
          background: var(--accent-gradient);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
        }

        /* Activity Section */
        .activity-section {
          margin-bottom: 32px;
        }

        .activity-list {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s ease;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .activity-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-content span:first-child {
          font-size: 14px;
          color: white;
          font-weight: 500;
        }

        .activity-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .modules-grid,
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 24px 20px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .header-left h1 {
            font-size: 26px;
          }

          .stats-grid,
          .modules-grid,
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .review-banner {
            flex-direction: column;
            text-align: center;
          }

          .banner-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

// Refresh icon component
const RefreshCwIcon = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export default Dashboard;