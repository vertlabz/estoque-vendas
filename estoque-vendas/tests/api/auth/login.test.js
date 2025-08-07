import handler from '../../../src/pages/api/auth/login';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
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

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  it('retorna 401 em credenciais inválidas', async () => {
    const req = {
      method: 'POST',
      body: { email: 'user@test.com', password: 'wrong' },
    };
    const res = createMockResponse();

    prisma.user.findUnique.mockResolvedValue(null);

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Usuário ou senha incorretos' });
  });

  it('retorna 200 e token em credenciais válidas', async () => {
    const req = {
      method: 'POST',
      body: { email: 'user@test.com', password: 'password' },
    };
    const res = createMockResponse();

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      password: 'hashed',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-token');

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ token: 'fake-token' });
  });
});
