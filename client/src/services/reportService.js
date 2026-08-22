import api from './api';

const parseBlobError = async (error) => {
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const json = JSON.parse(text);
      return json.message || 'Failed to download monthly report PDF.';
    } catch {
      return 'Failed to download monthly report PDF.';
    }
  }
  return error.response?.data?.message || error.message || 'Failed to download monthly report PDF.';
};

export const getMonthlySummary = async (params = {}) => {
  const response = await api.get('/reports/monthly-summary', { params });
  return response.data;
};

export const getMonthlyInvoices = async (params = {}) => {
  const response = await api.get('/reports/monthly-invoices', { params });
  return response.data;
};

export const getMonthlyProducts = async (params = {}) => {
  const response = await api.get('/reports/monthly-products', { params });
  return response.data;
};

export const downloadMonthlyReportPdf = async (params = {}) => {
  try {
    const response = await api.get('/reports/download-pdf', {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const now = new Date();
    const fallbackName = `Monthly-Sales-Report-${now.toLocaleString('en-IN', { month: 'long' })}-${now.getFullYear()}.pdf`;
    const fileName = match?.[1] || fallbackName;

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, fileName };
  } catch (error) {
    const message = await parseBlobError(error);
    const wrapped = new Error(message);
    wrapped.response = error.response;
    throw wrapped;
  }
};
