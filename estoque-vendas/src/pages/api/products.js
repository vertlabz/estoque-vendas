import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products = await prisma.product.findMany();
        return res.status(200).json(products);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar produtos' });
      }

    case 'POST': // criar produto
      try {
        const { name, price } = req.body;
        if (!name || price === undefined) {
          return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
        }
        const product = await prisma.product.create({
          data: { name, price: parseFloat(price) },
        });
        return res.status(201).json(product);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar produto' });
      }

    case 'PUT': // editar produto
      try {
        const { id, name, price } = req.body;
        if (!id || !name || price === undefined) {
          return res.status(400).json({ message: 'ID, nome e preço são obrigatórios' });
        }
        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: { name, price: parseFloat(price) },
        });
        return res.status(200).json(product);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar produto' });
      }

    case 'DELETE': // deletar produto
      try {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }
        await prisma.product.delete({
          where: { id: Number(id) },
        });
        return res.status(204).end();
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao deletar produto' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Método ${method} não permitido` });
  }
}
