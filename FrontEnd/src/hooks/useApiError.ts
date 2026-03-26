import { ApiError } from '../types/api';

export const getApiErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return apiError?.message ?? 'Unexpected error';
};
