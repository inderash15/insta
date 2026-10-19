import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, Copy, Check, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function RecoveryCodesPage() {
  const [copied, setCopied] = useState(false);
  const [codes, setCodes] = useState([
    '4B89-2F10-9A',
    '7C12-98EE-4D',
    'F530-1A88-7B',
    '3D91-E204-6C',
    '9F88-7C14-2E',
    '2A19-6B40-1F',
    '8E44-90D1-5A',
    '1C77-3B22-8F'
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = () => {
    const chars = '0123456789ABCDEF';
    const gen = () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') +
      '-' +
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') +
      '-' +
      Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setCodes(Array.from({ length: 8 }, gen));
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 text-neutral-100">
      <PageHeader
        title="Emergency Recovery Codes"
        subtitle="Keep these one-time codes in a safe place. They grant access to your account if you lose your phone or 2FA authenticator."
        showBack
      />

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:text-sm text-neutral-200">
          {codes.map((code, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
            >
              <span className="text-neutral-500 text-xs">{idx + 1}.</span>
              <span className="font-semibold tracking-wider">{code}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy All Codes'}</span>
          </button>

          <button
            onClick={handleGenerateNew}
            className="py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate New Codes</span>
          </button>
        </div>
      </div>

      <div className="text-center">
        <Link to="/settings/security" className="text-xs text-neutral-400 hover:text-white transition">
          ← Back to Security Settings
        </Link>
      </div>
    </div>
  );
}
