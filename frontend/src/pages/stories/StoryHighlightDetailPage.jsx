import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, Sparkles, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

export default function StoryHighlightDetailPage() {
  const { highlightId } = useParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    { id: '1', mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', title: 'Beach Villa Sunset' },
    { id: '2', mediaUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', title: 'Mountain Trail' },
    { id: '3', mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', title: 'Art Museum' }
  ];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/stories/highlights');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="relative w-full h-screen max-w-sm mx-auto flex flex-col justify-between bg-black overflow-hidden shadow-2xl selection:bg-pink-500/30">
      {/* Header */}
      <div className="absolute top-0 inset-x-0 p-4 z-20 space-y-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* Progress bars */}
        <div className="flex gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all ${
                  idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-2/3 animate-pulse' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Title & Close */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold">Featured Highlight</span>
          </div>

          <button
            onClick={() => navigate('/stories/highlights')}
            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="w-full h-full relative">
        <img
          src={stories[currentIndex].mediaUrl}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Left / Right Click zones */}
        <button
          onClick={handlePrev}
          className="absolute left-0 inset-y-0 w-1/3 z-10 cursor-pointer"
          aria-label="Previous story"
        />
        <button
          onClick={handleNext}
          className="absolute right-0 inset-y-0 w-1/3 z-10 cursor-pointer"
          aria-label="Next story"
        />
      </div>

      {/* Footer Details */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-white">
        <p className="text-xs font-semibold">{stories[currentIndex].title}</p>
        <span className="text-[10px] text-neutral-400">
          {currentIndex + 1} of {stories.length}
        </span>
      </div>
    </div>
  );
}
