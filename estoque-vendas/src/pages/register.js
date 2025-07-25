import { useState } from "react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erro ao registrar');

      alert('Usuário registrado com sucesso!');
      router.push('/login');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Registrar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Criar Conta
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-4">
          Já tem conta? <a href="/login" className="text-blue-400 hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
