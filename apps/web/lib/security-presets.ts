// Security configuration presets for different document types
export const SECURITY_PRESETS = {
  // Public documents - basic viewing with all features enabled
  public: {
    allowDownload: true,
    allowPrint: true,
    allowCopy: true,
    allowShare: true,
    requireAuth: false,
    sessionTimeout: 0, // No timeout
    watermark: {
      text: '',
      opacity: 0,
      position: 'center' as const
    },
    accessLevel: 'public' as const,
    trackViewing: true
  },

  // Internal documents - company restricted
  internal: {
    allowDownload: true,
    allowPrint: true,
    allowCopy: false, // Prevent copying
    allowShare: false, // Prevent sharing
    requireAuth: false,
    sessionTimeout: 60, // 1 hour timeout
    watermark: {
      text: 'INTERNAL USE ONLY',
      opacity: 0.1,
      position: 'diagonal' as const
    },
    accessLevel: 'restricted' as const,
    trackViewing: true
  },

  // Confidential documents - maximum security
  confidential: {
    allowDownload: false, // No downloads
    allowPrint: false, // No printing
    allowCopy: false, // No copying
    allowShare: false, // No sharing
    requireAuth: true, // Require authentication
    sessionTimeout: 30, // 30 minute timeout
    watermark: {
      text: 'CONFIDENTIAL',
      opacity: 0.15,
      position: 'diagonal' as const
    },
    accessLevel: 'confidential' as const,
    trackViewing: true
  },

  // Contract documents - balanced security for legal docs
  contract: {
    allowDownload: true,
    allowPrint: true,
    allowCopy: false, // Prevent text copying
    allowShare: true,
    requireAuth: false,
    sessionTimeout: 120, // 2 hour timeout
    watermark: {
      text: 'LEGAL DOCUMENT',
      opacity: 0.08,
      position: 'bottom-right' as const
    },
    accessLevel: 'restricted' as const,
    trackViewing: true
  }
};

// Document type to security preset mapping
export const getSecurityPresetForDocument = (documentType: string, documentName: string) => {
  const lowerType = documentType.toLowerCase();
  const lowerName = documentName.toLowerCase();

  // Check for confidential keywords
  if (lowerName.includes('confidential') || lowerName.includes('secret') || lowerName.includes('private')) {
    return SECURITY_PRESETS.confidential;
  }

  // Check for contract keywords
  if (lowerType.includes('contract') || lowerName.includes('agreement') || lowerName.includes('contract')) {
    return SECURITY_PRESETS.contract;
  }

  // Check for internal keywords
  if (lowerName.includes('internal') || lowerName.includes('company') || lowerType.includes('report')) {
    return SECURITY_PRESETS.internal;
  }

  // Default to public
  return SECURITY_PRESETS.public;
};
