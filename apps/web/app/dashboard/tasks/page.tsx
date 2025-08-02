'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

export default function TasksPage() {
  const [filter, setFilter] = useState('All');
  const [taskForm, setTaskForm] = useState({
    title: '',
    priority: 'Medium',
    description: '',
    dueDate: '',
    status: 'Not Started'
  });

  const filterTabs = ['All (0)', 'Not Started (0)', 'In Progress (0)', 'Completed (0)'];

  // Tasks state and persistence
  const [tasks, setTasks] = useState<Array<{
    title: string;
    priority: string;
    description: string;
    dueDate: string;
    status: string;
    id?: string;
  }>>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist tasks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = useCallback(() => {
    if (!taskForm.title.trim()) return;
    setTasks((prev: typeof tasks) => [
      ...prev,
      {
        ...taskForm,
        id: `${taskForm.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      }
    ]);
    setTaskForm({
      title: '',
      priority: 'Medium',
      description: '',
      dueDate: '',
      status: 'Not Started'
    });
  }, [taskForm]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <DashboardLayout title="Task Management">
      <div className="space-y-6">
        {/* Add New Task Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Task</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Task details"
                value={taskForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => handleFormChange('dueDate', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddTask}
            className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Tasks Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h3>
              <div className="flex space-x-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === tab || (filter === 'All' && tab.startsWith('All'))
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h4>
                <p className="text-gray-600 dark:text-gray-400">Create your first task to get started with project management.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map(task => (
                  <li key={task.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-lg px-2 -mx-2">
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{task.title}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">{task.description}</div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">{task.priority}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Due: {task.dueDate || 'N/A'}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{task.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
