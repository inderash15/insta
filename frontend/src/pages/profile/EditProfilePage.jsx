import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import { Loader2, Check, Camera } from 'lucide-react';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    isPrivate: user?.isPrivate || false
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await api.put('/users/profile', formData);
      if (res.data?.success) {
        updateUser(res.data.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Edit Profile"
        subtitle="Keep your personal details, bio, and website up to date."
        showBack
      />

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Avatar Row */}
      <div className="p-4 rounded-3xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white">@{user?.username}</p>
            <p className="text-[11px] text-neutral-400">{user?.fullName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile/avatar')}
          className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Change Photo</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="profile-fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
          required
        />

        <div className="space-y-1.5">
          <label htmlFor="profile-bio" className="block text-xs font-semibold text-neutral-300">
            Bio
          </label>
          <textarea
            id="profile-bio"
            rows={3}
            maxLength={150}
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell the community about yourself..."
            className="w-full p-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-xs text-white resize-none"
          />
          <p className="text-[10px] text-neutral-500 text-right">{formData.bio.length} / 150</p>
        </div>

        <FormField
          id="profile-website"
          label="Website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          placeholder="https://yourwebsite.com"
        />

        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Private Account</p>
            <p className="text-[11px] text-neutral-400">When enabled, only accounts you approve can see your posts.</p>
          </div>
          <input
            type="checkbox"
            checked={formData.isPrivate}
            onChange={(e) => setFormData((prev) => ({ ...prev, isPrivate: e.target.checked }))}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-pink-500 focus:ring-0 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
        </button>
      </form>
    </div>
  );
}
