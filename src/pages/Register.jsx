import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card card success-card">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2>Ro'yxatdan o'tish muvaffaqiyatli!</h2>
            <p>Emailingizni tasdiqlang. Tasdiqlash havolasini email orqali yubordik.</p>
            <Link to="/login" className="btn-primary btn-full">
              Kirish sahifasiga o'tish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <Link to="/" className="logo">
              <span className="logo-icon">E</span>
              <span className="logo-text">EngFlow</span>
            </Link>
            <h2>Ro'yxatdan o'tish</h2>
            <p>Yangi akkaunt yarating</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>To'liq ism</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="input-field input-with-icon"
                  placeholder="Ismingizni kiriting"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="input-field input-with-icon"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Parol</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon"
                  placeholder="Kamida 6 belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Parolni tasdiqlang</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon"
                  placeholder="Parolni qayta kiriting"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>

          <p className="auth-footer">
            Akkauntingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: var(--background);
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-card {
          padding: 40px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-header .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .auth-header h2 {
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: 8px;
          color: var(--error);
          margin-bottom: 24px;
          font-size: 14px;
        }

        .auth-form {
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

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .input-with-icon {
          padding-left: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .btn-full {
          width: 100%;
          margin-top: 8px;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .auth-footer a {
          color: var(--secondary);
          font-weight: 500;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        .success-card {
          text-align: center;
        }

        .success-icon {
          color: var(--success);
          margin-bottom: 24px;
        }

        .success-card h2 {
          margin-bottom: 12px;
        }

        .success-card p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default Register;