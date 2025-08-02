'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/dashboard-layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Icons } from '../../components/ui/icons';

export default function DashboardPage() {
  const router = useRouter();

  // Mock data for now (in production, this would come from API)
  const metrics = {
    totalContacts: 12,
    activeJobs: 5,
    completedJobs: 23,
    verifiedUsers: 8,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobsData: any[] = []; // Empty for now

  // Navigation handlers
  const handleAddContact = () => router.push('/dashboard/contacts');
  const handleCreateJob = () => router.push('/dashboard/jobs');
  const handleCalendarClick = () => router.push('/dashboard/scheduling');

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of your business operations and performance"
    >
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Contacts
              </CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <Icons.Users size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.totalContacts}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active contacts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Jobs
              </CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <Icons.Briefcase size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.activeJobs}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed Jobs
              </CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <Icons.CheckSquare size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.completedJobs}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Verified Users
              </CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <Icons.UserCheck size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.verifiedUsers}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to your CRM Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your personalized hub for managing client relationships, tracking jobs, and
                monitoring your team performance—all in one place.
              </p>
              <div className="flex space-x-3">
                <Button onClick={handleAddContact}>
                  <Icons.Plus size={16} className="mr-2" />
                  Add Contact
                </Button>
                <Button variant="outline" onClick={handleCreateJob}>
                  <Icons.Briefcase size={16} className="mr-2" />
                  Create Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Jobs</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/jobs')}>
                View All
                <Icons.ChevronRight size={16} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {jobsData.length > 0 ? (
                <div className="space-y-3">
                  {/* {jobsData.slice(0, 3).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {job.description || 'No description'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {job.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))} */}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Icons.Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No jobs yet</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleCreateJob}>
                    Create your first job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                className="h-20 flex-col space-y-2"
                onClick={handleCalendarClick}
              >
                <Icons.Calendar size={24} />
                <span className="text-sm">Schedule Meeting</span>
              </Button>

              <Button
                variant="ghost"
                className="h-20 flex-col space-y-2"
                onClick={() => router.push('/reports')}
              >
                <Icons.BarChart3 size={24} />
                <span className="text-sm">View Reports</span>
              </Button>

              <Button
                variant="ghost"
                className="h-20 flex-col space-y-2"
                onClick={() => router.push('/dashboard/crew')}
              >
                <Icons.Users size={24} />
                <span className="text-sm">Manage Team</span>
              </Button>

              <Button
                variant="ghost"
                className="h-20 flex-col space-y-2"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Icons.Settings size={24} />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
