import DashboardLayout from '../../../components/dashboard-layout';

export default function TutorialsPage() {
  return (
    <DashboardLayout title="Video Tutorials">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Video Tutorials</h1>
        <p className="text-gray-300 mb-6">Step-by-step video guides to help you get started.</p>
        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li><a href="#" className="text-orange-400 hover:underline">Dashboard Overview (5:30)</a></li>
          <li><a href="#" className="text-orange-400 hover:underline">Creating Your First Job (8:15)</a></li>
          <li><a href="#" className="text-orange-400 hover:underline">Team Management (6:45)</a></li>
          <li><a href="#" className="text-orange-400 hover:underline">Reports & Analytics (4:20)</a></li>
          <li><a href="#" className="text-orange-400 hover:underline">Mobile App Usage (7:10)</a></li>
        </ul>
      </div>
    </DashboardLayout>
  );
} 