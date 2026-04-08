import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api' })
export default api
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  update: (id, data) => api.put(`/orders/${id}`, data)
}
export const customersAPI = { getAll: (params) => api.get('/customers', { params }) }
export const couponsAPI = {
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  delete: (id) => api.delete(`/coupons/${id}`)
}
export const analyticsAPI = { getSummary: () => api.get('/analytics/summary') }
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
export const flashDealsAPI = {
  getAll: () => api.get('/flash-deals'),
  getAdmin: () => api.get('/flash-deals/admin'),
  create: (data) => api.post('/flash-deals', data),
  update: (id, data) => api.patch(`/flash-deals/${id}`, data),
  delete: (id) => api.delete(`/flash-deals/${id}`)
}
