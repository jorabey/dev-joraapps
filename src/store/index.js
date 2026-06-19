import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devAuthAPI } from '../api'
import { translations } from '../i18n'

/* ══ TOAST ═══════════════════════════════ */
export const useToast = create(set => ({
  items: [],
  push: (msg, type = 'success', dur = 3500) => {
    const id = Date.now() + Math.random()
    set(s => ({ items: [...s.items, { id, msg, type }] }))
    setTimeout(() => set(s => ({ items: s.items.filter(t => t.id !== id) })), dur)
  },
  remove: id => set(s => ({ items: s.items.filter(t => t.id !== id) })),
}))

export const toast = {
  ok:      msg => useToast.getState().push(msg, 'success'),
  err:     msg => useToast.getState().push(msg, 'error'),
  info:    msg => useToast.getState().push(msg, 'info'),
  warn:    msg => useToast.getState().push(msg, 'warning'),
}

/* ══ LANG ════════════════════════════════ */
export const useLang = create(
  persist(
    (set, get) => ({
      lang: 'uz',
      setLang: lang => set({ lang }),
      t: key => {
        const l = get().lang
        return translations[l]?.[key] || translations['en']?.[key] || key
      },
    }),
    { name: 'jn-lang', partialize: s => ({ lang: s.lang }) }
  )
)

/* ══ AUTH ════════════════════════════════ */
export const useAuth = create(
  persist(
    (set) => ({
      dev: null,
      ready: false,

      init: async () => {
        const token = localStorage.getItem('jn_dev_tok')
        if (!token) { set({ ready: true }); return }
        try {
          const { data } = await devAuthAPI.refresh()
          localStorage.setItem('jn_dev_tok', data.accessToken)
          set({ ready: true })
        } catch {
          localStorage.removeItem('jn_dev_tok')
          set({ dev: null, ready: true })
        }
      },

      register: async (body) => {
        try {
          await devAuthAPI.register(body)
          return { ok: true }
        } catch (e) {
          return { ok: false, msg: e.response?.data?.message || 'Xatolik' }
        }
      },

      login: async (email, password) => {
        try {
          const { data } = await devAuthAPI.login(email, password)
          localStorage.setItem('jn_dev_tok', data.accessToken)
          set({ dev: data.developer })
          return { ok: true }
        } catch (e) {
          const msg  = e.response?.data?.message || ''
          const code = e.response?.status
          // Detect pending / suspended from server message
          if (msg.toLowerCase().includes('tasdiq') || msg.toLowerCase().includes('pending') || code === 403)
            return { ok: false, status: 'pending', msg }
          if (msg.toLowerCase().includes('blok') || msg.toLowerCase().includes('suspend'))
            return { ok: false, status: 'suspended', msg }
          return { ok: false, msg: msg || 'Email yoki parol xato' }
        }
      },

      logout: async () => {
        try { await devAuthAPI.logout() } catch {}
        localStorage.removeItem('jn_dev_tok')
        set({ dev: null })
      },

      setDev: dev => set({ dev }),
    }),
    { name: 'jn-dev-auth', partialize: s => ({ dev: s.dev }) }
  )
)
