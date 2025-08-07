// @ts-nocheck
export default function DashboardCards({ productsCount, salesTotal = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Produtos</p>
        <p className="text-2xl font-bold">{productsCount}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Vendas</p>
        <p className="text-2xl font-bold">R$ {salesTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
