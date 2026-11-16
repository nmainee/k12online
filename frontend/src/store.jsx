import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import * as seed from './data/mock.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function krPercent(kr) {
  if (kr.lowerIsBetter) {
    if (kr.current <= kr.target) return 100
    return Math.max(0, Math.round((kr.target / kr.current) * 100))
  }
  if (!kr.target) return 0
  return Math.min(100, Math.round((kr.current / kr.target) * 100))
}

export function okrPercent(okr) {
  if (!okr.krs.length) return 0
  return Math.round(okr.krs.reduce((s, k) => s + krPercent(k), 0) / okr.krs.length)
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

let nextId = 1000

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(() => {
    try { return Number(sessionStorage.getItem('okr-user')) || null } catch { return null }
  })
  const [users, setUsers] = useState(seed.users)
  const [okrs, setOkrs] = useState(seed.okrs)
  const [todos, setTodos] = useState(seed.todos)
  const [checkins, setCheckins] = useState(seed.checkins)
  const [reviews, setReviews] = useState(seed.reviews)
  const [conversations, setConversations] = useState(seed.conversations)
  const [feedbacks, setFeedbacks] = useState(seed.feedbacks)
  const [recognitions, setRecognitions] = useState(seed.recognitions)
  const [gifts, setGifts] = useState(seed.gifts)
  const [redeems, setRedeems] = useState(seed.redeems)
  const [toast, setToast] = useState(null)
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  /** Hộp xác nhận riêng: ask({ title, body, items, confirmLabel, danger }) → Promise<boolean> */
  const ask = useCallback((opts) => new Promise((resolve) => {
    resolver.current = resolve
    setDialog(opts)
  }), [])
  const answer = (ok) => { resolver.current?.(ok); resolver.current = null; setDialog(null) }

  const notify = useCallback((message, tone = 'ok', action = null) => {
    setToast({ message, tone, action, key: ++nextId })
    setTimeout(() => setToast((t) => (t && t.message === message ? null : t)), action ? 6000 : 3200)
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  const me = users.find((u) => u.id === userId) || null

  const login = (id) => {
    setUserId(id)
    try { sessionStorage.setItem('okr-user', String(id)) } catch { /* bỏ qua */ }
  }
  const logout = () => {
    setUserId(null)
    try { sessionStorage.removeItem('okr-user') } catch { /* bỏ qua */ }
  }

  const userById = useCallback((id) => users.find((u) => u.id === id), [users])
  const deptName = useCallback((id) => seed.departments.find((d) => d.id === id)?.name ?? '', [])

  const value = useMemo(() => ({
    me, login, logout, users, setUsers, userById, deptName,
    okrs, setOkrs, todos, setTodos, checkins, setCheckins, reviews, setReviews,
    conversations, setConversations, feedbacks, setFeedbacks,
    recognitions, setRecognitions, gifts, setGifts, redeems, setRedeems,
    toast, notify, closeToast, dialog, answer, ask, newId: () => ++nextId,
    departments: seed.departments,
  }), [me, users, okrs, todos, checkins, reviews, conversations, feedbacks, recognitions, gifts, redeems, toast, dialog, userById, deptName, notify, ask, closeToast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
