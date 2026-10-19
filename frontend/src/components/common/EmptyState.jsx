import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  actionLabel,
  actionLink,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-neutral-900/30 border border-neutral-800/60 max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 mb-4 shadow-inner">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-semibold text-neutral-100 mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">{description}</p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-90 transition"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
