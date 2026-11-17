import { useState } from 'react'
import { useApp } from '../store.jsx'
import { ROLES, users as demoUsers } from '../data/mock.js'
import { Avatar } from '../components/ui.jsx'
import { LoginBackdrop, Mascot } from '../components/art.jsx'

export default function Login() {
  const { signIn, online } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const enter = async (name, pass) => {
    setBusy(true); setError('')
    const res = await signIn(name.trim(), pass)
    setBusy(false)
    if (!res.ok) setError(res.error)
  }
  const submit = (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return setError('Nhập tên đăng nhập và mật khẩu để tiếp tục.')
    enter(username, password)
  }

  return (
    <div className="login">
      <section className="login-art">
        <LoginBackdrop />
        <div className="brand">
          <span className="brand-mark">O</span>
          <span>
            <div className="brand-name">OKR VHV</div>
            <div className="brand-sub">Công ty CP Truyền thông Văn Hoá Việt</div>
          </span>
        </div>
        <div>
          <h1>Mỗi tuần một vòng OKR, rõ ràng từ mục tiêu đến kết quả</h1>
          <p>Đặt mục tiêu, check-in, họp, nhận phản hồi và tổng kết điểm thưởng trong cùng một nơi.</p>
        </div>
      </section>

      <section className="login-form">
        <div className="login-box">
          <div className="login-greet"><Mascot size={72} mood="cheer" /><div><h2 style={{ fontSize: 26 }}>Chào mừng trở lại</h2><p className="muted">Đăng nhập để bắt đầu tuần làm việc.</p></div></div>
          <form className="stack" style={{ marginTop: 20, gap: 16 }} onSubmit={submit} noValidate>
            <label className="field">
              Tên đăng nhập
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
            </label>
            <label className="field">
              Mật khẩu
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            {error && <p className="error-text" role="alert">{error}</p>}
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
          </form>

          <div style={{ marginTop: 28 }}>
            <p className="muted small">Xem thử giao diện theo vai trò:</p>
            <div className="demo-users">
              {demoUsers.filter((u) => [1, 2, 3].includes(u.id)).map((u) => (
                <button key={u.id} className="demo-user" disabled={busy} onClick={() => enter(u.username, online === false ? 'demo1234' : '123456')}>
                  <Avatar user={u} />
                  <span>
                    <div style={{ fontWeight: 600 }}>{u.fullname}</div>
                    <div className="muted small">{ROLES[u.role]}</div>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="login-note">{online === false ? 'Chưa nối CSDL: đang dùng dữ liệu minh họa.' : 'Đã nối CSDL okr. Mật khẩu mẫu: 123456.'}</p>
      </section>
    </div>
  )
}
