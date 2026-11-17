import { useState } from 'react'
import { useApp, okrPercent, formatDate } from '../store.jsx'
import { Avatar, Badge, Empty, PageHead, Progress, Tabs } from '../components/ui.jsx'

export default function Review() {
  const { me, checkins, setCheckins, okrs, reviews, setReviews, users, setUsers, userById, newId, notify } = useApp()
  const [tab, setTab] = useState('todo')
  const [openId, setOpenId] = useState(null)
  const [f, setF] = useState({ score: 8, team: '', personal: '', summary: '' })

  const mineOnly = (c) => me.role === 'director' || userById(c.user_id)?.superior === me.id
  const waiting = checkins.filter((c) => c.status === 'waiting' && mineOnly(c))
  const done = reviews.filter((r) => r.reviewer === me.id || me.role === 'director')

  const submit = (c) => {
    setReviews((all) => [...all, { id: newId(), checkin_id: c.id, okr_id: c.okr_id, reviewer: me.id, score: Number(f.score), team_comment: f.team, personal_comment: f.personal, summary: f.summary }])
    setCheckins((all) => all.map((x) => (x.id === c.id ? { ...x, status: 'checked' } : x)))
    setUsers((all) => all.map((u) => (u.id === c.user_id ? { ...u, points: u.points + Number(f.score) } : u)))
    notify(`Đã review, ${userById(c.user_id).fullname} nhận ${f.score} điểm`)
    setOpenId(null); setF({ score: 8, team: '', personal: '', summary: '' })
  }

  return (
    <>
      <PageHead title="Review OKR" desc="Sau buổi họp, chấm điểm OKR cấp dưới đã làm trong tuần. Điểm review được cộng vào điểm thưởng tuần." />
      <Tabs tabs={[['todo', `Chờ review (${waiting.length})`], ['done', 'Đã review']]} value={tab} onChange={setTab} />

      {tab === 'todo' && (waiting.length === 0 ? (
        <Empty title="Không có check-in nào chờ review" text="Khi cấp dưới gửi check-in cuối, bạn sẽ thấy chúng ở đây." />
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {waiting.map((c) => {
            const o = okrs.find((x) => x.id === c.okr_id)
            const u = userById(c.user_id)
            const open = openId === c.id
            return (
              <article className="card" key={c.id}>
                <div className="row between wrap">
                  <div className="row"><Avatar user={u} /><div><b>{u.fullname}</b><div className="muted small">Check-in ngày {formatDate(c.date)} · tự tin {c.confidence}/3</div></div></div>
                  <Badge kind="checkin" value="waiting" />
                </div>
                <h3 className="okr-obj" style={{ marginTop: 12 }}>{o.objective}</h3>
                <div className="row" style={{ gap: 12, margin: '10px 0' }}><Progress value={okrPercent(o)} /><b className="tnum">{okrPercent(o)}%</b></div>
                <dl className="kv" style={{ marginTop: 10 }}>
                  <dt>Tóm tắt</dt><dd>{c.summary}</dd>
                  <dt>Việc đang chậm</dt><dd>{c.slow || 'Không có'}</dd>
                  <dt>Khó khăn</dt><dd>{c.obstacles || 'Không có'}</dd>
                  <dt>Giải pháp</dt><dd>{c.solutions || 'Chưa nêu'}</dd>
                </dl>
                {!open ? (
                  <div className="modal-foot"><button className="btn primary" onClick={() => setOpenId(c.id)}>Review OKR này</button></div>
                ) : (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
                    <div className="form-grid">
                      <label className="field">
                        Điểm đánh giá (0–10)
                        <input type="number" min="0" max="10" value={f.score} onChange={(e) => setF({ ...f, score: Math.max(0, Math.min(10, e.target.value)) })} />
                        <small>Điểm này được cộng vào điểm thưởng của {u.fullname}.</small>
                      </label>
                      <label className="field">
                        Kết luận chung
                        <input type="text" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} placeholder="Ví dụ: Hoàn thành tốt" />
                      </label>
                      <label className="field">
                        Nhận xét về nhóm
                        <textarea value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })} />
                      </label>
                      <label className="field">
                        Nhận xét cá nhân
                        <textarea value={f.personal} onChange={(e) => setF({ ...f, personal: e.target.value })} />
                      </label>
                    </div>
                    <div className="modal-foot">
                      <button className="btn" onClick={() => setOpenId(null)}>Hủy</button>
                      <button className="btn primary" onClick={() => submit(c)} disabled={!f.summary.trim()}>Lưu review</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ))}

      {tab === 'done' && (done.length === 0 ? (
        <Empty title="Chưa có review nào" text="Các review bạn đã lưu sẽ hiển thị ở đây." />
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {done.map((r) => {
            const o = okrs.find((x) => x.id === r.okr_id)
            const owner = userById(o.owner)
            return (
              <article className="card row" key={r.id} style={{ alignItems: 'flex-start', gap: 16 }}>
                <span className="score">{r.score ?? '–'}</span>
                <div>
                  <b>{owner.fullname}</b> <span className="muted">· {r.summary}</span>
                  <div style={{ marginTop: 4 }}>{o.objective}</div>
                  {r.team_comment && <p className="muted small" style={{ marginTop: 6 }}>Nhóm: {r.team_comment}</p>}
                  {r.personal_comment && <p className="muted small">Cá nhân: {r.personal_comment}</p>}
                </div>
              </article>
            )
          })}
        </div>
      ))}
      <span hidden>{users.length}</span>
    </>
  )
}
