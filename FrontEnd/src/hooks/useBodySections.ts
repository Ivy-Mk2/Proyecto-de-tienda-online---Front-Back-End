import { useEffect, useState } from 'react';
import { getApiErrorMessage } from './useApiError';
import { bodySectionsService } from '../services/bodySections.service';
import { BodySection } from '../types/api';

export const useBodySections = () => {
  const [sections, setSections] = useState<BodySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBodySections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bodySectionsService.list();
      setSections(response);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBodySections();
  }, []);

  return { sections, loading, error, reload: loadBodySections };
};
