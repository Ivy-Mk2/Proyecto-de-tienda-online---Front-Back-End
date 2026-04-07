import { useMemo } from 'react';
import { useBanners } from '../../hooks/useBanners';
import { Banner } from '../../types/api';
import './SpecialBanner.css';
import Marquee from '../Marquee/Marquee';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v\d+$/, '');
const MAX_SPECIAL_BANNERS = 2;

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

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

        return (
          <article className="special-banner__block" key={banner.id}>
            <img
              src={resolveImageUrl(banner.imageUrl)}
              alt={getBannerAlt(banner)}
              className="special-banner__image"
              loading="lazy"
            />

            <Marquee text={bannerLabel} speed={20} className="special-banner__marquee" />
          </article>
        );
      })}
    </section>
  );
};

export default SpecialBanner;
