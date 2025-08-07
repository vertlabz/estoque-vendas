import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { method, query: { id } } = req;
  const comandaId = parseInt(id, 10);

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Método ${method} não permitido` });
  }

  try {
    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: { itens: true },
    });
    if (!comanda) return res.status(404).json({ message: 'Comanda não encontrada' });

    await prisma.$transaction([
      ...comanda.itens.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantidade } },
        })
      ),
      prisma.comanda.update({
        where: { id: comandaId },
        data: { status: 'finalizada' },
      }),
    ]);

    return res.status(200).json({ message: 'Comanda finalizada' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao finalizar comanda' });
  }
}
