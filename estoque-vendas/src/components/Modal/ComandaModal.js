import React from 'react';

export default function ComandaModal({
  show,
  modalType,
  clientName,
  setClientName,
  comandas,
  addItemsToComanda,
  handleCreateComanda,
  selectedComanda,
  setSelectedComanda,
  finalizeSelectedComanda,
  setShowModal,
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        {modalType === 'create' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Criar Comanda</h2>
            <input
              type="text"
              placeholder="Nome do cliente"
              className="w-full p-2 rounded bg-gray-700 text-white mb-4"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <button onClick={handleCreateComanda} className="bg-green-600 w-full py-2 rounded hover:bg-green-700">
              Abrir Comanda
            </button>
          </div>
        )}
        {modalType === 'add' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Selecionar Comanda</h2>
            {comandas.map((c) => (
              <button
                key={c.id}
                onClick={() => addItemsToComanda(c.id)}
                className="w-full bg-gray-700 py-2 rounded mb-2 hover:bg-gray-600"
              >
                {c.clientName}
              </button>
            ))}
          </div>
        )}
        {modalType === 'finalize' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Finalizar Comanda</h2>
            <div className="space-y-2 mb-4">
              {comandas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComanda(c.id)}
                  className={`w-full py-2 rounded ${selectedComanda === c.id ? 'bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {c.clientName}
                </button>
              ))}
            </div>
            {selectedComanda && (
              <div className="bg-gray-700 p-4 rounded mb-4 max-h-64 overflow-y-auto">
                <h3 className="text-lg font-bold mb-2">Itens da Comanda</h3>
                {comandas
                  .find((c) => c.id === selectedComanda)
                  ?.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b border-gray-600 py-1">
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                <div className="mt-2 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>
                    R$
                    {comandas
                      .find((c) => c.id === selectedComanda)
                      ?.items.reduce((acc, item) => acc + item.price * item.qty, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {selectedComanda && (
              <button
                onClick={finalizeSelectedComanda}
                className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
              >
                Confirmar Finalização
              </button>
            )}
          </div>
        )}
        <button onClick={() => setShowModal(false)} className="mt-4 w-full bg-red-600 py-2 rounded hover:bg-red-700">
          Cancelar
        </button>
      </div>
    </div>
  );
}
