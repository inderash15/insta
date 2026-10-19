import React, { useState, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import CreateNoteModal from './CreateNoteModal';
import NoteReplyModal from './NoteReplyModal';

export default function NotesTray() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notes, setNotes] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes/tray');
      if (res.data?.success) {
        setNotes(res.data.notes || []);
      }
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => fetchNotes();
    const handleDeleted = () => fetchNotes();

    socket.on('note:created', handleCreated);
    socket.on('note:deleted', handleDeleted);

    return () => {
      socket.off('note:created', handleCreated);
      socket.off('note:deleted', handleDeleted);
    };
  }, [socket]);

  // Separate current user's note from friends' notes
  const myNote = notes.find(
    (n) => n.author?._id === user?._id || n.author?.id === user?._id || n.author?._id === user?.id
  );
  const friendNotes = notes.filter((n) => n !== myNote);

  return (
    <>
      <div className="w-full pb-3 border-b border-neutral-800/80 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex items-start gap-4 px-1 py-1">
          {/* User's Note Slot */}
          <div className="flex flex-col items-center shrink-0 w-20">
            {myNote ? (
              <div
                onClick={() => setSelectedNote(myNote)}
                className="cursor-pointer flex flex-col items-center group"
              >
                {/* Floating speech bubble */}
                <div className="relative mb-2 animate-in fade-in zoom-in-90 duration-200">
                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-[11px] text-white font-medium max-w-[85px] truncate text-center shadow-md">
                    {myNote.mood ? `${myNote.mood} ` : ''}{myNote.text}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45" />
                  </div>
                </div>

                <div className="relative w-14 h-14 rounded-full bg-neutral-800 p-0.5 border border-purple-500/40">
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white uppercase">{user?.username?.charAt(0)}</span>
                    )}
                  </div>
                  {myNote.audience === 'close_friends' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border border-neutral-900 flex items-center justify-center text-white">
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 truncate max-w-[70px]">Your note</span>
              </div>
            ) : (
              <div
                onClick={() => setIsCreateOpen(true)}
                className="cursor-pointer flex flex-col items-center group"
              >
                {/* Add thought prompt */}
                <div className="relative mb-2">
                  <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl px-2.5 py-1 text-[10px] text-neutral-400 group-hover:text-white group-hover:border-purple-500/50 transition truncate max-w-[80px]">
                    Share thought...
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45" />
                  </div>
                </div>

                <div className="relative w-14 h-14 rounded-full bg-neutral-800 p-0.5 border border-dashed border-neutral-700 group-hover:border-purple-500 transition">
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white uppercase">{user?.username?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-purple-600 border border-neutral-900 flex items-center justify-center text-white">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 truncate max-w-[70px]">Your note</span>
              </div>
            )}
          </div>

          {/* Friends' Notes */}
          {friendNotes.map((note) => (
            <div
              key={note._id}
              onClick={() => setSelectedNote(note)}
              className="flex flex-col items-center shrink-0 w-20 cursor-pointer group"
            >
              {/* Floating speech bubble */}
              <div className="relative mb-2">
                <div className="bg-neutral-800 border border-neutral-700/80 rounded-xl px-2.5 py-1 text-[11px] text-white font-medium max-w-[85px] truncate text-center shadow-md group-hover:scale-105 transition">
                  {note.mood ? `${note.mood} ` : ''}{note.text}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45" />
                </div>
              </div>

              <div className="relative w-14 h-14 rounded-full bg-neutral-800 p-0.5 border border-neutral-700 group-hover:border-purple-400 transition">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                  {note.author?.avatarUrl ? (
                    <img src={note.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white uppercase">{note.author?.username?.charAt(0)}</span>
                  )}
                </div>
                {note.audience === 'close_friends' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border border-neutral-900 flex items-center justify-center text-white shadow">
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-neutral-300 font-medium mt-1 truncate max-w-[70px]">
                {note.author?.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateNoteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onNoteCreated={() => fetchNotes()}
      />

      <NoteReplyModal
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onNoteDeleted={() => fetchNotes()}
      />
    </>
  );
}
