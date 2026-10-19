import React from 'react';
import SettingsNav from './SettingsNav';

export default function SettingsLayoutWrapper({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <SettingsNav />

        <div className="flex-1 w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {(title || subtitle) && (
            <div className="border-b border-neutral-800 pb-4">
              {title && <h1 className="text-base font-bold text-neutral-100">{title}</h1>}
              {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
