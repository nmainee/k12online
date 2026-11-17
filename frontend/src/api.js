// Lớp kết nối tới API PHP/MySQL (backend/api) và bảng ánh xạ giữa dữ liệu giao diện với cột của CSDL `okr`.
// Giao diện chỉ làm việc với dạng "UI" (id, name, owner...). Bảng ánh xạ dưới đây đổi qua lại từng dòng.

const BASE = (import.meta.env?.BASE_URL ?? '/') + 'api/index.php'

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
/** Không gọi được API (chưa chạy PHP, đang ở máy dev không có backend...). Giao diện chuyển sang dữ liệu mẫu. */
export class OfflineError extends Error {}

async function call(method, path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'okr' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new OfflineError('Không kết nối được máy chủ')
  }
  const type = res.headers.get('content-type') || ''
  if (!type.includes('application/json')) throw new OfflineError('Máy chủ không trả JSON')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error || 'Yêu cầu không thành công')
  return data
}

export const api = {
  me: () => call('GET', '/me'),
  login: (username, password) => call('POST', '/login', { username, password }),
  logout: () => call('POST', '/logout', {}),
  bootstrap: () => call('GET', '/bootstrap'),
  create: (table, row) => call('POST', `/${table}`, row),
  update: (table, id, row) => call('PUT', `/${table}/${id}`, row),
  remove: (table, id) => call('DELETE', `/${table}/${id}`),
}

const n = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v))
const s = (v) => (v === null || v === undefined ? '' : String(v))
const day = (v) => s(v).slice(0, 10)
const dt = (v) => s(v).replace(' ', 'T').slice(0, 16)
const sqlDt = (v) => (v ? `${s(v).replace('T', ' ').slice(0, 16)}:00` : null)
/** Bảng store không có cột số lượng nên quà luôn "còn hàng"; giao diện coi giá trị này là không giới hạn. */
export const UNLIMITED = 9999
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

/** Ánh xạ: khóa là tên tập dữ liệu trong giao diện. `table` và `pk` là bảng và khóa chính trong CSDL. */
export const MAP = {
  departments: {
    table: 'departments', pk: 'department_id', readonly: true,
    toUi: (r) => ({ id: n(r.department_id), name: r.department_name }),
    toDb: (d) => ({ department_id: d.id, department_name: d.name }),
  },
  users: {
    table: 'users', pk: 'user_id',
    toUi: (r) => ({
      id: n(r.user_id), username: r.username, fullname: r.fullname, role: r.role, department_id: n(r.department_id),
      superior: n(r.superior) === n(r.user_id) ? null : n(r.superior), points: n(r.points), email: r.email,
      phone: s(r.phone_number), gender: r.gender, birth: day(r.date_birth), active: r.status !== 'LOCK',
      title: '', avatar: r.avatar || null,
    }),
    toDb: (u) => {
      const birth = u.birth || '2000-01-01'
      return {
        user_id: u.id, username: u.username, fullname: u.fullname, role: u.role, department_id: u.department_id,
        superior: u.superior ?? u.id, points: u.points ?? 0, email: u.email, phone_number: u.phone || '', gender: u.gender || 'Nam',
        date_birth: birth, month_birth: birth, year_birth: Number(birth.slice(0, 4)), avatar: u.avatar || null,
        status: u.active === false ? 'LOCK' : 'ACTIVE',
      }
    },
  },
  okrs: {
    table: 'okrs', pk: 'okr_id',
    toUi: (r) => {
      let krs
      try { krs = JSON.parse(r.key_results).krs } catch { krs = null }
      if (!Array.isArray(krs)) krs = [{ id: n(r.okr_id) * 10 + 1, text: s(r.key_results), target: n(r.target), current: 0, unit: s(r.unit) }]
      return {
        id: n(r.okr_id), level: r.type, owner: n(r.user_id), department_id: n(r.department_id), cycle: r.cycle,
        parent: r.o_relevant ? n(r.o_relevant) : null, visibility: n(r.display) === 1 ? 'public' : 'private', status: r.status,
        objective: r.objective, krs,
      }
    },
    toDb: (o) => ({
      okr_id: o.id, user_id: o.owner, department_id: o.department_id, type: o.level, cycle: o.cycle,
      o_relevant: o.parent ? String(o.parent) : '', objective: o.objective, key_results: JSON.stringify({ krs: o.krs }),
      target: Math.round(n(o.krs?.[0]?.target)), unit: s(o.krs?.[0]?.unit), link_plans: '', link_results: '', kr_relevant: '', o_cross: '',
      display: o.visibility === 'private' ? 0 : 1, status: o.status,
    }),
  },
  todos: {
    table: 'todaylist', pk: 'task_id',
    toUi: (r) => ({
      id: n(r.task_id), user_id: n(r.user_id), okr_id: n(r.okr_id), name: r.task_name, description: s(r.description), status: r.status,
      priority: r.priority, deadline: dt(r.deadline), estimate: n(r.estimate_time), comments: s(r.comments), created: s(r.created_at),
    }),
    toDb: (t, ctx) => ({
      task_id: t.id, user_id: t.user_id, department_id: ctx.userById(t.user_id)?.department_id ?? 1, okr_id: t.okr_id, task_name: t.name,
      description: t.description || '', status: t.status, priority: t.priority, created_at: t.created || now(), deadline: sqlDt(t.deadline) || now(),
      estimate_time: t.estimate ?? 0, attachments: '', comments: t.comments || '',
    }),
  },
  checkins: {
    table: 'checkinform', pk: 'checkin_id',
    toUi: (r) => ({
      id: n(r.checkin_id), okr_id: n(r.okr_id), user_id: n(r.user_id), date: day(r.checkin_date), percent: n(r.progress_percent),
      confidence: n(r.confidence_level), status: r.status, summary: s(r.work_summary), slow: s(r.slow_tasks), obstacles: s(r.obstacles), solutions: s(r.solutions),
    }),
    toDb: (c) => ({
      checkin_id: c.id, okr_id: c.okr_id, user_id: c.user_id, checkin_date: c.date, progress_value: c.percent ?? 0, progress_percent: c.percent ?? 0,
      confidence_level: c.confidence ?? 3, status: c.status, work_summary: c.summary || '', slow_tasks: c.slow || '', obstacles: c.obstacles || '', solutions: c.solutions || '',
    }),
  },
  reviews: {
    table: 'checkinreview', pk: 'review_id',
    toUi: (r) => ({
      id: n(r.review_id), checkin_id: n(r.checkin_id), okr_id: n(r.okr_id), reviewer: n(r.user_id), score: null,
      team_comment: s(r.team_comment), personal_comment: s(r.personal_comment), summary: s(r.summary_comment),
    }),
    toDb: (v) => ({
      review_id: v.id, checkin_id: v.checkin_id, okr_id: v.okr_id, user_id: v.reviewer, checkin_status: 'checked',
      team_comment: v.team_comment || '', personal_comment: v.personal_comment || '', summary_comment: v.summary || '',
    }),
  },
  conversations: {
    table: 'conversation', pk: 'conversation_id',
    toUi: (r) => ({
      id: n(r.conversation_id), manager: n(r.manager_id), participant: n(r.participant_id), week: n(r.week_id), topic: s(r.topic),
      content: s(r.content), action: s(r.action), trust: n(r.trust_score), date: day(r.conversation_date),
    }),
    toDb: (c) => ({
      conversation_id: c.id, manager_id: c.manager, participant_id: c.participant, week_id: c.week, topic: c.topic || '',
      content: c.content || '', action: c.action || '', trust_score: c.trust ?? null, conversation_date: c.date || day(now()),
    }),
  },
  feedbacks: {
    table: 'feedback', pk: 'feedback_id',
    toUi: (r) => ({
      id: n(r.feedback_id), sender: n(r.sender_id), receiver: n(r.receiver_id), week: n(r.week_id), type: s(r.type), content: s(r.content),
      evidence: s(r.evidence), impact: s(r.level_impact), points: s(r.type) === 'praise' ? 5 : 2, date: day(r.feedback_date),
    }),
    toDb: (f) => ({
      feedback_id: f.id, sender_id: f.sender, receiver_id: f.receiver, week_id: f.week, type: f.type, content: f.content || '',
      evidence: f.evidence || '', level_impact: f.impact || '', feedback_date: f.date || day(now()),
    }),
  },
  recognitions: {
    table: 'recognition', pk: 'recognition_id',
    toUi: (r) => ({
      id: n(r.recognition_id), sender: n(r.sender_id), receiver: n(r.receiver_id), week: n(r.week_id), reason: s(r.reason),
      evidence: s(r.evidence), points: n(r.bonus_points), date: day(r.recognition_date),
    }),
    toDb: (g) => ({
      recognition_id: g.id, sender_id: g.sender, receiver_id: g.receiver, week_id: g.week, reason: g.reason || '', evidence: g.evidence || '',
      bonus_points: g.points ?? 0, recognition_date: g.date || day(now()),
    }),
  },
  gifts: {
    table: 'store', pk: 'store_id',
    toUi: (r) => ({ id: n(r.store_id), name: r.gift_name, points: n(r.gift_points), stock: UNLIMITED, description: s(r.gift_description) }),
    toDb: (g) => ({ store_id: g.id, gift_name: g.name, gift_points: g.points, gift_description: g.description || '' }),
  },
  redeems: {
    table: 'redeem', pk: 'redeem_id',
    toUi: (r) => ({ id: n(r.redeem_id), user_id: n(r.user_id), gift_id: n(r.store_id), quantity: n(r.quantity), points: n(r.points_used), date: day(r.redeem_date) }),
    toDb: (d) => ({ redeem_id: d.id, user_id: d.user_id, store_id: d.gift_id, quantity: d.quantity, points_used: d.points, redeem_date: `${day(d.date) || day(now())} 00:00:00` }),
  },
  activityLog: {
    table: 'activity_log', pk: 'log_id', readonly: true,
    toUi: (r) => {
      const d = new Date(s(r.log_time).replace(' ', 'T'))
      const p = (x) => String(x).padStart(2, '0')
      return { id: n(r.log_id), time: Number.isNaN(d.getTime()) ? s(r.log_time) : `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`, user: s(r.user_name), action: s(r.action) }
    },
    toDb: (l) => ({ log_id: l.id, log_time: now(), user_name: l.user, action: l.action }),
  },
}

/** Tên bảng trong CSDL → khóa trong giao diện, dùng khi đọc dữ liệu khởi tạo. */
export const TABLE_TO_KEY = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v.table, k]))
