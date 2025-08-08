import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) return <div>Erro: {error}</div>;
  if (!data) return <div>Carregando...</div>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Status do Sistema</h1>
      <p>Versão: {data.version}</p>
      {data.lastCommit && (
        <p>Último deploy: {new Date(data.lastCommit).toLocaleString()}</p>
      )}
      <p>Status da API: {data.apiStatus}</p>
      <h2>Testes</h2>
      <p>
        Última execução:{' '}
        {new Date(data.tests.lastRun).toLocaleString()} | Total:{' '}
        {data.tests.stats.total} | Passaram: {data.tests.stats.passed} | Falharam: {data.tests.stats.failed} | Tempo:{' '}
        {data.tests.stats.runtime}ms
      </p>
      <ul>
        {data.tests.details.map((t) => (
          <li key={t.name} style={{ marginBottom: '0.5rem' }}>
            {t.name} - {t.status} - {t.duration}ms
            {t.status !== 'passed' && <pre>{t.message}</pre>}
          </li>
        ))}
      </ul>
      {data.tests.logs && (
        <div>
          <h3>Logs</h3>
          <pre>{data.tests.logs}</pre>
        </div>
      )}
    </div>
  );
}
