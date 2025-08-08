import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        });
        return res.status(200).json(categories);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar categorias' });
      }
    case 'POST':
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'Nome é obrigatório' });
        }
        // Save new category
        const category = await prisma.category.create({
          data: { name },
        });
        return res.status(201).json(category);
      } catch (err) {
        // Handle unique constraint violation
        if (err.code === 'P2002') {
          return res
            .status(409)
            .json({ message: 'Categoria já existe' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar categoria' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Método ${method} não permitido` });
  }
}
