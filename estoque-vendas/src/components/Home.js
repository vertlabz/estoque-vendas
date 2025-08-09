import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <p>Carregando...</p>
    </div>
  );
}
