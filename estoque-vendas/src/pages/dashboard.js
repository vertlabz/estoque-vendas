import { useState, useEffect } from 'react';
import {
  MdDashboard,
  MdInventory,
  MdAttachMoney,
  MdLogout,
} from 'react-icons/md';
import { useRouter } from 'next/router';
import Layout from './layout';
import { triggerVibration } from '@/lib/haptic';
import { saveSaleOffline, syncPendingSales } from '@/lib/offlineSales';

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingCallback, setPendingCallback] = useState(null);
  const [pendingEndpoint, setPendingEndpoint] = useState('/api/sales');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      syncPendingSales();
    };
    window.addEventListener('online', handleOnline);
    syncPendingSales();
    const interval = setInterval(syncPendingSales, 5 * 60 * 1000);
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    }
    loadCategories();
  }, []);

  const loadComandas = async () => {
    const res = await fetch('/api/comandas');
    let data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      const resCreate = await fetch('/api/comandas', { method: 'POST' });
      const nova = await resCreate.json();
      data = [nova];
    }
    setComandas(data.map((c) => ({ ...c, items: c.itens || [] })));
  };

  useEffect(() => {
    loadComandas();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQty = (productId, newQty) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const openPaymentModal = (items, endpoint, callback, msg) => {
    setPendingItems(items);
    setPendingEndpoint(endpoint);
    setPendingCallback(() => callback);
    setSuccessMessage(msg);
    setShowPaymentModal(true);
  };

  const handlePaymentSelection = async (method) => {
    if (!method) {
      alert('Por favor, selecione um método de pagamento');
      return;
    }
    try {
      const offlineId = crypto.randomUUID();
      const saleData = {
        offlineId,
        items: pendingItems,
        metodoPagamento: method,
      };
      if (navigator.onLine) {
        const res = await fetch(pendingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(`Erro: ${data.message}`);
          return;
        }
        if (pendingCallback) pendingCallback();
        alert(successMessage || 'Venda salva com sucesso!');
        if (pendingEndpoint === '/api/sales') await syncPendingSales();
      } else {
        if (pendingEndpoint === '/api/sales') {
          await saveSaleOffline(saleData);
          if (pendingCallback) pendingCallback();
          alert('Sem conexão. Venda salva localmente!');
        } else {
          alert('Sem conexão. Não foi possível finalizar a comanda.');
          return;
        }
      }
    } catch (err) {
      alert('Erro ao salvar venda');
      console.error(err);
    } finally {
      setShowPaymentModal(false);
      setPendingItems([]);
      setPendingCallback(null);
      setPendingEndpoint('/api/sales');
      setSuccessMessage('');
    }
  };

  const finalizeSale = () => {
    if (cart.length === 0) return;
    openPaymentModal(
      cart,
      '/api/sales',
      () => setCart([]),
      'Venda salva com sucesso!'
    );
  };

  const handleCreateComanda = async () => {
    triggerVibration();
    const clientName = prompt('Informe o nome do cliente:');
    if (!clientName) return alert('Nome do cliente é obrigatório!');
    try {
      const res = await fetch('/api/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName }),
      });
      if (!res.ok) throw new Error('Erro ao criar comanda');
      const nova = await res.json();
      setComandas((prev) => [...prev, { ...nova, clientName, items: [] }]);
    } catch (err) {
      alert('Erro ao criar comanda');
      console.error(err);
    }
  };

  const handleAddToComanda = () => {
    setShowModal(true);
    setModalType('add');
  };

  const addItemsToComanda = async (comandaId) => {
    try {
      for (const item of cart) {
        await fetch(`/api/comandas/${comandaId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.id, quantidade: item.qty }),
        });
      }
      await loadComandas();
      setCart([]);
      setShowModal(false);
    } catch (err) {
      alert('Erro ao adicionar itens à comanda');
      console.error(err);
    }
  };

  const handleFinalizeComanda = () => {
    triggerVibration();
    setShowModal(true);
    setModalType('finalize');
  };

  const finalizeSelectedComanda = () => {
    if (!selectedComanda) return;
    const comanda = comandas.find((c) => c.id === selectedComanda);
    if (!comanda || comanda.items.length === 0) return;

    openPaymentModal(
      comanda.items,
      `/api/comandas/${selectedComanda}/finalize`,
      () => {
        setComandas((prev) => prev.filter((c) => c.id !== selectedComanda));
        setSelectedComanda(null);
        setShowModal(false);
      },
      `Comanda de ${comanda.clientName || 'Cliente'} finalizada com sucesso!`
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?.id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Layout>
        <main className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar produto..."
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded ${selectedCategory === null ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded ${selectedCategory === cat.id ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 p-4 rounded-lg flex flex-col items-center"
                >
                  <h2 className="text-lg font-bold">{product.name}</h2>
                  <p className="text-blue-400 font-semibold">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition w-full text-lg"
                  >
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-96 bg-gray-800 p-6 rounded-lg flex flex-col gap-6">
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
                      <p className="text-blue-400">
                        R$ {(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="bg-red-600 px-3 py-1 rounded">−</button>
                      <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} className="w-16 text-center rounded bg-gray-600 text-white" />
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="bg-green-600 px-3 py-1 rounded">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-2 bg-red-700 px-3 py-1 rounded">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <button onClick={finalizeSale} disabled={cart.length === 0} className="bg-blue-600 w-full py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600">
                Finalizar Venda
              </button>
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCreateComanda}
                  className="criar-comanda-btn bg-yellow-600 w-full py-2 rounded hover:bg-yellow-700"
                >
                  Criar Comanda
                </button>
                <button onClick={handleAddToComanda} className="bg-purple-600 w-full py-2 rounded hover:bg-purple-700">
                  Adicionar à Comanda
                </button>
                <button
                  onClick={handleFinalizeComanda}
                  className="finalizar-comanda-btn bg-pink-600 w-full py-2 rounded hover:bg-pink-700"
                >
                  Finalizar Comanda
                </button>
              </div>
            </div>
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              {modalType === 'add' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Selecionar Comanda</h2>
                  {comandas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addItemsToComanda(c.id)}
                      className="w-full bg-gray-700 py-2 rounded mb-2 hover:bg-gray-600"
                    >
                      {`Comanda #${c.id} - Cliente: ${c.clientName || 'N/A'} - Status: ${c.status}`}
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
                        {`Comanda #${c.id} - Cliente: ${c.clientName || 'N/A'} - Status: ${c.status}`}
                      </button>
                    ))}
                  </div>

                  {selectedComanda && (
                    <div className="bg-gray-700 p-4 rounded mb-4 max-h-64 overflow-y-auto">
                      <h3 className="text-lg font-bold mb-2">
                        {(() => {
                          const c = comandas.find((c) => c.id === selectedComanda);
                          return `Comanda #${c?.id} - Cliente: ${c?.clientName || 'N/A'}`;
                        })()}
                      </h3>
                      {comandas
                        .find((c) => c.id === selectedComanda)
                        ?.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm border-b border-gray-600 py-1">
                            <span>{item.product?.name} x{item.quantidade}</span>
                            <span>
                              R$ {(item.product?.price * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      <div className="mt-2 font-bold flex justify-between">
                        <span>Total:</span>
                        <span>
                          R$
                          {comandas
                            .find((c) => c.id === selectedComanda)
                            ?.items.reduce(
                              (acc, item) =>
                                acc +
                                (item.product?.price || 0) * item.quantidade,
                              0
                            )
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
        )}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Método de Pagamento</h2>
              <div className="space-y-2 mb-4">
                {['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Outro'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handlePaymentSelection(m)}
                    className="w-full bg-gray-700 py-2 rounded mb-2 hover:bg-gray-600"
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPendingItems([]);
                  setPendingCallback(null);
                  setSuccessMessage('');
                }}
                className="w-full bg-red-600 py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}
