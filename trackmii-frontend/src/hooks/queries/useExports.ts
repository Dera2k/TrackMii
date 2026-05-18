import { useMutation } from '@tanstack/react-query';
import { getToken, clearToken } from '@/lib/auth';

export const useExportCsv = () => {
  return useMutation({
    mutationFn: async (params: {
      category_id?: string;
      payment_method?: string;
      start_date?: string;
      end_date?: string;
      min_amount?: number;
      max_amount?: number;
    } = {}) => {

      //build query string
      const query = new URLSearchParams();
      if (params?.category_id) query.append('category_id', params.category_id);
      if (params?.payment_method) query.append('payment_method', params.payment_method);
      if (params?.start_date) query.append('start_date', params.start_date);
      if (params?.end_date) query.append('end_date', params.end_date);
      if (params?.min_amount !== undefined) query.append('min_amount', params.min_amount.toString());
      if (params?.max_amount !== undefined) query.append('max_amount', params.max_amount.toString());

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const token = getToken();
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export/csv${queryString}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();

      //trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
  });
};