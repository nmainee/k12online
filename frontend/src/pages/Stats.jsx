import { useParams } from 'react-router-dom'
import { useApp, okrPercent } from '../store.jsx'
import { weeklyTrend } from '../data/mock.js'
import { BarList, PageHead, RouteTabs, TrendChart } from '../components/ui.jsx'

export function useStatRows() {
  const { okrs, users, departments, feedbacks, recognitions, reviews, userById } = useApp()
  const approved = okrs.filter((o) => o.status === 'approved')

  const dept = departments.filter((d) => d.id !== 1).map((d) => {
    const l = approved.filter((o) => o.department_id === d.id)
    return { id: d.id, name: d.name, count: l.length, pct: l.length ? Math.round(l.reduce((s, o) => s + okrPercent(o), 0) / l.length) : 0 }
  })
  const people = users.filter((u) => u.role !== 'director' && u.active).map((u) => {
    const l = okrs.filter((o) => o.owner === u.id)
    const done = l.filter((o) => o.status === 'approved')
    return { id: u.id, name: u.fullname, department_id: u.department_id, count: l.length, pct: done.length ? Math.round(done.reduce((s, o) => s + okrPercent(o), 0) / done.length) : 0 }
  })
  const points = users.filter((u) => u.role !== 'director').map((u) => {
    const review = reviews.filter((r) => okrs.find((o) => o.id === r.okr_id)?.owner === u.id).reduce((s, r) => s + r.score, 0)
    const fb = feedbacks.filter((f) => f.receiver === u.id).reduce((s, f) => s + f.points, 0)
    const rc = recognitions.filter((r) => r.receiver === u.id).reduce((s, r) => s + r.points, 0)
    return { id: u.id, name: u.fullname, department_id: u.department_id, review, fb, rc, total: u.points }
  })
  return { dept, people, points, userById }
}

export default function Stats() {
  const { me, departments } = useApp()
  const { tab: raw } = useParams()
  const tab = raw === 'okrs' ? 'okrs' : 'points'
  const { dept, people, points } = useStatRows()
  const lead = me.role !== 'staff'
  const scope = (list) => (me.role === 'director' ? list : me.role === 'manager' ? list.filter((p) => p.department_id === me.department_id) : list.filter((p) => p.id === me.id))
  const visiblePeople = scope(people)
  const visiblePoints = scope(points).sort((a, b) => b.total - a.total)
  const maxPts = Math.max(1, ...visiblePoints.map((p) => p.total))
  const maxDeptCount = Math.max(1, ...dept.map((x) => x.count))
  const maxPeopleCount = Math.max(1, ...visiblePeople.map((x) => x.count))

  return (
    <>
      <PageHead banner="mint" art="chart" title="Thống kê" desc="Điểm thưởng người dùng và tiến độ OKR tuần 47. Số liệu OKR lấy từ các OKR đã duyệt." />
      <RouteTabs tabs={[['/stats/points', 'Điểm người dùng'], ['/stats/okrs', 'Thống kê OKRs']]} />

      {tab === 'points' && (
        <section className="card">
          <div className="card-head">
            <h2>Thống kê điểm người dùng</h2>
            <div className="legend"><span><i style={{ background: 'var(--primary)' }} />Review</span><span><i style={{ background: 'var(--info)' }} />Feedback</span><span><i style={{ background: 'var(--accent)' }} />Ghi nhận</span></div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nhân sự</th><th>Phòng ban</th><th className="num">Review</th><th className="num">Feedback</th><th className="num">Ghi nhận</th><th className="num">Điểm hiện có</th></tr></thead>
              <tbody>
                {visiblePoints.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b></td>
                    <td>{departments.find((d) => d.id === p.department_id)?.name}</td>
                    <td className="num">{p.review}</td><td className="num">{p.fb}</td><td className="num">{p.rc}</td>
                    <td className="num"><b>{p.total}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>Điểm hiện có đã trừ các lần đổi quà, nên có thể thấp hơn tổng ba cột.</p>
          <div style={{ marginTop: 18 }}>
            <BarList suffix="" rows={visiblePoints.map((p) => ({ label: p.name, value: p.total, pct: (p.total / maxPts) * 100, color: 'var(--accent)' }))} />
          </div>
        </section>
      )}

      {tab === 'okrs' && (
        <div className="grid c2">
          {lead && (
            <section className="card">
              <div className="card-head"><h2>Tiến độ OKRs theo phòng ban</h2><span className="muted small">%</span></div>
              <BarList rows={dept.map((d) => ({ label: d.name, value: d.pct }))} />
            </section>
          )}
          {lead && (
            <section className="card">
              <div className="card-head"><h2>Số lượng OKRs theo phòng ban</h2><span className="muted small">OKR đã duyệt</span></div>
              <BarList suffix="" rows={dept.map((d) => ({ label: d.name, value: d.count, pct: (d.count / maxDeptCount) * 100, color: 'var(--info)' }))} />
            </section>
          )}
          <section className="card">
            <div className="card-head"><h2>Tiến độ OKRs theo cá nhân</h2><span className="muted small">%</span></div>
            <BarList rows={visiblePeople.map((p) => ({ label: p.name, value: p.pct }))} />
          </section>
          <section className="card">
            <div className="card-head"><h2>Số lượng OKRs theo cá nhân</h2><span className="muted small">Tất cả trạng thái</span></div>
            <BarList suffix="" rows={visiblePeople.map((p) => ({ label: p.name, value: p.count, pct: (p.count / maxPeopleCount) * 100, color: 'var(--info)' }))} />
          </section>
          {lead && (
            <section className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-head"><h2>Xu hướng toàn công ty</h2><span className="muted small">Tiến độ trung bình, %</span></div>
              <TrendChart data={weeklyTrend} />
            </section>
          )}
        </div>
      )}
    </>
  )
}
