import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import Footer from '../components/Footer/Footer';
import Featured from '../components/Featured/Featured';
import SpecialBanner from '../components/SpecialBanner/SpecialBanner';
import Section from '../components/Section/Section';
import BodySection from '../components/BodySection/BodySection';
import Marquee from '../components/Marquee/Marquee';
import { Badge, PageStatus } from '../components/ui';
import { usePageUXState } from '../hooks/usePageUXState';
import './Home.css';

const Home = () => {
  const { pageState, setPageState, retry, successMessage, showSuccess } = usePageUXState();

  if (pageState === 'loading') {
    return <PageStatus state="loading" title="Cargando Home" description="Preparando catálogo y secciones." />;
  }

  if (pageState === 'error') {
    return (
      <PageStatus
        state="error"
        title="No se pudo cargar Home"
        description="Intenta nuevamente en unos segundos."
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <Header />
      <Banner />
      <Featured title={'Featured'} />
      <SpecialBanner />
      <Marquee />
      <Section />
      <BodySection />
      <div className="main-content">
        <div className="announcement">
          <div className="announcement__container">
            <h1>HISTORIA, CREATIVIDAD Y DISEÑO EN 'FASHION FORWARD' DESDE 2024</h1>
            <p>
              En 'Fashion Forward' creemos que la moda no solo es lo que llevas puesto, es una declaración de quién
              eres. Nos inspira el arte de lo cotidiano, los detalles que hacen única a cada persona y la posibilidad
              de transformar cualquier día en algo especial a través del diseño. Nuestra misión es combinar estilos
              clásicos con tendencias contemporáneas.
            </p>
          </div>
        </div>
        <div className="newsletter">
          <h1>ÚNETE A NUESTRA COMUNIDAD Y RECIBE LAS ÚLTIMAS NOTICIAS</h1>
          <button className="custom-button" onClick={() => showSuccess('¡Gracias por registrarte!')}>
            REGISTRATE GRATIS
          </button>
          {successMessage ? <Badge variant="success">{successMessage}</Badge> : null}
          <button className="custom-button" onClick={() => setPageState('error')}>
            Simular error
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
