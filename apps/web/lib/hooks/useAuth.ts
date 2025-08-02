import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { trpc } from '../trpc';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../utils/index';

interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupData extends LoginCredentials {
    name: string;
    confirmPassword: string;
}

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export function useAuth() {
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // tRPC mutations
    const loginMutation = trpc.login.useMutation();
    const registerMutation = trpc.register.useMutation();

    // Initialize auth state from localStorage
    useEffect(() => {
        const user = getFromLocalStorage<AuthUser | null>(STORAGE_KEYS.USER, null);
        const sessionActive = getFromLocalStorage<string>(STORAGE_KEYS.SESSION, '');

        if (user && sessionActive === 'true') {
            setAuthState({
                user,
                isLoading: false,
                isAuthenticated: true,
            });
        } else {
            setAuthState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const result = await loginMutation.mutateAsync(credentials);

            if (result?.success && result?.user) {
                const user: AuthUser = {
                    id: result.user.id || 'temp-id',
                    email: result.user.email || '',
                    name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || 'User',
                    role: 'employee', // Default role since not provided by API
                };

                // Store user data
                setToLocalStorage(STORAGE_KEYS.USER, user);
                setToLocalStorage(STORAGE_KEYS.SESSION, 'true');

                // Update state
                setAuthState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                });

                return { success: true, user };
            } else {
                throw new Error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return { success: false, error: message };
        }
    };

    const signup = async (data: SignupData) => {
        try {
            const result = await registerMutation.mutateAsync({
                email: data.email,
                password: data.password,
                firstName: data.name.split(' ')[0] || 'User',
                lastName: data.name.split(' ').slice(1).join(' ') || '',
                organizationName: 'Default Organization'
            });

            if (result?.success) {
                return { success: true };
            } else {
                throw new Error('Signup failed. Please try again.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        // Clear local storage
        removeFromLocalStorage(STORAGE_KEYS.USER);
        removeFromLocalStorage(STORAGE_KEYS.SESSION);

        // Update state
        setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        // Redirect to login
        router.push('/auth');
    };

    const checkAuth = () => {
        const user = getFromLocalStorage<AuthUser | null>(STORAGE_KEYS.USER, null);
        const sessionActive = getFromLocalStorage<string>(STORAGE_KEYS.SESSION, '');

        if (!user || sessionActive !== 'true') {
            logout();
            return false;
        }

        return true;
    };

    return {
        ...authState,
        login,
        signup,
        logout,
        checkAuth,
        isLoggingIn: loginMutation.isPending,
        isSigningUp: registerMutation.isPending,
        isLoggingOut: false, // No logout mutation available
    };
} 