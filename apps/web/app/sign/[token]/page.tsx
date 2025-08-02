'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, CheckCircle, AlertCircle, Shield, Clock, User } from 'lucide-react';

interface SignatureRequest {
  id: string;
  documentName: string;
  documentUrl: string;
  signerName: string;
  signerEmail: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  status: string;
}

const SIGNATURE_FONTS = [
  { name: 'Elegant', value: 'Brush Script MT, cursive', sample: 'Brush Script MT' },
  { name: 'Professional', value: 'Georgia, serif', sample: 'Georgia' },
  { name: 'Modern', value: 'Helvetica, sans-serif', sample: 'Helvetica' },
  { name: 'Classic', value: 'Times New Roman, serif', sample: 'Times New Roman' },
];

export default function SignaturePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null);
  const [signature, setSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].value);
  const [consent, setConsent] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(false);

  useEffect(() => {
    fetchSignatureRequest();
  }, [token]);

  const fetchSignatureRequest = async () => {
    try {
      const response = await fetch(`/api/signature-request/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load signature request');
        setLoading(false);
        return;
      }

      setSignatureRequest(data);
      setSignature(data.signerName);
      setLoading(false);
    } catch (err) {
      setError('Failed to load signature request');
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signature.trim() || !consent) {
      alert('Please enter your signature and agree to the terms');
      return;
    }

    setSigning(true);

    try {
      const response = await fetch('/api/signature-request/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signature,
          consent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to sign document');
        setSigning(false);
        return;
      }

      setSigned(true);
    } catch (err) {
      alert('Failed to sign document');
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading signature request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Document</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Signed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            You have successfully signed "{signatureRequest?.documentName}". 
            A copy has been sent to your email address.
          </p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="text-xl font-semibold text-gray-900">PulseCRM</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Expires: {new Date(signatureRequest?.expiresAt || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Document Info */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Signature Request</h1>
            <p className="opacity-90">
              {signatureRequest?.requestedBy} has requested your signature on this document
            </p>
          </div>

          <div className="p-6">
            {/* Document Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <FileText className="w-8 h-8 text-gray-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {signatureRequest?.documentName}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Requested for: {signatureRequest?.signerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Requested on: {new Date(signatureRequest?.requestedAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDocument(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Document
                </button>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type your full legal name to create your signature
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select signature style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SIGNATURE_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFont(font.value)}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        selectedFont === font.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">{font.name}</div>
                      <div
                        style={{ fontFamily: font.value, fontSize: '24px' }}
                        className="text-gray-900"
                      >
                        {signature || 'Your Name'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Signature Preview */}
              {signature && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-2">Your signature will appear as:</div>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div
                      style={{ fontFamily: selectedFont, fontSize: '32px' }}
                      className="text-gray-900 text-center"
                    >
                      {signature}
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Consent */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Electronic Signature Consent</p>
                    <p>
                      By checking this box, I agree that my electronic signature is the legal equivalent 
                      of my manual signature on this document. I consent to be legally bound by this 
                      document's terms and conditions.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSign}
                  disabled={!signature || !consent || signing}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {signing ? 'Signing...' : 'Sign Document'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>
              This signature request is secured with encryption and will create a legally binding agreement
            </span>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && signatureRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{signatureRequest.documentName}</h3>
              <button
                onClick={() => setViewingDocument(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <iframe
                src={signatureRequest.documentUrl}
                className="w-full h-full border rounded"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}