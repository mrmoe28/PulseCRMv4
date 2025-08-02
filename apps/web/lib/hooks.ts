import { useCallback, useEffect, useState } from 'react';
import {
  Contact,
  CreateContactPayload,
  CreateJobPayload,
  Job,
  JobFilters,
  JobSortOptions
} from './types';

// =============================================================================
// GENERIC HOOKS
// =============================================================================

/**
 * Generic hook for managing loading states
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, setIsLoading, withLoading };
}

/**
 * Hook for managing form state with validation
 */
export function useFormState<T extends Record<string, unknown>>(
  initialState: T,
  validator?: (data: T) => Partial<Record<keyof T, string>>
) {
  const [data, setData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [errors]);

  const validate = useCallback(() => {
    if (!validator) return true;

    const newErrors = validator(data);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data, validator]);

  const reset = useCallback(() => {
    setData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    data,
    errors,
    touched,
    updateField,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Hook for managing modal/dialog state
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

// =============================================================================
// CONTACT MANAGEMENT HOOKS
// =============================================================================

/**
 * Hook for managing contacts with CRUD operations
 */
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const { isLoading, withLoading } = useLoading();

  // Filter contacts based on search and type
  useEffect(() => {
    let filtered = [...contacts];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(contact => contact.type === selectedType);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, selectedType]);

  const createContact = useCallback(async (contactData: CreateContactPayload) => {
    return withLoading(async () => {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newContact: Contact = {
        ...contactData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setContacts(prev => [...prev, newContact]);
      return newContact;
    });
  }, [withLoading]);

  const updateContact = useCallback(async (id: string, updates: Partial<CreateContactPayload>) => {
    return withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setContacts(prev => prev.map(contact =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date() }
          : contact
      ));
    });
  }, [withLoading]);

  const deleteContact = useCallback(async (id: string) => {
    return withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setContacts(prev => prev.filter(contact => contact.id !== id));
    });
  }, [withLoading]);

  const getContactById = useCallback((id: string) => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    getContactById
  };
}

// =============================================================================
// JOB MANAGEMENT HOOKS
// =============================================================================

/**
 * Hook for managing jobs with filtering and sorting
 */
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [sortOptions, setSortOptions] = useState<JobSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  const { isLoading, withLoading } = useLoading();

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...jobs];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(job => filters.status!.includes(job.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(job => filters.priority!.includes(job.priority));
    }

    if (filters.contactId) {
      filtered = filtered.filter(job => job.contactId === filters.contactId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search)
      );
    }

    if (filters.startDateFrom) {
      filtered = filtered.filter(job => job.startDate >= filters.startDateFrom!);
    }

    if (filters.startDateTo) {
      filtered = filtered.filter(job => job.startDate <= filters.startDateTo!);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(job =>
        job.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortOptions;
      const aValue: unknown = a[field];
      const bValue: unknown = b[field];

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime();
        const bTime = bValue.getTime();
        if (aTime < bTime) return direction === 'asc' ? -1 : 1;
        if (aTime > bTime) return direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aLower = aValue.toLowerCase();
        const bLower = bValue.toLowerCase();
        if (aLower < bLower) return direction === 'asc' ? -1 : 1;
        if (aLower > bLower) return direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Handle numbers and other comparable types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    setFilteredJobs(filtered);
  }, [jobs, filters, sortOptions]);

  const createJob = useCallback(async (jobData: CreateJobPayload) => {
    return withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newJob: Job = {
        ...jobData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setJobs(prev => [...prev, newJob]);
      return newJob;
    });
  }, [withLoading]);

  const updateJob = useCallback(async (id: string, updates: Partial<CreateJobPayload>) => {
    return withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setJobs(prev => prev.map(job =>
        job.id === id
          ? { ...job, ...updates, updatedAt: new Date() }
          : job
      ));
    });
  }, [withLoading]);

  const updateJobStatus = useCallback(async (id: string, status: Job['status']) => {
    return updateJob(id, {
      status,
      ...(status === 'completed' ? { completedAt: new Date() } : {})
    });
  }, [updateJob]);

  const deleteJob = useCallback(async (id: string) => {
    return withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setJobs(prev => prev.filter(job => job.id !== id));
    });
  }, [withLoading]);

  const getJobById = useCallback((id: string) => {
    return jobs.find(job => job.id === id);
  }, [jobs]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    filters,
    sortOptions,
    setSortOptions,
    isLoading,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    getJobById,
    updateFilters,
    clearFilters
  };
}

// =============================================================================
// PAGINATION HOOK
// =============================================================================

/**
 * Hook for managing pagination state
 */
export function usePagination(totalItems: number, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when total items change significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    reset
  };
}

// =============================================================================
// LOCAL STORAGE HOOK
// =============================================================================

/**
 * Hook for persisting state in localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// =============================================================================
// DEBOUNCE HOOK
// =============================================================================

/**
 * Hook for debouncing values (useful for search inputs)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 