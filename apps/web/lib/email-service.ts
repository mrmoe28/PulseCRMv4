'use client';

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, EmailTemplateParams, isEmailJSConfigured } from './emailjs-config';

// Initialize EmailJS with public key
if (typeof window !== 'undefined' && isEmailJSConfigured()) {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

export interface SignatureRequestData {
  documentId: string;
  documentName: string;
  documentUrl: string;
  signerEmail: string;
  signerName: string;
  requestedBy: string;
  message?: string;
}

export class EmailService {
  private static instance: EmailService;
  private emailsSentToday: number = 0;
  private lastResetDate: string;

  private constructor() {
    const today = new Date().toDateString();
    this.lastResetDate = today;
    
    // Load count from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('emailsSentToday');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          this.emailsSentToday = data.count;
        } else {
          this.resetDailyCount();
        }
      }
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private resetDailyCount() {
    this.emailsSentToday = 0;
    const today = new Date().toDateString();
    this.lastResetDate = today;
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailsSentToday', JSON.stringify({
        date: today,
        count: 0
      }));
    }
  }

  private incrementEmailCount() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.resetDailyCount();
    }
    
    this.emailsSentToday++;
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailsSentToday', JSON.stringify({
        date: today,
        count: this.emailsSentToday
      }));
    }
  }

  public canSendEmail(): boolean {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.resetDailyCount();
    }
    return this.emailsSentToday < EMAILJS_CONFIG.MAX_EMAILS_PER_DAY;
  }

  public async sendSignatureRequest(data: SignatureRequestData): Promise<{ success: boolean; error?: string; fallbackUrl?: string }> {
    // Check if EmailJS is configured
    if (!isEmailJSConfigured()) {
      // Return mailto fallback
      return {
        success: false,
        error: 'Email service not configured',
        fallbackUrl: this.generateMailtoLink(data)
      };
    }

    // Check daily limit
    if (!this.canSendEmail()) {
      return {
        success: false,
        error: 'Daily email limit reached. Please try again tomorrow or use the fallback option.',
        fallbackUrl: this.generateMailtoLink(data)
      };
    }

    try {
      // Generate signature URL
      const baseUrl = window.location.origin;
      const token = this.generateToken();
      const signatureUrl = `${baseUrl}/sign/${token}`;
      
      // Store signature request in localStorage (temporary storage)
      this.storeSignatureRequest(token, data);
      
      // Prepare email template parameters
      const templateParams: EmailTemplateParams = {
        to_email: data.signerEmail,
        to_name: data.signerName,
        from_name: data.requestedBy,
        document_name: data.documentName,
        signature_link: signatureUrl,
        message: data.message,
        expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };

      // Send email via EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams as any
      );

      if (response.status === 200) {
        this.incrementEmailCount();
        return { success: true };
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      return {
        success: false,
        error: 'Failed to send email. Please try the fallback option.',
        fallbackUrl: this.generateMailtoLink(data)
      };
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private storeSignatureRequest(token: string, data: SignatureRequestData) {
    const requests = this.getStoredRequests();
    requests[token] = {
      ...data,
      token,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('signatureRequests', JSON.stringify(requests));
    }
  }

  public getSignatureRequest(token: string): any {
    const requests = this.getStoredRequests();
    return requests[token];
  }

  private getStoredRequests(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem('signatureRequests');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  public generateMailtoLink(data: SignatureRequestData): string {
    const subject = encodeURIComponent(`Signature Request: ${data.documentName}`);
    const body = encodeURIComponent(
      `Hello ${data.signerName},\n\n` +
      `${data.requestedBy} has requested your signature on the following document:\n\n` +
      `Document: ${data.documentName}\n\n` +
      `${data.message ? `Message: ${data.message}\n\n` : ''}` +
      `To sign this document, please visit:\n` +
      `${window.location.origin}/sign/manual\n\n` +
      `This signature request will expire in 7 days.\n\n` +
      `Best regards,\n` +
      `PulseCRM Team`
    );
    
    return `mailto:${data.signerEmail}?subject=${subject}&body=${body}`;
  }
}