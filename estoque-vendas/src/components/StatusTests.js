export default function StatusTests({ tests }) {
  if (!tests) return null;

  const { lastRun, stats, details = [], logs } = tests;
  const { total, passed, failed, runtime } = stats;

  return (
    <>
      <h2>Testes</h2>
      <p>
        Última execução: {new Date(lastRun).toLocaleString()} | Total: {total} | Passaram: {passed} | Falharam: {failed} | Tempo: {runtime}ms
      </p>
      <ul>
        {details.map((t) => (
          <li key={t.name} style={{ marginBottom: '0.5rem' }}>
            {t.name} - {t.status} - {t.duration}ms
            {t.status !== 'passed' && <pre>{t.message}</pre>}
          </li>
        ))}
      </ul>
      {logs && (
        <div>
          <h3>Logs</h3>
          <pre>{logs}</pre>
        </div>
      )}
    </>
  );
}
