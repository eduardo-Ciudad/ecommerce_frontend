import api from '@/services/api'

export const adminCategoryService = {
  getAll: () => api.get('/categories').then(r => r.data),
  create: (data) => api.post('/categories', data).then(r => r.data),
  delete: (id) => api.delete(`/categories/${id}`),
}
