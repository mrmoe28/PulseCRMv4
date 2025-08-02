'use client';

import { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { Search, Filter, Plus, Mail, Phone, Building, User, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyId: string;
  companyName: string;
  isPrimary: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContactForm {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  companyId: string;
  isPrimary: boolean;
  notes: string;
  isActive: boolean;
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const { addToast } = useToast();

  const [contactForm, setContactForm] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    companyId: '',
    isPrimary: false,
    notes: '',
    isActive: true,
  });

  const [newCompanyName, setNewCompanyName] = useState('');

  // Mock data - In production, this would come from your database
  const [companies, setCompanies] = useState<Company[]>([
    { id: 'comp-1', name: 'ABC Construction' },
    { id: 'comp-2', name: 'XYZ Builders' },
    { id: 'comp-3', name: 'Premier Contracting' },
    { id: 'comp-4', name: 'BuildRight Inc' },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'cont-1',
      firstName: 'John',
      lastName: 'Smith',
      title: 'Project Manager',
      email: 'john.smith@abcconstruction.com',
      phone: '(555) 123-4567',
      mobile: '(555) 987-6543',
      companyId: 'comp-1',
      companyName: 'ABC Construction',
      isPrimary: true,
      notes: 'Main point of contact for all projects',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'cont-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'Procurement Director',
      email: 'sarah@xyzbuilders.com',
      phone: '(555) 234-5678',
      mobile: '',
      companyId: 'comp-2',
      companyName: 'XYZ Builders',
      isPrimary: true,
      notes: '',
      isActive: true,
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: 'cont-3',
      firstName: 'Mike',
      lastName: 'Williams',
      title: 'Operations Manager',
      email: 'mike.w@premiercontracting.com',
      phone: '(555) 345-6789',
      mobile: '(555) 876-5432',
      companyId: 'comp-3',
      companyName: 'Premier Contracting',
      isPrimary: false,
      notes: 'Handles day-to-day operations',
      isActive: true,
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z',
    },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContacts = localStorage.getItem('customerContacts');
      const savedCompanies = localStorage.getItem('companies');
      
      if (savedContacts) {
        try {
          setContacts(JSON.parse(savedContacts));
        } catch (e) {
          console.error('Error loading contacts:', e);
        }
      }
      
      if (savedCompanies) {
        try {
          setCompanies(JSON.parse(savedCompanies));
        } catch (e) {
          console.error('Error loading companies:', e);
        }
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerContacts', JSON.stringify(contacts));
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [contacts, companies]);

  const resetForm = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      mobile: '',
      companyId: '',
      isPrimary: false,
      notes: '',
      isActive: true,
    });
    setEditingContact(null);
  };

  const handleAddContact = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      companyId: contact.companyId,
      isPrimary: contact.isPrimary,
      notes: contact.notes || '',
      isActive: contact.isActive,
    });
    setShowAddModal(true);
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setShowViewModal(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      addToast('Contact deleted successfully', 'success');
    }
  };

  const handleSaveContact = () => {
    // Validation
    if (!contactForm.firstName.trim() || !contactForm.lastName.trim()) {
      addToast('First name and last name are required', 'error');
      return;
    }

    if (!contactForm.companyId) {
      addToast('Please select a company', 'error');
      return;
    }

    if (contactForm.email && !contactForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    const company = companies.find(c => c.id === contactForm.companyId);
    if (!company) return;

    // If setting as primary, unset other primary contacts for this company
    if (contactForm.isPrimary) {
      setContacts(prev => prev.map(c => 
        c.companyId === contactForm.companyId ? { ...c, isPrimary: false } : c
      ));
    }

    if (editingContact) {
      // Update existing contact
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? {
              ...c,
              ...contactForm,
              companyName: company.name,
              updatedAt: new Date().toISOString(),
            }
          : c
      ));
      addToast('Contact updated successfully', 'success');
    } else {
      // Add new contact
      const newContact: Contact = {
        id: `cont-${Date.now()}`,
        ...contactForm,
        companyName: company.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setContacts(prev => [...prev, newContact]);
      addToast('Contact added successfully', 'success');
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) {
      addToast('Company name is required', 'error');
      return;
    }

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: newCompanyName.trim(),
    };

    setCompanies(prev => [...prev, newCompany]);
    setContactForm(prev => ({ ...prev, companyId: newCompany.id }));
    setNewCompanyName('');
    setShowCompanyModal(false);
    addToast('Company added successfully', 'success');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
      addToast(`${selectedContacts.length} contacts deleted`, 'success');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' || 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = filterCompany === '' || contact.companyId === filterCompany;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && contact.isActive) ||
      (filterStatus === 'inactive' && !contact.isActive);
    
    return matchesSearch && matchesCompany && matchesStatus;
  });

  return (
    <DashboardLayout title="Customer Contacts" subtitle="Manage your customer relationships">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAddContact}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
            {selectedContacts.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete Selected ({selectedContacts.length})
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <select 
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Contacts</p>
                <p className="text-2xl font-bold text-white">{contacts.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Companies</p>
                <p className="text-2xl font-bold text-white">{companies.length}</p>
              </div>
              <Building className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Primary Contacts</p>
                <p className="text-2xl font-bold text-white">{contacts.filter(c => c.isPrimary).length}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{contacts.filter(c => c.isActive).length}</p>
              </div>
              <Phone className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Contacts List/Grid */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Contacts Directory</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded bg-gray-600 border-gray-500"
                      />
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">Name</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Company</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Title</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Phone</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                    <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                          className="rounded bg-gray-600 border-gray-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <span className="text-white font-medium">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{contact.companyName}</td>
                      <td className="p-4 text-gray-300">{contact.title || '-'}</td>
                      <td className="p-4 text-gray-300">{contact.email || '-'}</td>
                      <td className="p-4 text-gray-300">{contact.phone || '-'}</td>
                      <td className="p-4">
                        {contact.isPrimary && (
                          <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">Primary</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          contact.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {contact.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleViewContact(contact)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditContact(contact)}
                            className="text-gray-400 hover:text-gray-300 p-1"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No contacts found
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        {contact.title && (
                          <p className="text-gray-400 text-sm">{contact.title}</p>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <button className="text-gray-400 hover:text-white p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{contact.companyName}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center text-gray-300">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-gray-300">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {contact.isPrimary && (
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">Primary</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        contact.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewContact(contact)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditContact(contact)}
                        className="text-gray-400 hover:text-gray-300 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  No contacts found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Contact Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveContact(); }}>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          First Name *
                        </label>
                        <input 
                          type="text" 
                          value={contactForm.firstName} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Last Name *
                        </label>
                        <input 
                          type="text" 
                          value={contactForm.lastName} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Title/Position
                        </label>
                        <input 
                          type="text" 
                          value={contactForm.title} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email
                        </label>
                        <input 
                          type="email" 
                          value={contactForm.email} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Phone
                        </label>
                        <input 
                          type="tel" 
                          value={contactForm.phone} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Mobile
                        </label>
                        <input 
                          type="tel" 
                          value={contactForm.mobile} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, mobile: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Company Information</h4>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Company *
                        </label>
                        <select 
                          value={contactForm.companyId} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, companyId: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          <option value="">Select a company...</option>
                          {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCompanyModal(true)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center text-gray-300">
                        <input 
                          type="checkbox" 
                          checked={contactForm.isPrimary} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                          className="rounded bg-gray-600 border-gray-500 mr-2"
                        />
                        Set as primary contact for this company
                      </label>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Additional Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Notes
                        </label>
                        <textarea 
                          value={contactForm.notes} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-gray-300">
                          <input 
                            type="checkbox" 
                            checked={contactForm.isActive} 
                            onChange={(e) => setContactForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded bg-gray-600 border-gray-500 mr-2"
                          />
                          Active contact
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button 
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }} 
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Company Modal */}
        {showCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Add New Company</h3>
                <button
                  onClick={() => { setShowCompanyModal(false); setNewCompanyName(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddCompany(); }}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <input 
                    type="text" 
                    value={newCompanyName} 
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter company name"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => { setShowCompanyModal(false); setNewCompanyName(''); }} 
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
            </div>
          </div>
        )}

        {/* View Contact Modal */}
        {showViewModal && viewingContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Contact Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                    {viewingContact.firstName[0]}{viewingContact.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      {viewingContact.firstName} {viewingContact.lastName}
                    </h4>
                    {viewingContact.title && (
                      <p className="text-gray-400">{viewingContact.title}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      {viewingContact.isPrimary && (
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">Primary</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        viewingContact.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {viewingContact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-medium mb-3">Contact Information</h5>
                    <div className="space-y-2 text-gray-300">
                      {viewingContact.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <a href={`mailto:${viewingContact.email}`} className="hover:text-orange-500">
                            {viewingContact.email}
                          </a>
                        </div>
                      )}
                      {viewingContact.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <a href={`tel:${viewingContact.phone}`} className="hover:text-orange-500">
                            {viewingContact.phone}
                          </a>
                        </div>
                      )}
                      {viewingContact.mobile && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <a href={`tel:${viewingContact.mobile}`} className="hover:text-orange-500">
                            {viewingContact.mobile} (Mobile)
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-3">Company</h5>
                    <div className="flex items-center text-gray-300">
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                      {viewingContact.companyName}
                    </div>
                  </div>
                </div>

                {viewingContact.notes && (
                  <div>
                    <h5 className="text-white font-medium mb-3">Notes</h5>
                    <p className="text-gray-300 whitespace-pre-wrap">{viewingContact.notes}</p>
                  </div>
                )}

                <div className="text-gray-500 text-sm">
                  <p>Created: {new Date(viewingContact.createdAt).toLocaleString()}</p>
                  <p>Last updated: {new Date(viewingContact.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditContact(viewingContact);
                  }} 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}