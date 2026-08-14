import axios from 'axios'
import { useAuthStore } from '../store'

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    let clean = envUrl.replace(/\/$/, '')
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean = `${clean}/api`
    }
    return clean
  }
  return '/api'
}

export const API_BASE_URL = getApiBaseUrl()

export const buildApiUrl = (path) => {
  if (!path) return API_BASE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  
  const pathNoLeading = path.replace(/^\//, '')
  const relativePath = pathNoLeading.startsWith('api/')
    ? pathNoLeading.substring(4)
    : pathNoLeading

  return `${API_BASE_URL}/${relativePath}`
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → auto logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api