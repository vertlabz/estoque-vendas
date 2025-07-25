import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso', userId: user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}
