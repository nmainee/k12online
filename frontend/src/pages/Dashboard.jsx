import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp, okrPercent } from '../store.jsx'
import { WEEK, weeklyTrend } from '../data/mock.js'
import { Badge, BarList, Icon, Modal, Progress, Ring, TrendChart } from '../components/ui.jsx'
import { ClimbScene } from '../components/art.jsx'
import { QuickAdd, TodoStep } from '../components/todo.jsx'

const STEPS = [
  ['Thiết lập OKR', 'Tạo và gửi duyệt OKR của tuần'],
  ['Thực thi và check-in', 'Làm TodayList, check-in cuối tuần'],
  ['Họp hàng tuần', 'Họp với cấp trên đầu tuần'],
  ['Review và CFRs', 'Chấm điểm, ghi nội dung họp, phản hồi'],
  ['Tổng kết tuần', 'Xem báo cáo điểm, đổi quà'],
]
const HINTS = [
  'Bước đầu tiên của tuần: tạo OKR và gửi cấp trên duyệt để bắt đầu.',
  'OKR đã duyệt. Làm TodayList mỗi ngày và nhớ check-in cuối tuần trước buổi họp.',
  'Bạn đã check-in xong. Chuẩn bị cho buổi họp đầu tuần với cấp trên.',
  'Họp xong rồi. Xem review của cấp trên và gửi feedback cho đồng nghiệp.',
  'Tuần này đã khép lại. Xem điểm thưởng và đổi quà ở Store.',
]
const NEXT = [['/okrs/new', 'Tạo OKR tuần này'], ['/checkin', 'Đi tới check-in'], ['/cfr', 'Xem CFRs'], ['/cfr', 'Gửi feedback'], ['/store', 'Đổi quà']]

function CycleRail({ phase }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Vòng OKR tuần {WEEK.number}</h2>
        <span className="muted small">Bạn đang ở bước {phase + 1} trên 5</span>
      </div>
      <ol className="rail" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STEPS.map(([label, hint], i) => (
          <li key={label} className={`rail-step ${i < phase ? 'done' : i === phase ? 'current' : ''}`} aria-current={i === phase ? 'step' : undefined}>
            <span className="rail-dot">{i < phase ? '✓' : i + 1}</span>
            <div>
              <div className="rail-label">{label}</div>
              <div className="rail-hint">{hint}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Hộp "Cần bạn duyệt": cấp trên duyệt hoặc yêu cầu sửa OKR ngay tại chỗ, duyệt hàng loạt khi từ 2 mục. */
function Approvals({ pending, waitingCheckins }) {
  const { setOkrs, userById, notify, ask } = useApp()
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')

  const setStatus = (ids, status) => setOkrs((all) => all.map((o) => (ids.includes(o.id) ? { ...o, status } : o)))
  const approve = (o) => { setStatus([o.id], 'approved'); notify('Đã duyệt OKR', 'ok', { label: 'Hoàn tác', run: () => setStatus([o.id], 'pending') }) }
  const approveAll = async () => {
    const ok = await ask({ title: `Duyệt ${pending.length} OKR?`, items: pending.map((o) => `${userById(o.owner).fullname}: ${o.objective}`), confirmLabel: `Duyệt ${pending.length} OKR` })
    if (!ok) return
    const ids = pending.map((o) => o.id)
    setStatus(ids, 'approved')
    notify(`Đã duyệt ${ids.length} OKR`, 'ok', { label: 'Hoàn tác', run: () => setStatus(ids, 'pending') })
  }
  const reject = () => { setStatus([rejecting.id], 'needs_edit'); notify('Đã yêu cầu chỉnh sửa OKR'); setRejecting(null); setReason('') }

  const total = pending.length + waitingCheckins.length
  return (
    <section className="card" aria-labelledby="approve-h">
      <div className="card-head">
        <h2 id="approve-h">Cần bạn duyệt {total > 0 && <span className="count-pill">{total}</span>}</h2>
        {pending.length > 1 && <button className="btn sm primary" onClick={approveAll}>Duyệt cả {pending.length} OKR</button>}
      </div>
      {total === 0 && <p className="muted">Không có OKR hay check-in nào đang chờ bạn.</p>}
      <ul className="stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: 14 }}>
        {pending.map((o) => (
          <li key={o.id} className="approve-item">
            <div><b>{userById(o.owner).fullname}</b> <span className="muted small">gửi OKR chờ duyệt</span></div>
            <div className="small" style={{ margin: '2px 0 8px' }}>{o.objective}</div>
            <div className="row wrap" style={{ gap: 8 }}>
              <button className="btn sm primary" onClick={() => approve(o)}>Duyệt</button>
              <button className="btn sm" onClick={() => setRejecting(o)}>Yêu cầu sửa</button>
              <Link to="/okrs" className="small">Xem chi tiết</Link>
            </div>
          </li>
        ))}
        {waitingCheckins.length > 0 && (
          <li className="approve-item">
            <div><b>{waitingCheckins.length} check-in</b> <span className="muted small">đang chờ review</span></div>
            <div className="small muted" style={{ margin: '2px 0 8px' }}>{waitingCheckins.map((c) => userById(c.user_id).fullname).join(', ')}</div>
            <Link to="/review" className="btn sm primary">Mở danh sách review</Link>
          </li>
        )}
      </ul>

      {rejecting && (
        <Modal title="Yêu cầu chỉnh sửa OKR" onClose={() => setRejecting(null)}>
          <p className="muted" style={{ marginBottom: 12 }}>“{rejecting.objective}”</p>
          <label className="field">
            Nội dung cần sửa
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: KR chưa đo lường được, hãy thêm con số cụ thể." />
          </label>
          <div className="modal-foot">
            <button className="btn" onClick={() => setRejecting(null)}>Hủy</button>
            <button className="btn primary" onClick={reject} disabled={!reason.trim()}>Gửi yêu cầu</button>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default function Dashboard() {
  const { me, okrs, todos, checkins, users, departments, conversations, userById, deptName } = useApp()
  const lead = me.role !== 'staff'

  const myOkrs = okrs.filter((o) => o.owner === me.id)
  const mainOkr = myOkrs.find((o) => o.status === 'approved') || myOkrs[0]
  const myTodos = todos.filter((t) => t.user_id === me.id)
  const openTodos = myTodos.filter((t) => ['todo', 'doing', 'review'].includes(t.status))
  const doneTodos = myTodos.filter((t) => t.status === 'done').length
  const myCheckins = checkins.filter((c) => c.user_id === me.id)
  const finalCheckin = myCheckins.some((c) => ['waiting', 'checked'].includes(c.status) && c.date >= '2026-11-14')
  const hadMeeting = conversations.some((c) => (c.manager === me.id || c.participant === me.id) && c.week === WEEK.number)

  let phase = 0
  if (myOkrs.some((o) => o.status === 'approved')) phase = 1
  if (phase === 1 && finalCheckin) phase = 2
  if (phase === 2 && hadMeeting) phase = 3

  const mine = (o) => me.role === 'director' || userById(o.owner)?.superior === me.id
  const pending = okrs.filter((o) => o.status === 'pending' && o.owner !== me.id && mine(o))
  const waitingCheckins = checkins.filter((c) => c.status === 'waiting' && mine({ owner: c.user_id }))
  const team = okrs.filter((o) => o.level === 'personal' && mine(o))
  const companyOkr = okrs.find((o) => o.level === 'company')
  const needsEdit = myOkrs.filter((o) => o.status === 'needs_edit')

  const deptRows = departments.filter((d) => d.id !== 1).map((d) => {
    const list = okrs.filter((o) => o.department_id === d.id && o.status === 'approved')
    const pct = list.length ? Math.round(list.reduce((s, o) => s + okrPercent(o), 0) / list.length) : 0
    return { label: d.name, value: pct }
  })

  const daysLeft = 6
  const needCheckin = !finalCheckin && myOkrs.some((o) => o.status === 'approved')

  return (
    <>
      {/* Dải chào thu gọn: một việc tiếp theo, không chiếm chỗ của việc cần làm */}
      <section className="hero compact">
        <div>
          <span className="hero-chip">{WEEK.month} · Tuần {WEEK.number} · còn {daysLeft} ngày</span>
          <h1>Xin chào, {me.fullname.split(' ').slice(-1)[0]}!</h1>
          <p>{HINTS[phase]}</p>
          <div className="hero-actions">
            <Link to={NEXT[phase][0]} className="btn light">{NEXT[phase][1]}</Link>
            <Link to="/okrs/new" className="btn ghost">Tạo OKR mới</Link>
          </div>
        </div>
        <div className="hero-scene"><ClimbScene step={phase} /></div>
      </section>

      {/* Bàn làm việc */}
      <div className="grid main-side" style={{ marginTop: 16 }}>
        <section className="card" aria-labelledby="todo-h">
          <div className="card-head">
            <h2 id="todo-h">{me.role === 'director' ? 'Việc của bạn hôm nay' : 'Việc cần làm hôm nay'}</h2>
            <Link to="/todaylist" className="small">Mở TodayList</Link>
          </div>
          {me.role !== 'director' && <QuickAdd />}
          <ul className="stack" style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, gap: 4 }}>
            {needCheckin && me.role !== 'director' && (
              <li className="todo-row alert-row"><span>Check-in cuối tuần chưa gửi. Cần xong trước buổi họp.</span><Link to="/checkin" className="btn sm primary">Check-in</Link></li>
            )}
            {needsEdit.map((o) => (
              <li key={o.id} className="todo-row alert-row"><span>OKR “{o.objective}” cần chỉnh sửa.</span><Link to={`/okrs/${o.id}/edit`} className="btn sm">Sửa OKR</Link></li>
            ))}
            {openTodos.map((t) => (
              <li key={t.id} className="todo-row">
                <Link to={`/todaylist/${t.id}`}>{t.name}</Link>
                <span className="row" style={{ gap: 8 }}><Badge kind="todo" value={t.status} /><TodoStep todo={t} compact /></span>
              </li>
            ))}
            {openTodos.length === 0 && me.role !== 'director' && <li className="muted">Không còn công việc nào đang mở. Thêm việc mới ở ô phía trên.</li>}
            {openTodos.length === 0 && me.role === 'director' && <li className="muted">Bạn chưa có công việc nào hôm nay.</li>}
          </ul>
        </section>

        {lead ? (
          <Approvals pending={pending} waitingCheckins={waitingCheckins} />
        ) : (
          <section className="card">
            <div className="card-head">
              <h2>OKR của bạn</h2>
              <Link to="/okrs" className="small">Xem tất cả</Link>
            </div>
            {myOkrs.length === 0 && <p className="muted">Bạn chưa có OKR nào trong tuần này. Tạo OKR để bắt đầu vòng tuần.</p>}
            <div className="stack" style={{ gap: 18 }}>
              {myOkrs.slice(0, 3).map((o) => (
                <div key={o.id}>
                  <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <div className="okr-obj" style={{ fontSize: 16 }}>{o.objective}</div>
                    <Badge kind="okr" value={o.status} />
                  </div>
                  <div className="row" style={{ gap: 12, marginTop: 8 }}>
                    <Progress value={okrPercent(o)} />
                    <b className="tnum" style={{ minWidth: 42, textAlign: 'right' }}>{okrPercent(o)}%</b>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Tổng quan: mỗi thẻ số bấm vào danh sách tương ứng */}
      <div className="grid c4" style={{ marginTop: 16 }}>
        <Link to="/okrs" className="card row stat-link" style={{ gap: 16 }}>
          <Ring value={me.role === 'director' ? okrPercent(companyOkr) : mainOkr ? okrPercent(mainOkr) : 0} size={84} stroke={8} />
          <div>
            <div style={{ fontWeight: 600 }}>{me.role === 'director' ? 'OKR công ty' : 'OKR của bạn'}</div>
            <div className="muted small">{mainOkr ? mainOkr.cycle : 'Chưa có OKR'}</div>
          </div>
        </Link>
        <Link to="/todaylist" className="card stat-link">
          <span className="stat-ico sky"><Icon name="list" /></span>
          <div className="stat-num">{doneTodos}<span className="muted" style={{ fontSize: 22 }}>/{myTodos.length}</span></div>
          <div className="stat-label">TodayList đã hoàn thành hôm nay</div>
        </Link>
        <Link to="/checkin" className="card stat-link">
          <span className="stat-ico coral"><Icon name="check" /></span>
          <div className="stat-num">{finalCheckin ? 'Đã xong' : 'Chưa xong'}</div>
          <div className="stat-label">Check-in cuối tuần {WEEK.number}</div>
        </Link>
        <Link to="/store" className="card stat-link">
          <span className="stat-ico sun"><Icon name="gift" /></span>
          <div className="stat-num">{me.role === 'director' ? '—' : me.points}</div>
          <div className="stat-label">{me.role === 'director' ? 'Giám đốc không tích điểm' : 'Điểm thưởng, bấm để đổi quà'}</div>
        </Link>
      </div>

      <div style={{ marginTop: 16 }}><CycleRail phase={phase} /></div>

      {me.role === 'director' && (
        <>
          <div className="grid main-side" style={{ marginTop: 16 }}>
            <section className="card">
              <div className="card-head">
                <h2>OKR công ty · {companyOkr.cycle}</h2>
                <Link to="/okrs?view=tree" className="small">Xem cây liên kết</Link>
              </div>
              <div className="okr-obj">{companyOkr.objective}</div>
              <div className="kr-list">
                {companyOkr.krs.map((k) => (
                  <div className="kr" key={k.id}>
                    <span className="kr-text">{k.text}</span>
                    <span className="kr-val">{k.current}/{k.target} {k.unit}</span>
                    <Progress value={Math.min(100, Math.round((k.current / k.target) * 100))} />
                  </div>
                ))}
              </div>
            </section>
            <section className="card">
              <div className="card-head"><h2>Tiến độ theo phòng ban</h2></div>
              <BarList rows={deptRows} />
            </section>
          </div>
          <section className="card" style={{ marginTop: 16 }}>
            <div className="card-head"><h2>Xu hướng 6 tuần gần nhất</h2><span className="muted small">Tiến độ trung bình, %</span></div>
            <TrendChart data={weeklyTrend} />
          </section>
        </>
      )}

      {lead && (
        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-head"><h2>Theo dõi TodayList hôm nay</h2><Link to="/todaylist" className="small">Xem chi tiết</Link></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nhân viên</th><th className="num">Tổng việc</th><th className="num">Hoàn thành</th><th>Tiến độ trong ngày</th></tr></thead>
              <tbody>
                {users.filter((u) => u.role === 'staff' && u.active && (me.role === 'director' || u.superior === me.id)).map((u) => {
                  const l = todos.filter((t) => t.user_id === u.id && t.status !== 'cancelled')
                  const d = l.filter((t) => t.status === 'done').length
                  const pct = l.length ? Math.round((d / l.length) * 100) : 0
                  return (
                    <tr key={u.id}>
                      <td>{u.fullname}</td>
                      <td className="num">{l.length}</td>
                      <td className="num">{d}</td>
                      <td style={{ minWidth: 160 }}>{l.length ? <Progress value={pct} /> : <span className="muted small">Chưa tạo TodayList</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {me.role === 'manager' && (
        <section className="card" style={{ marginTop: 16 }}>
          <div className="card-head"><h2>Tiến độ của nhóm {deptName(me.department_id)}</h2><Link to="/okrs?view=tree" className="small">Xem cây liên kết</Link></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nhân viên</th><th>Mục tiêu</th><th>Trạng thái</th><th className="num">Tiến độ</th></tr></thead>
              <tbody>
                {team.map((o) => (
                  <tr key={o.id}>
                    <td>{userById(o.owner).fullname}</td>
                    <td>{o.objective}</td>
                    <td><Badge kind="okr" value={o.status} /></td>
                    <td className="num">{okrPercent(o)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
