import React from 'react';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
      <h2 className="text-lg font-bold">{product.name}</h2>
      <p className="text-blue-400 font-semibold">R$ {product.price.toFixed(2)}</p>
      <button
        onClick={() => onAdd(product)}
        className="mt-3 bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition w-full text-lg"
      >
        + Adicionar
      </button>
    </div>
  );
}
