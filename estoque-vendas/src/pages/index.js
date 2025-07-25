import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/dashboard'); // se tiver token, vai para o dashboard
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <p>Carregando...</p>
    </div>
  );
}
