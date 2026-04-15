import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api' })

// Request Interceptor: Attach Supabase Token
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (e) {
    console.error('Session Token Error:', e)
  }
  return config
})

// Response Interceptor: Error Logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('📡 API Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      })
    }
    return Promise.reject(error)
  }
)

export default api

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
}

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
}

export const cartAPI = {
  get: (userId) => {
    if (!userId) return Promise.reject('User ID missing')
    return api.get(`/cart/${userId}`)
  },
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  remove: (productId) => api.delete('/cart/remove', { data: { productId } })
}

export const wishlistAPI = {
  get: (userId) => {
    if (!userId) return Promise.reject('User ID missing')
    return api.get(`/wishlist/${userId}`)
  },
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete('/wishlist/remove', { data: { productId } })
}

export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
}

export const flashDealsAPI = {
  getAll: () => api.get('/flash-deals'),
}

export const customersAPI = {
  getProfile: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
}

export const authAPI = {
  logEvent: (action, metadata = {}) => api.post('/auth/log', { action, metadata })
}

export const couponsAPI = {
  validate: (data) => api.post('/coupons/validate', data)
}

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  recognizeImage: (data) => api.post('/ai/recognize-image', data)
}
