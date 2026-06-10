import api from '@/services/api'

export const adminOrderService = {
  getAll: () => api.get('/orders').then(r => r.data),
  getById: (id) => api.get(`/orders/${id}`).then(r => r.data),
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.data),
}
