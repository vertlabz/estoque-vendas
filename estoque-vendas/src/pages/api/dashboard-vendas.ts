import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function subMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() - months, 1);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const now = new Date();
    const { startDate, endDate } = req.query;
    const rangeStart = startDate ? new Date(startDate as string) : monthStart(now);
    const rangeEnd = endDate ? new Date(endDate as string) : monthEnd(now);

    const products = await prisma.product.findMany({
      select: { id: true, name: true, price: true, costPrice: true },
    });

    const margins = products.map((p) => {
      const price = p.price || 0;
      const cost = p.costPrice || 0;
      const margin = price - cost;
      const marginPercent = price ? (margin / price) * 100 : 0;
      return { ...p, margin, marginPercent };
    });

    const salesInRange = await prisma.sale.findMany({
      where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
      include: { items: { include: { product: { include: { category: true } } } } },
    });

    const categoryTotals: Record<string, number> = {};
    salesInRange.forEach((sale) => {
      sale.items.forEach((item) => {
        const category = item.product?.category?.name || 'Sem categoria';
        const total = item.total ?? (item.price || 0) * (item.quantity || 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + total;
      });
    });
    const salesByCategory = Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));

    const monthStartDate = monthStart(now);
    const monthEndDate = monthEnd(now);

    const salesCurrentMonth = await prisma.sale.findMany({
      where: { createdAt: { gte: monthStartDate, lte: monthEndDate } },
      select: { createdAt: true, total: true },
    });

    const dailyMap: Record<string, number> = {};
    salesCurrentMonth.forEach((sale) => {
      const key = sale.createdAt.toISOString().split('T')[0];
      dailyMap[key] = (dailyMap[key] || 0) + (sale.total || 0);
    });
    const dailySales = Object.entries(dailyMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const yearStart = subMonths(monthStartDate, 11);
    const salesLastYear = await prisma.sale.findMany({
      where: { createdAt: { gte: yearStart, lte: monthEndDate } },
      select: { createdAt: true, total: true },
    });

    const monthlyMap: Record<string, number> = {};
    salesLastYear.forEach((sale) => {
      const key = sale.createdAt.toISOString().slice(0, 7);
      monthlyMap[key] = (monthlyMap[key] || 0) + (sale.total || 0);
    });
    const monthlySales = Object.entries(monthlyMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({ margins, salesByCategory, dailySales, monthlySales });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao gerar dados do dashboard' });
  }
}

