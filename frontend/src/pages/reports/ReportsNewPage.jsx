import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function ReportsNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [targetType, setTargetType] = useState(searchParams.get('type') || 'user');
  const [targetId, setTargetId] = useState(searchParams.get('id') || '');
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId.trim()) {
      setError('Target Identifier or username is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reports', {
        targetType,
        targetId: targetId.trim(),
        reason,
        description
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/reports/history');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-purple-400" />
            <span>Submit a Report</span>
          </h1>
          <p className="text-xs text-neutral-400">Flag policy violations, hate speech, spam, or harassment</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Report submitted to trust & safety moderation. Redirecting to your report history...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">What are you reporting?</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-pink-500"
          >
            <option value="user">User Account</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="reel">Reel</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            {targetType === 'user' ? 'Target Username or ID' : `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} ID`}
          </label>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
            placeholder={targetType === 'user' ? 'e.g. spambot_user or 64f1...' : 'e.g. 64f1a2b3c4d5e6f7...'}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Violation Category</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-pink-500"
          >
            <option value="spam">Spam or commercial scams</option>
            <option value="harassment">Harassment or bullying</option>
            <option value="hate_speech">Hate speech or discrimination</option>
            <option value="violence">Violence or dangerous organizations</option>
            <option value="nudity">Nudity or sexual content</option>
            <option value="intellectual_property">Intellectual property violation</option>
            <option value="other">Other policy violation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Additional Details</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide any context that will help our moderation team review this ticket..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Report...</span>
            </>
          ) : (
            <span>Submit Report</span>
          )}
        </button>
      </form>
    </div>
  );
}
