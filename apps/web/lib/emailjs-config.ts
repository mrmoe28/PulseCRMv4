// EmailJS Configuration
// This uses a free EmailJS account for sending emails without SMTP setup
// Sign up at https://www.emailjs.com/ to get your own keys

export const EMAILJS_CONFIG = {
  // Default PulseCRM EmailJS Service (free tier)
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_pulsecrm',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_signature',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'LGgKqJ3XWdZ6NQVYT', // Demo key
  
  // Rate limiting
  MAX_EMAILS_PER_DAY: 200, // EmailJS free tier limit
};

// Email template parameters for signature requests
export interface EmailTemplateParams {
  to_email: string;
  to_name: string;
  from_name: string;
  document_name: string;
  signature_link: string;
  message?: string;
  expires_date: string;
}

// Helper to check if EmailJS is configured
export const isEmailJSConfigured = () => {
  return !!(EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.TEMPLATE_ID && EMAILJS_CONFIG.PUBLIC_KEY);
};