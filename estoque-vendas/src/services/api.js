export async function getProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getCategories() {
  const res = await fetch('/api/categories');
  return res.json();
}

export async function createSale(items) {
  return fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

export async function getSales() {
  const res = await fetch('/api/sales');
  return res.json();
}
