import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './store.jsx'
import { ROLES } from './data/mock.js'
import { Modal } from './components/ui.jsx'
import { Mascot } from './components/art.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Okrs from './pages/Okrs.jsx'
import OkrForm from './pages/OkrForm.jsx'
import Today, { TodayForm } from './pages/Today.jsx'
import { CheckinList, CheckinDo, CheckinHistory } from './pages/Checkin.jsx'
import Review from './pages/Review.jsx'
import Cfr from './pages/Cfr.jsx'
import Store from './pages/Store.jsx'
import Stats from './pages/Stats.jsx'
import Reports from './pages/Reports.jsx'
import Accounts from './pages/Accounts.jsx'
import Logs from './pages/Logs.jsx'
import Profile from './pages/Profile.jsx'

function Notice({ title, text }) {
  return (
    <div className="card empty" role="alert">
      <Mascot size={110} mood="think" />
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to="/" className="btn primary">Về Dashboard</Link>
    </div>
  )
}

function Guard({ roles, children }) {
  const { me } = useApp()
  if (roles && !roles.includes(me.role)) {
    return <Notice title="Bạn chưa có quyền vào trang này" text={`Trang này dành cho ${roles.map((r) => ROLES[r]).join(', ')}. Bạn đang đăng nhập với vai trò ${ROLES[me.role]}. Liên hệ giám đốc nếu cần được cấp quyền.`} />
  }
  return children
}

export default function App() {
  const { me, toast, closeToast, dialog, answer } = useApp()
  if (!me) return <Login />
  const lead = ['manager', 'director']
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="okrs" element={<Okrs />} />
          <Route path="okrs/new" element={<OkrForm />} />
          <Route path="okrs/:id/edit" element={<OkrForm />} />
          <Route path="todaylist" element={<Today />} />
          <Route path="todaylist/new" element={<TodayForm />} />
          <Route path="todaylist/:id" element={<TodayForm />} />
          <Route path="checkin" element={<CheckinList />} />
          <Route path="checkin/history" element={<CheckinHistory />} />
          <Route path="checkin/:okrId" element={<CheckinDo />} />
          <Route path="review" element={<Guard roles={lead}><Review /></Guard>} />
          <Route path="cfr" element={<Navigate to="/cfr/conversation" replace />} />
          <Route path="cfr/:tab" element={<Cfr />} />
          <Route path="store" element={<Store />} />
          <Route path="stats" element={<Navigate to="/stats/points" replace />} />
          <Route path="stats/:tab" element={<Stats />} />
          <Route path="reports" element={<Reports />} />
          <Route path="accounts" element={<Guard roles={['director']}><Accounts /></Guard>} />
          <Route path="logs" element={<Guard roles={['director']}><Logs /></Guard>} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Notice title="Không tìm thấy trang" text="Đường dẫn này không tồn tại hoặc đã được chuyển đi. Quay về Dashboard để tiếp tục." />} />
        </Route>
      </Routes>
      {toast && (
        <div className={`toast ${toast.tone === 'danger' ? 'danger' : ''}`} role="status">
          {toast.message}
          {toast.action && <button className="toast-act" onClick={() => { toast.action.run(); closeToast() }}>{toast.action.label}</button>}
        </div>
      )}
      {dialog && (
        <Modal title={dialog.title} onClose={() => answer(false)}>
          {dialog.body && <p className="muted">{dialog.body}</p>}
          {dialog.items && (
            <ul className="confirm-list">
              {dialog.items.slice(0, 5).map((t) => <li key={t}>{t}</li>)}
              {dialog.items.length > 5 && <li className="muted">và {dialog.items.length - 5} mục khác</li>}
            </ul>
          )}
          <div className="modal-foot">
            <button className="btn" onClick={() => answer(false)}>Hủy</button>
            <button className={`btn ${dialog.danger ? 'danger-solid' : 'primary'}`} onClick={() => answer(true)} autoFocus>{dialog.confirmLabel}</button>
          </div>
        </Modal>
      )}
    </>
  )
}
