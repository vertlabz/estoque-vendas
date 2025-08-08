import StatusTests from '../components/StatusTests';
import useStatus from '../hooks/useStatus';

export default function StatusPage() {
  const { status, error, loading } = useStatus();

  if (error) return <div>Erro: {error}</div>;
  if (loading) return <div>Carregando...</div>;

  const { version, lastCommit, apiStatus, tests } = status;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Status do Sistema</h1>
      <p>Versão: {version}</p>
      {lastCommit && (
        <p>Último deploy: {new Date(lastCommit).toLocaleString()}</p>
      )}
      <p>Status da API: {apiStatus}</p>
      <StatusTests tests={tests} />
    </div>
  );
}
