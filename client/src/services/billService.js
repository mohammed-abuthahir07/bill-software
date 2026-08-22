import api from './api';

/**
 * Create a new bill/invoice.
 * POST /api/billing/create
 *
 * Expected payload:
 * {
 *   customerName: string,
 *   customerEmail: string,
 *   products: [{ productId: number, quantity: number }],
 *   discount: number,   // percentage 0-100
 *   tax: number         // percentage 0-100
 * }
 *
 * The backend validates stock availability (MySQL) and returns an error
 * if any item's quantity exceeds available stock.
 * On success, the backend generates a PDF and may return a pdfUrl.
 */
export const createBill = async (billData) => {
  const response = await api.post('/billing/create', billData);
  return response.data;
};

/**
 * Fetch paginated bills for the current user.
 * GET /api/bills?page=1&limit=10
 */
export const getBills = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get('/bills', {
    params: { page, limit },
  });
  return response.data;
};
