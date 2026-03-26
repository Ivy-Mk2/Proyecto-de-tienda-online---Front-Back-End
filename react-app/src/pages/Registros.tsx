import Registro from '../components/Registro/Registro';
import Logo from '../components/Header/Logo';
import { PageStatus } from '../components/ui';
import { usePageUXState } from '../hooks/usePageUXState';

const Registros = () => {
  const { pageState, retry } = usePageUXState();

  if (pageState === 'loading') {
    return <PageStatus state="loading" title="Cargando formulario" description="Preparando registro." />;
  }

  if (pageState === 'error') {
    return (
      <PageStatus
        state="error"
        title="Error en registro"
        description="No pudimos cargar el módulo de registro."
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <header className="main-header registro-page__header">
        <Logo />
      </header>
      <main className="main-registro">
        <Registro />
      </main>
    </>
  );
};

export default Registros;
