'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  companyName: string;
  companyLogo?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Administrator',
    profileImage: '',
    companyName: '',
    companyLogo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company logo states
  const [previewCompanyLogo, setPreviewCompanyLogo] = useState<string>('');
  const [selectedCompanyLogoFile, setSelectedCompanyLogoFile] = useState<File | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userProfile = {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || '', // Added phone storage
          role: user.role || 'Administrator',
          profileImage: user.profileImage || '',
          companyName: user.companyName || '',
          companyLogo: user.companyLogo || ''
        };
        setProfile(userProfile);
        if (userProfile.profileImage) {
          setPreviewImage(userProfile.profileImage);
        }
        if (userProfile.companyLogo) {
          setPreviewCompanyLogo(userProfile.companyLogo);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);

      // Clear any existing errors
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage('');
    setProfile(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Company logo handlers
  const handleCompanyLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setSelectedCompanyLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewCompanyLogo(result);
      };
      reader.readAsDataURL(file);

      // Clear any existing errors
      setError('');
    }
  };

  const handleRemoveCompanyLogo = () => {
    setSelectedCompanyLogoFile(null);
    setPreviewCompanyLogo('');
    setProfile(prev => ({ ...prev, companyLogo: '' }));
    if (companyLogoInputRef.current) {
      companyLogoInputRef.current.value = '';
    }
  };

  const handleCompanyLogoUpload = () => {
    companyLogoInputRef.current?.click();
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (error) setError('');
  };

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handlePasswordSave = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/simple-auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSuccess('Password changed successfully!');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call for now
      // TODO: Implement actual user update API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update localStorage with new data including profile image
      const userData = localStorage.getItem('pulse_user');
      if (userData) {
        const user = JSON.parse(userData);
        user.name = `${profile.firstName} ${profile.lastName}`;
        user.email = profile.email;
        user.phone = profile.phone;
        user.role = profile.role;
        user.companyName = profile.companyName;

        // Save profile image if one was selected
        if (previewImage) {
          user.profileImage = previewImage;
          setProfile(prev => ({ ...prev, profileImage: previewImage }));
        }

        // Save company logo if one was selected
        if (previewCompanyLogo) {
          user.companyLogo = previewCompanyLogo;
          setProfile(prev => ({ ...prev, companyLogo: previewCompanyLogo }));
        }

        localStorage.setItem('pulse_user', JSON.stringify(user));
      }

      // Dispatch custom event to update navigation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileImageUpdated'));
      }

      setSuccessMessage('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DashboardLayout title="Profile Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          </div>
          <p className="text-gray-300">Manage your personal information and preferences.</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Photo */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-6">
              {/* Current Avatar */}
              <div className="relative">
                {previewImage || profile.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage || profile.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-gray-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}

                {/* Remove button - only show if there's an image */}
                {(previewImage || profile.profileImage) && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                    title="Remove photo"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Upload a new photo</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    JPG, PNG or GIF. Max file size: 5MB. Recommended size: 400x400px
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleImageUpload}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Choose File
                  </button>

                  {selectedFile && (
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Logo */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Company Logo</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-6">
              {/* Current Company Logo */}
              <div className="relative">
                {previewCompanyLogo || profile.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewCompanyLogo || profile.companyLogo}
                    alt="Company Logo"
                    className="w-24 h-24 rounded-lg object-contain border-4 border-gray-600 bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-600 border-4 border-gray-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}

                {/* Remove button - only show if there's a logo */}
                {(previewCompanyLogo || profile.companyLogo) && (
                  <button
                    onClick={handleRemoveCompanyLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                    title="Remove logo"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Upload company logo</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    JPG, PNG or GIF. Max file size: 5MB. Recommended size: 400x400px
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCompanyLogoUpload}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Choose File
                  </button>

                  {selectedCompanyLogoFile && (
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {selectedCompanyLogoFile.name}
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={companyLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                <select
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Crew Member">Crew Member</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
          </div>
          <div className="p-6">
            {/* Password Success/Error Messages */}
            {passwordSuccess && (
              <div className="mb-4 bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {passwordError}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your new password (min. 8 characters)"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm your new password"
                />
              </div>
              <div>
                <button
                  onClick={handlePasswordSave}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
