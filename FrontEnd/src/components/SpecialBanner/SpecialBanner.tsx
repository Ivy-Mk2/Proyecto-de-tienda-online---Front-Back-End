import { useMemo } from 'react';
import { useBanners } from '../../hooks/useBanners';
import { Banner } from '../../types/api';
import { resolveImageUrl } from '../../lib/api/imageUrl';
import './SpecialBanner.css';

const MAX_SPECIAL_BANNERS = 2;
const MARQUEE_REPETITIONS = 8;

const getBannerLabel = (banner: Banner) => (banner.label ?? banner.title).trim();

const getBannerAlt = (banner: Banner) => banner.altText?.trim() || banner.title;

const getBannerOrder = (banner: Banner) => banner.order ?? banner.orderIndex;

const SpecialBanner = () => {
  const { banners, loading, error } = useBanners();

  const specialBanners = useMemo(
    () =>
      banners
        .filter((banner) => banner.isActive)
        .sort((a, b) => getBannerOrder(a) - getBannerOrder(b))
        .slice(0, MAX_SPECIAL_BANNERS),
    [banners],
  );

  if (loading || error || !specialBanners.length) {
    return null;
  }

  return (
    <section className="special-banner" aria-label="Banners especiales">
      {specialBanners.map((banner) => {
        const bannerLabel = getBannerLabel(banner);

        const repeatedText = Array.from({ length: MARQUEE_REPETITIONS }, (_, index) => (
          <span key={`${banner.id}-marquee-${index}`} className="special-banner__marquee-item" aria-hidden="true">
            {bannerLabel}
          </span>
        ));

        return (
          <article className="special-banner__block" key={banner.id}>
            <img
              src={resolveImageUrl(banner.imageUrl)}
              alt={getBannerAlt(banner)}
              className="special-banner__image"
              loading="lazy"
            />

            <div className="special-banner__marquee" role="presentation">
              <div className="special-banner__track">{repeatedText}</div>
              <div className="special-banner__track">{repeatedText}</div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default SpecialBanner;
