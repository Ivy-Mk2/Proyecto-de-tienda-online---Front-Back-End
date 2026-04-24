const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined ?? 'http://localhost:4000/api/v1')
  .replace(/\/api\/v\d+\/?$/, '');

export const resolveImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${BASE_URL}${path}`;
};
