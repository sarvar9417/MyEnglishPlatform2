import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BookOpen,
  FileText,
  Trophy,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Flame,
  Target,
  Clock,
  Award,
  Zap
} from 'lucide-react';

const Navbar = ({ collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/practice', label: 'Practice', icon: Zap },
    { path: '/vocabulary', label: 'Lug\'at', icon: BookOpen },
    { path: '/topics', label: 'Mavzular', icon: Target },
    { path: '/grammar', label: 'Grammatika', icon: FileText },
    { path: '/irregular-verbs', label: 'Irregular', icon: FileText },
    { path: '/tests', label: 'Testlar', icon: Trophy },
    { path: '/profile', label: 'Profil', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon">E</span>
          {!collapsed && <span className="logo-text">EngFlow</span>}
        </Link>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <ChevronRight size={18} className={collapsed ? '' : 'rotated'} />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{user?.user_metadata?.full_name || 'Foydalanuvchi'}</span>
            <span className="user-streak">
              <Flame size={12} /> 14 kun
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${isActive(path) ? 'active' : ''}`}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={signOut}>
          <LogOut size={20} />
          {!collapsed && <span>Chiqish</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
        }

        .sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 20px;
          position: relative;
          z-index: 1;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-gradient);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 16px var(--accent-glow);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
        }

        .collapse-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .collapse-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: var(--border-hover);
        }

        .collapse-btn svg {
          transition: transform 0.3s ease;
        }

        .collapse-btn svg.rotated {
          transform: rotate(180deg);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          margin: 0 12px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: var(--accent-gradient);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px var(--accent-glow);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-streak {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--success);
          font-weight: 500;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          background: none;
          border: none;
          width: 100%;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: var(--accent-primary);
          border-radius: 0 2px 2px 0;
          transition: height 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item:hover::before {
          height: 20px;
        }

        .nav-item.active {
          background: rgba(124, 58, 237, 0.15);
          color: var(--accent-primary);
        }

        .nav-item.active::before {
          height: 24px;
          background: var(--accent-gradient);
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }

        .sidebar.collapsed .sidebar-header {
          justify-content: center;
          padding: 24px 16px;
        }

        .sidebar.collapsed .collapse-btn {
          position: absolute;
          right: -16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
        }

        .sidebar.collapsed .sidebar-user {
          justify-content: center;
          padding: 16px;
          margin: 0 8px;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 14px;
        }

        .sidebar.collapsed .nav-item span {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;