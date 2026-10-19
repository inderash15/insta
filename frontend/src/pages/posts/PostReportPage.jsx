import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function PostReportPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { id: 'spam', label: 'It is spam or scam' },
    { id: 'hate_speech', label: 'Hate speech or symbols' },
    { id: 'harassment', label: 'Harassment or bullying' },
    { id: 'nudity', label: 'Nudity or sexual content' },
    { id: 'violence', label: 'Violence or dangerous organizations' },
    { id: 'intellectual_property', label: 'Intellectual property violation' },
    { id: 'other', label: 'Something else' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/reports', {
        targetType: 'post',
        targetId: postId,
        reason,
        description
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${postId}`), 1800);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Report submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Report Post"
        subtitle="Help keep Insta a safe, respectful community."
        showBack
      />

      {success ? (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Thank You For Reporting</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your report has been submitted to our moderation queue. We review reports 24/7 to enforce community standards.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Why are you reporting this post?</label>
            <div className="space-y-1.5">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition ${
                    reason === r.id
                      ? 'border-pink-500 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  <span>{r.label}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="text-pink-500 focus:ring-0"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="report-desc" className="text-xs font-semibold text-neutral-300">
              Additional Details (Optional)
            </label>
            <textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context for the moderation team..."
              className="w-full p-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-xs text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Report</span>}
          </button>
        </form>
      )}
    </div>
  );
}
