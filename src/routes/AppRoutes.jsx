import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import TreeInventory from '../pages/TreeInventory';
import Vegetation from '../pages/Vegetation';
import Maps from '../pages/Maps';
import Biomass from '../pages/Biomass';
import Carbon from '../pages/Carbon';
import Reports from '../pages/Reports';
import Prediction from '../pages/Prediction/UnifiedPrediction';
import ManualPrediction from '../pages/ManualPrediction';
import ImagePrediction from '../pages/Prediction/ImagePrediction';
import SatellitePrediction from '../pages/Prediction/SatellitePrediction';
import PredictionHistory from '../pages/PredictionHistory';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import AdminUsers from '../pages/AdminUsers';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'trees', element: <TreeInventory /> },
      { path: 'vegetation', element: <Vegetation /> },
      { path: 'maps', element: <Maps /> },
      { path: 'biomass', element: <Biomass /> },
      { path: 'carbon', element: <Carbon /> },
      { path: 'reports', element: <Reports /> },
      { path: 'prediction', element: <Prediction /> },
      { path: 'prediction/manual', element: <ManualPrediction /> },
      { path: 'prediction/image', element: <ImagePrediction /> },
      { path: 'prediction/satellite', element: <SatellitePrediction /> },
      { path: 'prediction/history', element: <PredictionHistory /> },
      { path: 'settings', element: <Settings /> },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;