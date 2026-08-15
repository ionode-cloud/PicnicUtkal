import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTopFAB from './components/ui/ScrollToTopFAB'
import AdminProtectedRoute from './admin/components/AdminProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'

// Public Website Pages
import Home from './pages/Home'
import Spots from './pages/Spots'
import SpotDetail from './pages/SpotDetail'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import MapPage from './pages/MapPage'
import BookingPage from './pages/BookingPage'
import PlotDetail from './pages/PlotDetail'
import UserDashboard from './pages/UserDashboard'
import NotFound from './pages/NotFound'

// Admin Console Pages
import AdminLayout from './admin/layout/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import AdminSpots from './admin/pages/Spots'
import EventAddons from './admin/pages/EventAddons'
import GuidelinesRules from './admin/pages/GuidelinesRules'
import AdminZones from './admin/pages/Zones'
import Bookings from './admin/pages/Bookings'
import BookingHistory from './admin/pages/BookingHistory'
import InvoicePage from './admin/pages/InvoicePage'
import Users from './admin/pages/Users'
import Payments from './admin/pages/Payments'
import AdminMapMgmt from './admin/pages/MapManagement'
import AdminCredentials from './admin/pages/AdminCredentials'
import UserViewMgmt from './admin/pages/UserViewMgmt'
import SupportContact from './admin/pages/SupportContact'

// No navbar/footer on these routes
const CLEAN_ROUTES = ['/login', '/register', '/forgot-password']

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isClean = CLEAN_ROUTES.some(r => pathname.startsWith(r))
  const isAdmin = pathname.startsWith('/admin')

  return (
    <ThemeProvider>
      <ScrollToTop />
      {!isClean && !isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/"                   element={<Home />} />
          <Route path="/spots"              element={<Spots />} />
          <Route path="/spots/:id"          element={<SpotDetail />} />
          <Route path="/about"              element={<About />} />
          <Route path="/gallery"            element={<Gallery />} />
          <Route path="/contact"            element={<Contact />} />
          <Route path="/map"                element={<MapPage />} />
          <Route path="/plots/:id"          element={<PlotDetail />} />
          <Route path="/booking"            element={<UserProtectedRoute><BookingPage /></UserProtectedRoute>} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/user"               element={<UserProtectedRoute><UserDashboard /></UserProtectedRoute>} />
          <Route path="/forgot-password"    element={<ForgotPassword />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="spots"     element={<AdminSpots />} />
            <Route path="spots/addons" element={<EventAddons />} />
            <Route path="spots/guidelines" element={<GuidelinesRules />} />
            <Route path="zones"     element={<AdminZones />} />
            <Route path="bookings"  element={<Bookings />} />
            <Route path="bookings/history" element={<BookingHistory />} />
            <Route path="bookings/invoice/:id" element={<InvoicePage />} />
            <Route path="users"     element={<Users />} />
            <Route path="payments"  element={<Payments />} />
            <Route path="map"       element={<AdminMapMgmt />} />
            <Route path="credentials" element={<AdminCredentials />} />
            <Route path="support-contact" element={<SupportContact />} />
            <Route path="user-view" element={<UserViewMgmt />} />
            <Route path="user-view/home" element={<UserViewMgmt />} />
            <Route path="user-view/about" element={<UserViewMgmt />} />
            <Route path="user-view/gallery" element={<UserViewMgmt />} />
            <Route path="user-view/contact" element={<UserViewMgmt />} />
            <Route path="user-view/logo" element={<UserViewMgmt />} />
            <Route path="user-view/footer" element={<UserViewMgmt />} />
          </Route>

          <Route path="*"                   element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!isClean && !isAdmin && <Footer />}
      {!isClean && !isAdmin && <ScrollToTopFAB />}
    </ThemeProvider>
  )
}