'use client';

import DashboardLayout from '../../components/dashboard-layout';

export default function HelpPage() {
  return (
    <DashboardLayout title="Help & Support">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          </div>
          <p className="text-gray-300">Get help, find documentation, and contact our support team.</p>
        </div>

        {/* Quick Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Documentation</h3>
                <p className="text-gray-400 text-sm">User guides and tutorials</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-orange-500">Getting Started Guide</a></li>
              <li><a href="#" className="hover:text-orange-500">Managing Contacts</a></li>
              <li><a href="#" className="hover:text-orange-500">Job Tracking</a></li>
              <li><a href="#" className="hover:text-orange-500">Task Management</a></li>
              <li><a href="#" className="hover:text-orange-500">API Reference</a></li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M9 12h6m-6 4h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Video Tutorials</h3>
                <p className="text-gray-400 text-sm">Step-by-step video guides</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-orange-500">Dashboard Overview (5:30)</a></li>
              <li><a href="#" className="hover:text-orange-500">Creating Your First Job (8:15)</a></li>
              <li><a href="#" className="hover:text-orange-500">Team Management (6:45)</a></li>
              <li><a href="#" className="hover:text-orange-500">Reports & Analytics (4:20)</a></li>
              <li><a href="#" className="hover:text-orange-500">Mobile App Usage (7:10)</a></li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                <p className="text-gray-400 text-sm">Get instant help</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-gray-300 text-sm">
                <div className="font-medium text-green-400">● Online</div>
                <div>Average response time: 2 minutes</div>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                Start Chat
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-b border-gray-700 pb-4">
              <h4 className="text-white font-medium mb-2">How do I add new team members?</h4>
              <p className="text-gray-300 text-sm">Navigate to Settings {'>'} User Management and click &quot;Add User&quot;. Fill in their details and assign the appropriate role (Administrator, Manager, or Crew Member).</p>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <h4 className="text-white font-medium mb-2">How can I track job progress?</h4>
              <p className="text-gray-300 text-sm">Go to the Jobs page to see all active projects. Each job shows its current status, assigned crew members, and completion percentage. Click on any job to view detailed progress and task breakdowns.</p>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <h4 className="text-white font-medium mb-2">Can I export data from PulseCRM?</h4>
              <p className="text-gray-300 text-sm">Yes! Most data tables have export options. Look for the &quot;Export&quot; or &quot;Download&quot; buttons on contact lists, job reports, and task summaries. Data can be exported as CSV or PDF files.</p>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <h4 className="text-white font-medium mb-2">How do I reset my password?</h4>
              <p className="text-gray-300 text-sm">Click your profile icon in the top right, select &quot;Account Settings&quot;, then &quot;Password &amp; Security&quot;. Enter your current password and set a new one. For forgotten passwords, contact your administrator.</p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">What mobile devices are supported?</h4>
              <p className="text-gray-300 text-sm">PulseCRM works on all modern mobile browsers (iOS Safari, Android Chrome). We also offer dedicated mobile apps for iOS and Android with offline capabilities for field workers.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Contact Support</h3>
            <p className="text-gray-400 text-sm">Need more help? Get in touch with our support team</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-4">Send us a message</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                    <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option>General Question</option>
                      <option>Technical Issue</option>
                      <option>Feature Request</option>
                      <option>Account Problem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your issue or question..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                    Send Message
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Other ways to reach us</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-white font-medium">Email Support</div>
                      <div className="text-gray-400 text-sm">support@pulsecrm.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <div className="text-white font-medium">Phone Support</div>
                      <div className="text-gray-400 text-sm">1-800-PULSE-CRM</div>
                      <div className="text-gray-400 text-xs">Mon-Fri 9AM-6PM EST</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-white font-medium">Response Time</div>
                      <div className="text-gray-400 text-sm">Within 24 hours</div>
                      <div className="text-gray-400 text-xs">Priority support available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information for Support */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">System Information</h3>
            <p className="text-gray-400 text-sm">Include this information when contacting support</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-400">Version</div>
                <div className="text-white font-medium">PulseCRM v2.1.0</div>
              </div>
              <div>
                <div className="text-gray-400">User ID</div>
                <div className="text-white font-medium">admin@pulsecrm.com</div>
              </div>
              <div>
                <div className="text-gray-400">Browser</div>
                <div className="text-white font-medium">Chrome 91.0.4472.124</div>
              </div>
              <div>
                <div className="text-gray-400">Session ID</div>
                <div className="text-white font-medium">sess_abc123xyz789</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
