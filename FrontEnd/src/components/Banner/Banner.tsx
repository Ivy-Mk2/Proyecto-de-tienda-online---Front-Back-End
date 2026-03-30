import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBanners } from '../../hooks/useBanners';
import './Banner.css';

const AUTO_ROTATE_MS = 5000;
const API_URL = "http://localhost:4000";

const Banner = () => {
  const { banners, loading, error, reload } = useBanners();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNext = () => {
    if (!banners.length) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handlePrev = () => {
    if (!banners.length) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <section className="banner banner--status">
        <p className="banner__status">Cargando banners...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="banner banner--status">
        <p className="banner__status">No se pudieron cargar los banners: {error}</p>
        <button className="banner__retry" onClick={() => void reload()}>
          Reintentar
        </button>
      </section>
    );
  }

  if (!banners.length) {
    return (
      <section className="banner banner--status">
        <p className="banner__status">No hay banners activos disponibles.</p>
      </section>
    );
  }

  return (
    <section className="banner">
      <div className="banner__content">
        <h2 className="banner__title">{banners[activeIndex].title}</h2>
        {banners[activeIndex].subtitle ? (
          <p className="banner__description">{banners[activeIndex].subtitle}</p>
        ) : null}
        {banners[activeIndex].ctaText ? (
          <Link to={banners[activeIndex].ctaLink || '/productos'} className="banner__link">
            {banners[activeIndex].ctaText}
          </Link>
        ) : null}
      </div>

      {banners.length > 1 ? (
        <>
          <div className="banner__arrows">
            <i className="banner__arrow-left fa-solid fa-arrow-left" onClick={handlePrev}></i>
            <i className="banner__arrow-right fa-solid fa-arrow-right" onClick={handleNext}></i>
          </div>

          <div className="banner__selector">
            {banners.map((banner, index) => (
              <i
                key={banner.id}
                className={`fa-circle ${activeIndex === index ? 'fa-solid' : 'fa-regular'}`}
                onClick={() => setActiveIndex(index)}
              ></i>
            ))}
          </div>
        </>
      ) : null}

      <div className="banner_images">
        <div className="gradient-overlay"></div>
        {banners.map((banner, index) => (
          <img
            key={banner.id}
            src={`${API_URL}${banner.imageUrl}`}
            alt={banner.title}
            className={`banner__image ${
              index === activeIndex
                ? 'active'
                : index === (activeIndex === 0 ? banners.length - 1 : activeIndex - 1)
                  ? 'previous'
                  : ''
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;
