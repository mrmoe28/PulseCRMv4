'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Contact, ContactType } from './contact-form';
const ContactForm = dynamic(() => import('./contact-form'), { ssr: false });

// Example usage of the ContactForm component
export default function ContactFormExample() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const handleCreateContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContact: Contact = {
        ...contactData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setContacts(prev => [...prev, newContact]);
      setShowForm(false);
      
      // You could show a success toast notification here
      console.log('Contact created successfully!', newContact);
      
    } catch (error) {
      console.error('Failed to create contact:', error);
      // Handle error - show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Contact Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Contact
        </button>
      </div>

      {/* Contact List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">
            Contacts ({contacts.length})
          </h2>
        </div>
        
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No contacts yet</h3>
            <p className="text-gray-400">Get started by creating your first contact.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-750 border border-gray-650 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-gray-400 text-sm">{contact.email}</p>
                      <p className="text-gray-400 text-sm">{contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getContactTypeBadgeClass(contact.type)}`}>
                      {contact.type}
                    </span>
                    <button 
                      className="text-gray-400 hover:text-white"
                      title="Edit contact"
                      aria-label="Edit contact"
                    >
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

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          onSubmitAction={handleCreateContact}
          onCancelAction={handleCancelForm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Helper function to get badge class for contact type
function getContactTypeBadgeClass(type: ContactType): string {
  switch (type) {
    case 'Client':
      return 'badge-primary';
    case 'Supplier':
      return 'badge-success';
    case 'Contractor':
      return 'badge-warning';
    case 'Employee':
      return 'badge-danger';
    default:
      return 'badge-primary';
  }
} 