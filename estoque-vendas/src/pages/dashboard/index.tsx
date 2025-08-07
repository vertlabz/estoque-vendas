// @ts-nocheck
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardFilters from "@/components/Dashboard/DashboardFilters";
import DashboardCards from "@/components/Dashboard/DashboardCards";
import DashboardCharts from "@/components/Dashboard/DashboardCharts";
import DashboardTable from "@/components/Dashboard/DashboardTable";
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

  const openPaymentModal = (items, callback, msg) => {
    setPendingItems(items);
    setPendingCallback(() => callback);
    setSuccessMessage(msg);
    setShowPaymentModal(true);
  };

  const handlePaymentSelection = async (method) => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingItems, metodoPagamento: method }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Erro: ${data.message}`);
        return;
      }
      if (pendingCallback) pendingCallback();
      alert(successMessage || 'Venda salva com sucesso!');
    } catch (err) {
      alert('Erro ao salvar venda');
      console.error(err);
    } finally {
      setShowPaymentModal(false);
      setPendingItems([]);
      setPendingCallback(null);
      setSuccessMessage('');
    }
  };

  const finalizeSale = async () => {
    if (cart.length === 0) return;
    const offlineId = crypto.randomUUID();
    const saleData = { offlineId, items: cart };
    if (navigator.onLine) {
      try {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(`Erro: ${data.message}`);
          return;
        }
        alert('Venda salva com sucesso!');
        setCart([]);
        await syncPendingSales();
      } catch (err) {
        alert('Erro ao salvar venda');
        console.error(err);
      }
    } else {
      await saveSaleOffline(saleData);
      alert('Sem conexão. Venda salva localmente!');
      setCart([]);
    }
  };

  const handleCreateComanda = async () => {
    try {
      const res = await fetch('/api/comandas', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao criar comanda');
      const nova = await res.json();
      setComandas((prev) => [...prev, { ...nova, items: [] }]);
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
    setShowModal(true);
    setModalType('finalize');
  };

  const finalizeSelectedComanda = async () => {
    if (!selectedComanda) return;
    const comanda = comandas.find((c) => c.id === selectedComanda);
    if (!comanda || comanda.items.length === 0) return;

    const offlineId = crypto.randomUUID();
    const saleData = { offlineId, items: comanda.items };

    if (navigator.onLine) {
      try {
        const res = await fetch(`/api/comandas/${selectedComanda}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(`Erro: ${data.message}`);
          return;
        }
        alert('Comanda finalizada com sucesso!');
        setComandas((prev) => prev.filter((c) => c.id !== selectedComanda));
        setSelectedComanda(null);
        setShowModal(false);
        await syncPendingSales();
      } catch (err) {
        alert('Erro ao finalizar comanda');
        console.error(err);
      }
    } else {
      await saveSaleOffline(saleData);
      alert('Comanda salva offline e será sincronizada quando voltar a internet.');
      setComandas((prev) => prev.filter((c) => c.id !== selectedComanda));
      setSelectedComanda(null);
      setShowModal(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?.id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <DashboardLayout>
        <DashboardHeader />
        <DashboardCards productsCount={products.length} />
        <DashboardCharts />
        <main className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
              <DashboardFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <DashboardTable products={filteredProducts} addToCart={addToCart} />
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
                <button onClick={handleCreateComanda} className="bg-yellow-600 w-full py-2 rounded hover:bg-yellow-700">
                  Criar Comanda
                </button>
                <button onClick={handleAddToComanda} className="bg-purple-600 w-full py-2 rounded hover:bg-purple-700">
                  Adicionar à Comanda
                </button>
                <button onClick={handleFinalizeComanda} className="bg-pink-600 w-full py-2 rounded hover:bg-pink-700">
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
                      {`Comanda #${c.id}`}
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
                        {`Comanda #${c.id}`}
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
      </DashboardLayout>
    </div>
  );
}
