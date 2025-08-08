import { useState, useCallback } from 'react';

// Hook to manage product categories
export default function useCategories() {
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }, []);

  // Insert a newly created category into local state
  const addCategory = useCallback((category) => {
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  return { categories, loadCategories, addCategory };
}
