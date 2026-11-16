import { useState } from 'react'
import { useApp } from '../store.jsx'
import { ROLES } from '../data/mock.js'
import { Avatar, PageHead } from '../components/ui.jsx'

export default function Profile() {
  const { me, setUsers, deptName, userById, notify } = useApp()
  const [f, setF] = useState({ fullname: me.fullname, email: me.email, phone: me.phone, gender: me.gender, birth: me.birth })
  const [err, setErr] = useState({})

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!f.fullname.trim()) er.fullname = 'Nhập họ và tên.'
    if (!/\S+@\S+\.\S+/.test(f.email)) er.email = 'Email chưa đúng định dạng, ví dụ ten@vhv.vn.'
    if (f.phone && !/^[0-9 +]{9,14}$/.test(f.phone)) er.phone = 'Số điện thoại chỉ gồm số, 9 đến 14 ký tự.'
    setErr(er)
    if (Object.keys(er).length) return
    setUsers((all) => all.map((u) => (u.id === me.id ? { ...u, ...f } : u)))
    notify('Đã lưu thông tin cá nhân')
  }

  return (
    <>
      <PageHead title="Thông tin cá nhân" desc="Cập nhật hồ sơ của bạn. Vai trò, phòng ban và cấp trên do giám đốc quản lý." />
      <div className="grid main-side">
        <form className="card" onSubmit={save} noValidate>
          <div className="form-grid">
            <label className="field full">Họ và tên<input type="text" value={f.fullname} onChange={(e) => setF({ ...f, fullname: e.target.value })} />{err.fullname && <span className="error-text">{err.fullname}</span>}</label>
            <label className="field">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />{err.email && <span className="error-text">{err.email}</span>}</label>
            <label className="field">Số điện thoại<input type="text" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />{err.phone && <span className="error-text">{err.phone}</span>}</label>
            <label className="field">Giới tính
              <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option>Nam</option><option>Nữ</option><option>Khác</option></select>
            </label>
            <label className="field">Ngày sinh<input type="date" value={f.birth} onChange={(e) => setF({ ...f, birth: e.target.value })} /></label>
          </div>
          <div className="modal-foot"><button className="btn primary" type="submit">Lưu thay đổi</button></div>
        </form>
        <aside className="card">
          <div className="row" style={{ gap: 16 }}>
            <Avatar user={me} size="lg" />
            <div><h3>{me.fullname}</h3><div className="muted">{ROLES[me.role]}</div></div>
          </div>
          <label className="btn sm" style={{ marginTop: 16, cursor: 'pointer' }}>
            Đổi ảnh đại diện
            <input type="file" accept="image/*" hidden onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              if (file.size > 2 * 1024 * 1024) return notify('Ảnh lớn hơn 2 MB. Chọn ảnh nhỏ hơn.', 'danger')
              const r = new FileReader()
              r.onload = () => { setUsers((all) => all.map((u) => (u.id === me.id ? { ...u, avatar: r.result } : u))); notify('Đã đổi ảnh đại diện') }
              r.readAsDataURL(file)
            }} />
          </label>
          <dl className="kv" style={{ marginTop: 20 }}>
            <dt>Tên đăng nhập</dt><dd>{me.username}</dd>
            <dt>Chức vụ</dt><dd>{ROLES[me.role]}</dd>
            <dt>Phòng ban</dt><dd>{deptName(me.department_id)}</dd>
            <dt>Cấp trên</dt><dd>{me.superior ? userById(me.superior).fullname : 'Không có'}</dd>
            <dt>Điểm thưởng</dt><dd>{me.points}</dd>
          </dl>
        </aside>
      </div>
    </>
  )
}
