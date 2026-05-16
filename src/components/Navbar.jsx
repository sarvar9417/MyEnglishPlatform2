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
  Award
} from 'lucide-react';

const Navbar = ({ collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
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
          background: rgba(30, 30, 30, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          z-index: 100;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 18px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .collapse-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s ease;
        }

        .collapse-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
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
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 16px;
          flex-shrink: 0;
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
          color: #6EE7B7;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          background: none;
          border: none;
          width: 100%;
          font-size: 14px;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(139, 92, 246, 0.2);
          color: #8B5CF6;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar.collapsed .sidebar-header {
          justify-content: center;
          padding: 20px 12px;
        }

        .sidebar.collapsed .collapse-btn {
          position: absolute;
          right: -14px;
          background: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar.collapsed .sidebar-user {
          justify-content: center;
          padding: 20px 12px;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 12px;
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