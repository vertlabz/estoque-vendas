/** @jest-environment node */
import handler from '../../../src/pages/api/sales';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    sale: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

function createMockResponse() {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((data) => {
    res.body = data;
    return res;
  });
  return res;
}

describe('POST /api/sales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  });

  it('desconta estoque e cria venda quando há estoque suficiente', async () => {
    const req = {
      method: 'POST',
      body: {
        items: [{ id: 1, qty: 2, price: 10 }],
        metodoPagamento: 'dinheiro',
      },
    };
    const res = createMockResponse();

    prisma.sale.findUnique.mockResolvedValue(null);
    prisma.product.findMany.mockResolvedValue([{ id: 1, stock: 5, name: 'Produto' }]);
    const saleData = { id: 1, total: 20, metodoPagamento: 'dinheiro', items: [] };
    prisma.sale.create.mockResolvedValue(saleData);

    await handler(req, res);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stock: { decrement: 2 } },
    });
    expect(prisma.sale.create).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(saleData);
  });

  it('retorna 400 se não houver estoque suficiente', async () => {
    const req = {
      method: 'POST',
      body: {
        items: [{ id: 1, qty: 3, price: 10 }],
        metodoPagamento: 'dinheiro',
      },
    };
    const res = createMockResponse();

    prisma.sale.findUnique.mockResolvedValue(null);
    prisma.product.findMany.mockResolvedValue([{ id: 1, stock: 2, name: 'Produto' }]);

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Estoque insuficiente para o produto Produto' });
    expect(prisma.product.update).not.toHaveBeenCalled();
    expect(prisma.sale.create).not.toHaveBeenCalled();
  });
});
