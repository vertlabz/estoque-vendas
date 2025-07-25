import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
}
