import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vocabulary from './pages/Vocabulary';
import Grammar from './pages/Grammar';
import Tests from './pages/Tests';
import Profile from './pages/Profile';
import IrregularVerbs from './pages/IrregularVerbs';
import Topics from './pages/Topics';
import Practice from './pages/Practice';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <Navbar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>
      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
        }

        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        .dashboard-main.expanded {
          margin-left: 72px;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <>
              <Navbar collapsed={true} setCollapsed={() => {}} />
              <Home />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Vocabulary />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grammar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Grammar />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Tests />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/irregular-verbs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <IrregularVerbs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Topics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Practice />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <style>{`
        .app {
          min-height: 100vh;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0A0F1C;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #121A2D;
          border-top-color: #F7931E;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;