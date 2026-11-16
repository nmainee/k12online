import { activityLog } from '../data/mock.js'
import { PageHead } from '../components/ui.jsx'

export default function Logs() {
  return (
    <>
      <PageHead title="Nhật ký hoạt động" desc="Lịch sử đăng nhập và thao tác quan trọng để kiểm soát an toàn hệ thống." />
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Thời gian</th><th>Người dùng</th><th>Thao tác</th></tr></thead>
          <tbody>
            {activityLog.map((l) => (
              <tr key={l.id}><td className="tnum">{l.time}</td><td>{l.user}</td><td>{l.action}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
