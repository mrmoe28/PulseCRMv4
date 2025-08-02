// Document categories specific to construction/solar business
export const DOCUMENT_CATEGORIES = {
  // Contracts & Agreements
  CONTRACTS: {
    id: 'contracts',
    name: 'Contracts & Agreements',
    color: 'purple',
    subcategories: [
      'Solar Installation Agreement',
      'Roofing Contract',
      'Service Agreement',
      'Subcontractor Agreement',
      'Purchase Agreement',
      'Lease Agreement',
      'Warranty Agreement'
    ]
  },
  
  // Proposals & Quotes
  PROPOSALS: {
    id: 'proposals',
    name: 'Proposals & Quotes',
    color: 'blue',
    subcategories: [
      'Solar System Proposal',
      'Roofing Proposal',
      'Maintenance Proposal',
      'Project Quote',
      'Change Order',
      'Cost Estimate'
    ]
  },
  
  // Invoices & Billing
  INVOICES: {
    id: 'invoices',
    name: 'Invoices & Billing',
    color: 'green',
    subcategories: [
      'Customer Invoice',
      'Supplier Invoice',
      'Progress Billing',
      'Final Invoice',
      'Credit Memo',
      'Payment Receipt'
    ]
  },
  
  // Permits & Compliance
  PERMITS: {
    id: 'permits',
    name: 'Permits & Compliance',
    color: 'red',
    subcategories: [
      'Building Permit',
      'Electrical Permit',
      'Solar Permit',
      'Inspection Report',
      'Compliance Certificate',
      'License Document'
    ]
  },
  
  // Technical Documents
  TECHNICAL: {
    id: 'technical',
    name: 'Technical Documents',
    color: 'orange',
    subcategories: [
      'System Design',
      'Engineering Drawing',
      'Site Plan',
      'Wiring Diagram',
      'Product Specification',
      'Installation Manual',
      'Safety Data Sheet'
    ]
  },
  
  // Project Documentation
  PROJECTS: {
    id: 'projects',
    name: 'Project Documentation',
    color: 'indigo',
    subcategories: [
      'Project Plan',
      'Progress Report',
      'Site Photos',
      'Completion Certificate',
      'Punch List',
      'Meeting Minutes',
      'Change Log'
    ]
  },
  
  // Customer Documents
  CUSTOMERS: {
    id: 'customers',
    name: 'Customer Documents',
    color: 'pink',
    subcategories: [
      'Customer Information',
      'Credit Application',
      'Insurance Document',
      'Utility Bill',
      'HOA Approval',
      'Property Document',
      'Communication Log'
    ]
  },
  
  // Financial Documents
  FINANCIAL: {
    id: 'financial',
    name: 'Financial Documents',
    color: 'yellow',
    subcategories: [
      'Financial Statement',
      'Tax Document',
      'Bank Statement',
      'Loan Document',
      'Insurance Policy',
      'Expense Report',
      'Budget Document'
    ]
  },
  
  // HR & Personnel
  HR: {
    id: 'hr',
    name: 'HR & Personnel',
    color: 'teal',
    subcategories: [
      'Employee Contract',
      'Timesheet',
      'Training Certificate',
      'Safety Record',
      'Performance Review',
      'Company Policy',
      'Benefits Document'
    ]
  },
  
  // Other
  OTHER: {
    id: 'other',
    name: 'Other Documents',
    color: 'gray',
    subcategories: [
      'General Document',
      'Reference Material',
      'Template',
      'Checklist',
      'Note',
      'Miscellaneous'
    ]
  }
} as const;

export type DocumentCategoryId = keyof typeof DOCUMENT_CATEGORIES;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[DocumentCategoryId];

// Helper functions
export function getCategoryById(id: string): DocumentCategory | undefined {
  return Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === id);
}

export function getCategoryColor(categoryId: string): string {
  const category = getCategoryById(categoryId);
  if (!category) return 'gray';
  
  const colors = {
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/50',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };
  
  return colors[category.color as keyof typeof colors] || colors.gray;
}

export function getCategoryIcon(categoryId: string): string {
  const icons = {
    contracts: '📄',
    proposals: '📋',
    invoices: '💰',
    permits: '🏗️',
    technical: '⚙️',
    projects: '📁',
    customers: '👥',
    financial: '💳',
    hr: '👔',
    other: '📎'
  };
  
  return icons[categoryId as keyof typeof icons] || '📎';
}