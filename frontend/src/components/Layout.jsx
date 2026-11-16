import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { ROLES, WEEK } from '../data/mock.js'
import { Avatar, Icon } from './ui.jsx'

const NAV = [
  { title: '', items: [['/', 'Dashboard', 'home']] },
  {
    title: 'Công việc OKR',
    items: [
      ['/okrs', 'OKRs', 'target'],
      ['/todaylist', 'TodayList', 'list'],
      ['/checkin', 'Check-in', 'check'],
      ['/review', 'Review OKR', 'review', ['manager', 'director']],
    ],
  },
  { title: 'Tương tác', items: [['/cfr', 'CFRs', 'chat'], ['/store', 'Store', 'gift']] },
  {
    title: 'Thống kê',
    items: [
      ['/stats', 'Thống kê', 'chart'],
      ['/reports', 'Báo cáo', 'file'],
    ],
  },
  {
    title: 'Quản trị',
    roles: ['director'],
    items: [['/accounts', 'Quản lý tài khoản', 'users'], ['/logs', 'Nhật ký hoạt động', 'log']],
  },
]

function Bell() {
  const { me, okrs, checkins, feedbacks, recognitions, userById } = useApp()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(false)
  const items = useMemo(() => {
    const list = []
    okrs.filter((o) => o.owner === me.id && o.status === 'needs_edit').forEach((o) => list.push({ k: `n${o.id}`, text: `OKR “${o.objective}” cần chỉnh sửa`, to: `/okrs/${o.id}/edit`, tone: 'danger' }))
    okrs.filter((o) => o.owner === me.id && o.status === 'approved' && o.level === 'personal').forEach((o) => list.push({ k: `a${o.id}`, text: `OKR “${o.objective}” đã được duyệt`, to: '/okrs', tone: 'ok' }))
    feedbacks.filter((f) => f.receiver === me.id).forEach((f) => list.push({ k: `f${f.id}`, text: `${userById(f.sender).fullname} gửi bạn một feedback`, to: '/cfr/feedback', tone: 'info' }))
    recognitions.filter((r) => r.receiver === me.id).forEach((r) => list.push({ k: `r${r.id}`, text: `Bạn được ghi nhận +${r.points} điểm từ ${userById(r.sender).fullname}`, to: '/cfr/recognition', tone: 'warn' }))
    if (me.role !== 'staff') {
      okrs.filter((o) => o.status === 'pending' && o.owner !== me.id && (me.role === 'director' || userById(o.owner)?.superior === me.id))
        .forEach((o) => list.push({ k: `p${o.id}`, text: `${userById(o.owner).fullname} gửi OKR chờ bạn duyệt`, to: '/okrs', tone: 'warn' }))
      checkins.filter((c) => c.status === 'waiting' && (me.role === 'director' || userById(c.user_id)?.superior === me.id))
        .forEach((c) => list.push({ k: `c${c.id}`, text: `${userById(c.user_id).fullname} gửi check-in chờ review`, to: '/review', tone: 'warn' }))
    }
    return list
  }, [me, okrs, checkins, feedbacks, recognitions, userById])
  return (
    <div className="bell">
      <button className="btn sm bell-btn" aria-label={`Thông báo, ${items.length} mục`} aria-expanded={open} onClick={() => { setOpen(!open); setSeen(true) }}>
        <Icon name="bell" />
        {!seen && items.length > 0 && <span className="bell-dot">{items.length}</span>}
      </button>
      {open && (
        <div className="bell-pop" role="menu">
          <div className="bell-head">Thông báo</div>
          {items.length === 0 && <p className="muted" style={{ padding: 16 }}>Bạn chưa có thông báo mới.</p>}
          {items.map((n) => (
            <Link key={n.k} to={n.to} className="bell-item" onClick={() => setOpen(false)}><i className={`dot ${n.tone}`} />{n.text}</Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { me, logout } = useApp()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  return (
    <div className="shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`side ${open ? 'open' : ''}`} aria-label="Điều hướng chính">
        <div className="brand">
          <span className="brand-mark">O</span>
          <span>
            <div className="brand-name">OKR VHV</div>
            <div className="brand-sub">Quản trị hiệu suất</div>
          </span>
        </div>
        <nav className="nav">
          {NAV.filter((g) => !g.roles || g.roles.includes(me.role)).map((g) => (
            <div className="nav-group" key={g.title}>
              {g.title && <div className="nav-title">{g.title}</div>}
              {g.items
                .filter((i) => !i[3] || i[3].includes(me.role))
                .map(([to, label, icon]) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
                    <Icon name={icon} />
                    {label}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who">
            <Avatar user={me} />
            <div>
              <div className="name">{me.fullname}</div>
              <div className="role">{ROLES[me.role]}</div>
            </div>
          </div>
          <NavLink to="/profile" className="btn sm" onClick={() => setOpen(false)}>
            Thông tin cá nhân
          </NavLink>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn sm menu-btn" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Icon name="menu" />
          </button>
          <div className="week">
            Tuần {WEEK.number}
            <small>{WEEK.from} – {WEEK.to}/{WEEK.year}</small>
          </div>
          <span className="spacer" />
          <div className="me">
            <Avatar user={me} size="sm" />
            <span>{me.fullname}<small>{ROLES[me.role]}</small></span>
          </div>
          <Bell />
          {me.role !== 'director' && (
            <NavLink to="/store" className="points-chip" title="Điểm thưởng tích lũy">
              {me.points} điểm
            </NavLink>
          )}
        </header>
        <main className="page" key={loc.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
