// @ts-nocheck
import { MdDashboard, MdInventory, MdAttachMoney, MdLogout } from 'react-icons/md';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  const goTo = (path) => router.push(path);
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  return (
    <>
      {/* MENU LATERAL (Desktop/Tablet) */}
      <nav className="hidden sm:flex w-16 bg-gray-800 p-4 flex-col items-center space-y-6 fixed h-screen">
        <button onClick={() => goTo('/dashboard')} title="Dashboard" className="text-white text-3xl hover:text-green-400 transition">
          <MdDashboard />
        </button>
        <button onClick={() => goTo('/products')} title="Produtos" className="text-white text-3xl hover:text-green-400 transition">
          <MdInventory />
        </button>
        <button onClick={() => goTo('/sales')} title="Vendas" className="text-white text-3xl hover:text-green-400 transition">
          <MdAttachMoney />
        </button>
        <button onClick={logout} title="Logout" className="mt-auto text-red-500 text-3xl hover:text-red-700 transition">
          <MdLogout />
        </button>
      </nav>

      {/* MENU INFERIOR FIXO (Celular) */}
      <nav className="flex sm:hidden bg-gray-800 p-2 justify-around fixed bottom-0 left-0 right-0 z-50">
        <button onClick={() => goTo('/dashboard')} title="Dashboard" className="text-white text-3xl hover:text-green-400 transition">
          <MdDashboard />
        </button>
        <button onClick={() => goTo('/products')} title="Produtos" className="text-white text-3xl hover:text-green-400 transition">
          <MdInventory />
        </button>
        <button onClick={() => goTo('/sales')} title="Vendas" className="text-white text-3xl hover:text-green-400 transition">
          <MdAttachMoney />
        </button>
        <button onClick={logout} title="Logout" className="text-red-500 text-3xl hover:text-red-700 transition">
          <MdLogout />
        </button>
      </nav>
    </>
  );
}
