import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { DonatePopup } from '@/components/common/DonatePopup'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
}

export function RootLayout(): React.ReactElement {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Navbar />
      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            id="main-content"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </ErrorBoundary>
      <Footer />
      <DonatePopup />
    </div>
  )
}
