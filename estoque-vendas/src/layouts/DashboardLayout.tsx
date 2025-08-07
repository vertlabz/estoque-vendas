// @ts-nocheck
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col sm:ml-16">
        <Header title="Dashboard" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
