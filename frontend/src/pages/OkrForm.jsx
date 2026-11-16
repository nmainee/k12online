import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { levelLabel, WEEK } from '../data/mock.js'
import { PageHead } from '../components/ui.jsx'

const blankKr = () => ({ id: Math.random(), text: '', target: '', current: 0, unit: '' })

export default function OkrForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { me, okrs, setOkrs, newId, notify } = useApp()
  const editing = okrs.find((o) => o.id === Number(id) && o.owner === me.id)

  const levels = me.role === 'director' ? ['company', 'team', 'personal'] : me.role === 'manager' ? ['team', 'personal'] : ['personal']
  const [level, setLevel] = useState(editing?.level || levels[levels.length - 1])
  const [objective, setObjective] = useState(editing?.objective || '')
  const [parent, setParent] = useState(editing?.parent || '')
  const [visibility, setVisibility] = useState(editing?.visibility || 'public')
  const [krs, setKrs] = useState(editing?.krs || [blankKr(), blankKr()])
  const [errors, setErrors] = useState({})

  const cycle = level === 'company' ? WEEK.month : `Tuần ${WEEK.number}`
  const parentOptions = okrs.filter((o) => o.status === 'approved' && (level === 'team' ? o.level === 'company' : level === 'personal' ? o.level === 'team' : false))

  const setKr = (i, patch) => setKrs((all) => all.map((k, j) => (j === i ? { ...k, ...patch } : k)))

  const save = (submit) => {
    const e = {}
    if (!objective.trim()) e.objective = 'Nhập mục tiêu (Objective) của OKR.'
    if (submit && level !== 'company' && !parent) e.parent = 'Chọn OKR cấp trên để liên kết trước khi gửi duyệt.'
    const filled = krs.filter((k) => k.text.trim())
    if (submit && filled.length === 0) e.krs = 'Thêm ít nhất một kết quả then chốt (KR).'
    if (submit && filled.some((k) => !(Number(k.target) > 0))) e.krs = 'Mỗi KR cần một chỉ tiêu lớn hơn 0 để đo lường.'
    setErrors(e)
    if (Object.keys(e).length) return

    const status = !submit ? 'draft' : me.role === 'director' && level === 'company' ? 'approved' : 'pending'
    const data = {
      level, objective: objective.trim(), parent: parent ? Number(parent) : null, visibility, cycle, status,
      krs: filled.map((k) => ({ ...k, target: Number(k.target) || 0, current: Number(k.current) || 0 })),
    }
    if (editing) setOkrs((all) => all.map((o) => (o.id === editing.id ? { ...o, ...data } : o)))
    else setOkrs((all) => [...all, { id: newId(), owner: me.id, department_id: me.department_id, ...data }])
    notify(!submit ? 'Đã lưu nháp OKR' : status === 'approved' ? 'Đã tạo và duyệt OKR công ty' : 'Đã gửi OKR chờ duyệt')
    nav('/okrs')
  }

  return (
    <>
      <PageHead title={editing ? 'Chỉnh sửa OKR' : 'Tạo OKR'} desc="Mỗi OKR gồm một mục tiêu và các kết quả then chốt đo được bằng con số." />
      <form className="card" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="form-grid">
          <label className="field">
            Cấp OKR
            <select value={level} onChange={(e) => { setLevel(e.target.value); setParent('') }} disabled={levels.length === 1}>
              {levels.map((l) => <option key={l} value={l}>{levelLabel[l]}</option>)}
            </select>
            <small>Chu kỳ: {cycle}</small>
          </label>
          <label className="field">
            Hiển thị
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Công khai trong công ty</option>
              <option value="private">Riêng tư, chỉ mình tôi và cấp trên</option>
            </select>
          </label>
          <label className="field full">
            Mục tiêu (Objective)
            <input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ví dụ: Hoàn thành giao diện check-in OKR" />
            {errors.objective && <span className="error-text">{errors.objective}</span>}
          </label>
          {level !== 'company' && (
            <label className="field full">
              Liên kết với OKR cấp trên
              <select value={parent} onChange={(e) => setParent(e.target.value)}>
                <option value="">Chọn OKR cấp trên</option>
                {parentOptions.map((o) => <option key={o.id} value={o.id}>{levelLabel[o.level]}: {o.objective}</option>)}
              </select>
              {errors.parent && <span className="error-text">{errors.parent}</span>}
            </label>
          )}
        </div>

        <h3 style={{ margin: '26px 0 12px' }}>Kết quả then chốt (KR)</h3>
        <div className="stack">
          {krs.map((k, i) => (
            <div className="card" key={k.id} style={{ background: 'var(--surface-2)', padding: 14 }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 120px 110px auto', alignItems: 'end' }}>
                <label className="field">
                  KR {i + 1}
                  <input type="text" value={k.text} onChange={(e) => setKr(i, { text: e.target.value })} placeholder="Chỉ số cần đạt" />
                </label>
                <label className="field">
                  Chỉ tiêu
                  <input type="number" min="0" value={k.target} onChange={(e) => setKr(i, { target: e.target.value })} />
                </label>
                <label className="field">
                  Đơn vị
                  <input type="text" value={k.unit} onChange={(e) => setKr(i, { unit: e.target.value })} placeholder="%, API..." />
                </label>
                <button type="button" className="btn sm danger" onClick={() => setKrs((a) => a.filter((_, j) => j !== i))} disabled={krs.length === 1}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
        {errors.krs && <p className="error-text" style={{ marginTop: 8 }}>{errors.krs}</p>}
        <button type="button" className="btn sm" style={{ marginTop: 12 }} onClick={() => setKrs((a) => [...a, blankKr()])}>Thêm KR</button>

        <div className="modal-foot" style={{ marginTop: 28 }}>
          <Link to="/okrs" className="btn">Hủy</Link>
          <button type="button" className="btn" onClick={() => save(false)}>Lưu nháp</button>
          <button type="button" className="btn primary" onClick={() => save(true)}>
            {me.role === 'director' && level === 'company' ? 'Tạo OKR' : 'Gửi duyệt'}
          </button>
        </div>
      </form>
    </>
  )
}
