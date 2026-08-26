import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTopFAB from './components/ui/ScrollToTopFAB'
import AdminProtectedRoute from './admin/components/AdminProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'

// ─── Lazy-load all page components ───────────────────────────────────────────
// This splits the JS bundle so the browser only downloads code that is needed
// for the current page, making the initial load much faster.

// Public Website Pages
const Home          = lazy(() => import('./pages/Home'))
const Spots         = lazy(() => import('./pages/Spots'))
const SpotDetail    = lazy(() => import('./pages/SpotDetail'))
const About         = lazy(() => import('./pages/About'))
const Gallery       = lazy(() => import('./pages/Gallery'))
const Contact       = lazy(() => import('./pages/Contact'))
const Login         = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const MapPage       = lazy(() => import('./pages/MapPage'))
const BookingPage   = lazy(() => import('./pages/BookingPage'))
const PlotDetail    = lazy(() => import('./pages/PlotDetail'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const NotFound      = lazy(() => import('./pages/NotFound'))

// Admin Console Pages
const AdminLayout       = lazy(() => import('./admin/layout/AdminLayout'))
const Dashboard         = lazy(() => import('./admin/pages/Dashboard'))
const AdminSpots        = lazy(() => import('./admin/pages/Spots'))
const EventAddons       = lazy(() => import('./admin/pages/EventAddons'))
const GuidelinesRules   = lazy(() => import('./admin/pages/GuidelinesRules'))
const AdminZones        = lazy(() => import('./admin/pages/Zones'))
const Bookings          = lazy(() => import('./admin/pages/Bookings'))
const BookingHistory    = lazy(() => import('./admin/pages/BookingHistory'))
const InvoicePage       = lazy(() => import('./admin/pages/InvoicePage'))
const Users             = lazy(() => import('./admin/pages/Users'))
const Payments          = lazy(() => import('./admin/pages/Payments'))
const AdminMapMgmt      = lazy(() => import('./admin/pages/MapManagement'))
const AdminCredentials  = lazy(() => import('./admin/pages/AdminCredentials'))
const UserViewMgmt      = lazy(() => import('./admin/pages/UserViewMgmt'))
const SupportContact    = lazy(() => import('./admin/pages/SupportContact'))

// ─── Page Loading Skeleton ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: '3px solid var(--border, rgba(255,255,255,0.12))',
        borderTopColor: 'var(--gold, #C9A84C)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      {!isClean && !isAdmin && <Footer />}
      {!isClean && !isAdmin && <ScrollToTopFAB />}
    </ThemeProvider>
  )
}