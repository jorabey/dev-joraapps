import axios from 'axios'

const BASE = 'https://api-joraapps.vercel.app/api/v1/developer'
const api  = axios.create({ baseURL: BASE, withCredentials: true, timeout: 20000 })

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('jn_dev_tok')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

let refreshing = false, queue = []
const flush = (err, tok) => { queue.forEach(p => err ? p.reject(err) : p.resolve(tok)); queue = [] }

api.interceptors.response.use(r => r, async err => {
  const orig = err.config
  if (err.response?.status !== 401 || orig._retry) return Promise.reject(err)
  if (refreshing) return new Promise((res, rej) => queue.push({ resolve: res, reject: rej }))
    .then(tok => { orig.headers.Authorization = `Bearer ${tok}`; return api(orig) })
  orig._retry = true; refreshing = true
  try {
    const { data } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
    localStorage.setItem('jn_dev_tok', data.accessToken)
    flush(null, data.accessToken)
    orig.headers.Authorization = `Bearer ${data.accessToken}`
    return api(orig)
  } catch (e) {
    flush(e, null)
    localStorage.removeItem('jn_dev_tok')
    const currentPath = location.pathname;
    if (!currentPath == "/login"){
      window.location.replace('/login')
    }
    return Promise.reject(err)
  } finally { refreshing = false }
})

export const devAuthAPI = {
  register: b  => api.post('/auth/register', b),
  login:    (email, password) => api.post('/auth/login', { email, password }),
  refresh:  () => api.post('/auth/refresh'),
  logout:   () => api.post('/auth/logout'),
}

export const devAppsAPI = {
  create:  b        => api.post('/my-apps', b),
  getAll:  (params) => api.get('/my-apps', { params }),
  update:  (id, b)  => api.patch(`/my-apps/${id}`, b),
  delete:  id       => api.delete(`/my-apps/${id}`),
}

export const devAnalyticsAPI = {
  overview:  ()      => api.get('/analytics/overview'),
  appDetail: appId   => api.get(`/analytics/${appId}`),
}

export const devKeysAPI = {
  get:    appId => api.get(`/api-keys/${appId}`),
  regen:  appId => api.post(`/api-keys/${appId}/regenerate`),
}

export default api
