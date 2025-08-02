'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { trpc } from '../../../lib/trpc';
import type { JobPriority, JobStatus } from '../../../lib/types';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnSettings, setColumnSettings] = useState([
    { id: 'title', label: 'Title', visible: true, order: 0 },
    { id: 'contact', label: 'Contact', visible: true, order: 1 },
    { id: 'status', label: 'Status', visible: true, order: 2 },
    { id: 'startDate', label: 'Start Date', visible: true, order: 3 },
    { id: 'priority', label: 'Priority', visible: false, order: 4 },
    { id: 'budget', label: 'Budget', visible: false, order: 5 },
    { id: 'address', label: 'Address', visible: false, order: 6 },
    { id: 'systemType', label: 'System Type', visible: false, order: 7 },
    { id: 'contactPhone', label: 'Contact Phone #', visible: false, order: 8 },
    { id: 'notes', label: 'Notes', visible: false, order: 9 },
    { id: 'tasks', label: 'Tasks', visible: false, order: 10 },
    { id: 'updates', label: 'Updates', visible: false, order: 11 },
    { id: 'image', label: 'Image', visible: false, order: 12 },
    { id: 'actions', label: 'Actions', visible: true, order: 13 }
  ]);
  const [viewJob, setViewJob] = useState<any>(null);
  const [editJob, setEditJob] = useState<any>(null);
  
  // Form state for create modal
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    status: 'pending',
    startDate: '',
    priority: 'medium',
    budget: '',
    description: ''
  });

  // tRPC queries and mutations
  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading } = trpc.getJobs.useQuery({});
  const { data: companies = [] } = trpc.getCompanies.useQuery();

  const createJobMutation = trpc.createJob.useMutation({
    onSuccess: () => {
      // Invalidate and refetch jobs list and dashboard stats
      utils.getJobs.invalidate();
      utils.getDashboardStats.invalidate();
      setShowCreateModal(false);
      setEditJob(null);
      // Reset form
      setFormData({
        title: '',
        contactId: '',
        status: 'pending',
        startDate: '',
        priority: 'medium',
        budget: '',
        description: ''
      });
    },
    onError: (error: any) => {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    },
  });

  // Job management handlers
  const handleJobSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Searching jobs:", e.target.value);
    // TODO: Implement job search/filter functionality
  }, []);

  const handleFilterContact = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterContact(e.target.value);
    console.log("Filtering by contact:", e.target.value);
    // TODO: Implement contact-based job filtering
  }, []);

  const handleJobViewChange = useCallback((mode: string) => {
    setViewMode(mode);
    console.log("Changing job view mode to:", mode);
    // TODO: Implement different view layouts (list/grid/kanban)
  }, []);

  const handleJobColumns = useCallback(() => {
    setShowColumnSettings(!showColumnSettings);
    console.log("Opening job column configuration");
  }, [showColumnSettings]);

  const handleColumnToggle = useCallback((columnId: string) => {
    setColumnSettings(prev => prev.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const handleColumnReorder = useCallback((columnId: string, direction: 'up' | 'down') => {
    setColumnSettings(prev => {
      const columns = [...prev];
      const currentIndex = columns.findIndex(col => col.id === columnId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < columns.length) {
        // Swap the orders
        const temp = columns[currentIndex].order;
        columns[currentIndex].order = columns[newIndex].order;
        columns[newIndex].order = temp;

        // Sort by order
        return columns.sort((a, b) => a.order - b.order);
      }
      return columns;
    });
  }, []);

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleSaveJob = () => {
    if (!formData.title?.trim()) {
      alert('Please enter a job title');
      return;
    }

    if (!companies.length) {
      alert('No companies available. Please create a company first.');
      return;
    }

    // Use the first available company as default
    const companyId = companies[0].id;

    createJobMutation.mutate({
      title: formData.title,
      description: formData.description || '',
      companyId: companyId,
      priority: formData.priority as JobPriority || 'medium',
      assignedTo: '', // TODO: Add assignee selection
      dueDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
    });
  };

  const handleJobView = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setViewJob(job || null);
  }, [jobs]);

  const handleJobEdit = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setEditJob(job || null);
    setShowCreateModal(true);
  }, [jobs]);

  const handleJobDelete = useCallback((jobId: string) => {
    // TODO: Implement job deletion logic
    console.log('Deleting job:', jobId);
  }, []);

  const handleSelectJob = useCallback((jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
    console.log("Job selection changed:", jobId, checked);
  }, []);

  const handleSelectAllJobs = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
    console.log("Select all jobs:", checked);
  }, [jobs]);

  // Listen for job creation modal trigger from navigation
  useEffect(() => {
    const handleOpenJobModal = () => {
      setShowCreateModal(true);
    };

    window.addEventListener('openJobModal', handleOpenJobModal);
    return () => {
      window.removeEventListener('openJobModal', handleOpenJobModal);
    };
  }, []);

  const router = useRouter();

  return (
    <DashboardLayout title="Job Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors"
              title="Go back"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => alert('Assign Crew Member modal coming soon!')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Assign Crew Member
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleJobSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterContact}
              onChange={handleFilterContact}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Filter by Contact</option>
            </select>
            <button
              onClick={handleJobColumns}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
              title="Column settings"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Columns
            </button>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Jobs</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleJobViewChange('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleJobViewChange('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleJobViewChange('kanban')}
                  className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="Kanban view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-400">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No jobs found. Create your first job to get started!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create First Job
                </button>
              </div>
            ) : viewMode === 'list' && (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAllJobs(e.target.checked)}
                        className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                      />
                    </th>
                    {getVisibleColumns().map(column => (
                      <th key={column.id} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => handleSelectJob(job.id, e.target.checked)}
                          className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                        />
                      </td>
                      {getVisibleColumns().map(column => (
                        <td key={column.id} className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {column.id === 'title' && job.title}
                          {column.id === 'contact' && 'Contact Name'}
                          {column.id === 'status' && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              job.status === 'completed' ? 'bg-green-900 text-green-300' :
                              job.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                              job.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {job.status}
                            </span>
                          )}
                          {column.id === 'startDate' && new Date(job.createdAt).toLocaleDateString()}
                          {column.id === 'priority' && job.priority}
                          {column.id === 'actions' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleJobView(job.id)}
                                className="text-gray-400 hover:text-white"
                                title="View job"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleJobEdit(job.id)}
                                className="text-gray-400 hover:text-white"
                                title="Edit job"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleJobDelete(job.id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete job"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Column Settings Modal */}
        {showColumnSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Column Settings</h3>
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {columnSettings.map((column, index) => (
                  <div key={column.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => handleColumnToggle(column.id)}
                        className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-300">{column.label}</span>
                    </label>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleColumnReorder(column.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleColumnReorder(column.id, 'down')}
                        disabled={index === columnSettings.length - 1}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Create New Job</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      contactId: '',
                      status: 'pending',
                      startDate: '',
                      priority: 'medium',
                      budget: '',
                      description: ''
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    placeholder="Enter job title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                  <select 
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select contact...</option>
                    <option value="john">John Smith</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="mike">Mike Rodriguez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    placeholder="$0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Job description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      contactId: '',
                      status: 'pending',
                      startDate: '',
                      priority: 'medium',
                      budget: '',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJob}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}