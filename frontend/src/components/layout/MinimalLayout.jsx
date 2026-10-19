import React from 'react';
import { Outlet } from 'react-router-dom';

export default function MinimalLayout() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center selection:bg-pink-500/30">
      <Outlet />
    </div>
  );
}
