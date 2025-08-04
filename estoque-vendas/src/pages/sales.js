import { useState, useEffect } from 'react';
import {
  MdDashboard,
  MdInventory,
  MdAttachMoney,
  MdLogout,
} from 'react-icons/md';
import Layout from './layout';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      const res = await fetch('/api/sales');
      const data = await res.json();
      setSales(data);
      setLoading(false);
    }
    loadSales();
  }, []);

  if (loading)
    return <div className="p-6 text-white">Carregando vendas...</div>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl mb-6">Histórico de Vendas</h1>

        {sales.length === 0 ? (
          <p className="text-gray-400">Nenhuma venda registrada.</p>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <h2 className="text-xl font-bold">Venda #{sale.id}</h2>
                  <span className="text-green-400 font-semibold">
                    Total: R$ {sale.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  {new Date(sale.createdAt).toLocaleString('pt-BR')}
                </p>

                <table className="w-full text-sm border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 px-3 py-2">
                        Produto
                      </th>
                      <th className="border border-gray-600 px-3 py-2">Qtd</th>
                      <th className="border border-gray-600 px-3 py-2">
                        Preço Unit.
                      </th>
                      <th className="border border-gray-600 px-3 py-2">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-700">
                        <td className="border border-gray-600 px-3 py-2">
                          {item.product?.name || 'Produto removido'}
                        </td>
                        <td className="border border-gray-600 px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-600 px-3 py-2 text-right">
                          R$ {item.price.toFixed(2)}
                        </td>
                        <td className="border border-gray-600 px-3 py-2 text-right">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
