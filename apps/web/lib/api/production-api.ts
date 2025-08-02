import { initTRPC, TRPCError } from '@trpc/server';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { z } from 'zod';

// Simple in-memory storage for now - will be replaced with real DB later
// Cleared all existing user data
const users = new Map<string, any>();
const organizations = new Map<string, any>();
const verificationTokens = new Map<string, any>();

// Import real email service

const t = initTRPC.create();

export const appRouter = t.router({
    // Test endpoint
    hello: t.procedure
        .input(z.object({ name: z.string() }))
        .query(({ input }) => {
            return { greeting: `Hello ${input.name}!` };
        }),

    // User registration
    register: t.procedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(6),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            organizationName: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
            try {
                // Check if user already exists
                const existingUser = Array.from(users.values()).find(
                    (user: any) => user.email === input.email
                );

                if (existingUser) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'User already exists with this email'
                    });
                }

                // Hash password
                const salt = randomBytes(16).toString('hex');
                const hashedPassword = pbkdf2Sync(input.password, salt, 1000, 64, 'sha512').toString('hex');

                // Create organization first
                const orgId = randomBytes(16).toString('hex');
                const organization = {
                    id: orgId,
                    name: input.organizationName,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                organizations.set(orgId, organization);

                // Create user (email verification disabled)
                const userId = randomBytes(16).toString('hex');
                const user = {
                    id: userId,
                    email: input.email,
                    passwordHash: hashedPassword,
                    passwordSalt: salt,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    organizationId: orgId,
                    emailVerified: true, // Always verified - no email verification required
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                users.set(userId, user);

                return {
                    success: true,
                    message: 'User registered successfully.',
                    userId: user.id,
                    requiresVerification: false,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        organization: organization
                    }
                };
            } catch (error) {
                console.error('Registration error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to register user'
                });
            }
        }),

    // Email verification
    verifyEmail: t.procedure
        .input(z.object({
            token: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find verification token
                const tokenRecord = verificationTokens.get(input.token);

                if (!tokenRecord || tokenRecord.type !== 'email_verification') {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Invalid verification token'
                    });
                }

                // Check if token is expired
                if (tokenRecord.expiresAt < new Date()) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Verification token has expired'
                    });
                }

                // Update user as verified
                const user = users.get(tokenRecord.userId);
                if (user) {
                    user.emailVerified = true;
                    user.updatedAt = new Date();
                    users.set(user.id, user);
                }

                // Delete used token
                verificationTokens.delete(input.token);

                return {
                    success: true,
                    message: 'Email verified successfully'
                };
            } catch (error) {
                console.error('Email verification error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to verify email'
                });
            }
        }),

    // User login
    login: t.procedure
        .input(z.object({
            email: z.string().email(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find user
                const user = Array.from(users.values()).find(
                    (u: any) => u.email === input.email
                );

                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password'
                    });
                }

                // Check password
                const hashedPassword = pbkdf2Sync(input.password, user.passwordSalt, 1000, 64, 'sha512').toString('hex');
                if (hashedPassword !== user.passwordHash) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid email or password'
                    });
                }

                // Email verification disabled - all users can login

                // Get organization
                const organization = organizations.get(user.organizationId);

                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        organization: organization
                    }
                };
            } catch (error) {
                console.error('Login error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to login'
                });
            }
        }),

    // Forgot password
    forgotPassword: t.procedure
        .input(z.object({
            email: z.string().email(),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find user
                const user = Array.from(users.values()).find(
                    (u: any) => u.email === input.email
                );

                // Always return success for security (don't reveal if email exists)
                // But only send email if user actually exists
                if (user) {
                    // Generate password reset token
                    const resetToken = randomBytes(32).toString('hex');
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

                    verificationTokens.set(resetToken, {
                        userId: user.id,
                        token: resetToken,
                        type: 'password_reset',
                        expiresAt,
                        createdAt: new Date(),
                    });

                    // Send password reset email
                    try {
                        // Determine base URL for different environments
                        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

                        if (!baseUrl) {
                            // For Vercel deployments
                            if (process.env.VERCEL_URL) {
                                baseUrl = `https://${process.env.VERCEL_URL}`;
                            }
                            // For local development
                            else {
                                baseUrl = 'http://localhost:3010';
                            }
                        }

                        const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

                        // For now, just log the reset URL (in real app, send email)
                        console.log('Password reset URL:', resetUrl);
                        console.log('Reset token for', user.email, ':', resetToken);

                        // TODO: Send actual email with sendPasswordResetEmail function
                        // await sendPasswordResetEmail({
                        //     email: user.email,
                        //     firstName: user.firstName,
                        //     resetUrl
                        // });
                    } catch (emailError) {
                        console.error('Failed to send password reset email:', emailError);
                        // Don't fail the request if email sending fails
                    }
                }

                return {
                    success: true,
                    message: 'If an account with that email exists, we have sent a password reset link.'
                };
            } catch (error) {
                console.error('Forgot password error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to process forgot password request'
                });
            }
        }),

    // Reset password
    resetPassword: t.procedure
        .input(z.object({
            token: z.string(),
            newPassword: z.string().min(6),
        }))
        .mutation(async ({ input }) => {
            try {
                // Find reset token
                const tokenRecord = verificationTokens.get(input.token);

                if (!tokenRecord || tokenRecord.type !== 'password_reset') {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Invalid or expired reset token'
                    });
                }

                // Check if token is expired
                if (tokenRecord.expiresAt < new Date()) {
                    verificationTokens.delete(input.token);
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Reset token has expired'
                    });
                }

                // Update user password
                const user = users.get(tokenRecord.userId);
                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found'
                    });
                }

                // Hash new password
                const salt = randomBytes(16).toString('hex');
                const hashedPassword = pbkdf2Sync(input.newPassword, salt, 1000, 64, 'sha512').toString('hex');

                user.passwordHash = hashedPassword;
                user.passwordSalt = salt;
                user.updatedAt = new Date();
                users.set(user.id, user);

                // Delete used token
                verificationTokens.delete(input.token);

                return {
                    success: true,
                    message: 'Password reset successfully'
                };
            } catch (error) {
                console.error('Reset password error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to reset password'
                });
            }
        }),

    // Get companies
    getCompanies: t.procedure
        .query(async () => {
            try {
                const companies = Array.from(organizations.values());
                return companies;
            } catch (error) {
                console.error('Get companies error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch companies'
                });
            }
        }),

    // Create company
    createCompany: t.procedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                const companyId = randomBytes(16).toString('hex');
                const company = {
                    id: companyId,
                    name: input.name,
                    description: input.description,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                organizations.set(companyId, company);

                return company;
            } catch (error) {
                console.error('Create company error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create company'
                });
            }
        }),

    // Update company
    updateCompany: t.procedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            try {
                const company = organizations.get(input.id);
                if (!company) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Company not found'
                    });
                }

                company.name = input.name;
                company.description = input.description;
                company.updatedAt = new Date();
                organizations.set(input.id, company);

                return company;
            } catch (error) {
                console.error('Update company error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update company'
                });
            }
        }),

    // Delete company
    deleteCompany: t.procedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const company = organizations.get(input.id);
                if (!company) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Company not found'
                    });
                }

                organizations.delete(input.id);
                return { success: true };
            } catch (error) {
                console.error('Delete company error:', error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete company'
                });
            }
        }),

    // Get users
    getUsers: t.procedure
        .query(async () => {
            try {
                const userList = Array.from(users.values()).map(user => ({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    organization: organizations.get(user.organizationId)
                }));
                return userList;
            } catch (error) {
                console.error('Get users error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch users'
                });
            }
        }),

    // Get dashboard stats
    getDashboardStats: t.procedure
        .query(async () => {
            try {
                const totalUsers = users.size;
                const totalOrganizations = organizations.size;
                const verifiedUsers = Array.from(users.values()).filter(user => user.emailVerified).length;

                return {
                    totalUsers,
                    totalOrganizations,
                    verifiedUsers,
                    activeJobs: 0, // Placeholder for now
                    completedJobs: 0, // Placeholder for now
                };
            } catch (error) {
                console.error('Get dashboard stats error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch dashboard stats'
                });
            }
        }),

    // Get jobs
    getJobs: t.procedure
        .input(z.object({
            status: z.string().optional(),
            limit: z.number().optional(),
        }).optional())
        .query(async ({ input = {} }) => {
            try {
                // Return empty array - no demo data
                return [];
            } catch (error) {
                console.error('Get jobs error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch jobs'
                });
            }
        }),

    // Create job
    createJob: t.procedure
        .input(z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            priority: z.enum(['low', 'medium', 'high']),
            assignedTo: z.string().min(1),
            dueDate: z.string(), // ISO date string
            companyId: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const jobId = randomBytes(16).toString('hex');
                const job = {
                    id: jobId,
                    title: input.title,
                    description: input.description,
                    status: 'pending' as const,
                    priority: input.priority,
                    assignedTo: input.assignedTo,
                    dueDate: new Date(input.dueDate),
                    createdAt: new Date(),
                    companyId: input.companyId,
                };

                // In a real app, this would be stored in a database
                // For now, we'll just return the created job
                return job;
            } catch (error) {
                console.error('Create job error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create job'
                });
            }
        }),
});

export type AppRouter = typeof appRouter;
