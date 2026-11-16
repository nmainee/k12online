import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp, formatDateTime } from '../store.jsx'
import { priorityLabel, statusMap } from '../data/mock.js'
import { Badge, Empty, PageHead } from '../components/ui.jsx'
import { QuickAdd, TodoStep } from '../components/todo.jsx'

const COLS = ['todo', 'doing', 'review', 'done']

/** Giao diện TodayList (3.4.7): danh sách công việc trong ngày, xem theo bảng cột hoặc danh sách. */
export default function Today() {
  const { me, todos, okrs, users, userById } = useApp()
  const [view, setView] = useState(me.id)
  const [mode, setMode] = useState('board')
  const mine = view === me.id
  const myOkrs = okrs.filter((o) => o.owner === me.id && o.status === 'approved')
  const watchable = users.filter((u) => u.superior === me.id || (me.role === 'director' && u.id !== me.id && u.role !== 'director'))

  const list = todos.filter((t) => t.user_id === view)
  const cancelled = list.filter((t) => t.status === 'cancelled')
  const done = list.filter((t) => t.status === 'done').length
  const open = (t) => `/todaylist/${t.id}`

  return (
    <>
      <PageHead title="TodayList" desc="Công việc hằng ngày, gắn với OKR của bạn. Đóng danh sách vào cuối ngày.">
        {watchable.length > 0 && (
          <select value={view} onChange={(e) => setView(Number(e.target.value))} aria-label="Xem TodayList của">
            <option value={me.id}>TodayList của tôi</option>
            {watchable.map((u) => <option key={u.id} value={u.id}>{u.fullname}</option>)}
          </select>
        )}
        <div className="seg" role="group" aria-label="Kiểu hiển thị">
          <button aria-pressed={mode === 'board'} onClick={() => setMode('board')}>Theo cột</button>
          <button aria-pressed={mode === 'list'} onClick={() => setMode('list')}>Danh sách</button>
        </div>
        {mine && (myOkrs.length === 0
          ? <button className="btn primary" disabled>Tạo TodayList</button>
          : <Link to="/todaylist/new" className="btn primary">Tạo TodayList</Link>)}
      </PageHead>

      {mine && myOkrs.length === 0 && <p className="notice warn" style={{ marginBottom: 16 }}>Bạn cần có OKR đã được duyệt trước khi tạo TodayList.</p>}
      {!mine && <p className="notice" style={{ marginBottom: 16 }}>Bạn đang xem TodayList của {userById(view).fullname}. Chỉ chủ sở hữu mới sửa được.</p>}

      {mine && myOkrs.length > 0 && <div style={{ marginBottom: 16 }}><QuickAdd /></div>}

      <p className="muted" style={{ marginBottom: 14 }}>Hoàn thành {done}/{list.length} công việc · Hôm nay 16/11</p>

      {list.length === 0 ? (
        <Empty title="Chưa có công việc nào hôm nay" text="Tạo TodayList để theo dõi những việc cần làm cho kết quả OKR của bạn." />
      ) : mode === 'board' ? (
        <div className="todo-cols">
          {COLS.map((c) => {
            const items = list.filter((t) => t.status === c)
            return (
              <section className="todo-col" key={c} aria-label={statusMap.todo[c].label}>
                <h3>{statusMap.todo[c].label} <span className="muted">{items.length}</span></h3>
                {items.map((t) => {
                  const okr = okrs.find((o) => o.id === t.okr_id)
                  return (
                    <div className="todo-item" key={t.id}>
                      <Link className="t-name" to={open(t)}>{t.name}</Link>
                      <div className="t-meta">
                        <span><i className={`prio ${t.priority}`} /> {priorityLabel[t.priority]}</span>
                        <span>Hạn {formatDateTime(t.deadline)}</span>
                        <span>{t.estimate} giờ</span>
                      </div>
                      {okr && <div className="small muted" style={{ marginTop: 6 }}>OKR: {okr.objective}</div>}
                      {mine && <div style={{ marginTop: 10 }}><TodoStep todo={t} /></div>}
                    </div>
                  )
                })}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Công việc</th><th>OKR liên quan</th><th>Ưu tiên</th><th>Hạn</th><th className="num">Ước tính</th><th>Trạng thái</th>{mine && <th></th>}</tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td><Link to={open(t)}>{t.name}</Link></td>
                  <td className="muted">{okrs.find((o) => o.id === t.okr_id)?.objective}</td>
                  <td><i className={`prio ${t.priority}`} /> {priorityLabel[t.priority]}</td>
                  <td>{formatDateTime(t.deadline)}</td>
                  <td className="num">{t.estimate} giờ</td>
                  <td><Badge kind="todo" value={t.status} /></td>
                  {mine && <td><TodoStep todo={t} compact /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'board' && cancelled.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 10 }}>Đã hủy</h3>
          {cancelled.map((t) => (
            <div className="row between" key={t.id} style={{ padding: '6px 0' }}>
              <Link to={open(t)} className="muted" style={{ textDecoration: 'line-through' }}>{t.name}</Link>
              <Badge kind="todo" value="cancelled" />
            </div>
          ))}
        </section>
      )}
    </>
  )
}

/** Giao diện tạo TodayList (3.4.8) và chi tiết/chỉnh sửa. */
export function TodayForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { me, todos, setTodos, okrs, newId, notify, ask } = useApp()
  const existing = id ? todos.find((t) => t.id === Number(id)) : null
  const ownerId = existing ? existing.user_id : me.id
  const mine = ownerId === me.id
  const okrOptions = okrs.filter((o) => o.owner === ownerId && o.status === 'approved')

  const [f, setF] = useState(existing || {
    name: '', description: '', okr_id: okrOptions[0]?.id ?? '', priority: 'medium', deadline: '2026-11-16T17:00', estimate: 1, status: 'todo', comments: '',
  })
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  if (id && !existing) return <Empty title="Không tìm thấy công việc" text="Công việc này đã bị xóa hoặc không tồn tại." action={<Link to="/todaylist" className="btn">Về TodayList</Link>} />

  const save = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    if (existing) setTodos((all) => all.map((x) => (x.id === existing.id ? f : x)))
    else setTodos((all) => [...all, { ...f, id: newId(), user_id: me.id }])
    notify(existing ? 'Đã cập nhật TodayList' : 'Đã tạo TodayList')
    nav('/todaylist')
  }
  const del = async () => {
    const ok = await ask({ title: 'Xóa công việc này?', items: [existing.name], confirmLabel: 'Xóa công việc', danger: true })
    if (!ok) return
    setTodos((all) => all.filter((x) => x.id !== existing.id))
    notify('Đã xóa TodayList', 'ok', { label: 'Hoàn tác', run: () => setTodos((all) => [...all, existing]) })
    nav('/todaylist')
  }

  return (
    <>
      <PageHead title={existing ? (mine ? 'Chỉnh sửa TodayList' : 'Chi tiết TodayList') : 'Tạo TodayList'} desc="Nhập công việc của ngày, mức ưu tiên và liên kết với OKR liên quan." />
      <form className="card" onSubmit={save} noValidate>
        <fieldset disabled={!mine} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="form-grid">
            <label className="field full">
              Tên công việc
              <input type="text" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ví dụ: Viết API lưu check-in nháp" />
            </label>
            <label className="field full">
              Mô tả
              <textarea value={f.description} onChange={(e) => set({ description: e.target.value })} />
            </label>
            <label className="field full">
              OKR liên quan
              <select value={f.okr_id} onChange={(e) => set({ okr_id: Number(e.target.value) })}>
                {okrOptions.map((o) => <option key={o.id} value={o.id}>{o.objective}</option>)}
              </select>
            </label>
            <label className="field">
              Mức ưu tiên
              <select value={f.priority} onChange={(e) => set({ priority: e.target.value })}>
                {Object.entries(priorityLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="field">
              Trạng thái
              <select value={f.status} onChange={(e) => set({ status: e.target.value })}>
                {Object.entries(statusMap.todo).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
            <label className="field">
              Hạn hoàn thành
              <input type="datetime-local" value={f.deadline} onChange={(e) => set({ deadline: e.target.value })} />
            </label>
            <label className="field">
              Thời gian ước tính (giờ)
              <input type="number" min="0" step="0.5" value={f.estimate} onChange={(e) => set({ estimate: Number(e.target.value) })} />
            </label>
            <label className="field full">
              Tệp đính kèm
              <input type="file" multiple />
              <small>Tối đa 10 MB mỗi tệp.</small>
            </label>
            <label className="field full">
              Ghi chú
              <textarea value={f.comments} onChange={(e) => set({ comments: e.target.value })} style={{ minHeight: 64 }} />
            </label>
          </div>
        </fieldset>
        <div className="modal-foot">
          {mine && existing && <button type="button" className="btn danger" style={{ marginRight: 'auto' }} onClick={del}>Xóa</button>}
          <Link to="/todaylist" className="btn">{mine ? 'Hủy' : 'Đóng'}</Link>
          {mine && <button className="btn primary" type="submit" disabled={!f.name.trim()}>{existing ? 'Lưu thay đổi' : 'Tạo TodayList'}</button>}
        </div>
      </form>
    </>
  )
}
