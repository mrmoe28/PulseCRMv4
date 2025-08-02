export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-4xl font-bold text-white">
            Pulse<span className="text-orange-500">CRM</span>
          </h1>
        </div>

        {/* Maintenance Message */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            We'll be back soon!
          </h2>
          
          <p className="text-gray-300 mb-6">
            We're performing scheduled maintenance to improve your experience. 
            Our team is working hard to get everything back up and running.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">
              Expected downtime: <span className="text-white font-semibold">2-3 hours</span>
            </p>
          </div>

          <div className="text-sm text-gray-400">
            <p>Need urgent assistance?</p>
            <a href="mailto:support@pulsecrm.com" className="text-orange-500 hover:text-orange-400">
              support@pulsecrm.com
            </a>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
