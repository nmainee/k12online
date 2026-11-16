import { useState } from 'react'
import { useApp } from '../store.jsx'
import { ROLES } from '../data/mock.js'
import { Avatar, Modal, PageHead } from '../components/ui.jsx'

export default function Accounts() {
  const { me, users, setUsers, departments, deptName, userById, newId, notify, ask } = useApp()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('all')
  const [editing, setEditing] = useState(null)
  const [sel, setSel] = useState([])

  const list = users.filter((u) => (role === 'all' || u.role === role) && (u.fullname + u.username).toLowerCase().includes(q.toLowerCase()))
  const bosses = users.filter((u) => u.role !== 'staff' && (!editing || u.id !== editing.id))

  const save = () => {
    const e = editing
    if (e.id) setUsers((all) => all.map((u) => (u.id === e.id ? { ...u, ...e } : u)))
    else setUsers((all) => [...all, { ...e, id: newId(), points: 0, active: true }])
    notify(e.id ? 'Đã cập nhật tài khoản' : 'Đã thêm tài khoản. Mật khẩu tạm gửi tới email của nhân viên.')
    setEditing(null)
  }
  const toggle = (u) => { setUsers((all) => all.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x))); notify(u.active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản') }
  const remove = async (u) => {
    const ok = await ask({ title: 'Xóa tài khoản này?', body: 'Dữ liệu OKR của họ vẫn được giữ lại.', items: [u.fullname], confirmLabel: 'Xóa tài khoản', danger: true })
    if (!ok) return
    setUsers((all) => all.filter((x) => x.id !== u.id)); notify('Đã xóa tài khoản')
  }
  const pickable = list.filter((u) => u.id !== me.id)
  const allPicked = pickable.length > 0 && pickable.every((u) => sel.includes(u.id))
  const chosen = users.filter((u) => sel.includes(u.id))
  const bulkLock = async (lock) => {
    const ok = await ask({ title: `${lock ? 'Khóa' : 'Mở khóa'} ${chosen.length} tài khoản?`, items: chosen.map((u) => u.fullname), confirmLabel: `${lock ? 'Khóa' : 'Mở khóa'} ${chosen.length} tài khoản`, danger: lock })
    if (!ok) return
    setUsers((all) => all.map((x) => (sel.includes(x.id) ? { ...x, active: !lock } : x)))
    notify(`Đã ${lock ? 'khóa' : 'mở khóa'} ${chosen.length} tài khoản`); setSel([])
  }
  const bulkDelete = async () => {
    const ok = await ask({ title: `Xóa ${chosen.length} tài khoản?`, body: 'Dữ liệu OKR của họ vẫn được giữ lại.', items: chosen.map((u) => u.fullname), confirmLabel: `Xóa ${chosen.length} tài khoản`, danger: true })
    if (!ok) return
    setUsers((all) => all.filter((x) => !sel.includes(x.id)))
    notify(`Đã xóa ${chosen.length} tài khoản`); setSel([])
  }

  const valid = editing && editing.fullname.trim() && editing.username.trim() && /\S+@\S+\.\S+/.test(editing.email)

  return (
    <>
      <PageHead title="Quản lý tài khoản" desc="Thêm, phân quyền, khóa hoặc xóa tài khoản của nhân viên.">
        <button className="btn primary" onClick={() => setEditing({ fullname: '', username: '', email: '', phone: '', role: 'staff', department_id: 2, superior: 2, gender: 'Nam' })}>Thêm tài khoản</button>
      </PageHead>

      <div className="filters">
        <input type="text" placeholder="Tìm theo tên hoặc tên đăng nhập" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm tài khoản" style={{ minWidth: 260 }} />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Lọc vai trò">
          <option value="all">Mọi vai trò</option>
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {sel.length > 0 && (
        <div className="bulkbar" role="region" aria-label="Thao tác hàng loạt">
          <b>Đã chọn {sel.length} tài khoản</b>
          <span style={{ flex: 1 }} />
          <button className="btn sm" onClick={() => bulkLock(true)}>Khóa</button>
          <button className="btn sm" onClick={() => bulkLock(false)}>Mở khóa</button>
          <button className="btn sm danger" onClick={bulkDelete}>Xóa</button>
          <button className="btn sm" onClick={() => setSel([])}>Bỏ chọn</button>
        </div>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 40 }}><input type="checkbox" aria-label="Chọn tất cả" checked={allPicked} onChange={() => setSel(allPicked ? [] : pickable.map((u) => u.id))} /></th><th>Nhân sự</th><th>Vai trò</th><th>Phòng ban</th><th>Cấp trên</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.id !== me.id && <input type="checkbox" aria-label={`Chọn ${u.fullname}`} checked={sel.includes(u.id)} onChange={() => setSel((a) => (a.includes(u.id) ? a.filter((x) => x !== u.id) : [...a, u.id]))} />}</td>
                <td><div className="row"><Avatar user={u} /><div><b>{u.fullname}</b><div className="muted small">{u.username} · {u.email}</div></div></div></td>
                <td>{ROLES[u.role]}</td>
                <td>{deptName(u.department_id)}</td>
                <td>{u.superior ? userById(u.superior)?.fullname : 'Không có'}</td>
                <td><span className={`badge ${u.active ? 'ok' : 'muted'}`}>{u.active ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                <td>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn sm" onClick={() => setEditing({ ...u })}>Sửa</button>
                    {u.id !== me.id && <button className="btn sm" onClick={() => toggle(u)}>{u.active ? 'Khóa' : 'Mở khóa'}</button>}
                    {u.id !== me.id && <button className="btn sm danger" onClick={() => remove(u)}>Xóa</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Sửa tài khoản' : 'Thêm tài khoản'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <label className="field full">Họ và tên<input type="text" value={editing.fullname} onChange={(e) => setEditing({ ...editing, fullname: e.target.value })} /></label>
            <label className="field">Tên đăng nhập<input type="text" value={editing.username} disabled={!!editing.id} onChange={(e) => setEditing({ ...editing, username: e.target.value })} /></label>
            <label className="field">Số điện thoại<input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></label>
            <label className="field full">Email<input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></label>
            <label className="field">Vai trò
              <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="field">Phòng ban
              <select value={editing.department_id} onChange={(e) => setEditing({ ...editing, department_id: Number(e.target.value) })}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            {editing.role !== 'director' && (
              <label className="field full">Cấp trên trực tiếp
                <select value={editing.superior ?? ''} onChange={(e) => setEditing({ ...editing, superior: Number(e.target.value) || null })}>
                  {bosses.map((b) => <option key={b.id} value={b.id}>{b.fullname} · {ROLES[b.role]}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="modal-foot">
            <button className="btn" onClick={() => setEditing(null)}>Hủy</button>
            <button className="btn primary" onClick={save} disabled={!valid}>Lưu tài khoản</button>
          </div>
        </Modal>
      )}
    </>
  )
}
