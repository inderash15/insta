import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Hash, 
  Eye, 
  Loader2,
  FileEdit
} from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSaveDraft = () => {
    if (!caption.trim() && !preview) return;
    const drafts = JSON.parse(localStorage.getItem('insta_post_drafts') || '[]');
    drafts.unshift({
      id: Date.now().toString(),
      caption,
      mediaUrl: preview,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('insta_post_drafts', JSON.stringify(drafts));
    navigate('/feed/drafts');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image to upload');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      if (hashtags.trim()) {
        formData.append('hashtags', hashtags);
      }

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Create New Post"
        subtitle="Share high-resolution photography, artwork, or moments with your followers."
        showBack
        actions={
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        }
      />

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload Area */}
        <div
          onClick={() => !preview && fileInputRef.current?.click()}
          className={`relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition cursor-pointer ${
            preview
              ? 'border-neutral-800 bg-neutral-950'
              : 'border-neutral-800 hover:border-pink-500/50 bg-neutral-900/40 hover:bg-neutral-900/60'
          }`}
        >
          {preview ? (
            <div className="relative w-full h-full group">
              <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Click or drag photos here</p>
                <p className="text-xs text-neutral-400 mt-1">Supports PNG, JPG, or WebP up to 10MB</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Caption */}
        <div className="space-y-2">
          <label htmlFor="post-caption" className="block text-xs font-semibold text-neutral-300">
            Write a caption
          </label>
          <textarea
            id="post-caption"
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write an engaging caption, tag friends using @handle, and add details..."
            className="w-full p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-xs text-white resize-none"
          />
        </div>

        {/* Hashtags Input */}
        <div className="space-y-2">
          <label htmlFor="post-hashtags" className="block text-xs font-semibold text-neutral-300 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-pink-400" />
            <span>Hashtags</span>
          </label>
          <input
            id="post-hashtags"
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="design, photography, travel (comma-separated)"
            className="w-full p-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-xs text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            to="/create/post/preview"
            state={{ preview, caption, hashtags }}
            className="flex-1 py-3 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Post</span>
          </Link>

          <button
            type="submit"
            disabled={submitting || !file}
            className="flex-1 py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Share to Feed</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
