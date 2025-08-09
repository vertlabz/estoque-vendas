import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // vendas diárias e mensais
    const sales = await prisma.sale.findMany({ select: { createdAt: true, total: true } });

    const dailyMap = {};
    const monthlyMap = {};
    sales.forEach((s) => {
      const date = s.createdAt.toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + (s.total || 0);

      const month = `${String(s.createdAt.getMonth() + 1).padStart(2, '0')}/${s.createdAt.getFullYear()}`;
      monthlyMap[month] = (monthlyMap[month] || 0) + (s.total || 0);
    });

    const dailySales = Object.entries(dailyMap).map(([date, total]) => ({ date, total }));
    const monthlySales = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

    // produtos para margem e estoque
    const products = await prisma.product.findMany({
      select: { name: true, price: true, costPrice: true, stock: true },
    });

    const profitItems = products.map((p) => {
      const price = p.price || 0;
      const cost = p.costPrice || 0;
      return { name: p.name || '', price, costPrice: cost, margin: price - cost };
    });
    const totalMargin = profitItems.reduce((acc, p) => acc + p.margin, 0);

    const stockItems = products.map((p) => {
      const price = p.price || 0;
      const stock = p.stock || 0;
      return { name: p.name || '', stock, stockValue: price * stock };
    });
    const totalStockValue = stockItems.reduce((acc, p) => acc + p.stockValue, 0);

    // vendas por categoria
    const saleItems = await prisma.saleItem.findMany({
      include: { product: { include: { category: true } } },
    });
    const categoryMap = {};
    saleItems.forEach((item) => {
      const category = item.product?.category?.name || 'Sem categoria';
      const total = (item.price || 0) * (item.quantity || 0);
      categoryMap[category] = (categoryMap[category] || 0) + total;
    });
    const salesByCategory = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));

    return res.status(200).json({
      dailySales,
      monthlySales,
      profitMargins: { items: profitItems, total: totalMargin },
      salesByCategory,
      stockValues: { items: stockItems, total: totalStockValue },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar relatório' });
  }
}
