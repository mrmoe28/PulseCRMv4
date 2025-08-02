'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
              <p className="text-gray-400">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            <button
              onClick={reset}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}