import { useMutation } from '@tanstack/react-query';
import { getToken, clearToken } from '@/lib/auth';
import { toast } from 'sonner';

export const useExportXlsx = () => {
  return useMutation({
    mutationFn: async (params: {
      preset?: string;
      start_date?: string;
      end_date?: string;
      sections?: string[];
    } = {}) => {
      const query = new URLSearchParams();
      if (params?.preset) query.append('preset', params.preset);
      if (params?.start_date) query.append('start_date', params.start_date);
      if (params?.end_date) query.append('end_date', params.end_date);
      if (params?.sections?.length) {
        params.sections.forEach(s => query.append('sections', s));
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const token = getToken();
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export/xlsx${queryString}`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          window.location.href = '/login';
        }
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export downloaded');
    },
    onError: () => {
      toast.error('Export failed');
    },
  });
};