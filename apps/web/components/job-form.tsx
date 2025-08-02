'use client';

import { useState } from 'react';
import { Contact, CreateJobPayload, Job, JobPriority, JobStatus } from '../lib/types';

interface JobFormProps {
  onSubmitAction: (job: CreateJobPayload) => void;
  onCancelAction: () => void;
  initialData?: Partial<Job>;
  contacts: Contact[];
  isLoading?: boolean;
}

export default function JobForm({
  onSubmitAction,
  onCancelAction,
  initialData,
  contacts,
  isLoading = false
}: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobPayload>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    contactId: initialData?.contactId || '',
    status: initialData?.status || 'quoted',
    priority: initialData?.priority || 'medium',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate,
    estimatedHours: initialData?.estimatedHours,
    actualHours: initialData?.actualHours,
    budget: initialData?.budget,
    actualCost: initialData?.actualCost,
    location: initialData?.location || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Job, string>>>({});
  const [newTag, setNewTag] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Job, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Please select a contact';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (formData.budget && formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmitAction(formData);
    }
  };

  const handleInputChange = (
    field: keyof CreateJobPayload,
    value: string | number | Date | JobStatus | JobPriority | undefined
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const jobStatuses: JobStatus[] = [
    'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'
  ];

  const jobPriorities: JobPriority[] = ['low', 'medium', 'high', 'urgent'];

  const selectedContact = contacts.find(c => c.id === formData.contactId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-white">
            {initialData?.id ? 'Edit Job' : 'Create New Job'}
          </h2>
          <p className="text-gray-400 mt-1">
            Fill in the details below to {initialData?.id ? 'update' : 'create'} a job
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title and Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Enter job title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-select" className="form-label">
                Contact *
              </label>
              <select
                id="contact-select"
                value={formData.contactId}
                onChange={(e) => handleInputChange('contactId', e.target.value)}
                className={`form-input ${errors.contactId ? 'error' : ''}`}
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} - {contact.company}
                  </option>
                ))}
              </select>
              {errors.contactId && (
                <p className="text-red-400 text-sm mt-1">{errors.contactId}</p>
              )}
              {selectedContact && (
                <div className="mt-2 p-2 bg-gray-700 rounded text-sm text-gray-300">
                  📧 {selectedContact.email} | 📞 {selectedContact.phone}
                </div>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="job-status" className="form-label">
                Status *
              </label>
              <select
                id="job-status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as JobStatus)}
                className="form-input"
              >
                {jobStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="job-priority" className="form-label">
                Priority *
              </label>
              <select
                id="job-priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as JobPriority)}
                className="form-input"
              >
                {jobPriorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start-date" className="form-label">
                Start Date *
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="end-date" className="form-label">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                className={`form-input ${errors.endDate ? 'error' : ''}`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Budget and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={`form-input ${errors.budget ? 'error' : ''}`}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours || ''}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={`form-input ${errors.estimatedHours ? 'error' : ''}`}
                placeholder="0"
              />
              {errors.estimatedHours && (
                <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="form-label">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input"
              placeholder="Job site address or location"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="form-input flex-1"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary px-3"
                >
                  Add
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="form-input resize-none"
              placeholder="Detailed job description"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="form-input resize-none"
              placeholder="Internal notes and comments"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancelAction}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {initialData?.id ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 