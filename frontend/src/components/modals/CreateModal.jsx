import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Film, 
  Sparkles, 
  Music, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import api from '../../services/api';

export default function CreateModal({ isOpen, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState('post'); // 'post' | 'reel' | 'story'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setError(null);
  };

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption('');
    setAudioTitle('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a media file to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();

    try {
      if (activeTab === 'post') {
        formData.append('media', file);
        formData.append('caption', caption);
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (activeTab === 'reel') {
        formData.append('video', file);
        formData.append('caption', caption);
        formData.append('audioTitle', audioTitle || 'Original Audio');
        await api.post('/reels', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (activeTab === 'story') {
        formData.append('media', file);
        formData.append('caption', caption);
        await api.post('/stories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      handleReset();
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please check the file format and size.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full insta-story-gradient" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-200">Create New {activeTab}</h2>
          </div>
          <button 
            onClick={() => { handleReset(); onClose(); }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('post'); handleReset(); }}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'post' 
                ? 'text-pink-400 border-b-2 border-pink-500 bg-pink-500/5' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Post</span>
          </button>

          <button
            onClick={() => { setActiveTab('reel'); handleReset(); }}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'reel' 
                ? 'text-pink-400 border-b-2 border-pink-500 bg-pink-500/5' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Reel</span>
          </button>

          <button
            onClick={() => { setActiveTab('story'); handleReset(); }}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'story' 
                ? 'text-pink-400 border-b-2 border-pink-500 bg-pink-500/5' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Story</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Media Upload Area */}
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-pink-500/60 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-neutral-950/40 transition group"
            >
              <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-500/10 text-neutral-400 group-hover:text-pink-400 transition">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-200">
                  Select {activeTab === 'reel' ? 'a video file' : 'photos or videos'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {activeTab === 'reel' 
                    ? 'MP4, WebM (up to 100MB)' 
                    : activeTab === 'story' 
                      ? 'JPG, PNG, WebP, MP4 (up to 50MB)' 
                      : 'JPG, PNG, WebP, MP4 (up to 100MB)'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={activeTab === 'reel' ? 'video/mp4,video/webm' : 'image/*,video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-72 border border-neutral-800">
                {file?.type.startsWith('video/') ? (
                  <video src={previewUrl} controls className="max-h-72 w-auto object-contain" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-72 w-auto object-contain" />
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Caption input (For Posts and Reels) */}
          {activeTab !== 'story' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Caption & Hashtags</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption... (e.g. Exploring nature #travel #sunset @friend)"
                rows={3}
                maxLength={2200}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition resize-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 px-1">
                <span>Use #hashtags and @mentions</span>
                <span>{caption.length} / 2200</span>
              </div>
            </div>
          )}

          {/* Reel Audio Title */}
          {activeTab === 'reel' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>Audio Track Name</span>
              </label>
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Original Audio or Song Title"
                maxLength={80}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !file}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white insta-story-gradient hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing {activeTab}...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Share {activeTab === 'story' ? 'to Story' : activeTab}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
