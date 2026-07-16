import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTopFAB from './components/ui/ScrollToTopFAB'
import PageLoader from './components/ui/PageLoader'
import AdminProtectedRoute from './admin/components/AdminProtectedRoute'

// Lazy loaded pages
const Home       = lazy(() => import('./pages/Home'))
const Spots      = lazy(() => import('./pages/Spots'))
const SpotDetail = lazy(() => import('./pages/SpotDetail'))
const About      = lazy(() => import('./pages/About'))
const Gallery    = lazy(() => import('./pages/Gallery'))
const Contact    = lazy(() => import('./pages/Contact'))
const Login      = lazy(() => import('./pages/Login'))
const Register   = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Map        = lazy(() => import('./pages/MapPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const PlotDetail = lazy(() => import('./pages/PlotDetail'))
const NotFound   = lazy(() => import('./pages/NotFound'))

// Admin lazy pages
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'))
const Dashboard   = lazy(() => import('./admin/pages/Dashboard'))
const AdminSpots  = lazy(() => import('./admin/pages/Spots'))
const Bookings    = lazy(() => import('./admin/pages/Bookings'))
const Users       = lazy(() => import('./admin/pages/Users'))
const Payments    = lazy(() => import('./admin/pages/Payments'))
const AdminGallery    = lazy(() => import('./admin/pages/Gallery'))
const AdminMapMgmt    = lazy(() => import('./admin/pages/MapManagement'))

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Website Routes */}
            <Route path="/"                   element={<Home />} />
            <Route path="/spots"              element={<Spots />} />
            <Route path="/spots/:id"          element={<SpotDetail />} />
            <Route path="/about"              element={<About />} />
            <Route path="/gallery"            element={<Gallery />} />
            <Route path="/contact"            element={<Contact />} />
            <Route path="/map"                element={<Map />} />
            <Route path="/plots/:id"          element={<PlotDetail />} />
            <Route path="/booking"            element={<BookingPage />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/register"           element={<Register />} />
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="spots"     element={<AdminSpots />} />
              <Route path="bookings"  element={<Bookings />} />
              <Route path="users"     element={<Users />} />
              <Route path="payments"  element={<Payments />} />
              <Route path="gallery"   element={<AdminGallery />} />
              <Route path="map"       element={<AdminMapMgmt />} />
            </Route>

            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      {!isClean && !isAdmin && <Footer />}
      {!isClean && !isAdmin && <ScrollToTopFAB />}
    </ThemeProvider>
  )
}