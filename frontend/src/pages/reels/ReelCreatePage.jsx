import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Film, Music, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import api from '../../services/api';
import ReelsNav from '../../components/reels/ReelsNav';

export default function ReelCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [audioTitle, setAudioTitle] = useState('Original Audio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file size exceeds maximum limit of 50MB.');
      return;
    }

    setError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please upload a video file for your reel.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('media', videoFile);
      formData.append('caption', caption);
      formData.append('audioTitle', audioTitle);

      const res = await api.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccess('Reel published successfully!');
        setTimeout(() => {
          navigate('/reels');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload reel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-4 px-2 max-w-xl mx-auto">
      <ReelsNav />

      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100">Create Reel</h1>
            <p className="text-xs text-neutral-400">Upload a 9:16 vertical video up to 60 seconds</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Reel Video</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {videoPreviewUrl ? (
              <div className="relative w-full max-w-[260px] mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden border border-neutral-700 shadow-md">
                <video
                  src={videoPreviewUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-white text-[11px] font-medium hover:bg-black"
                >
                  Change Video
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-700 hover:border-pink-500/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors bg-neutral-950/40"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-neutral-200">Click to upload reel video</p>
                <p className="text-[11px] text-neutral-500">MP4, WebM or MOV up to 50MB</p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Caption & Hashtags</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... (e.g. Sunset vibes #travel #aesthetic)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
            />
          </div>

          {/* Audio Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Audio Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Music className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Original Audio or Track Title"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !videoFile}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Reel...</span>
              </>
            ) : (
              <span>Share Reel</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
