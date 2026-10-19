import React, { useState } from 'react';
import { Download, FileJson, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsDataPage() {
  const [format, setFormat] = useState('json');
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleExport = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/settings/data-export', { format });
      if (res.data?.success && res.data.data) {
        // Create downloadable JSON blob
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `insta-export-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setMessage('Your data archive has been created and downloaded successfully!');
      } else {
        setMessage('Your data export request has been queued.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export account data.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Download Your Data"
      subtitle="Obtain a machine-readable archive of your published photos, comments, and interactions"
    >
      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
          <FileJson className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-100">Standard Data Portability Guarantee</p>
          <p className="text-[11px] text-neutral-400">
            Export includes profile records, post history, comments made, follow links, and bookmarked collections.
          </p>
        </div>
      </div>

      <form onSubmit={handleExport} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'json', label: 'JSON Format', desc: 'Optimal for developers and data ingestion' },
              { id: 'html', label: 'HTML Format', desc: 'Easier to read directly in a web browser' }
            ].map((f) => (
              <label
                key={f.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  format === f.id
                    ? 'bg-neutral-900 border-pink-500 text-white'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-neutral-200">{f.label}</span>
                  <input
                    type="radio"
                    name="format"
                    value={f.id}
                    checked={format === f.id}
                    onChange={() => setFormat(f.id)}
                    className="accent-pink-500"
                  />
                </div>
                <p className="text-[10px] text-neutral-500">{f.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={downloading}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Packaging Your Archive...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Account Archive</span>
            </>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
