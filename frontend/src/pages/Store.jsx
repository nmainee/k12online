import { useState } from 'react'
import { useApp, formatDate } from '../store.jsx'
import { Empty, Modal, PageHead, Tabs } from '../components/ui.jsx'
import { Confetti, GiftArt } from '../components/art.jsx'

export default function Store() {
  const { me, gifts, setGifts, redeems, setRedeems, setUsers, userById, newId, notify } = useApp()
  const [tab, setTab] = useState('shop')
  const [pick, setPick] = useState(null)
  const [qty, setQty] = useState(1)
  const [editing, setEditing] = useState(null)
  const [party, setParty] = useState(false)
  const admin = me.role === 'director'

  const redeem = () => {
    const total = pick.points * qty
    setUsers((all) => all.map((u) => (u.id === me.id ? { ...u, points: u.points - total } : u)))
    setGifts((all) => all.map((g) => (g.id === pick.id ? { ...g, stock: g.stock - qty } : g)))
    setRedeems((all) => [{ id: newId(), user_id: me.id, gift_id: pick.id, quantity: qty, points: total, date: '2026-11-16' }, ...all])
    notify(`Đã đổi “${pick.name}”. Còn ${me.points - total} điểm`)
    setPick(null); setQty(1); setParty(true)
  }

  const saveGift = () => {
    const g = editing
    if (g.id) setGifts((all) => all.map((x) => (x.id === g.id ? g : x)))
    else setGifts((all) => [...all, { ...g, id: newId() }])
    notify(g.id ? 'Đã cập nhật quà tặng' : 'Đã thêm quà tặng'); setEditing(null)
  }

  const history = redeems.filter((r) => admin || r.user_id === me.id)

  return (
    <>
      <PageHead banner="warm" art="store" title="Store" desc="Đổi điểm thưởng tích lũy từ review OKR, feedback và ghi nhận lấy quà của công ty.">
        {!admin && <span className="points-chip" style={{ fontSize: 16 }}>Bạn có {me.points} điểm</span>}
        {admin && <button className="btn primary" onClick={() => setEditing({ name: '', points: 50, stock: 10, description: '' })}>Thêm quà tặng</button>}
      </PageHead>
      <Tabs tabs={[['shop', 'Quà tặng'], ['history', admin ? 'Lịch sử đổi quà' : 'Lịch sử của tôi']]} value={tab} onChange={setTab} />

      {tab === 'shop' && (
        <div className="grid c3">
          {gifts.map((g, i) => {
            const short = !admin && me.points < g.points
            return (
              <article className="card gift" key={g.id}>
                <GiftArt name={g.name} tone={i} />
                <h3>{g.name}</h3>
                <p className="muted small" style={{ flex: 1 }}>{g.description}</p>
                <div className="row between">
                  <span className="gift-price">{g.points} điểm</span>
                  <span className="muted small">{g.stock > 0 ? `Còn ${g.stock}` : 'Hết hàng'}</span>
                </div>
                {admin ? (
                  <button className="btn" onClick={() => setEditing({ ...g })}>Chỉnh sửa</button>
                ) : (
                  <button className="btn primary" disabled={g.stock === 0 || short} onClick={() => { setPick(g); setQty(1) }}>
                    {g.stock === 0 ? 'Hết hàng' : short ? `Cần thêm ${g.points - me.points} điểm` : 'Đổi quà'}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}

      {tab === 'history' && (history.length === 0 ? (
        <Empty title="Chưa có giao dịch nào" text="Khi đổi quà, giao dịch sẽ được ghi lại tại đây." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Ngày</th>{admin && <th>Người đổi</th>}<th>Quà tặng</th><th className="num">Số lượng</th><th className="num">Điểm đã dùng</th></tr></thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  {admin && <td>{userById(r.user_id).fullname}</td>}
                  <td>{gifts.find((g) => g.id === r.gift_id)?.name}</td>
                  <td className="num">{r.quantity}</td>
                  <td className="num">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {pick && (
        <Modal title="Xác nhận đổi quà" onClose={() => setPick(null)}>
          <h3>{pick.name}</h3>
          <p className="muted" style={{ margin: '6px 0 16px' }}>{pick.description}</p>
          <label className="field" style={{ maxWidth: 160 }}>
            Số lượng
            <input type="number" min="1" max={Math.min(pick.stock, Math.floor(me.points / pick.points))} value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(Math.min(pick.stock, Math.floor(me.points / pick.points)), Number(e.target.value) || 1)))} />
          </label>
          <dl className="kv" style={{ marginTop: 16 }}>
            <dt>Điểm hiện có</dt><dd>{me.points}</dd>
            <dt>Điểm sẽ dùng</dt><dd>{pick.points * qty}</dd>
            <dt>Điểm còn lại</dt><dd><b>{me.points - pick.points * qty}</b></dd>
          </dl>
          <div className="modal-foot">
            <button className="btn" onClick={() => setPick(null)}>Hủy</button>
            <button className="btn primary" onClick={redeem}>Đổi {pick.points * qty} điểm</button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title={editing.id ? 'Chỉnh sửa quà tặng' : 'Thêm quà tặng'} onClose={() => setEditing(null)}>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field">Tên quà tặng<input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
            <div className="form-grid">
              <label className="field">Điểm đổi<input type="number" min="1" value={editing.points} onChange={(e) => setEditing({ ...editing, points: Number(e.target.value) })} /></label>
              <label className="field">Số lượng trong kho<input type="number" min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label>
            </div>
            <label className="field">Mô tả<textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
          </div>
          <div className="modal-foot">
            <button className="btn" onClick={() => setEditing(null)}>Hủy</button>
            <button className="btn primary" onClick={saveGift} disabled={!editing.name.trim()}>Lưu</button>
          </div>
        </Modal>
      )}
      {party && <Confetti onDone={() => setParty(false)} />}
    </>
  )
}
