import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { Camera, Upload, Trash2, Check, Loader2 } from 'lucide-react';

export default function ProfileAvatarPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(user?.avatarUrl || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setSuccess(true);
        setTimeout(() => navigate(`/users/${user?.username}`), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      const res = await api.put('/users/profile', { avatarUrl: '' });
      if (res.data?.success) {
        updateUser(res.data.user);
        setPreview('');
        setFile(null);
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Profile Photo"
        subtitle="Upload a square JPG, PNG, or WebP photo to represent your profile."
        showBack
      />

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile photo updated!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-700 bg-neutral-800 shadow-xl">
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-400">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2.5 rounded-full insta-story-gradient text-white shadow-lg shadow-pink-500/20 hover:scale-105 transition"
            title="Upload Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2.5 px-4 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Save Photo</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
          >
            Select from Device
          </button>

          {preview && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-red-400 hover:text-red-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
