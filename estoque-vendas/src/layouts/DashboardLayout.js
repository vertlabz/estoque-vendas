import { useRouter } from "next/router";
import Sidebar from '@/components/Sidebar';
import { MdDashboard, MdInventory, MdAttachMoney, MdLogout } from "react-icons/md";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const goTo = (path) => router.push(path);
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:ml-16 overflow-auto">{children}</main>
      </div>
      <nav className="flex sm:hidden bg-gray-800 p-2 justify-around fixed bottom-0 left-0 right-0 z-50">
        <button onClick={() => goTo("/dashboard")} title="Dashboard" className="text-white text-3xl hover:text-green-400 transition">
          <MdDashboard />
        </button>
        <button onClick={() => goTo("/products")} title="Produtos" className="text-white text-3xl hover:text-green-400 transition">
          <MdInventory />
        </button>
        <button onClick={() => goTo("/sales")} title="Vendas" className="text-white text-3xl hover:text-green-400 transition">
          <MdAttachMoney />
        </button>
        <button onClick={logout} title="Logout" className="text-red-500 text-3xl hover:text-red-700 transition">
          <MdLogout />
        </button>
      </nav>
    </div>
  );
}
