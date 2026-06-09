import api from './api'

export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}
