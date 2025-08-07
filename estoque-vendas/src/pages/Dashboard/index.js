import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Header from '@/components/Header';
import DashboardFilters from '@/components/Filters';
import ProductCard from '@/components/Card/ProductCard';
import CartTable from '@/components/Table/CartTable';
import ComandaModal from '@/components/Modal/ComandaModal';
import { getProducts, getCategories, createSale } from '@/services/api';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [clientName, setClientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  useEffect(() => {
    getProducts().then(setProducts);
    getCategories().then(setCategories);
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

  const finalizeSale = async () => {
    if (cart.length === 0) return;
    try {
      const res = await createSale(cart);
      if (!res.ok) {
        const data = await res.json();
        alert(`Erro: ${data.message}`);
        return;
      }
      alert('Venda salva com sucesso!');
      setCart([]);
    } catch (err) {
      alert('Erro ao salvar venda');
      console.error(err);
    }
  };

  const handleCreateComanda = () => {
    if (!clientName) return alert('Informe o nome do cliente');
    const id = Date.now();
    setComandas((prev) => [...prev, { id, clientName, items: [] }]);
    setClientName('');
    setShowModal(false);
  };

  const handleAddToComanda = () => {
    setShowModal(true);
    setModalType('add');
  };

  const addItemsToComanda = (comandaId) => {
    setComandas((prev) =>
      prev.map((c) =>
        c.id === comandaId ? { ...c, items: [...c.items, ...cart] } : c
      )
    );
    setCart([]);
    setShowModal(false);
  };

  const handleFinalizeComanda = () => {
    setShowModal(true);
    setModalType('finalize');
  };

  const finalizeSelectedComanda = async () => {
    if (!selectedComanda) return;
    const comanda = comandas.find((c) => c.id === selectedComanda);
    if (!comanda || comanda.items.length === 0) return;
    try {
      const res = await createSale(comanda.items);
      if (!res.ok) {
        const data = await res.json();
        alert(`Erro: ${data.message}`);
        return;
      }
      alert('Comanda finalizada com sucesso!');
      setComandas((prev) => prev.filter((c) => c.id !== selectedComanda));
      setSelectedComanda(null);
      setShowModal(false);
    } catch (err) {
      alert('Erro ao finalizar comanda');
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?.id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <Header title="Dashboard" />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <DashboardFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </div>
        <div className="w-full sm:w-96 bg-gray-800 p-6 rounded-lg flex flex-col gap-6">
          <CartTable cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} />
          <div>
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={finalizeSale}
              disabled={cart.length === 0}
              className="bg-blue-600 w-full py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
            >
              Finalizar Venda
            </button>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setModalType('create');
                  setShowModal(true);
                }}
                className="bg-yellow-600 w-full py-2 rounded hover:bg-yellow-700"
              >
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
      </div>
      <ComandaModal
        show={showModal}
        modalType={modalType}
        clientName={clientName}
        setClientName={setClientName}
        comandas={comandas}
        addItemsToComanda={addItemsToComanda}
        handleCreateComanda={handleCreateComanda}
        selectedComanda={selectedComanda}
        setSelectedComanda={setSelectedComanda}
        finalizeSelectedComanda={finalizeSelectedComanda}
        setShowModal={setShowModal}
      />
    </DashboardLayout>
  );
}
