import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', costPrice: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({ name: product.name, price: product.price.toString() });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setForm({ name: '', price: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert('Preencha nome e preço');
      return;
    }

    const method = editingProduct ? 'PUT' : 'POST';
    const body = editingProduct
      ? { id: editingProduct.id, name: form.name, price: parseFloat(form.price), costPrice: parseFloat(form.costPrice) }
      : { name: form.name, price: parseFloat(form.price), costPrice: parseFloat(form.costPrice) };

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert(`Produto ${editingProduct ? 'atualizado' : 'adicionado'} com sucesso!`);
      setEditingProduct(null);
      setForm({ name: '', price: '' });
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.message || 'Erro');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente deletar este produto?')) return;

    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.status === 204) {
      alert('Produto deletado com sucesso!');
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.message || 'Erro ao deletar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl mb-6">Gerenciar Produtos</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-md">
        <input
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Nome do produto"
          className="w-full p-3 rounded bg-gray-800 border border-gray-600"
          required
        />
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleInputChange}
          placeholder="Preço (ex: 4.50)"
          className="w-full p-3 rounded bg-gray-800 border border-gray-600"
          required

          
        />
        <input
          name="costPrice"
          type="number"
          step="0.01"
          value={form.costPrice}
          onChange={handleInputChange}
          placeholder="Preço de custo (ex: 2.50)"
          className="w-full p-3 rounded bg-gray-800 border border-gray-600"
          required
        />


        <div>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition mr-3"
          >
            {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="max-w-4xl">
        <table className="w-full table-auto border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-600 px-4 py-2">ID</th>
              <th className="border border-gray-600 px-4 py-2">Nome</th>
              <th className="border border-gray-600 px-4 py-2">Preço</th>
              <th className="border border-gray-600 px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-4 py-2 text-center">{product.id}</td>
                  <td className="border border-gray-600 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-600 px-4 py-2 text-right">
                    R$ {product.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-600 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
