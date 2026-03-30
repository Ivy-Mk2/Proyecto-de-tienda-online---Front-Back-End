import { useEffect, useState } from 'react';
import { getApiErrorMessage } from './useApiError';
import { bannersService } from '../services/banners.service';
import { Banner } from '../types/api';

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bannersService.list();
      setBanners(response.filter((banner) => banner.isActive));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  return { banners, loading, error, reload: loadBanners };
};
