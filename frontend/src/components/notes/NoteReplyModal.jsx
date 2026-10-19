import React, { useState } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NoteReplyModal({ note, isOpen, onClose, onNoteDeleted }) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  if (!isOpen || !note) return null;

  const isOwner = user && (user._id === note.author?._id || user.id === note.author?._id);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await api.post(`/notes/${note._id}/reply`, { text: replyText.trim() });
      if (res.data?.success) {
        setReplySuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      // non-fatal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/notes/${note._id}`);
      if (onNoteDeleted) onNoteDeleted(note._id);
      onClose();
    } catch {
      // non-fatal
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

        {/* Note Display Header */}
        <div className="flex flex-col items-center my-4">
          <div className="relative mb-3">
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl px-4 py-2 text-xs text-white shadow-lg text-center font-medium max-w-[240px]">
              {note.mood ? `${note.mood} ` : ''}{note.text}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-800 border-r border-b border-neutral-700 rotate-45" />
            </div>
          </div>

          <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border-2 border-purple-500/40">
            {note.author?.avatarUrl ? (
              <img src={note.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white uppercase">{note.author?.username?.charAt(0)}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-white mt-1.5">{note.author?.username}</span>
        </div>

        {isOwner ? (
          <div className="pt-2">
            <button
              onClick={handleDelete}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete note
            </button>
          </div>
        ) : (
          <form onSubmit={handleReply} className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="text"
                placeholder={replySuccess ? 'Reply sent to DM!' : `Reply to ${note.author?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-purple-300 disabled:opacity-30 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 text-center">
              Replies are delivered as direct messages
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
