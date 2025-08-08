import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from './layout';
import ProfitMarginTable from '@/components/dashboard/ProfitMarginTable';

const CategorySalesChart = dynamic(() => import('@/components/dashboard/CategorySalesChart'), { ssr: false });
const DailySalesChart = dynamic(() => import('@/components/dashboard/DailySalesChart'), { ssr: false });
const MonthlySalesChart = dynamic(() => import('@/components/dashboard/MonthlySalesChart'), { ssr: false });

interface DashboardData {
  margins: any[];
  salesByCategory: any[];
  dailySales: any[];
  monthlySales: any[];
}

export default function DashboardVendas() {
  const [margins, setMargins] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`/api/dashboard-vendas?${params.toString()}`);
    const data: DashboardData = await res.json();
    setMargins(data.margins);
    setCategoryData(data.salesByCategory);
    setDailyData(data.dailySales);
    setMonthlyData(data.monthlySales);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return (
    <Layout>
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold mb-4">Margens de Lucro</h1>
          <ProfitMarginTable data={margins} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Vendas por Categoria</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 p-2 rounded"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 p-2 rounded"
            />
          </div>
          <CategorySalesChart data={categoryData} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Vendas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Vendas Diárias (Mês Atual)</h3>
              <DailySalesChart data={dailyData} />
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Vendas Mensais (Último Ano)</h3>
              <MonthlySalesChart data={monthlyData} />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

