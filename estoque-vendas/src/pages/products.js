import { useState, useEffect } from 'react';
import Layout from './layout';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    categoryId: '',
    stock: '',
    multiplier: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const openModalForNew = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      price: '',
      costPrice: '',
      categoryId: '',
      stock: '',
      multiplier: 1,
    });
    setModalOpen(true);
  };

  const openModalForEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      price: product.price || '',
      costPrice: product.costPrice || '',
      categoryId: product.category?.id || '',
      stock: product.stock || '',
      multiplier: product.multiplier || 1,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      alert('Nome, preço e categoria são obrigatórios');
      return;
    }

    const estoqueFinal =
      parseInt(form.stock || 0) * parseInt(form.multiplier || 1);
    const method = editingProduct ? 'PUT' : 'POST';
    const body = {
      ...(editingProduct && { id: editingProduct.id }),
      ...form,
      price: parseFloat(form.price),
      costPrice: parseFloat(form.costPrice),
      categoryId: parseInt(form.categoryId),
      stock: estoqueFinal,
      multiplier: parseInt(form.multiplier),
    };

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert(
        `Produto ${editingProduct ? 'atualizado' : 'adicionado'} com sucesso!`
      );
      closeModal();
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold">Gerenciar Produtos</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white w-full sm:w-auto"
            />
            <button
              onClick={openModalForNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Adicionar Produto
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2">Nome</th>
                <th className="border border-gray-600 px-4 py-2">Categoria</th>
                <th className="border border-gray-600 px-4 py-2">Preço</th>
                <th className="border border-gray-600 px-4 py-2">Preço Custo</th>
                <th className="border border-gray-600 px-4 py-2">Estoque</th>
                <th className="border border-gray-600 px-4 py-2 hidden sm:table-cell">Atualizado em</th>
                <th className="border border-gray-600 px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700">
                    <td className="border border-gray-600 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-600 px-4 py-2">{product.category?.name || 'Sem categoria'}</td>
                    <td className="border border-gray-600 px-4 py-2 text-right">R$ {product.price?.toFixed(2)}</td>
                    <td className="border border-gray-600 px-4 py-2 text-right">R$ {product.costPrice?.toFixed(2)}</td>
                    <td className="border border-gray-600 px-4 py-2 text-center">{product.stock}</td>
                    <td className="border border-gray-600 px-4 py-2 text-center hidden sm:table-cell">{new Date(product.updatedAt).toLocaleString()}</td>
                    <td className="border border-gray-600 px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openModalForEdit(product)}
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

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md relative animate-fadeIn">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
                aria-label="Fechar"
              >
                ×
              </button>
              <h2 className="text-2xl mb-4">{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <select
                  name="categoryId"
                  value={form.categoryId || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-600"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleInputChange}
                  placeholder="Quantidade inicial (caixas)"
                  className="w-full p-3 rounded bg-gray-800 border border-gray-600"
                />
                <input
                  name="multiplier"
                  type="number"
                  value={form.multiplier}
                  onChange={handleInputChange}
                  placeholder="Multiplicador (ex: 12 latas por caixa)"
                  className="w-full p-3 rounded bg-gray-800 border border-gray-600"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 rounded hover:bg-green-700"
                  >
                    {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
