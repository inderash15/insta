import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function DirectMediaPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/conversations/${conversationId}/messages?limit=100`);
        if (res.data?.success) {
          const files = (res.data.messages || []).filter((m) => m.mediaUrl);
          setMediaItems(files);
        }
      } catch (err) {
        console.error('Failed to load shared media:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [conversationId]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(`/direct/${conversationId}`)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Shared Media</h1>
          <p className="text-xs text-neutral-400">Photos and videos sent in this chat</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">No media shared</p>
          <p>Images and videos exchanged in this chat will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {mediaItems.map((item) => (
            <div
              key={item._id}
              className="aspect-square bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 group relative"
            >
              {item.mediaType === 'video' ? (
                <video src={item.mediaUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={item.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
