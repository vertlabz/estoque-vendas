import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          items: {
            include: {
              product: true, // traz o nome do produto junto
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(sales);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar vendas' });
    }
  }

  if (req.method === 'POST') {
    const { items, metodoPagamento } = req.body;

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
      const total = items.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      const sale = await prisma.sale.create({
        data: {
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
