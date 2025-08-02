'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface Contractor {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceExpiration: string;
  specialties: string[];
  hourlyRate: string;
  status: string;
  rating: number;
  dateAdded: string;
}

interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export default function ContractorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{contractorId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editContractor, setEditContractor] = useState<Contractor | null>(null);
  const [viewContractor, setViewContractor] = useState<Contractor | null>(null);
  const [addForm, setAddForm] = useState<Partial<Contractor>>({
    firstName: '', 
    lastName: '', 
    companyName: '', 
    email: '', 
    phone: '', 
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    insuranceProvider: '',
    insuranceExpiration: '',
    specialties: [],
    hourlyRate: '',
    status: 'Active',
    rating: 0
  });

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>([
    { id: 'name', label: 'Name', visible: true, order: 0 },
    { id: 'companyName', label: 'Company', visible: true, order: 1 },
    { id: 'email', label: 'Email', visible: true, order: 2 },
    { id: 'phone', label: 'Phone', visible: true, order: 3 },
    { id: 'specialties', label: 'Specialties', visible: true, order: 4 },
    { id: 'hourlyRate', label: 'Hourly Rate', visible: true, order: 5 },
    { id: 'licenseNumber', label: 'License #', visible: false, order: 6 },
    { id: 'insuranceExpiration', label: 'Insurance Exp', visible: false, order: 7 },
    { id: 'rating', label: 'Rating', visible: true, order: 8 },
    { id: 'status', label: 'Status', visible: true, order: 9 },
    { id: 'actions', label: 'Actions', visible: true, order: 10 }
  ]);

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('contractors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractors', JSON.stringify(contractors));
      localStorage.setItem('contractorsViewMode', viewMode);
    }
  }, [contractors, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contractorsViewMode');
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleAddContractor = useCallback(() => {
    setAddForm({
      firstName: '', 
      lastName: '', 
      companyName: '', 
      email: '', 
      phone: '', 
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      licenseNumber: '',
      insuranceProvider: '',
      insuranceExpiration: '',
      specialties: [],
      hourlyRate: '',
      status: 'Active',
      rating: 0
    });
    setShowAddModal(true);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  const handleViewChange = useCallback((mode: string) => {
    setViewMode(mode);
  }, [viewMode]);

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

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleViewContractor = useCallback((contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    setViewContractor(contractor || null);
  }, [contractors]);

  const handleEditContractor = useCallback((contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    if (contractor) {
      setAddForm(contractor);
      setEditContractor(contractor);
      setShowAddModal(true);
    }
  }, [contractors]);

  const handleDeleteContractor = useCallback((contractorId: string) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      setContractors(prev => prev.filter(contractor => contractor.id !== contractorId));
      setSelectedContractors(prev => prev.filter(id => id !== contractorId));
    }
  }, []);

  const handleSelectContractor = useCallback((contractorId: string, checked: boolean) => {
    if (checked) {
      setSelectedContractors(prev => [...prev, contractorId]);
    } else {
      setSelectedContractors(prev => prev.filter(id => id !== contractorId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedContractors(contractors.map(contractor => contractor.id));
    } else {
      setSelectedContractors([]);
    }
  }, [contractors]);

  const handleSaveContractor = () => {
    if (!addForm.firstName?.trim() || !addForm.lastName?.trim() || !addForm.email?.trim()) return;
    
    if (editContractor) {
      setContractors(prev => prev.map(c => c.id === editContractor.id ? { ...c, ...addForm } as Contractor : c));
      setEditContractor(null);
    } else {
      const newContractor: Contractor = {
        ...addForm as Contractor,
        id: `contractor-${Date.now()}`,
        dateAdded: new Date().toISOString(),
      };
      setContractors(prev => [...prev, newContractor]);
    }
    setShowAddModal(false);
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = searchQuery === '' || 
      contractor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === '' || contractor.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout title="Contractor Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button 
              onClick={handleAddContractor}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contractor
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contractors..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select 
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Contractors</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewChange('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleViewChange('grid')}
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
                
                <button 
                  onClick={handleColumnSettings}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Columns
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'list' && (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedContractors.length === filteredContractors.length && filteredContractors.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded bg-gray-600 border-gray-500"
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
                  {filteredContractors.map((contractor) => {
                    const renderColumnContent = (columnId: string) => {
                      switch (columnId) {
                        case 'name':
                          return <span className="text-white font-medium">{contractor.firstName} {contractor.lastName}</span>;
                        case 'companyName':
                          return <span className="text-gray-300">{contractor.companyName || '-'}</span>;
                        case 'email':
                          return <span className="text-gray-300">{contractor.email}</span>;
                        case 'phone':
                          return <span className="text-gray-300">{contractor.phone}</span>;
                        case 'specialties':
                          return (
                            <div className="flex flex-wrap gap-1">
                              {contractor.specialties.slice(0, 2).map((specialty, idx) => (
                                <span key={idx} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                                  {specialty}
                                </span>
                              ))}
                              {contractor.specialties.length > 2 && (
                                <span className="text-gray-400 text-xs">+{contractor.specialties.length - 2}</span>
                              )}
                            </div>
                          );
                        case 'hourlyRate':
                          return <span className="text-gray-300">${contractor.hourlyRate}/hr</span>;
                        case 'licenseNumber':
                          return <span className="text-gray-300">{contractor.licenseNumber || '-'}</span>;
                        case 'insuranceExpiration':
                          return <span className="text-gray-300">
                            {contractor.insuranceExpiration ? new Date(contractor.insuranceExpiration).toLocaleDateString() : '-'}
                          </span>;
                        case 'rating':
                          return (
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < contractor.rating ? 'text-yellow-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          );
                        case 'status':
                          return (
                            <span className={`px-2 py-1 rounded text-sm ${
                              contractor.status === 'Active' ? 'bg-green-600 text-white' : 
                              contractor.status === 'Inactive' ? 'bg-gray-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {contractor.status}
                            </span>
                          );
                        case 'actions':
                          return (
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => handleViewContractor(contractor.id)}
                                className="text-blue-400 hover:text-blue-300"
                                title="View details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleEditContractor(contractor.id)}
                                className="text-gray-400 hover:text-gray-300"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteContractor(contractor.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
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
                      <tr key={contractor.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={selectedContractors.includes(contractor.id)}
                            onChange={(e) => handleSelectContractor(contractor.id, e.target.checked)}
                            className="rounded bg-gray-600 border-gray-500"
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
            )}

            {viewMode === 'grid' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredContractors.map((contractor) => (
                  <div key={contractor.id} className="bg-gray-700 rounded-xl p-5 shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white">{contractor.firstName} {contractor.lastName}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        contractor.status === 'Active' ? 'bg-green-600' : 
                        contractor.status === 'Inactive' ? 'bg-gray-600' :
                        'bg-red-600'
                      } text-white`}>
                        {contractor.status}
                      </span>
                    </div>
                    {contractor.companyName && (
                      <div className="text-gray-300 text-sm mb-2">{contractor.companyName}</div>
                    )}
                    <div className="text-gray-400 text-sm space-y-1 mb-3">
                      <div>{contractor.email}</div>
                      <div>{contractor.phone}</div>
                      <div>${contractor.hourlyRate}/hr</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < contractor.rating ? 'text-yellow-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => handleViewContractor(contractor.id)} className="text-blue-400 hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => handleEditContractor(contractor.id)} className="text-gray-400 hover:text-gray-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editContractor ? 'Edit Contractor' : 'Add Contractor'}
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setEditContractor(null); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Personal Information</h4>
                  <input 
                    type="text" 
                    placeholder="First Name *" 
                    value={addForm.firstName || ''} 
                    onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name *" 
                    value={addForm.lastName || ''} 
                    onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="email" 
                    placeholder="Email *" 
                    value={addForm.email || ''} 
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="Phone" 
                    value={addForm.phone || ''} 
                    onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="Mobile" 
                    value={addForm.mobile || ''} 
                    onChange={e => setAddForm(f => ({ ...f, mobile: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Company Information</h4>
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    value={addForm.companyName || ''} 
                    onChange={e => setAddForm(f => ({ ...f, companyName: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="License Number" 
                    value={addForm.licenseNumber || ''} 
                    onChange={e => setAddForm(f => ({ ...f, licenseNumber: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="Insurance Provider" 
                    value={addForm.insuranceProvider || ''} 
                    onChange={e => setAddForm(f => ({ ...f, insuranceProvider: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="date" 
                    placeholder="Insurance Expiration" 
                    value={addForm.insuranceExpiration || ''} 
                    onChange={e => setAddForm(f => ({ ...f, insuranceExpiration: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="number" 
                    placeholder="Hourly Rate" 
                    value={addForm.hourlyRate || ''} 
                    onChange={e => setAddForm(f => ({ ...f, hourlyRate: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Address</h4>
                  <input 
                    type="text" 
                    placeholder="Street Address" 
                    value={addForm.address || ''} 
                    onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={addForm.city || ''} 
                      onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))} 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                    />
                    <input 
                      type="text" 
                      placeholder="State" 
                      value={addForm.state || ''} 
                      onChange={e => setAddForm(f => ({ ...f, state: e.target.value }))} 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="ZIP Code" 
                    value={addForm.zipCode || ''} 
                    onChange={e => setAddForm(f => ({ ...f, zipCode: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Additional Information</h4>
                  <select 
                    value={addForm.status || 'Active'} 
                    onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAddForm(f => ({ ...f, rating: star }))}
                          className="focus:outline-none"
                        >
                          <svg className={`w-6 h-6 ${star <= (addForm.rating || 0) ? 'text-yellow-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  onClick={() => { setShowAddModal(false); setEditContractor(null); }} 
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveContractor} 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editContractor ? 'Save Changes' : 'Add Contractor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewContractor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Contractor Details</h3>
                <button
                  onClick={() => setViewContractor(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Personal Information</h4>
                  <div className="space-y-2 text-gray-300">
                    <div><span className="font-medium">Name:</span> {viewContractor.firstName} {viewContractor.lastName}</div>
                    <div><span className="font-medium">Email:</span> {viewContractor.email}</div>
                    <div><span className="font-medium">Phone:</span> {viewContractor.phone}</div>
                    <div><span className="font-medium">Mobile:</span> {viewContractor.mobile || '-'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Company Information</h4>
                  <div className="space-y-2 text-gray-300">
                    <div><span className="font-medium">Company:</span> {viewContractor.companyName || '-'}</div>
                    <div><span className="font-medium">License #:</span> {viewContractor.licenseNumber || '-'}</div>
                    <div><span className="font-medium">Insurance:</span> {viewContractor.insuranceProvider || '-'}</div>
                    <div><span className="font-medium">Insurance Exp:</span> {viewContractor.insuranceExpiration ? new Date(viewContractor.insuranceExpiration).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Address</h4>
                  <div className="space-y-2 text-gray-300">
                    <div>{viewContractor.address || '-'}</div>
                    <div>{viewContractor.city && viewContractor.state ? `${viewContractor.city}, ${viewContractor.state} ${viewContractor.zipCode}` : '-'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Additional Details</h4>
                  <div className="space-y-2 text-gray-300">
                    <div><span className="font-medium">Hourly Rate:</span> ${viewContractor.hourlyRate}/hr</div>
                    <div><span className="font-medium">Status:</span> {viewContractor.status}</div>
                    <div>
                      <span className="font-medium">Rating:</span>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < viewContractor.rating ? 'text-yellow-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewContractor(null)} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}