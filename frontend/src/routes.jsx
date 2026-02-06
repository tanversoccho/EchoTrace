import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import TORs from './pages/TORs'
import Scraping from './pages/Scraping'
import Export from './pages/Export'
import Settings from './pages/Settings'
import Reports from './pages/Reports'

// Protect pages
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes wrapped inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tors" element={<PrivateRoute><TORs /></PrivateRoute>} />
        <Route path="/scraping" element={<PrivateRoute><Scraping /></PrivateRoute>} />
        <Route path="/export" element={<PrivateRoute><Export /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
