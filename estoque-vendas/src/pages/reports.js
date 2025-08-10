import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ReportTable from '@/components/ReportTable';

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-8 rounded-xl overflow-hidden bg-gray-800 shadow-lg">
      <h2
        onClick={() => setOpen(!open)}
        className="text-2xl font-semibold mb-4 text-white hover:text-gray-300 cursor-pointer select-none flex items-center justify-between px-6 py-4 bg-gray-700 rounded-t-xl"
      >
        {title}
        <span className="ml-2 text-white">{open ? '▲' : '▼'}</span>
      </h2>
      {open && <div className="px-6 pb-6 text-gray-300">{children}</div>}
    </section>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];

  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-600 text-white disabled:opacity-50 hover:bg-gray-500"
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg border border-gray-600 ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'} hover:bg-gray-600`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-600 text-white disabled:opacity-50 hover:bg-gray-500"
      >
        Next
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [dailyPage, setDailyPage] = useState(1);
  const [marginPage, setMarginPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);

  const DAILY_ITEMS = 15;
  const MARGIN_ITEMS = 10;
  const STOCK_ITEMS = 10;
  const MONTHLY_ITEMS = 12;

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Erro ao carregar relatórios', err));
  }, []);

  if (!data) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-12 rounded-xl">
          <p className="text-center text-lg text-gray-300">Carregando...</p>
        </div>
      </Layout>
    );
  }

  const {
    dailySales,
    monthlySales,
    profitMargins,
    salesByCategory,
    stockValues,
  } = data;

  const dailyTotalPages = Math.ceil(dailySales.length / DAILY_ITEMS);
  const dailySalesPage = dailySales.slice(
    (dailyPage - 1) * DAILY_ITEMS,
    dailyPage * DAILY_ITEMS
  );

  const marginTotalPages = Math.min(
    10,
    Math.ceil(profitMargins.items.length / MARGIN_ITEMS)
  );
  const marginPageItems = profitMargins.items.slice(
    (marginPage - 1) * MARGIN_ITEMS,
    marginPage * MARGIN_ITEMS
  );

  const stockTotalPages = Math.min(
    10,
    Math.ceil(stockValues.items.length / STOCK_ITEMS)
  );
  const stockPageItems = stockValues.items.slice(
    (stockPage - 1) * STOCK_ITEMS,
    stockPage * STOCK_ITEMS
  );

  const monthlySalesLimited = monthlySales.slice(0, MONTHLY_ITEMS);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-white">Relatórios</h1>

        <CollapsibleSection title="Vendas Diárias">
          <ReportTable
            headers={['Data', 'Total de Vendas']}
            rows={dailySalesPage.map((d) => [d.date, d.total.toFixed(2)])}
          />
          <Pagination
            currentPage={dailyPage}
            totalPages={dailyTotalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= dailyTotalPages) setDailyPage(page);
            }}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Vendas Mensais">
          <ReportTable
            headers={['Mês', 'Total de Vendas']}
            rows={monthlySalesLimited.map((m) => [m.month, m.total.toFixed(2)])}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Margem de Lucro">
          <ReportTable
            headers={['Produto', 'Preço', 'Custo', 'Margem Líquida', 'Margem Percentual']}
            rows={marginPageItems.map((p) => [
              p.name,
              p.price.toFixed(2),
              p.costPrice.toFixed(2),
              p.margin.toFixed(2),
              ((p.margin / p.price) * 100).toFixed(2), // Calculando a margem percentual
            ])}
          />
          <p className="font-semibold text-lg text-gray-200 mt-3">
            Média da Margem: {profitMargins.average.toFixed(2)}
          </p>
          <Pagination
            currentPage={marginPage}
            totalPages={marginTotalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= marginTotalPages) setMarginPage(page);
            }}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Vendas por Categoria">
          <ReportTable
            headers={['Categoria', 'Total Vendido']}
            rows={salesByCategory.map((c) => [c.category, c.total.toFixed(2)])}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Valor do Estoque">
          <ReportTable
            headers={['Produto', 'Quantidade', 'Valor em Estoque']}
            rows={stockPageItems.map((s) => [
              s.name,
              s.stock,
              s.stockValue.toFixed(2),
            ])}
          />
          <p className="font-semibold text-lg text-gray-200 mt-3">
            Valor Total do Estoque: {stockValues.total.toFixed(2)}
          </p>
          <Pagination
            currentPage={stockPage}
            totalPages={stockTotalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= stockTotalPages) setStockPage(page);
            }}
          />
        </CollapsibleSection>
      </div>
    </Layout>
  );
}
