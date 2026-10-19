import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function performLogout() {
      try {
        await logout();
      } finally {
        navigate('/auth/login', { replace: true });
      }
    }
    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
      <p className="text-xs text-neutral-400">Logging out safely...</p>
    </div>
  );
}
