import api from './api'

export const cartService = {
  async getCart() {
    const response = await api.get('/cart')
    return response.data
  },

  async addItem(variantId, quantity) {
    const response = await api.post('/cart/items', { variantId, quantity })
    return response.data
  },

  async updateItem(itemId, variantId, quantity) {
    const response = await api.put(`/cart/items/${itemId}`, { variantId, quantity })
    return response.data
  },

  async removeItem(itemId) {
    await api.delete(`/cart/items/${itemId}`)
  },
}
