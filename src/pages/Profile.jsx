import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, BookOpen, Trophy, Clock, Flame, Settings, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');

  const stats = {
    wordsLearned: 127,
    timeSpent: 1560,
    testsCompleted: 23,
    streak: 14,
    accuracy: 78
  };

  const achievements = [
    { id: 1, title: 'Birinchi qadam', description: 'Birinchi so\'zni o\'rganish', unlocked: true },
    { id: 2, title: '7 kun ketma-ketlik', description: '7 kun davomida o\'rganish', unlocked: true },
    { id: 3, title: '100 so\'z', description: '100 ta so\'z o\'rganish', unlocked: true },
    { id: 4, title: 'Test ustası', description: '10 ta test tugatish', unlocked: true },
    { id: 5, title: '30 kun ketma-ketlik', description: '30 kun davomida o\'rganish', unlocked: false },
    { id: 6, title: '1000 so\'z', description: '1000 ta so\'z o\'rganish', unlocked: false },
  ];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} soat ${mins} daqiqa` : `${mins} daqiqa`;
  };

  return (
    <div className="profile-page">
      <div className="page-inner">
        <div className="profile-header card animate-slide-up">
          <div className="profile-avatar">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user?.user_metadata?.full_name || 'Foydalanuvchi'}</h1>
            <p><Mail size={16} /> {user?.email}</p>
          </div>
          <div className="streak-badge">
            <Flame size={20} />
            <span>{stats.streak} kun ketma-ketlik</span>
          </div>
        </div>

        <div className="profile-content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <BookOpen size={18} />
              Statistika
            </button>
            <button
              className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              <Trophy size={18} />
              Yutuqlar
            </button>
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              Sozlamalar
            </button>
          </div>

          {activeTab === 'stats' && (
            <div className="stats-section animate-slide-up">
              <div className="stats-grid">
                <div className="stat-card card">
                  <div className="stat-icon words">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.wordsLearned}</span>
                    <span className="stat-label">O'rganilgan so'zlar</span>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon time">
                    <Clock size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{formatTime(stats.timeSpent)}</span>
                    <span className="stat-label">Jami vaqt sarflangan</span>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon tests">
                    <Trophy size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.testsCompleted}</span>
                    <span className="stat-label">Tugatilgan testlar</span>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon accuracy">
                    <Target size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.accuracy}%</span>
                    <span className="stat-label">O'rtacha to'g'ri javob</span>
                  </div>
                </div>
              </div>

              <div className="progress-section card">
                <h3>Haftalik maqsad</h3>
                <div className="goal-progress">
                  <div className="goal-bar">
                    <div className="goal-fill" style={{width: '65%'}}></div>
                  </div>
                  <span>13 / 20 soat</span>
                </div>
                <p>Har kuni kamida 30 daqiqa o'rganishga harakat qiling!</p>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-section animate-slide-up">
              <div className="achievements-grid">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`achievement-card card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="achievement-icon">
                      <Trophy size={28} />
                    </div>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    {achievement.unlocked && (
                      <span className="unlocked-badge">Yakunlangan</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section animate-slide-up">
              <div className="settings-card card">
                <h3>Profil ma'lumotlari</h3>
                <div className="form-group">
                  <label>To'liq ism</label>
                  <input
                    type="text"
                    className="input-field"
                    defaultValue={user?.user_metadata?.full_name || ''}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input-field"
                    defaultValue={user?.email}
                    disabled
                  />
                </div>
                <button className="btn-primary">Saqlash</button>
              </div>

              <div className="settings-card card">
                <h3>Parolni o'zgartirish</h3>
                <div className="form-group">
                  <label>Joriy parol</label>
                  <input type="password" className="input-field" placeholder="********" />
                </div>
                <div className="form-group">
                  <label>Yangi parol</label>
                  <input type="password" className="input-field" placeholder="********" />
                </div>
                <div className="form-group">
                  <label>Yangi parolni tasdiqlang</label>
                  <input type="password" className="input-field" placeholder="********" />
                </div>
                <button className="btn-primary">Parolni yangilash</button>
              </div>

              <div className="danger-zone card">
                <h3>Xavfli zona</h3>
                <p>Akkauntni o'chirishga ishonchingiz komilmi?</p>
                <button className="btn-danger" onClick={signOut}>
                  <LogOut size={18} />
                  Chiqish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 0;
          min-height: 100vh;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--gradient-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h1 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .profile-info p {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }

        .profile-header .streak-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          padding: 12px 20px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--surface);
        }

        .tab.active {
          color: var(--secondary);
          background: rgba(247, 147, 30, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.words { background: linear-gradient(135deg, #F7931E 0%, #FFB84D 100%); }
        .stat-icon.time { background: linear-gradient(135deg, #00C9A7 0%, #00E5BB 100%); }
        .stat-icon.tests { background: linear-gradient(135deg, #1E3A5F 0%, #2A5080 100%); }
        .stat-icon.accuracy { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); }

        .stat-details {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .progress-section {
          max-width: 600px;
        }

        .progress-section h3 {
          margin-bottom: 16px;
        }

        .goal-progress {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .goal-bar {
          flex: 1;
          height: 12px;
          background: var(--surface);
          border-radius: 6px;
          overflow: hidden;
        }

        .goal-fill {
          height: 100%;
          background: var(--gradient-secondary);
          border-radius: 6px;
        }

        .goal-progress span {
          font-weight: 600;
          min-width: 100px;
        }

        .progress-section p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          text-align: center;
          padding: 24px;
          position: relative;
        }

        .achievement-card.locked {
          opacity: 0.5;
        }

        .achievement-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--gradient-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 16px;
        }

        .achievement-card.locked .achievement-icon {
          background: var(--surface);
          color: var(--text-secondary);
        }

        .achievement-card h4 {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .achievement-card p {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .unlocked-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--success);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .settings-section {
          max-width: 600px;
        }

        .settings-card {
          margin-bottom: 24px;
        }

        .settings-card h3 {
          margin-bottom: 20px;
          font-size: 18px;
        }

        .settings-card .form-group {
          margin-bottom: 16px;
        }

        .settings-card label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .settings-card .btn-primary {
          margin-top: 8px;
        }

        .danger-zone {
          border: 1px solid var(--error);
          background: rgba(239, 68, 68, 0.05);
        }

        .danger-zone h3 {
          color: var(--error);
          margin-bottom: 8px;
        }

        .danger-zone p {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--error);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          filter: brightness(1.1);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .tabs {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;