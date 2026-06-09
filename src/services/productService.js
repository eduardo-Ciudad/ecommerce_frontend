import api from './api'

export const productService = {
  async getAll() {
    const response = await api.get('/products')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
}
