'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  userOrganizations: Organization[];
  userRole: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadOrganizationData();
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  const loadOrganizationData = async () => {
    try {
      setIsLoading(true);
      
      // Load user's organizations from API
      const response = await fetch('/api/organizations/user');
      if (response.ok) {
        const data = await response.json();
        setUserOrganizations(data.organizations || []);
        
        // Set current organization (from session or first available)
        if (data.currentOrganization) {
          setCurrentOrganization(data.currentOrganization);
          setUserRole(data.role);
        } else if (data.organizations?.length > 0) {
          setCurrentOrganization(data.organizations[0]);
          setUserRole(data.organizations[0].role);
        }
      }
    } catch (error) {
      console.error('Failed to load organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      // Save preference to backend
      try {
        await fetch('/api/organizations/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: orgId })
        });
      } catch (error) {
        console.error('Failed to save organization preference:', error);
      }
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        isLoading,
        switchOrganization,
        userOrganizations,
        userRole
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// HOC for pages that require organization context
export function withOrganization<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithOrganizationComponent(props: P) {
    const { currentOrganization, isLoading } = useOrganization();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (!currentOrganization) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization</h2>
            <p className="text-gray-600">Please contact support to set up your organization.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}