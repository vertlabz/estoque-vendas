import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products = await prisma.product.findMany({
          include: {
            category: true,
            supplier: true,
          },
        });
        return res.status(200).json(products);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar produtos' });
      }

    case 'POST':
      try {
        console.log('POST /api/products body:', req.body); // <<< LOGA O QUE CHEGA
        const {
          name,
          price,
          costPrice,
          categoryId,
          supplier,
          stock,
          minStock,
          multiplier,
          description,
        } = req.body;

        if (!name || price === undefined || categoryId === undefined) {
          return res.status(400).json({
            message: 'Nome, preço e categoria são obrigatórios',
          });
        }

        const product = await prisma.product.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            costPrice: costPrice !== undefined ? parseFloat(costPrice) : 0,
            stock: stock !== undefined ? parseInt(stock) : 0,
            minStock: minStock !== undefined ? parseInt(minStock) : 0,
            multiplier: multiplier !== undefined ? parseInt(multiplier) : 1,
            category: {
              connect: {
                id: parseInt(categoryId),
              },
            },
          },
          include: { category: true },
        });

        return res.status(201).json(product);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar produto' });
      }

    case 'PUT':
      try {
        const {
          id,
          name,
          price,
          costPrice,
          categoryId,
          stock,
          minStock,
          multiplier,
          description,
        } = req.body;

        if (!id || !name || price === undefined || categoryId === undefined) {
          return res.status(400).json({
            message: 'ID, nome, preço e categoria são obrigatórios',
          });
        }

        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            name,
            description,
            price: parseFloat(price),
            costPrice: costPrice !== undefined ? parseFloat(costPrice) : 0,
            stock: stock !== undefined ? parseInt(stock) : 0,
            minStock: minStock !== undefined ? parseInt(minStock) : 0,
            multiplier: multiplier !== undefined ? parseInt(multiplier) : 1,
            category: {
              connect: {
                id: parseInt(categoryId),
              },
            },
          },
          include: { category: true },
        });

        return res.status(200).json(product);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar produto' });
      }

    case 'DELETE':
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
      return res
        .status(405)
        .json({ message: `Método ${method} não permitido` });
  }
}
