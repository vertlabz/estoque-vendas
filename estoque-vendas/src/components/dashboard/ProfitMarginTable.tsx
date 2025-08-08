import { useState } from 'react';

interface MarginItem {
  id: number;
  name: string | null;
  price: number | null;
  costPrice: number | null;
  margin: number;
  marginPercent: number;
}

interface Props {
  data: MarginItem[];
}

export default function ProfitMarginTable({ data }: Props) {
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const sorted = [...data].sort((a, b) =>
    order === 'asc'
      ? a.marginPercent - b.marginPercent
      : b.marginPercent - a.marginPercent
  );

  const toggleOrder = () => setOrder(order === 'asc' ? 'desc' : 'asc');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded">
        <thead>
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-right">Preço</th>
            <th className="p-2 text-right">Custo</th>
            <th className="p-2 text-right cursor-pointer" onClick={toggleOrder}>
              Margem R$
            </th>
            <th className="p-2 text-right cursor-pointer" onClick={toggleOrder}>
              Margem %
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr
              key={item.id}
              className={
                item.marginPercent > 50
                  ? 'text-green-400'
                  : item.marginPercent < 20
                  ? 'text-red-400'
                  : ''
              }
            >
              <td className="p-2">{item.name}</td>
              <td className="p-2 text-right">{item.price?.toFixed(2)}</td>
              <td className="p-2 text-right">{item.costPrice?.toFixed(2)}</td>
              <td className="p-2 text-right">{item.margin.toFixed(2)}</td>
              <td className="p-2 text-right">
                {item.marginPercent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

