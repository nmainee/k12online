import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp, formatDate } from '../store.jsx'
import { WEEK } from '../data/mock.js'
import { Avatar, Empty, Modal, PageHead, RouteTabs } from '../components/ui.jsx'
import { Confetti, Medal } from '../components/art.jsx'

const FB_POINTS = { praise: 5, improve: 2 }

export default function Cfr() {
  const { me, users, userById, conversations, setConversations, feedbacks, setFeedbacks, recognitions, setRecognitions, setUsers, newId, notify } = useApp()
  const { tab: raw } = useParams()
  const tab = ['conversation', 'feedback', 'recognition'].includes(raw) ? raw : 'conversation'
  const [form, setForm] = useState(null)
  const [party, setParty] = useState(false)

  const canRecognize = me.role !== 'staff'
  const others = users.filter((u) => u.id !== me.id && u.active)
  const involved = (a, b) => a === me.id || b === me.id || me.role === 'director'

  const addPoints = (id, n) => setUsers((all) => all.map((u) => (u.id === id ? { ...u, points: u.points + n } : u)))

  const open = (kind) => setForm({
    kind, other: '', topic: '', content: '', action: '', trust: 4, type: 'praise', evidence: '', impact: 'Trung bình', reason: '', points: 10,
  })

  const submit = () => {
    const f = form
    const common = { week: WEEK.number, date: '2026-11-16' }
    if (f.kind === 'conversation') {
      const sub = userById(Number(f.other))
      const managerSide = sub.superior === me.id
      setConversations((a) => [{ id: newId(), manager: managerSide ? me.id : sub.id, participant: managerSide ? sub.id : me.id, topic: f.topic, content: f.content, action: f.action, trust: Number(f.trust), ...common }, ...a])
      notify('Đã lưu nội dung cuộc trò chuyện')
    } else if (f.kind === 'feedback') {
      setFeedbacks((a) => [{ id: newId(), sender: me.id, receiver: Number(f.other), type: f.type, content: f.content, evidence: f.evidence, impact: f.impact, points: FB_POINTS[f.type], ...common }, ...a])
      addPoints(Number(f.other), FB_POINTS[f.type])
      notify(`Đã gửi feedback, người nhận được cộng ${FB_POINTS[f.type]} điểm`)
    } else {
      setRecognitions((a) => [{ id: newId(), sender: me.id, receiver: Number(f.other), reason: f.reason, evidence: f.evidence, points: Number(f.points), ...common }, ...a])
      addPoints(Number(f.other), Number(f.points))
      notify(`Đã gửi ghi nhận, người nhận được cộng ${f.points} điểm`)
    }
    setForm(null)
    if (f.kind !== 'conversation') setParty(true)
  }

  const valid = form && form.other && (form.kind === 'conversation' ? form.topic.trim() && form.content.trim() : form.kind === 'feedback' ? form.content.trim() : form.reason.trim() && Number(form.points) > 0)

  const Person = ({ id }) => { const u = userById(id); return <span className="row" style={{ gap: 8 }}><Avatar user={u} size="sm" /><b>{u.fullname}</b></span> }

  const labelNew = { conversation: 'Ghi cuộc trò chuyện', feedback: 'Gửi feedback', recognition: 'Gửi ghi nhận' }

  return (
    <>
      <PageHead banner="sky" art="cfr" title="CFRs" desc="Conversation (trao đổi sau họp), Feedback (phản hồi) và Recognition (ghi nhận thành tích).">
        {(tab !== 'recognition' || canRecognize) && <button className="btn primary" onClick={() => open(tab)}>{labelNew[tab]}</button>}
      </PageHead>
      <RouteTabs tabs={[['/cfr/conversation', 'Conversation'], ['/cfr/feedback', 'Feedback'], ['/cfr/recognition', 'Recognition']]} />

      {tab === 'conversation' && (() => {
        const list = conversations.filter((c) => involved(c.manager, c.participant))
        return list.length === 0 ? <Empty title="Chưa có cuộc trò chuyện nào" text="Sau buổi họp tuần, hãy ghi lại nội dung và việc cần làm tiếp." /> : (
          <div className="stack" style={{ gap: 16 }}>
            {list.map((c) => (
              <article className="card" key={c.id}>
                <div className="row between wrap">
                  <h3>{c.topic}</h3>
                  <span className="muted small">Tuần {c.week} · {formatDate(c.date)}</span>
                </div>
                <div className="row wrap" style={{ gap: 18, margin: '10px 0' }}><Person id={c.manager} /><span className="muted">với</span><Person id={c.participant} /></div>
                <p>{c.content}</p>
                {c.action && <div className="quote"><b>Việc cần làm:</b> {c.action}</div>}
                <span className="muted small">Mức hài lòng sau họp: {c.trust}/5</span>
              </article>
            ))}
          </div>
        )
      })()}

      {tab === 'feedback' && (() => {
        const list = feedbacks.filter((c) => involved(c.sender, c.receiver))
        return list.length === 0 ? <Empty title="Chưa có feedback nào" text="Gửi lời khen hoặc góp ý cải thiện cho đồng nghiệp về một kết quả cụ thể." /> : (
          <div className="stack" style={{ gap: 16 }}>
            {list.map((c) => (
              <article className="card" key={c.id}>
                <div className="row between wrap">
                  <div className="row wrap" style={{ gap: 12 }}><Person id={c.sender} /><span className="muted">gửi</span><Person id={c.receiver} /></div>
                  <span className={`badge ${c.type === 'praise' ? 'ok' : 'warn'}`}>{c.type === 'praise' ? 'Khen ngợi' : 'Cải thiện'}</span>
                </div>
                <p style={{ marginTop: 10 }}>{c.content}</p>
                <div className="row wrap muted small" style={{ gap: 14, marginTop: 8 }}>
                  <span>Bằng chứng: {c.evidence || 'Không có'}</span><span>Mức ảnh hưởng: {c.impact}</span><span>+{c.points} điểm</span><span>{formatDate(c.date)}</span>
                </div>
              </article>
            ))}
          </div>
        )
      })()}

      {tab === 'recognition' && (() => {
        const list = recognitions
        return list.length === 0 ? <Empty title="Chưa có ghi nhận nào" text="Trưởng phòng và giám đốc ghi nhận thành tích nổi bật kèm điểm thưởng." /> : (
          <div className="grid c2">
            {list.map((c) => (
              <article className="card recog" key={c.id}>
                <span className="medal"><Medal /></span>
                <Person id={c.receiver} />
                <span className="points-chip" style={{ marginTop: 10 }}>+{c.points} điểm</span>
                <p style={{ marginTop: 12 }}>{c.reason}</p>
                <div className="muted small" style={{ marginTop: 10 }}>Từ {userById(c.sender).fullname} · {formatDate(c.date)} · Bằng chứng: {c.evidence || 'Không có'}</div>
              </article>
            ))}
          </div>
        )
      })()}

      {form && (
        <Modal title={labelNew[form.kind]} onClose={() => setForm(null)}>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field">
              {form.kind === 'conversation' ? 'Cuộc họp với' : 'Gửi cho'}
              <select value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })}>
                <option value="">Chọn người</option>
                {others.filter((u) => form.kind !== 'conversation' || u.superior === me.id || u.id === me.superior).map((u) => <option key={u.id} value={u.id}>{u.fullname}</option>)}
              </select>
            </label>
            {form.kind === 'conversation' && (
              <>
                <label className="field">Chủ đề<input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></label>
                <label className="field">Nội dung họp<textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
                <label className="field">Việc cần làm tiếp<textarea style={{ minHeight: 60 }} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} /></label>
                <label className="field">Mức hài lòng (1–5)<input type="number" min="1" max="5" value={form.trust} onChange={(e) => setForm({ ...form, trust: e.target.value })} /></label>
              </>
            )}
            {form.kind === 'feedback' && (
              <>
                <div className="seg" role="group" aria-label="Loại feedback" style={{ alignSelf: 'flex-start' }}>
                  <button type="button" aria-pressed={form.type === 'praise'} onClick={() => setForm({ ...form, type: 'praise' })}>Khen ngợi (+5 điểm)</button>
                  <button type="button" aria-pressed={form.type === 'improve'} onClick={() => setForm({ ...form, type: 'improve' })}>Cải thiện (+2 điểm)</button>
                </div>
                <label className="field">Nội dung<textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
                <label className="field">Bằng chứng<input type="text" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Liên kết hoặc tên công việc" /></label>
                <label className="field">Mức ảnh hưởng
                  <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}><option>Thấp</option><option>Trung bình</option><option>Cao</option></select>
                </label>
              </>
            )}
            {form.kind === 'recognition' && (
              <>
                <label className="field">Lý do ghi nhận<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
                <label className="field">Bằng chứng<input type="text" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></label>
                <label className="field">Điểm thưởng<input type="number" min="1" max="50" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} /></label>
              </>
            )}
          </div>
          <div className="modal-foot">
            <button className="btn" onClick={() => setForm(null)}>Hủy</button>
            <button className="btn primary" onClick={submit} disabled={!valid}>{labelNew[form.kind]}</button>
          </div>
        </Modal>
      )}
      {party && <Confetti onDone={() => setParty(false)} />}
    </>
  )
}
