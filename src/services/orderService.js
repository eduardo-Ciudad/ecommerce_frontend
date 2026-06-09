import api from './api'

export const orderService = {
  async createOrder() {
    const response = await api.post('/orders')
    return response.data
  },

  async getOrders() {
    const response = await api.get('/orders')
    return response.data
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
}
