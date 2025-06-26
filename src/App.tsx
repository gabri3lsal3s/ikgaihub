import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ExercisePage from './pages/ExercisePage';
import MealPlanPage from './pages/MealPlanPage';
import GoalsPage from './pages/GoalsPage';
import RemindersPage from './pages/RemindersPage';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useNotifications } from './hooks/useNotifications';
import './styles/index.css';

function AppContent() {
  useNotifications();
  
  return (
    <>
      {/* Indicador de status offline */}
      <OfflineIndicator />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="exercises" element={<ExercisePage />} />
          <Route path="meal-plan" element={<MealPlanPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
        </Route>
      </Routes>
      
      {/* Componente PWA */}
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App; 