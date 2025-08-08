import indexHandler from '../../src/pages/api/comandas/index';
import finalizeHandler from '../../src/pages/api/comandas/[id]/finalize';
import itemsHandler from '../../src/pages/api/comandas/[id]/items';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    comanda: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    comandaItem: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: { update: jest.fn() },
    sale: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

function mockRes() {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((data) => {
    res.body = data;
    return res;
  });
  res.end = jest.fn();
  res.setHeader = jest.fn();
  return res;
}

describe('API Comandas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/comandas', () => {
    it('lista comandas abertas', async () => {
      prisma.comanda.findMany.mockResolvedValue([{ id: 1, status: 'aberta', itens: [] }]);
      const req = { method: 'GET' };
      const res = mockRes();
      await indexHandler(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, status: 'aberta', itens: [] }]);
    });

    it('retorna erro ao listar', async () => {
      prisma.comanda.findMany.mockRejectedValue(new Error('fail'));
      const req = { method: 'GET' };
      const res = mockRes();
      await indexHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao listar comandas' });
    });
  });

  describe('POST /api/comandas', () => {
    it('cria comanda com sucesso', async () => {
      prisma.comanda.create.mockResolvedValue({ id: 2, status: 'aberta' });
      const req = { method: 'POST', body: {} };
      const res = mockRes();
      await indexHandler(req, res);
      expect(prisma.comanda.create).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ id: 2, status: 'aberta' });
    });

    it('retorna erro ao criar comanda', async () => {
      prisma.comanda.create.mockRejectedValue(new Error('fail'));
      const req = { method: 'POST', body: {} };
      const res = mockRes();
      await indexHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao criar comanda' });
    });
  });

  describe('POST /api/comandas/:id/finalize', () => {
    const baseReq = { query: { id: '1' } };

    it('rejeita método não permitido', async () => {
      const req = { ...baseReq, method: 'GET', body: {} };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(res.statusCode).toBe(405);
      expect(res.body).toEqual({ message: 'Método GET não permitido' });
    });

    it('valida ausência de método de pagamento', async () => {
      const req = { ...baseReq, method: 'POST', body: {} };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Método de pagamento é obrigatório' });
    });

    it('retorna 404 se comanda não existir', async () => {
      prisma.comanda.findUnique.mockResolvedValue(null);
      const req = { ...baseReq, method: 'POST', body: { metodoPagamento: 'dinheiro' } };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(prisma.comanda.findUnique).toHaveBeenCalled();
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Comanda não encontrada' });
    });

    it('finaliza comanda com sucesso', async () => {
      prisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        itens: [
          { productId: 1, quantidade: 2, product: { price: 5 } },
        ],
      });
      prisma.$transaction.mockResolvedValue([]);
      const req = { ...baseReq, method: 'POST', body: { metodoPagamento: 'pix' } };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Comanda finalizada' });
    });

    it('retorna erro ao buscar comanda', async () => {
      prisma.comanda.findUnique.mockRejectedValue(new Error('fail'));
      const req = { ...baseReq, method: 'POST', body: { metodoPagamento: 'pix' } };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao finalizar comanda' });
    });

    it('retorna erro na transação', async () => {
      prisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        itens: [
          { productId: 1, quantidade: 2, product: { price: 5 } },
        ],
      });
      prisma.$transaction.mockRejectedValue(new Error('trans fail'));
      const req = { ...baseReq, method: 'POST', body: { metodoPagamento: 'pix' } };
      const res = mockRes();
      await finalizeHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao finalizar comanda' });
    });
  });

  describe('Items handler', () => {
    const baseReq = { query: { id: '1' } };

    it('adiciona item à comanda', async () => {
      prisma.comandaItem.create.mockResolvedValue({ id: 10, productId: 1, quantidade: 2 });
      const req = { ...baseReq, method: 'POST', body: { productId: 1, quantidade: 2 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ id: 10, productId: 1, quantidade: 2 });
    });

    it('valida campos obrigatórios ao adicionar', async () => {
      const req = { ...baseReq, method: 'POST', body: { productId: 1 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'productId e quantidade são obrigatórios' });
    });

    it('erro ao adicionar item', async () => {
      prisma.comandaItem.create.mockRejectedValue(new Error('fail'));
      const req = { ...baseReq, method: 'POST', body: { productId: 1, quantidade: 2 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao adicionar item' });
    });

    it('atualiza item da comanda', async () => {
      prisma.comandaItem.update.mockResolvedValue({ id: 10, quantidade: 5 });
      const req = { ...baseReq, method: 'PUT', body: { itemId: 10, quantidade: 5 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id: 10, quantidade: 5 });
    });

    it('valida campos obrigatórios ao atualizar', async () => {
      const req = { ...baseReq, method: 'PUT', body: { itemId: 10 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'itemId e quantidade são obrigatórios' });
    });

    it('erro ao atualizar item', async () => {
      prisma.comandaItem.update.mockRejectedValue(new Error('fail'));
      const req = { ...baseReq, method: 'PUT', body: { itemId: 10, quantidade: 5 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao atualizar item' });
    });

    it('remove item da comanda', async () => {
      prisma.comandaItem.delete.mockResolvedValue({});
      const req = { ...baseReq, method: 'DELETE', body: { itemId: 10 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('valida itemId ao remover', async () => {
      const req = { ...baseReq, method: 'DELETE', body: {} };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'itemId é obrigatório' });
    });

    it('erro ao remover item', async () => {
      prisma.comandaItem.delete.mockRejectedValue(new Error('fail'));
      const req = { ...baseReq, method: 'DELETE', body: { itemId: 10 } };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erro ao remover item' });
    });

    it('método não permitido', async () => {
      const req = { ...baseReq, method: 'GET', body: {} };
      const res = mockRes();
      await itemsHandler(req, res);
      expect(res.statusCode).toBe(405);
      expect(res.body).toEqual({ message: 'Método GET não permitido' });
    });
  });
});

