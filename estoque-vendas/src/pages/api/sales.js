import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { startDate, endDate, paymentMethod } = req.query;

      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (paymentMethod) {
        where.metodoPagamento = String(paymentMethod);
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: true, // traz o nome do produto junto
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = sales.reduce((acc, sale) => acc + sale.total, 0);
      return res.status(200).json({ sales, total });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar vendas' });
    }
  }

  if (req.method === 'POST') {
    const { items, metodoPagamento, offlineId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: 'Itens da venda são obrigatórios' });
    }

    if (!metodoPagamento || typeof metodoPagamento !== 'string') {
      return res
        .status(400)
        .json({ message: 'Método de pagamento é obrigatório' });
    }

    try {
      // Se for venda offline, evitar duplicar
      if (offlineId) {
        const existing = await prisma.sale.findUnique({ where: { offlineId } });
        if (existing) return res.status(200).json(existing);
      }

      const total = items.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      const sale = await prisma.sale.create({
        data: {
          offlineId,
          total,
          metodoPagamento: String(metodoPagamento),
          items: {
            create: items.map((item) => ({
              productId: item.id,
              quantity: item.qty,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      return res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao salvar venda' });
    }
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
