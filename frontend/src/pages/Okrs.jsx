import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp, okrPercent, krPercent } from '../store.jsx'
import { levelLabel } from '../data/mock.js'
import { Avatar, Badge, Empty, Modal, PageHead, Progress } from '../components/ui.jsx'

function TreeNode({ okr, all, depth, userById, open, toggle }) {
  const kids = all.filter((o) => o.parent === okr.id)
  const isOpen = open[okr.id] !== false
  const pct = okrPercent(okr)
  return (
    <li>
      <div className={`tree-node lv-${okr.level}`} style={{ marginLeft: depth * 28 }}>
        {kids.length > 0
          ? <button className="tree-toggle" aria-expanded={isOpen} aria-label={`${isOpen ? 'Thu gọn' : 'Mở rộng'} ${kids.length} OKR con`} onClick={() => toggle(okr.id)}>{isOpen ? '▾' : '▸'}</button>
          : <span className="tree-toggle spacer" />}
        <div className="tree-body">
          <div className="row wrap" style={{ gap: 8 }}>
            <span className={`tag ${okr.level}`}>{levelLabel[okr.level]}</span>
            <b>{okr.objective}</b>
            <Badge kind="okr" value={okr.status} />
          </div>
          <div className="row" style={{ gap: 10, marginTop: 6 }}>
            <Avatar user={userById(okr.owner)} size="sm" />
            <span className="small">{userById(okr.owner).fullname}</span>
            <span style={{ flex: 1, maxWidth: 240 }}><Progress value={pct} /></span>
            <b className="tnum small">{pct}%</b>
          </div>
        </div>
      </div>
      {kids.length > 0 && isOpen && (
        <ul className="tree-list">
          {kids.map((k) => <TreeNode key={k.id} okr={k} all={all} depth={depth + 1} userById={userById} open={open} toggle={toggle} />)}
        </ul>
      )}
    </li>
  )
}

export default function Okrs() {
  const { me, okrs, setOkrs, userById, notify, ask } = useApp()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') || (me.role === 'director' ? 'tree' : 'list')
  const setView = (v) => setParams(v === 'list' ? { view: 'list' } : { view: v })
  const [level, setLevel] = useState('all')
  const [status, setStatus] = useState('all')
  const [scope, setScope] = useState('mine')
  const [open, setOpen] = useState({})
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: o[id] === false }))
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')

  const canSee = (o) => {
    if (o.owner === me.id) return true
    if (o.visibility === 'private') return false
    if (me.role === 'director') return true
    if (me.role === 'manager') return userById(o.owner)?.superior === me.id || o.level === 'company' || o.department_id === me.department_id
    return o.level !== 'personal' || o.department_id === me.department_id
  }

  const list = okrs
    .filter(canSee)
    .filter((o) => (scope === 'mine' ? o.owner === me.id : o.owner !== me.id))
    .filter((o) => level === 'all' || o.level === level)
    .filter((o) => status === 'all' || o.status === status)

  const canApprove = (o) => o.status === 'pending' && o.owner !== me.id && (me.role === 'director' || userById(o.owner)?.superior === me.id)

  const setStatusOf = (id, s) => setOkrs((all) => all.map((o) => (o.id === id ? { ...o, status: s } : o)))
  const approve = (o) => { setStatusOf(o.id, 'approved'); notify('Đã duyệt OKR') }
  const reject = () => {
    setStatusOf(rejecting.id, 'needs_edit')
    notify('Đã yêu cầu chỉnh sửa OKR')
    setRejecting(null); setReason('')
  }
  const remove = async (o) => {
    const ok = await ask({ title: 'Xóa OKR này?', body: 'OKR và các KR của nó sẽ bị xóa khỏi hệ thống.', items: [o.objective], confirmLabel: 'Xóa OKR', danger: true })
    if (!ok) return
    setOkrs((all) => all.filter((x) => x.id !== o.id))
    notify('Đã xóa OKR', 'ok', { label: 'Hoàn tác', run: () => setOkrs((all) => [...all, o].sort((a, b) => a.id - b.id)) })
  }

  return (
    <>
      <PageHead title="OKRs" desc="Mục tiêu và kết quả then chốt theo ba cấp: công ty (theo tháng), nhóm và cá nhân (theo tuần).">
        <Link to="/okrs/new" className="btn primary">Tạo OKR</Link>
      </PageHead>

      <div className="filters">
        <div className="seg" role="group" aria-label="Kiểu xem">
          <button aria-pressed={view === 'list'} onClick={() => setView('list')}>Danh sách</button>
          <button aria-pressed={view === 'tree'} onClick={() => setView('tree')}>Cây liên kết</button>
        </div>
        {view === 'list' && (
          <div className="seg" role="group" aria-label="Phạm vi">
            <button aria-pressed={scope === 'mine'} onClick={() => setScope('mine')}>Của tôi</button>
            <button aria-pressed={scope === 'others'} onClick={() => setScope('others')}>{me.role === 'staff' ? 'Nhóm và công ty' : 'Cấp dưới và công ty'}</button>
          </div>
        )}
        {view === 'list' && (
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Lọc theo cấp">
            <option value="all">Mọi cấp</option>
            {Object.entries(levelLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Lọc theo trạng thái">
          <option value="all">Mọi trạng thái</option>
          <option value="draft">Đã nháp</option>
          <option value="pending">Chờ duyệt</option>
          <option value="needs_edit">Cần chỉnh sửa</option>
          <option value="approved">Đã duyệt</option>
        </select>
      </div>

      {view === 'tree' && (() => {
        const visible = okrs.filter(canSee).filter((o) => status === 'all' || o.status === status)
        const ids = new Set(visible.map((o) => o.id))
        const roots = visible.filter((o) => !o.parent || !ids.has(o.parent))
        return roots.length === 0 ? (
          <Empty kind="search" title="Không có OKR nào khớp bộ lọc" text="Thử đổi bộ lọc trạng thái để xem thêm." />
        ) : (
          <section className="card">
            <p className="muted small" style={{ marginBottom: 12 }}>Mỗi nhánh là các OKR con gắn với OKR cấp trên của chúng. Bấm mũi tên để thu gọn.</p>
            <ul className="tree-list root">
              {roots.map((o) => <TreeNode key={o.id} okr={o} all={visible} depth={0} userById={userById} open={open} toggle={toggle} />)}
            </ul>
          </section>
        )
      })()}

      {view === 'list' && list.length === 0 && (
        <Empty
          title="Không có OKR nào khớp bộ lọc"
          text="Thử đổi phạm vi hoặc bộ lọc, hoặc tạo một OKR mới cho chu kỳ này."
          action={<Link to="/okrs/new" className="btn primary">Tạo OKR</Link>}
        />
      )}

      <div className="stack" style={{ gap: 16 }}>
        {view === 'list' && list.map((o) => {
          const owner = userById(o.owner)
          const parent = okrs.find((p) => p.id === o.parent)
          const pct = okrPercent(o)
          return (
            <article className="card okr-card" key={o.id}>
              <div className="row wrap" style={{ gap: 8, marginBottom: 10 }}>
                <span className={`tag ${o.level}`}>{levelLabel[o.level]}</span>
                <span className="muted small">{o.cycle}</span>
                {o.visibility === 'private' && <span className="muted small">· Riêng tư</span>}
                <span style={{ flex: 1 }} />
                <Badge kind="okr" value={o.status} />
              </div>
              <h3 className="okr-obj">{o.objective}</h3>
              <div className="row" style={{ marginTop: 8, gap: 8 }}>
                <Avatar user={owner} size="sm" />
                <span className="small">{owner.fullname}</span>
                {parent && <span className="muted small">· gắn với “{parent.objective}”</span>}
              </div>

              <div className="kr-list">
                {o.krs.map((k) => (
                  <div className="kr" key={k.id}>
                    <span className="kr-text">{k.text}</span>
                    <span className="kr-val">{k.current}/{k.target} {k.unit} · {krPercent(k)}%</span>
                    <Progress value={krPercent(k)} />
                  </div>
                ))}
              </div>

              <div className="row between wrap" style={{ marginTop: 16, gap: 10 }}>
                <b className="tnum">Hoàn thành {pct}%</b>
                <div className="row wrap">
                  {canApprove(o) && (
                    <>
                      <button className="btn sm danger" onClick={() => setRejecting(o)}>Yêu cầu sửa</button>
                      <button className="btn sm primary" onClick={() => approve(o)}>Duyệt</button>
                    </>
                  )}
                  {o.owner === me.id && o.status === 'approved' && <Link className="btn sm" to={`/checkin/${o.id}`}>Check-in</Link>}
                  {o.owner === me.id && o.status !== 'approved' && <Link className="btn sm" to={`/okrs/${o.id}/edit`}>Chỉnh sửa</Link>}
                  {o.owner === me.id && o.status !== 'approved' && <button className="btn sm danger" onClick={() => remove(o)}>Xóa</button>}
                </div>
              </div>
            </article>
          )
        })}
      </div>

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
    </>
  )
}
