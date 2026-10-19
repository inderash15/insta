import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return null;
  }

  if (user) {
    const redirectUrl = searchParams.get('redirect') || '/home';
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
