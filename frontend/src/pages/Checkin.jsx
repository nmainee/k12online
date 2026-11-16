import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp, okrPercent, krPercent, formatDate } from '../store.jsx'
import { WEEK } from '../data/mock.js'
import { Badge, Empty, PageHead, Progress, RouteTabs } from '../components/ui.jsx'

const CHECKIN_TABS = [['/checkin', 'OKR cần check-in'], ['/checkin/history', 'Lịch sử check-in']]

function useCheckinData() {
  const { me, okrs, checkins, userById } = useApp()
  const mine = okrs.filter((o) => o.owner === me.id && o.status === 'approved')
  const history = checkins
    .filter((c) => c.user_id === me.id || userById(c.user_id)?.superior === me.id || me.role === 'director')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const lastOf = (okrId) => checkins.filter((c) => c.okr_id === okrId).sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  return { mine, history, lastOf }
}

/** Giao diện Checkin OKR (3.4.9): các OKR đang phụ trách và mức hoàn thành. */
export function CheckinList() {
  const { mine, lastOf } = useCheckinData()
  return (
    <>
      <PageHead title="Check-in" desc="Cập nhật tiến độ KR trong tuần. Check-in nháp bất cứ lúc nào, check-in cuối bắt buộc trước buổi họp." />
      <RouteTabs tabs={CHECKIN_TABS} />
      {mine.length === 0 ? (
        <Empty title="Chưa có OKR đã duyệt để check-in" text="Khi OKR của bạn được cấp trên duyệt, nó sẽ xuất hiện ở đây." action={<Link to="/okrs" className="btn">Xem OKRs</Link>} />
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {mine.map((o) => {
            const last = lastOf(o.id)
            const state = last && last.date >= '2026-11-14' ? last.status : 'not_checked'
            return (
              <article className="card okr-card" key={o.id}>
                <div className="row between wrap" style={{ gap: 8, marginBottom: 8 }}>
                  <span className="muted small">{o.cycle}</span>
                  <Badge kind="checkin" value={state} />
                </div>
                <h3 className="okr-obj">{o.objective}</h3>
                <div className="row" style={{ gap: 12, margin: '12px 0' }}>
                  <Progress value={okrPercent(o)} />
                  <b className="tnum">{okrPercent(o)}%</b>
                </div>
                <div className="row between wrap">
                  <span className="muted small">
                    {last ? `Lần gần nhất: ${formatDate(last.date)}` : 'Chưa check-in lần nào'}
                    {last?.next && ` · Hẹn check-in tiếp: ${formatDate(last.next)}`}
                  </span>
                  <Link className="btn primary sm" to={`/checkin/${o.id}`}>{state === 'draft' ? 'Tiếp tục check-in' : state === 'not_checked' ? 'Check-in' : 'Xem hoặc sửa'}</Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

/** Giao diện lịch sử Checkin (3.4.11): các lần check-in theo từng tuần. */
export function CheckinHistory() {
  const { okrs, userById } = useApp()
  const { history } = useCheckinData()
  const [week, setWeek] = useState('all')
  const weekOf = (d) => (d >= '2026-11-16' ? 47 : d >= '2026-11-09' ? 46 : 45)
  const shown = history.filter((c) => week === 'all' || weekOf(c.date) === Number(week))
  return (
    <>
      <PageHead title="Check-in" desc="Theo dõi sự tiến bộ và xu hướng hiệu suất qua từng tuần." />
      <RouteTabs tabs={CHECKIN_TABS} />
      <div className="filters">
        <select value={week} onChange={(e) => setWeek(e.target.value)} aria-label="Lọc theo tuần">
          <option value="all">Mọi tuần</option><option value="47">Tuần 47</option><option value="46">Tuần 46</option>
        </select>
      </div>
      {shown.length === 0 ? (
        <Empty title="Chưa có lịch sử check-in" text="Mỗi lần lưu check-in sẽ được ghi lại tại đây theo tuần." />
      ) : (
        <div className="card">
          <div className="timeline">
            {shown.map((c) => {
              const o = okrs.find((x) => x.id === c.okr_id)
              return (
                <div className={`tl-item ${c.status}`} key={c.id}>
                  <div className="row wrap" style={{ gap: 10 }}>
                    <b>{formatDate(c.date)}</b>
                    <span className="tag">Tuần {weekOf(c.date)}</span>
                    <Badge kind="checkin" value={c.status} />
                    <span className="muted small">{userById(c.user_id).fullname} · tiến độ {c.percent}% · tự tin {c.confidence}/3</span>
                  </div>
                  <div style={{ marginTop: 4 }}>{o?.objective}</div>
                  <p className="muted" style={{ marginTop: 4 }}>{c.summary}</p>
                  {c.obstacles && <p className="small" style={{ marginTop: 4 }}><b>Khó khăn:</b> {c.obstacles}</p>}
                  {c.solutions && <p className="small"><b>Giải pháp:</b> {c.solutions}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export function CheckinDo() {
  const { okrId } = useParams()
  const nav = useNavigate()
  const { me, okrs, setOkrs, checkins, setCheckins, newId, notify } = useApp()
  const okr = okrs.find((o) => o.id === Number(okrId) && o.owner === me.id)
  const prev = checkins.filter((c) => c.okr_id === okr?.id && c.date >= '2026-11-14')[0]

  const [krs, setKrs] = useState(okr ? okr.krs.map((k) => ({ ...k })) : [])
  const [form, setForm] = useState({
    confidence: prev?.confidence ?? 2, summary: prev?.summary ?? '', slow: prev?.slow ?? '',
    obstacles: prev?.obstacles ?? '', solutions: prev?.solutions ?? '', next: prev?.next ?? '',
  })
  const [error, setError] = useState('')

  if (!okr) return <Empty title="Không tìm thấy OKR" text="OKR này không tồn tại hoặc không thuộc về bạn." action={<Link to="/checkin" className="btn">Về trang check-in</Link>} />

  const pct = okrPercent({ krs })

  const save = (final) => {
    if (final && !form.summary.trim()) return setError('Nhập tóm tắt tiến độ trước khi gửi check-in cuối.')
    setError('')
    const rec = { okr_id: okr.id, user_id: me.id, date: '2026-11-16', percent: pct, status: final ? 'waiting' : 'draft', ...form }
    if (prev) setCheckins((all) => all.map((c) => (c.id === prev.id ? { ...c, ...rec } : c)))
    else setCheckins((all) => [{ id: newId(), ...rec }, ...all])
    setOkrs((all) => all.map((o) => (o.id === okr.id ? { ...o, krs } : o)))
    notify(final ? 'Đã gửi check-in cuối, chờ cấp trên phản hồi' : 'Đã lưu check-in nháp')
    nav('/checkin')
  }

  return (
    <>
      <PageHead title="Thực hiện check-in" desc={`Tuần ${WEEK.number} · ${okr.objective}`} />
      <div className="grid main-side">
        <section className="card">
          <h2 style={{ marginBottom: 14 }}>Cập nhật kết quả then chốt</h2>
          <div className="stack" style={{ gap: 18 }}>
            {krs.map((k, i) => (
              <div key={k.id}>
                <div className="row between wrap" style={{ gap: 12 }}>
                  <span style={{ fontWeight: 500, flex: 1, minWidth: 200 }}>{k.text}</span>
                  <label className="row" style={{ gap: 8 }}>
                    <input type="number" step="any" min="0" value={k.current} style={{ width: 96 }}
                      onChange={(e) => setKrs((a) => a.map((x, j) => (j === i ? { ...x, current: Number(e.target.value) } : x)))} aria-label={`Giá trị hiện tại: ${k.text}`} />
                    <span className="muted tnum">/ {k.target} {k.unit}</span>
                  </label>
                </div>
                <div className="row" style={{ gap: 12, marginTop: 8 }}>
                  <Progress value={krPercent(k)} />
                  <span className="tnum small" style={{ minWidth: 40, textAlign: 'right' }}>{krPercent(k)}%</span>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ margin: '28px 0 14px' }}>Báo cáo tuần</h2>
          <div className="stack" style={{ gap: 16 }}>
            <label className="field">
              Tóm tắt tiến độ
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Tuần này bạn đã làm được gì?" />
            </label>
            <label className="field">
              Công việc đang chậm
              <textarea value={form.slow} onChange={(e) => setForm({ ...form, slow: e.target.value })} style={{ minHeight: 64 }} />
            </label>
            <div className="form-grid">
              <label className="field">
                Khó khăn, trở ngại
                <textarea value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} style={{ minHeight: 64 }} />
              </label>
              <label className="field">
                Giải pháp hoặc cần hỗ trợ
                <textarea value={form.solutions} onChange={(e) => setForm({ ...form, solutions: e.target.value })} style={{ minHeight: 64 }} />
              </label>
            </div>
            <label className="field" style={{ maxWidth: 260 }}>
              Hẹn lịch check-in tiếp theo
              <input type="date" value={form.next} min="2026-11-16" onChange={(e) => setForm({ ...form, next: e.target.value })} />
              <small>Không bắt buộc. Check-in cuối vẫn cần gửi trước buổi họp.</small>
            </label>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Mức độ tự tin hoàn thành</legend>
              <div className="conf">
                {[[1, '1 · Thấp'], [2, '2 · Vừa'], [3, '3 · Cao']].map(([v, l]) => (
                  <label key={v}>
                    <input type="radio" name="conf" checked={form.confidence === v} onChange={() => setForm({ ...form, confidence: v })} />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {error && <p className="error-text" role="alert" style={{ marginTop: 12 }}>{error}</p>}
          <div className="modal-foot">
            <Link className="btn" to="/checkin">Hủy</Link>
            <button className="btn" onClick={() => save(false)}>Lưu nháp</button>
            <button className="btn primary" onClick={() => save(true)}>Gửi check-in cuối</button>
          </div>
        </section>

        <aside className="card" style={{ alignSelf: 'start' }}>
          <h3>Tiến độ OKR</h3>
          <div className="stat-num" style={{ marginTop: 10 }}>{pct}%</div>
          <div className="stat-label">Tính từ giá trị bạn đang nhập</div>
          <p className="notice" style={{ marginTop: 16 }}>Check-in cuối cần gửi trước buổi họp đầu tuần với cấp trên. Sau khi gửi, bạn vẫn sửa lại được cho đến khi cấp trên phản hồi.</p>
        </aside>
      </div>
    </>
  )
}
