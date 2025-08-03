'use client';

import React, { useState, useEffect } from 'react';
// import { useOrganization } from '@/providers/OrganizationContext'; // TODO: Enable when auth is configured
import { Building, Users, Settings, CreditCard, Activity, Mail, UserPlus, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinedAt: string;
  lastLogin?: string;
}

export default function OrganizationPage() {
  // TODO: Re-enable when auth is configured
  // const { currentOrganization, userRole } = useOrganization();
  
  // Mock data for now - replace with real data when auth is configured
  const currentOrganization = {
    name: 'Demo Organization',
    website: '',
    industry: '',
    size: 'small'
  };
  const userRole = 'owner'; // Default to owner for demo
  
  const { addToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'billing' | 'activity'>('general');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [orgData, setOrgData] = useState({
    name: currentOrganization?.name || '',
    website: currentOrganization?.website || '',
    industry: currentOrganization?.industry || '',
    size: currentOrganization?.size || 'small'
  });

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamMembers();
    }
  }, [activeTab]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from API
      // For now, using mock data
      setTeamMembers([
        {
          id: '1',
          email: 'admin@company.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'owner',
          joinedAt: '2024-01-01',
          lastLogin: '2024-12-20'
        }
      ]);
    } catch (error) {
      addToast('Failed to load team members', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      addToast('Please enter an email address', 'error');
      return;
    }

    try {
      // API call to invite user
      addToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
    } catch (error) {
      addToast('Failed to send invitation', 'error');
    }
  };

  const handleUpdateOrganization = async () => {
    try {
      // API call to update organization
      addToast('Organization updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update organization', 'error');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      try {
        // API call to remove user
        setTeamMembers(prev => prev.filter(m => m.id !== userId));
        addToast('User removed successfully', 'success');
      } catch (error) {
        addToast('Failed to remove user', 'error');
      }
    }
  };

  const canManageOrganization = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Organization Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-3 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Settings className="inline-block h-4 w-4 mr-2" />
                General
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-3 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'team'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Users className="inline-block h-4 w-4 mr-2" />
                Team Members
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-3 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'billing'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <CreditCard className="inline-block h-4 w-4 mr-2" />
                Billing
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'activity'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Activity className="inline-block h-4 w-4 mr-2" />
                Activity
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Organization Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={orgData.name}
                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                        disabled={!canManageOrganization}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={orgData.website}
                        onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                        disabled={!canManageOrganization}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Industry
                      </label>
                      <select
                        value={orgData.industry}
                        onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                        disabled={!canManageOrganization}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="">Select Industry</option>
                        <option value="construction">Construction</option>
                        <option value="technology">Technology</option>
                        <option value="retail">Retail</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company Size
                      </label>
                      <select
                        value={orgData.size}
                        onChange={(e) => setOrgData({ ...orgData, size: e.target.value })}
                        disabled={!canManageOrganization}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="small">1-10 employees</option>
                        <option value="medium">11-50 employees</option>
                        <option value="large">51-200 employees</option>
                        <option value="enterprise">200+ employees</option>
                      </select>
                    </div>
                  </div>
                  {canManageOrganization && (
                    <button
                      onClick={handleUpdateOrganization}
                      className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {canManageOrganization && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Invite Team Member
                    </h4>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={handleInviteUser}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invite
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Current Team Members
                  </h4>
                  {/* Mobile Cards for Team Members */}
                  <div className="block sm:hidden space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'owner' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                              : member.role === 'admin'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              : member.role === 'manager'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                          {canManageOrganization && member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveUser(member.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table for Team Members */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {teamMembers.map((member) => (
                          <tr key={member.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {member.email}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                member.role === 'owner' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                                  : member.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                  : member.role === 'manager'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {canManageOrganization && member.role !== 'owner' && (
                                <button
                                  onClick={() => handleRemoveUser(member.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Current Plan: Free</h3>
                  <p className="mb-4 opacity-90">You're using the free plan with limited features.</p>
                  <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Free Plan</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">$0/mo</p>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Up to 3 users</li>
                      <li>• 10 jobs/month</li>
                      <li>• Basic features</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-500 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pro Plan</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">$49/mo</p>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Unlimited users</li>
                      <li>• Unlimited jobs</li>
                      <li>• Advanced features</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Enterprise</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Custom</p>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Custom limits</li>
                      <li>• Priority support</li>
                      <li>• Custom features</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Activity logging coming soon...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}