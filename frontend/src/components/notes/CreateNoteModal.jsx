import React, { useState } from 'react';
import { X, Sparkles, Star, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateNoteModal({ isOpen, onClose, onNoteCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [audience, setAudience] = useState('followers_follow_back');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    if (text.trim().length > 60) {
      setError('Note cannot exceed 60 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/notes', {
        text: text.trim(),
        mood,
        audience
      });

      if (res.data?.success) {
        if (onNoteCreated) onNoteCreated(res.data.note);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Share a thought
        </h3>

        {/* Live Note Bubble Preview */}
        <div className="flex flex-col items-center my-4">
          <div className="relative mb-3">
            <div className="bg-neutral-800 border border-neutral-700/80 rounded-2xl px-3.5 py-2 text-xs text-white shadow-lg max-w-[200px] text-center font-medium animate-in fade-in zoom-in-95">
              {text.trim() ? (
                <span>{mood ? `${mood} ` : ''}{text}</span>
              ) : (
                <span className="text-neutral-500 italic">Share what's on your mind...</span>
              )}
              {/* Bubble pointer tail */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-800 border-r border-b border-neutral-700/80 rotate-45" />
            </div>
          </div>

          <div className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-purple-500/50 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white uppercase">{user?.username?.charAt(0)}</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={2}
              maxLength={60}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening? (max 60 chars)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1 px-1">
              <span>Visible for 24 hours</span>
              <span className={text.length >= 55 ? 'text-amber-400 font-bold' : ''}>
                {text.length}/60
              </span>
            </div>
          </div>

          {/* Quick Mood Emojis */}
          <div className="flex items-center justify-center gap-2">
            {['☕', '🎧', '🚀', '✨', '💻', '😴'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setMood(mood === emoji ? '' : emoji)}
                className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition ${
                  mood === emoji
                    ? 'bg-purple-600/30 border border-purple-500 scale-110'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Audience selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAudience('followers_follow_back')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                audience === 'followers_follow_back'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Mutuals
            </button>
            <button
              type="button"
              onClick={() => setAudience('close_friends')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                audience === 'close_friends'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Close Friends
            </button>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-purple-600/20"
          >
            {isSubmitting ? 'Sharing...' : 'Share Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
