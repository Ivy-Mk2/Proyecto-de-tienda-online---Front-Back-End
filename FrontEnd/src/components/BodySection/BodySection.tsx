import { Link } from 'react-router-dom';
import { useBodySections } from '../../hooks/useBodySections';
import './BodySection.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');

const buildImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return `${API_BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

const BodySection = () => {
  const { sections, loading, error } = useBodySections();

  if (loading) {
    return (
      <section className="category-container" aria-live="polite">
        <p>Cargando categorías...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="category-container" aria-live="polite">
        <p>No se pudieron cargar las categorías: {error}</p>
      </section>
    );
  }

  if (!sections.length) {
    return (
      <section className="category-container" aria-live="polite">
        <p>No hay categorías disponibles por el momento.</p>
      </section>
    );
  }

  return (
    <section className="category-container" aria-label="Explorar por categoría">
      {sections.map((section) => (
        <Link className="category" key={section.id} to={`/productos?category=${encodeURIComponent(section.category)}`}>
          <div className="img-container">
            <img loading="lazy" src={buildImageUrl(section.imageUrl)} alt={section.title} />
          </div>
          <span>{section.title}</span>
        </Link>
      ))}
    </section>
  );
};

export default BodySection;
