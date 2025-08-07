import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method, query: { id } } = req;
  const comandaId = parseInt(id, 10);

  switch (method) {
    case 'POST': {
      const { productId, quantidade } = req.body;
      if (!productId || !quantidade)
        return res.status(400).json({ message: 'productId e quantidade são obrigatórios' });
      try {
        const item = await prisma.comandaItem.create({
          data: { comandaId, productId, quantidade },
          include: { product: true },
        });
        return res.status(201).json(item);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao adicionar item' });
      }
    }
    case 'PUT': {
      const { itemId, quantidade } = req.body;
      if (!itemId || !quantidade)
        return res.status(400).json({ message: 'itemId e quantidade são obrigatórios' });
      try {
        const item = await prisma.comandaItem.update({
          where: { id: parseInt(itemId, 10) },
          data: { quantidade },
          include: { product: true },
        });
        return res.status(200).json(item);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar item' });
      }
    }
    case 'DELETE': {
      const { itemId } = req.body;
      if (!itemId)
        return res.status(400).json({ message: 'itemId é obrigatório' });
      try {
        await prisma.comandaItem.delete({ where: { id: parseInt(itemId, 10) } });
        return res.status(204).end();
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao remover item' });
      }
    }
    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Método ${method} não permitido` });
  }
}
