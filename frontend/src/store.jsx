import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as seed from './data/mock.js'
import { api, MAP, OfflineError, TABLE_TO_KEY } from './api.js'

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

let toastKey = 0
// Mã bản ghi mới do giao diện tự sinh (tăng theo thời gian) rồi ghi nguyên vào CSDL. Giữ dưới giới hạn int(11).
let idSeq = 0
function makeId() {
  idSeq = (idSeq + 1) % 10
  return (Math.floor(Date.now() / 1000) - 1_790_000_000) * 10 + idSeq + 100_000
}

/**
 * Tập dữ liệu có đồng bộ: mọi lần gọi setX đều được so sánh với bản trước, rồi gửi thêm/sửa/xóa
 * tương ứng lên API (khi đang nối CSDL). Nhờ vậy các màn hình không cần biết có CSDL hay không.
 */
function useSynced(key, initial, envRef) {
  const [state, setState] = useState(initial)
  const ref = useRef(initial)
  const set = useCallback((upd) => {
    const prev = ref.current
    const next = typeof upd === 'function' ? upd(prev) : upd
    ref.current = next
    setState(next)
    envRef.current.sync(key, prev, next)
  }, [key, envRef])
  const replace = useCallback((list) => { ref.current = list; setState(list) }, [])
  return [state, set, replace]
}

export function AppProvider({ children }) {
  const envRef = useRef({ online: null, sync: () => {}, userById: () => undefined, onError: () => {} })
  const [ready, setReady] = useState(false)
  const [online, setOnlineState] = useState(null)
  const [userId, setUserId] = useState(null)

  const [users, setUsers, replaceUsers] = useSynced('users', seed.users, envRef)
  const [okrs, setOkrs, replaceOkrs] = useSynced('okrs', seed.okrs, envRef)
  const [todos, setTodos, replaceTodos] = useSynced('todos', seed.todos, envRef)
  const [checkins, setCheckins, replaceCheckins] = useSynced('checkins', seed.checkins, envRef)
  const [reviews, setReviews, replaceReviews] = useSynced('reviews', seed.reviews, envRef)
  const [conversations, setConversations, replaceConversations] = useSynced('conversations', seed.conversations, envRef)
  const [feedbacks, setFeedbacks, replaceFeedbacks] = useSynced('feedbacks', seed.feedbacks, envRef)
  const [recognitions, setRecognitions, replaceRecognitions] = useSynced('recognitions', seed.recognitions, envRef)
  const [gifts, setGifts, replaceGifts] = useSynced('gifts', seed.gifts, envRef)
  const [redeems, setRedeems, replaceRedeems] = useSynced('redeems', seed.redeems, envRef)
  const [departments, setDepartments] = useState(seed.departments)
  const [activityLog, setActivityLog] = useState(seed.activityLog)
  const [toast, setToast] = useState(null)
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const replacers = {
    users: replaceUsers, okrs: replaceOkrs, todos: replaceTodos, checkins: replaceCheckins, reviews: replaceReviews,
    conversations: replaceConversations, feedbacks: replaceFeedbacks, recognitions: replaceRecognitions, gifts: replaceGifts, redeems: replaceRedeems,
    departments: setDepartments, activityLog: setActivityLog,
  }
  const replacersRef = useRef(replacers)
  replacersRef.current = replacers

  /** Hộp xác nhận riêng: ask({ title, body, items, confirmLabel, danger }) → Promise<boolean> */
  const ask = useCallback((opts) => new Promise((resolve) => {
    resolver.current = resolve
    setDialog(opts)
  }), [])
  const answer = (ok) => { resolver.current?.(ok); resolver.current = null; setDialog(null) }

  const notify = useCallback((message, tone = 'ok', action = null) => {
    setToast({ message, tone, action, key: ++toastKey })
    setTimeout(() => setToast((t) => (t && t.message === message ? null : t)), action ? 6000 : 3200)
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  const setOnline = (v) => { envRef.current.online = v; setOnlineState(v) }

  /** Nạp dữ liệu từ CSDL vào giao diện. */
  const applyTables = useCallback((tables) => {
    Object.entries(tables).forEach(([table, rows]) => {
      const key = TABLE_TO_KEY[table]
      if (key) replacersRef.current[key](rows.map(MAP[key].toUi))
    })
  }, [])
  const clearTables = useCallback(() => {
    Object.keys(MAP).forEach((key) => replacersRef.current[key]([]))
  }, [])

  // Gửi thay đổi lên API theo đúng thứ tự thao tác.
  const queue = useRef(Promise.resolve())
  envRef.current.userById = (id) => users.find((u) => u.id === id)
  envRef.current.sync = (key, prev, next) => {
    const env = envRef.current
    const m = MAP[key]
    if (!env.online || !m || m.readonly) return
    const ctx = { userById: (id) => env.userById(id) }
    const before = new Map(prev.map((x) => [x.id, x]))
    const kept = new Set()
    const jobs = []
    next.forEach((item) => {
      kept.add(item.id)
      const old = before.get(item.id)
      if (!old) jobs.push(() => api.create(m.table, m.toDb(item, ctx)))
      else if (old !== item && JSON.stringify(old) !== JSON.stringify(item)) jobs.push(() => api.update(m.table, item.id, m.toDb(item, ctx)))
    })
    prev.forEach((old) => { if (!kept.has(old.id)) jobs.push(() => api.remove(m.table, old.id)) })
    jobs.forEach((job) => { queue.current = queue.current.then(job).catch((err) => env.onError(err)) })
  }

  const logoutLocal = useCallback(() => {
    setUserId(null)
    try { sessionStorage.removeItem('okr-user') } catch { /* bỏ qua */ }
    if (envRef.current.online) clearTables()
  }, [clearTables])

  envRef.current.onError = (err) => {
    if (err instanceof OfflineError) notify('Mất kết nối máy chủ nên thay đổi gần nhất chưa được lưu. Tải lại trang sau khi máy chủ chạy.', 'danger')
    else if (err.status === 401) { notify('Phiên đăng nhập đã hết. Hãy đăng nhập lại.', 'danger'); logoutLocal() }
    else notify(err.message || 'Chưa lưu được thay đổi.', 'danger')
  }

  // Khi mở trang: hỏi máy chủ xem còn phiên đăng nhập không. Không có máy chủ thì chạy bằng dữ liệu mẫu.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { user } = await api.me()
        const boot = await api.bootstrap()
        if (!alive) return
        setOnline(true)
        applyTables(boot.tables)
        setUserId(Number(user.user_id))
      } catch (e) {
        if (!alive) return
        if (e instanceof OfflineError) {
          setOnline(false)
          try { setUserId(Number(sessionStorage.getItem('okr-user')) || null) } catch { /* bỏ qua */ }
        } else {
          setOnline(true) // có máy chủ nhưng chưa đăng nhập
        }
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => { alive = false }
  }, [applyTables])

  const me = users.find((u) => u.id === userId) || null

  /** Đăng nhập bằng CSDL; nếu chưa có máy chủ thì dùng tài khoản mẫu (mật khẩu bất kỳ từ 4 ký tự). */
  const signIn = async (username, password) => {
    if (envRef.current.online !== false) {
      try {
        const { user } = await api.login(username, password)
        const boot = await api.bootstrap()
        setOnline(true)
        applyTables(boot.tables)
        setUserId(Number(user.user_id))
        return { ok: true }
      } catch (e) {
        if (!(e instanceof OfflineError)) return { ok: false, error: e.message }
        setOnline(false)
      }
    }
    const u = seed.users.find((x) => x.username === username.trim())
    if (!u || password.length < 4) return { ok: false, error: 'Tên đăng nhập hoặc mật khẩu chưa đúng. Kiểm tra lại hoặc liên hệ giám đốc để được cấp tài khoản.' }
    if (!u.active) return { ok: false, error: 'Tài khoản này đang bị khóa. Liên hệ giám đốc để mở lại.' }
    setUserId(u.id)
    try { sessionStorage.setItem('okr-user', String(u.id)) } catch { /* bỏ qua */ }
    return { ok: true }
  }
  const logout = () => {
    if (envRef.current.online) api.logout().catch(() => {})
    logoutLocal()
  }

  const userById = useCallback((id) => users.find((u) => u.id === id), [users])
  const deptName = useCallback((id) => departments.find((d) => d.id === id)?.name ?? '', [departments])

  const value = useMemo(() => ({
    me, signIn, logout, online, users, setUsers, userById, deptName,
    okrs, setOkrs, todos, setTodos, checkins, setCheckins, reviews, setReviews,
    conversations, setConversations, feedbacks, setFeedbacks,
    recognitions, setRecognitions, gifts, setGifts, redeems, setRedeems,
    toast, notify, closeToast, dialog, answer, ask, newId: makeId,
    departments, activityLog,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [me, online, users, okrs, todos, checkins, reviews, conversations, feedbacks, recognitions, gifts, redeems, departments, activityLog, toast, dialog, userById, deptName, notify, ask, closeToast])

  if (!ready) return <div className="boot" role="status">Đang tải dữ liệu…</div>
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
