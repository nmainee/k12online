import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { statusMap } from '../data/mock.js'
import { EmptyArt, PageArt } from './art.jsx'

const ICONS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  target: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1M12 12l8-8',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  check: 'M4 12l5 5L20 6',
  review: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  gift: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H8a2.5 2.5 0 1 1 0-5c2 0 4 2 4 5zM12 7h4a2.5 2.5 0 1 0 0-5c-2 0-4 2-4 5z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  plus: 'M12 5v14M5 12h14',
  menu: 'M3 6h18M3 12h18M3 18h18',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  log: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
}

export function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export function Badge({ kind, value }) {
  const s = statusMap[kind][value]
  return <span className={`badge ${s.tone}`}>{s.label}</span>
}

const AV_COLORS = ['#2f6bff', '#ff6fa5', '#1fb28a', '#f59e0b', '#2f6bff', '#a855f7']
export function Avatar({ user, size }) {
  if (!user) return null
  if (user.avatar) return <img className={`avatar ${size || ''}`} src={user.avatar} alt={user.fullname} style={{ objectFit: 'cover' }} />
  const parts = user.fullname.split(' ')
  const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (
    <span className={`avatar ${size || ''}`} style={{ background: AV_COLORS[user.id % AV_COLORS.length] }} title={user.fullname}>
      {initials}
    </span>
  )
}

export function Progress({ value, tone }) {
  const t = tone || (value < 40 ? 'danger' : value < 70 ? 'warn' : '')
  return (
    <div className={`progress ${t}`} role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <i style={{ width: `${value}%` }} />
    </div>
  )
}

export function Ring({ value, size = 96, stroke = 9 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8eefb" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <b>{value}%</b>
    </span>
  )
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <h2 style={{ marginBottom: 16 }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Empty({ title, text, action, kind }) {
  return (
    <div className="card empty">
      <EmptyArt kind={kind} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function PageHead({ title, desc, children, banner, art }) {
  if (banner) {
    return (
      <div className={`page-banner ${banner}`}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1>{title}</h1>
          {desc && <p>{desc}</p>}
          {children && <div className="row wrap">{children}</div>}
        </div>
        {art && <PageArt kind={art} />}
      </div>
    )
  }
  return (
    <div className="page-head">
      <div className="grow">
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      <div className="row wrap">{children}</div>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  )
}

export function RouteTabs({ tabs }) {
  return (
    <nav className="tabs route-tabs" aria-label="Chuyển mục">
      {tabs.map(([to, label]) => (
        <NavLink key={to} to={to} end>{label}</NavLink>
      ))}
    </nav>
  )
}

export function BarList({ rows, suffix = '%' }) {
  return (
    <div>
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="label">{r.label}</span>
          <span className="bar-track"><i style={{ width: `${Math.min(100, r.pct ?? r.value)}%`, background: r.color }} /></span>
          <span className="val">{r.value}{suffix}</span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data }) {
  const W = 880, H = 260, PL = 36, PR = 24, PT = 28, PB = 34
  const x = (i) => PL + (i * (W - PL - PR)) / (data.length - 1)
  const y = (v) => PT + (1 - v / 100) * (H - PT - PB)
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const area = `${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const diff = prev ? last.value - prev.value : 0
  const best = data.reduce((a, b) => (b.value > a.value ? b : a), data[0])
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)
  return (
    <div className="trend">
      <svg className="trend-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Xu hướng tiến độ OKR theo tuần">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={PL} x2={W - PR} y1={y(g)} y2={y(g)} stroke="#e1e7e4" strokeDasharray={g === 0 ? undefined : '3 4'} />
            <text x={PL - 8} y={y(g) + 4} fontSize="12" textAnchor="end" fill="#5d6479">{g}</text>
          </g>
        ))}
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.week}>
            <circle cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 7 : 5} fill={i === data.length - 1 ? 'var(--primary)' : '#fff'} stroke="var(--primary)" strokeWidth="3" />
            <text x={x(i)} y={y(d.value) - 14} fontSize="13" fontWeight="700" textAnchor="middle" fill="#14213d">{d.value}</text>
            <text x={x(i)} y={H - 10} fontSize="12" textAnchor="middle" fill="#5d6479">{d.week}</text>
          </g>
        ))}
      </svg>
      <div className="trend-side">
        <div><span className="muted small">Tuần này</span><b>{last.value}%</b>
          <span className={`small ${diff >= 0 ? 'up' : 'down'}`}>{diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} điểm so với tuần trước</span></div>
        <div><span className="muted small">Trung bình {data.length} tuần</span><b>{avg}%</b></div>
        <div><span className="muted small">Tuần cao nhất</span><b>{best.week} · {best.value}%</b></div>
      </div>
    </div>
  )
}
