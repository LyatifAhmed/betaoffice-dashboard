'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (isAuth !== 'true') {
      router.replace('/admin-login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  if (!authenticated) {
    return null; // or a loading spinner
  }

  return <AdminDashboard />;
}
