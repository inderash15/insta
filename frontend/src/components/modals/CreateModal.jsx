import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Film, 
  Sparkles, 
  Music, 
  Loader2, 
  CheckCircle2,
  Clock,
  Globe,
  Star
} from 'lucide-react';
import api from '../../services/api';

export default function CreateModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  initialMode = 'post', // 'post' | 'reel' | 'story'
  lockMode = false // if true, hide tab bar and lock to initialMode
}) {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audience, setAudience] = useState('everyone'); // 'everyone' | 'close_friends'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      handleReset();
    }
  }, [isOpen, initialMode]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        handleReset();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (activeTab === 'reel' && !selected.type.startsWith('video/')) {
      setError('Reels must be video files (MP4 or WebM). Please select a valid video.');
      return;
    }

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
    setAudience('everyone');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a media file to upload.');
      return;
    }

    if (activeTab === 'reel' && !file.type.startsWith('video/')) {
      setError('Reels require a video file. Please upload an MP4 or WebM video.');
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
        formData.append('audience', audience);
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

  const getFlowTitle = () => {
    if (activeTab === 'story') return 'New Story';
    if (activeTab === 'reel') return 'Create New Reel';
    return 'Create New Post';
  };

  const getFlowSubtitle = () => {
    if (activeTab === 'story') return 'Share a photo or video to your story. Stories disappear after 24 hours.';
    if (activeTab === 'reel') return 'Share short vertical videos with audio and caption.';
    return 'Share photos and videos on your profile and followers\' main feed.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'story' && audience === 'close_friends' ? 'bg-emerald-500' : 'insta-story-gradient'}`} />
              <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-200">
                {getFlowTitle()}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400">
              {getFlowSubtitle()}
            </p>
          </div>
          <button 
            onClick={() => { handleReset(); onClose(); }}
            disabled={submitting}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - only show if lockMode is false */}
        {!lockMode && (
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
        )}

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Story 24-hour expiration indicator */}
          {activeTab === 'story' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-300">
              <Clock className="w-4 h-4 shrink-0 text-pink-400" />
              <span>Visible to your audience for 24 hours. Does not appear in your main feed.</span>
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

          {/* Story Audience Selection */}
          {activeTab === 'story' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Audience</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAudience('everyone')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    audience === 'everyone'
                      ? 'bg-neutral-800 border-pink-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Globe className={`w-4 h-4 ${audience === 'everyone' ? 'text-pink-400' : 'text-neutral-500'}`} />
                  <div>
                    <p className="text-xs font-semibold">Everyone</p>
                    <p className="text-[10px] text-neutral-500">All followers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience('close_friends')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    audience === 'close_friends'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Star className={`w-4 h-4 fill-current ${audience === 'close_friends' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <div>
                    <p className="text-xs font-semibold text-emerald-300">Close Friends</p>
                    <p className="text-[10px] text-emerald-500/80">Only close friends</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Story Caption / Text */}
          {activeTab === 'story' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Story Text / Caption (Optional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add text or overlay caption..."
                maxLength={300}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition"
              />
              <div className="flex justify-end text-[10px] text-neutral-500 px-1">
                <span>{caption.length} / 300</span>
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
              className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] ${
                activeTab === 'story' && audience === 'close_friends'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  : 'insta-story-gradient hover:opacity-95 shadow-pink-500/20'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing {activeTab}...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeTab === 'story' 
                      ? audience === 'close_friends' 
                        ? 'Share to Close Friends' 
                        : 'Share to Story' 
                      : activeTab === 'reel' 
                        ? 'Share Reel' 
                        : 'Share Post'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
