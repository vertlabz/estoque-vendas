import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  switch (method) {
    case 'GET':
      try {
        const comandas = await prisma.comanda.findMany({
          where: { status: 'aberta' },
          include: { itens: { include: { product: true } } },
          orderBy: { createdAt: 'asc' },
        });
        return res.status(200).json(comandas);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao listar comandas' });
      }
    case 'POST':
      try {
        const { clientName } = req.body || {};
        const comanda = await prisma.comanda.create({ data: { clientName } });
        return res.status(201).json(comanda);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar comanda' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Método ${method} não permitido` });
  }
}
