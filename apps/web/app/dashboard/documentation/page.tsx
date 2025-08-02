import DashboardLayout from '../../../components/dashboard-layout';

export default function DocumentationPage() {
  return (
    <DashboardLayout title="Documentation">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Documentation</h1>
        <p className="text-gray-300 mb-6">User guides, tutorials, and API reference.</p>
        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li>Getting Started Guide</li>
          <li>Managing Contacts</li>
          <li>Job Tracking</li>
          <li>Task Management</li>
          <li>API Reference</li>
        </ul>
      </div>
    </DashboardLayout>
  );
} 