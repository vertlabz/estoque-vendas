// pages/status.js
import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('Erro ao buscar status');
        const json = await res.json();
        if (!cancel) {
          setStatus(json);
          setError(null);
        }
      } catch (err) {
        if (!cancel) setError(err.message);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, []);

  if (error) return <div style={styles.error}>Erro: {error}</div>;
  if (!status) return <div style={styles.loading}>Carregando status...</div>;

  const { version, lastCommit, apiStatus, tests } = status;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Status do Sistema</h1>
      <div style={styles.card}>
        <p><strong>Versão:</strong> {version}</p>
        {lastCommit && (
          <p><strong>Último deploy:</strong> {new Date(lastCommit).toLocaleString()}</p>
        )}
        <p><strong>Status da API:</strong> {apiStatus}</p>
      </div>

      <h2 style={styles.subtitle}>🧪 Resultados dos Testes</h2>
      <div style={styles.card}>
        <p>
          <strong>Última execução:</strong> {new Date(tests.lastRun).toLocaleString()}<br />
          <strong>Total:</strong> {tests.stats.total} | 
          <span style={{ color: 'green' }}> Passaram:</span> {tests.stats.passed} | 
          <span style={{ color: 'red' }}> Falharam:</span> {tests.stats.failed} | 
          <strong> Tempo:</strong> {tests.stats.runtime}ms
        </p>
        <ul>
          {tests.details.map((t) => (
            <li key={t.name} style={styles.testItem}>
              <strong>{t.name}</strong> - 
              <span style={{ color: t.status === 'passed' ? 'green' : 'red' }}>
                {` ${t.status}`}
              </span> - {t.duration}ms
              {t.status !== 'passed' && <pre style={styles.errorBox}>{t.message}</pre>}
            </li>
          ))}
        </ul>
      </div>

      {tests.logs && (
        <div style={styles.card}>
          <h3>📜 Logs</h3>
          <pre style={styles.logBox}>{tests.logs}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '1rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' },
  title: { textAlign: 'center', color: '#333' },
  subtitle: { marginTop: '2rem', color: '#333' },
  card: { background: '#363636ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  testItem: { marginBottom: '0.5rem' },
  error: { color: 'red', textAlign: 'center', padding: '1rem' },
  loading: { textAlign: 'center', padding: '1rem' },
  errorBox: { background: '#585858ff', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'pre-wrap' },
  logBox: { background: '#eee', padding: '0.5rem', borderRadius: '4px', whiteSpace: 'pre-wrap' },
};
