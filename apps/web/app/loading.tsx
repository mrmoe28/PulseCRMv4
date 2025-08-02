export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="space-y-6 text-center">
        <div className="relative">
          <div className="h-16 w-16 mx-auto rounded-full border-4 border-gray-700 border-t-orange-500 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Loading PulseCRM</h2>
          <p className="text-sm text-gray-400">Initializing your workspace...</p>
        </div>
      </div>
    </div>
  )
}