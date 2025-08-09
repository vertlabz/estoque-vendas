import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { triggerVibration } from '@/lib/haptic';

export default function Comandas() {
  const [comandas, setComandas] = useState([]);

  useEffect(() => {
    async function fetchComandas() {
      try {
        const res = await fetch('/api/comandas');
        const data = await res.json();
        setComandas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchComandas();
  }, []);

  const handleCreateComanda = async () => {
    triggerVibration();
    const clientName = prompt('Informe o nome do cliente:');
    if (!clientName) {
      return alert('Nome do cliente é obrigatório!');
    }

    try {
      const res = await fetch('/api/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, status: 'aberta', itens: [] }),
      });
      if (!res.ok) throw new Error('Erro ao criar comanda');
      const novaComanda = await res.json();
      setComandas((prev) => [...prev, novaComanda]);
      alert(`Comanda criada para o cliente: ${clientName}`);
    } catch (err) {
      alert('Erro ao criar comanda');
      console.error(err);
    }
  };

  const handleFinalizeComanda = async (comandaId) => {
    triggerVibration();
    try {
      const res = await fetch(`/api/comandas/${comandaId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao finalizar comanda');
      setComandas((prev) => prev.filter((c) => c.id !== comandaId));
      alert('Comanda finalizada com sucesso!');
    } catch (err) {
      alert('Erro ao finalizar comanda');
      console.error(err);
    }
  };

  const renderComandas = () => {
    return comandas.map((comanda) => (
      <div
        key={comanda.id}
        className="comanda-item bg-gray-700 p-3 rounded mb-2 flex justify-between items-center"
      >
        <p>
          Comanda #{comanda.id} - Cliente: {comanda.clientName || 'N/A'} - Status:{' '}
          {comanda.status}
        </p>
        <button
          onClick={() => handleFinalizeComanda(comanda.id)}
          className="finalizar-comanda-btn px-3 py-1 rounded bg-red-600 hover:bg-red-700"
        >
          Finalizar Comanda
        </button>
      </div>
    ));
  };

  return (
    <Layout>
      <div className="dashboard p-4">
        <h1 className="text-2xl font-bold mb-4">Administração de Comandas</h1>
        <button
          onClick={handleCreateComanda}
          className="criar-comanda-btn mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Criar Comanda
        </button>
        <div className="comandas-list">{renderComandas()}</div>
      </div>
    </Layout>
  );
}

