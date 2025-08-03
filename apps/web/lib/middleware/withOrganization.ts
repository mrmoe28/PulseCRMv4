import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * Middleware to ensure all API requests are properly scoped to an organization
 * This prevents cross-organization data access
 */

export interface OrganizationRequest extends NextRequest {
  organizationId?: string;
  userId?: string;
  userRole?: string;
}

export async function withOrganization(
  handler: (req: OrganizationRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get session
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Extract organization ID from session
      const organizationId = (session.user as any).organizationId;
      
      if (!organizationId) {
        return NextResponse.json(
          { error: 'No organization context' },
          { status: 403 }
        );
      }

      // Add organization context to request
      const enhancedReq = req as OrganizationRequest;
      enhancedReq.organizationId = organizationId;
      enhancedReq.userId = session.user.id || session.user.email;
      enhancedReq.userRole = (session.user as any).role || 'member';

      // Call the actual handler
      return handler(enhancedReq);
    } catch (error) {
      console.error('Organization middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to validate organization access
 * Use this in API routes to ensure user has access to specific resources
 */
export async function validateOrganizationAccess(
  resourceOrgId: string,
  userOrgId: string
): Promise<boolean> {
  return resourceOrgId === userOrgId;
}

/**
 * Helper to add organization ID to database queries
 */
export function addOrganizationFilter<T extends Record<string, any>>(
  query: T,
  organizationId: string
): T & { organization_id: string } {
  return {
    ...query,
    organization_id: organizationId
  };
}

/**
 * Role-based access control helper
 */
export function hasPermission(
  userRole: string,
  requiredRole: 'owner' | 'admin' | 'manager' | 'member'
): boolean {
  const roleHierarchy = {
    owner: 4,
    admin: 3,
    manager: 2,
    member: 1
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}