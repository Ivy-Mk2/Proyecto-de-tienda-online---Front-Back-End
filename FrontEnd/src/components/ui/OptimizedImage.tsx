import type { FC, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  webpSrc?: string;
}

/**
 * Centralized image component to enforce lazy loading, async decoding
 * and a11y-friendly defaults without changing current UI structure.
 */
export const OptimizedImage: FC<OptimizedImageProps> = ({
  webpSrc,
  loading = 'lazy',
  decoding = 'async',
  alt,
  ...props
}) => {
  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img {...props} alt={alt} loading={loading} decoding={decoding} />
      </picture>
    );
  }

  return <img {...props} alt={alt} loading={loading} decoding={decoding} />;
};
