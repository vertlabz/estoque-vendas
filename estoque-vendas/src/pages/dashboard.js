import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Redireciona para login se não tiver token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // Busca produtos do backend
  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
    loadProducts();
  }, []);

  // Adiciona produto ao carrinho
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

  // Remove produto do carrinho
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Atualiza quantidade manualmente
  const updateQty = (productId, newQty) => {
    if (newQty < 1) return; // impede zero ou negativo
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
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });

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


  return (
    <div className="flex min-h-screen bg-gray-900 text-white flex-col sm:flex-row">
      {/* Lista de produtos */}
      <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-between"
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

      {/* Carrinho */}
      <div className="w-full sm:w-96 bg-gray-800 p-6 flex flex-col justify-between">
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
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-xl select-none"
                    aria-label={`Diminuir quantidade de ${item.name}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-16 text-center rounded bg-gray-600 text-white"
                  />
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-xl select-none"
                    aria-label={`Aumentar quantidade de ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-3 bg-red-700 px-3 py-1 rounded hover:bg-red-800"
                    aria-label={`Remover ${item.name} do carrinho`}
                  >
                    🗑️
                  </button>
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
          <button
            onClick={finalizeSale}
            disabled={cart.length === 0}
            className="bg-blue-600 w-full py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
