import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ReportTable from '@/components/ReportTable';

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Erro ao carregar relatórios', err));
  }, []);

  if (!data) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  const { dailySales, monthlySales, profitMargins, salesByCategory, stockValues } = data;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Vendas Diárias</h2>
        <ReportTable
          headers={['Data', 'Total de Vendas']}
          rows={dailySales.map((d) => [d.date, d.total.toFixed(2)])}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Vendas Mensais</h2>
        <ReportTable
          headers={['Mês', 'Total de Vendas']}
          rows={monthlySales.map((m) => [m.month, m.total.toFixed(2)])}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Margem de Lucro</h2>
        <ReportTable
          headers={['Produto', 'Preço', 'Custo', 'Margem Líquida']}
          rows={profitMargins.items.map((p) => [
            p.name,
            p.price.toFixed(2),
            p.costPrice.toFixed(2),
            p.margin.toFixed(2),
          ])}
        />
        <p className="font-semibold">Total de Margem: {profitMargins.total.toFixed(2)}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Vendas por Categoria</h2>
        <ReportTable
          headers={['Categoria', 'Total Vendido']}
          rows={salesByCategory.map((c) => [c.category, c.total.toFixed(2)])}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Valor do Estoque</h2>
        <ReportTable
          headers={['Produto', 'Quantidade', 'Valor em Estoque']}
          rows={stockValues.items.map((s) => [
            s.name,
            s.stock,
            s.stockValue.toFixed(2),
          ])}
        />
        <p className="font-semibold">Valor Total do Estoque: {stockValues.total.toFixed(2)}</p>
      </section>
    </Layout>
  );
}