import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Upload, X, Eye, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

export default function StoryCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image or video for your story');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('media', file);

      const res = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        navigate('/stories');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Story publication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Add to Story"
        subtitle="Share an ephemeral 24-hour update with your followers."
        showBack
      />

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onClick={() => !preview && fileInputRef.current?.click()}
          className={`relative aspect-[9/16] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition cursor-pointer ${
            preview
              ? 'border-neutral-800 bg-neutral-950'
              : 'border-neutral-800 hover:border-pink-500/50 bg-neutral-900/40 hover:bg-neutral-900/60'
          }`}
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img src={preview} alt="Story preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Click or upload vertical media</p>
                <p className="text-xs text-neutral-400 mt-1">Expires automatically after 24 hours</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-3">
          <Link
            to="/stories/preview"
            state={{ preview }}
            className="flex-1 py-3 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Full Preview</span>
          </Link>

          <button
            type="submit"
            disabled={submitting || !file}
            className="flex-1 py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <span>Publish Story</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
