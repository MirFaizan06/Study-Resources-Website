import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
