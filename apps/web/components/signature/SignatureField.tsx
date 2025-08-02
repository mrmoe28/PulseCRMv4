'use client';

import React, { useState } from 'react';
import { PenTool, X, Calendar, User } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface SignatureFieldProps {
  label?: string;
  required?: boolean;
  signedBy?: {
    name: string;
    date: string;
    signature: string;
  };
  onSign?: (signature: string) => void;
  readonly?: boolean;
}

export default function SignatureField({
  label = 'Signature',
  required = false,
  signedBy,
  onSign,
  readonly = false
}: SignatureFieldProps) {
  const [showPad, setShowPad] = useState(false);
  const [signature, setSignature] = useState<string | null>(signedBy?.signature || null);
  const [signDate, setSignDate] = useState<string | null>(signedBy?.date || null);
  const [signerName, setSignerName] = useState<string | null>(signedBy?.name || null);

  const handleSaveSignature = (sig: string) => {
    setSignature(sig);
    setSignDate(new Date().toISOString());
    setSignerName('Current User'); // In production, get from auth context
    setShowPad(false);
    
    if (onSign) {
      onSign(sig);
    }
  };

  const clearSignature = () => {
    if (readonly) return;
    setSignature(null);
    setSignDate(null);
    setSignerName(null);
  };

  return (
    <>
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {signature && !readonly && (
            <button
              onClick={clearSignature}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {signature ? (
          <div className="space-y-2">
            <div className="bg-white rounded p-2">
              <img
                src={signature}
                alt="Signature"
                className="h-20 w-auto mx-auto"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{signerName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{signDate ? new Date(signDate).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPad(true)}
            disabled={readonly}
            className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              readonly
                ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                : 'border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            }`}
          >
            <PenTool className="h-6 w-6" />
            <span className="text-sm">Click to sign</span>
          </button>
        )}
      </div>

      {showPad && (
        <SignaturePad
          onSave={handleSaveSignature}
          onClose={() => setShowPad(false)}
          documentName={label}
        />
      )}
    </>
  );
}
