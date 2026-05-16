import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Brain, Trophy, Clock, Star, ArrowRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Keng Qamrovli Lug\'at',
      description: '4000+ so\'z va iboralar, har biri misollar bilan'
    },
    {
      icon: Brain,
      title: 'Aqlli Yodda Qolish',
      description: 'Spaced repetition texnologiyasi bilan mustahkam o\'rganish'
    },
    {
      icon: Trophy,
      title: 'Interaktiv Testlar',
      description: 'O\'z bilimaringizni sinab ko\'ring'
    },
    {
      icon: Clock,
      title: 'Kunlik Ketma-ketlik',
      description: 'Har kuni o\'rganish uchun motivatsiya'
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-slide-up">
            <Star size={16} />
            <span>100% Bepul O'rganish</span>
          </div>
          <h1 className="hero-title animate-slide-up" style={{animationDelay: '0.1s'}}>
            Ingliz tilini <span className="highlight">zamonaviy usulda</span> o'rganing
          </h1>
          <p className="hero-subtitle animate-slide-up" style={{animationDelay: '0.2s'}}>
            EngFlow bilan grammatika, lug'at va speakingni bir平台上 o'rganing.
            Interaktiv darslar va shaxsiy statistika orqali tezroq natijaga erishing.
          </p>
          <div className="hero-actions animate-slide-up" style={{animationDelay: '0.3s'}}>
            {user ? (
              <Link to="/dashboard" className="btn-primary btn-lg">
                Dashboardga o'tish
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-lg">
                  Bepul Boshlash
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn-secondary btn-lg">
                  Kirish
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Nima uchun EngFlow?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card card animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="feature-icon">
                  <feature.icon size={28} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card glassmorphism">
            <h2>Bugun o'rganishni boshlang</h2>
            <p>Ro'yxatdan o'tish bepul va 2 daqiqa vaqt oladi</p>
            {!user && (
              <Link to="/register" className="btn-primary btn-lg">
                Ro'yxatdan o'tish
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">E</span>
              <span className="logo-text">EngFlow</span>
            </div>
            <p className="footer-text">
              © 2024 EngFlow. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .home {
          min-height: 100vh;
        }

        .hero {
          position: relative;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          padding: 80px 0;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          background: var(--secondary);
          top: -100px;
          right: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          background: var(--accent);
          bottom: -50px;
          left: -50px;
          animation: float 6s ease-in-out infinite reverse;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          background: var(--primary);
          top: 50%;
          left: 50%;
          animation: float 10s ease-in-out infinite;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(247, 147, 30, 0.1);
          color: var(--secondary);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 56px;
          margin-bottom: 24px;
          line-height: 1.1;
        }

        .highlight {
          background: var(--gradient-secondary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 16px 32px;
          font-size: 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .features {
          padding: 100px 0;
          background: linear-gradient(180deg, transparent 0%, var(--surface) 50%, transparent 100%);
        }

        .section-title {
          text-align: center;
          margin-bottom: 64px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .feature-card {
          text-align: center;
          padding: 32px;
        }

        .feature-card h3 {
          margin-bottom: 12px;
        }

        .feature-card p {
          color: var(--text-secondary);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: var(--gradient-secondary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }

        .cta-section {
          padding: 100px 0;
        }

        .cta-card {
          text-align: center;
          padding: 64px;
          border-radius: 24px;
        }

        .cta-card h2 {
          margin-bottom: 16px;
        }

        .cta-card p {
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .footer {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .footer-text {
          color: var(--text-secondary);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero {
            padding: 60px 0;
          }

          .cta-card {
            padding: 40px 24px;
          }

          .footer-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;