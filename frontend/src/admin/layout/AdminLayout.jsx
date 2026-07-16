import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="admin-root-wrapper">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main body content area */}
      <div className="admin-body-container">
        {/* Sticky top navbar header */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Scrollable page body */}
        <div className="admin-page-scrollable-content">
          <motion.main
            className="admin-page-inner-main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Renders nested active route components */}
            <Outlet />
          </motion.main>

          {/* Copyright footer block */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
