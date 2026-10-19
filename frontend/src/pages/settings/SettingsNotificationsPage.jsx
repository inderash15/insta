import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Users, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsNotificationsPage() {
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [follows, setFollows] = useState(true);
  const [messages, setMessages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.notifications) {
          const n = res.data.preferences.notifications;
          if (n.likes !== undefined) setLikes(n.likes);
          if (n.comments !== undefined) setComments(n.comments);
          if (n.follows !== undefined) setFollows(n.follows);
          if (n.messages !== undefined) setMessages(n.messages);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await api.put('/settings/preferences', {
        notifications: {
          likes,
          comments,
          follows,
          messages
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Notification Preferences"
      subtitle="Customize alerts for likes, comments, follows, and direct messages"
    >
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Notification preferences saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <Heart className="w-4 h-4 fill-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Likes & Reactions</p>
                <p className="text-[11px] text-neutral-400">Alerts when someone likes your posts, reels, or comments</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={likes}
              onChange={(e) => setLikes(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Comments</p>
                <p className="text-[11px] text-neutral-400">Alerts when someone leaves a comment on your posts or reels</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={comments}
              onChange={(e) => setComments(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">New Followers</p>
                <p className="text-[11px] text-neutral-400">Alerts when an account follows you or sends a request</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={follows}
              onChange={(e) => setFollows(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Direct Messages</p>
                <p className="text-[11px] text-neutral-400">Alerts when you receive messages or chat invitations</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={messages}
              onChange={(e) => setMessages(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <span>Save Notification Settings</span>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
