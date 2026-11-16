import { useState } from 'react'
import { useApp } from '../store.jsx'

/** Dòng nhập nhanh TodayList: gõ tên rồi Enter. OKR mặc định là OKR đã duyệt gần nhất, hạn là cuối hôm nay. */
export function QuickAdd() {
  const { me, okrs, setTodos, newId, notify } = useApp()
  const mine = okrs.filter((o) => o.owner === me.id && o.status === 'approved')
  const [name, setName] = useState('')
  const [okrId, setOkrId] = useState(() => {
    try { return Number(localStorage.getItem('okr-last-okr')) || '' } catch { return '' }
  })
  const current = mine.find((o) => o.id === Number(okrId)) || mine[0]

  if (mine.length === 0) {
    return <p className="notice warn">Bạn cần có OKR đã được duyệt trước khi thêm công việc.</p>
  }

  const add = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const todo = {
      id: newId(), user_id: me.id, okr_id: current.id, name: name.trim(), description: '', status: 'todo', priority: 'medium',
      deadline: '2026-11-16T17:00', estimate: 1, comments: '',
    }
    setTodos((all) => [...all, todo])
    try { localStorage.setItem('okr-last-okr', String(current.id)) } catch { /* bỏ qua */ }
    notify('Đã thêm công việc', 'ok', { label: 'Hoàn tác', run: () => setTodos((all) => all.filter((t) => t.id !== todo.id)) })
    setName('')
  }

  return (
    <form className="quick-add" onSubmit={add}>
      <label className="sr-only" htmlFor="quick-name">Tên công việc mới</label>
      <input id="quick-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Thêm công việc hôm nay, gõ tên rồi nhấn Enter" autoComplete="off" />
      {mine.length > 1 && (
        <select value={current.id} onChange={(e) => setOkrId(e.target.value)} aria-label="OKR liên quan">
          {mine.map((o) => <option key={o.id} value={o.id}>{o.objective.length > 38 ? `${o.objective.slice(0, 38)}…` : o.objective}</option>)}
        </select>
      )}
      <button className="btn primary" type="submit" disabled={!name.trim()}>Thêm việc</button>
    </form>
  )
}

/** Nút đổi trạng thái một chạm trên thẻ công việc. */
export function TodoStep({ todo, compact }) {
  const { setTodos, notify } = useApp()
  const set = (status, msg) => {
    const prev = todo.status
    setTodos((all) => all.map((t) => (t.id === todo.id ? { ...t, status } : t)))
    notify(msg, 'ok', { label: 'Hoàn tác', run: () => setTodos((all) => all.map((t) => (t.id === todo.id ? { ...t, status: prev } : t))) })
  }
  if (todo.status === 'done' || todo.status === 'cancelled') return null
  return (
    <span className={`todo-step ${compact ? 'compact' : ''}`}>
      {todo.status === 'todo' && <button className="btn sm" onClick={() => set('doing', 'Đã chuyển sang Đang thực hiện')}>Bắt đầu</button>}
      <button className="btn sm primary" onClick={() => set('done', 'Đã hoàn thành công việc')}>Xong</button>
    </span>
  )
}
