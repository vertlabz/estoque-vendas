import { useState } from 'react';

// Modal with form to create a new category
export default function CreateCategoryModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Send form data to API and handle feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Erro ao criar categoria');
        return;
      }
      const newCategory = await res.json();
      onCreated(newCategory);
      setName('');
      onClose();
    } catch (err) {
      setError('Erro ao criar categoria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
          aria-label="Fechar"
        >
          ×
        </button>
          <h2 className="text-2xl mb-4">Criar Categoria</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria"
            className="w-full p-3 rounded bg-gray-800 border border-gray-600"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
