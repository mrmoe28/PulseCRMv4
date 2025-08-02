'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface ContractorEmployee {
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

interface ContractorCompany {
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

export default function ContractorsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'employees' | 'companies'>('employees');
  
  // Employee state
  const [employees, setEmployees] = useState<ContractorEmployee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Company state
  const [companies, setCompanies] = useState<ContractorCompany[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  
  // Common state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedEmployees = localStorage.getItem('contractor_employees');
        if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
        
        const storedCompanies = localStorage.getItem('contractor_companies');
        if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractor_employees', JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractor_companies', JSON.stringify(companies));
    }
  }, [companies]);

  const handleTabChange = useCallback((tab: 'employees' | 'companies') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedEmployees([]);
    setSelectedCompanies([]);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(comp => 
    comp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.services.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Contractor Management">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => handleTabChange('employees')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-750'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Employees ({employees.length})
            </button>
            <button
              onClick={() => handleTabChange('companies')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'companies'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-750'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Companies ({companies.length})
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'employees' ? 'Add Employee' : 'Add Company'}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'employees' ? 'Search employees...' : 'Search companies...'}
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
          {activeTab === 'employees' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Contractor Employees</h3>
              {filteredEmployees.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No employees found. Add your first employee to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-white font-medium mb-2">{employee.name}</h4>
                      <p className="text-gray-300 text-sm">Role: {employee.role}</p>
                      <p className="text-gray-300 text-sm">Phone: {employee.phone}</p>
                      <p className="text-gray-300 text-sm">Email: {employee.email}</p>
                      <p className="text-gray-300 text-sm">Rate: {employee.hourlyRate}/hr</p>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setEmployees(prev => prev.filter(e => e.id !== employee.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Contractor Companies</h3>
              {filteredCompanies.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No companies found. Add your first company to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map((company) => (
                    <div key={company.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-white font-medium mb-2">{company.companyName}</h4>
                      <p className="text-gray-300 text-sm">Contact: {company.contactPerson}</p>
                      <p className="text-gray-300 text-sm">Phone: {company.phone}</p>
                      <p className="text-gray-300 text-sm">Email: {company.email}</p>
                      <p className="text-gray-300 text-sm">Services: {company.services}</p>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setCompanies(prev => prev.filter(c => c.id !== company.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === 'employees' ? 'Add New Employee' : 'Add New Company'}
              </h3>

              {activeTab === 'employees' ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newEmployee: ContractorEmployee = {
                    id: `emp_${Date.now()}`,
                    name: formData.get('name') as string,
                    role: formData.get('role') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    hourlyRate: formData.get('hourlyRate') as string,
                    status: 'Active',
                    dateHired: new Date().toISOString(),
                    department: '',
                    skills: '',
                  };
                  setEmployees(prev => [...prev, newEmployee]);
                  setShowAddModal(false);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                      <input
                        type="text"
                        name="role"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate</label>
                      <input
                        type="text"
                        name="hourlyRate"
                        placeholder="$25.00"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Employee
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newCompany: ContractorCompany = {
                    id: `comp_${Date.now()}`,
                    companyName: formData.get('companyName') as string,
                    contactPerson: formData.get('contactPerson') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    services: formData.get('services') as string,
                    address: formData.get('address') as string,
                    status: 'Active',
                    dateAdded: new Date().toISOString(),
                    rating: 0,
                    specializations: '',
                  };
                  setCompanies(prev => [...prev, newCompany]);
                  setShowAddModal(false);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Services</label>
                      <input
                        type="text"
                        name="services"
                        placeholder="e.g., Electrical, Plumbing, HVAC"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Company
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}