import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBanners } from '../../hooks/useBanners';
import './Banner.css';

const AUTO_ROTATE_MS = 5000;
const API_URL = 'http://localhost:4000';

type SlideDirection = 'next' | 'prev';

const Banner = () => {
  const { banners, loading, error, reload } = useBanners();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<SlideDirection>('next');
  const [rotationSeed, setRotationSeed] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(null);
    setDirection('next');
    setRotationSeed((seed) => seed + 1);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setDirection('next');
      setPreviousIndex(activeIndex);
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(interval);
  }, [activeIndex, banners.length, rotationSeed]);

  const resetAutoRotate = () => {
    setRotationSeed((seed) => seed + 1);
  };

  const goToIndex = (nextIndex: number, nextDirection: SlideDirection) => {
    if (!banners.length) return;

    const normalizedIndex = ((nextIndex % banners.length) + banners.length) % banners.length;

    if (normalizedIndex === activeIndex) {
      resetAutoRotate();
      return;
    }

    setDirection(nextDirection);
    setPreviousIndex(activeIndex);
    setActiveIndex(normalizedIndex);
    resetAutoRotate();
  };

  const handleNext = () => {
    goToIndex(activeIndex + 1, 'next');
  };

  const handlePrev = () => {
    goToIndex(activeIndex - 1, 'prev');
  };

  const handleSelectorClick = (index: number) => {
    const nextDirection: SlideDirection = index > activeIndex ? 'next' : 'prev';
    goToIndex(index, nextDirection);
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
                onClick={() => handleSelectorClick(index)}
              ></i>
            ))}
          </div>
        </>
      ) : null}

      <div className="banner_images">
        <div className="gradient-overlay"></div>
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          const isPrevious = index === previousIndex;

          const imageClass = isActive
            ? `banner__image active ${direction === 'next' ? 'from-right' : 'from-left'}`
            : isPrevious
              ? `banner__image exit ${direction === 'next' ? 'to-left' : 'to-right'}`
              : 'banner__image';

          return <img key={banner.id} src={`${API_URL}${banner.imageUrl}`} alt={banner.title} className={imageClass} />;
        })}
      </div>
    </section>
  );
};

export default Banner;
