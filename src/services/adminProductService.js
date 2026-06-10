import api from '@/services/api'

export const adminProductService = {
  getAll: () => api.get('/products').then(r => r.data),
  getById: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`),
  createVariant: (productId, data) => api.post(`/products/${productId}/variants`, data).then(r => r.data),
  updateVariant: (variantId, data) => api.put(`/variants/${variantId}`, data).then(r => r.data),
  deleteVariant: (variantId) => api.delete(`/variants/${variantId}`),
}
