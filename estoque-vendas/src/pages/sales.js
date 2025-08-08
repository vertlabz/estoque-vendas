import { useState, useEffect } from 'react';
import Layout from './layout';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  async function fetchSales() {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    const res = await fetch('/api/sales?' + params.toString());
    const data = await res.json();
    setSales(data.sales);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    fetchSales();
    setCurrentPage(1);
  }, [startDate, endDate, paymentMethod]);

  function handleQuickFilter(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }

  function resetDates() {
    setStartDate('');
    setEndDate('');
  }

  const totalPages = Math.max(1, Math.ceil(sales.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const currentSales = sales.slice(startIndex, startIndex + perPage);

  function exportCSV() {
    const headers = ['ID', 'Produto', 'Quantidade', 'Total', 'Método', 'Data'];
    const rows = sales.flatMap((s) =>
      s.items.map((item) => [
        s.id,
        item.product?.name || '',
        item.quantity,
        s.total.toFixed(2),
        s.metodoPagamento,
        new Date(s.createdAt).toLocaleString('pt-BR'),
      ])
    );
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function exportPDF() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('Histórico de Vendas', 10, 10);
    let y = 20;
    sales.forEach((s) => {
      s.items.forEach((item, idx) => {
        doc.text(String(s.id), 10, y);
        doc.text(item.product?.name || '', 25, y);
        doc.text(String(item.quantity), 90, y);
        doc.text(`R$ ${s.total.toFixed(2)}`, 110, y);
        doc.text(s.metodoPagamento, 150, y);
        doc.text(
          new Date(s.createdAt).toLocaleString('pt-BR'),
          190,
          y
        );
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      y += 5;
    });
    doc.save('sales.pdf');
  }

  if (loading)
    return <div className="p-6 text-white">Carregando vendas...</div>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl mb-6">Histórico de Vendas</h1>

        <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Data início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Data fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Método de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            >
              <option value="">Todos</option>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickFilter(7)}
              className="bg-blue-600 px-3 py-2 rounded"
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="bg-blue-600 px-3 py-2 rounded"
            >
              Últimos 30 dias
            </button>
            <button
              onClick={resetDates}
              className="bg-gray-600 px-3 py-2 rounded"
            >
              Limpar
            </button>
          </div>
          <div className="ml-auto font-semibold">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={exportCSV}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Exportar PDF
          </button>
        </div>

        {sales.length === 0 ? (
          <p className="text-gray-400">Nenhuma venda encontrada.</p>
        ) : (
          <>
            <div className="md:hidden space-y-4">
              {currentSales.map((sale) => (
                <div key={sale.id} className="bg-gray-800 p-4 rounded">
                  <div className="font-bold mb-2">Venda #{sale.id}</div>
                  <div className="text-sm mb-1">
                    Data: {new Date(sale.createdAt).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm mb-1">
                    Método: {sale.metodoPagamento}
                  </div>
                  <div className="text-sm mb-1">
                    Total: R$ {sale.total.toFixed(2)}
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    {sale.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-gray-700 pb-1"
                      >
                        <span>{item.product?.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-3 py-2 text-left">Venda</th>
                    <th className="px-3 py-2 text-left">Produto</th>
                    <th className="px-3 py-2 text-left">Quantidade</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Método</th>
                    <th className="px-3 py-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale) =>
                    sale.items.map((item, idx) => (
                      <tr
                        key={`${sale.id}-${idx}`}
                        className="border-b border-gray-700 align-top"
                      >
                        {idx === 0 && (
                          <td
                            rowSpan={sale.items.length}
                            className="px-3 py-2 font-semibold"
                          >
                            #{sale.id}
                          </td>
                        )}
                        <td className="px-3 py-2">{item.product?.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        {idx === 0 && (
                          <td
                            rowSpan={sale.items.length}
                            className="px-3 py-2"
                          >
                            R$ {sale.total.toFixed(2)}
                          </td>
                        )}
                        {idx === 0 && (
                          <td
                            rowSpan={sale.items.length}
                            className="px-3 py-2"
                          >
                            {sale.metodoPagamento}
                          </td>
                        )}
                        {idx === 0 && (
                          <td
                            rowSpan={sale.items.length}
                            className="px-3 py-2"
                          >
                            {new Date(sale.createdAt).toLocaleString('pt-BR')}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {sales.length > perPage && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
