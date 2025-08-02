'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hourlyRate: string;
  status: string;
  dateHired: string;
  department: string;
  skills: string;
  address?: string;
  website?: string;
  notes?: string;
  image?: string;
}

interface Contractor {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website?: string;
  services: string;
  hourlyRate?: string;
  projectRate?: string;
  rating: number;
  status: string;
  dateAdded: string;
  address: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
  specializations: string;
  notes?: string;
  image?: string;
}

interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export default function CrewPage() {
  const [activeTab, setActiveTab] = useState<'crew' | 'contractors'>('crew');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ crewId: string, field: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newCrew, setNewCrew] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    hourlyRate: '',
    address: '',
    website: '',
    notes: '',
    image: '',
  });
  const [newContractor, setNewContractor] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    services: '',
    hourlyRate: '',
    projectRate: '',
    address: '',
    licenseNumber: '',
    specializations: '',
    notes: '',
    image: '',
  });

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>([
    { id: 'name', label: 'Name', visible: true, order: 0 },
    { id: 'role', label: 'Role', visible: true, order: 1 },
    { id: 'phone', label: 'Phone', visible: true, order: 2 },
    { id: 'email', label: 'Email', visible: true, order: 3 },
    { id: 'hourlyRate', label: 'Hourly Rate', visible: true, order: 4 },
    { id: 'status', label: 'Status', visible: true, order: 5 },
    { id: 'dateHired', label: 'Date Hired', visible: false, order: 6 },
    { id: 'department', label: 'Department', visible: false, order: 7 },
    { id: 'skills', label: 'Skills', visible: false, order: 8 },
    { id: 'address', label: 'Address', visible: false, order: 9 },
    { id: 'website', label: 'Website', visible: false, order: 10 },
    { id: 'notes', label: 'Notes', visible: false, order: 11 },
    { id: 'image', label: 'Image', visible: false, order: 12 },
    { id: 'actions', label: 'Actions', visible: true, order: 13 }
  ]);

  const initialCrew: CrewMember[] = [];

  const initialContractors: Contractor[] = [];

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(() => {
    if (typeof window === 'undefined') return initialCrew;
    try {
      const stored = localStorage.getItem('crew_members');
      return stored ? JSON.parse(stored) : initialCrew;
    } catch {
      return initialCrew;
    }
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    if (typeof window === 'undefined') return initialContractors;
    try {
      const stored = localStorage.getItem('contractors');
      return stored ? JSON.parse(stored) : initialContractors;
    } catch {
      return initialContractors;
    }
  });

  // persist on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crew_members', JSON.stringify(crewMembers));
      localStorage.setItem('contractors', JSON.stringify(contractors));
      localStorage.setItem('crewViewMode', viewMode);
    }
  }, [crewMembers, contractors, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crewViewMode');
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
  }, []);

  const handleTabChange = useCallback((tab: 'crew' | 'contractors') => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterRole('');
    setSelectedCrew([]);
    setSelectedContractors([]);
  }, []);

  const handleShowFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handleColumnSettings = useCallback(() => {
    setShowColumnSettings(!showColumnSettings);
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
        const temp = columns[currentIndex].order;
        columns[currentIndex].order = columns[newIndex].order;
        columns[newIndex].order = temp;

        return columns.sort((a, b) => a.order - b.order);
      }
      return columns;
    });
  }, []);

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleAddCrew = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleViewCrew = useCallback((crewId: string) => {
    console.log("Viewing crew member:", crewId);
  }, []);

  const handleEditCrew = useCallback((crewId: string) => {
    console.log("Editing crew member:", crewId);
  }, []);

  const handleDeleteCrew = useCallback((crewId: string) => {
    setCrewMembers(prev => prev.filter(crew => crew.id !== crewId));
    setSelectedCrew(prev => prev.filter(id => id !== crewId));
  }, []);

  const handleSelectCrew = useCallback((crewId: string, checked: boolean) => {
    if (checked) {
      setSelectedCrew(prev => [...prev, crewId]);
    } else {
      setSelectedCrew(prev => prev.filter(id => id !== crewId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedCrew(crewMembers.map(crew => crew.id));
    } else {
      setSelectedCrew([]);
    }
  }, [crewMembers]);

  // Inline editing handlers
  const handleCellEdit = useCallback((crewId: string, field: string, currentValue: string) => {
    setEditingCell({ crewId, field });
    setEditingValue(currentValue);
  }, []);

  const handleCellSave = useCallback((crewId: string, field: string) => {
    setCrewMembers(prev => prev.map(crew =>
      crew.id === crewId ? { ...crew, [field]: editingValue } : crew
    ));
    setEditingCell(null);
    setEditingValue('');
  }, [editingValue]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  // Click outside to close handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnSettings) {
        const target = event.target as Element;
        if (!target.closest('.column-settings-panel') && !target.closest('.columns-button')) {
          setShowColumnSettings(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnSettings]);

  const router = useRouter();

  return (
    <DashboardLayout title="Crew Management">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => handleTabChange('crew')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'crew'
                ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-750'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Internal Crew ({crewMembers.length})
            </button>
            <button
              onClick={() => handleTabChange('contractors')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'contractors'
                ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-750'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              B2B Contractors ({contractors.length})
            </button>
          </div>
        </div>

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
              onClick={handleAddCrew}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {activeTab === 'crew' ? 'Add Crew Member' : 'Add Contractor'}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search crew..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterRole}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Filter by Role</option>
              <option value="foreman">Foreman</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="plumber">Plumber</option>
              <option value="laborer">Laborer</option>
              <option value="safety-inspector">Safety Inspector</option>
            </select>
          </div>
        </div>

        {/* Crew Section */}
        {activeTab === 'crew' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Crew Members</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                      title="List view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                      title="Grid view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={handleShowFilters}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </button>

                  <div className="relative">
                    <button
                      onClick={handleColumnSettings}
                      className="columns-button px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                      Columns
                    </button>

                    {/* Column Settings Dropdown */}
                    {showColumnSettings && (
                      <div className="column-settings-panel absolute right-0 top-12 w-80 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 p-4">
                        <h4 className="text-white font-medium mb-3">Customize Columns</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {columnSettings.map((column) => (
                            <div key={column.id} className="flex items-center justify-between">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={column.visible}
                                  onChange={() => handleColumnToggle(column.id)}
                                  className="rounded bg-gray-600 border-gray-500 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-gray-300 text-sm">{column.label}</span>
                              </label>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleColumnReorder(column.id, 'up')}
                                  disabled={column.order === 0}
                                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={`Move ${column.label} up`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleColumnReorder(column.id, 'down')}
                                  disabled={column.order === columnSettings.length - 1}
                                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={`Move ${column.label} down`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Table */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">
                        <input
                          type="checkbox"
                          checked={selectedCrew.length === crewMembers.length && crewMembers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded bg-gray-600 border-gray-500"
                          aria-label="Select all crew members"
                        />
                      </th>
                      {getVisibleColumns().map((column) => (
                        <th key={column.id} className={`text-left p-4 text-gray-300 font-medium ${column.id === 'actions' ? 'text-center' : ''}`}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {crewMembers.map((crew) => {
                      const getRoleColor = (role: string) => {
                        switch (role) {
                          case 'Foreman': return 'bg-purple-600';
                          case 'Electrician': return 'bg-yellow-600';
                          case 'Carpenter': return 'bg-blue-600';
                          case 'Plumber': return 'bg-cyan-600';
                          case 'Safety Inspector': return 'bg-red-600';
                          default: return 'bg-gray-600';
                        }
                      };

                      const formatDate = (dateString: string) => {
                        return new Date(dateString).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      };

                      const renderColumnContent = (columnId: string) => {
                        const isEditing = editingCell?.crewId === crew.id && editingCell?.field === columnId;
                        const editableFields = ['name', 'role', 'phone', 'email', 'hourlyRate', 'status', 'department', 'skills'];

                        if (isEditing && editableFields.includes(columnId)) {
                          if (columnId === 'role') {
                            return (
                              <select
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleCellSave(crew.id, columnId)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave(crew.id, columnId);
                                  if (e.key === 'Escape') handleCellCancel();
                                }}
                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none"
                                autoFocus
                              >
                                <option value="Foreman">Foreman</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Carpenter">Carpenter</option>
                                <option value="Plumber">Plumber</option>
                                <option value="Safety Inspector">Safety Inspector</option>
                              </select>
                            );
                          } else if (columnId === 'status') {
                            return (
                              <select
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleCellSave(crew.id, columnId)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave(crew.id, columnId);
                                  if (e.key === 'Escape') handleCellCancel();
                                }}
                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none"
                                autoFocus
                              >
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            );
                          } else {
                            return (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleCellSave(crew.id, columnId)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave(crew.id, columnId);
                                  if (e.key === 'Escape') handleCellCancel();
                                }}
                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none w-full"
                                autoFocus
                              />
                            );
                          }
                        }

                        switch (columnId) {
                          case 'name':
                            return (
                              <span
                                className="text-white font-medium cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                                onClick={() => handleCellEdit(crew.id, 'name', crew.name)}
                                title="Click to edit"
                              >
                                {crew.name}
                              </span>
                            );
                          case 'role':
                            return (
                              <span
                                className={`${getRoleColor(crew.role)} text-white px-2 py-1 rounded text-sm cursor-pointer hover:opacity-80`}
                                onClick={() => handleCellEdit(crew.id, 'role', crew.role)}
                                title="Click to edit"
                              >
                                {crew.role}
                              </span>
                            );
                          case 'phone':
                            return (
                              <span
                                className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                                onClick={() => handleCellEdit(crew.id, 'phone', crew.phone)}
                                title="Click to edit"
                              >
                                {crew.phone}
                              </span>
                            );
                          case 'email':
                            return (
                              <span
                                className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                                onClick={() => handleCellEdit(crew.id, 'email', crew.email)}
                                title="Click to edit"
                              >
                                {crew.email}
                              </span>
                            );
                          case 'hourlyRate':
                            return (
                              <span
                                className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded font-medium"
                                onClick={() => handleCellEdit(crew.id, 'hourlyRate', crew.hourlyRate)}
                                title="Click to edit"
                              >
                                {crew.hourlyRate}
                              </span>
                            );
                          case 'status':
                            return (
                              <span
                                className={`${crew.status === 'Active' ? 'bg-green-600' : crew.status === 'On Leave' ? 'bg-yellow-600' : 'bg-red-600'} text-white px-2 py-1 rounded text-sm cursor-pointer hover:opacity-80`}
                                onClick={() => handleCellEdit(crew.id, 'status', crew.status)}
                                title="Click to edit"
                              >
                                {crew.status}
                              </span>
                            );
                          case 'dateHired':
                            return <span className="text-gray-300">{formatDate(crew.dateHired)}</span>;
                          case 'department':
                            return (
                              <span
                                className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                                onClick={() => handleCellEdit(crew.id, 'department', crew.department)}
                                title="Click to edit"
                              >
                                {crew.department}
                              </span>
                            );
                          case 'skills':
                            return (
                              <span
                                className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded text-sm"
                                onClick={() => handleCellEdit(crew.id, 'skills', crew.skills)}
                                title="Click to edit"
                              >
                                {crew.skills.length > 30 ? crew.skills.substring(0, 30) + '...' : crew.skills}
                              </span>
                            );
                          case 'actions':
                            return (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewCrew(crew.id)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View crew member"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleEditCrew(crew.id)}
                                  className="text-gray-400 hover:text-gray-300 transition-colors"
                                  title="Edit crew member"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteCrew(crew.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete crew member"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            );
                          default:
                            return null;
                        }
                      };

                      return (
                        <tr key={crew.id} className="border-t border-gray-700 hover:bg-gray-700">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedCrew.includes(crew.id)}
                              onChange={(e) => handleSelectCrew(crew.id, e.target.checked)}
                              className="rounded bg-gray-600 border-gray-500"
                              aria-label={`Select crew member ${crew.name}`}
                            />
                          </td>
                          {getVisibleColumns().map((column) => (
                            <td key={column.id} className={`p-4 ${column.id === 'actions' ? 'text-center' : ''}`}>
                              {renderColumnContent(column.id)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grid View for Crew */}
            {viewMode === 'grid' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="bg-gray-700 rounded-xl p-5 shadow flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{crew.name}</h4>
                      <div className="text-gray-300 text-sm mb-1">Role: {crew.role}</div>
                      <div className="text-gray-300 text-sm mb-1">Phone: {crew.phone}</div>
                      <div className="text-gray-300 text-sm mb-1">Email: {crew.email}</div>
                      <div className="text-gray-300 text-sm mb-1">Hourly Rate: {crew.hourlyRate}</div>
                      <div className="text-gray-300 text-sm mb-1">Status: {crew.status}</div>
                    </div>
                    <div className="flex items-center justify-end mt-4 space-x-2">
                      <button onClick={() => handleViewCrew(crew.id)} className="text-blue-400 hover:text-blue-300" title="View crew">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => handleEditCrew(crew.id)} className="text-gray-400 hover:text-gray-300" title="Edit crew">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteCrew(crew.id)} className="text-red-400 hover:text-red-300" title="Delete crew">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500">
                  <option value="">All departments</option>
                  <option value="construction">Construction</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="safety">Safety</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500">
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate Range</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500">
                  <option value="">Any rate</option>
                  <option value="0-20">$0 - $20/hr</option>
                  <option value="20-30">$20 - $30/hr</option>
                  <option value="30-40">$30 - $40/hr</option>
                  <option value="40+">$40+/hr</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Add Crew Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Crew Member</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newCrew.name}
                    onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                    placeholder="Enter crew member name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select value={newCrew.role} onChange={(e) => setNewCrew({ ...newCrew, role: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500">
                    <option value="">Select role...</option>
                    <option value="foreman">Foreman</option>
                    <option value="electrician">Electrician</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="plumber">Plumber</option>
                    <option value="laborer">Laborer</option>
                    <option value="safety-inspector">Safety Inspector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newCrew.phone}
                    onChange={(e) => setNewCrew({ ...newCrew, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newCrew.email}
                    onChange={(e) => setNewCrew({ ...newCrew, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate</label>
                  <input
                    type="text"
                    value={newCrew.hourlyRate}
                    onChange={(e) => setNewCrew({ ...newCrew, hourlyRate: e.target.value })}
                    placeholder="$25.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={newCrew.address || ''}
                    onChange={(e) => setNewCrew({ ...newCrew, address: e.target.value })}
                    placeholder="Enter address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={newCrew.website || ''}
                    onChange={(e) => setNewCrew({ ...newCrew, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={newCrew.notes || ''}
                    onChange={(e) => setNewCrew({ ...newCrew, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewCrew({ ...newCrew, image: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newCrew.name) return;
                    const id = `crew${Date.now()}`;
                    const member: CrewMember = {
                      id,
                      name: newCrew.name,
                      role: newCrew.role || 'Crew',
                      phone: newCrew.phone,
                      email: newCrew.email,
                      hourlyRate: newCrew.hourlyRate || '$0.00',
                      status: 'Active',
                      dateHired: new Date().toISOString(),
                      department: '',
                      skills: '',
                      address: newCrew.address,
                      website: newCrew.website,
                      notes: newCrew.notes,
                      image: newCrew.image,
                    };
                    setCrewMembers(prev => [member, ...prev]);
                    setShowAddModal(false);
                    setNewCrew({ name: '', role: '', phone: '', email: '', hourlyRate: '', address: '', website: '', notes: '', image: '' });
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Crew Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contractor Modal */}
        {showAddModal && activeTab === 'contractors' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Contractor</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={newContractor.companyName}
                    onChange={(e) => setNewContractor({ ...newContractor, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={newContractor.contactPerson}
                    onChange={(e) => setNewContractor({ ...newContractor, contactPerson: e.target.value })}
                    placeholder="Enter contact person name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newContractor.phone}
                    onChange={(e) => setNewContractor({ ...newContractor, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newContractor.email}
                    onChange={(e) => setNewContractor({ ...newContractor, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website (optional)</label>
                  <input
                    type="text"
                    value={newContractor.website}
                    onChange={(e) => setNewContractor({ ...newContractor, website: e.target.value })}
                    placeholder="www.company.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate</label>
                  <input
                    type="text"
                    value={newContractor.hourlyRate}
                    onChange={(e) => setNewContractor({ ...newContractor, hourlyRate: e.target.value })}
                    placeholder="$45.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Services</label>
                  <input
                    type="text"
                    value={newContractor.services}
                    onChange={(e) => setNewContractor({ ...newContractor, services: e.target.value })}
                    placeholder="e.g., Electrical, Plumbing, HVAC"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={newContractor.address}
                    onChange={(e) => setNewContractor({ ...newContractor, address: e.target.value })}
                    placeholder="Enter business address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">License Number (optional)</label>
                  <input
                    type="text"
                    value={newContractor.licenseNumber}
                    onChange={(e) => setNewContractor({ ...newContractor, licenseNumber: e.target.value })}
                    placeholder="Enter license number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Specializations</label>
                  <input
                    type="text"
                    value={newContractor.specializations}
                    onChange={(e) => setNewContractor({ ...newContractor, specializations: e.target.value })}
                    placeholder="e.g., Emergency Services, High Voltage"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={newContractor.notes}
                    onChange={(e) => setNewContractor({ ...newContractor, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewContractor({ ...newContractor, image: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newContractor.companyName || !newContractor.contactPerson) return;
                    const id = `contractor${Date.now()}`;
                    const contractor: Contractor = {
                      id,
                      companyName: newContractor.companyName,
                      contactPerson: newContractor.contactPerson,
                      phone: newContractor.phone,
                      email: newContractor.email,
                      website: newContractor.website,
                      services: newContractor.services,
                      hourlyRate: newContractor.hourlyRate || '$0.00',
                      projectRate: newContractor.projectRate,
                      rating: 0,
                      status: 'Active',
                      dateAdded: new Date().toISOString(),
                      address: newContractor.address,
                      licenseNumber: newContractor.licenseNumber,
                      insuranceExpiry: '',
                      specializations: newContractor.specializations,
                      notes: newContractor.notes,
                      image: newContractor.image,
                    };
                    setContractors(prev => [contractor, ...prev]);
                    setShowAddModal(false);
                    setNewContractor({
                      companyName: '',
                      contactPerson: '',
                      phone: '',
                      email: '',
                      website: '',
                      services: '',
                      hourlyRate: '',
                      projectRate: '',
                      address: '',
                      licenseNumber: '',
                      specializations: '',
                      notes: '',
                      image: '',
                    });
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Contractor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contractors Table */}
        {viewMode === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedContractors.length === contractors.length && contractors.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContractors(contractors.map(c => c.id));
                        } else {
                          setSelectedContractors([]);
                        }
                      }}
                      className="rounded bg-gray-600 border-gray-500"
                      aria-label="Select all contractors"
                    />
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">Company</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Contact Person</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Services</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Phone</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Rating</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Hourly Rate</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((contractor) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Active': return 'bg-green-600';
                      case 'Preferred': return 'bg-blue-600';
                      case 'On Hold': return 'bg-yellow-600';
                      case 'Inactive': return 'bg-red-600';
                      default: return 'bg-gray-600';
                    }
                  };

                  const renderStars = (rating: number) => {
                    return (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-300">({rating})</span>
                      </div>
                    );
                  };

                  return (
                    <tr key={contractor.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedContractors.includes(contractor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContractors(prev => [...prev, contractor.id]);
                            } else {
                              setSelectedContractors(prev => prev.filter(id => id !== contractor.id));
                            }
                          }}
                          className="rounded bg-gray-600 border-gray-500"
                          aria-label={`Select contractor ${contractor.companyName}`}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">{contractor.companyName}</div>
                          {contractor.website && (
                            <a href={`https://${contractor.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                              {contractor.website}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{contractor.contactPerson}</td>
                      <td className="p-4">
                        <span className="text-gray-300 text-sm">
                          {contractor.services.length > 30 ? contractor.services.substring(0, 30) + '...' : contractor.services}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{contractor.phone}</td>
                      <td className="p-4 text-gray-300">{contractor.email}</td>
                      <td className="p-4">{renderStars(contractor.rating)}</td>
                      <td className="p-4">
                        <span className={`${getStatusColor(contractor.status)} text-white px-2 py-1 rounded text-sm`}>
                          {contractor.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">{contractor.hourlyRate}</td>
                      <td className="p-4 text-center">
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={() => console.log('View contractor:', contractor.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View contractor details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => console.log('Edit contractor:', contractor.id)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="Edit contractor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setContractors(prev => prev.filter(c => c.id !== contractor.id));
                              setSelectedContractors(prev => prev.filter(id => id !== contractor.id));
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete contractor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View for Contractors */}
        {viewMode === 'grid' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contractors.map((contractor) => (
              <div key={contractor.id} className="bg-gray-700 rounded-xl p-5 shadow flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{contractor.companyName}</h4>
                  <div className="text-gray-300 text-sm mb-1">Contact: {contractor.contactPerson}</div>
                  <div className="text-gray-300 text-sm mb-1">Services: {contractor.services}</div>
                  <div className="text-gray-300 text-sm mb-1">Phone: {contractor.phone}</div>
                  <div className="text-gray-300 text-sm mb-1">Email: {contractor.email}</div>
                  <div className="text-gray-300 text-sm mb-1">Hourly Rate: {contractor.hourlyRate}</div>
                  <div className="flex items-center mb-1">
                    <span className="text-gray-300 text-sm mr-2">Rating:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${star <= contractor.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-gray-300">({contractor.rating})</span>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm mb-1">
                    Status: <span className={`${contractor.status === 'Active' ? 'text-green-400' : contractor.status === 'Preferred' ? 'text-blue-400' : contractor.status === 'On Hold' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {contractor.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 space-x-2">
                  <button onClick={() => console.log('View contractor:', contractor.id)} className="text-blue-400 hover:text-blue-300" title="View contractor">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button onClick={() => console.log('Edit contractor:', contractor.id)} className="text-gray-400 hover:text-gray-300" title="Edit contractor">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => {
                    setContractors(prev => prev.filter(c => c.id !== contractor.id));
                    setSelectedContractors(prev => prev.filter(id => id !== contractor.id));
                  }} className="text-red-400 hover:text-red-300" title="Delete contractor">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 