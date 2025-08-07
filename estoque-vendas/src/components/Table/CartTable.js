import React from 'react';

export default function CartTable({ cart, updateQty, removeFromCart }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Carrinho</h2>
      {cart.length === 0 ? (
        <p className="text-gray-400 text-center">Nenhum item</p>
      ) : (
        cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between mb-4 bg-gray-700 p-3 rounded"
          >
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-blue-400">R$ {(item.price * item.qty).toFixed(2)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => updateQty(item.id, item.qty - 1)} className="bg-red-600 px-3 py-1 rounded">−</button>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                className="w-16 text-center rounded bg-gray-600 text-white"
              />
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="bg-green-600 px-3 py-1 rounded">+</button>
              <button onClick={() => removeFromCart(item.id)} className="ml-2 bg-red-700 px-3 py-1 rounded">🗑️</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
