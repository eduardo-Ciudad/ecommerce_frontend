import api from './api'

export const categoryService = {
  async getAll() {
    const response = await api.get('/categories')
    return response.data
  },
}
