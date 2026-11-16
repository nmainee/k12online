// Dữ liệu mẫu bám theo các bảng trong tài liệu (Users, Departments, OKRs, TodayList,
// CheckinForm, CheckinReview, Conversation, Feedback, Recognition, Store, Redeem).

export const ROLES = {
  director: 'Giám đốc',
  manager: 'Trưởng phòng',
  staff: 'Nhân viên',
}

export const WEEK = { number: 47, year: 2026, from: '16/11', to: '22/11', month: 'Tháng 11/2026' }

export const departments = [
  { id: 1, name: 'Ban giám đốc' },
  { id: 2, name: 'Phòng Công nghệ' },
  { id: 3, name: 'Phòng Kinh doanh' },
]

export const users = [
  { id: 1, username: 'hung.nv', fullname: 'Nguyễn Văn Hùng', role: 'director', department_id: 1, superior: null, points: 0, email: 'hung.nv@vhv.vn', phone: '0903 111 001', gender: 'Nam', birth: '1982-04-12', active: true },
  { id: 2, username: 'ha.tt', fullname: 'Trần Thu Hà', role: 'manager', department_id: 2, superior: 1, points: 85, email: 'ha.tt@vhv.vn', phone: '0903 111 002', gender: 'Nữ', birth: '1988-09-03', active: true },
  { id: 3, username: 'quan.lm', fullname: 'Lê Minh Quân', role: 'staff', department_id: 2, superior: 2, points: 120, email: 'quan.lm@vhv.vn', phone: '0903 111 003', gender: 'Nam', birth: '1996-01-21', active: true },
  { id: 4, username: 'anh.pn', fullname: 'Phạm Ngọc Anh', role: 'staff', department_id: 2, superior: 2, points: 64, email: 'anh.pn@vhv.vn', phone: '0903 111 004', gender: 'Nữ', birth: '1998-06-30', active: true },
  { id: 5, username: 'tung.vt', fullname: 'Vũ Thanh Tùng', role: 'manager', department_id: 3, superior: 1, points: 92, email: 'tung.vt@vhv.vn', phone: '0903 111 005', gender: 'Nam', birth: '1986-11-15', active: true },
  { id: 6, username: 'yen.dh', fullname: 'Đỗ Hải Yến', role: 'staff', department_id: 3, superior: 5, points: 148, email: 'yen.dh@vhv.vn', phone: '0903 111 006', gender: 'Nữ', birth: '1997-02-08', active: true },
  { id: 7, username: 'long.bt', fullname: 'Bùi Thành Long', role: 'staff', department_id: 3, superior: 5, points: 40, email: 'long.bt@vhv.vn', phone: '0903 111 007', gender: 'Nam', birth: '1999-12-02', active: false },
]

// status: draft | pending | needs_edit | approved
export const okrs = [
  {
    id: 1, level: 'company', owner: 1, department_id: 1, cycle: 'Tháng 11/2026', parent: null, visibility: 'public', status: 'approved',
    objective: 'Đưa nền tảng quản trị hiệu suất OKR vào vận hành toàn công ty',
    krs: [
      { id: 11, text: 'Số nhân viên check-in OKR đúng hạn mỗi tuần', target: 90, current: 71, unit: '%' },
      { id: 12, text: 'Số phòng ban hoàn tất họp OKR hàng tuần', target: 12, current: 9, unit: 'buổi' },
      { id: 13, text: 'Điểm hài lòng của nhân viên với quy trình mới', target: 8, current: 6.8, unit: '/10' },
    ],
  },
  {
    id: 2, level: 'team', owner: 2, department_id: 2, cycle: 'Tuần 47', parent: 1, visibility: 'public', status: 'approved',
    objective: 'Hoàn thiện module Check-in và Dashboard cho bản thử nghiệm',
    krs: [
      { id: 21, text: 'Số màn hình hoàn thành và qua kiểm thử', target: 12, current: 8, unit: 'màn' },
      { id: 22, text: 'Số lỗi mức cao còn tồn đọng', target: 0, current: 3, unit: 'lỗi', lowerIsBetter: true },
    ],
  },
  {
    id: 3, level: 'personal', owner: 3, department_id: 2, cycle: 'Tuần 47', parent: 2, visibility: 'public', status: 'approved',
    objective: 'Hoàn thành giao diện và API cho chức năng Check-in OKR',
    krs: [
      { id: 31, text: 'Số API check-in hoàn thành', target: 6, current: 4, unit: 'API' },
      { id: 32, text: 'Độ phủ kiểm thử đơn vị cho module check-in', target: 80, current: 55, unit: '%' },
    ],
  },
  {
    id: 4, level: 'personal', owner: 4, department_id: 2, cycle: 'Tuần 47', parent: 2, visibility: 'public', status: 'pending',
    objective: 'Xây dựng trang thống kê OKR theo phòng ban',
    krs: [
      { id: 41, text: 'Số biểu đồ thống kê hoàn thành', target: 4, current: 1, unit: 'biểu đồ' },
      { id: 42, text: 'Thời gian tải trang thống kê', target: 3, current: 4.2, unit: 'giây', lowerIsBetter: true },
    ],
  },
  {
    id: 5, level: 'team', owner: 5, department_id: 3, cycle: 'Tuần 47', parent: 1, visibility: 'public', status: 'approved',
    objective: 'Giới thiệu hệ thống OKR cho 5 khách hàng tiềm năng',
    krs: [
      { id: 51, text: 'Số buổi demo đã thực hiện', target: 5, current: 3, unit: 'buổi' },
      { id: 52, text: 'Số khách hàng đồng ý dùng thử', target: 2, current: 1, unit: 'khách' },
    ],
  },
  {
    id: 6, level: 'personal', owner: 6, department_id: 3, cycle: 'Tuần 47', parent: 5, visibility: 'public', status: 'needs_edit',
    objective: 'Chốt lịch demo với nhóm khách hàng khu vực phía Nam',
    krs: [
      { id: 61, text: 'Số cuộc gọi tư vấn đã thực hiện', target: 20, current: 12, unit: 'cuộc' },
      { id: 62, text: 'Số lịch demo đã chốt', target: 3, current: 1, unit: 'lịch' },
    ],
  },
  {
    id: 7, level: 'personal', owner: 3, department_id: 2, cycle: 'Tuần 47', parent: 2, visibility: 'private', status: 'draft',
    objective: 'Học và áp dụng kiến trúc phân lớp cho phần backend',
    krs: [{ id: 71, text: 'Số tài liệu kiến trúc đã đọc và ghi chú', target: 3, current: 0, unit: 'tài liệu' }],
  },
]

// status: todo | doing | review | cancelled | done
export const todos = [
  { id: 1, user_id: 3, okr_id: 3, name: 'Viết API lưu check-in nháp', description: 'Endpoint POST /checkins với trạng thái draft, kiểm tra KR thuộc OKR của người dùng.', status: 'doing', priority: 'high', deadline: '2026-11-16T17:00', estimate: 3, comments: 'Chờ chốt cấu trúc bảng CheckinForm.' },
  { id: 2, user_id: 3, okr_id: 3, name: 'Viết test cho tính % tiến độ', description: '', status: 'todo', priority: 'medium', deadline: '2026-11-17T12:00', estimate: 2, comments: '' },
  { id: 3, user_id: 3, okr_id: 3, name: 'Ghép form check-in với API', description: '', status: 'review', priority: 'high', deadline: '2026-11-16T15:00', estimate: 4, comments: 'Đã gửi chị Hà xem.' },
  { id: 4, user_id: 3, okr_id: 2, name: 'Sửa lỗi hiển thị biểu đồ trên Safari', description: '', status: 'done', priority: 'low', deadline: '2026-11-16T10:00', estimate: 1, comments: '' },
  { id: 5, user_id: 3, okr_id: 3, name: 'Họp đồng bộ tiến độ với nhóm', description: '', status: 'cancelled', priority: 'low', deadline: '2026-11-16T09:00', estimate: 0.5, comments: 'Dời sang thứ Ba.' },
  { id: 6, user_id: 4, okr_id: 4, name: 'Dựng biểu đồ tiến độ theo phòng ban', description: '', status: 'doing', priority: 'high', deadline: '2026-11-16T17:00', estimate: 5, comments: '' },
  { id: 7, user_id: 6, okr_id: 6, name: 'Gọi nhóm khách hàng Cần Thơ', description: '', status: 'todo', priority: 'medium', deadline: '2026-11-16T16:00', estimate: 2, comments: '' },
  { id: 8, user_id: 2, okr_id: 2, name: 'Duyệt OKR tuần của nhóm', description: '', status: 'doing', priority: 'high', deadline: '2026-11-16T11:00', estimate: 1, comments: '' },
]

// status: not_checked | draft | waiting | checked
export const checkins = [
  { id: 1, okr_id: 3, user_id: 3, date: '2026-11-14', percent: 62, confidence: 3, status: 'draft', summary: 'Đã xong 4/6 API, form check-in hiển thị đúng dữ liệu.', slow: 'Test đơn vị cho module tính % chưa viết.', obstacles: 'Cấu trúc bảng CheckinForm đổi hai lần trong tuần.', solutions: 'Chốt lược đồ với chị Hà vào sáng thứ Hai.' },
  { id: 2, okr_id: 3, user_id: 3, date: '2026-11-09', percent: 100, confidence: 3, status: 'checked', summary: 'Hoàn thành 3/3 API đăng nhập và hồ sơ.', slow: '', obstacles: 'Không có.', solutions: '' },
  { id: 3, okr_id: 4, user_id: 4, date: '2026-11-15', percent: 38, confidence: 2, status: 'waiting', summary: 'Mới xong 1/4 biểu đồ, trang tải chậm 4,2 giây.', slow: 'Truy vấn tổng hợp theo phòng ban.', obstacles: 'Dữ liệu mẫu quá ít để đo hiệu năng.', solutions: 'Sinh thêm 10.000 bản ghi để thử.' },
  { id: 4, okr_id: 6, user_id: 6, date: '2026-11-15', percent: 48, confidence: 2, status: 'draft', summary: '12/20 cuộc gọi, chốt được 1 lịch demo.', slow: '', obstacles: 'Khách hàng phía Nam khó sắp xếp lịch.', solutions: 'Đề xuất demo online.' },
]

export const reviews = [
  { id: 1, checkin_id: 2, okr_id: 3, reviewer: 2, score: 9, team_comment: 'Đúng hạn, API chạy ổn định.', personal_comment: 'Quân chủ động báo sớm khi đổi lược đồ.', summary: 'Hoàn thành tốt' },
]

export const conversations = [
  { id: 1, manager: 2, participant: 3, week: 46, topic: 'Tổng kết tuần 46', content: 'Hoàn thành API đăng nhập và hồ sơ. Cần thêm test cho phần phân quyền.', action: 'Quân viết test phân quyền trước thứ Tư.', trust: 5, date: '2026-11-09' },
  { id: 2, manager: 5, participant: 6, week: 46, topic: 'Kế hoạch demo khu vực phía Nam', content: 'Còn 2 khách hàng chưa trả lời. Thống nhất dùng demo online.', action: 'Yến gửi lịch cho cả 5 khách trong ngày.', trust: 4, date: '2026-11-09' },
]

// type: praise | improve
export const feedbacks = [
  { id: 1, sender: 2, receiver: 3, week: 46, type: 'praise', content: 'Báo cáo check-in rõ ràng, có số liệu và giải pháp cụ thể.', evidence: 'Check-in tuần 46', impact: 'Cao', points: 5, date: '2026-11-10' },
  { id: 2, sender: 3, receiver: 4, week: 46, type: 'improve', content: 'Nên ghi lại nguồn dữ liệu của biểu đồ để người sau kiểm tra lại được.', evidence: 'Trang thống kê OKR', impact: 'Trung bình', points: 2, date: '2026-11-11' },
  { id: 3, sender: 6, receiver: 5, week: 46, type: 'praise', content: 'Anh chốt nhanh hướng demo online, nhóm đỡ mất thời gian chờ.', evidence: 'Buổi họp tuần 46', impact: 'Cao', points: 5, date: '2026-11-10' },
]

export const recognitions = [
  { id: 1, sender: 2, receiver: 3, week: 46, reason: 'Hoàn thành sớm API đăng nhập và tự rà soát bảo mật mật khẩu.', evidence: 'Pull request #128', points: 20, date: '2026-11-10' },
  { id: 2, sender: 5, receiver: 6, week: 46, reason: 'Vượt chỉ tiêu cuộc gọi tư vấn tuần 46 (24/20).', evidence: 'Báo cáo cuộc gọi', points: 25, date: '2026-11-10' },
]

export const gifts = [
  { id: 1, name: 'Voucher cà phê 100.000đ', points: 30, stock: 24, description: 'Dùng tại chuỗi cà phê đối tác của công ty.' },
  { id: 2, name: 'Bình giữ nhiệt VHV', points: 60, stock: 12, description: 'Bình inox 500 ml, khắc logo công ty.' },
  { id: 3, name: 'Nửa ngày nghỉ có lương', points: 120, stock: 5, description: 'Đăng ký trước 2 ngày với trưởng phòng.' },
  { id: 4, name: 'Sách OKR – Measure What Matters', points: 80, stock: 9, description: 'Bản tiếng Việt, nhà xuất bản Tổng hợp TP.HCM.' },
  { id: 5, name: 'Tai nghe không dây', points: 200, stock: 0, description: 'Hết hàng. Dự kiến nhập thêm cuối tháng.' },
  { id: 6, name: 'Bữa trưa cùng giám đốc', points: 150, stock: 3, description: 'Bữa trưa nhóm tối đa 4 người.' },
]

export const redeems = [
  { id: 1, user_id: 3, gift_id: 1, quantity: 1, points: 30, date: '2026-11-03' },
  { id: 2, user_id: 6, gift_id: 4, quantity: 1, points: 80, date: '2026-11-05' },
]

export const weeklyTrend = [
  { week: 'T42', value: 48 },
  { week: 'T43', value: 55 },
  { week: 'T44', value: 52 },
  { week: 'T45', value: 63 },
  { week: 'T46', value: 68 },
  { week: 'T47', value: 61 },
]

export const activityLog = [
  { id: 1, time: '16/11 08:12', user: 'Lê Minh Quân', action: 'Đăng nhập hệ thống' },
  { id: 2, time: '16/11 08:20', user: 'Trần Thu Hà', action: 'Duyệt OKR tuần 47 của nhóm Công nghệ' },
  { id: 3, time: '15/11 17:40', user: 'Đỗ Hải Yến', action: 'Lưu check-in nháp cho OKR #6' },
  { id: 4, time: '15/11 16:05', user: 'Phạm Ngọc Anh', action: 'Gửi check-in chờ phản hồi cho OKR #4' },
]

export const statusMap = {
  okr: {
    draft: { label: 'Đã nháp', tone: 'neutral' },
    pending: { label: 'Chờ duyệt', tone: 'warn' },
    needs_edit: { label: 'Cần chỉnh sửa', tone: 'danger' },
    approved: { label: 'Đã duyệt', tone: 'ok' },
  },
  todo: {
    todo: { label: 'Chưa xử lý', tone: 'neutral' },
    doing: { label: 'Đang thực hiện', tone: 'info' },
    review: { label: 'Đang xem xét', tone: 'warn' },
    cancelled: { label: 'Hủy TodayList', tone: 'muted' },
    done: { label: 'Hoàn thành', tone: 'ok' },
  },
  checkin: {
    not_checked: { label: 'Chưa check-in', tone: 'muted' },
    draft: { label: 'Đã nháp', tone: 'neutral' },
    waiting: { label: 'Chờ phản hồi', tone: 'warn' },
    checked: { label: 'Đã duyệt', tone: 'ok' },
  },
}

export const levelLabel = { company: 'Công ty', team: 'Nhóm', personal: 'Cá nhân' }
export const priorityLabel = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' }
