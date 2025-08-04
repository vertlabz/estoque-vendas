import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
}
